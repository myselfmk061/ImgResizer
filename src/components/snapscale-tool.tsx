
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeftRight,
  ArrowUpDown,
  Download,
  Image as ImageIcon,
  Loader2,
  Lock,
  Percent,
  Sparkles,
  Unlock,
  UploadCloud,
  X,
} from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';

import { getEstimatedFileSize } from '@/app/actions';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

type OriginalImage = {
  src: string;
  name: string;
  width: number;
  height: number;
  type: string;
};

const formSchema = z.object({
  mode: z.enum(['dimensions', 'percentage']).default('dimensions'),
  width: z.coerce.number().int().min(1, 'Width must be at least 1px.'),
  height: z.coerce.number().int().min(1, 'Height must be at least 1px.'),
  percentage: z.coerce.number().min(1).max(200).default(100),
  isAspectRatioLocked: z.boolean().default(true),
  quality: z.enum(['low', 'medium', 'high']).default('medium'),
});

type FormValues = z.infer<typeof formSchema>;

const qualityToValue: Record<FormValues['quality'], number> = {
  low: 0.5,
  medium: 0.75,
  high: 0.92,
};

export function SnapScaleTool() {
  const [originalImage, setOriginalImage] = useState<OriginalImage | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: 'dimensions',
      percentage: 100,
      isAspectRatioLocked: true,
      quality: 'medium',
    },
  });

  const watchedValues = form.watch();

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File',
          description: 'Please upload an image file.',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          setOriginalImage({
            src: img.src,
            name: file.name,
            width: img.width,
            height: img.height,
            type: file.type,
          });
          form.reset({
            ...form.getValues(),
            width: img.width,
            height: img.height,
            percentage: 100,
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [form, toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // Reset input
  };
  
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };
  
  const resetTool = () => {
    setOriginalImage(null);
    setEstimatedSize(null);
    form.reset();
  };

  useEffect(() => {
    if (!originalImage) return;

    const subscription = form.watch((value, { name }) => {
      const { width, height, isAspectRatioLocked, percentage, mode } = value;
      const ratio = originalImage.width / originalImage.height;

      if (isAspectRatioLocked) {
        if (mode === 'dimensions' && name === 'width' && width) {
          form.setValue('height', Math.round(width / ratio), { shouldValidate: true });
        } else if (mode === 'dimensions' && name === 'height' && height) {
          form.setValue('width', Math.round(height * ratio), { shouldValidate: true });
        } else if (mode === 'percentage' && name === 'percentage' && percentage) {
          form.setValue('width', Math.round((originalImage.width * percentage) / 100), { shouldValidate: true });
          form.setValue('height', Math.round((originalImage.height * percentage) / 100), { shouldValidate: true });
        }
      }
      
      if (mode === 'dimensions' && (name === 'width' || name === 'height')) {
        const newPercentage = Math.round((width! / originalImage.width) * 100);
        form.setValue('percentage', newPercentage, { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [originalImage, form]);


  useEffect(() => {
    const fetchEstimate = async () => {
      if (!originalImage || !watchedValues.width || !watchedValues.height) return;
      setIsEstimating(true);
      const result = await getEstimatedFileSize({
        width: watchedValues.width,
        height: watchedValues.height,
        quality: watchedValues.quality,
      });

      if ('error' in result) {
        toast({ variant: 'destructive', title: 'Estimation Error', description: result.error });
        setEstimatedSize(null);
      } else {
        setEstimatedSize(result.estimatedFileSizeKB);
      }
      setIsEstimating(false);
    };

    const debounce = setTimeout(fetchEstimate, 500);
    return () => clearTimeout(debounce);
  }, [watchedValues.width, watchedValues.height, watchedValues.quality, originalImage, toast]);

  const handleDownload = async (values: FormValues) => {
    if (!originalImage) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      canvas.width = values.width;
      canvas.height = values.height;

      const img = document.createElement('img');
      img.src = originalImage.src;
      await new Promise(resolve => img.onload = resolve);
      
      ctx.drawImage(img, 0, 0, values.width, values.height);

      const mimeType = originalImage.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const quality = mimeType === 'image/jpeg' ? qualityToValue[values.quality] : undefined;

      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Could not create blob');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const extension = mimeType.split('/')[1];
        const originalName = originalImage.name.substring(0, originalImage.name.lastIndexOf('.'));
        a.href = url;
        a.download = `${originalName}-${values.width}x${values.height}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      }, mimeType, quality);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Download Error', description: error.message });
        setIsProcessing(false);
    }
  };

  const uploadPlaceholder = PlaceHolderImages.find(p => p.id === 'upload-placeholder');
  
  return (
    <div className="w-full max-w-7xl mx-auto" onDragOver={handleDragEvents} onDrop={handleDragEvents}>
       <Card 
        className="w-full transition-all duration-300"
        onDragEnter={(e) => {handleDragEvents(e); setIsDragging(true);}}
       >
        {!originalImage ? (
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
              <Button onClick={() => fileInputRef.current?.click()}>
                Browse Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            {uploadPlaceholder && (
              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <Image
                  src={uploadPlaceholder.imageUrl}
                  alt={uploadPlaceholder.description}
                  data-ai-hint={uploadPlaceholder.imageHint}
                  width={600}
                  height={400}
                  className="rounded-md object-cover w-full h-auto aspect-video opacity-50"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Resize Image</h2>
                  <p className="text-muted-foreground">Adjust settings to resize your image.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetTool} aria-label="Close">
                    <X className="h-5 w-5"/>
                </Button>
            </div>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleDownload)} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Controls Panel */}
                <div className="space-y-8">
                    <div className="p-4 border rounded-lg bg-muted/20">
                        <div className="flex items-center gap-4">
                            <Image src={originalImage.src} alt="Original" width={64} height={64} className="rounded-md object-cover w-16 h-16"/>
                            <div>
                                <p className="font-semibold break-all">{originalImage.name}</p>
                                <p className="text-sm text-muted-foreground">{originalImage.width} x {originalImage.height} px</p>
                            </div>
                        </div>
                    </div>

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
                                  <Input type="number" {...field} />
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
                                  <Input type="number" {...field} />
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

                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-secondary" />
                            <FormLabel className="text-base">Output Quality</FormLabel>
                        </div>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-3 gap-4"
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
                        <FormDescription className="flex items-center justify-center pt-2">
                          Estimated file size: 
                          {isEstimating ? <Loader2 className="ml-2 h-4 w-4 animate-spin"/> : <strong className="ml-1.5">{estimatedSize !== null ? `~${estimatedSize.toFixed(1)} KB` : 'N/A'}</strong>}
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
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
                      <Image
                        src={originalImage.src}
                        alt="Resized preview"
                        width={watchedValues.width || originalImage.width}
                        height={watchedValues.height || originalImage.height}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          objectFit: watchedValues.isAspectRatioLocked ? 'contain' : 'fill',
                        }}
                      />
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
    </div>
  );
}
