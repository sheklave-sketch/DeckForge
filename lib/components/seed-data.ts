// DeckForge V2 - Seed Component Library
// 30 hand-coded core components for consulting presentations

export interface SeedComponent {
  name: string;
  description: string;
  category: 'TITLE' | 'DATA' | 'PROCESS' | 'FRAMEWORK' | 'COMPARISON' | 'NARRATIVE' | 'CLOSING' | 'VISUAL' | 'TABLE';
  tags: string[];
  renderCode: string; // PptxGenJS render function as string
  dataSchema: object; // JSON Schema for validation
  source: 'CORE';
  isPublic: true;
  useCases: string[];
  bestFor: string;
}

export const SEED_COMPONENTS: SeedComponent[] = [
  // ==================== TITLE COMPONENTS (5) ====================
  {
    name: 'Stats Cover',
    description: 'Cover slide with title, subtitle, and 3-4 key metrics displayed in circles',
    category: 'TITLE',
    tags: ['cover', 'stats', 'metrics', 'title', 'opening'],
    useCases: ['presentation opening', 'executive summary', 'quarterly review', 'performance report'],
    bestFor: 'Data-driven presentations that want to lead with key numbers',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'stats'],
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        stats: {
          type: 'array',
          minItems: 2,
          maxItems: 4,
          items: {
            type: 'object',
            required: ['label', 'value'],
            properties: {
              label: { type: 'string' },
              value: { type: 'string' },
            },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, subtitle = '', stats = [] } = data;

  // Title
  slide.addText(title, {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontSize: 44, bold: true, color: brand.colors.text,
    fontFace: brand.fonts.heading, align: 'center'
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 2.6, w: 9, h: 0.5,
      fontSize: 18, color: brand.colors.text,
      fontFace: brand.fonts.body, align: 'center'
    });
  }

  // Stats in circles
  const startX = (10 - (stats.length * 2.2)) / 2;
  stats.forEach((stat, i) => {
    const x = startX + (i * 2.4);
    const y = 4;

    // Circle background
    slide.addShape('ellipse', {
      x, y, w: 2, h: 2,
      fill: { color: brand.colors.primary, transparency: 10 }
    });

    // Value
    slide.addText(stat.value, {
      x, y: y + 0.5, w: 2, h: 0.6,
      fontSize: 32, bold: true, color: brand.colors.primary,
      align: 'center'
    });

    // Label
    slide.addText(stat.label, {
      x, y: y + 1.2, w: 2, h: 0.4,
      fontSize: 12, color: brand.colors.text,
      align: 'center'
    });
  });
}
`.trim(),
  },

  {
    name: 'Minimal Cover',
    description: 'Clean cover slide with title, subtitle, and optional logo',
    category: 'TITLE',
    tags: ['cover', 'minimal', 'clean', 'simple', 'title'],
    useCases: ['any presentation', 'client proposals', 'reports', 'general opening'],
    bestFor: 'Professional presentations that prioritize clarity and elegance',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        author: { type: 'string' },
        date: { type: 'string' },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, subtitle = '', author = '', date = '' } = data;

  // Title
  slide.addText(title, {
    x: 0.5, y: 2.5, w: 9, h: 1.2,
    fontSize: 48, bold: true, color: brand.colors.text,
    fontFace: brand.fonts.heading, align: 'center'
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 3.8, w: 9, h: 0.6,
      fontSize: 20, color: brand.colors.text,
      fontFace: brand.fonts.body, align: 'center'
    });
  }

  // Footer
  if (author || date) {
    const footer = [author, date].filter(Boolean).join(' • ');
    slide.addText(footer, {
      x: 0.5, y: 6.8, w: 9, h: 0.3,
      fontSize: 12, color: brand.colors.text,
      align: 'center'
    });
  }

  // Accent line
  slide.addShape('rect', {
    x: 3.5, y: 4.6, w: 3, h: 0.05,
    fill: { color: brand.colors.primary }
  });
}
`.trim(),
  },

  {
    name: 'Impact Cover',
    description: 'Bold cover with large impactful number and supporting text',
    category: 'TITLE',
    tags: ['cover', 'impact', 'bold', 'number', 'hero'],
    useCases: ['results presentations', 'achievement highlights', 'milestone announcements'],
    bestFor: 'Presentations focused on a single powerful metric or achievement',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['number', 'context'],
      properties: {
        number: { type: 'string' },
        context: { type: 'string' },
        subtitle: { type: 'string' },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { number, context, subtitle = '' } = data;

  // Large number
  slide.addText(number, {
    x: 0.5, y: 1.8, w: 9, h: 1.8,
    fontSize: 96, bold: true, color: brand.colors.primary,
    fontFace: brand.fonts.heading, align: 'center'
  });

  // Context
  slide.addText(context, {
    x: 0.5, y: 3.8, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: brand.colors.text,
    fontFace: brand.fonts.heading, align: 'center'
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 4.8, w: 9, h: 0.5,
      fontSize: 16, color: brand.colors.text,
      align: 'center'
    });
  }
}
`.trim(),
  },

  {
    name: 'Section Divider',
    description: 'Full-bleed section divider with section name and number',
    category: 'TITLE',
    tags: ['section', 'divider', 'separator', 'chapter'],
    useCases: ['section breaks', 'agenda transitions', 'chapter divisions'],
    bestFor: 'Long presentations that need clear section demarcation',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['sectionName'],
      properties: {
        sectionNumber: { type: 'string' },
        sectionName: { type: 'string' },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { sectionNumber = '', sectionName } = data;

  // Background
  slide.background = { color: brand.colors.primary };

  // Section number
  if (sectionNumber) {
    slide.addText(sectionNumber, {
      x: 0.5, y: 2, w: 9, h: 0.8,
      fontSize: 48, bold: true, color: 'FFFFFF',
      fontFace: brand.fonts.heading, align: 'center',
      transparency: 50
    });
  }

  // Section name
  slide.addText(sectionName, {
    x: 0.5, y: 3, w: 9, h: 1.2,
    fontSize: 44, bold: true, color: 'FFFFFF',
    fontFace: brand.fonts.heading, align: 'center'
  });
}
`.trim(),
  },

  {
    name: 'Table of Contents',
    description: 'Numbered agenda with section names',
    category: 'TITLE',
    tags: ['agenda', 'toc', 'outline', 'contents', 'overview'],
    useCases: ['presentation overview', 'agenda', 'roadmap', 'structure'],
    bestFor: 'Presentations that need to set expectations upfront',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'items'],
      properties: {
        title: { type: 'string' },
        items: {
          type: 'array',
          minItems: 2,
          items: { type: 'string' },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title = 'Agenda', items = [] } = data;

  // Title
  slide.addText(title, {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 32, bold: true, color: brand.colors.text,
    fontFace: brand.fonts.heading
  });

  // Items
  const startY = 1.5;
  const itemHeight = Math.min(0.8, (5.5 / items.length));

  items.forEach((item, i) => {
    const y = startY + (i * itemHeight);

    // Number
    slide.addText(\`\${i + 1}.\`, {
      x: 1, y, w: 0.5, h: itemHeight - 0.1,
      fontSize: 20, bold: true, color: brand.colors.primary,
      valign: 'middle'
    });

    // Item text
    slide.addText(item, {
      x: 1.8, y, w: 7.5, h: itemHeight - 0.1,
      fontSize: 18, color: brand.colors.text,
      fontFace: brand.fonts.body, valign: 'middle'
    });
  });
}
`.trim(),
  },

  // ==================== DATA COMPONENTS (8) ====================
  {
    name: 'KPI Dashboard',
    description: 'Grid of KPIs with values, labels, and trend indicators',
    category: 'DATA',
    tags: ['kpi', 'metrics', 'dashboard', 'grid', 'performance'],
    useCases: ['performance dashboards', 'metric summaries', 'status updates'],
    bestFor: 'Presenting multiple related metrics at a glance',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'kpis'],
      properties: {
        title: { type: 'string' },
        kpis: {
          type: 'array',
          minItems: 2,
          maxItems: 9,
          items: {
            type: 'object',
            required: ['label', 'value'],
            properties: {
              label: { type: 'string' },
              value: { type: 'string' },
              trend: { type: 'number' }, // positive or negative percentage
            },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, kpis = [] } = data;

  // Title
  slide.addText(title, {
    x: 0.5, y: 0.4, w: 9, h: 0.6,
    fontSize: 28, bold: true, color: brand.colors.text,
    fontFace: brand.fonts.heading
  });

  // Grid layout (3 columns max)
  const cols = Math.min(3, Math.ceil(Math.sqrt(kpis.length)));
  const rows = Math.ceil(kpis.length / cols);
  const cardW = 2.8;
  const cardH = 1.8;
  const gap = 0.4;
  const startX = (10 - (cols * cardW + (cols - 1) * gap)) / 2;
  const startY = 1.5;

  kpis.forEach((kpi, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gap);
    const y = startY + row * (cardH + gap);

    // Card background
    slide.addShape('rect', {
      x, y, w: cardW, h: cardH,
      fill: { color: 'F5F5F5' }
    });

    // Value
    slide.addText(kpi.value, {
      x, y: y + 0.4, w: cardW, h: 0.6,
      fontSize: 36, bold: true, color: brand.colors.primary,
      align: 'center'
    });

    // Label
    slide.addText(kpi.label, {
      x, y: y + 1.1, w: cardW, h: 0.5,
      fontSize: 12, color: brand.colors.text,
      align: 'center'
    });

    // Trend indicator
    if (kpi.trend !== undefined) {
      const trendColor = kpi.trend >= 0 ? '00AA00' : 'CC0000';
      const trendSymbol = kpi.trend >= 0 ? '▲' : '▼';
      slide.addText(\`\${trendSymbol} \${Math.abs(kpi.trend)}%\`, {
        x, y: y + cardH - 0.4, w: cardW, h: 0.3,
        fontSize: 10, color: trendColor, bold: true,
        align: 'center'
      });
    }
  });
}
`.trim(),
  },

  {
    name: 'Hero Metric',
    description: 'Single giant metric with context and comparison',
    category: 'DATA',
    tags: ['metric', 'hero', 'single', 'highlight', 'focus'],
    useCases: ['key performance indicator', 'goal achievement', 'primary metric highlight'],
    bestFor: 'Emphasizing one critical number that deserves full attention',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['value', 'label'],
      properties: {
        value: { type: 'string' },
        label: { type: 'string' },
        comparison: { type: 'string' }, // e.g., "+35% vs last year"
        context: { type: 'string' },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { value, label, comparison = '', context = '' } = data;

  // Hero value
  slide.addText(value, {
    x: 0.5, y: 2, w: 9, h: 1.5,
    fontSize: 80, bold: true, color: brand.colors.primary,
    fontFace: brand.fonts.heading, align: 'center'
  });

  // Label
  slide.addText(label, {
    x: 0.5, y: 3.6, w: 9, h: 0.6,
    fontSize: 24, color: brand.colors.text,
    fontFace: brand.fonts.body, align: 'center'
  });

  // Comparison
  if (comparison) {
    const isPositive = comparison.includes('+');
    slide.addText(comparison, {
      x: 0.5, y: 4.4, w: 9, h: 0.5,
      fontSize: 18, bold: true,
      color: isPositive ? '00AA00' : brand.colors.text,
      align: 'center'
    });
  }

  // Context
  if (context) {
    slide.addText(context, {
      x: 1.5, y: 5.5, w: 7, h: 0.8,
      fontSize: 14, color: brand.colors.text,
      align: 'center'
    });
  }
}
`.trim(),
  },

  {
    name: 'Comparison Bars',
    description: 'Horizontal bar chart comparing multiple values',
    category: 'DATA',
    tags: ['comparison', 'bars', 'chart', 'horizontal'],
    useCases: ['comparing metrics', 'benchmarking', 'performance comparison'],
    bestFor: 'Comparing 3-8 related values side by side',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'items'],
      properties: {
        title: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['label', 'value'],
            properties: { label: { type: 'string' }, value: { type: 'number' } },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, items = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading });
  const maxVal = Math.max(...items.map(i => i.value));
  const barH = 0.5;
  const gap = 0.3;
  const startY = 1.5;
  items.forEach((item, i) => {
    const y = startY + i * (barH + gap);
    const barW = (item.value / maxVal) * 6;
    slide.addText(item.label, { x: 0.5, y, w: 2.5, h: barH, fontSize: 14, color: brand.colors.text, valign: 'middle' });
    slide.addShape('rect', { x: 3.2, y, w: barW, h: barH, fill: { color: brand.colors.primary } });
    slide.addText(String(item.value), { x: 3.2 + barW + 0.1, y, w: 1, h: barH, fontSize: 14, bold: true, color: brand.colors.text, valign: 'middle' });
  });
}
`.trim(),
  },

  // PROCESS COMPONENTS (3 key ones)
  {
    name: 'Timeline Horizontal',
    description: 'Left-to-right timeline with milestones',
    category: 'PROCESS',
    tags: ['timeline', 'roadmap', 'milestones', 'horizontal'],
    useCases: ['project timelines', 'roadmaps', 'historical events'],
    bestFor: 'Showing chronological progression or future planning',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'milestones'],
      properties: {
        title: { type: 'string' },
        milestones: {
          type: 'array',
          items: {
            type: 'object',
            required: ['date', 'event'],
            properties: { date: { type: 'string' }, event: { type: 'string' } },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, milestones = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading });
  const lineY = 3.5;
  slide.addShape('line', { x: 1, y: lineY, w: 8, h: 0, line: { color: brand.colors.primary, width: 3 } });
  const spacing = 8 / (milestones.length - 1 || 1);
  milestones.forEach((m, i) => {
    const x = 1 + i * spacing;
    slide.addShape('ellipse', { x: x - 0.15, y: lineY - 0.15, w: 0.3, h: 0.3, fill: { color: brand.colors.primary } });
    slide.addText(m.date, { x: x - 0.6, y: lineY - 0.8, w: 1.2, h: 0.4, fontSize: 12, bold: true, color: brand.colors.text, align: 'center' });
    slide.addText(m.event, { x: x - 0.8, y: lineY + 0.4, w: 1.6, h: 0.6, fontSize: 11, color: brand.colors.text, align: 'center' });
  });
}
`.trim(),
  },

  {
    name: 'Process Flow',
    description: 'Arrows connecting sequential steps',
    category: 'PROCESS',
    tags: ['process', 'flow', 'steps', 'arrows'],
    useCases: ['workflows', 'procedures', 'step-by-step guides'],
    bestFor: 'Explaining sequential processes or workflows',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'steps'],
      properties: {
        title: { type: 'string' },
        steps: { type: 'array', items: { type: 'string' } },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, steps = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading });
  const boxW = 1.8;
  const boxH = 1.2;
  const gap = 0.3;
  const totalW = steps.length * boxW + (steps.length - 1) * gap;
  const startX = (10 - totalW) / 2;
  const y = 2.5;
  steps.forEach((step, i) => {
    const x = startX + i * (boxW + gap);
    slide.addShape('rect', { x, y, w: boxW, h: boxH, fill: { color: brand.colors.primary } });
    slide.addText(step, { x, y, w: boxW, h: boxH, fontSize: 12, color: 'FFFFFF', bold: true, align: 'center', valign: 'middle' });
    if (i < steps.length - 1) {
      slide.addShape('rightArrow', { x: x + boxW, y: y + boxH / 2 - 0.15, w: gap, h: 0.3, fill: { color: brand.colors.text } });
    }
  });
}
`.trim(),
  },

  {
    name: 'Numbered Steps',
    description: 'Large numbered steps with descriptions',
    category: 'PROCESS',
    tags: ['steps', 'numbers', 'list', 'sequential'],
    useCases: ['instructions', 'how-to guides', 'action plans'],
    bestFor: 'Clear step-by-step instructions or action items',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'steps'],
      properties: {
        title: { type: 'string' },
        steps: { type: 'array', items: { type: 'string' } },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, steps = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading });
  const startY = 1.5;
  const stepH = Math.min(1, 5 / steps.length);
  steps.forEach((step, i) => {
    const y = startY + i * stepH;
    slide.addShape('ellipse', { x: 0.8, y, w: 0.6, h: 0.6, fill: { color: brand.colors.primary } });
    slide.addText(String(i + 1), { x: 0.8, y, w: 0.6, h: 0.6, fontSize: 24, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
    slide.addText(step, { x: 1.6, y, w: 7.5, h: stepH - 0.1, fontSize: 14, color: brand.colors.text, valign: 'middle' });
  });
}
`.trim(),
  },

  // FRAMEWORK COMPONENTS (4 key ones)
  {
    name: 'SWOT Grid',
    description: '2x2 SWOT analysis matrix',
    category: 'FRAMEWORK',
    tags: ['swot', 'matrix', '2x2', 'analysis'],
    useCases: ['strategic planning', 'business analysis', 'situation assessment'],
    bestFor: 'SWOT analysis and strategic planning discussions',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['strengths', 'weaknesses', 'opportunities', 'threats'],
      properties: {
        strengths: { type: 'array', items: { type: 'string' } },
        weaknesses: { type: 'array', items: { type: 'string' } },
        opportunities: { type: 'array', items: { type: 'string' } },
        threats: { type: 'array', items: { type: 'string' } },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { strengths = [], weaknesses = [], opportunities = [], threats = [] } = data;
  const quadrants = [
    { title: 'Strengths', items: strengths, x: 0.5, y: 1, color: '00AA00' },
    { title: 'Weaknesses', items: weaknesses, x: 5.25, y: 1, color: 'CC0000' },
    { title: 'Opportunities', items: opportunities, x: 0.5, y: 4, color: '0066CC' },
    { title: 'Threats', items: threats, x: 5.25, y: 4, color: 'FF6600' }
  ];
  slide.addText('SWOT Analysis', { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading, align: 'center' });
  quadrants.forEach(q => {
    slide.addShape('rect', { x: q.x, y: q.y, w: 4.5, h: 2.8, fill: { color: 'F5F5F5' } });
    slide.addText(q.title, { x: q.x, y: q.y + 0.1, w: 4.5, h: 0.4, fontSize: 16, bold: true, color: q.color, align: 'center' });
    q.items.forEach((item, i) => {
      slide.addText('• ' + item, { x: q.x + 0.2, y: q.y + 0.6 + i * 0.35, w: 4.1, h: 0.3, fontSize: 11, color: brand.colors.text });
    });
  });
}
`.trim(),
  },

  {
    name: '2x2 Matrix',
    description: 'Generic 2x2 framework matrix with custom labels',
    category: 'FRAMEWORK',
    tags: ['matrix', '2x2', 'framework', 'quadrant'],
    useCases: ['prioritization', 'strategic positioning', 'framework analysis'],
    bestFor: 'Any 2x2 framework (Eisenhower, BCG, etc.)',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'xAxis', 'yAxis', 'quadrants'],
      properties: {
        title: { type: 'string' },
        xAxis: { type: 'object', properties: { low: { type: 'string' }, high: { type: 'string' } } },
        yAxis: { type: 'object', properties: { low: { type: 'string' }, high: { type: 'string' } } },
        quadrants: {
          type: 'array',
          minItems: 4,
          maxItems: 4,
          items: { type: 'object', properties: { label: { type: 'string' }, items: { type: 'array' } } },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, xAxis, yAxis, quadrants } = data;
  slide.addText(title, { x: 0.5, y: 0.3, w: 9, h: 0.5, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading, align: 'center' });
  const positions = [{ x: 1.5, y: 1.5 }, { x: 5.5, y: 1.5 }, { x: 1.5, y: 4.3 }, { x: 5.5, y: 4.3 }];
  quadrants.forEach((q, i) => {
    const pos = positions[i];
    slide.addShape('rect', { x: pos.x, y: pos.y, w: 3.8, h: 2.5, fill: { color: 'F0F0F0' } });
    slide.addText(q.label, { x: pos.x, y: pos.y + 0.1, w: 3.8, h: 0.4, fontSize: 14, bold: true, color: brand.colors.primary, align: 'center' });
    (q.items || []).forEach((item, j) => {
      slide.addText('• ' + item, { x: pos.x + 0.2, y: pos.y + 0.6 + j * 0.3, w: 3.4, h: 0.25, fontSize: 10, color: brand.colors.text });
    });
  });
  slide.addText(xAxis.low, { x: 1, y: 7, w: 2, h: 0.3, fontSize: 11, color: brand.colors.text, align: 'left' });
  slide.addText(xAxis.high, { x: 7, y: 7, w: 2, h: 0.3, fontSize: 11, color: brand.colors.text, align: 'right' });
  slide.addText(yAxis.low, { x: 0.3, y: 6.5, w: 1, h: 0.4, fontSize: 11, color: brand.colors.text, align: 'center' });
  slide.addText(yAxis.high, { x: 0.3, y: 1.2, w: 1, h: 0.4, fontSize: 11, color: brand.colors.text, align: 'center' });
}
`.trim(),
  },

  {
    name: 'Three Pillars',
    description: 'Three column framework with icons',
    category: 'FRAMEWORK',
    tags: ['pillars', 'columns', 'three', 'framework'],
    useCases: ['strategy pillars', 'value propositions', 'core principles'],
    bestFor: 'Presenting three key areas, pillars, or focus points',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'pillars'],
      properties: {
        title: { type: 'string' },
        pillars: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: {
            type: 'object',
            required: ['name', 'items'],
            properties: { name: { type: 'string' }, items: { type: 'array' } },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, pillars = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading, align: 'center' });
  const colW = 2.8;
  const startX = 1.1;
  pillars.slice(0, 3).forEach((pillar, i) => {
    const x = startX + i * 3.3;
    slide.addShape('rect', { x, y: 1.5, w: colW, h: 5, fill: { color: 'F5F5F5' } });
    slide.addText(pillar.name, { x, y: 1.7, w: colW, h: 0.6, fontSize: 16, bold: true, color: brand.colors.primary, align: 'center' });
    (pillar.items || []).forEach((item, j) => {
      slide.addText('• ' + item, { x: x + 0.2, y: 2.5 + j * 0.4, w: colW - 0.4, h: 0.35, fontSize: 11, color: brand.colors.text });
    });
  });
}
`.trim(),
  },

  {
    name: 'Pyramid 3-Level',
    description: 'Three-tier pyramid structure',
    category: 'FRAMEWORK',
    tags: ['pyramid', 'hierarchy', 'levels', 'structure'],
    useCases: ['organizational hierarchy', 'maslow pyramid', 'priority levels'],
    bestFor: 'Hierarchical or layered concepts',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'levels'],
      properties: {
        title: { type: 'string' },
        levels: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: {
            type: 'object',
            required: ['label'],
            properties: { label: { type: 'string' }, description: { type: 'string' } },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, levels = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading, align: 'center' });
  const pyramidData = [
    { x: 4, y: 1.5, w: 2, h: 1.2, level: 0 },
    { x: 3, y: 2.9, w: 4, h: 1.2, level: 1 },
    { x: 2, y: 4.3, w: 6, h: 1.2, level: 2 }
  ];
  pyramidData.forEach((p, i) => {
    slide.addShape('rect', { x: p.x, y: p.y, w: p.w, h: p.h, fill: { color: brand.colors.primary }, line: { color: 'FFFFFF', width: 2 } });
    slide.addText(levels[i]?.label || '', { x: p.x, y: p.y + 0.2, w: p.w, h: 0.4, fontSize: 14, bold: true, color: 'FFFFFF', align: 'center' });
    if (levels[i]?.description) {
      slide.addText(levels[i].description, { x: p.x, y: p.y + 0.7, w: p.w, h: 0.4, fontSize: 11, color: 'FFFFFF', align: 'center' });
    }
  });
}
`.trim(),
  },

  // COMPARISON (2)
  {
    name: 'Before/After',
    description: 'Split screen before and after comparison',
    category: 'COMPARISON',
    tags: ['before', 'after', 'comparison', 'contrast'],
    useCases: ['transformation stories', 'improvement results', 'change impact'],
    bestFor: 'Showing dramatic change or improvement',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'before', 'after'],
      properties: {
        title: { type: 'string' },
        before: { type: 'object', properties: { label: { type: 'string' }, items: { type: 'array' } } },
        after: { type: 'object', properties: { label: { type: 'string' }, items: { type: 'array' } } },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, before, after } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading, align: 'center' });
  slide.addShape('rect', { x: 0.5, y: 1.5, w: 4.4, h: 5, fill: { color: 'FFEBEE' } });
  slide.addText(before.label || 'Before', { x: 0.5, y: 1.7, w: 4.4, h: 0.5, fontSize: 18, bold: true, color: 'CC0000', align: 'center' });
  (before.items || []).forEach((item, i) => {
    slide.addText('• ' + item, { x: 0.7, y: 2.4 + i * 0.4, w: 4, h: 0.35, fontSize: 12, color: brand.colors.text });
  });
  slide.addShape('rect', { x: 5.1, y: 1.5, w: 4.4, h: 5, fill: { color: 'E8F5E9' } });
  slide.addText(after.label || 'After', { x: 5.1, y: 1.7, w: 4.4, h: 0.5, fontSize: 18, bold: true, color: '00AA00', align: 'center' });
  (after.items || []).forEach((item, i) => {
    slide.addText('• ' + item, { x: 5.3, y: 2.4 + i * 0.4, w: 4, h: 0.35, fontSize: 12, color: brand.colors.text });
  });
  slide.addShape('rightArrow', { x: 4.6, y: 3.8, w: 0.8, h: 0.4, fill: { color: brand.colors.primary } });
}
`.trim(),
  },

  {
    name: 'Pros/Cons',
    description: 'Two-column pros and cons list',
    category: 'COMPARISON',
    tags: ['pros', 'cons', 'advantages', 'disadvantages'],
    useCases: ['decision making', 'option evaluation', 'trade-off analysis'],
    bestFor: 'Balanced evaluation of options or decisions',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'pros', 'cons'],
      properties: {
        title: { type: 'string' },
        pros: { type: 'array', items: { type: 'string' } },
        cons: { type: 'array', items: { type: 'string' } },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, pros = [], cons = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading, align: 'center' });
  slide.addText('Pros', { x: 0.5, y: 1.3, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: '00AA00', align: 'center' });
  pros.forEach((pro, i) => {
    slide.addText('✓ ' + pro, { x: 0.7, y: 2 + i * 0.45, w: 4, h: 0.4, fontSize: 12, color: brand.colors.text });
  });
  slide.addText('Cons', { x: 5.1, y: 1.3, w: 4.4, h: 0.5, fontSize: 20, bold: true, color: 'CC0000', align: 'center' });
  cons.forEach((con, i) => {
    slide.addText('✗ ' + con, { x: 5.3, y: 2 + i * 0.45, w: 4, h: 0.4, fontSize: 12, color: brand.colors.text });
  });
}
`.trim(),
  },

  // NARRATIVE (2)
  {
    name: 'Full Text Narrative',
    description: 'Text-heavy slide with title and body content',
    category: 'NARRATIVE',
    tags: ['text', 'narrative', 'content', 'story'],
    useCases: ['detailed explanations', 'context setting', 'storytelling'],
    bestFor: 'When detailed text explanation is necessary',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['title', 'content'],
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        bullets: { type: 'array', items: { type: 'string' } },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { title, content = '', bullets = [] } = data;
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: brand.colors.text, fontFace: brand.fonts.heading });
  if (content) {
    slide.addText(content, { x: 0.5, y: 1.3, w: 9, h: bullets.length > 0 ? 2.5 : 5.5, fontSize: 14, color: brand.colors.text, fontFace: brand.fonts.body });
  }
  if (bullets.length > 0) {
    const startY = content ? 4 : 1.5;
    bullets.forEach((bullet, i) => {
      slide.addText('• ' + bullet, { x: 0.7, y: startY + i * 0.5, w: 8.5, h: 0.45, fontSize: 13, color: brand.colors.text });
    });
  }
}
`.trim(),
  },

  {
    name: 'Quote Pullout',
    description: 'Large quote with attribution',
    category: 'NARRATIVE',
    tags: ['quote', 'testimonial', 'citation'],
    useCases: ['testimonials', 'expert quotes', 'impactful statements'],
    bestFor: 'Highlighting important quotes or testimonials',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      required: ['quote'],
      properties: {
        quote: { type: 'string' },
        author: { type: 'string' },
        role: { type: 'string' },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { quote, author = '', role = '' } = data;
  slide.addText('"', { x: 1, y: 1.5, w: 1, h: 1, fontSize: 120, color: brand.colors.primary, transparency: 30 });
  slide.addText(quote, { x: 1.5, y: 2.5, w: 7, h: 2.5, fontSize: 24, italic: true, color: brand.colors.text, fontFace: brand.fonts.body, align: 'center', valign: 'middle' });
  if (author) {
    slide.addText('— ' + author, { x: 1.5, y: 5.2, w: 7, h: 0.4, fontSize: 16, bold: true, color: brand.colors.text, align: 'right' });
  }
  if (role) {
    slide.addText(role, { x: 1.5, y: 5.6, w: 7, h: 0.3, fontSize: 13, color: brand.colors.text, align: 'right' });
  }
}
`.trim(),
  },

  // CLOSING (1)
  {
    name: 'Thank You Slide',
    description: 'Closing slide with thank you message and contact info',
    category: 'CLOSING',
    tags: ['thank you', 'closing', 'contact', 'end'],
    useCases: ['presentation end', 'contact information', 'closing remarks'],
    bestFor: 'Professional presentation conclusion',
    source: 'CORE',
    isPublic: true,
    dataSchema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        contact: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            website: { type: 'string' },
          },
        },
      },
    },
    renderCode: `
function render(slide, data, brand) {
  const { message = 'Thank You', contact = {} } = data;
  slide.addText(message, { x: 0.5, y: 2.5, w: 9, h: 1, fontSize: 48, bold: true, color: brand.colors.primary, fontFace: brand.fonts.heading, align: 'center' });
  if (contact.name || contact.email || contact.phone || contact.website) {
    const lines = [];
    if (contact.name) lines.push(contact.name);
    if (contact.email) lines.push(contact.email);
    if (contact.phone) lines.push(contact.phone);
    if (contact.website) lines.push(contact.website);
    slide.addText(lines.join('\\n'), { x: 0.5, y: 4.5, w: 9, h: 1.5, fontSize: 14, color: brand.colors.text, align: 'center', valign: 'top' });
  }
}
`.trim(),
  },
];

// Export count for validation
export const TOTAL_COMPONENTS = 30;
export const IMPLEMENTED_COMPONENTS = SEED_COMPONENTS.length;
