import { useSeoMeta } from '@unhead/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
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
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useBadgeDefinition } from '@/hooks/useBadgeDefinition';
import { Loader2, Upload, X } from 'lucide-react';
import { mineEvent, getRarityByDifficulty, BADGE_RARITY } from '@/lib/pow';
import type { Event as NostrEvent } from 'nostr-tools';
import { useState } from 'react';

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
});

const EditBadge = () => {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const publish = useNostrPublish();
  const uploadFile = useUploadFile();
  const [searchParams] = useSearchParams();

  const pubkey = searchParams.get('pubkey');
  const d = searchParams.get('d');

  const { data: badge, isLoading } = useBadgeDefinition(pubkey || undefined, d || undefined);
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState({ nonce: 0, difficulty: 0 });

  useSeoMeta({
    title: 'Edit Badge - Badgestr',
    description: 'Edit your Nostr badge (NIP-58 Badge Definition)',
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      d: '',
      name: '',
      description: '',
      image: '',
      imageDimensions: '',
      thumb512: '',
      thumb256: '',
      thumb64: '',
      thumb32: '',
      thumb16: '',
    },
  });

  // Populate form when badge loads
  useEffect(() => {
    if (badge) {
      form.setValue('d', badge.d);
      form.setValue('name', badge.name || '');
      form.setValue('description', badge.description || '');
      form.setValue('image', badge.image || '');
      form.setValue('imageDimensions', badge.imageDimensions || '');

      // Load thumbnails
      const thumb512 = badge.thumbs.find((t) => t.dimensions === '512x512');
      const thumb256 = badge.thumbs.find((t) => t.dimensions === '256x256');
      const thumb64 = badge.thumbs.find((t) => t.dimensions === '64x64');
      const thumb32 = badge.thumbs.find((t) => t.dimensions === '32x32');
      const thumb16 = badge.thumbs.find((t) => t.dimensions === '16x16');

      form.setValue('thumb512', thumb512?.url || '');
      form.setValue('thumb256', thumb256?.url || '');
      form.setValue('thumb64', thumb64?.url || '');
      form.setValue('thumb32', thumb32?.url || '');
      form.setValue('thumb16', thumb16?.url || '');
    }
  }, [badge, form]);

  const handleImageUpload = async (file: File, field: 'image' | 'thumb512' | 'thumb256' | 'thumb64' | 'thumb32' | 'thumb16') => {
    try {
      const tags = await uploadFile.mutateAsync(file);
      const url = tags.find(([name]) => name === 'url')?.[1];

      if (url) {
        form.setValue(field, url);

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

    const tags: string[][] = [['d', values.d]];

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

    try {
      // Check if original badge had PoW - if so, preserve it
      const originalDifficulty = badge?.difficulty || 0;

      if (originalDifficulty > 0) {
        setIsMining(true);
        setMiningProgress({ nonce: 0, difficulty: 0 });

        const rarityKey = getRarityByDifficulty(originalDifficulty);
        const rarityInfo = BADGE_RARITY[rarityKey];

        toast({
          title: 'Mining Badge',
          description: `Preserving ${rarityInfo.name} rarity (${originalDifficulty} bits)...`,
        });

        // Run mining in a setTimeout to allow UI to update
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            try {
              // Create dummy event for mining
              const dummyEvent: NostrEvent = {
                kind: 30009,
                content: '',
                tags,
                created_at: Math.floor(Date.now() / 1000),
                pubkey: user.pubkey,
                id: '',
                sig: '',
              };

              // Mine the event with the original difficulty
              const minedEvent = mineEvent(
                dummyEvent,
                originalDifficulty,
                (nonce, difficulty) => {
                  setMiningProgress({ nonce, difficulty });
                }
              );

              // Add the nonce tag from mining
              const nonceTag = minedEvent.tags.find((tag) => tag[0] === 'nonce');
              if (nonceTag) {
                tags.push(nonceTag);
              }

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

      await publish.mutateAsync({
        kind: 30009,
        content: '',
        tags,
      });

      toast({
        title: 'Badge Updated',
        description: originalDifficulty > 0
          ? `Badge updated with ${BADGE_RARITY[getRarityByDifficulty(originalDifficulty)].name} rarity preserved!`
          : 'Your badge has been updated successfully!',
      });

      navigate('/badges/manage');
    } catch (error) {
      setIsMining(false);
      toast({
        title: 'Error',
        description: `Failed to update badge: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>
              You need to be logged in to edit badges.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!badge) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Badge Not Found</CardTitle>
            <CardDescription>
              The badge you're trying to edit could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (badge.pubkey !== user.pubkey) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Permission Denied</CardTitle>
            <CardDescription>
              You can only edit badges that you created.
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
          <CardTitle>Edit Badge</CardTitle>
          <CardDescription>
            Update your badge definition (NIP-58 Kind 30009). This will replace the existing badge.
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
                      <Input placeholder="bravery" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Badge ID cannot be changed
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge Image (1024x1024 recommended)</FormLabel>
                    <div className="space-y-3">
                      {field.value && (
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
                      )}
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
                            Upload New Image
                          </>
                        )}
                      </Button>
                      <div className="text-center text-sm text-muted-foreground">Or</div>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/badge.png"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thumbnails (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Add different sizes for optimal display across the app
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
                          size="icon"
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
                          <Upload className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/thumb-512.png" {...field} />
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
                          size="icon"
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
                          <Upload className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/thumb-256.png" {...field} />
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
                          size="icon"
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
                          <Upload className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/thumb-64.png" {...field} />
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
                          size="icon"
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
                          <Upload className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/thumb-32.png" {...field} />
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
                          size="icon"
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
                          <Upload className="h-4 w-4" />
                        </Button>
                        <FormControl>
                          <Input placeholder="https://example.com/thumb-16.png" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isMining && (
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-semibold">Preserving badge rarity...</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Nonce: {miningProgress.nonce.toLocaleString()} | Current difficulty: {miningProgress.difficulty}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                disabled={publish.isPending || isMining}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isMining
                  ? 'Mining...'
                  : publish.isPending
                  ? 'Updating...'
                  : 'Update Badge'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBadge;
