// AI Component Mapper - Maps parsed content to components
import Anthropic from '@anthropic-ai/sdk';
import type { ParsedContent, GenerationParameters } from './parser';
import type { SlideBlueprint } from '../components/renderer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface ComponentInfo {
  id: string;
  name: string;
  category: string;
  tags: string[];
  useCases: string[];
  bestFor: string;
  dataSchema: any;
}

export interface MappingResult {
  slideBlueprints: SlideBlueprint[];
  reasoning?: string;
}

/**
 * Map parsed content to component blueprints
 */
export async function mapContentToComponents(
  parsedContent: ParsedContent,
  availableComponents: ComponentInfo[],
  parameters: GenerationParameters = {}
): Promise<MappingResult> {
  const { tone = 'formal', slideCount = 10, style = 'data-driven' } = parameters;

  // Build component library description for Claude
  const componentLibrary = availableComponents
    .map(
      (c) =>
        `- ${c.name} (${c.category}): ${c.bestFor}. Use cases: ${c.useCases.join(', ')}. Schema: ${JSON.stringify(c.dataSchema)}`
    )
    .join('\n');

  const systemPrompt = `You are a presentation architect. Create a slide blueprint by mapping content to components.

Available components:
${componentLibrary}

Guidelines:
- Start with a strong cover (use Stats Cover if data available, otherwise Minimal Cover)
- Vary component types (don't repeat same component >2x in row)
- Respect slideCount target: ${slideCount} slides (±20% acceptable)
- Match tone: ${tone}, style: ${style}
- Prioritize high-priority sections
- End with clear next steps or closing slide
- For each slide, provide exact data matching component's schema

Return ONLY valid JSON array of slide blueprints:
[
  {
    "position": 0,
    "componentId": "component-uuid-here",
    "data": {... exact data matching component schema ...},
    "reasoning": "Why this component fits"
  }
]`;

  const userPrompt = `Content to map:
${JSON.stringify(parsedContent, null, 2)}

Create slide blueprints for a ${slideCount}-slide presentation.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const blueprints = JSON.parse(content.text);

    // Fetch full render code for each component
    const enrichedBlueprints: SlideBlueprint[] = await Promise.all(
      blueprints.map(async (bp: any) => {
        const component = availableComponents.find((c) => c.id === bp.componentId);
        if (!component) {
          throw new Error(`Component ${bp.componentId} not found`);
        }

        return {
          position: bp.position,
          componentId: bp.componentId,
          renderCode: '', // Will be filled by API route from database
          data: bp.data,
        };
      })
    );

    return {
      slideBlueprints: enrichedBlueprints,
    };
  } catch (error) {
    console.error('Component mapping failed:', error);

    // Fallback: create simple blueprint
    const coverComponent = availableComponents.find((c) => c.name === 'Minimal Cover');
    const narrativeComponent = availableComponents.find(
      (c) => c.name === 'Full Text Narrative'
    );

    if (!coverComponent || !narrativeComponent) {
      throw new Error('Required fallback components not found');
    }

    return {
      slideBlueprints: [
        {
          position: 0,
          componentId: coverComponent.id,
          renderCode: '',
          data: {
            title: parsedContent.title,
            subtitle: 'AI-Generated Presentation',
          },
        },
        ...parsedContent.sections.map((section, i) => ({
          position: i + 1,
          componentId: narrativeComponent.id,
          renderCode: '',
          data: {
            title: section.title,
            content: section.content,
            bullets: section.items || [],
          },
        })),
      ],
    };
  }
}

/**
 * Simple mapping without AI (rule-based fallback)
 */
export function mapContentSimple(
  parsedContent: ParsedContent,
  availableComponents: ComponentInfo[]
): MappingResult {
  const blueprints: SlideBlueprint[] = [];

  // Add cover
  const cover = availableComponents.find((c) => c.name === 'Minimal Cover');
  if (cover) {
    blueprints.push({
      position: 0,
      componentId: cover.id,
      renderCode: '',
      data: {
        title: parsedContent.title,
        subtitle: 'Presentation',
      },
    });
  }

  // Add sections
  parsedContent.sections.forEach((section, i) => {
    let component = availableComponents.find((c) => c.category === section.type.toUpperCase());

    if (!component) {
      component = availableComponents.find((c) => c.name === 'Full Text Narrative');
    }

    if (component) {
      blueprints.push({
        position: i + 1,
        componentId: component.id,
        renderCode: '',
        data: {
          title: section.title,
          content: section.content,
          items: section.items || [],
        },
      });
    }
  });

  // Add closing
  const closing = availableComponents.find((c) => c.name === 'Thank You Slide');
  if (closing) {
    blueprints.push({
      position: blueprints.length,
      componentId: closing.id,
      renderCode: '',
      data: {
        message: 'Thank You',
      },
    });
  }

  return { slideBlueprints: blueprints };
}
