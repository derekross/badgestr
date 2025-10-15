import { useSeoMeta } from '@unhead/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUploadFile } from '@/hooks/useUploadFile';
import { BADGE_RARITY, type BadgeRarity, mineEvent, formatMiningTime, estimateMiningTime } from '@/lib/pow';
import { Sparkles, Loader2, Upload, X } from 'lucide-react';
import type { Event as NostrEvent } from 'nostr-tools';

const formSchema = z.object({
  d: z.string().min(1, 'Badge ID is required').max(50, 'Badge ID must be 50 characters or less'),
  name: z.string().min(1, 'Badge name is required'),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  imageDimensions: z.string().optional(),
  thumb512: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumb256: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumb64: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumb32: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumb16: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  rarity: z.string(),
});

const CreateBadge = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const publish = useNostrPublish();
  const uploadFile = useUploadFile();
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState({ nonce: 0, difficulty: 0 });

  useSeoMeta({
    title: 'Create Badge - Badgestr',
    description: 'Create a new Nostr badge (NIP-58 Badge Definition)',
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      d: '',
      name: '',
      description: '',
      image: '',
      imageDimensions: '1024x1024',
      thumb512: '',
      thumb256: '',
      thumb64: '',
      thumb32: '',
      thumb16: '',
      rarity: 'COMMON',
    },
  });

  const handleImageUpload = async (file: File, field: 'image' | 'thumb512' | 'thumb256' | 'thumb64' | 'thumb32' | 'thumb16') => {
    try {
      const tags = await uploadFile.mutateAsync(file);
      const url = tags.find(([name]) => name === 'url')?.[1];

      if (url) {
        form.setValue(field, url);

        // Auto-set dimensions based on field
        if (field === 'image') {
          form.setValue('imageDimensions', '1024x1024');
        }

        toast({
          title: 'Upload Successful',
          description: 'Image uploaded to Blossom server',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    let tags: string[][] = [['d', values.d]];

    if (values.name) tags.push(['name', values.name]);
    if (values.description) tags.push(['description', values.description]);
    if (values.image) {
      if (values.imageDimensions) {
        tags.push(['image', values.image, values.imageDimensions]);
      } else {
        tags.push(['image', values.image]);
      }
    }
    if (values.thumb512) tags.push(['thumb', values.thumb512, '512x512']);
    if (values.thumb256) tags.push(['thumb', values.thumb256, '256x256']);
    if (values.thumb64) tags.push(['thumb', values.thumb64, '64x64']);
    if (values.thumb32) tags.push(['thumb', values.thumb32, '32x32']);
    if (values.thumb16) tags.push(['thumb', values.thumb16, '16x16']);

    const rarity = values.rarity as BadgeRarity;
    const rarityInfo = BADGE_RARITY[rarity];

    try {
      // Mine the event if difficulty is required
      if (rarityInfo.difficulty > 0) {
        setIsMining(true);
        toast({
          title: 'Mining Badge',
          description: `Mining ${rarityInfo.name} badge with ${rarityInfo.difficulty} bits of proof of work...`,
        });

        // Run mining in a setTimeout to allow UI to update
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            try {
              // Create a dummy signed event for mining
              const dummyEvent: NostrEvent = {
                kind: 30009,
                content: '',
                tags,
                created_at: Math.floor(Date.now() / 1000),
                pubkey: user.pubkey,
                id: '',
                sig: '',
              };

              const minedEvent = mineEvent(dummyEvent, rarityInfo.difficulty, (nonce, difficulty) => {
                setMiningProgress({ nonce, difficulty });
              });

              // Update tags with mined nonce
              tags = minedEvent.tags;
              resolve();
            } catch (error) {
              toast({
                title: 'Mining Error',
                description: `Failed to mine badge: ${error instanceof Error ? error.message : 'Unknown error'}`,
                variant: 'destructive',
              });
              setIsMining(false);
            }
          }, 100);
        });

        setIsMining(false);
      }

      // Now publish with the mined tags
      await publish.mutateAsync({
        kind: 30009,
        content: '',
        tags,
      });

      toast({
        title: 'Badge Created',
        description: 'Your badge definition has been published successfully!',
      });

      form.reset();
      navigate('/badges');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to create badge: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      setIsMining(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to create badges.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Badge</CardTitle>
          <CardDescription>
            Create a new badge definition (NIP-58 Kind 30009). This will be an addressable event that can be awarded to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="d"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge ID</FormLabel>
                    <FormControl>
                      <Input placeholder="bravery" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for this badge (e.g., "bravery", "contributor")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Medal of Bravery" {...field} />
                    </FormControl>
                    <FormDescription>
                      The display name for this badge
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Awarded to users demonstrating bravery"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the badge and the criteria for earning it
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Image <span className="text-destructive">*</span></FormLabel>
                    <div className="space-y-3">
                      {field.value ? (
                        <div className="relative w-full max-w-xs mx-auto">
                          <img
                            src={field.value}
                            alt="Badge preview"
                            className="w-full rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => field.onChange('')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={uploadFile.isPending}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) handleImageUpload(file, 'image');
                              };
                              input.click();
                            }}
                          >
                            {uploadFile.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Image
                              </>
                            )}
                          </Button>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <FormControl>
                        <Input
                          placeholder="https://example.com/badge.png"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormDescription>
                      Upload via Blossom or enter URL (recommended: 1024x1024 pixels)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageDimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="1024x1024" {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Specify image dimensions (e.g., "1024x1024")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Rarity (Proof of Work)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rarity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(BADGE_RARITY).map(([key, info]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4" style={{ color: info.color }} />
                              <span>{info.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({info.difficulty} bits)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      <div className="space-y-1">
                        <p>
                          <strong>Selected:</strong> {BADGE_RARITY[field.value as BadgeRarity].name} - {BADGE_RARITY[field.value as BadgeRarity].difficulty} bits PoW
                        </p>
                        {BADGE_RARITY[field.value as BadgeRarity].difficulty > 0 && (
                          <p className="text-amber-600 dark:text-amber-400">
                            Estimated mining time: {formatMiningTime(estimateMiningTime(BADGE_RARITY[field.value as BadgeRarity].difficulty))}
                          </p>
                        )}
                        <p className="text-xs">
                          Higher rarity badges require computational work (Proof of Work) to create, making them more special and valuable.
                        </p>
                      </div>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isMining && (
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-semibold">Mining in progress...</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nonce: {miningProgress.nonce.toLocaleString()} | Current difficulty: {miningProgress.difficulty}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thumbnail URLs (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Provide different sized thumbnails for better performance
                </p>

                <FormField
                  control={form.control}
                  name="thumb512"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>512x512 Thumbnail</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadFile.isPending}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'thumb512');
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/badge_512.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumb256"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>256x256 Thumbnail</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadFile.isPending}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'thumb256');
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/badge_256.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumb64"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>64x64 Thumbnail</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadFile.isPending}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'thumb64');
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/badge_64.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumb32"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>32x32 Thumbnail</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadFile.isPending}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'thumb32');
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/badge_32.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumb16"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>16x16 Thumbnail</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadFile.isPending}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) handleImageUpload(file, 'thumb16');
                            };
                            input.click();
                          }}
                        >
                          <Upload className="h-3 w-3" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/badge_16.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={publish.isPending || isMining}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isMining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mining...
                  </>
                ) : publish.isPending ? (
                  'Creating...'
                ) : (
                  'Create Badge'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBadge;
