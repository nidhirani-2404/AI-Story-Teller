# 📖 AI Story Teller

An AI-powered web application that writes, illustrates, and narrates custom stories for you.

Tell it what you want — a fantasy adventure, a bedtime fairy tale, a mystery for teens — and it will write a multi-chapter story with illustrations, read it aloud, and let you download it as a PDF booklet.

Built with the MERN stack (MongoDB, Express, React, Node.js) and powered by Groq's Llama AI model.

---

## ✨ What Can It Do?

### 🖊️ Write Stories in Real-Time
Type in a topic like *"A brave cat who learns to fly"*, pick a genre and age group, and watch the AI write your story word-by-word on screen — no waiting for a loading spinner.

### 🎨 Auto-Generate Chapter Illustrations
Each chapter gets its own AI-generated illustration. The AI reads your story text, writes a visual description, and turns it into an image automatically.

### 💬 Continue Any Story
Finished reading Chapter 1? Click "Continue" and tell the AI what should happen next. It remembers the entire story so far and writes a brand-new chapter that fits perfectly.

### 🔊 Listen to Your Story
Hit the "Play Voice" button and your browser reads the story out loud. You can pause, resume, or stop at any time. You can also download the narration as an MP3 file.

### 📄 Download as a PDF Booklet
Export your story as a clean, formatted PDF that includes the title, all chapters, illustrations, and the moral of the story. Print it or share it with friends.

### 🔐 Your Own Private Library
Sign up with an email and password. Every story you create is saved to your personal library. Log in from any device to view, continue, or delete your stories.

---

## 🛠️ Built With

| What | Technology | Why We Chose It |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | Fast development, instant hot-reload |
| **Styling** | Tailwind CSS v4 | Beautiful UI without writing custom CSS files |
| **Icons** | Lucide React | Clean, modern icons for buttons and navigation |
| **Backend** | Node.js + Express | JavaScript everywhere, easy API routing |
| **Database** | MongoDB + Mongoose | Flexible document storage for nested story chapters |
| **AI Brain** | Groq SDK + Llama 3.1 | Ultra-fast AI text generation |
| **Images** | Pollinations AI | Free, no-API-key image generation from text prompts |
| **Voice** | Web Speech API + Google TTS | Free browser-based narration + downloadable audio |
| **PDF** | PDFKit | Server-side PDF creation with embedded images |
| **Auth** | JWT + bcrypt | Secure login sessions and encrypted passwords |
| **Cloud DB** | MongoDB Atlas | Free cloud database hosting |
| **Hosting** | Render | Free cloud server hosting for Node.js apps |

---

## 📂 How the Project is Organized

```
ai-story-teller/
│
├── client/                     ← The React frontend (what users see)
│   ├── src/
│   │   ├── App.jsx             ← Main app: forms, story display, audio controls
│   │   ├── index.css           ← All the styling (Tailwind)
│   │   └── main.jsx            ← React startup file
│   └── dist/                   ← Compiled production files (auto-generated)
│
├── server/                     ← The Express backend (handles data + AI)
│   ├── server.js               ← Starts the server, connects everything
│   ├── .env                    ← Your secret keys (NEVER shared publicly)
│   ├── config/
│   │   └── db.js               ← Connects to your MongoDB database
│   ├── models/
│   │   ├── Story.js            ← Defines what a "story" looks like in the database
│   │   └── User.js             ← Defines what a "user" looks like in the database
│   ├── controllers/
│   │   ├── storyController.js  ← Logic for creating, reading, deleting stories
│   │   └── userController.js   ← Logic for signup, login, authentication
│   ├── routes/
│   │   ├── storyRoutes.js      ← URL paths for story actions (/api/story/...)
│   │   └── userRoutes.js       ← URL paths for user actions (/api/user/...)
│   ├── services/
│   │   └── aiService.js        ← Talks to the Groq AI to generate stories
│   └── middleware/
│       ├── authMiddleware.js   ← Checks if the user is logged in
│       └── errorHandler.js     ← Catches errors so the server doesn't crash
│
├── package.json                ← Root-level scripts to build and run everything
├── GUIDE.md                    ← 30-chapter learning guide (full course book)
└── README.md                   ← You are reading this file right now
```

---

## 🚀 How to Run This Project

