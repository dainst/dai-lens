FROM node:10.13.0

WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

#Heroku runs docker apps a a non-root user. Add and use a user
RUN adduser myuser
USER myuser

# Bundle app source
COPY . .

CMD [ "node", "server"]