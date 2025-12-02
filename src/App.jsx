import { useEffect, useMemo, useState } from "react";
import { getAllChampions } from "./api/ddragon";
import {
  getExpressChampions,
  generateRandomRoomCode,
} from "./logic/roomCode";

function App() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "full" = todos los campeones, "express" = 48 campeones con código
  const [mode, setMode] = useState("full");
  const [roomCode, setRoomCode] = useState("");
  const [hasGeneratedExpress, setHasGeneratedExpress] = useState(false);

  // Campeón elegido y descartados
  const [selectedChampionId, setSelectedChampionId] = useState(null);
  const [discardedIds, setDiscardedIds] = useState([]);

  // Para el modal de confirmación
  const [pendingChampion, setPendingChampion] = useState(null);

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
    if (mode === "full") return champions;
    if (!roomCode) return [];
    // EXPRESS: 48 campeones por tablero
    return getExpressChampions(champions, roomCode, 48);
  }, [mode, roomCode, champions]);

  const selectedChampion = useMemo(() => {
    if (!selectedChampionId) return null;
    return champions.find((c) => c.id === selectedChampionId) || null;
  }, [selectedChampionId, champions]);

  const resetBoardState = () => {
    setSelectedChampionId(null);
    setDiscardedIds([]);
    setPendingChampion(null);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setHasGeneratedExpress(false);
    resetBoardState();
  };

  const handleGenerateExpress = () => {
    if (!roomCode.trim()) return;
    setHasGeneratedExpress(true);
    resetBoardState();
  };

  const handleGenerateRandomCode = () => {
    const newCode = generateRandomRoomCode();
    setRoomCode(newCode);
    setHasGeneratedExpress(true);
    resetBoardState();
  };

  const handleChampionClick = (champion) => {
    const { id } = champion;

    // Si aún no hay campeón elegido → abrir modal
    if (!selectedChampionId) {
      setPendingChampion(champion);
      return;
    }

    // Ya hay campeón elegido:
    // AHORA SÍ se puede descartar el campeón seleccionado

    // Toggle descartado
    setDiscardedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmPick = () => {
    if (!pendingChampion) return;
    setSelectedChampionId(pendingChampion.id);
    setDiscardedIds([]);
    setPendingChampion(null);
  };

  const handleCancelPick = () => {
    setPendingChampion(null);
  };

  const handleEndGame = () => {
    resetBoardState();
  };

  // Elegir campeón aleatorio desde el tablero actual
  const handleRandomChampion = () => {
    if (!championsToShow.length) return;
    const randomIndex = Math.floor(Math.random() * championsToShow.length);
    const randomChampion = championsToShow[randomIndex];
    setSelectedChampionId(randomChampion.id);
    setDiscardedIds([]);
    setPendingChampion(null);
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

  const canRandomPick = championsToShow.length > 0;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      {/* MODAL CONFIRMAR CAMPEÓN */}
      {pendingChampion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-center mb-4">
              Confirmar campeón
            </h2>

            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="w-32 h-32 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={pendingChampion.image}
                  alt={pendingChampion.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {pendingChampion.name}
                </p>
                <p className="text-xs text-slate-400">
                  {pendingChampion.title}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-200 text-center mb-6">
              ¿Quieres elegir a{" "}
              <span className="font-semibold">
                {pendingChampion.name}
              </span>{" "}
              como tu campeón para esta partida?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelPick}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-500 text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPick}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900"
              >
                Elegir campeón
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR (Nombre página + barra de código) */}
      <header className="bg-slate-950 px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold tracking-wide">
          AdivinaLOL
        </div>

        <div className="flex items-center gap-3">
          {mode === "express" && (
            <>
              <input
                type="text"
                placeholder="Código de sala"
                className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setHasGeneratedExpress(false);
                  resetBoardState();
                }}
              />
              <button
                onClick={handleGenerateExpress}
                className="px-3 py-1 rounded-md bg-emerald-500 text-slate-900 text-xs sm:text-sm font-semibold hover:bg-emerald-400"
              >
                Usar código
              </button>
              <button
                onClick={handleGenerateRandomCode}
                className="px-3 py-1 rounded-md bg-slate-800 text-slate-100 text-xs sm:text-sm font-semibold hover:bg-slate-700"
              >
                Generar código
              </button>
            </>
          )}
          <span className="hidden sm:inline text-xs text-slate-400">
            Campeones totales: {champions.length}
          </span>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="px-4 py-6 max-w-6xl mx-auto space-y-6">
        {/* INSTRUCCIONES PRINCIPALES */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3">
          <p className="text-sm md:text-base font-semibold text-white">
            Cómo jugar
          </p>
          <p className="mt-1 text-xs md:text-sm text-slate-100">
            1. Elige el modo de juego (Completo o Express). 2. En modo
            Express, usa o comparte un código de sala para tener el mismo tablero.
            3. Haz clic en una carta o usa{" "}
            <span className="font-semibold">“Elegir campeón aleatorio”</span> para
            escoger tu campeón. 4. Haz clic en las cartas del tablero para ir
            descartando campeones.
          </p>
        </div>

        {/* FILA: Modo de juego + Campeón seleccionado */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between">
          {/* MODO DE JUEGO (izquierda) */}
          <div className="self-start">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Modo de juego
            </p>
            <div className="inline-flex rounded-lg bg-slate-800 p-1">
              <button
                className={`px-4 py-1 text-sm rounded-md ${
                  mode === "full"
                    ? "bg-emerald-500 text-slate-900 font-semibold"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => handleModeChange("full")}
              >
                Completo
              </button>
              <button
                className={`px-4 py-1 text-sm rounded-md ${
                  mode === "express"
                    ? "bg-emerald-500 text-slate-900 font-semibold"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => handleModeChange("express")}
              >
                Express (48)
              </button>
            </div>
          </div>

          {/* CAMPEÓN SELECCIONADO (centro) */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-40 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700">
              {selectedChampion ? (
                <img
                  src={selectedChampion.image}
                  alt={selectedChampion.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-xs text-slate-400 text-center px-2">
                  Campeón no seleccionado
                  <br />
                  Haz clic en una carta o usa el botón aleatorio.
                </p>
              )}
            </div>

            {selectedChampion && (
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {selectedChampion.name}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedChampion.title}
                </p>
              </div>
            )}

            {/* Botones bajo el cuadro del campeón */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={handleRandomChampion}
                disabled={!canRandomPick}
                className={`px-5 py-2 rounded-md text-xs font-semibold ${
                  canRandomPick
                    ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
              >
                Elegir campeón aleatorio
              </button>

              {selectedChampion && (
                <button
                  onClick={handleEndGame}
                  className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  Finalizar partida
                </button>
              )}
            </div>
          </div>

          {/* Espaciador derecho para equilibrar */}
          <div className="hidden md:block w-40" />
        </div>

        {/* INFO EXPRESS / COMPLETO (se mantiene) */}
        {mode === "express" && !hasGeneratedExpress && (
          <p className="text-xs text-slate-400 text-center md:text-left">
            Ingresa o genera un código de sala en la barra superior para crear un
            tablero express de{" "}
            <span className="font-semibold text-emerald-300">48 campeones</span>.
            Si otra persona usa el mismo código, tendrá el mismo tablero.
          </p>
        )}

        {mode === "express" && hasGeneratedExpress && championsToShow.length > 0 && (
          <p className="text-xs text-slate-400 text-center md:text-left">
            Modo express con código:{" "}
            <span className="font-mono bg-slate-800 px-2 py-1 rounded">
              {roomCode.trim().toUpperCase()}
            </span>{" "}
            · Campeones en este tablero: {championsToShow.length}
          </p>
        )}

        {mode === "full" && (
          <p className="text-xs text-slate-400 text-center md:text-left">
            Estás viendo todos los campeones actuales del juego.
          </p>
        )}

        {/* GRILLA DE CARTAS (igual que antes) */}
        <div>
          {mode === "express" &&
            hasGeneratedExpress &&
            championsToShow.length === 0 && (
              <p className="text-sm text-red-400">
                No se pudo generar el tablero. Intenta con otro código o recarga la
                página.
              </p>
            )}

          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {championsToShow.map((c) => {
              const isSelected = c.id === selectedChampionId;
              const isDiscarded = discardedIds.includes(c.id);

              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => handleChampionClick(c)}
                  className={`rounded-xl p-3 flex flex-col items-center text-center transition cursor-pointer relative border
                    ${
                      isDiscarded
                        ? "bg-red-900/80 border-red-500 opacity-80"
                        : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                    }
                    ${
                      isSelected
                        ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900"
                        : ""
                    }
                  `}
                >
                  {isDiscarded && (
                    <span className="absolute top-1 right-1 text-xs bg-red-600 text-white rounded-full px-1">
                      X
                    </span>
                  )}

                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-16 h-16 rounded-md mb-2"
                  />
                  <div className="text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-slate-300">{c.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;