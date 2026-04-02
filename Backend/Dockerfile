FROM golang:1.24-alpine AS builder

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o loreforge ./cmd/server/main.go

FROM alpine:3.19

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

RUN apk --no-cache add ca-certificates

WORKDIR /app

COPY --from=builder /app/loreforge .

RUN mkdir -p data

EXPOSE 8080

CMD ["./loreforge"]
