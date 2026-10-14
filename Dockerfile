FROM node:20-alpine
WORKDIR /app
COPY dist ./dist
COPY api ./api
COPY server.js ./
EXPOSE 8080
CMD ["node", "server.js"]
