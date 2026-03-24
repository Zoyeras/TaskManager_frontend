// src/pages/TaskEdit.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { tasksAPI } from '../services/api';
import { TaskUpdateRequest } from '../types';
import toast from 'react-hot-toast';

const TaskEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pendiente');
  const [priority, setPriority] = useState('Media');
  const [dueDate, setDueDate] = useState('');

  // Tilt & glitch states
  const [focused, setFocused] = useState<string | null>(null);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [glitching, setGlitching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Tilt effect
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

  // Periodic glitch effect
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const tiltX = (mouse.y - 0.5) * -14;
  const tiltY = (mouse.x - 0.5) * 14;

  // Fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await tasksAPI.getTask(Number(id));
        if (response.success && response.data) {
          const task = response.data;
          setTitle(task.title);
          setDescription(task.description || '');
          setStatus(task.status);
          setPriority(task.priority);
          setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
        } else {
          toast.error('No se pudo cargar la tarea');
          navigate('/tasks');
        }
      } catch (err) {
        toast.error('Error al cargar la tarea');
        navigate('/tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updateData: TaskUpdateRequest = {
      title: title !== '' ? title : undefined,
      description: description || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
    };

    try {
      const response = await tasksAPI.updateTask(Number(id), updateData);
      if (response.success) {
        toast.success('Tarea actualizada');
        navigate('/tasks');
      } else {
        toast.error(response.message || 'Error al actualizar');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="lr">
        <div className="lc" style={{ transform: 'none' }}>
          <div className="cb" />
          <div className="ci">
            <div className="la">
              <div className="lb">
                <div className="ld" />
                <span className="lbt">Cargando tarea</span>
              </div>
              <div className="gt" data-text="TASKMANAGER">
                TASKMANAGER
              </div>
              <span className="ls">Obteniendo datos...</span>
            </div>
            <div className="flex justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .lr{min-height:100vh;background:#0a0a0f;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;perspective:1000px;padding:1rem;}
        .lc{position:relative;width:100%;max-width:520px;margin:1rem;border-radius:28px;transform-style:preserve-3d;transition:transform .08s linear;animation:cardIn .9s cubic-bezier(.16,1,.3,1) both;}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(.93) rotateX(8deg)}to{opacity:1;transform:translateY(0) scale(1) rotateX(0)}}
        .cb{position:absolute;inset:-2px;border-radius:30px;z-index:0;overflow:hidden;}
        .cb::before{content:'';position:absolute;inset:-100%;background:conic-gradient(from 0deg,#ff006e,#8338ec,#3a86ff,#06ffa5,#ffbe0b,#ff006e);animation:rb 3s linear infinite;}
        @keyframes rb{to{transform:rotate(360deg)}}
        .ci{position:relative;z-index:1;background:#0f0f18;border-radius:27px;padding:2rem 2rem;overflow:hidden;}
        .ci::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--sx,50%) var(--sy,50%),rgba(131,56,236,.18) 0%,transparent 60%);pointer-events:none;border-radius:27px;}
        .la{text-align:center;margin-bottom:2rem;position:relative;z-index:2;animation:fu .6s .2s both;}
        .lb{display:flex;justify-content:center;align-items:center;gap:8px;background:rgba(131,56,236,.15);border:1px solid rgba(131,56,236,.3);border-radius:100px;padding:5px 14px 5px 8px;margin-bottom:1.2rem;width:fit-content;margin-left:auto;margin-right:auto;}
        .ld{width:8px;height:8px;background:#06ffa5;border-radius:50%;animation:dp 2s ease-in-out infinite;box-shadow:0 0 8px #06ffa5;}
        @keyframes dp{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
        .lbt{font-size:.68rem;font-weight:500;color:rgba(131,56,236,.9);letter-spacing:.12em;text-transform:uppercase;}
        .gt{font-family:'Bebas Neue',sans-serif;font-size:2.8rem;letter-spacing:.04em;color:#fff;position:relative;display:block;line-height:1.2;margin-bottom:0.5rem;}
        .gt.gl::before,.gt.gl::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;}
        .gt.gl::before{color:#ff006e;clip-path:polygon(0 30%,100% 30%,100% 50%,0 50%);animation:g1 .4s steps(1) both;}
        .gt.gl::after{color:#3a86ff;clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%);animation:g2 .4s steps(1) both;}
        @keyframes g1{0%{transform:translateX(-4px) skewX(-2deg)}25%{transform:translateX(4px) skewX(2deg)}50%{transform:translateX(-2px)}75%{transform:translateX(2px) skewX(-1deg)}100%{transform:translateX(0)}}
        @keyframes g2{0%{transform:translateX(4px) skewX(2deg)}25%{transform:translateX(-4px)}50%{transform:translateX(3px) skewX(-2deg)}75%{transform:translateX(-1px)}100%{transform:translateX(0)}}
        .ls{display:block;font-size:.75rem;color:rgba(255,255,255,.3);letter-spacing:.15em;text-transform:uppercase;margin-top:.4rem;font-weight:300;}
        .fg{display:flex;flex-direction:column;gap:1.2rem;position:relative;z-index:2;animation:fu .6s .35s both;}
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
        .fi, .fs-select, .fs-textarea{position:relative;z-index:2;width:100%;padding:.8rem 1rem .8rem 2.8rem;background:transparent;border:none;color:#fff;font-size:.875rem;font-family:'Outfit',sans-serif;font-weight:400;outline:none;caret-color:#06ffa5;}
        .fi::placeholder, .fs-select::placeholder, .fs-textarea::placeholder{color:rgba(255,255,255,.15);}
        .fs-textarea{padding-top:0.8rem;resize:vertical;min-height:90px;}
        .fs-select{padding:.8rem 1rem .8rem 2.8rem;cursor:pointer;appearance:none;background:transparent;}
        .fs-select option{background:#0f0f18;color:#fff;}
        .fs{position:absolute;bottom:0;left:0;width:0%;height:2px;background:linear-gradient(90deg,#8338ec,#06ffa5);border-radius:0 0 13px 13px;transition:width .4s cubic-bezier(.16,1,.3,1);z-index:3;box-shadow:0 0 8px rgba(6,255,165,.6);}
        .fw.active .fs{width:100%;}
        .sw{position:relative;z-index:2;margin-top:1.6rem;animation:fu .6s .5s both;display:flex;gap:1rem;justify-content:flex-end;}
        .sb, .sb-cancel{width:auto;min-width:120px;padding:.9rem 1.5rem;border:none;border-radius:14px;font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:.08em;cursor:pointer;position:relative;overflow:hidden;color:#0a0a0f;background:transparent;transition:transform .2s,box-shadow .2s;}
        .sb-cancel{background:rgba(255,255,255,0.05);color:#fff;border:1px solid rgba(255,255,255,0.15);}
        .sb-cancel:hover{transform:translateY(-2px);background:rgba(255,255,255,0.1);}
        .sbb{position:absolute;inset:0;background:linear-gradient(135deg,#06ffa5 0%,#3a86ff 40%,#8338ec 70%,#ff006e 100%);background-size:300% 300%;animation:bs 4s ease infinite;border-radius:14px;transition:filter .2s;}
        @keyframes bs{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .sbg{position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,.15) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}
        .sbs{position:absolute;top:0;left:-120%;width:80%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);transform:skewX(-20deg);animation:sw 3s ease-in-out infinite;}
        @keyframes sw{0%{left:-120%}40%{left:150%}100%{left:150%}}
        .sbt{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:8px;}
        .sb:hover{transform:translateY(-3px) scale(1.01);}
        .sb:hover .sbb{filter:brightness(1.1);}
        .sb:active{transform:translateY(0) scale(.99);}
        .sb:disabled,.sb-cancel:disabled{opacity:.5;cursor:not-allowed;transform:none;}
        .sg{position:absolute;inset:4px;border-radius:12px;background:linear-gradient(135deg,#06ffa5,#8338ec);filter:blur(16px);opacity:0;transition:opacity .3s;z-index:-1;}
        .sw:hover .sg{opacity:.55;}
        .lf{text-align:center;margin-top:1.8rem;font-size:.8rem;color:rgba(255,255,255,.25);position:relative;z-index:2;animation:fu .6s .65s both;}
        .lf a{color:#8338ec;text-decoration:none;font-weight:600;transition:color .2s,text-shadow .2s;}
        .lf a:hover{color:#06ffa5;text-shadow:0 0 10px rgba(6,255,165,.5);}
        .co{position:absolute;width:18px;height:18px;z-index:3;pointer-events:none;}
        .ctl{top:12px;left:12px;border-top:2px solid rgba(6,255,165,.5);border-left:2px solid rgba(6,255,165,.5);border-radius:4px 0 0 0;}
        .ctr{top:12px;right:12px;border-top:2px solid rgba(6,255,165,.5);border-right:2px solid rgba(6,255,165,.5);border-radius:0 4px 0 0;}
        .cbl{bottom:12px;left:12px;border-bottom:2px solid rgba(6,255,165,.5);border-left:2px solid rgba(6,255,165,.5);border-radius:0 0 0 4px;}
        .cbr{bottom:12px;right:12px;border-bottom:2px solid rgba(6,255,165,.5);border-right:2px solid rgba(6,255,165,.5);border-radius:0 0 4px 0;}
        .sep{display:flex;align-items:center;gap:10px;margin:1.2rem 0 0;position:relative;z-index:2;animation:fu .6s .45s both;}
        .sl{flex:1;height:1px;background:rgba(255,255,255,.07);}
        .st{font-size:.62rem;color:rgba(255,255,255,.2);letter-spacing:.1em;text-transform:uppercase;}
        .spin{animation:sp .7s linear infinite;display:inline-block;}
        @keyframes sp{to{transform:rotate(360deg)}}
        @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        /* custom for select arrow */
        .select-wrapper{position:relative;}
        .select-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:14px;height:14px;color:rgba(255,255,255,.3);pointer-events:none;z-index:3;}
        .fw.active .select-arrow{color:#8338ec;}
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
                <span className="lbt">Edición segura</span>
              </div>
              <div
                className={`gt${glitching ? ' gl' : ''}`}
                data-text="EDITAR TAREA"
              >
                EDITAR TAREA
              </div>
              <span className="ls">Modifica los datos de la tarea</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="fg">
                {/* Título */}
                <div className={`fw${focused === 'title' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Título *
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
                          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3.75v16.5"
                        />
                      </svg>
                      <input
                        type="text"
                        required
                        className="fi"
                        placeholder="Nombre de la tarea"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={() => setFocused('title')}
                        onBlur={() => setFocused(null)}
                      />
                      <div className="fs" />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div
                  className={`fw${focused === 'description' ? ' active' : ''}`}
                >
                  <label className="fl">
                    <span className="fld" />
                    Descripción
                  </label>
                  <div className="fio">
                    <div className="fr" />
                    <div className="fib">
                      <svg
                        className="fi-ic"
                        style={{ top: '1.2rem' }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <textarea
                        className="fs-textarea"
                        placeholder="Descripción (opcional)"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={() => setFocused('description')}
                        onBlur={() => setFocused(null)}
                      />
                      <div className="fs" />
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className={`fw${focused === 'status' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Estado
                  </label>
                  <div className="fio">
                    <div className="fr" />
                    <div className="fib select-wrapper">
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
                          d="M9.75 3.75L3.75 12l6 8.25M14.25 3.75L20.25 12l-6 8.25"
                        />
                      </svg>
                      <select
                        className="fs-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        onFocus={() => setFocused('status')}
                        onBlur={() => setFocused(null)}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Progreso">En Progreso</option>
                        <option value="Completada">Completada</option>
                      </select>
                      <svg
                        className="select-arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                      <div className="fs" />
                    </div>
                  </div>
                </div>

                {/* Prioridad */}
                <div className={`fw${focused === 'priority' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Prioridad
                  </label>
                  <div className="fio">
                    <div className="fr" />
                    <div className="fib select-wrapper">
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
                          d="M3 6.75h18M3 12h18m-18 5.25h18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3v18"
                        />
                      </svg>
                      <select
                        className="fs-select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        onFocus={() => setFocused('priority')}
                        onBlur={() => setFocused(null)}
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                      </select>
                      <svg
                        className="select-arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                      <div className="fs" />
                    </div>
                  </div>
                </div>

                {/* Fecha límite */}
                <div className={`fw${focused === 'dueDate' ? ' active' : ''}`}>
                  <label className="fl">
                    <span className="fld" />
                    Fecha límite
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
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      <input
                        type="date"
                        className="fi"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        onFocus={() => setFocused('dueDate')}
                        onBlur={() => setFocused(null)}
                      />
                      <div className="fs" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sep">
                <div className="sl" />
                <span className="st">Modo edición</span>
                <div className="sl" />
              </div>

              <div className="sw">
                <button
                  type="button"
                  onClick={() => navigate('/tasks')}
                  className="sb-cancel"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="sb">
                  <div className="sbb" />
                  <div className="sbg" />
                  <div className="sbs" />
                  <span className="sbt">
                    {saving ? (
                      <svg
                        className="spin"
                        style={{ width: 20, height: 20 }}
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
                      'Guardar Cambios →'
                    )}
                  </span>
                </button>
              </div>
            </form>
            <div className="lf">
              <Link to="/tasks">← Volver a la lista</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskEdit;
