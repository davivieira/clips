FROM node:alpine

WORKDIR /usr/app

RUN npm install -g @angular/cli

COPY ./package.json ./

RUN npm install

COPY ./ ./

CMD ["npm", "start"]