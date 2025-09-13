
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeftRight,
  Download,
  Image as ImageIcon,
  Loader2,
  Lock,
  Percent,
  Sparkles,
  Unlock,
  UploadCloud,
  X,
  Palette,
  Layers,
  FlipHorizontal,
  FlipVertical,
  FileImage,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { getEstimatedFileSize } from '@/app/actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { FeedbackDialog } from './feedback-dialog';

type OriginalImage = {
  src: string;
  name: string;
  width: number;
  height: number;
  type: string;
  id: string;
};

type ProcessedImage = {
  id: string;
  src: string;
  name: string;
  width: number;
  height: number;
  format: string;
};

const formSchema = z.object({
  mode: z.enum(['dimensions', 'percentage']).default('dimensions'),
  width: z.coerce.number().int().min(1, 'Width must be at least 1px.'),
  height: z.coerce.number().int().min(1, 'Height must be at least 1px.'),
  percentage: z.coerce.number().min(1).max(200).default(100),
  isAspectRatioLocked: z.boolean().default(true),
  quality: z.enum(['low', 'medium', 'high']).default('medium'),
  format: z.enum(['jpeg', 'png', 'webp']).default('jpeg'),
  brightness: z.number().min(-100).max(100).default(0),
  contrast: z.number().min(-100).max(100).default(0),
  saturation: z.number().min(-100).max(100).default(0),
  rotation: z.number().min(0).max(360).default(0),
  flipHorizontal: z.boolean().default(false),
  flipVertical: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const qualityToValue: Record<FormValues['quality'], number> = {
  low: 0.5,
  medium: 0.75,
  high: 0.92,
};

export function SnapScaleTool() {
  const [originalImages, setOriginalImages] = useState<OriginalImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [customEstimatedSize, setCustomEstimatedSize] = useState<string>('');
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isUpdatingRef = useRef(false);
  
  // Check browser compatibility
  useEffect(() => {
    const checkBrowserSupport = () => {
      if (!HTMLCanvasElement.prototype.toBlob) {
        toast({
          variant: 'destructive',
          title: 'Browser Not Supported',
          description: 'Your browser does not support image downloads. Please update your browser.'
        });
      }
    };
    checkBrowserSupport();
  }, [toast]);
  
  const sampleImages = [
    {
      id: 'landscape',
      name: 'Mountain Landscape',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      description: 'Beautiful mountain landscape - Perfect for testing resize'
    },
    {
      id: 'portrait', 
      name: 'Portrait Photo',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop',
      description: 'Professional portrait - Great for aspect ratio testing'
    },
    {
      id: 'nature',
      name: 'Forest Nature',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop', 
      description: 'Dense forest scene - Ideal for filter testing'
    },
    {
      id: 'city',
      name: 'City Skyline',
      url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      description: 'Urban cityscape - Perfect for compression testing'
    }
  ];
  
  const originalImage = originalImages[currentImageIndex] || null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'dimensions',
      percentage: 100,
      isAspectRatioLocked: true,
      quality: 'medium',
      format: 'jpeg',
      brightness: 0,
      contrast: 0,
      saturation: 0,
      rotation: 0,
      flipHorizontal: false,
      flipVertical: false,
    },
  });

  const watchedValues = form.watch();

  const handleFiles = useCallback(
    (files: FileList) => {
      if (!files || files.length === 0) return;

      const imageFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          toast({
            variant: 'destructive',
            title: 'Invalid File',
            description: `${file.name} is not an image file.`,
          });
          return false;
        }
        return true;
      });

      if (imageFiles.length === 0) return;

      const newImages: OriginalImage[] = [];
      let loadedCount = 0;

      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === imageFiles.length) {
          setOriginalImages(prev => {
            const updatedImages = [...prev, ...newImages];
            // If this is the first batch of images, set the first one as active
            if (prev.length === 0 && updatedImages.length > 0) {
              setCurrentImageIndex(0);
              const firstImage = updatedImages[0];
              form.reset({
                ...form.getValues(),
                width: firstImage.width,
                height: firstImage.height,
              });
            }
            return updatedImages;
          });
        }
      };
      
      const onImageError = (fileName: string) => {
          toast({ variant: 'destructive', title: 'Error', description: `Could not load ${fileName}` });
          loadedCount++;
          if (loadedCount === imageFiles.length) {
            onImageLoad();
          }
      };

      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          if (!e.target?.result) {
            onImageError(file.name);
            return;
          }
          const img = document.createElement('img');
          img.onload = () => {
            newImages.push({
              id: Math.random().toString(36).substring(2, 9),
              src: img.src,
              name: file.name,
              width: img.width,
              height: img.height,
              type: file.type,
            });
            onImageLoad();
          };
          img.onerror = () => onImageError(file.name);
          img.src = e.target.result as string;
        };
        reader.onerror = () => onImageError(file.name);
        reader.readAsDataURL(file);
      });
    },
    [form, toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    e.target.value = ''; // Reset input
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) handleFiles(files);
  };
  
  const resetTool = () => {
    setOriginalImages([]);
    setCurrentImageIndex(0);
    setProcessedImages([]);
    setEstimatedSize(null);
    form.reset();
  };

  const removeImage = (id: string) => {
    const removedIndex = originalImages.findIndex(img => img.id === id);
    const updatedImages = originalImages.filter(img => img.id !== id);
    
    setOriginalImages(updatedImages);
    
    if (updatedImages.length === 0) {
        resetTool();
        return;
    }

    if (currentImageIndex >= removedIndex && currentImageIndex > 0) {
        const newIndex = currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
        if (updatedImages[newIndex]) {
            const { width, height } = updatedImages[newIndex];
            form.reset({
                ...form.getValues(),
                width,
                height,
                percentage: 100
            });
        }
    } else if (updatedImages.length > 0) {
        const newIndex = Math.min(currentImageIndex, updatedImages.length - 1);
        setCurrentImageIndex(newIndex);
        if (updatedImages[newIndex]) {
            const { width, height } = updatedImages[newIndex];
            form.reset({
                ...form.getValues(),
                width,
                height,
                percentage: 100
            });
        }
    }
};


  const applyFilters = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, values: FormValues) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Brightness
      data[i] = Math.max(0, Math.min(255, data[i] + values.brightness * 2.55));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + values.brightness * 2.55));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + values.brightness * 2.55));
      
      // Contrast
      const contrast = (values.contrast + 100) / 100;
      data[i] = Math.max(0, Math.min(255, (data[i] - 128) * contrast + 128));
      data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * contrast + 128));
      data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * contrast + 128));
      
      // Saturation
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const saturation = (values.saturation + 100) / 100;
      data[i] = Math.max(0, Math.min(255, gray + (data[i] - gray) * saturation));
      data[i + 1] = Math.max(0, Math.min(255, gray + (data[i + 1] - gray) * saturation));
      data[i + 2] = Math.max(0, Math.min(255, gray + (data[i + 2] - gray) * saturation));
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    if (!originalImage) return;

    if (isUpdatingRef.current) return;

    const subscription = form.watch((value, { name }) => {
      if (isUpdatingRef.current) return;

      const { width, height, isAspectRatioLocked, percentage, mode } = value;
      const ratio = originalImage.width / originalImage.height;

      isUpdatingRef.current = true;

      if (isAspectRatioLocked) {
        if (mode === 'dimensions') {
          if (name === 'width' && width && width !== form.getValues('width')) {
            const newHeight = Math.round(width / ratio);
            if (form.getValues('height') !== newHeight) {
              form.setValue('height', newHeight, { shouldValidate: true });
            }
          } else if (name === 'height' && height && height !== form.getValues('height')) {
            const newWidth = Math.round(height * ratio);
            if (form.getValues('width') !== newWidth) {
              form.setValue('width', newWidth, { shouldValidate: true });
            }
          }
        }
      }

      if (mode === 'dimensions' && (name === 'width' || name === 'height')) {
        const newPercentage = width ? Math.round((width / originalImage.width) * 100) : 0;
        if (form.getValues('percentage') !== newPercentage) {
          form.setValue('percentage', newPercentage, { shouldValidate: true });
        }
      } else if (mode === 'percentage' && name === 'percentage') {
        const newWidth = Math.round((originalImage.width * (percentage || 0)) / 100);
        const newHeight = Math.round((originalImage.height * (percentage || 0)) / 100);
        if (form.getValues('width') !== newWidth) {
          form.setValue('width', newWidth, { shouldValidate: true });
        }
        if (form.getValues('height') !== newHeight) {
          form.setValue('height', newHeight, { shouldValidate: true });
        }
      }

      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [originalImage, form]);

  useEffect(() => {
    if (!originalImage) return;

    const { width, height } = originalImage;
    form.reset({
        ...form.getValues(),
        width,
        height,
        percentage: 100,
    });
  }, [currentImageIndex, originalImages]);


  useEffect(() => {
    const fetchEstimate = async () => {
      if (!originalImage || !watchedValues.width || !watchedValues.height || !watchedValues.quality) {
        setEstimatedSize(null);
        return;
      }
      
      if (watchedValues.width <= 0 || watchedValues.height <= 0) {
        setEstimatedSize(null);
        return;
      }
      
      setIsEstimating(true);
      
      try {
        const result = await getEstimatedFileSize({
          width: Number(watchedValues.width),
          height: Number(watchedValues.height),
          quality: watchedValues.quality,
        });

        if ('error' in result) {
          console.warn('Estimation failed:', result.error);
          setEstimatedSize(null);
        } else {
          setEstimatedSize(result.estimatedFileSizeKB);
        }
      } catch (error) {
        console.error('Estimation error:', error);
        setEstimatedSize(null);
      } finally {
        setIsEstimating(false);
      }
    };

    const debounce = setTimeout(fetchEstimate, 300);
    return () => clearTimeout(debounce);
  }, [watchedValues.width, watchedValues.height, watchedValues.quality, originalImage]);

  const processAndDownloadImage = async (image: OriginalImage, values: FormValues, customSize?: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        const { mode, percentage } = values;
        let targetWidth = values.width;
        let targetHeight = values.height;

        if (mode === 'percentage') {
          targetWidth = Math.round((image.width * (percentage || 100)) / 100);
          targetHeight = Math.round((image.height * (percentage || 100)) / 100);
        }

        // Validate canvas dimensions
        if (targetWidth <= 0 || targetHeight <= 0) {
          throw new Error('Invalid dimensions: width and height must be greater than 0');
        }
        
        if (targetWidth > 32767 || targetHeight > 32767) {
          throw new Error('Image dimensions too large. Maximum size is 32767x32767 pixels.');
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const img = document.createElement('img');
        img.src = image.src;
        img.onload = () => {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            
            if (values.rotation) {
                ctx.rotate((values.rotation * Math.PI) / 180);
            }
            
            const scaleX = values.flipHorizontal ? -1 : 1;
            const scaleY = values.flipVertical ? -1 : 1;
            ctx.scale(scaleX, scaleY);
            
            ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
            ctx.restore();
            
            applyFilters(canvas, ctx, values);

            const mimeType = `image/${values.format}`;
            let quality = values.format === 'jpeg' ? qualityToValue[values.quality] : undefined;
            
            // Function to compress to target size
            const compressToTargetSize = (targetKB: number, currentQuality: number = 0.8): Promise<Blob> => {
              return new Promise((resolveBlob, rejectBlob) => {
                canvas.toBlob((blob) => {
                  if (!blob) {
                    rejectBlob(new Error('Failed to create blob'));
                    return;
                  }
                  
                  const actualSizeKB = blob.size / 1024;
                  
                  // If close enough to target (within 10%), use it
                  if (Math.abs(actualSizeKB - targetKB) / targetKB < 0.1) {
                    resolveBlob(blob);
                    return;
                  }
                  
                  // Adjust quality and try again
                  if (actualSizeKB > targetKB && currentQuality > 0.1) {
                    compressToTargetSize(targetKB, currentQuality - 0.1).then(resolveBlob).catch(rejectBlob);
                  } else if (actualSizeKB < targetKB && currentQuality < 0.95) {
                    compressToTargetSize(targetKB, currentQuality + 0.05).then(resolveBlob).catch(rejectBlob);
                  } else {
                    resolveBlob(blob); // Use current blob if can't optimize further
                  }
                }, mimeType, currentQuality);
              });
            };
            
            // Use custom compression if target size is set
            if (customSize && values.format === 'jpeg') {
              const targetSizeKB = parseFloat(customSize);
              compressToTargetSize(targetSizeKB).then((blob) => {
                if (!blob) { 
                    toast({ variant: 'destructive', title: 'Download Error', description: `Could not create image blob for ${image.name}.` });
                    reject(new Error(`Blob creation failed for ${image.name}`));
                    return;
                }
                
                try {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const originalName = image.name.substring(0, image.name.lastIndexOf('.'));
                    a.href = url;
                    a.download = `${originalName}-${targetWidth}x${targetHeight}.${values.format}`;
                    a.style.display = 'none';
                    
                    // Add to DOM, click, then remove
                    document.body.appendChild(a);
                    
                    // Try direct click first
                    try {
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        toast({ 
                            title: 'Download Started', 
                            description: `${originalName}-${targetWidth}x${targetHeight}.${values.format} is downloading.` 
                        });
                        
                        resolve();
                    } catch (clickError) {
                        // Fallback: Open in new window if click fails
                        console.warn('Direct download failed, trying fallback method:', clickError);
                        
                        try {
                            const newWindow = window.open(url, '_blank');
                            if (newWindow) {
                                newWindow.document.title = `Download: ${originalName}-${targetWidth}x${targetHeight}.${values.format}`;
                                toast({ 
                                    title: 'Download Ready', 
                                    description: 'Image opened in new tab. Right-click and save to download.' 
                                });
                            } else {
                                throw new Error('Popup blocked');
                            }
                        } catch (popupError) {
                            // Final fallback: Copy URL to clipboard
                            navigator.clipboard.writeText(url).then(() => {
                                toast({ 
                                    title: 'Download URL Copied', 
                                    description: 'Paste the URL in a new tab to download the image.' 
                                });
                            }).catch(() => {
                                toast({ 
                                    variant: 'destructive',
                                    title: 'Download Blocked', 
                                    description: 'Please check your browser settings and allow downloads.' 
                                });
                            });
                        }
                        
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve();
                    }
                    
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    toast({ 
                        variant: 'destructive', 
                        title: 'Download Failed', 
                        description: 'Please check your browser settings and try again.' 
                    });
                    reject(downloadError);
                }
              }).catch(reject);
            } else {
              // Standard compression
              canvas.toBlob((blob) => {
                if (!blob) { 
                    toast({ variant: 'destructive', title: 'Download Error', description: `Could not create image blob for ${image.name}.` });
                    reject(new Error(`Blob creation failed for ${image.name}`));
                    return;
                }
                
                try {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const originalName = image.name.substring(0, image.name.lastIndexOf('.'));
                    a.href = url;
                    a.download = `${originalName}-${targetWidth}x${targetHeight}.${values.format}`;
                    a.style.display = 'none';
                    
                    document.body.appendChild(a);
                    
                    try {
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        toast({ 
                            title: 'Download Started', 
                            description: `${originalName}-${targetWidth}x${targetHeight}.${values.format} is downloading.` 
                        });
                        
                        resolve();
                    } catch (clickError) {
                        console.warn('Direct download failed, trying fallback method:', clickError);
                        
                        try {
                            const newWindow = window.open(url, '_blank');
                            if (newWindow) {
                                newWindow.document.title = `Download: ${originalName}-${targetWidth}x${targetHeight}.${values.format}`;
                                toast({ 
                                    title: 'Download Ready', 
                                    description: 'Image opened in new tab. Right-click and save to download.' 
                                });
                            } else {
                                throw new Error('Popup blocked');
                            }
                        } catch (popupError) {
                            navigator.clipboard.writeText(url).then(() => {
                                toast({ 
                                    title: 'Download URL Copied', 
                                    description: 'Paste the URL in a new tab to download the image.' 
                                });
                            }).catch(() => {
                                toast({ 
                                    variant: 'destructive',
                                    title: 'Download Blocked', 
                                    description: 'Please check your browser settings and allow downloads.' 
                                });
                            });
                        }
                        
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        resolve();
                    }
                    
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    toast({ 
                        variant: 'destructive', 
                        title: 'Download Failed', 
                        description: 'Please check your browser settings and try again.' 
                    });
                    reject(downloadError);
                }
              }, mimeType, quality);
            }
        };
        img.onerror = () => {
            reject(new Error(`Failed to load image: ${image.name}`));
        };
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Processing Error', description: error.message });
        reject(error);
      }
    });
  };

  const handleDownload = async (values: FormValues) => {
    if (!originalImage) {
      toast({ variant: 'destructive', title: 'No Image', description: 'Please upload an image first.' });
      return;
    }
    
    console.log('Starting download process...', {
      image: originalImage.name,
      dimensions: `${values.width}x${values.height}`,
      format: values.format,
      quality: values.quality
    });
    
    setIsProcessing(true);
    try {
      await processAndDownloadImage(originalImage, values, useCustomSize ? customEstimatedSize : undefined);
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Download Failed', 
        description: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (originalImages.length === 0) return;
    setIsProcessing(true);
    
    const values = form.getValues();
    let downloadedCount = 0;

    for (const image of originalImages) {
      try {
        await processAndDownloadImage(image, values, useCustomSize ? customEstimatedSize : undefined);
        downloadedCount++;
      } catch (error) {
        console.error(`Failed to process ${image.name}`, error);
      }
    }
    
    setIsProcessing(false);
    toast({ title: 'Batch Download Complete', description: `${downloadedCount} of ${originalImages.length} images processed.` });
  };

  const uploadPlaceholder = PlaceHolderImages.find(p => p.id === 'upload-placeholder');
  
  const loadSampleImage = async (sample: typeof sampleImages[0]) => {
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], `${sample.name}.jpg`, { type: 'image/jpeg' });
      
      const newImage: OriginalImage = {
        id: Math.random().toString(36).substring(2, 9),
        src: URL.createObjectURL(file),
        name: file.name,
        width: 0,
        height: 0,
        type: file.type,
      };

      const img = document.createElement('img');
      img.onload = () => {
        newImage.width = img.width;
        newImage.height = img.height;
        setOriginalImages(prev => {
          const updatedImages = [...prev, newImage];
          setCurrentImageIndex(updatedImages.length - 1);
          form.reset({
            ...form.getValues(),
            width: newImage.width,
            height: newImage.height,
            percentage: 100,
          });
          return updatedImages;
        });
        setShowSamples(false);
      };
      img.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Load Error',
          description: 'Failed to load sample image dimensions.',
        });
      };
      img.src = newImage.src;
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Load Error',
        description: 'Failed to load sample image.',
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative" onDragOver={handleDragEvents} onDrop={handleDragEvents}>
       <Card 
        className="w-full transition-all duration-300"
        onDragEnter={(e) => {handleDragEvents(e); setIsDragging(true);}}
       >
        {originalImages.length === 0 ? (
          <div 
            className="relative p-8"
            onDragLeave={(e) => {handleDragEvents(e); setIsDragging(false);}}
            onDrop={handleDrop}
          >
            {isDragging && <div className="absolute inset-0 bg-primary/10 z-10 rounded-lg border-2 border-dashed border-primary"></div>}
            <div className="flex flex-col items-center justify-center text-center gap-6 py-12">
              <UploadCloud className="w-16 h-16 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Upload Your Photo</h3>
                <p className="text-muted-foreground">Drag & drop an image here, or click to browse.</p>
              </div>
              <div className="flex gap-4">
                <Button onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
                <Button variant="outline" onClick={() => setShowSamples(!showSamples)}>
                  Try Sample Images
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
            </div>
            {/* Sample Images Section */}
            {showSamples && (
              <div className="mt-8 p-6 bg-muted/30 rounded-lg border">
                <h4 className="text-lg font-semibold mb-4 text-center">Try Sample Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {sampleImages.map((sample) => (
                    <div key={sample.id} className="group cursor-pointer" onClick={() => loadSampleImage(sample)}>
                      <div className="relative overflow-hidden rounded-lg border-2 border-transparent group-hover:border-primary transition-all">
                        <Image
                          src={sample.url}
                          alt={sample.description}
                          width={200}
                          height={150}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity text-sm text-center px-2">
                            Click to Load
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium mt-2 text-center">{sample.name}</p>
                      <p className="text-xs text-muted-foreground text-center">{sample.description}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" onClick={() => setShowSamples(false)}>
                    Hide Samples
                  </Button>
                </div>
              </div>
            )}
            
            {uploadPlaceholder && !showSamples && (
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <Image
                  src={uploadPlaceholder.imageUrl}
                  alt={uploadPlaceholder.description}
                  data-ai-hint={uploadPlaceholder.imageHint}
                  width={600}
                  height={400}
                  className="rounded-md object-cover w-full h-auto aspect-video opacity-50"
                  priority
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Professional Image Editor</h2>
                  <p className="text-muted-foreground">Resize, transform, and enhance your images.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {originalImages.length > 1 && (
                    <Button onClick={downloadAll} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      Download All
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={resetTool} aria-label="Close">
                      <X className="h-5 w-5"/>
                  </Button>
                </div>
            </div>
            
            {/* Image Selector */}
            {originalImages.length > 1 && (
              <div className="mb-6">
                <Label className="text-sm font-medium mb-2 block">Select Image ({originalImages.length} uploaded)</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {originalImages.map((img, index) => (
                    <div key={img.id} className="relative flex-shrink-0">
                      <Button
                        variant={index === currentImageIndex ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentImageIndex(index)}
                        className="h-auto p-2 flex flex-col gap-1"
                      >
                        <Image src={img.src} alt={img.name} width={40} height={40} className="rounded object-cover" />
                        <span className="text-xs truncate max-w-[60px]">{img.name}</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-5 w-5"
                        onClick={() => removeImage(img.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleDownload)} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start">
                {/* Controls Panel */}
                <div className="space-y-4">
                    {originalImage && (
                        <div className="p-4 border rounded-lg bg-muted/20">
                            <div className="flex items-center gap-4">
                                <Image src={originalImage.src} alt="Original" width={64} height={64} className="rounded-md object-cover w-16 h-16"/>
                                <div>
                                    <p className="font-semibold break-all">{originalImage.name}</p>
                                    <p className="text-sm text-muted-foreground">{originalImage.width} x {originalImage.height} px</p>
                                </div>
                            </div>
                        </div>
                    )}


                  <Tabs value={watchedValues.mode} onValueChange={(value) => form.setValue('mode', value as 'dimensions' | 'percentage')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="dimensions"><ArrowLeftRight className="mr-2 h-4 w-4" />Dimensions</TabsTrigger>
                      <TabsTrigger value="percentage"><Percent className="mr-2 h-4 w-4" />Percentage</TabsTrigger>
                    </TabsList>
                    <TabsContent value="dimensions" className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <FormField
                            control={form.control}
                            name="width"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Width</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onKeyDown={handleKeyDown} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="isAspectRatioLocked"
                            render={({ field }) => (
                                <FormItem className="pt-8">
                                    <FormControl>
                                        <Button type="button" variant="outline" size="icon" onClick={() => field.onChange(!field.value)}>
                                            {field.value ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                            <span className="sr-only">Toggle aspect ratio</span>
                                        </Button>
                                    </FormControl>
                                </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Height</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onKeyDown={handleKeyDown} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormMessage>{form.formState.errors.width?.message || form.formState.errors.height?.message}</FormMessage>
                      </div>
                    </TabsContent>
                    <TabsContent value="percentage" className="pt-4 space-y-4">
                        <FormField
                            control={form.control}
                            name="percentage"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center mb-2">
                                        <FormLabel>Scale</FormLabel>
                                        <Badge variant="secondary" className="text-sm">{field.value}%</Badge>
                                    </div>
                                    <FormControl>
                                        <Slider
                                            value={[field.value]}
                                            onValueChange={(value) => field.onChange(value[0])}
                                            min={1}
                                            max={200}
                                            step={1}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                  </Tabs>

                  <Accordion type="multiple" defaultValue={['format', 'quality']} className="w-full space-y-4">
                    <AccordionItem value="format" className="border rounded-lg bg-muted/20 px-4">
                      <AccordionTrigger className="text-base py-4">
                        <div className="flex items-center gap-2">
                          <FileImage className="h-5 w-5 text-secondary" />
                          Output Format
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="format"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-3 gap-4 pt-2"
                                >
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="jpeg" id="jpeg" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="jpeg" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                      JPEG
                                    </Label>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="png" id="png" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="png" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                      PNG
                                    </Label>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="webp" id="webp" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="webp" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                      WebP
                                    </Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="quality" className="border rounded-lg bg-muted/20 px-4">
                      <AccordionTrigger className="text-base py-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-secondary" />
                          Output Quality
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <FormField
                          control={form.control}
                          name="quality"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-3 gap-4 pt-2"
                                >
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="low" id="low" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="low" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                      Low
                                    </Label>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="medium" id="medium" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="medium" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                      Medium
                                    </Label>
                                  </FormItem>
                                  <FormItem>
                                    <FormControl>
                                      <RadioGroupItem value="high" id="high" className="sr-only" />
                                    </FormControl>
                                    <Label htmlFor="high" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                                      High
                                    </Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <div className="pt-4 space-y-3 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center">
                                  Estimated file size: 
                                  {isEstimating ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <strong className="ml-1.5">{useCustomSize && customEstimatedSize ? `~${customEstimatedSize} KB` : estimatedSize !== null ? `~${estimatedSize.toFixed(1)} KB` : 'N/A'}</strong>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant={useCustomSize ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                      setUseCustomSize(!useCustomSize);
                                      if (useCustomSize) setCustomEstimatedSize('');
                                    }}
                                  >
                                    Custom Size
                                  </Button>
                                  {useCustomSize && (
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        placeholder="KB"
                                        value={customEstimatedSize}
                                        onChange={(e) => setCustomEstimatedSize(e.target.value)}
                                        className="w-20 h-8 text-sm"
                                        min="1"
                                      />
                                      <span className="text-xs text-muted-foreground">KB</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="filters" className="border rounded-lg bg-muted/20 px-4">
                      <AccordionTrigger className="text-base py-4">
                        <div className="flex items-center gap-2">
                          <Palette className="h-5 w-5 text-secondary" />
                          Image Filters
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="brightness"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Brightness</FormLabel>
                                <Badge variant="secondary" className="text-sm">{field.value}</Badge>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={-100}
                                  max={100}
                                  step={1}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contrast"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Contrast</FormLabel>
                                <Badge variant="secondary" className="text-sm">{field.value}</Badge>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={-100}
                                  max={100}
                                  step={1}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="saturation"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Saturation</FormLabel>
                                <Badge variant="secondary" className="text-sm">{field.value}</Badge>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={-100}
                                  max={100}
                                  step={1}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="transform" className="border rounded-lg bg-muted/20 px-4">
                      <AccordionTrigger className="text-base py-4">
                        <div className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-secondary" />
                          Transform
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <FormField
                          control={form.control}
                          name="rotation"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center">
                                <FormLabel>Rotation</FormLabel>
                                <Badge variant="secondary" className="text-sm">{field.value}°</Badge>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  min={0}
                                  max={360}
                                  step={1}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Flip</Label>
                            <div className="flex gap-2">
                              <FormField
                                control={form.control}
                                name="flipHorizontal"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Button
                                        type="button"
                                        variant={field.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => field.onChange(!field.value)}
                                      >
                                        <FlipHorizontal className="h-4 w-4" />
                                      </Button>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="flipVertical"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Button
                                        type="button"
                                        variant={field.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => field.onChange(!field.value)}
                                      >
                                        <FlipVertical className="h-4 w-4" />
                                      </Button>
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Crop</Label>
                            <div className="flex gap-2">
                              <Button type="button" variant="outline" size="sm" disabled>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15" /><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15" /></svg>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <Button 
                    type="button" 
                    size="lg" 
                    className="w-full" 
                    disabled={isProcessing || !originalImage}
                    onClick={() => handleDownload(form.getValues())}
                  >
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                    Download Image
                  </Button>
                </div>

                {/* Preview Panel */}
                <div className="lg:sticky lg:top-10 space-y-4">
                  <CardHeader className="p-0">
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>A preview of your resized image.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                    {originalImage && (
                      <Image
                        key={originalImage.id}
                        src={originalImage.src}
                        alt="Resized preview"
                        width={watchedValues.width || originalImage.width}
                        height={watchedValues.height || originalImage.height}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: watchedValues.isAspectRatioLocked ? 'contain' : 'fill',
                          filter: `brightness(${100 + watchedValues.brightness}%) contrast(${100 + watchedValues.contrast}%) saturate(${100 + watchedValues.saturation}%)`,
                          transform: `rotate(${watchedValues.rotation}deg) scaleX(${watchedValues.flipHorizontal ? -1 : 1}) scaleY(${watchedValues.flipVertical ? -1 : 1})`,
                        }}
                      />
                    )}
                    </div>
                    <div className="mt-4 text-center text-sm text-muted-foreground font-medium">
                        {watchedValues.width || 0} x {watchedValues.height || 0} px
                    </div>
                  </CardContent>
                </div>
              </form>
            </FormProvider>
          </div>
        )}
      </Card>
      
      {/* Fixed Feedback Button - Always Visible */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <FeedbackDialog />
      </div>

    </div>
  );
}

    