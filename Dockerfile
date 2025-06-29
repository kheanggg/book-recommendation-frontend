FROM node:18 

WORKDIR /app/frontend

# Copy package files and install dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Then copy the rest of the app
COPY . .

# Expose the development port (adjust if needed)
EXPOSE 3000

# Start the dev server (change to "start" or "next dev" if needed)
CMD ["npm", "run", "dev"]