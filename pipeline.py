import pandas as pd
import logging
import os
from datetime import datetime
import aiohttp
import asyncio
import pymysql
import re
from backend.database import conectar_db

# Config
API_KEY = "a54fc02404ab14f7755566fe1a2cafd8"
API_BASE = "https://api.openweathermap.org/data/2.5/weather"

# Log setup
logging.basicConfig(filename="pipeline_log.txt", level=logging.INFO, format="%(asctime)s - %(message)s")
os.makedirs("backups", exist_ok=True)


# ----------------------- Consultar la base de datos ----------------------- #
def leer_raw(nombre_tabla):
    try:
        conn = conectar_db()
        with conn.cursor() as cursor:
            cursor.execute(f"SELECT * FROM {nombre_tabla}")
            datos = cursor.fetchall()
            if not datos:
                logging.info(f"📭 No hay datos disponibles en '{nombre_tabla}'")
                return []
            logging.info(f"📥 {len(datos)} registros leídos desde '{nombre_tabla}'")
            return datos
    except Exception as e:
        logging.error(f"❌ Error al leer datos de '{nombre_tabla}': {e}")
        return []
    finally:
        conn.close()

# ----------------------- Respaldar los datos originales ----------------------- #
def respaldar_tabla_original(nombre_tabla_origen, nombre_tabla_backup, columnas):
    datos = leer_raw(nombre_tabla_origen)
    if not datos:
        logging.info(f"📭 No hay datos nuevos en '{nombre_tabla_origen}' para respaldar")
        return

    try:
        conn = conectar_db()
        with conn.cursor() as cursor:
            placeholders = ", ".join(["%s"] * len(columnas))
            columnas_str = ", ".join(columnas)
            query = f"""
                INSERT IGNORE INTO {nombre_tabla_backup} ({columnas_str})
                VALUES ({placeholders})
            """
            for row in datos:
                cursor.execute(query, tuple(row[col] for col in columnas))
            conn.commit()
        logging.info(f"✅ Respaldo de '{nombre_tabla_origen}' completado: {len(datos)} posibles registros")
    except Exception as e:
        logging.error(f"❌ Error al respaldar '{nombre_tabla_origen}': {e}")
    finally:
        conn.close()

# ----------------------- Entradas del formulario -----------------------

def limpiar_datos_entradas(datos):
    datos_limpios = []

    for row in datos:
        nombre = row['nombre'].strip().title()
        ciudad = row['ciudad'].strip().title()
        clima = row['clima'].strip().capitalize()
        
        descripcion = row['descripcion'].strip() if row['descripcion'] else ''
        descripcion = re.sub(r'\s+', ' ', descripcion)  # eliminar múltiples espacios

        imagen = row['imagen'].strip() if row['imagen'] else ''

        # Validaciones opcionales
        if len(nombre) > 100 or len(ciudad) > 100:
            continue  # descartar si se pasa del límite esperado

        datos_limpios.append({
            "nombre": nombre,
            "ciudad": ciudad,
            "clima": clima,
            "descripcion": descripcion,
            "imagen": imagen
        })

    logging.info(f"🧹 {len(datos_limpios)} registros limpios generados")
    return datos_limpios

