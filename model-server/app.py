from flask import send_from_directory

import os
import uuid
from flask import Flask, request, jsonify
import torch
from diffusers import ShapEPipeline
from diffusers.utils import export_to_ply, export_to_obj
import trimesh

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

from huggingface_hub import InferenceClient

from dotenv import load_dotenv
load_dotenv()


# Initialize tokenizer and model
model_name = 'google/flan-ul2'
toeknizer = AutoTokenizer.from_pretrained(model_name)
text_model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Initialize Hugging Face variables
client = InferenceClient(token=os.environ.get("HUGGINGFACE_HUB_TOKEN"))
model_id = "gpt2"  # Changed to a stable, widely available model

prompt = "Translate the following English text to Hebrew: 'Hello, how are you?'"


ASSETS_DIR = os.environ.get("ASSETS_DIR", "./data/assets")
GUIDANCE_DEFAULT = float(os.environ.get("GUIDANCE_DEFAULT", 15.0))
STEPS_DEFAULT = int(os.environ.get("STEPS_DEFAULT", 64))
FRAME_DEFAULT = int(os.environ.get("FRAME_DEFAULT", 256))

app = Flask(__name__)

# Load pipeline once on startup
_device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
_dtype = torch.float16 if _device.type == 'cuda' else torch.float32
print(f"[model-server] Using device={_device}, dtype={_dtype}")

text_model = text_model.to(_device)

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

@app.post('/generateText')
def generateText():
   inputs = toeknizer(prompt, return_tensors="pt").to(_device)
   outputs_ids = text_model.generate(
       **inputs,
       max_length=64,
       num_beams=4,
       early_stopping=True,
       no_repeat_ngram_size=2
   )
   print(toeknizer.decode(outputs_ids[0], skip_special_tokens=True))

@app.post('/generate3D')
def generate3D():
    data = request.get_json(force=True)
    prompt = data.get('prompt')
    if not prompt or not isinstance(prompt, str):
        return jsonify({"error": "Missing prompt"}), 400

    guidance_scale = float(data.get('guidanceScale', GUIDANCE_DEFAULT))
    steps = int(data.get('steps', STEPS_DEFAULT))
    frame_size = int(data.get('frameSize', FRAME_DEFAULT))

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

    # Export to .obj (and write a tiny MTL placeholder if missing)
    obj_path = os.path.join(out_dir, "mesh.obj")
    export_to_obj(mesh_data, obj_path)

    # Ensure .mtl exists (OBJ loader expects it)
    mtl_path = os.path.join(out_dir, "mesh.mtl")
    if not os.path.exists(mtl_path):
        with open(mtl_path, 'w', encoding='utf-8') as f:
            f.write('# Minimal MTL generated\nnewmtl default\nKd 0.8 0.8 0.8\n')

    # Convert PLY to GLB for web viewer
    glb_path = os.path.join(out_dir, "mesh.glb")
    try:
        mesh = trimesh.load(ply_path)
        # Optional: rotate upright (Shap‑E may be bottom-up). Comment if not desired.
        # import numpy as np
        # rot = trimesh.transformations.rotation_matrix(-np.pi/2, [1,0,0])
        # mesh.apply_transform(rot)
        mesh.export(glb_path, file_type="glb")
    except Exception as e:
        print('[WARN] GLB export failed:', e)

    return jsonify({ "id": obj_id })

if __name__ == '__main__':
    print("[model-server] Starting Flask server...")
    print("[model-server] Text generation endpoint: POST /generateText")
    print("[model-server] 3D generation endpoint: POST /generate3D")
    app.run(host='0.0.0.0', port=5000)