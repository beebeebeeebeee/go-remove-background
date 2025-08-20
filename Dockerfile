# Frontend build stage
FROM node:24-alpine as frontend-builder

ARG BASE_URL

WORKDIR /app/frontend
COPY app/frontend/package.json app/frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY app/frontend/ ./
RUN yarn build --base=${BASE_URL}

# Go build stage
FROM golang:1.24.5-bullseye as go-builder

ENV GO111MODULE=on

WORKDIR /microservice
COPY . .

# Copy the built frontend from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./app/frontend/dist

RUN go mod download
RUN go build -o main ./cmd/app/main.go

# Runtime stage
FROM ubuntu:22.04

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /microservice

# Copy the built Go binary
COPY --from=go-builder /microservice/main .

# Copy the built frontend
COPY --from=go-builder /microservice/app/frontend/dist ./app/frontend/dist

# Copy the start script
COPY --from=go-builder /microservice/scripts/start_service.sh .
RUN chmod a+x ./start_service.sh

EXPOSE 8080

ENTRYPOINT ["./start_service.sh"]
