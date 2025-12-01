import { useEffect, useState } from "react";
import { getAllChampions } from "./api/ddragon";

function App() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <header className="p-4 border-b border-slate-700 flex justify-between items-center">
        <h1 className="text-xl font-bold">Adivina Quién - League of Legends</h1>
        <span className="text-sm text-slate-400">
          Campeones cargados: {champions.length}
        </span>
      </header>

      <main className="p-4">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {champions.map((c) => (
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
      </main>
    </div>
  );
}

export default App;