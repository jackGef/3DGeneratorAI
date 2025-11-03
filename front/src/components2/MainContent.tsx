import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";

interface MainContentProps {
  user: {
    id: string;
    full_name?: string;
    email?: string;
  };
}

export default function MainContent({ user }: MainContentProps) {
  const suggestions = [
    "Help me write a professional email",
    "Explain quantum computing simply",
    "Create a workout plan for beginners",
    "Suggest ideas for a weekend project"
  ];

  return (
    <div className="main-inner">
      <div className="hero">
        <h1 className="hero__title">3D Genesis</h1>
        <div className="hero__subtitle">
          {user?.full_name ? `Welcome back, ${user.full_name.split(' ')[0]}!` : 'Welcome!'}
        </div>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card__title">Examples</div>
          <div className="card__body">"Create a medieval castle with multiple towers and a drawbridge"</div>
        </div>
        <div className="card">
          <div className="card__title">Capabilities</div>
          <div className="card__body">Generate detailed 3D model descriptions and specifications</div>
        </div>
        <div className="card">
          <div className="card__title">Limitations</div>
          <div className="card__body">May occasionally generate incorrect technical specifications</div>
        </div>
      </div>
      <div className="input-bar">
        <div className="input-shell">
          <input type="text" placeholder="Describe the 3D model you want to create..." />
          <button className="btn-send">
            <span className="btn-icon">→</span>
          </button>
        </div>
      </div>
      <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', marginTop: 12 }}>
        3D Genesis can make mistakes. Consider checking important information.
      </div>
    </div>
  );
}