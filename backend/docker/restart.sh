#!/bin/bash

echo "Restarting Milestone backend services..."
docker compose down
docker compose up -d

echo "Services restarted successfully!"
