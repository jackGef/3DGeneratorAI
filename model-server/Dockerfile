# syntax=docker/dockerfile:1.6
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=300 \
    PIP_RETRIES=20

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --timeout 300 --retries 20 -r requirements.txt

COPY app.py ./

ENV ASSETS_DIR=/data/assets \
    HF_HOME=/cache/huggingface
RUN mkdir -p ${ASSETS_DIR} ${HF_HOME}

EXPOSE 5000
CMD ["python", "app.py"]
