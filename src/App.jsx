import { useEffect, useMemo, useState } from "react";
import { getAllChampions } from "./api/ddragon";
import { getExpressChampions } from "./logic/roomCode";

function App() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "full" = todos los campeones, "express" = 20 campeones con código
  const [mode, setMode] = useState("full");
  const [roomCode, setRoomCode] = useState("");
  const [hasGeneratedExpress, setHasGeneratedExpress] = useState(false);

  useEffect(() => {
    async function loadChampions() {
      try {
        setLoading(true);
        const champs = await getAllChampions("es_ES");
        setChampions(champs);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los campeones");
      } finally {
        setLoading(false);
      }
    }

    loadChampions();
  }, []);

  // Campeones a mostrar según el modo
  const championsToShow = useMemo(() => {
    if (mode === "full") {
      return champions;
    }

    // modo express
    if (!roomCode) {
      return [];
    }

    return getExpressChampions(champions, roomCode, 20);
  }, [mode, roomCode, champions]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === "full") {
      setHasGeneratedExpress(false);
    }
  };

  const handleGenerateExpress = () => {
    if (!roomCode.trim()) return;
    setHasGeneratedExpress(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Cargando campeones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* HEADER */}
      <header className="p-4 border-b border-slate-700 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-xl font-bold">Adivina Quién - League of Legends</h1>
          <p className="text-xs text-slate-400">
            Modo completo: todos los campeones. Modo express: 20 campeones según
            código de sala.
          </p>
        </div>

        <span className="text-sm text-slate-400">
          Campeones totales: {champions.length}
        </span>
      </header>

      {/* CONTENIDO */}
      <main className="p-4 space-y-4">
        {/* Selector de modo */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex rounded-lg bg-slate-800 p-1">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                mode === "full"
                  ? "bg-emerald-500 text-slate-900 font-semibold"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
              onClick={() => handleModeChange("full")}
            >
              Modo completo
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                mode === "express"
                  ? "bg-emerald-500 text-slate-900 font-semibold"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
              onClick={() => handleModeChange("express")}
            >
              Modo express
            </button>
          </div>

          {mode === "express" && (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                type="text"
                placeholder="Código de sala (ej: KDA2025)"
                className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setHasGeneratedExpress(false);
                }}
              />
              <button
                onClick={handleGenerateExpress}
                className="px-3 py-1 rounded-md bg-emerald-500 text-slate-900 text-sm font-semibold hover:bg-emerald-400"
              >
                Generar tablero
              </button>
            </div>
          )}
        </div>

        {/* Mensaje de ayuda para modo express */}
        {mode === "express" && !hasGeneratedExpress && (
          <p className="text-xs text-slate-400">
            Ingresa un código y presiona{" "}
            <span className="font-semibold text-emerald-300">
              "Generar tablero"
            </span>{" "}
            para obtener 20 campeones. Si otra persona usa el mismo código,
            verá el mismo tablero.
          </p>
        )}

        {/* Grilla de campeones */}
        <div>
          {mode === "express" && hasGeneratedExpress && championsToShow.length === 0 && (
            <p className="text-sm text-red-400">
              No se pudo generar el tablero. Intenta con otro código o recarga la página.
            </p>
          )}

          {mode === "express" && hasGeneratedExpress && championsToShow.length > 0 && (
            <p className="text-xs text-slate-400 mb-2">
              Modo express con código:{" "}
              <span className="font-mono bg-slate-800 px-2 py-1 rounded">
                {roomCode.trim().toUpperCase()}
              </span>{" "}
              · Campeones en este tablero: {championsToShow.length}
            </p>
          )}

          {mode === "full" && (
            <p className="text-xs text-slate-400 mb-2">
              Estás viendo todos los campeones actuales del juego.
            </p>
          )}

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {championsToShow.map((c) => (
              <div
                key={c.id}
                className="bg-slate-800 rounded-xl p-3 flex flex-col items-center text-center hover:bg-slate-700 transition"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-16 h-16 rounded-md mb-2"
                />
                <div className="text-sm font-semibold">{c.name}</div>
                <div className="text-xs text-slate-400">{c.title}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
