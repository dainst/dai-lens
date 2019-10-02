FROM node:10.13.0 AS builder

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY gulpfile* ./
COPY lens.scss ./
COPY boot.js ./


RUN npm install
RUN npm install -g gulp
RUN npm install gulp
COPY . .
RUN ls
RUN gulp

# If you are building your code for production
# RUN npm ci --only=production

FROM nginx:alpine

COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html/

#Heroku runs docker apps a a non-root user. Add and use a user
# RUN adduser myuser
# USER myuser

# Bundle app source
# COPY . .

# CMD ["serve", "./dist"]
# CMD [ "node", "server"]
CMD ["nginx", "-g", "daemon off;"]