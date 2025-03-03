FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g ts-node-dev --save-dev
RUN npm install

COPY . .

CMD ["npm", "run", "start"] 