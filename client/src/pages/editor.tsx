import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/navbar';
import { TemplateSelector } from '@/components/template-selector';
import { SectionManager } from '@/components/section-manager';
import { SectionEditor } from '@/components/section-editor';
import { PreviewPanel } from '@/components/preview-panel';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Section } from '@shared/schema';

type TemplateType = 'physics' | 'chemistry' | 'computer';

// Default sections for each template
const defaultSections: Record<TemplateType, Omit<Section, 'id' | 'labRecordId' | 'createdAt' | 'updatedAt'>[]> = {
  physics: [
    { title: 'Student Details', content: '{}', order: 0, isHidden: false, sectionType: 'student_details' },
    { title: 'Aim', content: '', order: 1, isHidden: false, sectionType: 'text' },
    { title: 'Apparatus', content: '', order: 2, isHidden: false, sectionType: 'text' },
    { title: 'Theory', content: '', order: 3, isHidden: false, sectionType: 'text' },
    { title: 'Procedure', content: '', order: 4, isHidden: false, sectionType: 'text' },
    { title: 'Observations', content: '', order: 5, isHidden: false, sectionType: 'text' },
    { title: 'Results', content: '', order: 6, isHidden: false, sectionType: 'text' },
    { title: 'Conclusion', content: '', order: 7, isHidden: false, sectionType: 'text' },
  ],
  chemistry: [
    { title: 'Student Details', content: '{}', order: 0, isHidden: false, sectionType: 'student_details' },
    { title: 'Aim', content: '', order: 1, isHidden: false, sectionType: 'text' },
    { title: 'Apparatus', content: '', order: 2, isHidden: false, sectionType: 'text' },
    { title: 'Theory', content: '', order: 3, isHidden: false, sectionType: 'text' },
    { title: 'Procedure', content: '', order: 4, isHidden: false, sectionType: 'text' },
    { title: 'Observations', content: '', order: 5, isHidden: false, sectionType: 'text' },
    { title: 'Results', content: '', order: 6, isHidden: false, sectionType: 'text' },
    { title: 'Conclusion', content: '', order: 7, isHidden: false, sectionType: 'text' },
  ],
  computer: [
    { title: 'Student Details', content: '{}', order: 0, isHidden: false, sectionType: 'student_details' },
    { title: 'Aim', content: '', order: 1, isHidden: false, sectionType: 'text' },
    { title: 'Theory', content: '', order: 2, isHidden: false, sectionType: 'text' },
    { title: 'Code', content: '', order: 3, isHidden: false, sectionType: 'code' },
    { title: 'Output', content: '', order: 4, isHidden: false, sectionType: 'text' },
    { title: 'Conclusion', content: '', order: 5, isHidden: false, sectionType: 'text' },
  ],
};

export default function Editor() {
  const { t } = useTranslation();
  const [recordTitle, setRecordTitle] = useState('New Lab Record');
  const [template, setTemplate] = useState<TemplateType>('physics');
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Initialize sections when template changes
  useEffect(() => {
    const initialSections = defaultSections[template].map((section, index) => ({
      ...section,
      id: `section-${Date.now()}-${index}`,
      labRecordId: 'temp',
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as Section[];
    setSections(initialSections);
    setActiveSectionId(initialSections[0]?.id || null);
  }, [template]);

  // Auto-save mechanism (simulated)
  useEffect(() => {
    if (saveStatus === 'unsaved') {
      const timer = setTimeout(() => {
        handleSave();
      }, 3000); // Auto-save after 3 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [saveStatus, sections, recordTitle]);

  const handleSave = useCallback(() => {
    setSaveStatus('saving');
    // This will be implemented in integration phase
    setTimeout(() => {
      setSaveStatus('saved');
    }, 500);
  }, []);

  const handleSectionsChange = (newSections: Section[]) => {
    setSections(newSections);
    setSaveStatus('unsaved');
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<Section>) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, ...updates, updatedAt: new Date() }
          : section
      )
    );
    setSaveStatus('unsaved');
  };

  const handleSectionDelete = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
    if (activeSectionId === sectionId) {
      setActiveSectionId(sections[0]?.id || null);
    }
    setSaveStatus('unsaved');
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      labRecordId: 'temp',
      title: 'New Section',
      content: '',
      order: sections.length,
      isHidden: false,
      sectionType: 'text',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    setSaveStatus('unsaved');
  };

  const activeSection = sections.find((s) => s.id === activeSectionId) || null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar
        recordTitle={recordTitle}
        onTitleChange={(title) => {
          setRecordTitle(title);
          setSaveStatus('unsaved');
        }}
        onSave={handleSave}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        isSaving={saveStatus === 'saving'}
        saveStatus={saveStatus}
        isPreviewMode={isPreviewMode}
        sections={sections}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden mt-16">
        {/* Left Panel - Editor */}
        <div
          className={`${
            isPreviewMode ? 'hidden lg:flex' : 'flex'
          } flex-col border-r bg-background transition-all duration-300`}
          style={{ width: isPreviewMode ? '40%' : '45%' }}
        >
          {/* Template Selector */}
          <div className="border-b p-4">
            <TemplateSelector value={template} onChange={setTemplate} />
          </div>

          {/* Split: Section Manager & Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Section List */}
            <div className="w-64 border-r bg-muted/30">
              <SectionManager
                sections={sections}
                activeSectionId={activeSectionId}
                onSectionsChange={handleSectionsChange}
                onSectionSelect={setActiveSectionId}
                onSectionUpdate={handleSectionUpdate}
                onSectionDelete={handleSectionDelete}
                onAddSection={handleAddSection}
              />
            </div>

            {/* Section Editor */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <SectionEditor
                  section={activeSection}
                  onUpdate={(content) =>
                    activeSection && handleSectionUpdate(activeSection.id, { content })
                  }
                />
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div
          className={`${
            isPreviewMode ? 'flex' : 'hidden lg:flex'
          } flex-1 transition-all duration-300`}
        >
          <PreviewPanel sections={sections} recordTitle={recordTitle} />
        </div>
      </div>
    </div>
  );
}