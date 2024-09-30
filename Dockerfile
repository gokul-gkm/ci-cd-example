# Use a more recent Node.js image to ensure compatibility with npm
FROM node:latest

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm ci for consistency
RUN npm ci

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3333

# Start the application
CMD ["npm", "run", "start:prod"]
