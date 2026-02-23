'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Slide {
  id: string;
  slideNumber: number;
  componentName: string;
  componentCategory: string;
}

interface Project {
  id: string;
  title: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'ERROR';
  inputContent: string;
  pptxUrl: string | null;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    loadProject();

    // Poll for updates if generating
    const interval = setInterval(() => {
      if (project?.status === 'GENERATING') {
        loadProject();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [projectId, project?.status]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
    }
  };

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const data = await response.json();
      setProject(data.project);
    } catch (err: any) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!project) return null;

    switch (project.status) {
      case 'READY':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Ready</span>
          </div>
        );
      case 'GENERATING':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <Clock className="h-5 w-5 animate-spin" />
            <span className="font-medium">Generating...</span>
          </div>
        );
      case 'ERROR':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 text-slate-600">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Draft</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-900 font-semibold mb-2">Failed to load project</p>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DeckForge</span>
          </Link>
          <div className="flex items-center space-x-4">
            {getStatusDisplay()}
            {project.status === 'READY' && project.pptxUrl && (
              <a
                href={`/api/projects/${project.id}/download`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            )}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Project Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.title}</h1>
            <p className="text-slate-600">
              Created {new Date(project.createdAt).toLocaleDateString()} • {project.slides.length} slides
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slides List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Slides</h2>

                {project.status === 'GENERATING' && (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">AI is generating your presentation...</p>
                    <p className="text-sm text-slate-500 mt-2">This usually takes 10-20 seconds</p>
                  </div>
                )}

                {project.status === 'ERROR' && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                    <p className="text-slate-900 font-semibold mb-2">Generation failed</p>
                    <p className="text-slate-600">Please try generating again or contact support</p>
                  </div>
                )}

                {project.status === 'READY' && project.slides.length > 0 && (
                  <div className="space-y-2">
                    {project.slides.map((slide) => (
                      <div
                        key={slide.id}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{slide.slideNumber}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">{slide.componentName}</h3>
                            <p className="text-sm text-slate-500">{slide.componentCategory}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {project.status === 'DRAFT' && (
                  <div className="text-center py-12">
                    <p className="text-slate-600">No slides generated yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Original Content</h2>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
                    {project.inputContent}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
