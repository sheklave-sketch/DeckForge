'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, Clock, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Project {
  id: string;
  title: string;
  status: 'DRAFT' | 'GENERATING' | 'READY' | 'ERROR';
  slideCount: number;
  createdAt: string;
  updatedAt: string;
  deckUrl: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    loadProjects();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);
  };

  const loadProjects = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`/api/projects/list?userId=${session.user.id}`);
      if (!response.ok) throw new Error('Failed to load projects');

      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'GENERATING':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return 'Ready';
      case 'GENERATING':
        return 'Generating...';
      case 'ERROR':
        return 'Error';
      default:
        return 'Draft';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-slate-900">DeckForge</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-sm font-medium text-blue-600">
              Projects
            </Link>
            <Link href="/dashboard/components" className="text-sm text-slate-600 hover:text-slate-900">
              Components
            </Link>
            <div className="flex items-center space-x-4 ml-6 pl-6 border-l border-slate-200">
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Sign out
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Projects</h1>
            <p className="text-slate-600">Create and manage your AI-generated presentations</p>
          </div>
          <Link
            href="/dashboard/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Clock className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading projects...</p>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <Sparkles className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Create your first AI-generated presentation to get started
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Create Project</span>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">
                      {project.title}
                    </h3>
                    <div className="flex items-center space-x-1 ml-2">
                      {getStatusIcon(project.status)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                    <span>{project.slideCount} slides</span>
                    <span>•</span>
                    <span>{getStatusText(project.status)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    {project.status === 'READY' && project.deckUrl && (
                      <>
                        <a
                          href={`/api/projects/${project.id}/download`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 transition text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </>
                    )}
                    {project.status === 'DRAFT' && (
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:border-slate-400 transition text-sm font-medium text-center"
                      >
                        Continue editing
                      </Link>
                    )}
                    {project.status === 'GENERATING' && (
                      <div className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium text-center">
                        Generating...
                      </div>
                    )}
                    {project.status === 'ERROR' && (
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:border-red-400 transition text-sm font-medium text-center"
                      >
                        View error
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