### What You Need First
- **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
- **A MongoDB database** — Either install MongoDB locally, or create a free cloud database at [MongoDB Atlas](https://www.mongodb.com/atlas)
- **A Groq API key** — Sign up for free at [console.groq.com](https://console.groq.com/) and copy your API key

### Step 1: Clone the Repository
```bash
git clone https://github.com/nidhirani-2404/AI-Story-Teller.git
cd AI-Story-Teller
```

### Step 2: Install Everything
This single command installs packages for both the frontend and the backend:
```bash
npm run install-all
```

### Step 3: Set Up Your Secret Keys
Create a file called `.env` inside the `server/` folder:
```
server/.env
```
Paste the following into it and fill in your own values:
```env
PORT=5000
MONGO_URI=mongodb+srv://yourUsername:yourPassword@cluster0.mongodb.net/storyforge
GROQ_API_KEY=gsk_paste_your_groq_key_here
JWT_SECRET=make_up_any_long_random_string_here
```

> ⚠️ **Important**: Never share this file publicly. It contains your passwords and API keys. It is already listed in `.gitignore` so Git will never upload it.

### Step 4: Start the App

**For Development** (two terminal windows):
```bash
# Terminal 1 — Start the backend server
npm run dev-server

# Terminal 2 — Start the frontend dev server
npm run dev-client
```
Then open your browser and go to **http://localhost:5173**

**For Production** (single server):
```bash
# Build the frontend
npm run build

# Start the production server
npm start
```
Then open your browser and go to **http://localhost:5000**

---

## 📡 API Endpoints

Here is every URL the backend responds to:

### User Routes

| Action | Method | URL | Who Can Use It | What It Does |
| :--- | :--- | :--- | :--- | :--- |
| Sign Up | `POST` | `/api/user/signup` | Anyone | Creates a new account, returns a login token |
| Log In | `POST` | `/api/user/login` | Anyone | Verifies email & password, returns a login token |

### Story Routes

| Action | Method | URL | Who Can Use It | What It Does |
| :--- | :--- | :--- | :--- | :--- |
| Stream a Story | `POST` | `/api/story/stream` | Logged-in users | Generates a story in real-time (word by word) |
| Create a Story | `POST` | `/api/story` | Logged-in users | Generates a story and returns it all at once |
| Get My Stories | `GET` | `/api/story` | Logged-in users | Returns all stories saved to your account |
| Continue a Story | `POST` | `/api/story/:id/continue` | Logged-in users | Adds a new chapter to an existing story |
| Delete a Story | `DELETE` | `/api/story/:id` | Logged-in users | Permanently removes a story from the database |
| Download Audio | `GET` | `/api/story/:id/audio` | Anyone with the link | Downloads the story overview as an MP3 file |
| Download PDF | `GET` | `/api/story/:id/pdf` | Anyone with the link | Downloads the story as a formatted PDF booklet |

---

## ☁️ How to Deploy to the Cloud

Want to make your app live on the internet? Here's how:

### 1. Database — MongoDB Atlas (Free)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free cluster.
2. Create a database user with a username and password.
3. Click "Connect" and copy the connection string. It looks like this:
   ```
   mongodb+srv://yourUser:yourPass@cluster0.xxxxx.mongodb.net/storyforge
   ```

### 2. Server — Render (Free)
1. Push your code to GitHub (already done ✅).
2. Go to [render.com](https://render.com) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the following:
   - **Build Command**: `npm run install-all && npm run build`
   - **Start Command**: `npm start`
5. Add your environment variables in the Render dashboard:
   - `MONGO_URI` = your Atlas connection string
   - `GROQ_API_KEY` = your Groq key
   - `JWT_SECRET` = any long random string
6. Click **Deploy** and wait a few minutes. Your app is now live! 🎉

---

## 📚 Learning Guide

This repository includes a **30-chapter technical course book** (`GUIDE.md`) that explains every concept behind this application:

- How Generative AI and LLMs work
- How to design prompts that produce structured JSON output
- How real-time streaming works (Server-Sent Events)
- How JWT authentication protects user data
- How to generate PDFs with embedded images on the server
- 120+ interview questions (MERN + GenAI + Prompt Engineering)
- A 30-day learning roadmap
- And much more...

Open it here: [GUIDE.md](./GUIDE.md)

---

## 🤝 Contributing

Contributions are welcome! If you want to improve this project:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-new-feature`)
3. Make your changes and commit (`git commit -m "feat: add my new feature"`)
4. Push to your branch (`git push origin feature/my-new-feature`)
5. Open a Pull Request

---



## 👩‍💻 Author

**Nidhi Rani**
- GitHub: [@nidhirani-2404](https://github.com/nidhirani-2404)

---

Made with ❤️ using React, Express, MongoDB, and Groq AI.
