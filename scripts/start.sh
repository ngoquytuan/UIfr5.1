#!/bin/bash

# FR-05.1 ChatUI Start Script
# This script helps start the ChatUI application in different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Default values
MODE="development"
SKIP_BUILD=false
DOCKER_BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --docker)
            DOCKER_BUILD=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -m, --mode MODE      Set the mode (development|production|docker) [default: development]"
            echo "  --skip-build        Skip the build process"
            echo "  --docker            Build and run with Docker"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option $1"
            exit 1
            ;;
    esac
done

print_status "Starting FR-05.1 ChatUI in $MODE mode..."

# Check if required files exist
if [[ ! -f "package.json" ]]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Create .env.local from .env.example if it doesn't exist
if [[ ! -f ".env.local" && -f ".env.example" ]]; then
    print_warning ".env.local not found. Creating from .env.example..."
    cp .env.example .env.local
    print_success "Created .env.local from .env.example"
fi

# Docker mode
if [[ "$DOCKER_BUILD" == true || "$MODE" == "docker" ]]; then
    print_status "Building and running with Docker..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
    
    # Build and run with docker-compose
    docker-compose down
    docker-compose build
    docker-compose up -d
    
    print_success "ChatUI is running with Docker!"
    print_status "Access the application at: http://localhost:3000"
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
    
    exit 0
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed or not in PATH"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [[ ! -d "node_modules" ]]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

# Development mode
if [[ "$MODE" == "development" ]]; then
    print_status "Starting development server..."
    npm run dev
    
# Production mode
elif [[ "$MODE" == "production" ]]; then
    # Build the application if not skipping
    if [[ "$SKIP_BUILD" == false ]]; then
        print_status "Building application for production..."
        npm run build
        print_success "Build completed"
    fi
    
    print_status "Starting production server..."
    npm start
    
else
    print_error "Unknown mode: $MODE"
    print_status "Valid modes: development, production, docker"
    exit 1
fi