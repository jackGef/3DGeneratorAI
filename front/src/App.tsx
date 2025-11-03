import React, { useState } from 'react';
import Chat from './pages/Chat';
import ModelViewer2 from './components/ModelViewer2';
import Home from './pages2/Home';

export default function App() {
  const [asset, setAsset] = useState<null | { id: string; prompt: string; files: Record<string, string> }>(null);

  return (
    <div>
      <Home user={{id: "1", name: "JackGefner", email: "jackgefner@gmail.com"}}
      currentTheme='Black'
      changeTheme={(theme) => console.log("Theme changed to:", theme) }/>
    </div>
    // <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', height: '100vh' }}>
    //   <div style={{ borderRight: '1px solid #ddd', padding: 16 }}>
    //     <h2>Text‑to‑3D Chat</h2>
    //     <Chat onResult={setAsset} />        
    //     {asset && (
    //       <div style={{ marginTop: 12 }}>
    //         <h4>Downloads</h4>
    //         <ul>
    //           <li><a href={asset.files.glb} download>GLB</a></li>
    //           <li><a href={asset.files.obj} download>OBJ</a> &middot; <a href={asset.files.mtl} download>MTL</a></li>
    //           <li><a href={asset.files.ply} download>PLY</a></li>
    //         </ul>
    //       </div>
    //     )}
    //   </div>
    //   <div style={{ position: 'relative' }}>
    //     {asset ? (
    //       <ModelViewer2 
    //         src={`/data/assets/${asset.id}/mesh.glb`} 
    //         autoRotate={true} 
    //         background="#1a1a1a"
    //         height={600} />
    //       // <p>{JSON.stringify(asset.files)}</p>
    //     ) : (
    //       <div style={{ padding: 24 }}>Generate an object to preview it here.</div>
    //     )}
    //   </div>
    // </div>
  );
}