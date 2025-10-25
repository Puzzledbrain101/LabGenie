import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FlaskConical, FileText, Download, Globe } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: FileText,
      title: t('landing.features.editor'),
      description: t('landing.features.editor.desc'),
    },
    {
      icon: FlaskConical,
      title: t('landing.features.templates'),
      description: t('landing.features.templates.desc'),
    },
    {
      icon: Download,
      title: t('landing.features.export'),
      description: t('landing.features.export.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" data-testid="icon-logo" />
            <div>
              <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">
                {t('app.title')}
              </h1>
              <p className="text-xs text-muted-foreground" data-testid="text-app-tagline">
                {t('app.tagline')}
              </p>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight" data-testid="text-hero-title">
              {t('landing.hero.title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtitle">
              {t('landing.hero.subtitle')}
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="text-base px-8 min-h-12"
              data-testid="button-login"
            >
              {t('landing.cta.login')}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover-elevate transition-all duration-200"
              data-testid={`card-feature-${index}`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Visual Preview Mockup */}
        <div className="mt-20 max-w-6xl mx-auto">
          <Card className="p-8 shadow-xl">
            <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
              <div className="text-center space-y-3">
                <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Split-Screen Editor Preview
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
