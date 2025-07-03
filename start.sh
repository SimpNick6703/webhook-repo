#!/bin/bash

# GitHub Webhook Logger - Startup Script
# This script helps you get the application running quickly

set -e

echo " GitHub Webhook Logger - Startup Script"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo " Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo " Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo " Creating environment file..."
    cp backend/.env.example backend/.env
    echo " Environment file created at backend/.env"
    echo " Please edit backend/.env with your webhook secret!"
fi

# Build and start the application
echo " Building Docker containers..."
docker-compose build

echo " Starting services..."
docker-compose up -d

# Wait for services to be ready
echo " Waiting for services to start..."
sleep 10

# Check service health
echo " Checking service health..."

# Check backend
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo " Backend is running at http://localhost:5000"
else
    echo " Backend is not responding"
fi

# Check frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo " Frontend is running at http://localhost:3000"
else
    echo " Frontend is not responding"
fi

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo " MongoDB is running"
else
    echo "  MongoDB might still be starting up"
fi

echo ""
echo " Application startup complete!"
echo ""
echo " Access Points:"
echo "   Web Interface: http://localhost:3000"
echo "   API Endpoint:  http://localhost:5000"
echo "   Health Check:  http://localhost:5000/health"
echo ""
echo " Next Steps:"
echo "   1. Edit backend/.env with your GitHub webhook secret"
echo "   2. Configure GitHub webhook to point to your endpoint"
echo "   3. Test by pushing to your repository"
echo ""
echo " Commands:"
echo "   View logs:     docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Run tests:     cd tests && python run_tests.py"
echo ""
