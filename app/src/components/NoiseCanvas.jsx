import { useEffect, useRef } from 'react';

const COLORS = ['#b71c1c', '#1a237e', '#1b5e20', '#f57f17', '#880e4f', '#4a148c', '#e65100', '#006064', '#e91e63', '#0d47a1'];

export default function NoiseCanvas({ chaos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (chaos < 8) return;
    const canvas = canvasRef.current;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');
      const lineCount = chaos >= 9 ? 200 : 120;
      for (let i = 0; i < lineCount; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.quadraticCurveTo(
          Math.random() * canvas.width, Math.random() * canvas.height,
          Math.random() * canvas.width, Math.random() * canvas.height
        );
        ctx.strokeStyle = COLORS[Math.floor(Math.random() * COLORS.length)];
        ctx.lineWidth = chaos >= 9 ? Math.random() * 1.8 + 0.4 : Math.random() * 1.2 + 0.3;
        ctx.globalAlpha = Math.random() * 0.7 + 0.2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    draw();
    const interval = setInterval(draw, 800);
    return () => {
      clearInterval(interval);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [chaos]);

  return <canvas id="noise-canvas" ref={canvasRef} />;
}
