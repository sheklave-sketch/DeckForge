// AI Content Parser - Extracts structured content from raw input using Claude
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ParsedSection {
  title: string;
  type: 'data' | 'narrative' | 'framework' | 'timeline' | 'comparison' | 'process';
  content: string;
  dataPoints?: Array<{
    label: string;
    value: string;
    change?: string;
    target?: string;
  }>;
  items?: string[];
  priority: number; // 1-5, higher = more important
}

export interface ParsedContent {
  title: string;
  sections: ParsedSection[];
}

export interface GenerationParameters {
  tone?: 'formal' | 'conversational' | 'technical' | 'executive';
  audience?: 'c-suite' | 'team' | 'investors' | 'clients' | 'general';
  style?: 'data-driven' | 'narrative' | 'visual-heavy' | 'minimal';
  slideCount?: number;
  focus?: string[];
}

/**
 * Parse raw content into structured sections
 */
export async function parseContent(
  rawContent: string,
  parameters: GenerationParameters = {}
): Promise<ParsedContent> {
  const {
    tone = 'formal',
    audience = 'general',
    style = 'data-driven',
    slideCount = 10,
    focus = [],
  } = parameters;

  const systemPrompt = `You are a strategy consultant expert at analyzing content for presentations.

Parse the provided content into structured sections suitable for a presentation.

CRITICAL REQUIREMENTS:
- Target: ${Math.ceil(slideCount * 0.7)}-${slideCount} sections total
- Each section becomes ONE slide
- Break content into GRANULAR, focused sections
- Even short content should be expanded into multiple angles/perspectives

Guidelines:
- Separate different topics, themes, or concepts into distinct sections
- For data/metrics: create dedicated sections per insight
- For narratives: break into intro, body, conclusion sections
- For frameworks: separate into model overview + individual components
- Extract and highlight data points (metrics, KPIs, financials)
- Classify each section type: data, narrative, framework, timeline, comparison, or process
- Assign priority (1-5) based on importance
- Consider tone: ${tone}, audience: ${audience}, style: ${style}
- Add context and expand brief points into full sections with "content" field populated
${focus.length > 0 ? `- Focus on: ${focus.join(', ')}` : ''}

IMPORTANT: Fill the "content" field with detailed text for each section (not empty).

Return ONLY valid JSON with this exact structure:
{
  "title": "Presentation title",
  "sections": [
    {
      "title": "Section name",
      "type": "data|narrative|framework|timeline|comparison|process",
      "content": "Detailed text summary - MUST be populated",
      "dataPoints": [{"label": "Metric name", "value": "Value", "change": "±X%"}],
      "items": ["List item 1", "List item 2"],
      "priority": 1-5
    }
  ]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: rawContent,
        },
      ],
    });

    // Extract JSON from response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const parsed = JSON.parse(content.text);
    return parsed as ParsedContent;
  } catch (error) {
    console.error('Content parsing failed:', error);

    // Fallback: create basic structure from raw content
    return {
      title: 'Presentation',
      sections: [
        {
          title: 'Overview',
          type: 'narrative',
          content: rawContent.substring(0, 500),
          priority: 3,
        },
      ],
    };
  }
}

/**
 * Parse uploaded document (PDF/DOCX) - extract text first
 */
export async function parseDocument(
  fileBuffer: Buffer,
  mimeType: string,
  parameters: GenerationParameters = {}
): Promise<ParsedContent> {
  // TODO: Implement PDF/DOCX text extraction
  // For now, throw error - will implement in phase 2
  throw new Error('Document parsing not yet implemented. Use text input for now.');
}
