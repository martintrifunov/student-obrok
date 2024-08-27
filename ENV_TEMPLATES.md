# ENV TEMPLATES

## Configuring ENV variables:

Create a .env file in the root directory of the project & in the /src/client directory. <br>

Add & configure every necessary ENV variable. <br>

For the root directory .env file you're gonna need:
- ACCESS_TOKEN_SECRET=123
- REFRESH_TOKEN_SECRET=123
- ADMIN_USERNAME=admin
- ADMIN_PASSWORD="123"
- DATABASE_URI=mongodb://admin:password@obrok_db:27017
- MONGO_INITDB_ROOT_USERNAME=admin
- MONGO_INITDB_ROOT_PASSWORD=password
- MONGO_INITDB_DATABASE=obrok
- CLIENT_ORIGIN=http://localhost:3500
- PORT=5000

If you want to configure SLL for HTTPS you're gonna need:
- CERTBOT_EMAIL="your-email@example.com

For the /src/client directory .env file:
- VITE_BASE_API_URL=http://localhost:5000/api
- VITE_OSRM_API_URL=http://localhost:5001/route/v1