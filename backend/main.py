# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.weather import router as weather_router
from apscheduler.schedulers.background import BackgroundScheduler
from pipeline import ejecutar_pipeline

app = FastAPI(
    title="API del Clima",
    description="API que conecta con OpenWeatherMap",
    version="1.0.0"
)

# Configuración CORS para permitir solicitudes desde cualquier origen
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

scheduler = BackgroundScheduler()
scheduler.add_job(ejecutar_pipeline, 'interval', minutes=15)
scheduler.start()

@app.on_event("startup")
async def startup_event():
    import asyncio
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, ejecutar_pipeline)





# Incluir todas las rutas definidas en weather_router
app.include_router(weather_router.router)

# Para ejecutar:
# uvicorn backend.main:app --reload
