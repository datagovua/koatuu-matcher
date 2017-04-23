FROM node:7-alpine

RUN apk update && \
    apk upgrade && \
    apk add tini

#RUN npm install yarn -g

WORKDIR /src

ENTRYPOINT ["/sbin/tini", "-g", "--"]

ENV PATH /src/node_modules/.bin:$PATH
