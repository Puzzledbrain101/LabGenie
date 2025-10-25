import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  sectionId: string;
}

export function ImageUpload({ sectionId }: ImageUploadProps) {
  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Will be implemented in integration phase
    console.log('Files dropped:', acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer hover-elevate transition-all ${
          isDragActive ? 'border-primary bg-primary/5' : ''
        }`}
        data-testid="dropzone-image-upload"
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-3">
          <Upload className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          <div>
            <p className="text-sm font-medium">{t('media.upload')}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('media.dragDrop')}</p>
          </div>
        </div>
      </Card>

      {/* Image Settings (shown when image is uploaded) */}
      <div className="space-y-4 opacity-50">
        <div className="space-y-2">
          <Label>{t('media.caption')}</Label>
          <Input placeholder={t('media.caption')} disabled />
        </div>

        <div className="space-y-2">
          <Label>{t('media.alignment')}</Label>
          <RadioGroup defaultValue="center" disabled>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="left" id="left" />
              <Label htmlFor="left" className="font-normal">{t('media.left')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="center" id="center" />
              <Label htmlFor="center" className="font-normal">{t('media.center')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="right" id="right" />
              <Label htmlFor="right" className="font-normal">{t('media.right')}</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>{t('media.size')}: 100%</Label>
          <Slider defaultValue={[100]} min={25} max={100} step={25} disabled />
        </div>
      </div>
    </div>
  );
}
