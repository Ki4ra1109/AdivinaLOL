// Obtiene la última versión disponible de Data Dragon
export async function getLatestVersion() {
  const res = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json"
  );
  if (!res.ok) {
    throw new Error("No se pudo obtener la lista de versiones");
  }
  const versions = await res.json();
  return versions[0]; // la versión más reciente
}

// Obtiene todos los campeones en el idioma indicado
export async function getAllChampions(locale = "es_ES") {
  const version = await getLatestVersion();

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/${locale}/champion.json`
  );
  if (!res.ok) {
    throw new Error("No se pudo obtener la lista de campeones");
  }

  const data = await res.json();

  // data.data es un objeto: { Ahri: {...}, Garen: {...}, ... }
  const champs = Object.values(data.data).map((champ) => ({
    id: champ.id,
    name: champ.name,
    title: champ.title,
    tags: champ.tags, // roles
    image: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champ.id}.png`,
  }));

  return champs;
}