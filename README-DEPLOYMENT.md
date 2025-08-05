# Credo Assistant - Company Deployment Guide

## Prerequisites
- Docker Desktop installed
- OpenAI API key

## Quick Start
1. Copy all files to your server/computer
2. Update `.env` file with your OpenAI API key
3. Run: `docker-compose up -d`
4. Access at: http://localhost:8000

## Commands
- **Start:** `docker-compose up -d`
- **Stop:** `docker-compose down`
- **View logs:** `docker-compose logs -f credo-assistant`
- **Update:** `docker-compose pull && docker-compose up -d`

## For IT Teams
- **Port:** 8000 (configurable in docker-compose.yml)
- **Volumes:** ./uploads (persistent file storage)
- **Health check:** http://localhost:8000/health
- **SSL:** Add nginx service (commented in docker-compose.yml)