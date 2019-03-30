FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
ENV GOOGLE_APPLICATION_CREDENTIALS=/usr/src/app/key.json

ENTRYPOINT ["npm", "start"]