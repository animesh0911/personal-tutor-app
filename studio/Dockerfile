FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY studio ./studio
COPY content ./content
COPY lib/visual-math.js lib/visual-math.js
COPY components/learning/math-text.jsx components/learning/math-text.jsx
RUN npm run studio:build && npm prune --omit=dev

FROM node:24-bookworm-slim
ENV NODE_ENV=production STUDIO_HOST=0.0.0.0 STUDIO_PORT=4310 STUDIO_DATA_DIR=/data
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.studio-dist ./.studio-dist
COPY --from=build /app/studio/server ./studio/server
COPY --from=build /app/studio/shared ./studio/shared
COPY --from=build /app/studio/content ./studio/content
COPY --from=build /app/content ./content
COPY --from=build /app/lib/visual-math.js ./lib/visual-math.js
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 4310
CMD ["node", "studio/server/index.mjs"]
