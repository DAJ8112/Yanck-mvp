# Yanck - RAG Chatbot Platform

Build custom AI chatbots trained on your documents in minutes. Modern UI powered by Next.js + ShadCN, intelligent backend with Flask + Google Gemini.

[See WHAT & WHY YANCK is ?](https://github.com/DAJ8112/Yanck-mvp/blob/main/What%20and%20Why%20Yanck.pdf)

## 🚀 Features

- **Modern UI**: Beautiful, responsive interface with ShadCN UI components
- **4-Step Wizard**: Easy chatbot creation process
- **Document Upload**: Support for PDF, DOCX, and TXT files
- **RAG Pipeline**: Retrieval-Augmented Generation with FAISS + Google Gemini
- **Real-time Chat**: Interactive messaging interface
- **Dashboard**: Manage all your chatbots in one place
- **AI-Powered**: Smart system prompt generation
- **TypeScript**: Full type safety across the frontend

## 📋 Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern utility-first styling
- **ShadCN UI** - Beautiful, accessible components
- **React Hook Form + Zod** - Form handling and validation

### Backend
- **Flask 3.0** - Python web framework
- **LangChain** - RAG pipeline orchestration
- **Google Gemini API** - Large language model
- **FAISS** - Vector similarity search
- **Sentence Transformers** - Local embeddings
- **SQLite** - Database

## 🛠️ Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))
- 2GB+ RAM (for embedding model)

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Yanck-mvp
```

### 2. Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt
```

### 3. Configure Backend Environment

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` and add your Gemini API key:

```bash
# Flask Configuration
FLASK_ENV=development
FLASK_SECRET_KEY=your-secret-key-here  # Change this!

# Gemini API (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key-here

# Model Configuration (Optional - defaults provided)
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=500
CHUNK_OVERLAP=50

# File Upload (Optional - defaults provided)
MAX_FILE_SIZE_MB=50
MAX_FILES_PER_CHATBOT=10
UPLOAD_FOLDER=./data/uploads

# Vector Store (Optional - defaults provided)
VECTOR_STORE_PATH=./data/vector_stores

# Database (Optional - defaults provided)
DATABASE_PATH=./data/chatbots.db
```

### 4. Initialize Database

```bash
python init_db.py
```

### 5. Start Flask Backend

```bash
python run.py
```

Backend will run on `http://localhost:5000`

### 6. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start Next.js dev server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 7. Open Your Browser

Visit `http://localhost:3000` and start creating chatbots!

## 📖 Usage

### Create a Chatbot

1. Click **"Create Chatbot"** from the landing page or dashboard
2. **Step 1**: Set name and system prompt (or use AI generation)
3. **Step 2**: Upload your documents (PDF, DOCX, TXT)
4. **Step 3**: Test your chatbot with sample questions
5. **Step 4**: Deploy and start chatting!

### Manage Chatbots

- **Dashboard**: View all your chatbots
- **Search**: Filter chatbots by name or description
- **Delete**: Remove chatbots with confirmation
- **Chat**: Click any chatbot to start a conversation

### Chat Interface

- Ask questions about your uploaded documents
- View conversation history
- See which documents are loaded
- Get AI-powered responses based on your content

## Project Structure

```
rag-chatbot-platform/
├── app.py                  # Flask application factory
├── run.py                  # Application entry point
├── init_db.py             # Database initialization script
├── requirements.txt       # Python dependencies
├── .env.example          # Example environment configuration
├── .env                  # Your environment configuration (not in git)
│
├── models/               # Data models and managers
│   ├── database.py       # Database utilities
│   ├── embedding_manager.py
│   └── vector_store_manager.py
│
├── services/             # Business logic
│   ├── chatbot_service.py
│   ├── document_service.py
│   └── query_service.py
│
├── routes/               # API and web routes
│   ├── api_routes.py     # REST API endpoints
│   └── web_routes.py     # Web page routes
│
├── templates/            # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── create_step1.html
│   ├── create_step2.html
│   ├── create_step3.html
│   ├── create_step4.html
│   └── chat.html
│
├── static/               # Static assets
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── wizard.js
│       └── chat.js
│
└── data/                 # Application data (created on first run)
    ├── chatbots.db       # SQLite database
    ├── uploads/          # Uploaded documents
    └── vector_stores/    # FAISS vector indices
```

## API Endpoints

### Chatbot Management

- `POST /api/chatbot` - Create new chatbot
- `GET /api/chatbot/<id>/status` - Get chatbot status
- `DELETE /api/chatbot/<id>` - Delete chatbot

### Document Management

- `POST /api/chatbot/<id>/documents` - Upload documents

### Query

- `POST /api/chatbot/<id>/query` - Submit query to chatbot

## Configuration Options

### Embedding Models

You can change the embedding model in `.env`:

```bash
# Faster, smaller (384 dimensions) - Default
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Higher quality, larger (768 dimensions)
EMBEDDING_MODEL=all-mpnet-base-v2
```

### Text Chunking

Adjust how documents are split:

```bash
CHUNK_SIZE=500        # Characters per chunk
CHUNK_OVERLAP=50      # Overlap between chunks
```

### File Upload Limits

```bash
MAX_FILE_SIZE_MB=50           # Max size per file
MAX_FILES_PER_CHATBOT=10      # Max files per chatbot
```

## Troubleshooting

### "GEMINI_API_KEY not set" Error

Make sure you've set your Gemini API key in the `.env` file:

```bash
GEMINI_API_KEY=your-actual-api-key-here
```

### "Failed to load embedding model" Error

This usually means insufficient memory. Try:
- Closing other applications
- Using a smaller model: `EMBEDDING_MODEL=all-MiniLM-L6-v2`

### "File too large" Error

Reduce file size or increase the limit in `.env`:

```bash
MAX_FILE_SIZE_MB=100
```

### Port Already in Use

Change the port in `.env` or via environment variable:

```bash
FLASK_PORT=8000
```

## Testing

Run the test suite:

```bash
# Run all tests
python -m pytest

# Run specific test file
python -m pytest test_chatbot_service.py

# Run with verbose output
python -m pytest -v
```

## Development

### Running in Debug Mode

Debug mode is enabled by default when `FLASK_ENV=development`:

```bash
FLASK_ENV=development
python run.py
```

### Adding New Features

1. Update models in `models/`
2. Add business logic in `services/`
3. Create routes in `routes/`
4. Add templates in `templates/`
5. Update tests

## Security Considerations

- **Never commit `.env` file** - It contains sensitive API keys
- **Change `FLASK_SECRET_KEY`** in production
- **Validate all file uploads** - The app checks file types and sizes
- **Use HTTPS** in production
- **Implement authentication** for production use

## Production Deployment

For production deployment, consider:

1. **Use a production WSGI server** (Gunicorn, uWSGI)
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Use PostgreSQL** instead of SQLite
3. **Implement user authentication**
4. **Add rate limiting**
5. **Use cloud storage** for uploaded files (AWS S3, etc.)
6. **Set up monitoring** (Sentry, CloudWatch)
7. **Use environment-specific configs**

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/)
- Powered by [LangChain](https://www.langchain.com/)
- Embeddings by [Sentence Transformers](https://www.sbert.net/)
- LLM by [Google Gemini](https://deepmind.google/technologies/gemini/)
