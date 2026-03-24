// src/pages/Register.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [glitching, setGlitching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength
  const getPasswordStrength = (pwd: string): 'WEAK' | 'OK' | 'STRONG' => {
    if (!pwd) return 'WEAK';
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    if (strength <= 1) return 'WEAK';
    if (strength === 2) return 'OK';
    return 'STRONG';
  };
  const strength = getPasswordStrength(password);

  // Scramble effect
  const [buttonText, setButtonText] = useState('Registrarse →');
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalText = 'Registrarse →';

  const scrambleText = () => {
    const chars =
      '!@#$%^&*()_+-=[]{}|;:,.<>?/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let iterations = 0;
    const maxIterations = 15;
    scrambleIntervalRef.current = setInterval(() => {
      let scrambled = '';
      for (let i = 0; i < originalText.length; i++) {
        if (i < iterations) {
          scrambled += originalText[i];
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      setButtonText(scrambled);
      iterations++;
      if (iterations > maxIterations) {
        clearInterval(scrambleIntervalRef.current!);
        setButtonText(originalText);
      }
    }, 30);
  };

  const stopScramble = () => {
    if (scrambleIntervalRef.current) {
      clearInterval(scrambleIntervalRef.current);
      setButtonText(originalText);
    }
  };

  // Particle explosion
  const handleClickExplosion = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const container = e.currentTarget.parentElement;
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const angle = (i / 12) * Math.PI * 2;
      const distance = 80;
      const tx = x + Math.cos(angle) * distance;
      const ty = y + Math.sin(angle) * distance;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      container?.appendChild(particle);
      setTimeout(() => {
        particle.remove();
      }, 700);
    }
  };

  // Mouse move for tilt and radial gradient
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      setMouse({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    const handleLeave = () => setMouse({ x: 0.5, y: 0.5 });
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  // Glitch periodic effect
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const tiltX = (mouse.y - 0.5) * -14;
  const tiltY = (mouse.x - 0.5) * 14;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    try {
      await register(email, password, confirmPassword);
      toast.success('Registro exitoso');
      navigate('/tasks');
    } catch (err: any) {
      toast.error(err.message || 'Error en el registro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .lr{min-height:100vh;background:#0a0a0f;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;perspective:1000px;}
        .lc{position:relative;width:100%;max-width:420px;margin:1rem;border-radius:28px;transform-style:preserve-3d;transition:transform .08s linear;animation:cardIn .9s cubic-bezier(.16,1,.3,1) both;}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(.93) rotateX(8deg)}to{opacity:1;transform:translateY(0) scale(1) rotateX(0)}}
        .cb{position:absolute;inset:-2px;border-radius:30px;z-index:0;overflow:hidden;}
        .cb::before{content:'';position:absolute;inset:-100%;background:conic-gradient(from 0deg,#ff006e,#8338ec,#3a86ff,#06ffa5,#ffbe0b,#ff006e);animation:rb 3s linear infinite;}
        @keyframes rb{to{transform:rotate(360deg)}}
        .ci{position:relative;z-index:1;background:#0f0f18;border-radius:27px;padding:2.5rem 2.2rem;overflow:hidden;}
        .ci::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--sx,50%) var(--sy,50%),rgba(131,56,236,.18) 0%,transparent 60%);pointer-events:none;border-radius:27px;}
        .la{text-align:center;margin-bottom:2.2rem;position:relative;z-index:2;animation:fu .6s .2s both;}
        .lb{display:inline-flex;align-items:center;gap:8px;background:rgba(131,56,236,.15);border:1px solid rgba(131,56,236,.3);border-radius:100px;padding:5px 14px 5px 8px;margin-bottom:1.2rem;}
        .ld{width:8px;height:8px;background:#06ffa5;border-radius:50%;animation:dp 2s ease-in-out infinite;box-shadow:0 0 8px #06ffa5;}
        @keyframes dp{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
        .lbt{font-size:.68rem;font-weight:500;color:rgba(131,56,236,.9);letter-spacing:.12em;text-transform:uppercase;}
        .gt{font-family:'Bebas Neue',sans-serif;font-size:3.2rem;letter-spacing:.04em;color:#fff;position:relative;display:block;line-height:1;margin-bottom:0.25rem;}
        .gt.gl::before,.gt.gl::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;}
        .gt.gl::before{color:#ff006e;clip-path:polygon(0 30%,100% 30%,100% 50%,0 50%);animation:g1 .4s steps(1) both;}
        .gt.gl::after{color:#3a86ff;clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%);animation:g2 .4s steps(1) both;}
        @keyframes g1{0%{transform:translateX(-4px) skewX(-2deg)}25%{transform:translateX(4px) skewX(2deg)}50%{transform:translateX(-2px)}75%{transform:translateX(2px) skewX(-1deg)}100%{transform:translateX(0)}}
        @keyframes g2{0%{transform:translateX(4px) skewX(2deg)}25%{transform:translateX(-4px)}50%{transform:translateX(3px) skewX(-2deg)}75%{transform:translateX(-1px)}100%{transform:translateX(0)}}
        .ls{display:block;font-size:.75rem;color:rgba(255,255,255,.3);letter-spacing:.15em;text-transform:uppercase;margin-top:.4rem;font-weight:300;}
        .fg{display:flex;flex-direction:column;gap:1rem;position:relative;z-index:2;animation:fu .6s .35s both;}
        .fw{position:relative;}
        .fl{display:flex;align-items:center;gap:6px;font-size:.68rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:.5rem;transition:color .3s;}
        .fld{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s;}
        .fw.active .fl{color:rgba(255,255,255,.85);}
        .fw.active .fld{background:#06ffa5;box-shadow:0 0 6px #06ffa5;}
        .fio{position:relative;border-radius:14px;}
        .fr{position:absolute;inset:-1.5px;border-radius:15px;opacity:0;overflow:hidden;transition:opacity .3s;z-index:0;}
        .fr::before{content:'';position:absolute;inset:-100%;background:conic-gradient(from 0deg,#ff006e,#8338ec,#3a86ff,#06ffa5,#ff006e);animation:rr 2s linear infinite;}
        @keyframes rr{to{transform:rotate(360deg)}}
        .fw.active .fr{opacity:1;}
        .fib{position:relative;z-index:1;border-radius:13px;background:#16161f;overflow:hidden;}
        .fib::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .4s;background:linear-gradient(135deg,rgba(131,56,236,.08),rgba(6,255,165,.04));}
        .fw.active .fib::before{opacity:1;}
        .fi-ic{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:rgba(255,255,255,.2);transition:color .3s,filter .3s;z-index:2;pointer-events:none;}
        .fw.active .fi-ic{color:#8338ec;filter:drop-shadow(0 0 4px #8338ec);}
        .fi{position:relative;z-index:2;width:100%;padding:.8rem 1rem .8rem 2.8rem;background:transparent;border:none;color:#fff;font-size:.875rem;font-family:'Outfit',sans-serif;font-weight:400;outline:none;caret-color:#06ffa5;}
        .fi::placeholder{color:rgba(255,255,255,.15);}
        .fs{position:absolute;bottom:0;left:0;width:0%;height:2px;background:linear-gradient(90deg,#8338ec,#06ffa5);border-radius:0 0 13px 13px;transition:width .4s cubic-bezier(.16,1,.3,1);z-index:3;box-shadow:0 0 8px rgba(6,255,165,.6);}
        .fw.active .fs{width:100%;}
        .pw-strength{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:.65rem;font-family:'JetBrains Mono',monospace;font-weight:600;letter-spacing:.05em;z-index:4;background:#16161f;padding:2px 6px;border-radius:20px;backdrop-filter:blur(2px);}
        .sw{position:relative;z-index:2;margin-top:1.6rem;animation:fu .6s .5s both;}
        .sb{width:100%;padding:.9rem;border:none;border-radius:14px;font-family:'Bebas Neue',sans-serif;font-size:1.15rem;letter-spacing:.12em;cursor:pointer;position:relative;overflow:hidden;color:#0a0a0f;background:transparent;transition:transform .2s,box-shadow .2s;}
        .sbb{position:absolute;inset:0;background:linear-gradient(135deg,#06ffa5 0%,#3a86ff 40%,#8338ec 70%,#ff006e 100%);background-size:300% 300%;animation:bs 4s ease infinite;border-radius:14px;transition:filter .2s;}
        @keyframes bs{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .sbg{position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}
        .sbs{position:absolute;top:0;left:-120%;width:80%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);animation:sw 3s ease-in-out infinite;}
        @keyframes sw{0%{left:-120%}40%{left:150%}100%{left:150%}}
        .sbt{position:relative;z-index:1;}
        .sb:hover{transform:translateY(-3px) scale(1.01);}
        .sb:hover .sbb{filter:brightness(1.1);}
        .sb:active{transform:translateY(0) scale(.99);}
        .sb:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .sg{position:absolute;inset:4px;border-radius:12px;background:linear-gradient(135deg,#06ffa5,#8338ec);filter:blur(16px);opacity:0;transition:opacity .3s;z-index:-1;}
        .sw:hover .sg{opacity:.55;}
        .lf{text-align:center;margin-top:1.4rem;font-size:.8rem;color:rgba(255,255,255,.25);position:relative;z-index:2;animation:fu .6s .65s both;}
        .lf a{color:#8338ec;text-decoration:none;font-weight:600;transition:color .2s,text-shadow .2s;}
        .lf a:hover{color:#06ffa5;text-shadow:0 0 10px rgba(6,255,165,.5);}
        .co{position:absolute;width:18px;height:18px;z-index:3;pointer-events:none;}
        .ctl{top:12px;left:12px;border-top:2px solid rgba(6,255,165,.5);border-left:2px solid rgba(6,255,165,.5);border-radius:4px 0 0 0;}
        .ctr{top:12px;right:12px;border-top:2px solid rgba(6,255,165,.5);border-right:2px solid rgba(6,255,165,.5);border-radius:0 4px 0 0;}
        .cbl{bottom:12px;left:12px;border-bottom:2px solid rgba(6,255,165,.5);border-left:2px solid rgba(6,255,165,.5);border-radius:0 0 0 4px;}
        .cbr{bottom:12px;right:12px;border-bottom:2px solid rgba(6,255,165,.5);border-right:2px solid rgba(6,255,165,.5);border-radius:0 0 4px 0;}
        .sep{display:flex;align-items:center;gap:10px;margin:1.4rem 0 0;position:relative;z-index:2;animation:fu .6s .45s both;}
        .sl{flex:1;height:1px;background:rgba(255,255,255,.07);}
        .st{font-size:.62rem;color:rgba(255,255,255,.2);letter-spacing:.1em;text-transform:uppercase;}
        .spin{animation:sp .7s linear infinite;display:inline-block;}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .particle{position:absolute;width:4px;height:4px;background:#fff;border-radius:50%;pointer-events:none;z-index:1000;animation:flyAway .7s forwards;}
        @keyframes flyAway{0%{transform:translate(0,0);opacity:.8}100%{transform:translate(var(--tx,50px),var(--ty,50px));opacity:0}}
      `}</style>
      <div className="lr">
        <div
          ref={cardRef}
          className="lc"
          style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }}
        >
          <div className="cb" />
          <div
            className="ci"
            style={{
              ['--sx' as any]: `${mouse.x * 100}%`,
              ['--sy' as any]: `${mouse.y * 100}%`,
            }}
          >
            <div className="co ctl" />
            <div className="co ctr" />
            <div className="co cbl" />
            <div className="co cbr" />
            <div className="la">
              <div className="lb">
                <div className="ld" />
                <span className="lbt">Sistema activo</span>
              </div>
              <div
                className={`gt${glitching ? ' gl' : ''}`}
                data-text="REGISTRAR"
              >
                REGISTRAR
              </div>
              <span className="ls">Crear nueva cuenta</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="fg">
                <div className={`fw${focused === 'email' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Correo electrónico
                  </label>
                  <div className="fio">
                    <div className="fr" />
                    <div className="fib">
                      <svg
                        className="fi-ic"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                      <input
                        type="email"
                        autoComplete="email"
                        required
                        className="fi"
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                      />
                      <div className="fs" />
                      <span
                        className="pw-strength"
                        style={{ color: 'rgba(255,255,255,.4)' }}
                      >
                        {email.length} chars
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`fw${focused === 'password' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Contraseña
                  </label>
                  <div className="fio">
                    <div className="fr" />
                    <div className="fib">
                      <svg
                        className="fi-ic"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                      <input
                        type="password"
                        autoComplete="new-password"
                        required
                        className="fi"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused('password')}
                        onBlur={() => setFocused(null)}
                      />
                      <div className="fs" />
                      <span
                        className="pw-strength"
                        style={{
                          color:
                            strength === 'WEAK'
                              ? '#ff006e'
                              : strength === 'OK'
                                ? '#ffbe0b'
                                : '#06ffa5',
                        }}
                      >
                        {strength}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`fw${focused === 'confirm' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Confirmar contraseña
                  </label>
                  <div className="fio">
                    <div className="fr" />
                    <div className="fib">
                      <svg
                        className="fi-ic"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                      <input
                        type="password"
                        autoComplete="new-password"
                        required
                        className="fi"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocused('confirm')}
                        onBlur={() => setFocused(null)}
                      />
                      <div className="fs" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="sep">
                <div className="sl" />
                <span className="st">Cifrado AES-256</span>
                <div className="sl" />
              </div>
              <div className="sw">
                <div className="sg" />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="sb"
                  onMouseEnter={scrambleText}
                  onMouseLeave={stopScramble}
                  onClick={handleClickExplosion}
                >
                  <div className="sbb" />
                  <div className="sbg" />
                  <div className="sbs" />
                  <span className="sbt">
                    {isLoading ? (
                      <svg
                        className="spin"
                        style={{ width: 22, height: 22 }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="40"
                          strokeDashoffset="10"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      buttonText
                    )}
                  </span>
                </button>
              </div>
            </form>
            <div className="lf">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
