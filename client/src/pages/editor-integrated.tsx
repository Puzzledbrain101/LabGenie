import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Navbar } from '@/components/navbar';
import { TemplateSelector } from '@/components/template-selector';
import { SectionManager } from '@/components/section-manager';
import { SectionEditor } from '@/components/section-editor';
import { PreviewPanel } from '@/components/preview-panel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { isUnauthorizedError } from '@/lib/authUtils';
import type { Section, LabRecord } from '@shared/schema';

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

export default function EditorIntegrated() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);
  const [recordTitle, setRecordTitle] = useState('New Lab Record');
  const [template, setTemplate] = useState<TemplateType>('physics');
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load user's lab records
  const { data: records } = useQuery<LabRecord[]>({
    queryKey: ['/api/lab-records'],
  });

  // Create new record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: { title: string; templateType: string }) => {
      const response = await apiRequest('POST', '/api/lab-records', data);
      return response;
    },
    onSuccess: (newRecord: LabRecord) => {
      setCurrentRecordId(newRecord.id);
      queryClient.invalidateQueries({ queryKey: ['/api/lab-records'] });
      toast({
        title: t('msg.saved'),
        description: 'Record created successfully',
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('msg.error'),
        description: 'Failed to create record',
        variant: 'destructive',
      });
    },
  });

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async (data: { id: string; title?: string; customization?: any }) => {
      const { id, ...updates } = data;
      await apiRequest('PATCH', `/api/lab-records/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lab-records'] });
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
    },
  });

  // Create section mutation
  const createSectionMutation = useMutation({
    mutationFn: async (data: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await apiRequest('POST', `/api/lab-records/${currentRecordId}/sections`, data);
      return response;
    },
    onSuccess: (newSection: Section) => {
      setSections(prev => [...prev, newSection]);
      setActiveSectionId(newSection.id);
      toast({
        title: 'Section added',
      });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Section> }) => {
      await apiRequest('PATCH', `/api/sections/${data.id}`, data.updates);
    },
  });

  // Delete section mutation
  const deleteSectionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/sections/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Section deleted',
      });
    },
  });

  // Initialize new record when component mounts
  useEffect(() => {
    if (!currentRecordId && !createRecordMutation.isPending) {
      createRecordMutation.mutate({
        title: recordTitle,
        templateType: template,
      });
    }
  }, []);

  // Create initial sections when record is created
  useEffect(() => {
    if (currentRecordId && sections.length === 0) {
      const initialSections = defaultSections[template];
      initialSections.forEach((section, index) => {
        createSectionMutation.mutate({
          ...section,
          labRecordId: currentRecordId,
        });
      });
    }
  }, [currentRecordId]);

  // Auto-save mechanism
  useEffect(() => {
    if (hasUnsavedChanges && currentRecordId) {
      const timer = setTimeout(() => {
        handleSave();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, sections, recordTitle]);

  const handleSave = useCallback(() => {
    if (!currentRecordId) return;

    setSaveStatus('saving');
    updateRecordMutation.mutate({
      id: currentRecordId,
      title: recordTitle,
    });

    // Save all section changes
    sections.forEach(section => {
      updateSectionMutation.mutate({
        id: section.id,
        updates: {
          title: section.title,
          content: section.content,
          order: section.order,
          isHidden: section.isHidden,
        },
      });
    });
  }, [currentRecordId, recordTitle, sections]);

  const handleSectionsChange = (newSections: Section[]) => {
    setSections(newSections);
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<Section>) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, ...updates, updatedAt: new Date() }
          : section
      )
    );
    setHasUnsavedChanges(true);
    setSaveStatus('unsaved');
  };

  const handleSectionDelete = (sectionId: string) => {
    deleteSectionMutation.mutate(sectionId);
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (activeSectionId === sectionId) {
      setActiveSectionId(sections[0]?.id || null);
    }
  };

  const handleAddSection = () => {
    if (!currentRecordId) return;

    const newSection = {
      labRecordId: currentRecordId,
      title: 'New Section',
      content: '',
      order: sections.length,
      isHidden: false,
      sectionType: 'text' as const,
    };

    createSectionMutation.mutate(newSection);
  };

  const activeSection = sections.find(s => s.id === activeSectionId) || null;

  if (createRecordMutation.isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar
        recordTitle={recordTitle}
        onTitleChange={(title) => {
          setRecordTitle(title);
          setHasUnsavedChanges(true);
          setSaveStatus('unsaved');
        }}
        onSave={handleSave}
        onPreviewToggle={() => setIsPreviewMode(!isPreviewMode)}
        isSaving={saveStatus === 'saving'}
        saveStatus={saveStatus}
        isPreviewMode={isPreviewMode}
        sections={sections}
      />

      <div className="flex-1 flex overflow-hidden mt-16">
        <div
          className={`${
            isPreviewMode ? 'hidden lg:flex' : 'flex'
          } flex-col border-r bg-background transition-all duration-300`}
          style={{ width: isPreviewMode ? '40%' : '45%' }}
        >
          <div className="border-b p-4">
            <TemplateSelector value={template} onChange={setTemplate} />
          </div>

          <div className="flex-1 flex overflow-hidden">
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

        <div className={`${isPreviewMode ? 'flex' : 'hidden lg:flex'} flex-1 transition-all duration-300`}>
          <PreviewPanel sections={sections} recordTitle={recordTitle} />
        </div>
      </div>
    </div>
  );
}
