import { useEffect, useMemo, useState } from "react";
import { getAllChampions } from "./api/ddragon";
import {
  getExpressChampions,
  generateRandomRoomCode,
} from "./logic/roomCode";

// Textos ES / EN (sin cambiar el layout)
const translations = {
  es: {
    modalTitle: "Confirmar campeón",
    modalQuestionPart1: "¿Quieres elegir a",
    modalQuestionPart2: "como tu campeón para esta partida?",
    cancel: "Cancelar",
    confirmPick: "Elegir campeón",

    roomPlaceholder: "Código de sala",
    useCode: "Usar código",
    generateCode: "Generar código",
    totalChamps: "Campeones totales",

    howToPlayTitle: "Cómo jugar",
    howToPlayText:
      "1. Elige el modo de juego (Completo o Express). 2. En modo Express, usa o comparte un código de sala para tener el mismo tablero. 3. Haz clic en una carta o usa “Elegir campeón aleatorio” para escoger tu campeón. 4. Haz clic en las cartas del tablero para ir descartando campeones.",

    gameModeLabel: "MODO DE JUEGO",
    fullMode: "Completo",
    expressMode: "Express (48)",

    noChampionTextLine1: "Campeón no seleccionado",
    noChampionTextLine2:
      "Haz clic en una carta o usa el botón aleatorio.",

    randomButton: "Elegir campeón aleatorio",
    endGame: "Finalizar partida",

    expressInfoInitial:
      "En modo Express, usa o comparte un código de sala para tener el mismo tablero (48 campeones).",
    expressInfoCodePrefix: "Modo Express con código:",
    expressInfoCodeSuffix: "· Campeones en este tablero:",
    fullInfo: "Estás viendo todos los campeones actuales del juego.",
    expressError:
      "No se pudo generar el tablero. Intenta con otro código o recarga la página.",

    languageLabel: "Idioma",

    aboutTitle: "Acerca de este proyecto",
    aboutText1:
      "Este proyecto nació para pasar el rato con mis amigos mientras esperamos la cola de League of Legends.",
    aboutText2:
      "La idea fue de mi mejor amiga y yo me encargué de diseñar y desarrollar la página.",
    aboutText3:
      "AdivinaLOL es un proyecto personal para compartir, practicar programación y tener algo divertido que jugar entre partidas.",
    aboutButton: "Acerca del proyecto",
    donateTitle: "¿Te gusta AdivinaLOL?",
    donateText:
      "Si quieres apoyar el proyecto, puedes hacer una donación voluntaria. Todo se reinvertirá en aprender y crear cosas nuevas.",
    donateButton: "PayPal",

    githubLabel: "Ver mi perfil en GitHub",
    githubShort: "Perfil GitHub",

    termsShort: "Términos y Condiciones",
    privacyShort: "Políticas y Privacidad",

    termsTitle: "Términos y Condiciones de AdivinaLOL",
    termsBody:
      "AdivinaLOL es un proyecto personal y no está afiliado, patrocinado ni respaldado por Riot Games, Inc. El sitio se ofrece tal cual, solo con fines de entretenimiento entre amigos. No se garantiza disponibilidad continua ni ausencia de errores. Al usar esta página aceptas que la utilizas bajo tu propia responsabilidad y que el autor no se hace responsable por daños directos o indirectos derivados de su uso.",

    privacyTitle: "Política de Privacidad de AdivinaLOL",
    privacyBody:
      "Esta página no recopila datos personales sensibles de forma directa. Sin embargo, servicios externos como Vercel o PayPal pueden registrar información técnica básica (como dirección IP, navegador y fechas de acceso) según sus propias políticas de privacidad. Si realizas una donación vía PayPal, el tratamiento de tus datos se rige por PayPal y no por esta página. Se recomienda revisar las políticas de privacidad de estos servicios antes de usarlos.",
  },
  en: {
    modalTitle: "Confirm champion",
    modalQuestionPart1: "Do you want to choose",
    modalQuestionPart2: "as your champion for this game?",
    cancel: "Cancel",
    confirmPick: "Choose champion",

    roomPlaceholder: "Room code",
    useCode: "Use code",
    generateCode: "Generate code",
    totalChamps: "Total champions",

    howToPlayTitle: "How to play",
    howToPlayText:
      "1. Choose the game mode (Full or Express). 2. In Express mode, use or share a room code so everyone has the same board. 3. Click on a card or use “Pick random champion” to choose your champion. 4. Click on the board cards to discard champions.",

    gameModeLabel: "GAME MODE",
    fullMode: "Full",
    expressMode: "Express (48)",

    noChampionTextLine1: "Champion not selected",
    noChampionTextLine2:
      "Click a card or use the random button.",

    randomButton: "Pick random champion",
    endGame: "End game",

    expressInfoInitial:
      "In Express mode, use or share a room code so everyone has the same board (48 champions).",
    expressInfoCodePrefix: "Express mode with code:",
    expressInfoCodeSuffix: "· Champions on this board:",
    fullInfo: "You are seeing all current champions in the game.",
    expressError:
      "The board could not be generated. Try another code or reload the page.",

    languageLabel: "Language",

    aboutTitle: "About this project",
    aboutText1:
      "This project was created to spend time with my friends while we wait in League of Legends queue.",
    aboutText2:
      "The idea came from my best friend and I took care of designing and developing the page.",
    aboutText3:
      "AdivinaLOL is a personal project to share, practice coding, and have something fun to play between matches.",
    aboutButton: "About this project",
    donateTitle: "Do you like AdivinaLOL?",
    donateText:
      "If you want to support the project, you can make a voluntary donation. Everything will be reinvested in learning and building new things.",
    donateButton: "PayPal",

    githubLabel: "View my GitHub profile",
    githubShort: "GitHub profile",

    termsShort: "Terms & Conditions",
    privacyShort: "Privacy Policy",

    termsTitle: "AdivinaLOL Terms & Conditions",
    termsBody:
      "AdivinaLOL is a personal project and is not affiliated with, sponsored, or endorsed by Riot Games, Inc. The site is provided as-is, only for casual entertainment with friends. No continuous availability or freedom from errors is guaranteed. By using this page, you agree that you do so at your own risk and that the author is not liable for any direct or indirect damages arising from its use.",

    privacyTitle: "AdivinaLOL Privacy Policy",
    privacyBody:
      "This page does not directly collect sensitive personal data. However, external services such as Vercel or PayPal may log basic technical information (like IP address, browser, and access timestamps) under their own privacy policies. If you make a donation via PayPal, your data is handled by PayPal and not by this page. You are encouraged to review the privacy policies of those services before using them.",
  },
};

