# syntax=docker/dockerfile:1.6
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=300 \
    PIP_RETRIES=20

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential git ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Python deps (robust) ----
COPY requirements.txt ./
# Upgrade pip + wheels helpers first (small, fast)
RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel
# Use a pip cache (helps when network blips) + retries + generous timeout
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir --timeout 300 --retries 20 -r requirements.txt

# App
COPY app.py ./

# Asset + cache dirs
ENV ASSETS_DIR=/data/assets \
    HF_HOME=/cache/huggingface
RUN mkdir -p ${ASSETS_DIR} ${HF_HOME}

# (Optional) Warm model cache — comment this block out if your network is flaky
# RUN python - <<'PY'
# from diffusers import ShapEPipeline
# ShapEPipeline.from_pretrained("openai/shap-e")
# print('Shap-E weights are available')
# PY

EXPOSE 5000
CMD ["python", "app.py"]
