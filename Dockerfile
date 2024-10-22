FROM node:18-alpine
ARG ASSET_ROOT='\/badapple2'
ENV ASSET_ROOT=$ASSET_ROOT
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5001

CMD ["npm", "run", "dev"]
