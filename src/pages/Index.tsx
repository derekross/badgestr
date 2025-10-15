import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Key, Zap, Award, GitBranch, Globe } from 'lucide-react';

const Index = () => {
  useSeoMeta({
    title: 'Badgestr - Decentralized Digital Badges on Nostr',
    description: 'Create, award, and showcase 100% verifiable digital badges with true ownership. Built on Nostr protocol - no central authority, complete freedom.',
  });

  const features = [
    {
      icon: Key,
      title: 'Own Your Identity',
      description: 'Your badges, your keys, your data. No account required - just your Nostr identity.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Shield,
      title: 'Decentralized',
      description: 'No central authority can revoke or censor your achievements. Built on open Nostr protocol.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: GitBranch,
      title: 'True Ownership',
      description: 'Badges stored across decentralized relays - you control where and how they\'re shared.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Zap,
      title: 'Proof of Work',
      description: 'Optional computational mining ensures badge rarity and authenticity with cryptographic proof.',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: Award,
      title: 'Verifiable',
      description: 'Every badge is cryptographically signed and permanently verifiable on the Nostr network.',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Globe,
      title: 'Open Protocol',
      description: 'Built on NIP-58 standard - interoperable across all Nostr clients and applications.',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Recognize accomplishments with{' '}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  100% verifiable
                </span>{' '}
                digital badges
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Say goodbye to centralized platforms! Join the freedom movement with decentralized badges on Nostr — where you own your achievements, identity, and data forever.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/badges/create">
                  <Button size="lg" className="text-lg px-8 py-6 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/badges">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-lg border-2 shadow-lg hover:shadow-xl transition-all">
                    Explore Badges
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Image */}
            <div className="relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                {/* Background circle */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" />

                {/* Badge image */}
                <div className="relative z-10 flex items-center justify-center h-full">
                  <img
                    src="/badgestr.png"
                    alt="Badgestr Badge"
                    className="max-w-full h-auto drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black">
              Why Choose Badgestr?
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Discover Our Unique Features
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2"
                >
                  <div className="space-y-4">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black">
              How it Works
            </h2>
          </div>

          {/* For Issuers */}
          <div className="mb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              {/* Left: Image */}
              <div className="relative">
                <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 shadow-2xl">
                  <img
                    src="/badgestr.png"
                    alt="Badge Creation Dashboard"
                    className="w-full h-full object-contain"
                  />
                  {/* Decorative dots */}
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 grid grid-cols-4 gap-2 opacity-50">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-cyan-500" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="space-y-6">
                <h3 className="text-3xl md:text-4xl font-black">
                  For Issuers
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Say goodbye to centralized platforms! You can now create, issue, and manage portable digital badges that verify achievements, skills, credentials, and contributions — all stored on the decentralized Nostr network.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join the freedom movement with true badge ownership.
                </p>

                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">100% verifiable and cryptographically secure with your Nostr keys</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">No central authority - badges cannot be censored or revoked by any platform</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Optional proof-of-work mining for rare, collectible badges with verifiable scarcity</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Distributed storage across multiple relays - no single point of failure</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Open protocol (NIP-58) - works with any Nostr client</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link to="/badges/create">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      Create Badge
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* For Earners */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
              {/* Left: Content */}
              <div className="space-y-6 lg:order-1">
                <h3 className="text-3xl md:text-4xl font-black">
                  For Earners
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Join a global community of individuals taking control of their achievements and professional identity with decentralized badges on Nostr.
                </p>

                <div className="space-y-3 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Own your digital record of achievements with your Nostr keys - no one can take it away</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Access your badges anytime from any Nostr client - no vendor lock-in</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Upload custom badge artwork and share across the entire Nostr network</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">✓</div>
                    <p className="text-muted-foreground">Share badges on any platform - your achievements travel with your identity</p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link to="/badges/my">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      View My Badges
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative lg:order-2">
                <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 shadow-2xl">
                  <img
                    src="/badgestr.png"
                    alt="Badge Portfolio"
                    className="w-full h-full object-contain"
                  />
                  {/* Decorative dots */}
                  <div className="absolute -bottom-8 -right-8 w-24 h-24 grid grid-cols-4 gap-2 opacity-50">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-cyan-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-black">
              Use Cases
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: '🏛️',
                title: 'Communities',
                description: 'Recognize members and create engagement programs with verifiable achievements',
              },
              {
                icon: '🎓',
                title: 'Education',
                description: 'Issue verified credentials and learning achievements to students',
              },
              {
                icon: '🎯',
                title: 'Events',
                description: 'Award attendance badges and speaker recognition at conferences',
              },
              {
                icon: '🏢',
                title: 'Organizations',
                description: 'Recognize employee skills and professional development milestones',
              },
              {
                icon: '💝',
                title: 'Open Source',
                description: 'Acknowledge contributors and maintainers with verifiable badges',
              },
            ].map((useCase, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center"
              >
                <div className="space-y-4">
                  <div className="text-5xl mb-4">{useCase.icon}</div>
                  <h3 className="text-xl font-bold">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Ready to own your achievements?
            </h2>
            <p className="text-xl text-white/90">
              Join thousands embracing true digital ownership with decentralized badges on Nostr.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/badges/create">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100 shadow-2xl">
                  Create Your First Badge
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
