FROM node:14-alpine
WORKDIR /app
ADD package* /app
RUN npm install
ADD . /app
RUN npm run build
CMD npm run start