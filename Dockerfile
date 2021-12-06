FROM node:14-alpine
WORKDIR /app
ADD package* /app
RUN npm install
ADD . /app
CMD npm run start