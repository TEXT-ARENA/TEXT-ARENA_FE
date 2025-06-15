// src/components/ConfettiEffect.jsx
import { useRef, useEffect } from "react";

export default function ConfettiEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        vx: (Math.random() - 0.5) * 7,
        vy: Math.random() * 3.5 + 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2,
        life: 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.009;

        if (p.life <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (particles.length > 0) requestAnimationFrame(animate);
    }
    animate();

    return () => (particles.length = 0);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ zIndex: 9999 }}
    />
  );
}

// 눈송이/낙엽처럼 천천히 흩날리는 파티컬 이펙트
export function PartyConfettiEffect() {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let running = true;
    const particles = [];
    const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6F91', '#FFB570', '#A66CFF'];

    function addParticles() {
      for (let i = 0; i < 2; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x: Math.random() * canvas.width,
          y: -20,
          vx: Math.sin(angle) * 0.7 + (Math.random() - 0.5) * 0.5,
          vy: Math.random() * 0.7 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          width: Math.random() * 10 + 8,
          height: Math.random() * 4 + 3,
          life: 1,
          swing: Math.random() * 2 * Math.PI,
          swingSpeed: Math.random() * 0.04 + 0.01,
          angle: Math.random() * Math.PI * 2,
          angleSpeed: (Math.random() - 0.5) * 0.04
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (particles.length < 40) addParticles();
      particles.forEach((p, idx) => {
        p.swing += p.swingSpeed;
        p.x += Math.sin(p.swing) * 1.2 + p.vx;
        p.y += p.vy;
        p.angle += p.angleSpeed;
        p.life -= 0.00012;
        if (p.life <= 0 || p.y > canvas.height + 20) {
          particles.splice(idx, 1);
          return;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
        ctx.restore();
      });
      if (running) animationRef.current = requestAnimationFrame(animate);
    }
    animate();
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ zIndex: 9999 }}
    />
  );
}
