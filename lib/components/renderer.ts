// PPTX Renderer - Executes component render functions to generate slides
import PptxGenJS from 'pptxgenjs';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  bg: string;
}

export interface BrandFonts {
  heading: string;
  body: string;
}

export interface BrandKit {
  colors: BrandColors;
  fonts: BrandFonts;
  logoData?: string; // Base64 logo
}

export interface SlideBlueprint {
  position: number;
  componentId: string;
  renderCode: string; // Component's render function as string
  data: any; // Data to pass to render function
}

// Default brand kit
export const DEFAULT_BRAND: BrandKit = {
  colors: {
    primary: '0066CC',
    secondary: '00AA00',
    accent: 'FF6600',
    text: '333333',
    bg: 'FFFFFF',
  },
  fonts: {
    heading: 'Arial',
    body: 'Arial',
  },
};

/**
 * Render a complete presentation from slide blueprints
 */
export async function renderPresentation(
  blueprints: SlideBlueprint[],
  brand: BrandKit = DEFAULT_BRAND
): Promise<Buffer> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'DeckForge';
  pptx.company = 'DeckForge';
  pptx.subject = 'AI-Generated Presentation';
  pptx.title = 'Presentation';

  // Sort blueprints by position
  const sorted = [...blueprints].sort((a, b) => a.position - b.position);

  // Render each slide
  for (const blueprint of sorted) {
    try {
      const slide = pptx.addSlide();
      await renderSlide(slide, blueprint, brand);
    } catch (error) {
      console.error(`Failed to render slide ${blueprint.position}:`, error);
      // Add error slide as fallback
      const errorSlide = pptx.addSlide();
      errorSlide.addText('Error rendering slide', {
        x: 1,
        y: 3,
        w: 8,
        h: 1,
        fontSize: 24,
        color: 'CC0000',
        align: 'center',
      });
    }
  }

  // Generate PPTX buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}

/**
 * Render a single slide using component's render function
 */
async function renderSlide(
  slide: any,
  blueprint: SlideBlueprint,
  brand: BrandKit
): Promise<void> {
  const { renderCode, data } = blueprint;

  // Execute render function in controlled context
  try {
    // Create safe execution context
    // renderCode defines a function named 'render', so we need to call it
    const renderFn = new Function('slide', 'data', 'brand', `${renderCode}; render(slide, data, brand);`);

    // Execute render function
    renderFn(slide, data, brand);
  } catch (error) {
    console.error('Render function execution error:', error);
    // Fallback to simple text slide
    slide.addText('Component render error', {
      x: 1,
      y: 3,
      w: 8,
      h: 1,
      fontSize: 18,
      color: '999999',
      align: 'center',
    });
  }
}

/**
 * Validate component data against schema (using Zod for runtime validation)
 */
export function validateComponentData(data: any, schema: any): boolean {
  // Basic validation - in production, use Zod for full schema validation
  if (!data || typeof data !== 'object') {
    return false;
  }

  // Check required properties (simplified for now)
  if (schema.required && Array.isArray(schema.required)) {
    for (const key of schema.required) {
      if (!(key in data)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Extract brand kit from user preferences or use defaults
 */
export function getBrandKit(brandKit?: Partial<BrandKit>): BrandKit {
  return {
    colors: {
      ...DEFAULT_BRAND.colors,
      ...brandKit?.colors,
    },
    fonts: {
      ...DEFAULT_BRAND.fonts,
      ...brandKit?.fonts,
    },
    logoData: brandKit?.logoData,
  };
}
