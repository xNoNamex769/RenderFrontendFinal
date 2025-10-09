export async function obtenerResumen(idResumen: number) {
  const res = await fetch(`https://render-hhyo.onrender.com/api/resumenia/resumen/${idResumen}`);
  const data = await res.json();
  return data;
}
