FROM node:10.13.0 AS builder

WORKDIR /usr/src/app

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

FROM nginx:alpine

COPY default.conf.template /etc/nginx/conf.d/default.conf.template
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /usr/src/app/dist/ /usr/share/nginx/html/

CMD /bin/sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf" && nginx -g 'daemon off;'