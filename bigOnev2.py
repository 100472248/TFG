import os
import requests
import re
import json
from bs4 import BeautifulSoup
from difflib import get_close_matches
import ast

# === GLOBALES ===
CIUDADES = ["Plasencia", "Valencia", "Madrid", "Toledo", "Cartagena", "Vigo", "Palma de Mallorca", "Burgos", "Zaragoza", "Santa Cruz de Tenerife", 
            "Antequera", "Bilbao", "Gijón", "Barcelona", "Pamplona", "Logroño", "Talavera de la Reina", "León", "Melilla", "Marbella", "Soria", "Tomelloso",
            "Leganés", "Getafe", "Las Rozas de Madrid", "Aranjuez", "Sevilla", "Cuenca", "Vitoria", "Don Benito", "Reus", "Salamanca", "Santander", "Oviedo", 
            "Granada", "Cáceres", "Almería", "Zamora"]
DATOS = [
    "Número de habitantes de la ciudad actualmente",
    "Servicios de transporte público",
    "Limpieza, higiene y gestión de residuos",
    "Principales actividades económicas",
    "Principales actividades industriales",
    "Estilo arquitectónico predominante o monumentos destacados",
    "Importancia histórica de la ciudad",
    "Nivel de turismo (lugares turísticos más visitados)",
    "Nivel educativo (universidades o centros de estudio relevantes)",
    "Calidad de vida",
    "Medio ambiente (zonas verdes, parques, contaminación)",
    "Seguridad y medidas de protección"
]

WIKIPEDIA = "https://es.wikipedia.org/wiki/"
WIKIS_DIR = "/home/jaime/Ollamacalls/wikis/"
TXT_OUTPUT_PATH = "/home/jaime/Ollamacalls/resumen_final.txt"
JSON_OUTPUT_PATH = "/home/jaime/Ollamacalls/resumen_final.json"
DEEPSEEK_URL = "http://0.0.0.0:11434/api/generate"
MODEL_BASE = "deepseek-r1:14b"
MODEL_REVISION = "deepseek-r1:14b"

os.makedirs(WIKIS_DIR, exist_ok=True)  # Asegura que el directorio existe

# === FUNCIONES ===
def limpiar_respuesta(texto):
    return re.sub(r"<think>.*?</think>", "", texto, flags=re.DOTALL).strip()

def ask_deepseek(prompt, model=MODEL_BASE):
    data = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(DEEPSEEK_URL, json=data)
    response.raise_for_status()
    return response.json()["response"]

def obtener_texto_wikipedia(ciudad):
    filename = os.path.join(WIKIS_DIR, f"{ciudad.replace(' ', '_')}.txt")
    
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            return f.read()

    print(f"Descargando artículo de Wikipedia para {ciudad}...")
    url = WIKIPEDIA + ciudad.replace(" ", "_")
    if ciudad == "Cartagena" or ciudad == "León":
        url += "_(España)"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        parrafos = soup.find_all("p")
        texto = "\n".join(p.get_text() for p in parrafos if p.get_text().strip())
        with open(filename, "w", encoding="utf-8") as f:
            f.write(texto)
        return texto
    except Exception as e:
        print(f"Error obteniendo texto para {ciudad}: {e}")
        return ""

def generar_prompt(ciudad, texto, datos):
    prompt = f"""
Eres un asistente experto en ciudades y análisis de datos. Se te proporciona un texto parcial de Wikipedia sobre la ciudad de {ciudad}, además de tu conocimiento general como modelo de lenguaje.

Tu tarea es EXTRAER o INFERIR los siguientes datos, de forma clara, literal y concisa. Para cada uno:

- Si aparece explícitamente en el texto, transcribe o resume el dato.
- Si NO aparece, dedúcelo razonablemente con tu conocimiento sobre la ciudad.
- Si no puedes estar seguro, escribe: "Desconocido".
- No inventes datos falsos.
- Sé especialmente preciso y detallado con:
  → "Sistema de transporte público (metro, autobuses, trenes, etc.)"
  → "Limpieza y gestión de residuos"

🔎 Devuelve la respuesta en **formato JSON**, con las siguientes claves exactamente como están escritas:
"""
    for dato in datos:
        prompt += f'- {dato}\n'
    prompt += f"""

📄 Texto de Wikipedia (incompleto, solo como referencia inicial):
\"\"\"{texto}\"\"\"

📤 Formato de salida:
{{
  "Número de habitantes de la ciudad actualmente": "...",
  "Servicios de transporte público": "...",
  "Limpieza, higiene y gestión de residuos": "...",
  "Principales actividades económicas": "...",
  "Principales actividades industriales": "...",
  "Estilo arquitectónico predominante o monumentos destacados": "...",
  "Importancia histórica de la ciudad": "...",
  "Nivel de turismo (lugares turísticos más visitados)": "...",
  "Nivel educativo (universidades o centros de estudio relevantes)": "...",
  "Calidad de vida": "...",
  "Medio ambiente (zonas verdes, parques, contaminación)": "...",
  "Seguridad y medidas de protección": "..."
}}
Devuelve SOLO el JSON. Nada más.
"""
    return prompt

def limpiar_respuesta2(raw):
    raw = raw.strip()
    if raw.startswith("```json") or raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?", "", raw).strip()
    if raw.endswith("```"):
        raw = raw[:-3].strip()
    return raw

def recolectar_datos():
    tabla = {}
    for ciudad in CIUDADES:
        print(f"Procesando {ciudad}...")
        texto = obtener_texto_wikipedia(ciudad)
        if not texto:
            continue

        prompt = generar_prompt(ciudad, texto, DATOS)
        respuesta = ask_deepseek(prompt)
        limpia = limpiar_respuesta2(limpiar_respuesta(respuesta))

        datos_ciudad = {}
        try:
            datos_ciudad = json.loads(limpia)
        except json.JSONDecodeError:
            try:
                datos_ciudad = ast.literal_eval(limpia)
            except (ValueError, SyntaxError):
                print("⚠️ Fallback a extracción aproximada")
                print(limpia)
                json_aprox = re.findall(r'"([^"]+)"\s*:\s*(.*?)(,|\n|$)', limpia)
                for clave, valor, _ in json_aprox:
                    match = get_close_matches(clave.strip(), DATOS, n=1, cutoff=0.4)
                    if match:
                        datos_ciudad[match[0]] = valor.strip().strip('",[]')

        tabla[ciudad] = datos_ciudad
    return tabla

def guardar_resultados(tabla):
    with open(TXT_OUTPUT_PATH, "w", encoding="utf-8") as f_txt:
        for ciudad, datos in tabla.items():
            f_txt.write(f"{ciudad}:\n")
            for k, v in datos.items():
                f_txt.write(f"  {k}: {v}\n")
            f_txt.write("\n")

    with open(JSON_OUTPUT_PATH, "w", encoding="utf-8") as f_json:
        json.dump(tabla, f_json, ensure_ascii=False, indent=4)

# === EJECUCIÓN ===
if __name__ == "__main__":
    tabla = recolectar_datos()
    guardar_resultados(tabla)
    print("Proceso completado.")
