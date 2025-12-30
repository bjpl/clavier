#!/bin/bash

# Clavier Production Deployment Script
# This script automates the deployment process for Clavier

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${PROJECT_ROOT}/backups"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if running in project root
    if [ ! -f "${PROJECT_ROOT}/package.json" ]; then
        log_error "package.json not found. Are you in the project root?"
        exit 1
    fi

    # Check Node.js version
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js version 18 or higher is required"
        exit 1
    fi

    # Check if .env.production exists
    if [ ! -f "${PROJECT_ROOT}/.env.production" ]; then
        log_warn ".env.production not found"
        echo "Would you like to create it from .env.production.example? (y/n)"
        read -r response
        if [ "$response" = "y" ]; then
            cp "${PROJECT_ROOT}/.env.production.example" "${PROJECT_ROOT}/.env.production"
            log_info "Created .env.production. Please edit it with your values."
            exit 0
        else
            log_error "Deployment cannot proceed without .env.production"
            exit 1
        fi
    fi
}

create_backup() {
    log_info "Creating backup..."

    mkdir -p "$BACKUP_DIR"
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)

    # Backup environment file
    if [ -f "${PROJECT_ROOT}/.env.production" ]; then
        cp "${PROJECT_ROOT}/.env.production" "${BACKUP_DIR}/.env.production.${BACKUP_DATE}"
        log_info "Environment file backed up"
    fi

    # Backup database if DATABASE_URL is set
    if [ -n "${DATABASE_URL:-}" ]; then
        log_info "Backing up database..."
        pg_dump "$DATABASE_URL" > "${BACKUP_DIR}/database_${BACKUP_DATE}.sql" || log_warn "Database backup failed"
    fi
}

run_tests() {
    log_info "Running tests..."

    cd "$PROJECT_ROOT"

    # Type checking
    npm run typecheck || {
        log_error "Type checking failed"
        exit 1
    }

    # Linting
    npm run lint || {
        log_warn "Linting issues found (continuing anyway)"
    }

    # Tests
    npm test || {
        log_error "Tests failed"
        exit 1
    }

    log_info "All tests passed ✓"
}

build_application() {
    log_info "Building application..."

    cd "$PROJECT_ROOT"

    # Clean previous build
    rm -rf .next

    # Generate Prisma Client
    npx prisma generate

    # Build
    npm run build || {
        log_error "Build failed"
        exit 1
    }

    log_info "Build completed ✓"
}

deploy_vercel() {
    log_info "Deploying to Vercel..."

    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Install with: npm install -g vercel"
        exit 1
    fi

    cd "$PROJECT_ROOT"

    # Deploy to production
    vercel --prod || {
        log_error "Vercel deployment failed"
        exit 1
    }

    log_info "Deployed to Vercel ✓"
}

deploy_docker() {
    log_info "Deploying with Docker..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    cd "$PROJECT_ROOT"

    # Build image
    docker build -t clavier:latest . || {
        log_error "Docker build failed"
        exit 1
    }

    # Stop existing containers
    docker-compose down || true

    # Start new containers
    docker-compose up -d || {
        log_error "Docker Compose failed"
        exit 1
    }

    # Run migrations
    sleep 5  # Wait for database to be ready
    docker-compose exec -T app npx prisma migrate deploy || {
        log_error "Database migration failed"
        exit 1
    }

    log_info "Deployed with Docker ✓"
}

run_migrations() {
    log_info "Running database migrations..."

    cd "$PROJECT_ROOT"

    npx prisma migrate deploy || {
        log_error "Migration failed"
        exit 1
    }

    log_info "Migrations completed ✓"
}

verify_deployment() {
    log_info "Verifying deployment..."

    # Wait a bit for services to start
    sleep 5

    # Check health endpoint
    if [ -n "${NEXTAUTH_URL:-}" ]; then
        HEALTH_URL="${NEXTAUTH_URL}/api/health"

        for i in {1..5}; do
            if curl -f "$HEALTH_URL" &> /dev/null; then
                log_info "Health check passed ✓"
                return 0
            fi
            log_warn "Health check attempt $i failed, retrying..."
            sleep 5
        done

        log_error "Health check failed after 5 attempts"
        return 1
    else
        log_warn "NEXTAUTH_URL not set, skipping health check"
    fi
}

# Main deployment flow
main() {
    echo "================================"
    echo "  Clavier Deployment Script"
    echo "================================"
    echo ""

    # Check deployment type
    if [ "${1:-}" = "vercel" ]; then
        DEPLOY_TYPE="vercel"
    elif [ "${1:-}" = "docker" ]; then
        DEPLOY_TYPE="docker"
    else
        echo "Usage: $0 [vercel|docker]"
        exit 1
    fi

    log_info "Deployment type: $DEPLOY_TYPE"
    echo ""

    # Load environment variables
    if [ -f "${PROJECT_ROOT}/.env.production" ]; then
        set -a
        source "${PROJECT_ROOT}/.env.production"
        set +a
    fi

    # Execute deployment steps
    check_prerequisites
    create_backup

    if [ "${SKIP_TESTS:-}" != "true" ]; then
        run_tests
    else
        log_warn "Skipping tests (SKIP_TESTS=true)"
    fi

    if [ "$DEPLOY_TYPE" = "vercel" ]; then
        build_application
        deploy_vercel
        run_migrations
    else
        deploy_docker
    fi

    verify_deployment

    echo ""
    log_info "Deployment completed successfully! 🎉"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your application: ${NEXTAUTH_URL:-http://localhost:3000}"
    echo "  2. Check logs: ${DEPLOY_TYPE} logs"
    echo "  3. Monitor health: ${NEXTAUTH_URL:-http://localhost:3000}/api/health"
    echo ""
}

# Run main function
main "$@"
