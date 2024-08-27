#!/bin/bash

# Load environment variables from the .env file
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# Ensure EMAIL environment variable is set
if [ -z "$CERTBOT_EMAIL" ]; then
  echo "Error: CERTBOT_EMAIL environment variable is not set."
  exit 1
fi

# Function to obtain the SSL certificate using certbot
obtain_certificate() {
    docker compose -f docker-compose-prod.yml run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email "$CERTBOT_EMAIL" --agree-tos --no-eff-email -d obrok.net
}

# Function to reload Nginx
reload_nginx() {
    docker compose -f docker-compose-prod.yml exec nginx nginx -s reload
}

# Function to renew the SSL certificate and reload Nginx
renew_certificate() {
    docker compose -f docker-compose-prod.yml run --rm certbot renew
    reload_nginx
}

# Check command-line arguments
if [ "$1" == "obtain" ]; then
    obtain_certificate
elif [ "$1" == "renew" ]; then
    renew_certificate
else
    echo "Usage: $0 {obtain|renew}"
    echo "  obtain: Obtain the SSL certificate"
    echo "  renew: Renew the SSL certificate and reload Nginx"
fi
