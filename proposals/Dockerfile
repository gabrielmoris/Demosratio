FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g ts-node-dev --save-dev
RUN npm install

COPY . .

EXPOSE 3001


CMD ["npm", "run", "start"] 