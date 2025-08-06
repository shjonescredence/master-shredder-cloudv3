# Credo Assistant - Company Deployment Guide

## Prerequisites
- Docker Desktop installed
- OpenAI API key

## Quick Start
1. Clone the repository
2. Configure `.env` file with your OpenAI API key
3. Run `docker-compose up -d`
4. Access at: http://localhost:8080

## Commands
- **Start:** `docker-compose up -d`
- **Stop:** `docker-compose down`
- **View logs:** `docker-compose logs -f credo-assistant`
- **Update:** `docker-compose pull && docker-compose up -d`

## Container Configuration

- **Image:** Python 3.11-slim
- **Exposed Port:** 8080 (configurable in docker-compose.yml)
- **Volumes:** Uploads and temp directories
- **Health check:** http://localhost:8080/health
- **SSL:** Add nginx service (commented in docker-compose.yml)