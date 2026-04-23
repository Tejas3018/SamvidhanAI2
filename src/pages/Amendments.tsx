import { useState, useMemo, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AmendmentCard } from '@/components/amendments/AmendmentCard';
import { ProgressTracker } from '@/components/amendments/ProgressTracker';
import { amendments, amendmentCategories } from '@/data/amendments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Search, Filter, ChevronDown, ChevronUp, Calendar, Scale } from 'lucide-react';
import { useAmendmentProgress } from '@/hooks/useAmendmentProgress';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Amendments() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAllFilters, setShowAllFilters] = useState(false);
  const { exploredCount, markExplored } = useAmendmentProgress();
  const { t } = useLanguage();

  const handleExplore = useCallback((id: number) => {
    markExplored(id);
  }, [markExplored]);

  const filteredAmendments = useMemo(() => {
    let result = amendments;
    if (selectedCategory !== 'All') {
      result = result.filter(a => a.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.number.toLowerCase().includes(query) ||
        a.summary.toLowerCase().includes(query) ||
        a.impact.toLowerCase().includes(query) ||
        a.year.toString().includes(query)
      );
    }
    result = [...result].sort((a, b) => 
      sortOrder === 'asc' ? a.year - b.year : b.year - a.year
    );
    return result;
  }, [selectedCategory, searchQuery, sortOrder]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = { All: amendments.length };
    amendments.forEach(a => {
      stats[a.category] = (stats[a.category] || 0) + 1;
    });
    return stats;
  }, []);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-secondary/10 via-background to-primary/5 border-b border-border">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-10 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-blue mb-6 shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                {t('amendments.title')}
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                {t('amendments.subtitle')}
              </p>

              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{amendments.length}</div>
                  <div className="text-sm text-muted-foreground">{t('amendments.totalAmendments')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-secondary">1951</div>
                  <div className="text-sm text-muted-foreground">{t('amendments.firstAmendment')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-accent">2023</div>
                  <div className="text-sm text-muted-foreground">{t('amendments.latestAmendment')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gold">72+</div>
                  <div className="text-sm text-muted-foreground">{t('amendments.yearsOfEvolution')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-2xl p-4 md:p-6 mb-8 shadow-card">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t('amendments.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}
                className="h-12 gap-2 shrink-0"
              >
                <Calendar className="w-4 h-4" />
                {sortOrder === 'asc' ? t('amendments.oldestFirst') : t('amendments.newestFirst')}
                {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">{t('amendments.filterByCategory')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {amendmentCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full gap-1.5"
                  >
                    {category}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedCategory === category 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {categoryStats[category] || 0}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <ProgressTracker exploredCount={exploredCount} totalCount={amendments.length} />

          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {t('amendments.showing')} <span className="font-semibold text-foreground">{filteredAmendments.length}</span> {t('amendments.of')} {amendments.length} {t('nav.amendments').toLowerCase()}
            </p>
          </div>

          {filteredAmendments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAmendments.map((amendment, index) => (
                <AmendmentCard 
                  key={amendment.id} 
                  amendment={amendment} 
                  index={index} 
                  onExplore={handleExplore}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border">
              <Scale className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('amendments.noResults')}</h3>
              <p className="text-muted-foreground mb-4">{t('amendments.noResultsDesc')}</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                {t('amendments.clearFilters')}
              </Button>
            </div>
          )}

          <div className="mt-12 bg-gradient-to-br from-card to-muted/30 border border-border rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-6 text-center">{t('amendments.understanding')}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <h4 className="font-semibold mb-2">Article 368</h4>
                <p className="text-sm text-muted-foreground">{t('amendments.article368')}</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-secondary/10 flex items-center justify-center">
                  <span className="text-2xl">⚖️</span>
                </div>
                <h4 className="font-semibold mb-2">Basic Structure</h4>
                <p className="text-sm text-muted-foreground">{t('amendments.basicStructure')}</p>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🏛️</span>
                </div>
                <h4 className="font-semibold mb-2">Parliament's Power</h4>
                <p className="text-sm text-muted-foreground">{t('amendments.parliamentPower')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
