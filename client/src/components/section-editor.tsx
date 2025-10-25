import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/image-upload';
import { Bold, Italic, List, ListOrdered, Code } from 'lucide-react';
import type { Section } from '@shared/schema';

interface SectionEditorProps {
  section: Section | null;
  onUpdate: (content: string) => void;
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const { t } = useTranslation();

  if (!section) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-sm">{t('section.add')}</p>
        </div>
      </div>
    );
  }

  const isStudentDetails = section.sectionType === 'student_details';
  const isCode = section.sectionType === 'code';

  // Parse student details if applicable
  const studentDetails = isStudentDetails
    ? (() => {
        try {
          return JSON.parse(section.content || '{}');
        } catch {
          return {};
        }
      })()
    : {};

  const handleStudentDetailsChange = (field: string, value: string) => {
    const updated = { ...studentDetails, [field]: value };
    onUpdate(JSON.stringify(updated));
  };

  if (isStudentDetails) {
    return (
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{section.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('field.name')}</Label>
            <Input
              id="name"
              value={studentDetails.name || ''}
              onChange={(e) => handleStudentDetailsChange('name', e.target.value)}
              placeholder={t('field.name')}
              data-testid="input-student-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rollNo">{t('field.rollNo')}</Label>
            <Input
              id="rollNo"
              value={studentDetails.rollNo || ''}
              onChange={(e) => handleStudentDetailsChange('rollNo', e.target.value)}
              placeholder={t('field.rollNo')}
              data-testid="input-student-roll"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="class">{t('field.class')}</Label>
            <Input
              id="class"
              value={studentDetails.class || ''}
              onChange={(e) => handleStudentDetailsChange('class', e.target.value)}
              placeholder={t('field.class')}
              data-testid="input-student-class"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">{t('field.date')}</Label>
            <Input
              id="date"
              type="date"
              value={studentDetails.date || ''}
              onChange={(e) => handleStudentDetailsChange('date', e.target.value)}
              data-testid="input-student-date"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">{t('field.subject')}</Label>
            <Input
              id="subject"
              value={studentDetails.subject || ''}
              onChange={(e) => handleStudentDetailsChange('subject', e.target.value)}
              placeholder={t('field.subject')}
              data-testid="input-student-subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batch">{t('field.batch')}</Label>
            <Input
              id="batch"
              value={studentDetails.batch || ''}
              onChange={(e) => handleStudentDetailsChange('batch', e.target.value)}
              placeholder={t('field.batch')}
              data-testid="input-student-batch"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h3 className="text-lg font-semibold">{section.title}</h3>
      </div>

      <Tabs defaultValue="write" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4">
          <TabsTrigger value="write" data-testid="tab-write">Write</TabsTrigger>
          <TabsTrigger value="media" data-testid="tab-media">Media</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="flex-1 p-4 space-y-4">
          {/* Markdown Toolbar */}
          <div className="flex items-center gap-1 pb-2 border-b">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ListOrdered className="h-4 w-4" />
            </Button>
            {isCode && (
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Code className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Content Editor */}
          <Textarea
            value={section.content}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Start typing..."
            className={`flex-1 min-h-[400px] resize-none ${isCode ? 'font-mono' : ''}`}
            data-testid={`textarea-section-${section.id}`}
          />
        </TabsContent>

        <TabsContent value="media" className="flex-1 p-4">
          <ImageUpload sectionId={section.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
