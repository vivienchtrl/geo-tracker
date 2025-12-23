import { getMistralModel } from "./base-ai.service";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Service for SEO-related AI functionalities (Metadata, Content Analysis)
 */

const SEO_OPTIMIZER_TEMPLATE = `
Tu es un expert en marketing et SEO. Voici le contenu textuel extrait d'une page web :
---
{scrapedContent}
---
En te basant uniquement sur ce contenu, génère :
1. Un titre commercial accrocheur pour le projet (ex: le nom de la marque ou du service principal).
2. Une description COMPLÈTE et détaillée du business, de ses services et de ses offres (environ 200-300 caractères). Ne fais pas une simple méta-description, mais un résumé informatif de ce qu'ils font.
3. Une liste de 5 à 8 mots-clés ou expressions courtes pertinents pour ce business.

Réponds STRICTEMENT au format JSON suivant sans aucun autre texte avant ou après :
{{
  "title": "nom du business",
  "description": "description détaillée des services et offres",
  "suggestedKeywords": ["keyword1", "keyword2", "keyword3", ...]
}}
`;

export async function generateSiteMetadata(scrapedContent: string) {
  const model = getMistralModel("mistral-small"); // Use a slightly better model for JSON if possible
  const prompt = PromptTemplate.fromTemplate(SEO_OPTIMIZER_TEMPLATE);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  
  const response = await chain.invoke({ scrapedContent });
  
  try {
    // Attempt to parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing SEO metadata JSON:", error);
    return {
      title: "Error generating title",
      description: "Error generating description"
    };
  }
}
