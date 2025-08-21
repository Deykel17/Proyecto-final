from sqlalchemy import Column, Integer, String, Text
from pydantic import BaseModel, Field, constr
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
    nombre: constr(strip_whitespace=True, min_length=2, max_length=100) = Field(
        ..., description="Nombre de la persona, entre 2 y 100 caracteres"
    )
    ciudad: constr(strip_whitespace=True, min_length=2, max_length=100) = Field(
        ..., description="Ciudad asociada a la entrada"
    )
    clima: constr(strip_whitespace=True, min_length=2, max_length=50) = Field(
        ..., description="Tipo de clima (ej. soleado, lluvioso)"
    )
    descripcion: Optional[constr(strip_whitespace=True, max_length=500)] = Field(
        None, description="Descripción opcional, máximo 500 caracteres"
    )
    imagen: Optional[str] = Field(
        None, description="URL o ruta de la imagen (opcional)"
    )

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




