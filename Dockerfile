FROM node:12

WORKDIR /usr/src/app

COPY package.json ./package.json
COPY yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

# Verify that we have expected things here
RUN ls -la

CMD ["npm", "run", "live-reload"]
