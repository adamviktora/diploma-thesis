# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine

# Install development dependencies only for building TypeScript files
WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the source files into the image.
COPY . .

# Compile TypeScript code to JavaScript
RUN npm run build

# Use production dependencies only
RUN npm prune --omit=dev

# Set the command to run the application
CMD ["node", "dist/index.js"]

# Expose the port that the application listens on.
EXPOSE 3000
