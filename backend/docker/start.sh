#!/bin/bash

echo "Starting Milestone backend services (PostgreSQL & Redis)..."
docker compose up -d

echo "Services started successfully!"
echo "PostgreSQL: localhost:5432 (User: milestone_user, DB: milestone)"
echo "Redis:      localhost:6379"
