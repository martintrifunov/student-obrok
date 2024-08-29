#!/bin/bash

# Check if the required argument is passed
if [ -z "$1" ]; then
  echo "Usage: ./init.sh [dev|prod|ssl]"
  exit 1
fi

# Check the argument passed and execute the corresponding block
if [ "$1" == "dev" ]; then
  # Run the development Docker Compose commands
  if docker compose -f docker-compose-dev.yml ps | grep 'Up'; then
    echo "Docker Compose (dev) is running. Bringing it down..."
    docker compose -f docker-compose-dev.yml down
  else
    echo "Docker Compose (dev) is not running. Starting it up..."
    docker compose -f docker-compose-dev.yml up --build
  fi

elif [ "$1" == "prod" ]; then
  # Run the production Docker Compose commands
  if docker compose -f docker-compose-prod.yml ps | grep 'Up'; then
    echo "Docker Compose (prod) is running. Bringing it down..."
    docker compose -f docker-compose-prod.yml down
  else
    echo "Docker Compose (prod) is not running. Starting it up..."
    docker compose -f docker-compose-prod.yml up --build -d
  fi

elif [ "$1" == "ssl" ]; then
  # Run the ssl Docker Compose commands
  if docker compose -f docker-compose-ssl.yml ps | grep 'Up'; then
    echo "Docker Compose (ssl) is running. Bringing it down..."
    docker compose -f docker-compose-ssl.yml down
  else
    echo "Docker Compose (ssl) is not running. Starting it up..."
    docker compose -f docker-compose-ssl.yml up --build
  fi

else
  echo "Invalid argument. Use 'dev', 'prod' or 'ssl'."
  exit 1
fi
