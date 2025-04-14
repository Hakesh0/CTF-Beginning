# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed dependencies
RUN npm install

# Copy the rest of the application code from your host machine to the container
COPY . .

# Expose the port the app runs on
EXPOSE 9002

# Define the command to run your application
CMD ["npm", "run", "dev"]
