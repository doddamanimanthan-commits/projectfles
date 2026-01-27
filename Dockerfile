# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Install all dependencies
RUN npm install

# Copy source code
COPY client ./client
COPY server ./server
COPY shared ./shared
COPY script ./script

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built assets and necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
