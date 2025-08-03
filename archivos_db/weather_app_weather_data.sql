-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64) 
--
-- Host: localhost    Database: weather_app
-- ------------------------------------------------------
-- Server version	8.0.42

CREATE DATABASE IF NOT EXISTS weather_app;
USE weather_app;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `weather_data`
--

DROP TABLE IF EXISTS `weather_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `weather_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ciudad` text,
  `pais` text,
  `temperatura` double DEFAULT NULL,
  `sensacion_termica` double DEFAULT NULL,
  `temp_min` double DEFAULT NULL,
  `temp_max` double DEFAULT NULL,
  `humedad` int DEFAULT NULL,
  `presion` int DEFAULT NULL,
  `descripcion` text,
  `icono` text,
  `nubosidad` int DEFAULT NULL,
  `viento_velocidad` double DEFAULT NULL,
  `viento_direccion` int DEFAULT NULL,
  `visibilidad` int DEFAULT NULL,
  `amanecer` text,
  `atardecer` text,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `timestamp` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `formulario`
--

CREATE TABLE IF NOT EXISTS `formulario` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `ciudad` VARCHAR(100) NOT NULL,
  `clima` VARCHAR(50) NOT NULL,
  `descripcion` TEXT,
  `imagen` TEXT,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS `entradas` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    ciudad VARCHAR(100),
    clima VARCHAR(100),
    descripcion TEXT,
    imagen LONGTEXT  
);

--
-- Dumping data for table `weather_data`
--

LOCK TABLES `weather_data` WRITE;
/*!40000 ALTER TABLE `weather_data` DISABLE KEYS */;
INSERT INTO `weather_data` VALUES (1,'San José','CR',23.38,23.76,22.62,24.86,76,1013,'muy nuboso','04d',75,5.66,80,10000,'05:23:09','18:01:27',9.9333,-84.0833,'2025-07-17T16:31:18.944783'),(2,'Cartago','CR',19.82,19.4,18.5,21.3,89,1018,'lluvia ligera','10n',90,4.12,210,8000,'05:25:00','17:58:00',9.8644,-83.9194,'2025-07-17T20:45:03.128947');
/*!40000 ALTER TABLE `weather_data` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-17 17:46:10

/* New for backups */
-- Tabla para respaldos climáticos
--DROP TABLE IF EXISTS `weather_data_backup`;
CREATE TABLE `weather_data_backup` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ciudad` text,
  `pais` text,
  `temperatura` double DEFAULT NULL,
  `sensacion_termica` double DEFAULT NULL,
  `temp_min` double DEFAULT NULL,
  `temp_max` double DEFAULT NULL,
  `humedad` int DEFAULT NULL,
  `presion` int DEFAULT NULL,
  `descripcion` text,
  `icono` text,
  `nubosidad` int DEFAULT NULL,
  `viento_velocidad` double DEFAULT NULL,
  `viento_direccion` int DEFAULT NULL,
  `visibilidad` int DEFAULT NULL,
  `amanecer` text,
  `atardecer` text,
  `latitud` double DEFAULT NULL,
  `longitud` double DEFAULT NULL,
  `timestamp` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ciudad_fecha` (`ciudad`(100), `timestamp`(10))  -- Ciudad + día
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--DROP TABLE IF EXISTS `entradas_backup`;
CREATE TABLE IF NOT EXISTS `entradas_backup` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    ciudad VARCHAR(100),
    clima VARCHAR(100),
    descripcion TEXT,
    imagen LONGTEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_dia DATE GENERATED ALWAYS AS (DATE(fecha)) STORED,
    UNIQUE KEY unique_entrada_dia (nombre, ciudad, clima, fecha_dia)
);


-- Tabla para almacenar datos limpios después de aplicar el pipeline
CREATE TABLE IF NOT EXISTS weather_data_cleaned (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ciudad VARCHAR(100),
  pais VARCHAR(10),
  descripcion VARCHAR(255),
  temperatura DOUBLE,
  viento_clasificacion VARCHAR(20),
  temperatura_clasificacion VARCHAR(20),
  visibilidad_clasificacion VARCHAR(20),
  timestamp DATETIME,
  UNIQUE KEY unique_ciudad_timestamp (ciudad, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE IF NOT EXISTS entradas_cleaned (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    ciudad VARCHAR(100),
    clima VARCHAR(100),
    descripcion TEXT,
    imagen LONGTEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_dia DATE GENERATED ALWAYS AS (DATE(fecha)) STORED,
    UNIQUE KEY unique_entrada_dia (nombre, ciudad, clima, fecha_dia)
);