FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Create directory for SQLite DB (Volume mount point)
RUN mkdir -p /data
# Environment variable for DB path (Adjust server.js to use this if set)
ENV DB_PATH=/data/golf_club_v11.db

EXPOSE 3000
CMD [ "node", "server.js" ]
