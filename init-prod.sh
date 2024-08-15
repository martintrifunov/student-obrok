#!/bin/bash

# Check if the Docker Compose services are up
if docker compose -f docker-compose-prod.yml ps | grep 'Up'; then
  echo "Docker Compose is running. Bringing it down..."
  docker compose -f docker-compose-prod.yml down
else
  echo "Docker Compose is not running. Starting it up..."
  docker compose -f docker-compose-prod.yml up --build
fi
