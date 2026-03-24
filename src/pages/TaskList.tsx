// src/pages/TaskList.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI } from '../services/api';
import { Task } from '../types';
import toast from 'react-hot-toast';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [glitching, setGlitching] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Efecto tilt y gradiente radial (igual que en Login)
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

  // Efecto glitch periódico cada 4 segundos
  useEffect(() => {
    const id = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 400);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const tiltX = (mouse.y - 0.5) * -14;
  const tiltY = (mouse.x - 0.5) * 14;

  // Obtener tareas
  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err) {
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      try {
        await tasksAPI.deleteTask(id);
        setTasks(tasks.filter((task) => task.id !== id));
        toast.success('Tarea eliminada');
      } catch (err) {
        toast.error('Error al eliminar la tarea');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Funciones auxiliares para estilos de badges
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return '#ffbe0b';
      case 'En Progreso':
        return '#3a86ff';
      case 'Completada':
        return '#06ffa5';
      default:
        return '#888';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return '#ff006e';
      case 'Media':
        return '#8338ec';
      case 'Baja':
        return '#3a86ff';
      default:
        return '#888';
    }
  };

  // Renderizado condicional mientras carga
  if (loading) {
    return (
      <div className="lr">
        <div
          className="lc"
          style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }}
        >
          <div className="cb" />
          <div
            className="ci"
            style={
              {
                '--sx': `${mouse.x * 100}%`,
                '--sy': `${mouse.y * 100}%`,
              } as any
            }
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
              <div className="gt">CARGANDO</div>
              <span className="ls">Obteniendo tareas...</span>
            </div>
            <div className="sw" style={{ marginTop: '2rem' }}>
              <div className="sb" style={{ cursor: 'default', opacity: 0.7 }}>
                <div className="sbb" />
                <div className="sbg" />
                <div className="sbs" />
                <span className="sbt">
                  <svg
                    className="spin"
                    style={{ width: 22, height: 22 }}
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
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* Estilo base exacto de Login.tsx, con ajuste para que badge y título se apilen verticalmente */
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .lr{min-height:100vh;background:#0a0a0f;display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;perspective:1000px;}
        .lc{position:relative;width:100%;max-width:860px;margin:1rem;border-radius:28px;transform-style:preserve-3d;transition:transform .08s linear;animation:cardIn .9s cubic-bezier(.16,1,.3,1) both;}
        @keyframes cardIn{from{opacity:0;transform:translateY(40px) scale(.93) rotateX(8deg)}to{opacity:1;transform:translateY(0) scale(1) rotateX(0)}}
        .cb{position:absolute;inset:-2px;border-radius:30px;z-index:0;overflow:hidden;}
        .cb::before{content:'';position:absolute;inset:-100%;background:conic-gradient(from 0deg,#ff006e,#8338ec,#3a86ff,#06ffa5,#ffbe0b,#ff006e);animation:rb 3s linear infinite;}
        @keyframes rb{to{transform:rotate(360deg)}}
        .ci{position:relative;z-index:1;background:#0f0f18;border-radius:27px;padding:2rem 2rem;overflow:hidden;}
        .ci::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at var(--sx,50%) var(--sy,50%),rgba(131,56,236,.18) 0%,transparent 60%);pointer-events:none;border-radius:27px;}
        /* Forzamos la pila vertical de badge y título */
        .la{
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 2;
          animation: fu .6s .2s both;
        }
        .lb{
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(131,56,236,.15);
          border: 1px solid rgba(131,56,236,.3);
          border-radius: 100px;
          padding: 5px 14px 5px 8px;
          margin-bottom: 1rem;
        }
        .ld{width:8px;height:8px;background:#06ffa5;border-radius:50%;animation:dp 2s ease-in-out infinite;box-shadow:0 0 8px #06ffa5;}
        @keyframes dp{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
        .lbt{font-size:.68rem;font-weight:500;color:rgba(131,56,236,.9);letter-spacing:.12em;text-transform:uppercase;}
        .gt{
          font-family:'Bebas Neue',sans-serif;
          font-size:2.8rem;
          letter-spacing:.04em;
          color:#fff;
          position:relative;
          display:inline-block;
          line-height:1;
          margin-bottom:0.2rem;
        }
        .gt.gl::before,.gt.gl::after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;}
        .gt.gl::before{color:#ff006e;clip-path:polygon(0 30%,100% 30%,100% 50%,0 50%);animation:g1 .4s steps(1) both;}
        .gt.gl::after{color:#3a86ff;clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%);animation:g2 .4s steps(1) both;}
        @keyframes g1{0%{transform:translateX(-4px) skewX(-2deg)}25%{transform:translateX(4px) skewX(2deg)}50%{transform:translateX(-2px)}75%{transform:translateX(2px) skewX(-1deg)}100%{transform:translateX(0)}}
        @keyframes g2{0%{transform:translateX(4px) skewX(2deg)}25%{transform:translateX(-4px)}50%{transform:translateX(3px) skewX(-2deg)}75%{transform:translateX(-1px)}100%{transform:translateX(0)}}
        .ls{display:block;font-size:.75rem;color:rgba(255,255,255,.3);letter-spacing:.15em;text-transform:uppercase;margin-top:.2rem;font-weight:300;}
        .co{position:absolute;width:18px;height:18px;z-index:3;pointer-events:none;}
        .ctl{top:12px;left:12px;border-top:2px solid rgba(6,255,165,.5);border-left:2px solid rgba(6,255,165,.5);border-radius:4px 0 0 0;}
        .ctr{top:12px;right:12px;border-top:2px solid rgba(6,255,165,.5);border-right:2px solid rgba(6,255,165,.5);border-radius:0 4px 0 0;}
        .cbl{bottom:12px;left:12px;border-bottom:2px solid rgba(6,255,165,.5);border-left:2px solid rgba(6,255,165,.5);border-radius:0 0 0 4px;}
        .cbr{bottom:12px;right:12px;border-bottom:2px solid rgba(6,255,165,.5);border-right:2px solid rgba(6,255,165,.5);border-radius:0 0 4px 0;}
        .sep{display:flex;align-items:center;gap:10px;margin:1.8rem 0 1rem;position:relative;z-index:2;animation:fu .6s .45s both;}
        .sl{flex:1;height:1px;background:rgba(255,255,255,.07);}
        .st{font-size:.62rem;color:rgba(255,255,255,.2);letter-spacing:.1em;text-transform:uppercase;}
        .sw{position:relative;z-index:2;margin-top:1rem;animation:fu .6s .5s both;}
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
        .sg{position:absolute;inset:4px;border-radius:12px;background:linear-gradient(135deg,#06ffa5,#8338ec);filter:blur(16px);opacity:0;transition:opacity .3s;z-index:-1;}
        .sw:hover .sg{opacity:.55;}
        .action-bar {
          display: flex;
          gap: 1rem;
          margin: 1rem 0 1.5rem;
        }
        .action-bar .sb {
          flex: 1;
        }
        .tasks-grid {
          display: grid;
          gap: 1.2rem;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          margin-top: 1rem;
          animation: fu .6s .5s both;
        }
        .task-card {
          background: #16161f;
          border-radius: 18px;
          padding: 1.2rem;
          transition: all 0.2s;
          border: 1px solid rgba(131,56,236,.2);
          position: relative;
          overflow: hidden;
        }
        .task-card:hover {
          transform: translateY(-4px);
          border-color: rgba(131,56,236,.6);
          box-shadow: 0 0 20px rgba(131,56,236,.2);
        }
        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.8rem;
        }
        .task-title {
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 1.1rem;
          color: #fff;
          line-height: 1.3;
          word-break: break-word;
        }
        .task-actions {
          display: flex;
          gap: 0.6rem;
        }
        .task-icon {
          cursor: pointer;
          color: rgba(255,255,255,.4);
          transition: all 0.2s;
          width: 18px;
          height: 18px;
        }
        .task-icon:hover {
          color: #06ffa5;
          filter: drop-shadow(0 0 4px #06ffa5);
        }
        .task-icon.delete:hover {
          color: #ff006e;
          filter: drop-shadow(0 0 4px #ff006e);
        }
        .task-desc {
          color: rgba(255,255,255,.6);
          font-size: 0.8rem;
          line-height: 1.4;
          margin: 0.6rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .task-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0.8rem 0 0.6rem;
        }
        .badge {
          font-size: 0.65rem;
          font-weight: 500;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          background: rgba(255,255,255,.05);
          color: #fff;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          display: inline-block;
        }
        .due-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          color: rgba(255,255,255,.4);
          margin-top: 0.5rem;
        }
        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          background: #16161f;
          border-radius: 24px;
          margin-top: 1rem;
        }
        .empty-state .gt {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }
        .empty-state .ls {
          color: rgba(255,255,255,.5);
        }
        @keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .spin{animation:sp .7s linear infinite;display:inline-block;}
        @keyframes sp{to{transform:rotate(360deg)}}
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
                data-text="MIS TAREAS"
              >
                MIS TAREAS
              </div>
              <span className="ls">
                {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}{' '}
                registradas
              </span>
            </div>

            <div className="action-bar">
              <button onClick={() => navigate('/tasks/new')} className="sb">
                <div className="sbb" />
                <div className="sbg" />
                <div className="sbs" />
                <span className="sbt">+ Nueva tarea</span>
              </button>
              <button
                onClick={handleLogout}
                className="sb"
                style={{ background: 'rgba(255,0,110,0.2)' }}
              >
                <div
                  className="sbb"
                  style={{
                    background: 'linear-gradient(135deg,#ff006e,#8338ec)',
                  }}
                />
                <div className="sbg" />
                <div className="sbs" />
                <span className="sbt">Salir</span>
              </button>
            </div>

            <div className="sep">
              <div className="sl" />
              <span className="st">Cifrado AES-256</span>
              <div className="sl" />
            </div>

            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="gt">✨</div>
                <div
                  className="gt"
                  style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}
                >
                  No hay tareas
                </div>
                <span className="ls">
                  Crea tu primera tarea usando el botón superior
                </span>
              </div>
            ) : (
              <div className="tasks-grid">
                {tasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-actions">
                        <svg
                          onClick={() => navigate(`/tasks/${task.id}/edit`)}
                          className="task-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <svg
                          onClick={() => handleDelete(task.id)}
                          className="task-icon delete"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </div>
                    </div>

                    {task.description && (
                      <div className="task-desc">{task.description}</div>
                    )}

                    <div className="task-badges">
                      <span className="badge">
                        <span
                          className="badge-dot"
                          style={{
                            background: getPriorityColor(task.priority),
                          }}
                        />
                        {task.priority}
                      </span>
                      <span className="badge">
                        <span
                          className="badge-dot"
                          style={{ background: getStatusColor(task.status) }}
                        />
                        {task.status}
                      </span>
                    </div>

                    {task.dueDate && (
                      <div className="due-date">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <rect
                            x="4"
                            y="3"
                            width="16"
                            height="18"
                            rx="2"
                            strokeWidth="1.5"
                          />
                          <path d="M4 7h16M8 3v4M16 3v4" strokeWidth="1.5" />
                        </svg>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="sw" style={{ marginTop: '1.8rem' }}>
              <div className="sg" />
              <div className="sb" style={{ cursor: 'default', opacity: 0.7 }}>
                <div className="sbb" />
                <div className="sbg" />
                <div className="sbs" />
                <span className="sbt">Gestión de tareas • v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskList;
