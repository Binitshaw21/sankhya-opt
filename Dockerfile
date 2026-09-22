FROM node:22-alpine AS frontend

WORKDIR /app/ui
COPY ui/package.json ui/package-lock.json ./
RUN npm ci
COPY ui/ ./
RUN npm run build

FROM python:3.12-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY api/ ./api/
COPY core/ ./core/
COPY parsers/ ./parsers/
COPY --from=frontend /app/ui/dist ./ui/dist

EXPOSE 10000
CMD ["sh", "-c", "uvicorn api.gateway:app --host 0.0.0.0 --port ${PORT:-10000}"]