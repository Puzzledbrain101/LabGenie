import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  sectionId: string;
}

interface UploadedImage {
  id: string;
  imageUrl: string;
  caption: string;
  alignment: string;
  width: number;
}

export function ImageUpload({ sectionId }: ImageUploadProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('caption', '');
      formData.append('alignment', 'center');
      formData.append('width', '100');
      formData.append('order', '0');

      const token = localStorage.getItem('token');
      console.log('🔧 [IMAGE UPLOAD] Starting upload with token:', !!token);
      
      const response = await fetch(`/api/sections/${sectionId}/images`, {
        method: 'POST',
        body: formData,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
      });

      console.log('🔧 [IMAGE UPLOAD] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔧 [IMAGE UPLOAD] Upload failed:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const imageData = await response.json();
      console.log('🔧 [IMAGE UPLOAD] Upload successful - FULL DATA:', JSON.stringify(imageData, null, 2));
      
      setUploadedImage(imageData);
      
      toast({
        title: 'Image uploaded',
        description: 'Image has been successfully uploaded',
      });

      // Test the image URL immediately
      testImageUrl(imageData.imageUrl);
    } catch (error: any) {
      console.error('🔧 [IMAGE UPLOAD] Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [sectionId, toast]);

  // Test if image URL is accessible
  const testImageUrl = async (imageUrl: string) => {
    const fullUrl = `http://localhost:3001${imageUrl}`;
    console.log('🔧 [IMAGE TEST] Testing URL:', fullUrl);
    
    try {
      const response = await fetch(fullUrl);
      console.log('🔧 [IMAGE TEST] Response status:', response.status);
      console.log('🔧 [IMAGE TEST] Response ok:', response.ok);
      
      if (response.ok) {
        console.log('✅ [IMAGE TEST] Image URL is accessible!');
      } else {
        console.error('❌ [IMAGE TEST] Image URL not accessible:', response.status);
      }
    } catch (error) {
      console.error('❌ [IMAGE TEST] Error testing URL:', error);
    }
  };

  const removeImage = async () => {
    if (!uploadedImage) return;

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/section-images/${uploadedImage.id}`, {
        method: 'DELETE',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {},
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      // For 204 No Content responses, don't try to parse JSON
      if (response.status !== 204) {
        await response.json();
      }

      setUploadedImage(null);
      toast({
        title: 'Image removed',
        description: 'Image has been removed',
      });
    } catch (error: any) {
      console.error('Remove error:', error);
      toast({
        title: 'Remove failed',
        description: error.message || 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`p-8 border-2 border-dashed cursor-pointer hover-elevate transition-all ${
          isDragActive ? 'border-primary bg-primary/5' : ''
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        data-testid="dropzone-image-upload"
      >
        <input {...getInputProps()} />
        <div className="text-center space-y-3">
          {isUploading ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground/40 mx-auto" />
          )}
          <div>
            <p className="text-sm font-medium">
              {isUploading ? 'Uploading...' : t('media.upload')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('media.dragDrop')}
            </p>
          </div>
        </div>
      </Card>

      {/* Preview Uploaded Image */}
      {uploadedImage && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Uploaded Image</h4>
            <Button variant="ghost" size="sm" onClick={removeImage}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Debug Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm font-medium text-yellow-800">Debug Information:</p>
            <p className="text-xs text-yellow-700">Image URL: {uploadedImage.imageUrl}</p>
            <p className="text-xs text-yellow-700">Full URL: http://localhost:3001{uploadedImage.imageUrl}</p>
            <p className="text-xs text-yellow-700">Image ID: {uploadedImage.id}</p>
          </div>

          {/* Image Preview with Multiple Attempts */}
          <div className="border rounded p-4 bg-gray-50">
            <p className="text-sm font-medium mb-2">Image Preview:</p>
            
            {/* Attempt 1: Direct URL */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Attempt 1: Direct URL</p>
              <img 
                src={uploadedImage.imageUrl}
                alt="Uploaded preview 1" 
                className="max-w-full h-auto rounded border mx-auto"
                onLoad={() => console.log('✅ [PREVIEW] Direct URL loaded successfully')}
                onError={(e) => {
                  console.error('❌ [PREVIEW] Direct URL failed');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Attempt 2: Full URL */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-1">Attempt 2: Full URL</p>
              <img 
                src={`http://localhost:3001${uploadedImage.imageUrl}`}
                alt="Uploaded preview 2" 
                className="max-w-full h-auto rounded border mx-auto"
                onLoad={() => console.log('✅ [PREVIEW] Full URL loaded successfully')}
                onError={(e) => {
                  console.error('❌ [PREVIEW] Full URL failed');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* Attempt 3: With cache busting */}
            <div>
              <p className="text-xs text-gray-600 mb-1">Attempt 3: Cache-busted URL</p>
              <img 
                src={`http://localhost:3001${uploadedImage.imageUrl}?t=${Date.now()}`}
                alt="Uploaded preview 3" 
                className="max-w-full h-auto rounded border mx-auto"
                onLoad={() => console.log('✅ [PREVIEW] Cache-busted URL loaded successfully')}
                onError={(e) => {
                  console.error('❌ [PREVIEW] Cache-busted URL failed');
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Test Links */}
          <div className="flex gap-4">
            <a 
              href={`http://localhost:3001${uploadedImage.imageUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 underline"
              onClick={() => console.log('🔗 [TEST] Opening image in new tab')}
            >
              Open Image in New Tab
            </a>
            <button 
              onClick={() => testImageUrl(uploadedImage.imageUrl)}
              className="text-sm text-green-500 underline"
            >
              Test Image URL
            </button>
          </div>
        </div>
      )}

      {/* Image Settings */}
      <div className={`space-y-4 ${uploadedImage ? '' : 'opacity-50'}`}>
        <div className="space-y-2">
          <Label>{t('media.caption')}</Label>
          <Input 
            placeholder={t('media.caption')} 
            disabled={!uploadedImage}
            value={uploadedImage?.caption || ''}
            onChange={(e) => uploadedImage && setUploadedImage({
              ...uploadedImage,
              caption: e.target.value
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('media.alignment')}</Label>
          <RadioGroup 
            value={uploadedImage?.alignment || 'center'} 
            disabled={!uploadedImage}
            onValueChange={(value) => uploadedImage && setUploadedImage({
              ...uploadedImage,
              alignment: value
            })}
          >
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
          <Label>{t('media.size')}: {uploadedImage?.width || 100}%</Label>
          <Slider 
            value={[uploadedImage?.width || 100]} 
            min={25} 
            max={100} 
            step={25} 
            disabled={!uploadedImage}
            onValueChange={(value) => uploadedImage && setUploadedImage({
              ...uploadedImage,
              width: value[0]
            })}
          />
        </div>
      </div>
    </div>
  );
}