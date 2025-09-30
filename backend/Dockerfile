FROM node:18-alpine  
# Alpine Linux = a very small Linux distribution


# It sets the working directory inside the container to /app.
# If the directory /app does not exist, Docker will create it automatically.
# Any following instructions in the Dockerfile (like COPY, RUN, CMD, etc.) will run relative to this directory
WORKDIR /app


# ./ (dot slash) In the container, this refers to the current working directory
# that means ./ points to /app inside the container.

# The * is a wildcard (shell-style pattern).
# It matches any file starting with package and ending with .json.
# Typically matches: package.json , package-lock.json

COPY package*.json ./



# RUN npm install --production   /    --omit=dev
# By default, npm install installs both:
# dependencies (needed to run your app in production)
# devDependencies (used for development, e.g. testing, linting, build tools)
# --production flag tells npm:
# 👉 Install only dependencies, skip devDependencies.This is useful in Docker containers because
# You don’t need dev tools like jest, eslint, etc. in production. Image becomes smaller and faster to build/run.

RUN npm install --production  


# first dot is local working directory and second dot is container working directory
COPY . .


# Inside the container, your application will listen on port 5000.
# To make that port accessible from outside the container, you must use the -p (publish) flag when running the container
EXPOSE 5000

# exec form. -> Docker runs this directly, without going through a shell.
# ENTRYPOINT can only have one main command.
CMD ["npm", "run", "start"]