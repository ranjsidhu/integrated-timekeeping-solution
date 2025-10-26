FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG ADMIN_ROLE_NAME
ARG EMPLOYEE_ROLE_NAME
ARG RESOURCE_MANAGER_ROLE_NAME

ENV NEXT_TELEMETRY_DISABLED=1
ENV ADMIN_ROLE_NAME=$ADMIN_ROLE_NAME
ENV EMPLOYEE_ROLE_NAME=$EMPLOYEE_ROLE_NAME
ENV RESOURCE_MANAGER_ROLE_NAME=$RESOURCE_MANAGER_ROLE_NAME

RUN npx prisma generate --no-hints
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]