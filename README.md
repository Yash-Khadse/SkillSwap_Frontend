# SkillSwap - Peer Learning Platform

SkillSwap is a platform for connecting people with complementary skills who want to learn from each other.

## Features

- Google OAuth authentication
- Skill tagging and matching algorithm
- Real-time chat for communication
- User dashboard with matches and messages
- Profile completion and availability settings

## Tech Stack

- **Frontend**: Next.js 13 with App Router, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Express.js (optional for additional services)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google provider
- **Real-time**: Socket.IO for chat functionality
- **State Management**: React hooks and context

## Getting Started

### Prerequisites

- Node.js 16.8 or later
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/skillswap.git
   cd skillswap
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Authentication
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap

   # API Config
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
skillswap/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard pages
│   ├── globals.css         # Global styles
│   └── layout.tsx          # Root layout
├── components/             # UI components
├── lib/                    # Utilities and helpers
│   ├── db/                 # Database models and connection
│   └── matching/           # Matching algorithm
├── public/                 # Static files
└── ...config files
```

## API Documentation

### Authentication

- `POST /api/auth/[...nextauth]` - NextAuth.js authentication routes

### User API

- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/matches` - Get user matches

### Matching API

- `GET /api/matching` - Get match suggestions
- `POST /api/matching/:id/accept` - Accept a match
- `POST /api/matching/:id/reject` - Reject a match

### Messages API

- `GET /api/messages` - Get all conversations
- `GET /api/messages/:matchId` - Get messages for a specific match
- `POST /api/messages/:matchId` - Send a new message

## Deployment

This application is configured for deployment on Vercel.

1. Push your repository to GitHub
2. Import the repository in Vercel
3. Configure the environment variables
4. Deploy

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built during a 24-hour hackathon
- Inspired by skill exchange and peer learning concepts