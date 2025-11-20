# Yanck Chatbot Platform - Frontend

Modern Next.js frontend for the Yanck RAG Chatbot Platform with ShadCN UI.

## Features

- ✨ **Modern UI** - Beautiful, responsive design with ShadCN UI components
- 🚀 **Next.js 14** - Latest App Router with TypeScript
- 🎨 **Tailwind CSS** - Utility-first styling
- 📱 **Fully Responsive** - Works on all devices
- 🔄 **Real-time Chat** - Interactive chat interface with streaming responses
- 📊 **Dashboard** - Manage all your chatbots in one place
- 🧙 **4-Step Wizard** - Easy chatbot creation process
- 🔍 **Search & Filter** - Find your chatbots quickly

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **Form Validation**: React Hook Form + Zod
- **API Client**: Native Fetch API

## Prerequisites

- Node.js 18+ and npm
- Running Flask backend (see main README)

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Flask API URL (default: http://localhost:5000/api)
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Dashboard page
│   │   ├── create/            # 4-step wizard
│   │   └── chat/[id]/         # Chat interface
│   ├── components/
│   │   ├── ui/                # ShadCN UI components
│   │   └── navbar.tsx         # Navigation component
│   └── lib/
│       ├── api.ts             # API client
│       ├── types.ts           # TypeScript types
│       └── utils.ts           # Utility functions
├── public/                     # Static assets
└── package.json
```

## Pages

### Landing Page (`/`)
- Hero section with product overview
- Feature showcase
- Call-to-action sections
- Responsive navigation

### Dashboard (`/dashboard`)
- List all chatbots
- Search and filter
- Delete chatbots with confirmation
- Navigate to chat interface
- View chatbot details

### Create Chatbot (`/create`)
**Step 1: Basic Settings**
- Set chatbot name
- Define system prompt
- AI-powered prompt generation

**Step 2: Upload Documents**
- Drag-and-drop file upload
- Support for PDF, DOCX, TXT
- Multiple file selection

**Step 3: Test**
- Test chatbot responses
- Preview functionality
- Iterate before deployment

**Step 4: Deploy**
- Review configuration
- Launch chatbot
- Navigate to chat interface

### Chat Interface (`/chat/[id]`)
- Real-time messaging
- Conversation history
- Auto-scroll to latest messages
- Document info panel
- Clean, modern chat UI

## API Integration

The frontend communicates with the Flask backend via REST API:

- `POST /api/chatbot` - Create chatbot
- `GET /api/chatbots` - List all chatbots
- `GET /api/chatbot/:id` - Get chatbot details
- `DELETE /api/chatbot/:id` - Delete chatbot
- `POST /api/chatbot/:id/documents` - Upload documents
- `GET /api/chatbot/:id/documents` - List documents
- `POST /api/chatbot/:id/query` - Send message
- `POST /api/generate-system-prompt` - Generate AI prompt

## Development

### Add New Components

```bash
# Example: Add a new ShadCN component
npx shadcn@latest add [component-name]
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Other Platforms

Build the project and deploy the `.next` folder:

```bash
npm run build
```

## Troubleshooting

### CORS Errors
- Ensure Flask backend has CORS enabled
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify Flask is running on the correct port

### API Connection Failed
- Check Flask backend is running
- Verify `.env.local` has correct API URL
- Check network/firewall settings

### Build Errors
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear Next.js cache: `rm -rf .next`

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC
