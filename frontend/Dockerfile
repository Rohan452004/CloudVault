# we’re naming the stage build,Later, we can copy artifacts from this stage into another image
FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install


COPY . .


# Build arguments
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL   

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID


# EXPOSE 5173

# CMD ["npm", "run", "dev"]


RUN npm run build

# Serve with nginx
#--from=build means: “Copy files from that earlier stage named build

#/usr/share/nginx/html . This is the default web root directory that Nginx uses to serve files.

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html  

#/app/build is the directory where the built files are located in the build stage. where in 
# that stage we have npm run build 


# Optional: copy custom nginx conf to handle SPA routing + proxy api
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# Start Nginx inside the container and keep it in the foreground, so the container keeps running and serving files
# By default, Nginx tries to start as a background service (like on a normal Linux system).
# But in Docker:
# A container stops when its main process (PID 1) exits.
# If Nginx went into the background, PID 1 would exit → container shuts down immediately.
