FROM node:22-alpine

ARG UI_PORT=5001

WORKDIR /app
COPY . .
RUN npm install

# EXPOSE here is really just for documentation purposes - doesn't actually do anything
EXPOSE ${UI_PORT}

CMD ["npm", "run", "dev"]
