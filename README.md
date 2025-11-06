# Velto Web - Frontend Application

Voice agent testing platform frontend built with React, TypeScript, and Ant Design.

## Features

- ✅ Create and manage test configurations
- ✅ Run voice agent tests
- ✅ Real-time test results with polling
- ✅ View conversation transcripts
- ✅ Evaluation scores and metrics
- ✅ RTL support for Arabic
- ✅ Responsive design

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Ant Design** - UI component library
- **TanStack Query** - Server state management
- **Redux Toolkit** - Client state management
- **React Router** - Routing
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3000/v1
```

3. Start development server:
```bash
npm run dev
# or
yarn dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

The production build will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable components
│   └── common/      # Common components (ErrorBoundary, SkeletonLoader)
├── constants/        # Constants and configuration
│   └── languages.ts  # Language configurations
├── contexts/        # React contexts (Auth, Query)
├── hooks/           # Custom React hooks
│   └── useTests.ts  # Test-related hooks
├── layouts/         # Layout components
├── pages/           # Page components
│   └── tests/       # Test-related pages
├── routes/          # Route configuration
├── services/        # API services
│   └── api/         # API client functions
├── store/           # Redux store
│   └── slices/      # Redux slices
└── types/           # TypeScript type definitions
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL (default: `http://localhost:3000/v1`)

## Key Features

### Test Management
- Create test configurations with language, dialect, persona, and scenario
- View all test configurations in a table
- View detailed test information
- Run tests and monitor results in real-time

### Real-time Updates
- Automatic polling every 3 seconds for running tests
- Live status updates
- Conversation transcript updates as tests progress

### RTL Support
- Automatic RTL text direction for Arabic content
- Proper text alignment in transcripts
- RTL-aware form inputs

## Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Prettier for code formatting (recommended)

### Testing
Manual testing checklist:
- [ ] Create test configuration
- [ ] Run test
- [ ] View real-time results
- [ ] View test details
- [ ] Test with Arabic language (RTL)
- [ ] Test error scenarios
- [ ] Test on mobile devices

## Deployment

### Vercel / Netlify
1. Connect your repository
2. Set environment variable `VITE_API_URL`
3. Deploy

### Cloudflare Pages
1. Build command: `npm run build`
2. Build output: `dist`
3. Set environment variable `VITE_API_URL`

## Browser Support

- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)

## License

MIT

