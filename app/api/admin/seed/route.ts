import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { SEED_COMPONENTS } from '@/lib/components/seed-data';

export async function POST(request: NextRequest) {
  try {
    // Simple security check - only allow in development or with secret
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SEED_SECRET || 'dev-secret-123';

    if (authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete existing CORE components
    const { error: deleteError } = await supabaseAdmin
      .from('components')
      .delete()
      .eq('source', 'CORE');

    if (deleteError) {
      console.error('Delete error:', deleteError);
      // Continue even if delete fails (table might be empty)
    }

    // Insert seed components
    const componentsToInsert = SEED_COMPONENTS.map((comp) => ({
      name: comp.name,
      description: comp.description,
      category: comp.category,
      tags: comp.tags,
      render_code: comp.renderCode,
      data_schema: comp.dataSchema,
      source: comp.source,
      is_public: comp.isPublic,
      usage_count: 0,
      created_by: null, // System-created
      use_cases: comp.useCases,
      best_for: comp.bestFor,
    }));

    const { data, error: insertError } = await supabaseAdmin
      .from('components')
      .insert(componentsToInsert)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${data?.length || 0} components`,
      components: data?.map(c => ({ id: c.id, name: c.name, category: c.category })),
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to seed database' },
      { status: 500 }
    );
  }
}
