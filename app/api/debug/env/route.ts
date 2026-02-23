import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    buildVersion: '9f76852-v2',
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlHost: process.env.DATABASE_URL?.match(/@([^:\/]+)/)?.[1] || 'MISSING',
    nodeEnv: process.env.NODE_ENV,
  });
}
