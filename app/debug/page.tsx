'use client';

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Client-Side Environment Debug</h1>
      <div className="space-y-2 bg-gray-100 p-4 rounded">
        <p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {supabaseUrl ? '✅ Present' : '❌ Missing'}</p>
        {supabaseUrl && <p className="text-xs text-gray-600">Value: {supabaseUrl.substring(0, 30)}...</p>}

        <p><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {supabaseKey ? '✅ Present' : '❌ Missing'}</p>
        {supabaseKey && <p className="text-xs text-gray-600">Value: {supabaseKey.substring(0, 30)}...</p>}

        <p className="mt-4"><strong>Node ENV:</strong> {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
}
