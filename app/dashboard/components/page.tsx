'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Search, Filter } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  usageCount: number;
}

const CATEGORIES = [
  'ALL',
  'TITLE',
  'DATA',
  'PROCESS',
  'FRAMEWORK',
  'COMPARISON',
  'NARRATIVE',
  'CLOSING',
];

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComponents();
  }, []);

  useEffect(() => {
    filterComponents();
  }, [selectedCategory, searchQuery, components]);

  const loadComponents = async () => {
    try {
      const response = await fetch('/api/components/list');
      if (!response.ok) throw new Error('Failed to load components');

      const data = await response.json();
      setComponents(data.components);
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComponents = () => {
    let filtered = components;

    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredComponents(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      TITLE: 'bg-blue-100 text-blue-700',
      DATA: 'bg-green-100 text-green-700',
      PROCESS: 'bg-purple-100 text-purple-700',
      FRAMEWORK: 'bg-orange-100 text-orange-700',
      COMPARISON: 'bg-pink-100 text-pink-700',
      NARRATIVE: 'bg-indigo-100 text-indigo-700',
      CLOSING: 'bg-slate-100 text-slate-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
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
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Projects
            </Link>
            <Link href="/dashboard/components" className="text-sm font-medium text-blue-600">
              Components
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Component Library</h1>
          <p className="text-slate-600">
            Browse {components.length} professional presentation components
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto">
              <Filter className="h-5 w-5 text-slate-400 flex-shrink-0" />
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Components Grid */}
        {loading ? (
          <div className="text-center py-20">
            <Sparkles className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
            <p className="text-slate-600">Loading components...</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-600">No components found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition overflow-hidden"
              >
                {/* Component Preview Placeholder */}
                <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-slate-400" />
                </div>

                {/* Component Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                      {component.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        component.category
                      )}`}
                    >
                      {component.category}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {component.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {component.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {component.tags.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        +{component.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Usage Count */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Used {component.usageCount} times
                    </span>
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
