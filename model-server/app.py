from flask import send_from_directory

import os
import uuid
from flask import Flask, request, jsonify
import torch
from diffusers import ShapEPipeline
from diffusers.utils import export_to_ply, export_to_obj
import trimesh

from dotenv import load_dotenv
load_dotenv()


ASSETS_DIR = os.environ.get("ASSETS_DIR", "./data/assets")
GUIDANCE_DEFAULT = float(os.environ.get("GUIDANCE_DEFAULT", 15.0))
STEPS_DEFAULT = int(os.environ.get("STEPS_DEFAULT", 64))
FRAME_DEFAULT = int(os.environ.get("FRAME_DEFAULT", 256))

app = Flask(__name__)

# Load pipeline once on startup
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_dtype = torch.float16 if _device.type == 'cuda' else torch.float32
print(f"[model-server] Using device={_device}, dtype={_dtype}")

if _device.type == 'cuda':
    pipe = ShapEPipeline.from_pretrained("openai/shap-e", torch_dtype=_dtype, variant="fp16").to(_device)
else:
    pipe = ShapEPipeline.from_pretrained("openai/shap-e").to(_device)

# Securely serve asset files
@app.get("/data/assets/<obj_id>/<path:filename>")
def get_asset(obj_id, filename):
    safe_dir = os.path.abspath(os.path.join(ASSETS_DIR, obj_id))
    base = os.path.abspath(ASSETS_DIR)
    if not safe_dir.startswith(base):
        return jsonify({"error": "Invalid path"}), 400
    return send_from_directory(safe_dir, filename, as_attachment=False)

@app.get('/health')
def health():
    return jsonify({"ok": True, "device": str(_device)})

@app.post('/generate3D')
def generate3D():
    data = request.get_json(force=True)
    prompt = data.get('prompt')
    if not prompt or not isinstance(prompt, str):
        return jsonify({"error": "Missing prompt"}), 400
    
    if len(prompt) > 500:
        return jsonify({"error": "Prompt too long (max 500 characters)"}), 400

    guidance_scale = float(data.get('guidanceScale', GUIDANCE_DEFAULT))
    steps = int(data.get('steps', STEPS_DEFAULT))
    frame_size = int(data.get('frameSize', FRAME_DEFAULT))
    
    # Validate parameters to prevent abuse
    if not (1.0 <= guidance_scale <= 50.0):
        return jsonify({"error": "guidanceScale must be between 1.0 and 50.0"}), 400
    if not (16 <= steps <= 128):
        return jsonify({"error": "steps must be between 16 and 128"}), 400
    if frame_size not in [64, 128, 256, 512]:
        return jsonify({"error": "frameSize must be 64, 128, 256, or 512"}), 400

    # Output directory
    obj_id = str(uuid.uuid4())
    out_dir = os.path.join(ASSETS_DIR, obj_id)
    os.makedirs(out_dir, exist_ok=True)

    # Run pipeline for mesh output
    images = pipe(
        prompt,
        guidance_scale=guidance_scale,
        num_inference_steps=steps,
        frame_size=frame_size,
        output_type="mesh",
    ).images

    mesh_data = images[0]

    # Export to .ply
    ply_path = os.path.join(out_dir, "mesh.ply")
    export_to_ply(mesh_data, ply_path)

    # Export to .obj
    obj_path = os.path.join(out_dir, "mesh.obj")
    export_to_obj(mesh_data, obj_path)

    # Ensure .mtl exists
    mtl_path = os.path.join(out_dir, "mesh.mtl")
    if not os.path.exists(mtl_path):
        with open(mtl_path, 'w', encoding='utf-8') as f:
            f.write('# Minimal MTL generated\nnewmtl default\nKd 0.8 0.8 0.8\n')

    # Convert PLY to GLB for web viewer
    glb_path = os.path.join(out_dir, "mesh.glb")
    try:
        mesh = trimesh.load(ply_path)
        mesh.export(glb_path, file_type="glb")
        print(f"[model-server] Successfully exported GLB for {obj_id}")
    except Exception as e:
        print(f'[ERROR] GLB export failed for {obj_id}:', e)

        # Clean up partial files
        import shutil
        shutil.rmtree(out_dir, ignore_errors=True)
        return jsonify({"error": "Failed to generate 3D model", "details": str(e)}), 500

    return jsonify({ "id": obj_id })

if __name__ == '__main__':
    print("[model-server] Starting Flask server...")
    print("[model-server] 3D generation endpoint: POST /generate3D")
    app.run(host='0.0.0.0', port=5000)