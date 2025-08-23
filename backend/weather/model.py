from sqlalchemy import Column, Integer, String, Text
from pydantic import BaseModel, Field
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
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre entre 2 y 100 caracteres")
    ciudad: str = Field(..., min_length=2, max_length=100, description="Ciudad entre 2 y 100 caracteres")
    clima: str = Field(..., min_length=2, max_length=50, description="Clima entre 2 y 50 caracteres")
    descripcion: Optional[str] = Field(None, max_length=500, description="Descripción opcional, máximo 500 caracteres")
    imagen: Optional[str] = Field(None, description="URL o base64 de la imagen (opcional)")

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




