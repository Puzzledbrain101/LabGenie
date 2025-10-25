import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { FileText, FileType, Loader2 } from 'lucide-react';
import { exportToPDF, exportToDOCX } from '@/lib/exportUtils';
import type { Section } from '@shared/schema';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordTitle: string;
  sections: Section[];
}

export function ExportDialog({ open, onOpenChange, recordTitle, sections }: ExportDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [fileName, setFileName] = useState(recordTitle || 'lab-record');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options = {
        format,
        title: recordTitle,
        sections,
        orientation,
        includeHeader,
        fileName,
      };

      if (format === 'pdf') {
        await exportToPDF(options);
      } else {
        await exportToDOCX(options);
      }

      toast({
        title: t('msg.exported'),
        description: `${fileName}.${format}`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: t('msg.error'),
        description: 'Failed to export document',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="dialog-export">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('export.title')}</DialogTitle>
          <DialogDescription>
            {t('export.settings')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('export.format')}</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card
                className={`p-4 cursor-pointer hover-elevate transition-all ${
                  format === 'pdf' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setFormat('pdf')}
                data-testid="card-format-pdf"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{t('export.pdf')}</p>
                    <p className="text-xs text-muted-foreground">A4 PDF</p>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer hover-elevate transition-all ${
                  format === 'docx' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setFormat('docx')}
                data-testid="card-format-docx"
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <FileType className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{t('export.docx')}</p>
                    <p className="text-xs text-muted-foreground">Word .docx</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('export.orientation')}</Label>
            <RadioGroup value={orientation} onValueChange={(v: any) => setOrientation(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="portrait" id="portrait" data-testid="radio-portrait" />
                <Label htmlFor="portrait" className="font-normal cursor-pointer">
                  {t('layout.portrait')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="landscape" id="landscape" data-testid="radio-landscape" />
                <Label htmlFor="landscape" className="font-normal cursor-pointer">
                  {t('layout.landscape')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Include Header */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeHeader"
              checked={includeHeader}
              onCheckedChange={(checked) => setIncludeHeader(checked as boolean)}
              data-testid="checkbox-include-header"
            />
            <Label htmlFor="includeHeader" className="font-normal cursor-pointer">
              {t('export.includeHeader')}
            </Label>
          </div>

          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="fileName" className="text-sm font-medium">
              {t('export.fileName')}
            </Label>
            <Input
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="lab-record"
              data-testid="input-file-name"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isExporting} data-testid="button-cancel-export">
            {t('export.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting} data-testid="button-download-export">
            {isExporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('export.download')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
