# Badgestr

**Decentralized Digital Badges on Nostr**

Badgestr is a 100% verifiable digital badge platform built on the Nostr protocol. Create, award, and showcase achievements with true ownership—no central authority, complete freedom.

[![Built on Nostr](https://img.shields.io/badge/Built%20on-Nostr-purple)](https://nostr.com)
[![NIP-58](https://img.shields.io/badge/NIP-58-blue)](https://github.com/nostr-protocol/nips/blob/master/58.md)

## ✨ Features

### 🔑 True Ownership
- **Your badges, your keys, your data** - No accounts required, just your Nostr identity
- **Decentralized storage** across multiple relays - no single point of failure
- **Cryptographically signed** - every badge is permanently verifiable

### 🛡️ Decentralized & Censorship-Resistant
- **No central authority** - badges cannot be revoked or censored by any platform
- **Open protocol** - built on NIP-58 standard, works with any Nostr client
- **Distributed network** - badges stored across the Nostr relay network

### ⚡ Proof of Work Mining
- **Optional PoW** for rare, collectible badges with verifiable scarcity
- **5 rarity tiers**: Common, Uncommon, Rare, Epic, Legendary
- **Cryptographic proof** of computational work ensures badge value

### 🎨 Complete Badge Management
- **Create badges** with custom images and metadata
- **Award badges** to users via npub or hex pubkey
- **Manage awards** - edit, delete, or re-award your badges
- **Profile display** - choose which badges to showcase

### 🌐 Interoperable
- **Blossom upload** support for decentralized image hosting
- **NIP-19 encoding** for shareable badge addresses
- **njump.me integration** for cross-platform badge viewing
- **Works across all Nostr clients**

## 🏗️ Built With

- **React** + **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **@nostrify/react** - Nostr protocol integration
- **TanStack Query** - Powerful data fetching
- **shadcn/ui** - Beautiful component library
- **Nostr Tools** - NIP implementation
- **React Router** - Client-side routing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Nostr extension (e.g., nos2x, Alby, Flamingo)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/badgestr.git
cd badgestr

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the project
npm run build

# Preview production build
npm run preview
```

### Run Tests

```bash
# Run all tests
npm test
```

## 📖 Usage

### Creating a Badge

1. **Login** with your Nostr extension
2. Navigate to **Create Badge**
3. Fill in badge details (ID, name, description)
4. Upload an image or provide a URL
5. Select a **rarity tier** (Common to Legendary)
6. Click **Create Badge** (mining will occur for rare badges)

### Awarding a Badge

1. Navigate to **Manage Badges**
2. Click **Award** on any badge you created
3. Enter recipient npubs or hex pubkeys (one per line or comma-separated)
4. Click **Award Badge**

### Displaying Badges on Your Profile

1. Navigate to **My Badges**
2. Check the badges you want to display
3. Click **Save Profile Badges**
4. Your selected badges are now in your kind 30008 profile event

## 🔧 How It Works

Badgestr implements the [NIP-58](https://github.com/nostr-protocol/nips/blob/master/58.md) specification for badges:

### Event Types

- **Kind 30009** - Badge Definition (addressable, replaceable)
  - Defines a badge with name, description, and image
  - Created by badge issuers

- **Kind 8** - Badge Award
  - Awards a badge to one or more users
  - References the badge definition via `a` tag
  - References recipients via `p` tags

- **Kind 30008** - Profile Badges (addressable, replaceable)
  - User-curated list of badges to display
  - Uses consecutive `a` and `e` tag pairs

### Proof of Work

Badges can optionally require computational mining:

- **Common (0 bits)** - No PoW required
- **Uncommon (16 bits)** - ~65k hashes
- **Rare (21 bits)** - ~2M hashes
- **Epic (32 bits)** - ~4B hashes
- **Legendary (64 bits)** - Extreme computational work

Mining ensures badge rarity and authenticity through cryptographic proof.

## 🎯 Use Cases

- **Communities** - Recognize members and create engagement programs
- **Education** - Issue verified credentials and learning achievements
- **Events** - Award attendance badges and speaker recognition
- **Organizations** - Recognize employee skills and milestones
- **Open Source** - Acknowledge contributors and maintainers

## 🔌 Relay Configuration

Badgestr connects to Nostr relays. Default relays include:

- `wss://relay.ditto.pub`
- `wss://relay.nostr.band`
- `wss://relay.damus.io`
- `wss://relay.primal.net`

You can configure custom relays in the app settings.

## 🛠️ Development

### Project Structure

```
badgestr/
├── src/
│   ├── components/     # React components
│   │   ├── badges/    # Badge-specific components
│   │   ├── auth/      # Authentication components
│   │   └── ui/        # shadcn/ui components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── contexts/      # React contexts
├── public/            # Static assets
└── index.html         # Entry HTML
```

### Key Hooks

- `useBadgeDefinition` - Fetch a single badge definition
- `useBadgeDefinitions` - Fetch multiple badge definitions
- `useBadgeAwards` - Fetch badge awards
- `useProfileBadges` - Fetch user's profile badges
- `useNostrPublish` - Publish Nostr events
- `useUploadFile` - Upload files to Blossom

### Environment Variables

No environment variables required! Badgestr works out of the box.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Nostr Protocol](https://github.com/nostr-protocol/nostr) - Decentralized social protocol
- [NIP-58](https://github.com/nostr-protocol/nips/blob/master/58.md) - Badge specification
- [Nostrify](https://nostrify.dev) - Nostr development tools
- [shadcn/ui](https://ui.shadcn.com) - Beautiful component library

## 🔗 Links

- [Nostr Protocol](https://nostr.com)
- [NIP-58 Specification](https://github.com/nostr-protocol/nips/blob/master/58.md)
- [Nostr Resources](https://nostr.how)

## 💬 Support

For questions or support, please open an issue on GitHub.

---

**Built with ⚡ on Nostr** - True ownership, true freedom.
