# Use Node.js LTS as the base image
FROM node:22-slim AS base

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Run the build script
RUN npm run build

# Expose the application port
ENV PORT=8000
EXPOSE 8000

# Define the command to run the application
CMD ["node", "dist/server.js", "--dev"]
