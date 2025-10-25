import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ZoomIn, ZoomOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Section, SectionImage } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PreviewPanelProps {
  sections: Section[];
  recordTitle: string;
  customization?: any;
}

interface SectionWithImages extends Section {
  images?: SectionImage[];
}

export function PreviewPanel({ sections, recordTitle, customization }: PreviewPanelProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(100);
  const [sectionsWithImages, setSectionsWithImages] = useState<SectionWithImages[]>([]);

  const visibleSections = sections.filter((s) => !s.isHidden).sort((a, b) => a.order - b.order);

  // Fetch images for each section
  useEffect(() => {
    const fetchSectionImages = async () => {
      const sectionsWithImagesData = await Promise.all(
        visibleSections.map(async (section) => {
          try {
            const images = await apiRequest('GET', `/api/sections/${section.id}/images`);
            return { ...section, images };
          } catch (error) {
            console.error(`Error fetching images for section ${section.id}:`, error);
            return { ...section, images: [] };
          }
        })
      );
      setSectionsWithImages(sectionsWithImagesData);
    };

    if (visibleSections.length > 0) {
      fetchSectionImages();
    } else {
      setSectionsWithImages([]);
    }
  }, [visibleSections]);

  const zoomLevels = [50, 75, 100, 125, 150];

  const increaseZoom = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };

  const decreaseZoom = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  const renderStudentDetails = (content: string) => {
    try {
      const details = JSON.parse(content);
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {details.name && (
            <div>
              <span className="font-semibold">{t('field.name')}: </span>
              <span>{details.name}</span>
            </div>
          )}
          {details.rollNo && (
            <div>
              <span className="font-semibold">{t('field.rollNo')}: </span>
              <span>{details.rollNo}</span>
            </div>
          )}
          {details.class && (
            <div>
              <span className="font-semibold">{t('field.class')}: </span>
              <span>{details.class}</span>
            </div>
          )}
          {details.date && (
            <div>
              <span className="font-semibold">{t('field.date')}: </span>
              <span>{new Date(details.date).toLocaleDateString()}</span>
            </div>
          )}
          {details.subject && (
            <div>
              <span className="font-semibold">{t('field.subject')}: </span>
              <span>{details.subject}</span>
            </div>
          )}
          {details.batch && (
            <div>
              <span className="font-semibold">{t('field.batch')}: </span>
              <span>{details.batch}</span>
            </div>
          )}
        </div>
      );
    } catch {
      return null;
    }
  };

  const renderSectionImages = (images: SectionImage[]) => {
    if (!images || images.length === 0) return null;

    return (
      <div className="space-y-4 mt-4">
        {images.map((image) => (
          <div 
            key={image.id} 
            className={`flex flex-col items-center ${
              image.alignment === 'left' ? 'items-start' :
              image.alignment === 'right' ? 'items-end' :
              'items-center'
            }`}
          >
            <img 
              src={`http://localhost:3001${image.imageUrl}`}
              alt={image.caption || 'Section image'}
              className={`rounded border ${
                image.width === 25 ? 'max-w-[25%]' :
                image.width === 50 ? 'max-w-[50%]' :
                image.width === 75 ? 'max-w-[75%]' :
                'max-w-full'
              }`}
            />
            {image.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Zoom Controls */}
      <div className="flex items-center justify-center gap-2 p-4 border-b bg-background/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={decreaseZoom}
          disabled={zoom === zoomLevels[0]}
          data-testid="button-zoom-out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[60px] text-center" data-testid="text-zoom-level">
          {zoom}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={increaseZoom}
          disabled={zoom === zoomLevels[zoomLevels.length - 1]}
          data-testid="button-zoom-in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview Content */}
      <ScrollArea className="flex-1">
        <div className="p-8 flex justify-center">
          <Card
            className="bg-white text-black shadow-2xl transition-all"
            style={{
              width: `${(210 * zoom) / 100}mm`,
              minHeight: `${(297 * zoom) / 100}mm`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
            data-testid="preview-paper"
          >
            {/* A4 Paper Content */}
            <div className="p-16">
              {/* Document Title */}
              <div className="text-center mb-8 pb-6 border-b-2 border-black">
                <h1 className="text-2xl font-bold mb-2" data-testid="preview-title">
                  {recordTitle || t('file.new')}
                </h1>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {sectionsWithImages.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">{t('section.add')}</p>
                  </div>
                ) : (
                  sectionsWithImages.map((section) => (
                    <div key={section.id} className="space-y-3" data-testid={`preview-section-${section.id}`}>
                      {/* Section Title */}
                      <h2 className="text-xl font-semibold border-b border-gray-300 pb-2">
                        {section.title}
                      </h2>

                      {/* Section Content */}
                      <div className="text-base leading-relaxed">
                        {section.sectionType === 'student_details' ? (
                          renderStudentDetails(section.content)
                        ) : section.sectionType === 'code' ? (
                          <pre className="bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
                            <code className="font-mono text-sm">{section.content || ''}</code>
                          </pre>
                        ) : (
                          <>
                            <div className="prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {section.content || ''}
                              </ReactMarkdown>
                            </div>
                            {/* Render section images */}
                            {renderSectionImages(section.images || [])}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}