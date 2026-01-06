# 3D Generator AI - Model Server

This is the AI model server for generating 3D models from text descriptions using Shap-E.

## Deploy to Hugging Face Spaces

This model server is designed to run on Hugging Face Spaces (free tier with 16GB RAM).

### Quick Deploy Steps:

1. **Go to Hugging Face**: https://huggingface.co/spaces
2. **Create New Space**:
   - Click "Create new Space"
   - Name: `3dgenerator-model-server` (or any name)
   - License: Apache 2.0
   - SDK: **Docker**
   - Hardware: CPU basic (free) - upgrade to GPU if needed later
   - Visibility: Public

3. **Upload Files**:
   Upload these files from the `model-server` folder:
   - `Dockerfile`
   - `app.py`
   - `requirements.txt`
   - `README.md` (this file)

4. **Wait for Build**: 
   - HF Spaces will automatically build and deploy
   - Takes 5-10 minutes for first deployment
   - Model weights download on first run (~2-3GB)

5. **Get Your URL**:
   - Your space URL will be: `https://YOUR_USERNAME-3dgenerator-model-server.hf.space`
   - Copy this URL

6. **Update Backend Environment Variable**:
   - In Render dashboard (backend service)
   - Set `MODEL_SERVER_URL` to your HF Space URL
   - Example: `https://jackgef-3dgenerator-model-server.hf.space`

## API Endpoints

### Health Check
```
GET /health
Response: {"status": "ok"}
```

### Generate 3D Model
```
POST /generate
Body: {
  "prompt": "a red sports car",
  "chat_id": "unique-id"
}
Response: {
  "success": true,
  "obj_path": "/assets/uuid/mesh.obj",
  "mtl_path": "/assets/uuid/mesh.mtl",
  "texture_path": "/assets/uuid/texture.png"
}
```

## Environment Variables

Set these in Hugging Face Space settings:

- `ASSETS_DIR=/data/assets` - Where to store generated models
- `HF_HOME=/cache/huggingface` - Hugging Face cache directory
- `PORT=7860` - Default port for HF Spaces

## Notes

- First generation takes longer (model download + initialization)
- Subsequent generations are faster
- Free tier includes 16GB RAM (sufficient for Shap-E)
- Can upgrade to GPU for faster generation ($9/month)
