# Student Obrok

Student Obrok is a web app that displays affordable student meal deals on an interactive map. It's your go-to guide for budget-friendly dining around your location. 🍽️🎓

## Setup Guide

### Configuring ENV variables:

Make sure to read the ENV_TEMPLATES.md

### Using docker (recommended):

Clone the project. <br>

Run the command:
```bash
#For development
docker compose -f docker-compose-dev.yml up --build
#For production
docker compose -f docker-compose-prod.yml up --build
```

### Without using docker (not recommended):

Clone the project. <br>

Setup a MongoDB database. <br>

You can find what ENVs you need in each of the docker compose files. <br>

Run the commands:
```bash
#Install dependencies for the client & server
cd src/client
npm install
cd ..
cd server
npm install
#CD into the client directory & run Vite
cd ..
cd client
npm run dev
#CD into the server directory & run nodemon
cd ..
cd server
npm run server
```