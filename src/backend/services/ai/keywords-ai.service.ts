import { getMistralModel } from "./base-ai.service";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

/**
 * Service for keyword-related AI functionalities
 */

const QUERY_IDEAS_TEMPLATE = `
Tu es un expert en stratégie de recherche. À partir des mots-clés suivants, génère 5 idées de requêtes sous forme de phrases naturelles que des utilisateurs pourraient taper dans un moteur de recherche.

Mots-clés: {keywords}
Intention: {intent}

Format de réponse: Une liste simple, une phrase par ligne.
`;

const KEYWORD_STRATEGY_TEMPLATE = `
Tu es un expert en SEO et stratégie de contenu AI. Ton but est d'aider les utilisateurs à générer des prompts de haute qualité pour les LLM en fonction de leur stratégie de mots-clés et de l'intention de recherche.

Génère un prompt AI de haute qualité pour une stratégie de contenu avec les détails suivants :
- Mots-clés cibles : {keywords}
- Intention/Stratégie de recherche : {intent}

Le prompt doit être conçu pour aider une IA à rédiger du contenu qui se classe pour ces mots-clés et satisfait l'intention spécifique.
`;

export async function generateQueryIdeas(keywords: string, intent: string) {
  const model = getMistralModel();
  const prompt = PromptTemplate.fromTemplate(QUERY_IDEAS_TEMPLATE);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({ keywords, intent });
  return result.split('\n').filter(line => line.trim() !== "");
}

export async function generateKeywordPrompt(keywords: string, intent: string) {
  const model = getMistralModel();
  const prompt = PromptTemplate.fromTemplate(KEYWORD_STRATEGY_TEMPLATE);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const suggestion = await chain.invoke({ keywords, intent });
  return {
    suggestion,
  };
}

