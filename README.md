# GitHub Webhook Logger

A comprehensive solution for monitoring GitHub repository activities through webhooks. This application captures Push, Pull Request, and Merge events from GitHub repositories and displays them in a beautiful, real-time web interface.

##  Features

- **Real-time Webhook Processing**: Captures GitHub webhook events instantly
- **Beautiful UI**: Modern, responsive interface with dark/light theme support
- **Live Updates**: Automatically refreshes every 15 seconds
- **MongoDB Storage**: Reliable data persistence with proper indexing
- **Docker Support**: Easy deployment with Docker Compose
- **Comprehensive Testing**: Unit tests, integration tests, and quality checks
- **Security**: Webhook signature verification for security

##  Supported GitHub Events

| Event Type | Description | Display Format |
|------------|-------------|----------------|
| **PUSH** | Code pushed to repository | `{author} pushed to {to_branch} on {timestamp}` |
| **PULL_REQUEST** | Pull request opened | `{author} submitted a pull request from {from_branch} to {to_branch} on {timestamp}` |
| **MERGE** | Pull request merged | `{author} merged branch {from_branch} to {to_branch} on {timestamp}` |

##  Architecture

```mermaid
graph LR
    A[GitHub Repository] --> B[GitHub Webhooks];
    B --> C[Flask Backend];
    C --> D[MongoDB];
    D --> E[React Frontend];
    E --> F[User Interface];
```

##  Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: React with Tailwind CSS
- **Database**: MongoDB
- **Deployment**: Docker & Docker Compose
- **Icons**: React Icons (including Simple Icons for tech stack)
- **HTTP Client**: Axios
- **Date Handling**: Moment.js

##  Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- A GitHub repository for testing

### 1. Clone the Repository

```bash
git clone https://github.com/SimpNick6703/webhook-repo
cd webhook-repo
```

### 2. Set up Environment Variables

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file
# MONGO_URI=mongodb://admin:password123@mongodb:27017/github_webhook_db?authSource=admin
```

### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application

- **Web Interface**: http://localhost:3000
- **API Endpoint**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 5. Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to Settings → Webhooks
3. Click "Add webhook"
4. Configure:
   - **Payload URL**: `http://your-domain:5000/github`
   - **Content type**: `application/json`
   - **Secret**: Your webhook secret from `.env`
   - **Events**: Select "Pushes" and "Pull requests"

### Quick Manual Tests

```bash
# Test push event
curl -X POST http://localhost:5000/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -d '{"ref":"refs/heads/main","head_commit":{"id":"test123","author":{"name":"Test User"},"timestamp":"2025-07-02T01:00:00Z"}}'
```
```bash
# Test pull request
curl -X POST http://localhost:5000/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{"action":"opened","pull_request":{"id":123,"user":{"login":"testuser"},"head":{"ref":"feature-branch"},"base":{"ref":"main"},"created_at":"2025-07-02T01:00:00Z"}}'
```


##  Project Structure

```
webhook-repo/
├── backend/                  # Flask backend application
│   ├── app.py                # Main Flask application
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Styles with Tailwind
│   ├── public/               # Static files
│   └── package.json          # Node.js dependencies
├── docker-compose.yml        # Docker services configuration
├── Dockerfile.backend        # Backend Docker image
├── Dockerfile.frontend       # Frontend Docker image
├── nginx.conf                # Nginx configuration
├── mongo-init.js             # MongoDB initialization
└── README.md                 # This file
```

##  API Endpoints

### Webhook Endpoint
- **POST** `/github` - Receives GitHub webhook events
- **Headers Required**: `X-GitHub-Event`

### Data Endpoints
- **GET** `/events` - Retrieve all webhook events
- **GET** `/health` - Health check endpoint

### Response Format

```json
{
  "_id": "ObjectId",
  "request_id": "commit-hash-or-pr-id",
  "author": "github-username",
  "action": "PUSH|PULL_REQUEST|MERGE",
  "from_branch": "source-branch",
  "to_branch": "target-branch",
  "timestamp": "2023-01-01 12:00:00 UTC"
}
```

##  Security Features

- **CORS Protection**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: All webhook payloads are validated

##  Deployment Options

### Development Environment

```bash
# Start in development mode
docker-compose up

# Or run services separately
# MongoDB
docker run -d -p 27017:27017 mongo:7.0

# Backend
cd backend && python app.py

# Frontend
cd frontend && npm start
```

### Production Environment

1. Update environment variables for production
2. Configure proper domain and SSL
3. Set up reverse proxy (nginx recommended)
4. Configure MongoDB with authentication
5. Set up monitoring and logging

##  Features in Detail

### Dark/Light Theme
- Default dark theme for better developer experience
- Toggle button in the header
- Persistent theme selection
- Smooth transitions

### Real-time Updates
- Automatic polling every 15 seconds
- Visual feedback for last update time
- Loading states and error handling

### Responsive Design
- Mobile-first approach
- Works on all screen sizes
- Touch-friendly interface

### Data Visualization
- Color-coded event types
- Branch name highlighting
- Timestamp formatting
- Author attribution

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify MongoDB credentials

2. **Webhook Not Receiving Events**
   - Check GitHub webhook configuration
   - Verify webhook secret matches
   - Ensure endpoint is publicly accessible

3. **Frontend Not Loading**
   - Check if backend is running
   - Verify API endpoints are accessible
   - Check browser console for errors

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Follow logs in real-time
docker-compose logs -f
```

##  Support

For issues and questions:
1. Check the troubleshooting section
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Include logs and error messages