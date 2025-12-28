/**
 * AI Monitoring Layout
 *
 * Provides consistent layout structure for AI Monitoring routes
 * Inherits auth validation from parent [projectId] layout
 */

interface AIMonitoringLayoutProps {
  children: React.ReactNode;
}

export default function AIMonitoringLayout({
  children,
}: AIMonitoringLayoutProps) {
  return children;
}


