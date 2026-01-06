---
title: 3D Generator Model Server
emoji: 🎨
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: apache-2.0
---

# 3D Generator AI - Model Server

AI-powered 3D model generation from text using Shap-E by OpenAI.

## About

This space hosts the model server for the 3D Generator AI application. It provides API endpoints to generate 3D models (OBJ + MTL + texture) from text descriptions.

### Features
- Text-to-3D model generation using Shap-E
- Generates OBJ, MTL, and texture files
- RESTful API endpoints
- Persistent asset storage

## Usage

### Generate 3D Model

**Endpoint:** `POST /generate`

**Request Body:**
```json
{
  "prompt": "a red sports car",
  "chat_id": "unique-chat-id"
}
```

**Response:**
```json
{
  "success": true,
  "obj_path": "/assets/uuid/mesh.obj",
  "mtl_path": "/assets/uuid/mesh.mtl",
  "texture_path": "/assets/uuid/texture.png"
}
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

## Deployment Notes

- First run downloads ~2-3GB of model weights
- Free tier includes 16GB RAM (sufficient for Shap-E)
- Upgrade to GPU for faster generation (optional)
- Models are cached after first download

## Environment Variables

The following environment variables are automatically configured:
- `PORT=7860` (Hugging Face Spaces default)
- `ASSETS_DIR=/data/assets`
- `HF_HOME=/cache/huggingface`

## Related Links

- [Main Application Repository](https://github.com/jackGef/3DGeneratorAI)
- [OpenAI Shap-E](https://github.com/openai/shap-e)

---

Built with ❤️ using Shap-E, Flask, and PyTorch