function App() {
  const [language, setLanguage] = useState("es");
  const t = translations[language];

  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "full" = todos los campeones, "express" = 48 con código
  const [mode, setMode] = useState("full");
  const [roomCode, setRoomCode] = useState("");
  const [hasGeneratedExpress, setHasGeneratedExpress] = useState(false);

  // Campeón elegido y descartados
  const [selectedChampionId, setSelectedChampionId] = useState(null);
  const [discardedIds, setDiscardedIds] = useState([]);

  // Modal de confirmación de campeón
  const [pendingChampion, setPendingChampion] = useState(null);

  // Modales info
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

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

  const championsToShow = useMemo(() => {
    if (mode === "full") return champions;
    if (!roomCode) return [];
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

    // Si no hay campeón elegido, abrimos modal de confirmación
    if (!selectedChampionId) {
      setPendingChampion(champion);
      return;
    }

    // Una vez elegido, se puede descartar / devolver cualquier carta (incluida la elegida)
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* MODAL CONFIRMAR CAMPEÓN */}
      {pendingChampion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-center mb-4">
              {t.modalTitle}
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
              {t.modalQuestionPart1}{" "}
              <span className="font-semibold">
                {pendingChampion.name}
              </span>{" "}
              {t.modalQuestionPart2}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelPick}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-500 text-white"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmPick}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900"
              >
                {t.confirmPick}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TÉRMINOS */}
      {showTerms && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3">{t.termsTitle}</h2>
            <p className="text-sm text-slate-200 whitespace-pre-line">
              {t.termsBody}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTerms(false)}
                className="px-4 py-2 rounded-md text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRIVACIDAD */}
      {showPrivacy && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3">
              {t.privacyTitle}
            </h2>
            <p className="text-sm text-slate-200 whitespace-pre-line">
              {t.privacyBody}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPrivacy(false)}
                className="px-4 py-2 rounded-md text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ACERCA DE */}
      {showAbout && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-3">{t.aboutTitle}</h2>
            <p className="text-sm text-slate-200 mb-2">{t.aboutText1}</p>
            <p className="text-sm text-slate-200 mb-2">{t.aboutText2}</p>
            <p className="text-sm text-slate-200 mb-4">{t.aboutText3}</p>
            <p className="text-xs text-slate-400">
              {t.donateTitle} {t.donateText}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 rounded-md text-sm bg-slate-800 text-slate-100 hover:bg-slate-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER IGUAL QUE SIEMPRE: NOMBRE + BARRA CÓDIGO */}
      <header className="bg-slate-950 px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold tracking-wide">
          AdivinaLOL
        </div>

        <div className="flex items-center gap-4">
          {/* Idioma pequeño */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400">{t.languageLabel}:</span>
            <button
              onClick={() => setLanguage("es")}
              className={`px-2 py-0.5 rounded ${
                language === "es"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              ES
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded ${
                language === "en"
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-800"
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-3">
            {mode === "express" && (
              <>
                <input
                  type="text"
                  placeholder={t.roomPlaceholder}
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
                  {t.useCode}
                </button>
                <button
                  onClick={handleGenerateRandomCode}
                  className="px-3 py-1 rounded-md bg-slate-800 text-slate-100 text-xs sm:text-sm font-semibold hover:bg-slate-700"
                >
                  {t.generateCode}
                </button>
              </>
            )}
            <span className="hidden sm:inline text-xs text-slate-400">
              {t.totalChamps}: {champions.length}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN: igual al layout que ya tienes en la captura */}
      <main className="flex-1 px-4 py-6 max-w-6xl mx-auto flex flex-col">
        {/* Caja grande "Cómo jugar" */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-3 mb-6">
          <p className="text-sm md:text-base font-semibold text-white mb-1">
            {t.howToPlayTitle}
          </p>
          <p className="text-xs md:text-sm text-slate-100">
            {t.howToPlayText}
          </p>
        </div>

        {/* Fila: Modo de juego izquierda + Campeón seleccionado centro */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-between mb-6">
          {/* MODO DE JUEGO (como lo tenías) */}
          <div className="self-start">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              {t.gameModeLabel}
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
                {t.fullMode}
              </button>
              <button
                className={`px-4 py-1 text-sm rounded-md ${
                  mode === "express"
                    ? "bg-emerald-500 text-slate-900 font-semibold"
                    : "text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => handleModeChange("express")}
              >
                {t.expressMode}
              </button>
            </div>
          </div>

          {/* CAMPEÓN SELECCIONADO (centrado) + botón aleatorio / finalizar */}
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
                  {t.noChampionTextLine1}
                  <br />
                  {t.noChampionTextLine2}
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

            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={handleRandomChampion}
                disabled={!canRandomPick}
                className={`px-5 py-2 rounded-md text-xs font-semibold ${
                  canRandomPick
                    ? "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                {t.randomButton}
              </button>

              {selectedChampion && (
                <button
                  onClick={handleEndGame}
                  className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold"
                >
                  {t.endGame}
                </button>
              )}
            </div>
          </div>

          {/* Espaciador derecho */}
          <div className="hidden md:block w-40" />
        </div>

        {/* Texto debajo del modo (igual que antes) */}
        {mode === "express" && !hasGeneratedExpress && (
          <p className="text-xs text-slate-400 mb-2">
            {t.expressInfoInitial}
          </p>
        )}

        {mode === "express" && hasGeneratedExpress && championsToShow.length > 0 && (
          <p className="text-xs text-slate-400 mb-2">
            {t.expressInfoCodePrefix}{" "}
            <span className="font-mono bg-slate-800 px-2 py-1 rounded">
              {roomCode.trim().toUpperCase()}
            </span>{" "}
            {t.expressInfoCodeSuffix} {championsToShow.length}
          </p>
        )}

        {mode === "full" && (
          <p className="text-xs text-slate-400 mb-2">
            {t.fullInfo}
          </p>
        )}

        {/* Mensaje error Express si corresponde */}
        {mode === "express" &&
          hasGeneratedExpress &&
          championsToShow.length === 0 && (
            <p className="text-sm text-red-400 mb-2">
              {t.expressError}
            </p>
          )}

        {/* GRILLA EXACTAMENTE COMO LA TENÍAS */}
        <div className="mb-6">
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

        {/* Fila de botones grandes: Acerca + PayPal (debajo de la grilla) */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            type="button"
            onClick={() => setShowAbout(true)}
            className="px-6 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-sm font-semibold"
          >
            {t.aboutButton}
          </button>
          <a
            href="https://paypal.me/Ki4ra22"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-slate-900"
          >
            {t.donateButton}
          </a>
        </div>
      </main>

      {/* FOOTER tipo barra */}
      <footer className="bg-slate-950 px-4 py-3 text-[11px] md:text-xs text-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Izquierda: Políticas y Privacidad */}
          <button
            type="button"
            onClick={() => setShowPrivacy(true)}
            className="text-left underline underline-offset-2 hover:text-white"
          >
            {t.privacyShort}
          </button>

          {/* Centro: Términos */}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-center underline underline-offset-2 hover:text-white"
          >
            {t.termsShort}
          </button>

          {/* Derecha: “foto” + GitHub */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              K
            </div>
            <a
              href="https://github.com/Ki4ra1109"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-white"
            >
              {t.githubShort}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;