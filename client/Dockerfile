FROM node:20
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite dev server port
EXPOSE 5173

# --host flag lets the container's Vite be reachable from your browser
CMD ["npm", "run", "dev", "--", "--host"]