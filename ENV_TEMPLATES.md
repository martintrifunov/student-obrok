# ENV TEMPLATES

## Configuring ENV variables:

Create a .env file in the root directory of the project & in the /src/client directory. <br>

Add & configure every necessary ENV variable. <br>

For the root directory .env file you're gonna need:
- ACCESS_TOKEN_SECRET
- REFRESH_TOKEN_SECRET
- ADMIN_USERNAME
- ADMIN_PASSWORD
- DATABASE_URI
- MONGO_INITDB_ROOT_USERNAME
- MONGO_INITDB_ROOT_PASSWORD
- MONGO_INITDB_DATABASE
- CLIENT_ORIGIN
- PORT

For the /src/client directory .env file:
- VITE_BASE_API_URL
- VITE_OSRM_API_URL