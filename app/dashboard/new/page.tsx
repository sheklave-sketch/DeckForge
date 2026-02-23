'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tone, setTone] = useState('professional');
  const [audience, setAudience] = useState('executives');
  const [style, setStyle] = useState('modern');
  const [slideCount, setSlideCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Create project
      const createResponse = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          title,
          content,
        }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const { project } = await createResponse.json();

      // Generate deck
      const generateResponse = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          content,
          parameters: { tone, audience, style, slideCount },
        }),
      });

      if (!generateResponse.ok) {
        const data = await generateResponse.json();
        throw new Error(data.error || 'Failed to generate deck');
      }

      // Redirect to project page
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DeckForge</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Project</h1>
            <p className="text-slate-600">
              Describe your content and let AI generate a polished presentation
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-8">
            {/* Project Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Project Details</h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                    Project Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Q4 2025 Strategy Review"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-slate-700 mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="Paste your notes, outline, or raw content here...&#10;&#10;Example:&#10;- Overview of Q4 performance&#10;- Revenue: $2.5M (up 23%)&#10;- Key wins: Enterprise deal with Acme Corp&#10;- Challenges: Supply chain delays&#10;- 2026 strategy: Expand to APAC market"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Tip: Include bullet points, data, and key messages. The AI will structure them into slides.
                  </p>
                </div>
              </div>
            </div>

            {/* Generation Parameters */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Generation Parameters</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="tone" className="block text-sm font-medium text-slate-700 mb-2">
                    Tone
                  </label>
                  <select
                    id="tone"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="inspiring">Inspiring</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="audience" className="block text-sm font-medium text-slate-700 mb-2">
                    Audience
                  </label>
                  <select
                    id="audience"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="executives">Executives</option>
                    <option value="team">Team</option>
                    <option value="clients">Clients</option>
                    <option value="investors">Investors</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-slate-700 mb-2">
                    Visual Style
                  </label>
                  <select
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                    <option value="bold">Bold</option>
                    <option value="corporate">Corporate</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="slideCount" className="block text-sm font-medium text-slate-700 mb-2">
                    Target Slides: {slideCount}
                  </label>
                  <input
                    id="slideCount"
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={slideCount}
                    onChange={(e) => setSlideCount(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>5</span>
                    <span>30</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 transition font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Wand2 className="h-5 w-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    <span>Generate Deck</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
