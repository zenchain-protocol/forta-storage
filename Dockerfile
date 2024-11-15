FROM node:20-alpine as build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
ARG INSTALL_DEV=false  # Argument to control whether to install dev dependencies
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/package*.json ./
COPY --from=build /usr/src/app/dist ./dist
RUN if [ "$INSTALL_DEV" = "true" ]; then \
      npm install; \
      npm install -g jest; \
    else \
      npm ci --only=production; \
    fi
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 8080
CMD ["node", "dist/index.js"]