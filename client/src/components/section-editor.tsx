import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageUpload } from '@/components/image-upload';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Code, 
  Link,
  Underline
} from 'lucide-react';
import type { Section } from '@shared/schema';

interface SectionEditorProps {
  section: Section | null;
  onUpdate: (content: string) => void;
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

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

  // Text formatting functions
  const wrapSelection = (before: string, after: string = before) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText, newCursorPos;

    if (selectedText) {
      // Wrap selected text
      newText = beforeText + before + selectedText + after + afterText;
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // Insert markers for new text
      newText = beforeText + before + after + afterText;
      newCursorPos = start + before.length;
    }

    onUpdate(newText);
    
    // Restore cursor position after state update
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const formatBold = () => wrapSelection('**');
  const formatItalic = () => wrapSelection('*');
  
  // FIXED: Use markdown-compatible underline syntax
  const formatUnderline = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText, newCursorPos;

    if (selectedText) {
      // For underline, we'll use HTML <u> tags but we need to configure ReactMarkdown to allow them
      newText = beforeText + '<u>' + selectedText + '</u>' + afterText;
      newCursorPos = start + 3 + selectedText.length + 4;
    } else {
      // Insert underline tags for new text
      newText = beforeText + '<u></u>' + afterText;
      newCursorPos = start + 3;
    }

    onUpdate(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  
  const formatBulletList = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText.includes('\n')) {
      // Multiple lines - convert to bullet list
      const lines = selectedText.split('\n');
      const bulletedLines = lines.map(line => line.trim() ? `- ${line}` : '').join('\n');
      replaceSelection(bulletedLines);
    } else {
      // Single line or no selection
      wrapSelection('- ');
    }
  };

  const formatNumberedList = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText.includes('\n')) {
      // Multiple lines - convert to numbered list
      const lines = selectedText.split('\n').filter(line => line.trim());
      const numberedLines = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
      replaceSelection(numberedLines);
    } else {
      // Single line or no selection
      wrapSelection('1. ');
    }
  };

  const formatCode = () => wrapSelection('`');

  const replaceSelection = (newText: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    const updatedText = beforeText + newText + afterText;
    onUpdate(updatedText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + newText.length, start + newText.length);
      }
    }, 0);
  };

  const insertLink = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (linkUrl.trim()) {
      const linkMarkdown = `[${linkText || selectedText || 'link'}](${linkUrl})`;
      replaceSelection(linkMarkdown);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const openLinkDialog = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    setLinkText(selectedText);
    setShowLinkDialog(true);
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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={formatBold}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={formatItalic}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={formatUnderline}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={formatBulletList}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={formatNumberedList}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={openLinkDialog}
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
            {isCode && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={formatCode}
                title="Code"
              >
                <Code className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Link Insertion Dialog */}
          {showLinkDialog && (
            <div className="p-4 border rounded-lg bg-background space-y-3">
              <h4 className="font-medium">Insert Link</h4>
              <div className="space-y-2">
                <Label htmlFor="link-url">URL</Label>
                <Input
                  id="link-url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-text">Link Text (optional)</Label>
                <Input
                  id="link-text"
                  placeholder="Link text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowLinkDialog(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={insertLink}>
                  Insert Link
                </Button>
              </div>
            </div>
          )}

          {/* Content Editor */}
          <Textarea
            ref={textareaRef}
            value={section.content}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Start typing..."
            className={`flex-1 min-h-[400px] resize-none ${isCode ? 'font-mono' : ''}`}
            data-testid={`textarea-section-${section.id}`}
          />

          {/* Markdown Help Text */}
          <div className="text-xs text-muted-foreground">
            <p>Formatting tips: Use **bold**, *italic*, &lt;u&gt;underline&lt;/u&gt;, - for lists, 1. for numbered lists</p>
          </div>
        </TabsContent>

        <TabsContent value="media" className="flex-1 p-4">
          <ImageUpload sectionId={section.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}