def guardar_entradas_cleaned_mysql(datos_limpios):
    if not datos_limpios:
        logging.info("📭 No hay datos limpios para guardar en MySQL")
        return

    try:
        conn = conectar_db()
        with conn.cursor() as cursor:
            for row in datos_limpios:
                cursor.execute("""
                    INSERT IGNORE INTO entradas_cleaned (nombre, ciudad, clima, descripcion, imagen)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    row["nombre"],
                    row["ciudad"],
                    row["clima"],
                    row["descripcion"],
                    row["imagen"]
                ))
            conn.commit()
        logging.info(f"✅ {len(datos_limpios)} registros guardados en 'entradas_cleaned'")
    except Exception as e:
        logging.error(f"❌ Error al guardar en 'entradas_cleaned': {e}")
    finally:
        conn.close()


# ----------------------- Datos del API -----------------------

def clasificar_viento(vel):
    if vel < 1: return "Calma"
    elif vel < 5: return "Brisa"
    elif vel < 15: return "Moderado"
    else: return "Fuerte"

def clasificar_temperatura(temp_min, temp_max):
    media = (temp_min + temp_max) / 2
    if media < 10: return "Frío"
    elif media < 25: return "Templado"
    else: return "Caluroso"

def clasificar_visibilidad(vis):
    if vis >= 10000: return "Alta"
    elif vis >= 4000: return "Media"
    else: return "Baja"

def transformar_weather_data(datos):
    transformados = []
    for row in datos:
        try:
            viento = clasificar_viento(row["viento_velocidad"])
            temp = clasificar_temperatura(row["temp_min"], row["temp_max"])
            visib = clasificar_visibilidad(row["visibilidad"])

            transformados.append({
                "ciudad": row["ciudad"],
                "pais": row["pais"],
                "descripcion": row["descripcion"].capitalize(),
                "temperatura": row["temperatura"],
                "viento_clasificacion": viento,
                "temperatura_clasificacion": temp,
                "visibilidad_clasificacion": visib,
                "timestamp": row["timestamp"]
            })
        except Exception as e:
            logging.warning(f"❗ Registro omitido por error en transformación: {e}")
    logging.info(f"🧠 {len(transformados)} registros transformados de 'weather_data'")
    return transformados

def guardar_weather_cleaned_mysql(datos):
    if not datos:
        logging.info("📭 No hay datos para guardar en 'weather_data_cleaned'")
        return

    try:
        conn = conectar_db()
        with conn.cursor() as cursor:
            for row in datos:
                cursor.execute("""
                    INSERT IGNORE INTO weather_data_cleaned (
                        ciudad, pais, descripcion, temperatura,
                        viento_clasificacion, temperatura_clasificacion,
                        visibilidad_clasificacion, timestamp
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row["ciudad"],
                    row["pais"],
                    row["descripcion"],
                    row["temperatura"],
                    row["viento_clasificacion"],
                    row["temperatura_clasificacion"],
                    row["visibilidad_clasificacion"],
                    row["timestamp"]
                ))
            conn.commit()
        logging.info(f"✅ {len(datos)} registros guardados en 'weather_data_cleaned'")
    except Exception as e:
        logging.error(f"❌ Error al guardar en 'weather_data_cleaned': {e}")
    finally:
        conn.close()


# ----------------------- Pipeline principal -----------------------

def exportar_csv(df, nombre):
    path = f"backups/{nombre}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    df.to_csv(path, index=False)
    logging.info(f"Backup CSV generado: {path}")

def ejecutar_pipeline():
    logging.info("Inicio del pipeline de respaldo")

    
    columnas_entradas = ["nombre", "ciudad", "clima", "descripcion", "imagen"]
    respaldar_tabla_original("entradas", "entradas_backup", columnas_entradas)

    datos_entradas_raw = leer_raw("entradas")

    if datos_entradas_raw:
        df_entrada_raw = pd.DataFrame(datos_entradas_raw)
        exportar_csv(df_entrada_raw, "entradas_raw")

    datos_limpios = limpiar_datos_entradas(datos_entradas_raw)
    guardar_entradas_cleaned_mysql(datos_limpios)

    if datos_limpios:
        df_entradas_cleaned = pd.DataFrame(datos_limpios)
        exportar_csv(df_entradas_cleaned, "entradas_cleaned")


    columnas_weather = [
        "ciudad", "pais", "temperatura", "sensacion_termica", "temp_min", "temp_max",
        "humedad", "presion", "descripcion", "icono", "nubosidad",
        "viento_velocidad", "viento_direccion", "visibilidad",
        "amanecer", "atardecer", "latitud", "longitud", "timestamp"
    ]
    respaldar_tabla_original("weather_data", "weather_data_backup", columnas_weather)

    datos_clima = leer_raw("weather_data")

    if datos_clima:
        df_weather_raw = pd.DataFrame(datos_clima)
        exportar_csv(df_weather_raw, "weather_raw")

    datos_clima_limpios = transformar_weather_data(datos_clima)
    guardar_weather_cleaned_mysql(datos_clima_limpios)
    if datos_clima_limpios:
        df_weather_cleaned = pd.DataFrame(datos_clima_limpios)
        exportar_csv(df_weather_cleaned, "weather_data_cleaned")


    logging.info("Pipeline completado con éxito")

if __name__ == "__main__":
    ejecutar_pipeline()

