FROM node:21-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the port (make sure this matches your .env PORT, default 5000)
EXPOSE 3000

# Start the server
CMD ["npm", "run", "dev"]