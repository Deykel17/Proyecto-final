# 🌦 Proyecto API del Clima - FastAPI + MySQL

Este proyecto es una API desarrollada con FastAPI que obtiene información del clima desde OpenWeatherMap y permite almacenar registros meteorológicos en una base de datos MySQL local. Los datos se pueden enviar y consultar mediante endpoints POST y GET.

---

## 📁 Estructura del Proyecto

EXTERNAL_API/
├── .venv/ ← el entorno virtual debe crearse aquí
├── archivos_db/
│   └── weather_app_weather_data.sql ← script para crear la base de datos y tabla
├── backend/
│   ├── main.py
│   ├── api.py
│   ├── weather_api.py
│   ├── database.py ← conexión a MySQL
│   └── weather/
│       ├── model.py
│       └── router.py
├── requirements.txt ← estará aquí
├── .gitignore
└── README.md


---

## ⚙️ Requisitos

- Python 3.11 o superior 
- MySQL 5.7 o superior
- Cuenta en OpenWeatherMap

---

⚠️ **Importante:** asegúrate de estar usando **Python 3.11**, ya que algunas dependencias (como NumPy 2.3.2) no son compatibles con Python 3.10 ni versiones anteriores.
Puedes verificar tu versión activa con:

```bash
python --version

## 🚀 Configuración del entorno


1. Crea un entorno virtual:

```bash
python -m venv .venv
```

2. Activa el entorno virtual:

- En Windows:

```bash
.venv\Scripts\activate
```

- En Mac/Linux:

```bash
source .venv/bin/activates
```

3. Instala las dependencias desde `requirements.txt` (este archivo estará dentro de `backend/`):

```bash
pip install -r backend/requirements.txt
```

---

## 🧪 Configurar base de datos MySQL

1. Abre **MySQL Workbench** o tu cliente favorito
2. Ejecuta el script que se encuentra en:

```
archivos_db/weather_app_weather_data.sql
```

Este script creará la base de datos `weather_app` y las tabla `weather_data` y `entradas` .

---

## ▶️ Ejecutar el servidor


1. Activa el entorno virtual
2. Ejecuta el siguiente comando:

```bash
uvicorn backend.main:app --reload
```

Esto iniciará el servidor en:

```
http://127.0.0.1:8000
```

---

## 🧭 Endpoints disponibles

| Método | Ruta     | Descripción                            |
| ------- | -------- | --------------------------------------- |
| POST    | /weather | Guarda un registro del clima en la base |
| GET     | /weather | Lista todos los registros guardados     |

---

## 🧪 Swagger UI

Puedes probar los endpoints desde la interfaz web en:

```
http://127.0.0.1:8000/docs
```

---

## 🧊 Autor

Proyecto grupal desarrollado para el curso de Aplicaciones Web.

sequenceDiagram
    autonumber
    actor U as Usuario (Navegador)
    participant FE as Frontend (DigitalOcean App Platform - estático)
    participant BE as Backend (FastAPI+Uvicorn en Droplet/App Platform)
    participant DB as MySQL (DigitalOcean Managed DB)
    participant OWM as OpenWeatherMap (API externa)
    participant P as Pipeline (cron/worker en DO)

    U->>FE: Solicita página / UI
    U->>FE: Pide clima (click/submit)
    FE->>BE: GET /weather?city=XYZ (HTTPS)
    BE->>DB: Consulta último registro (SQL)
    alt datos recientes
        DB-->>BE: Registros recientes
        BE-->>FE: JSON con clima (cache/DB)
    else no hay datos o expirados
        BE->>OWM: Request clima actual (API key)
        OWM-->>BE: Respuesta clima
        BE->>DB: Insert/Update registro
        BE-->>FE: JSON con clima (OWM)
    end

    Note over P,DB: Tareas programadas
    P->>OWM: Pull periódico (cada X min)
    OWM-->>P: Respuesta clima
    P->>DB: Inserta/actualiza clima

graph TD
    subgraph DigitalOcean
      FE[Frontend (App Platform estático)\nHTML/CSS/JS]
      BE[Backend (FastAPI+Uvicorn)\nDroplet o App Platform]
      DB[(Managed MySQL)\nBackups + VPC]
      P[Pipeline (cron/worker)\nApp Platform Worker o crontab en Droplet]
      ENV[[.env / Variables en DO]\nDB_HOST, DB_USER, DB_PASS, OWM_API_KEY, CORS_ORIGINS]
    end

    OWM[OpenWeatherMap\n(API Externa)]

    %% Dependencias
    FE -->|HTTPS /weather| BE
    BE -->|SQL read/write (VPC)| DB
    P -->|SQL| DB
    P -->|HTTP| BE

    BE <-->|HTTPS| OWM
    P -->|HTTPS| OWM

    ENV -.-> BE
    ENV -.-> P

    %% estilos
    classDef comp fill:#eef,stroke:#333,stroke-width:1px;
    classDef data fill:#e8fff2,stroke:#333,stroke-width:1px;
    classDef ext fill:#ffe,stroke:#333,stroke-width:1px,stroke-dasharray: 4 2;
    class FE,BE,P,ENV comp;
    class DB data;
    class OWM ext;
