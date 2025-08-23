from sqlalchemy import Column, Integer, String, Text
from pydantic import BaseModel
from typing import Dict, Optional
from backend.database import Base  

# Modelo SQLAlchemy para la tabla 'formulario'
class Entrada(Base):
    __tablename__ = "formulario"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)       
    ciudad = Column(String(100), nullable=False)
    clima = Column(String(50), nullable=False)         
    descripcion = Column(Text, nullable=True)           
    imagen = Column(Text, nullable=True)
       

# Modelos Pydantic para validación y documentación

class EntradaCreate(BaseModel):
    nombre: str
    ciudad: str
    clima: str
    descripcion: Optional[str] = None
    imagen: Optional[str] = None

class WeatherResponse(BaseModel):
    ciudad: str
    pais: str
    temperatura: float
    sensacion_termica: float
    temp_min: float
    temp_max: float
    humedad: int
    presion: int
    descripcion: str
    icono: str
    nubosidad: int
    viento_velocidad: float
    viento_direccion: int
    visibilidad: int
    amanecer: str
    atardecer: str
    coordenadas: Dict[str, float]
    timestamp: str

class WeatherSimpleResponse(BaseModel):
    ciudad: str
    temperatura: float
    descripcion: str
    humedad: int
    unidades: str

class ErrorResponse(BaseModel):
    error: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    message: str







