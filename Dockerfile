FROM node:12

WORKDIR /usr/src/app

COPY package.json ./package.json
RUN yarn install

COPY ./ .

# Verify that we have expected things here
RUN ls -la

CMD ["yarn", "start"]
