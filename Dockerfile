FROM node:18-alpine
ARG ASSET_ROOT='\/Badapple2'
ENV ASSET_ROOT=$ASSET_ROOT
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000:5000

CMD ["npm", "run", "dev"]
