# Use official Node.js LTS Alpine image (small and fast)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy dependency manifests first (Docker layer caching — faster rebuilds)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Prisma schema and generate the client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the server source code
COPY . .

# Expose the port Express listens on
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]