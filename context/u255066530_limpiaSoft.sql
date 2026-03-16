-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 07, 2026 at 05:35 AM
-- Server version: 11.8.3-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u255066530_limpiaSoft`
--

-- --------------------------------------------------------

--
-- Table structure for table `billing_periods`
--

CREATE TABLE `billing_periods` (
  `id` int(11) NOT NULL,
  `start_date` date NOT NULL COMMENT 'Lunes de la semana 1 del periodo',
  `end_date` date NOT NULL COMMENT 'Domingo de la semana 2 del periodo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `billing_periods`
--

INSERT INTO `billing_periods` (`id`, `start_date`, `end_date`) VALUES
(1, '2026-03-09', '2026-03-22'),
(2, '2026-03-23', '2026-04-05'),
(3, '2026-04-06', '2026-04-19'),
(4, '2026-04-20', '2026-05-03'),
(5, '2026-05-04', '2026-05-17'),
(6, '2026-05-18', '2026-05-31'),
(7, '2026-06-01', '2026-06-14'),
(8, '2026-06-15', '2026-06-28'),
(9, '2026-06-29', '2026-07-12'),
(10, '2026-07-13', '2026-07-26'),
(11, '2026-07-27', '2026-08-09'),
(12, '2026-08-10', '2026-08-23'),
(13, '2026-08-24', '2026-09-06'),
(14, '2026-09-07', '2026-09-20'),
(15, '2026-09-21', '2026-10-04'),
(16, '2026-10-05', '2026-10-18'),
(17, '2026-10-19', '2026-11-01'),
(18, '2026-11-02', '2026-11-15'),
(19, '2026-11-16', '2026-11-29'),
(20, '2026-11-30', '2026-12-13'),
(21, '2026-12-14', '2026-12-27'),
(22, '2026-12-28', '2027-01-10'),
(23, '2027-01-11', '2027-01-24'),
(24, '2027-01-25', '2027-02-07'),
(25, '2027-02-08', '2027-02-21'),
(26, '2027-02-22', '2027-03-07');

-- --------------------------------------------------------

--
-- Table structure for table `billing_weeks`
--

CREATE TABLE `billing_weeks` (
  `id` int(11) NOT NULL,
  `start_date` date NOT NULL COMMENT 'Lunes',
  `end_date` date NOT NULL COMMENT 'Domingo',
  `period_id` int(11) DEFAULT NULL COMMENT 'FK a billing_periods; dos semanas por periodo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `billing_weeks`
--

INSERT INTO `billing_weeks` (`id`, `start_date`, `end_date`, `period_id`) VALUES
(1, '2026-03-09', '2026-03-15', 1),
(2, '2026-03-16', '2026-03-22', 1),
(3, '2026-03-23', '2026-03-29', 2),
(4, '2026-03-30', '2026-04-05', 2),
(5, '2026-04-06', '2026-04-12', 3),
(6, '2026-04-13', '2026-04-19', 3),
(7, '2026-04-20', '2026-04-26', 4),
(8, '2026-04-27', '2026-05-03', 4),
(9, '2026-05-04', '2026-05-10', 5),
(10, '2026-05-11', '2026-05-17', 5),
(11, '2026-05-18', '2026-05-24', 6),
(12, '2026-05-25', '2026-05-31', 6),
(13, '2026-06-01', '2026-06-07', 7),
(14, '2026-06-08', '2026-06-14', 7),
(15, '2026-06-15', '2026-06-21', 8),
(16, '2026-06-22', '2026-06-28', 8),
(17, '2026-06-29', '2026-07-05', 9),
(18, '2026-07-06', '2026-07-12', 9),
(19, '2026-07-13', '2026-07-19', 10),
(20, '2026-07-20', '2026-07-26', 10),
(21, '2026-07-27', '2026-08-02', 11),
(22, '2026-08-03', '2026-08-09', 11),
(23, '2026-08-10', '2026-08-16', 12),
(24, '2026-08-17', '2026-08-23', 12),
(25, '2026-08-24', '2026-08-30', 13),
(26, '2026-08-31', '2026-09-06', 13),
(27, '2026-09-07', '2026-09-13', 14),
(28, '2026-09-14', '2026-09-20', 14),
(29, '2026-09-21', '2026-09-27', 15),
(30, '2026-09-28', '2026-10-04', 15),
(31, '2026-10-05', '2026-10-11', 16),
(32, '2026-10-12', '2026-10-18', 16),
(33, '2026-10-19', '2026-10-25', 17),
(34, '2026-10-26', '2026-11-01', 17),
(35, '2026-11-02', '2026-11-08', 18),
(36, '2026-11-09', '2026-11-15', 18),
(37, '2026-11-16', '2026-11-22', 19),
(38, '2026-11-23', '2026-11-29', 19),
(39, '2026-11-30', '2026-12-06', 20),
(40, '2026-12-07', '2026-12-13', 20),
(41, '2026-12-14', '2026-12-20', 21),
(42, '2026-12-21', '2026-12-27', 21),
(43, '2026-12-28', '2027-01-03', 22),
(44, '2027-01-04', '2027-01-10', 22),
(45, '2027-01-11', '2027-01-17', 23),
(46, '2027-01-18', '2027-01-24', 23),
(47, '2027-01-25', '2027-01-31', 24),
(48, '2027-02-01', '2027-02-07', 24),
(49, '2027-02-08', '2027-02-14', 25),
(50, '2027-02-15', '2027-02-21', 25),
(51, '2027-02-22', '2027-02-28', 26),
(52, '2027-03-01', '2027-03-07', 26);

-- --------------------------------------------------------

--
-- Table structure for table `cars`
--

CREATE TABLE `cars` (
  `id` int(11) NOT NULL,
  `matricula` varchar(50) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `marca` varchar(60) DEFAULT NULL,
  `modelo` varchar(80) DEFAULT NULL,
  `version` varchar(80) DEFAULT NULL,
  `comentarios` text DEFAULT NULL,
  `caracteristicas` text DEFAULT NULL,
  `proximo_mantenimiento_fecha` date DEFAULT NULL,
  `fecha_rego` date DEFAULT NULL,
  `seguro_info` text DEFAULT NULL,
  `equipo_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cars`
--

INSERT INTO `cars` (`id`, `matricula`, `tipo`, `marca`, `modelo`, `version`, `comentarios`, `caracteristicas`, `proximo_mantenimiento_fecha`, `fecha_rego`, `seguro_info`, `equipo_id`) VALUES
(1, '1ZX6QF', 'Van', 'LDV', 'G10', '2024', '', 'Barn Doors', NULL, NULL, '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `car_services`
--

CREATE TABLE `car_services` (
  `id` int(11) NOT NULL,
  `car_id` int(11) NOT NULL,
  `equipo_id` int(11) NOT NULL,
  `car_matricula` varchar(50) DEFAULT NULL,
  `car_tipo` varchar(100) DEFAULT NULL,
  `car_marca` varchar(60) DEFAULT NULL,
  `car_modelo` varchar(80) DEFAULT NULL,
  `car_version` varchar(80) DEFAULT NULL,
  `equipo_numero` varchar(255) DEFAULT NULL,
  `fecha_mantenimiento` date NOT NULL,
  `km_mantenimiento` int(10) UNSIGNED DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `contacto_nombre` varchar(100) DEFAULT NULL,
  `contacto_email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `nombre`, `telefono`, `direccion`, `contacto_nombre`, `contacto_email`) VALUES
(1, 'Pruebas', '0415738214', '442 Geelong rd', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `site_id` int(11) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `reportado_por` varchar(100) DEFAULT NULL,
  `categoria` enum('SERVICE QUALITY','STAFF AND BEHAVIOR','COMMUNICATION','BILLING AND PAYMENTS','DAMAGES AND LIABILITY','SCHEDULING AND LOGISTICS') DEFAULT NULL,
  `severidad` enum('Low','Medium','High','Critical') DEFAULT NULL,
  `estado` enum('pendiente','resuelto') DEFAULT 'pendiente',
  `asignado_team_id` int(11) DEFAULT NULL,
  `asignado_user_id` int(11) DEFAULT NULL,
  `fecha_reporte` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `daily_site_logs`
--

CREATE TABLE `daily_site_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `horas_trabajadas` decimal(4,2) NOT NULL,
  `solo_bins` tinyint(1) DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `estado` enum('pendiente','confirmado') DEFAULT 'pendiente',
  `billing_week_id` int(11) DEFAULT NULL COMMENT 'Semana de facturación (Lun-Dom) a la que pertenece este log',
  `entry_type` enum('SERVICE','BINS','CUSTOM') DEFAULT NULL COMMENT 'Tipo de entrada; NULL = registro legacy',
  `display_value` decimal(10,2) DEFAULT NULL COMMENT 'Valor a cobrar (horas o monto bins/custom)',
  `creado_en` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `providers`
--

CREATE TABLE `providers` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Usuario que envía el reporte',
  `fecha_inicio` date NOT NULL COMMENT 'Lunes semana 1 del periodo',
  `fecha_fin` date NOT NULL COMMENT 'Domingo semana 2 del periodo',
  `billing_period_id` int(11) DEFAULT NULL COMMENT 'Periodo de facturación (opcional)',
  `estado` enum('borrador','enviado','aprobado') NOT NULL DEFAULT 'borrador',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `report_excluded_logs`
--

CREATE TABLE `report_excluded_logs` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `daily_site_log_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `id` int(11) NOT NULL,
  `direccion_linea1` varchar(255) DEFAULT NULL,
  `direccion_linea2` varchar(255) DEFAULT NULL,
  `suburb` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `postcode` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `latitud` decimal(10,8) DEFAULT NULL,
  `longitud` decimal(11,8) DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `contrato` text DEFAULT NULL,
  `finanzas` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sites`
--

INSERT INTO `sites` (`id`, `direccion_linea1`, `direccion_linea2`, `suburb`, `state`, `postcode`, `country`, `latitud`, `longitud`, `cliente_id`, `contrato`, `finanzas`, `activo`) VALUES
(1, '1 Fiona Court', NULL, 'St Kilda', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(2, '1017 Nepean Highway', NULL, 'Moorabbin', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(3, '11 Struan St', NULL, 'Toorak', 'VIC', '3142', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(4, '1127 Nepean Highway', NULL, 'Highett', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(5, '113 Westbury Street', NULL, 'St Kilda', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(6, '114a Westbury Close', NULL, 'Balaclava', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(7, '13 Fuller Road', NULL, 'Ripponlea', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(8, '145 & 145a Hotham St', NULL, 'Balaclava', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(9, '15 Central Av', NULL, 'Moorabbin', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(10, '15 Cochrane Street', NULL, 'Brighton', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(11, '23 Park Street', NULL, 'St Kilda West', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(12, '26 Eumeralla Road', NULL, 'Caulfield', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(13, '26 Hughenden St', NULL, 'St Kilda East', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(14, '29 South Road', NULL, 'Braybrook', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(15, '35 Carroll Crescent', NULL, 'Glen Iris', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(16, '352-362 Victoria Street', NULL, 'North Melbourne', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(17, '36 Westbury Street', NULL, 'St Kilda', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(18, '37 Rennison St', NULL, 'Parkdale', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(19, '39 Parkers Road', NULL, 'Parkdale', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(20, '4 Clowes St', NULL, 'South yarra', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(21, '4 Eurythmic St', NULL, 'Mordialloc', 'VIC', '3195', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(22, '4 Wando Grove', NULL, 'St Kilda', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(23, '403 Nepean Highway', NULL, 'Mordialloc', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(24, '41 Chapel Street', NULL, 'St Kilda', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(25, '422 Nepean Hwy', NULL, 'Parkdale', 'VIC', '3195', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(26, '498 North Rd', NULL, 'Ormond', 'VIC', '3204', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(27, '5 Eldridge Street', NULL, 'Footscray', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(28, '5 Rowan Ave', NULL, 'Brooklyn', 'VIC', '3012', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(29, '55 Davis Ave', NULL, 'South Yarra', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(30, '569 Orrong Rd', NULL, 'Armadale', 'VIC', '3143', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(31, '58 Sutherland Road', NULL, 'Armadale', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(32, '597 Orrong Road', NULL, 'Armadale', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(33, '6 Bella Vista Road', NULL, 'Caulfield North', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(34, '6 Hamilton St', NULL, 'Bentleigh', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(35, '65-67 Park Street', NULL, 'St Kilda West', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(36, '663 Inkerman Street', NULL, 'Caulfield', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(37, '677 Glen Huntly Road', NULL, 'Caulfield', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(38, '81 Alma Road', NULL, 'St Kilda', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(39, '83 Park St', NULL, 'St Kilda West', 'VIC', '3182', 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(40, '9 Churchill Avenue', NULL, 'Maidstone', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(41, '97 Cruikshank Street', NULL, 'Port Melbourne', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1),
(42, 'Rafa Court', NULL, 'Maribyrnong', 'VIC', NULL, 'Australia', NULL, NULL, 1, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `site_comments`
--

CREATE TABLE `site_comments` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `autor_user_id` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp(),
  `visible_para` enum('todos','solo_admins','solo_equipo') DEFAULT 'todos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `site_visits`
--

CREATE TABLE `site_visits` (
  `id` int(11) NOT NULL,
  `site_id` int(11) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `horas_trabajadas` decimal(4,2) DEFAULT NULL,
  `hizo_bins` tinyint(1) DEFAULT 0,
  `observaciones` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplies`
--

CREATE TABLE `supplies` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `unidad` varchar(50) DEFAULT NULL,
  `stock_actual` int(11) DEFAULT NULL,
  `stock_minimo` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `imagen_url` text DEFAULT NULL,
  `cloudinary_public_id` varchar(255) DEFAULT NULL,
  `proveedor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplies`
--

INSERT INTO `supplies` (`id`, `nombre`, `descripcion`, `unidad`, `stock_actual`, `stock_minimo`, `precio_unitario`, `imagen_url`, `cloudinary_public_id`, `proveedor_id`) VALUES
(1, 'WIPES ISOPROPIL PARA ELECTRODOM - 75 WIPES', 'Cleaning - Superficies - TARRO DE 75 WIPES', 'TARRO DE 75 WIPES', 0, NULL, 9.24, NULL, NULL, NULL),
(2, 'WIPES GRADE HOSPITALARIO - TARRO DE 180 WIPES', 'Cleaning - Superficies - TARRO DE 180 WIPES', 'TARRO DE 180 WIPES', 0, NULL, 30.53, NULL, NULL, NULL),
(3, 'ULTRASRIPE - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 31.35, NULL, NULL, NULL),
(4, 'TARRO DE PINTURA PEQUEÑO - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 53.90, NULL, NULL, NULL),
(5, 'TARRO DE PINTURA MEDIANO - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 104.50, NULL, NULL, NULL),
(6, 'TARRO DE PINTURA GRANDE - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 275.00, NULL, NULL, NULL),
(7, 'STAN KLEEN - 375 ML', 'Cleaning - Metalicas - 375 ML', '375 ML', 0, NULL, 13.70, NULL, NULL, NULL),
(8, 'SPRAYBUFF C - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 31.35, NULL, NULL, NULL),
(9, 'SOLVENT ACRILIC - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 107.80, NULL, NULL, NULL),
(10, 'RODILLO  - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 18.03, NULL, NULL, NULL),
(11, 'PORTA AVISOS DE PARED - UNIDAD', 'Cleaning - Visualización - UNIDAD', 'UNIDAD', 0, NULL, 17.60, NULL, NULL, NULL),
(12, 'PAINT SCRAPER - ESPATULA - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 5.53, NULL, NULL, NULL),
(13, 'OVEN AND GRILL CLEANER - 5 LT', 'Cleaning - Superficies - 5 LT', '5 LT', 0, NULL, 31.35, NULL, NULL, NULL),
(14, 'METHYLATED SPIRITS - 4 LT', 'Cleaning - Paredes - 4 LT', '4 LT', 0, NULL, 13.75, NULL, NULL, NULL),
(15, 'DISOLVENTE DIGGER', 'Cleaning - Paredes - 1 LT', '1 LT', 0, NULL, 3.44, NULL, NULL, NULL),
(16, 'MASKING TAPE PAINT PARTNER - 6 ROLLOS', 'Cleaning - Pintura - 6 ROLLOS', '6 ROLLOS', 0, NULL, 7.59, NULL, NULL, NULL),
(17, 'LIJA BLANCA - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 3.23, NULL, NULL, NULL),
(18, 'KIT RODILLO - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 11.70, NULL, NULL, NULL),
(19, 'HEAT LAMP PEQUEÑO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 9.94, NULL, NULL, NULL),
(20, 'HEAT LAMP GRANDE - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 27.49, NULL, NULL, NULL),
(21, 'STARTES - FUSIBLES - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 1.10, NULL, NULL, NULL),
(22, 'BOMBILLO FLUORESCENTE ARO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 32.95, NULL, NULL, NULL),
(23, 'BOMBILLO FLUORESCENTE TUBO EXTRA LARGO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 28.59, NULL, NULL, NULL),
(24, 'BOMBILLO FLUORESCENTE TUBO LARGO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 8.78, NULL, NULL, NULL),
(25, 'BROCHA DE PINTURA - UNIDAD', 'Cleaning - Pintura - UNIDAD', 'UNIDAD', 0, NULL, 7.26, NULL, NULL, NULL),
(26, 'CAJA PARA LLAVES STANDARD - UNIDAD', 'Cleaning - Multiuso - UNIDAD', 'UNIDAD', 0, NULL, 6.05, NULL, NULL, NULL),
(27, 'CAUSTIC SODA - 500 GR', 'Cleaning - Pisos - 500 GR', '500 GR', 0, NULL, 7.15, NULL, NULL, NULL),
(28, 'BRASSO - METAL POLISH - 250 ML', 'Cleaning - Metalicas - 250 ML', '250 ML', 0, NULL, 6.71, NULL, NULL, NULL),
(29, 'ANTI FOAM - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 28.60, NULL, NULL, NULL),
(30, 'DEMINERAL WATER - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 24.20, NULL, NULL, NULL),
(31, 'FLOOR STRIPPER - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 27.50, NULL, NULL, NULL),
(32, 'VEST LIGTH - CHALECOS - UNIDAD', 'Cleaning - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 16.49, NULL, NULL, NULL),
(33, 'TAPA OIDOS - PAQUETE', 'Gardening - Proteccion - PAQUETE', 'PAQUETE', 0, NULL, 63.75, NULL, NULL, NULL),
(34, 'SOMBREROS DE JARDINERIA - UNIDAD', 'Gardening - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 16.50, NULL, NULL, NULL),
(35, 'GUANTES DE JARDINERIA - PAR', 'Gardening - Proteccion - PAR', 'PAR', 0, NULL, 1.98, NULL, NULL, NULL),
(36, 'GAFAS DE PROTECCION - UNIDAD', 'Gardening - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 9.71, NULL, NULL, NULL),
(37, 'FIRST AID - UNIDAD', 'Cleaning - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 21.49, NULL, NULL, NULL),
(38, 'EAR MUFFS - UNIDAD', 'Gardening - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 10.99, NULL, NULL, NULL),
(39, 'CASCO DE PROTECCION NARANJA - UNIDAD', 'Gardening - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 132.00, NULL, NULL, NULL),
(40, 'CASCO DE PROTECCION BLANCO  - UNIDAD', 'Gardening - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 132.00, NULL, NULL, NULL),
(41, 'CASCO DE PROTECCION AMARILLO - UNIDAD', 'Gardening - Proteccion - UNIDAD', 'UNIDAD', 0, NULL, 132.00, NULL, NULL, NULL),
(42, 'TAPABOCAS - CAJA DE 50 MASCARAS', 'Cleaning - Proteccion - CAJA DE 50 MASCARAS', 'CAJA DE 50 MASCARAS', 0, NULL, 4.95, NULL, NULL, NULL),
(43, 'GUANTES DE NITRILO TALLA XL - CAJA DE 100 GUANTES', 'Cleaning - Proteccion - CAJA DE 100 GUANTES', 'CAJA DE 100 GUANTES', 0, NULL, 8.00, NULL, NULL, NULL),
(44, 'GUANTES DE NITRILO TALLA L - CAJA DE 100 GUANTES', 'Cleaning - Proteccion - CAJA DE 100 GUANTES', 'CAJA DE 100 GUANTES', 0, NULL, 8.00, NULL, NULL, NULL),
(45, 'GUANTES DE NITRILO TALLA M - CAJA DE 100 GUANTES', 'Cleaning - Proteccion - CAJA DE 100 GUANTES', 'CAJA DE 100 GUANTES', 0, NULL, 8.00, NULL, NULL, NULL),
(46, 'GUANTES DE NITRILO TALLA S - CAJA DE 100 GUANTES', 'Cleaning - Proteccion - CAJA DE 100 GUANTES', 'CAJA DE 100 GUANTES', 0, NULL, 8.00, NULL, NULL, NULL),
(47, 'BOMBILLO LED DOWN LIGTH NORMAL PUNTA - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 13.59, NULL, NULL, NULL),
(48, 'BOMBILLO LED DOWN LIGTH NORMAL BOTON - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 20.90, NULL, NULL, NULL),
(49, 'BOMBILLO LED DOWN LIGTH DIRECTO VISIBLE NEGRO -UN', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 26.13, NULL, NULL, NULL),
(50, 'BOMBILLO LED DOWN LIGTH DIRECTO PLANO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 26.13, NULL, NULL, NULL),
(51, 'BOMBILLO HALOGENO PHILLIPS MASTER PEQUEÑO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 6.79, NULL, NULL, NULL),
(52, 'BOMBILLO HALOGENO PHILLIPS MASTER MEDIANO  - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 8.20, NULL, NULL, NULL),
(53, 'BOMBILLO HALOGENO PHILLIPS MASTER LARGO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 8.20, NULL, NULL, NULL),
(54, 'BOMBILLO NORMAL ROSCA - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 11.99, NULL, NULL, NULL),
(55, 'BOMBILLO NORMAL CACHO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 8.80, NULL, NULL, NULL),
(56, 'BOMBILLO LAGRIMA ROSCA - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 6.60, NULL, NULL, NULL),
(57, 'BOMBILLO LAGRIMA CACHO - UNIDAD', 'Cleaning - Iluminación - UNIDAD', 'UNIDAD', 0, NULL, 12.10, NULL, NULL, NULL),
(58, 'PUNTAS DE MANGUERA - UNIDAD', 'Gardening - Riego - UNIDAD', 'UNIDAD', 0, NULL, 1.75, NULL, NULL, NULL),
(59, 'PISTOLA DE MANGUERA - UNIDAD', 'Gardening - Riego - UNIDAD', 'UNIDAD', 0, NULL, 5.49, NULL, NULL, NULL),
(60, 'MANGUERAS - UNIDAD', 'Gardening - Riego - UNIDAD', 'UNIDAD', 0, NULL, 93.50, NULL, NULL, NULL),
(61, 'CONECTOR DE MANGUERA - UNIDAD', 'Gardening - Riego - UNIDAD', 'UNIDAD', 0, NULL, 1.86, NULL, NULL, NULL),
(62, 'ACOPLES DE MANGUERA - UNIDAD', 'Gardening - Riego - UNIDAD', 'UNIDAD', 0, NULL, 1.75, NULL, NULL, NULL),
(63, 'LLAVEROS - UNIDAD', 'Cleaning - Multiuso - UNIDAD', 'UNIDAD', 0, NULL, 0.69, NULL, NULL, NULL),
(64, 'KIT DE HERRAMIENTA BASICA - UNIDAD', 'Gardening - Multiuso - UNIDAD', 'UNIDAD', 0, NULL, 98.99, NULL, NULL, NULL),
(65, 'EXTENSION DE CORRIENTE - UNIDAD', 'Cleaning - Multiuso - UNIDAD', 'UNIDAD', 0, NULL, 35.20, NULL, NULL, NULL),
(66, 'BATERIA REDONDA MEDIANA - SACHET', 'Cleaning - Multiuso - SACHET', 'SACHET', 0, NULL, 0.89, NULL, NULL, NULL),
(67, 'BATERIA REDONDA AAA - SACHET', 'Cleaning - Multiuso - SACHET', 'SACHET', 0, NULL, 0.89, NULL, NULL, NULL),
(68, 'BATERIA REDONDA AA - SACHET', 'Cleaning - Multiuso - SACHET', 'SACHET', 0, NULL, 1.07, NULL, NULL, NULL),
(69, 'BATERIA REDONDA A - SACHET', 'Cleaning - Multiuso - SACHET', 'SACHET', 0, NULL, 4.13, NULL, NULL, NULL),
(70, 'BATERIA CUADRADA - UNIDAD', 'Cleaning - Multiuso - UNIDAD', 'UNIDAD', 0, NULL, 10.45, NULL, NULL, NULL),
(71, 'INDICATOR BOLD BAÑO - UNIDAD', 'Cleaning - Baños - UNIDAD', 'UNIDAD', 0, NULL, 27.42, NULL, NULL, NULL),
(72, 'CHUPA DE BAÑO - UNIDAD', 'Cleaning - Baños - UNIDAD', 'UNIDAD', 0, NULL, 3.74, NULL, NULL, NULL),
(73, 'CEPILLO DE BAÑO - UNIDAD', 'Cleaning - Baños - UNIDAD', 'UNIDAD', 0, NULL, 2.20, NULL, NULL, NULL),
(74, 'BIZCOCHO DE BAÑO - UNIDAD', 'Cleaning - Baños - UNIDAD', 'UNIDAD', 0, NULL, 13.20, NULL, NULL, NULL),
(75, 'ACEITE MAQUINAS DOS TIEMPOS - 1 LT', 'Gardening - Jardineria - 1 LT', '1 LT', 0, NULL, 42.90, NULL, NULL, NULL),
(76, 'ACEITE PARA MAQUINARIA 10W-40 - 1 LT', 'Gardening - Jardineria - 1 LT', '1 LT', 0, NULL, 18.65, NULL, NULL, NULL),
(77, 'VALVULINA PARA MAQUINARIA - 1 LT', 'Gardening - Jardineria - 1 LT', '1 LT', 0, NULL, 18.65, NULL, NULL, NULL),
(78, 'WD40 LUBRICANTE - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 20.90, NULL, NULL, NULL),
(79, 'CUERDAS - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 9.90, NULL, NULL, NULL),
(80, 'PICO DE LORO GRANDE - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 35.37, NULL, NULL, NULL),
(81, 'PICO DE LORO PEQUEÑO - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 9.34, NULL, NULL, NULL),
(82, 'PALA LARGA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 61.16, NULL, NULL, NULL),
(83, 'PALA MEDIANA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 53.90, NULL, NULL, NULL),
(84, 'PALA CORTA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 60.50, NULL, NULL, NULL),
(85, 'TIJERAS - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 12.76, NULL, NULL, NULL),
(86, 'RASTRILLO METALICO - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 24.75, NULL, NULL, NULL),
(87, 'RASTRILLO PLASTICO - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 12.05, NULL, NULL, NULL),
(88, 'FILTRO MAQUINA JARDINERIA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 8.78, NULL, NULL, NULL),
(89, 'CABEZA DE GUADAÑA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 16.26, NULL, NULL, NULL),
(90, 'BUJIA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 4.68, NULL, NULL, NULL),
(91, 'CUERDA DE GUADAÑA - ROLLO', 'Gardening - Jardineria - ROLLO', 'ROLLO', 0, NULL, 26.40, NULL, NULL, NULL),
(92, 'EMBUDOS GASOLINA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 2.20, NULL, NULL, NULL),
(93, 'SEMILLAS - CAJA 1000 GR', 'Gardening - Jardineria - CAJA 1000 GR', 'CAJA 1000 GR', 0, NULL, 9.38, NULL, NULL, NULL),
(94, 'MATAMALEZA FRUTAL - FRASCO', 'Gardening - Jardineria - FRASCO', 'FRASCO', 0, NULL, 11.00, NULL, NULL, NULL),
(95, 'FERTILIZANTE LIQUIDO - 2,5 LT', 'Gardening - Jardineria - 2,5 LT', '2,5 LT', 0, NULL, 12.10, NULL, NULL, NULL),
(96, 'FERTILIZANTE GRANULADO GRANDE - 2 KL', 'Gardening - Jardineria - 500 GR', '500 GR', 0, NULL, 16.37, NULL, NULL, NULL),
(97, 'FERTILIZANTE GRANULADO PEQUEÑO - 500 GR', 'Gardening - Jardineria - 2 KL', '2 KL', 0, NULL, 5.48, NULL, NULL, NULL),
(98, 'PESTICIDA SPRAY RAID - OTROS - 250 GR', 'Gardening - Jardineria - 250 GR', '250 GR', 0, NULL, 13.09, NULL, NULL, NULL),
(99, 'PESTICIDA INSECTOS - 1 LT', 'Gardening - Jardineria - 1 LT', '1 LT', 0, NULL, 25.05, NULL, NULL, NULL),
(100, 'PESTICIDA ARAÑAS - 2 LT', 'Gardening - Jardineria - 2 LT', '2 LT', 0, NULL, 30.94, NULL, NULL, NULL),
(101, 'KILL MATAMALEZA GLIFOSATO - 1 LT', 'Gardening - Jardineria - 1 LT', '1 LT', 0, NULL, 11.24, NULL, NULL, NULL),
(102, 'GASOLINA VERDE - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 15.92, NULL, NULL, NULL),
(103, 'GASOLINA ROJA - UNIDAD', 'Gardening - Jardineria - UNIDAD', 'UNIDAD', 0, NULL, 11.63, NULL, NULL, NULL),
(104, 'BOLSAS 240 NEGRA HEAVY DUTY AZUL - PAQUETE DE 25 B', 'Gardening - Jardineria - PAQUETE DE 25 BOLSAS', 'PAQUETE DE 25 BOLSAS', 0, NULL, 7.16, NULL, NULL, NULL),
(105, 'BOLSAS 240 NEGRA EXTRA HEAVY D ROJA - PAQU DE 25 B', 'Gardening - Jardineria - PAQUETE DE 25 BOLSAS', 'PAQUETE DE 25 BOLSAS', 0, NULL, 14.76, NULL, NULL, NULL),
(106, 'BOLSAS 120 NEGRA HEAVY DUTY AZUL - PAQUETE DE 50 B', 'Cleaning - Pisos - PAQUETE DE 50 BOLSAS', 'PAQUETE DE 50 BOLSAS', 0, NULL, 9.99, NULL, NULL, NULL),
(107, 'BOLSAS 80 NEGRA HEAVY DUTY - PAQUETE DE 25 BOLSAS', 'Cleaning - Pisos - PAQUETE DE 25 BOLSAS', 'PAQUETE DE 25 BOLSAS', 0, NULL, 3.90, NULL, NULL, NULL),
(108, 'BOLSAS 36 NEGRA HEAVY DUTY - PAQUETE DE 50 BOLSAS', 'Cleaning - Pisos - PAQUETE DE 50 BOLSAS', 'PAQUETE DE 50 BOLSAS', 0, NULL, 1.72, NULL, NULL, NULL),
(109, 'KIT DE SQUEGUEE - ESPONJA, CUCHILLA Y LIMP - UNIDAD', 'Cleaning - Vidrios - UNIDAD', 'UNIDAD', 0, NULL, 121.00, NULL, NULL, NULL),
(110, 'ESPUMAS LIMP VIDRIOS - UNIDAD', 'Cleaning - Vidrios - UNIDAD', 'UNIDAD', 0, NULL, 15.68, NULL, NULL, NULL),
(111, 'CUCHILLAS VIDRIOS - UNIDAD', 'Cleaning - Vidrios - UNIDAD', 'UNIDAD', 0, NULL, 21.58, NULL, NULL, NULL),
(112, 'CAUCHOS VIDRIOS - UNIDAD', 'Cleaning - Vidrios - UNIDAD', 'UNIDAD', 0, NULL, 7.57, NULL, NULL, NULL),
(113, 'WINDOW CLEANER - 5 LT', 'Cleaning - Vidrios - 5 LT', '5 LT', 0, NULL, 12.42, NULL, NULL, NULL),
(114, 'BOLSA VACUUM TELA CUADRADA - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 4.35, NULL, NULL, NULL),
(115, 'BOLSA VACUUM PAPEL CUADRADA - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 1.90, NULL, NULL, NULL),
(116, 'GARDEN PRESSURE - SPRAY KILL O CARPET - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 14.16, NULL, NULL, NULL),
(117, 'FILTRO VACUUM TUBO - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 16.50, NULL, NULL, NULL),
(118, 'FILTRO VACUUM TELA - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 16.43, NULL, NULL, NULL),
(119, 'CARPET DETERGENT - 5 LT', 'Cleaning - Alfombras - 5 LT', '5 LT', 0, NULL, 49.98, NULL, NULL, NULL),
(120, 'BOLSA VACUUM TELA REGULAR - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 3.19, NULL, NULL, NULL),
(121, 'BOLSA VACUUM PAPEL REGULAR - UNIDAD', 'Cleaning - Alfombras - UNIDAD', 'UNIDAD', 0, NULL, 1.87, NULL, NULL, NULL),
(122, 'MICROFIBRA LIMIPIEZA CARROS - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 1.25, NULL, NULL, NULL),
(123, 'TRIGGERS - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 3.10, NULL, NULL, NULL),
(124, 'TARRO DISPENSADOR - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 2.50, NULL, NULL, NULL),
(125, 'SUGAR SOAP WIPES - 50 WIPES', 'Cleaning - Superficies - 50 WIPES', '50 WIPES', 0, NULL, 6.00, NULL, NULL, NULL),
(126, 'PALO EXTENSOR PLATEADO - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 59.00, NULL, NULL, NULL),
(127, 'PALO EXTENSOR DORADO TELESCOPICO - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 273.90, NULL, NULL, NULL),
(128, 'GUMPTION SUGAR - 750 GR', 'Cleaning - Superficies - 750 GR', '750 GR', 0, NULL, 7.43, NULL, NULL, NULL),
(129, 'GRAFFITI REMOVE - 5 LT', 'Cleaning - Superficies - 5 LT', '5 LT', 0, NULL, 71.50, NULL, NULL, NULL),
(130, 'ESPONJA VERDE DURA - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 0.50, NULL, NULL, NULL),
(131, 'ESPONJA MIX ESPUMA Y ABRASIVA - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 0.45, NULL, NULL, NULL),
(132, 'ESPONJA DE BRILLO - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 0.76, NULL, NULL, NULL),
(133, 'ESPONJA BLANCA - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 0.55, NULL, NULL, NULL),
(134, 'ESPONJA  ABRASIVA - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 1.78, NULL, NULL, NULL),
(135, 'CLEANER FLOOR LONG LIFE - 1 LT', 'Cleaning - Superficies - 1 LT', '1 LT', 0, NULL, 12.53, NULL, NULL, NULL),
(136, 'PINE CLEAN DESINFECTANT - 1,25 LT', 'Cleaning - Pisos - 1,25 LT', '1,25 LT', 0, NULL, 3.45, NULL, NULL, NULL),
(137, 'MOP MODINENLL NARANJA - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 36.28, NULL, NULL, NULL),
(138, 'SQUIGEE DE PISO - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 80.30, NULL, NULL, NULL),
(139, 'SCRUBBY PAD - PARA POLISHER - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 26.40, NULL, NULL, NULL),
(140, 'HAND SANITIZER - 5 LT', 'Cleaning - Manos - 5 LT', '5 LT', 0, NULL, 26.39, NULL, NULL, NULL),
(141, 'HAND SANITIZER - 50 ML', 'Cleaning - Manos - 50 ML', '50 ML', 0, NULL, 2.70, NULL, NULL, NULL),
(142, 'JABON MANOS EN DISPENSADOR - UNIDAD', 'Cleaning - Manos - UNIDAD', 'UNIDAD', 0, NULL, 19.80, NULL, NULL, NULL),
(143, 'LIQUID HAND WASH - 5 LT', 'Cleaning - Manos - 5 LT', '5 LT', 0, NULL, 13.09, NULL, NULL, NULL),
(144, 'INTERLEAVE TOILET TISS - PAPEL H. TISSUE - CAJA 36 PAQ', 'Cleaning - Manos - CAJA DE 36 PAQUETES', 'CAJA DE 36 PAQUETES', 0, NULL, 41.98, NULL, NULL, NULL),
(145, 'FACIAL TISSUE - CAJA DE 140 TISSUES', 'Cleaning - Manos - CAJA DE 140 TISSUES', 'CAJA DE 140 TISSUES', 0, NULL, 4.95, NULL, NULL, NULL),
(146, 'VALDE MOP - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 60.50, NULL, NULL, NULL),
(147, 'PALO DE TRAPERO - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 8.79, NULL, NULL, NULL),
(148, 'MOP TRAPEADOR VERDE - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 6.00, NULL, NULL, NULL),
(149, 'MOP TRAPEADOR ROJO - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 6.00, NULL, NULL, NULL),
(150, 'MOP TRAPEADOR AZUL - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 6.00, NULL, NULL, NULL),
(151, 'MOP TRAPEADOR BLANCO - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 21.34, NULL, NULL, NULL),
(152, 'CEPILLOS - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 10.99, NULL, NULL, NULL),
(153, 'ESCOBA - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 17.55, NULL, NULL, NULL),
(154, 'KIT RECOJEDOR Y ESCOBA - UNIDAD', 'Cleaning - Pisos - UNIDAD', 'UNIDAD', 0, NULL, 39.46, NULL, NULL, NULL),
(155, 'LIMPIADOR DE ARAÑAS - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 7.15, NULL, NULL, NULL),
(156, 'MOP MICROFIBRA - UNIDAD', 'Cleaning - Superficies - UNIDAD', 'UNIDAD', 0, NULL, 9.01, NULL, NULL, NULL),
(157, 'OIL STAINLESS - SUP METALICAS - 500 ML', 'Cleaning - Metalicas - 500 ML', '500 ML', 0, NULL, 8.70, NULL, NULL, NULL),
(158, 'TOILET BOWL CLEANER - 5 LT', 'Cleaning - Baños - 5 LT', '5 LT', 0, NULL, 19.56, NULL, NULL, NULL),
(159, 'CLIP OLOROSOS - UNIDAD', 'Cleaning - Baños - UNIDAD', 'UNIDAD', 0, NULL, 6.46, NULL, NULL, NULL),
(160, 'URINALES - UNIDAD', 'Cleaning - Baños - UNIDAD', 'UNIDAD', 0, NULL, 6.84, NULL, NULL, NULL),
(161, 'TRAPO VIDRIO - KIT 10', 'Cleaning - Superficies - KIT 10', 'KIT 10', 0, NULL, 25.52, NULL, NULL, NULL),
(162, 'TRAPO REGULAR - KIT 15', 'Cleaning - Superficies - KIT 15', 'KIT 15', 0, NULL, 11.55, NULL, NULL, NULL),
(163, 'SUGAR SOAP LIQUIDO - 750 ML', 'Cleaning - Superficies - 750 ML', '750 ML', 0, NULL, 7.43, NULL, NULL, NULL),
(164, 'PALMOLIVE - 500 ML', 'Cleaning - Superficies - 500 ML', '500 ML', 0, NULL, 6.23, NULL, NULL, NULL),
(165, 'MORNING FRESH - 900 ML', 'Cleaning - Superficies - 900 ML', '900 ML', 0, NULL, 5.13, 'https://res.cloudinary.com/dbwxxhmpj/image/upload/v1772436477/limpia/supplies/unzofwl01uzj9thq50vy.jpg', NULL, NULL),
(166, 'LONG LIFE AMONIA - 1 LT', 'Cleaning - Superficies - 1 LT', '1 LT', 0, NULL, 4.44, NULL, NULL, NULL),
(167, 'PUNCH - VIGOROUS DEGRASSER - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 23.56, NULL, NULL, NULL),
(168, 'VINAGRE - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 7.81, NULL, NULL, NULL),
(169, 'VINAGRE - 2 LT', 'Cleaning - Pisos - 2 LT', '2 LT', 0, NULL, 3.12, NULL, NULL, NULL),
(170, 'BLEACH LIQUIDO - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 6.50, NULL, NULL, NULL),
(171, 'BLEACH LIQUIDO - 2 LT', 'Cleaning - Pisos - 2 LT', '2 LT', 0, NULL, 2.50, NULL, NULL, NULL),
(172, 'BLEACH LIQUIDO - 1.25 LT', 'Cleaning - Pisos - 1.25 LT', '1.25 LT', 0, NULL, 1.50, NULL, NULL, NULL),
(173, 'CLORO CLEAN ESPESO - 5 LT', 'Cleaning - Pisos - 5 LT', '5 LT', 0, NULL, 26.33, NULL, NULL, NULL),
(174, 'DESINFECTANT AIR FRESHENER LIMON - 5 LT', 'Cleaning - Superficies - 5 LT', '5 LT', 0, NULL, 8.98, NULL, NULL, NULL),
(175, 'DESINFECTANT AIR FRESHENER MORADO LAVANDER- 5 LT', 'Cleaning - Superficies - 5 LT', '5 LT', 0, NULL, 29.18, NULL, NULL, NULL),
(176, 'HAND TOWEL ULTRASLIM - CAJA DE 16 PACKS', 'Cleaning - Manos - CAJA DE 16 PACKS', 'CAJA DE 16 PACKS', 0, NULL, 32.13, NULL, NULL, NULL),
(177, 'JUMBO PREMIUM - 8 ROLLS - CAJA DE 8 ROLLS', 'Cleaning - Manos - CAJA DE 8 ROLLS', 'CAJA DE 8 ROLLS', 0, NULL, 34.85, NULL, NULL, NULL),
(178, 'SUPER SOFT - BATHROOM TISSUE 48 ROLLS - CAJA DE 48 R', 'Cleaning - Manos - CAJA DE 48 ROLLS', 'CAJA DE 48 ROLLS', 0, NULL, 34.51, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `supply_orders`
--

CREATE TABLE `supply_orders` (
  `id` int(11) NOT NULL,
  `equipo_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `estado` enum('pendiente','aprobado','completado','rechazado') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supply_orders`
--

INSERT INTO `supply_orders` (`id`, `equipo_id`, `user_id`, `fecha`, `estado`) VALUES
(1, 1, 1, '2026-03-02', 'pendiente');

-- --------------------------------------------------------

--
-- Table structure for table `supply_order_items`
--

CREATE TABLE `supply_order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `supply_id` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supply_order_items`
--

INSERT INTO `supply_order_items` (`id`, `order_id`, `supply_id`, `cantidad`) VALUES
(1, 1, 165, 1);

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `numero` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`id`, `numero`, `activo`) VALUES
(1, 'Equipo 9', 1),
(2, 'Pruebas', 1);

-- --------------------------------------------------------

--
-- Table structure for table `team_site_assignments`
--

CREATE TABLE `team_site_assignments` (
  `id` int(11) NOT NULL,
  `team_id` int(11) DEFAULT NULL,
  `site_id` int(11) DEFAULT NULL,
  `frecuencia` enum('Diariamente','Semanalmente (un dia/semana)','Semanalmente (dos dias/semana)','Semanalmente (tres dias/semana)','Quincenalmente (un dia/semana)','Mensualmente (un dia/semana)','Casual') NOT NULL,
  `horas_por_trabajador` decimal(4,2) DEFAULT NULL,
  `hace_bins` tinyint(1) DEFAULT 0,
  `pago_bins` decimal(10,2) DEFAULT NULL,
  `fecha_asignacion` date DEFAULT curdate(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `team_site_assignments`
--

INSERT INTO `team_site_assignments` (`id`, `team_id`, `site_id`, `frecuencia`, `horas_por_trabajador`, `hace_bins`, `pago_bins`, `fecha_asignacion`, `activo`) VALUES
(1, 1, 4, 'Mensualmente (un dia/semana)', 1.25, 0, NULL, '2026-02-28', 0),
(2, 1, 1, 'Semanalmente (un dia/semana)', 0.00, 1, 0.25, '2026-03-01', 1),
(3, 1, 2, 'Mensualmente (un dia/semana)', 1.25, 0, NULL, '2026-03-01', 1),
(4, 1, 3, 'Semanalmente (un dia/semana)', 1.25, 0, NULL, '2026-03-01', 1),
(5, 1, 5, 'Mensualmente (un dia/semana)', 1.00, 0, NULL, '2026-03-01', 1),
(6, 1, 6, 'Semanalmente (un dia/semana)', 1.00, 1, 0.25, '2026-03-01', 1),
(7, 1, 7, 'Quincenalmente (un dia/semana)', 1.25, 1, 0.25, '2026-03-01', 1),
(8, 1, 8, 'Quincenalmente (un dia/semana)', 0.75, 0, NULL, '2026-03-01', 1),
(9, 1, 9, 'Mensualmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(10, 1, 10, 'Semanalmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(11, 1, 11, 'Quincenalmente (un dia/semana)', 1.50, 1, 0.25, '2026-03-01', 1),
(12, 1, 12, 'Mensualmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(13, 1, 13, 'Semanalmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(14, 1, 14, 'Quincenalmente (un dia/semana)', 1.00, 1, 0.25, '2026-03-01', 1),
(15, 1, 15, 'Mensualmente (un dia/semana)', 2.50, 0, NULL, '2026-03-01', 1),
(16, 1, 16, 'Semanalmente (un dia/semana)', 1.50, 1, 0.50, '2026-03-01', 1),
(17, 1, 17, 'Semanalmente (un dia/semana)', 1.25, 1, 0.25, '2026-02-28', 1),
(18, 1, 18, 'Mensualmente (un dia/semana)', 1.00, 0, NULL, '2026-03-01', 1),
(19, 1, 19, 'Semanalmente (un dia/semana)', 1.00, 0, NULL, '2026-03-01', 1),
(20, 1, 20, 'Mensualmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(21, 1, 21, 'Mensualmente (un dia/semana)', 1.25, 0, NULL, '2026-03-01', 1),
(22, 1, 22, 'Semanalmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(23, 1, 23, 'Mensualmente (un dia/semana)', 1.75, 0, NULL, '2026-03-01', 1),
(24, 1, 24, 'Semanalmente (un dia/semana)', 2.50, 1, 0.50, '2026-03-01', 1),
(25, 1, 25, 'Semanalmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(26, 1, 26, 'Semanalmente (un dia/semana)', 1.50, 1, 0.25, '2026-03-01', 1),
(27, 1, 27, 'Semanalmente (un dia/semana)', 1.00, 0, NULL, '2026-03-01', 1),
(28, 1, 28, 'Mensualmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(29, 1, 29, 'Semanalmente (un dia/semana)', 1.50, 1, 0.25, '2026-03-01', 1),
(30, 1, 30, 'Semanalmente (un dia/semana)', 0.00, 1, 0.25, '2026-03-01', 1),
(31, 1, 31, 'Quincenalmente (un dia/semana)', 1.00, 0, NULL, '2026-03-01', 1),
(32, 1, 32, 'Semanalmente (un dia/semana)', 1.00, 1, 0.25, '2026-03-01', 1),
(33, 1, 33, 'Quincenalmente (un dia/semana)', 1.00, 0, NULL, '2026-03-01', 1),
(34, 1, 34, 'Mensualmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(35, 1, 35, 'Quincenalmente (un dia/semana)', 1.00, 1, 0.25, '2026-03-01', 1),
(36, 1, 36, 'Quincenalmente (un dia/semana)', 1.25, 0, NULL, '2026-03-01', 1),
(37, 1, 37, 'Quincenalmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(38, 1, 38, 'Semanalmente (un dia/semana)', 1.50, 1, 0.25, '2026-03-01', 1),
(39, 1, 39, 'Quincenalmente (un dia/semana)', 1.50, 1, 0.25, '2026-03-01', 1),
(40, 1, 40, 'Quincenalmente (un dia/semana)', 1.25, 1, 0.25, '2026-03-01', 1),
(41, 1, 41, 'Semanalmente (un dia/semana)', 1.50, 1, 0.50, '2026-03-01', 1),
(42, 1, 42, 'Semanalmente (un dia/semana)', 1.50, 0, NULL, '2026-03-01', 1),
(43, 1, 4, 'Mensualmente (un dia/semana)', 1.25, 0, NULL, '2026-03-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `team_site_cycle_plan`
--

CREATE TABLE `team_site_cycle_plan` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `cycle_week` tinyint(4) NOT NULL,
  `week_comment` varchar(255) DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `team_site_cycle_plan`
--

INSERT INTO `team_site_cycle_plan` (`id`, `team_id`, `site_id`, `cycle_week`, `week_comment`, `color`, `active`, `created_at`, `updated_at`) VALUES
(1, 1, 26, 1, NULL, 'yellow', 1, '2026-03-02 10:01:19', '2026-03-07 02:01:42'),
(2, 1, 28, 4, NULL, NULL, 1, '2026-03-02 10:02:11', '2026-03-02 10:02:11'),
(3, 1, 14, 4, NULL, NULL, 1, '2026-03-02 10:02:26', '2026-03-07 01:40:56'),
(4, 1, 40, 4, NULL, NULL, 1, '2026-03-02 10:02:47', '2026-03-07 01:40:42'),
(5, 1, 29, 4, NULL, 'yellow', 1, '2026-03-02 10:03:19', '2026-03-07 02:38:56'),
(6, 1, 32, 4, NULL, 'red', 1, '2026-03-02 10:03:46', '2026-03-07 01:36:20'),
(7, 1, 30, 4, NULL, 'red', 1, '2026-03-02 10:04:09', '2026-03-07 01:35:59'),
(8, 1, 17, 4, NULL, NULL, 1, '2026-03-02 10:04:40', '2026-03-02 11:09:19'),
(9, 1, 24, 4, 'Interiores', NULL, 1, '2026-03-02 10:05:16', '2026-03-07 01:49:27'),
(10, 1, 38, 4, NULL, NULL, 1, '2026-03-02 10:05:43', '2026-03-07 01:34:47'),
(11, 1, 1, 4, NULL, NULL, 1, '2026-03-02 10:06:06', '2026-03-07 01:35:13'),
(12, 1, 26, 4, NULL, 'red', 1, '2026-03-02 10:06:25', '2026-03-02 10:50:32'),
(13, 1, 10, 4, NULL, NULL, 1, '2026-03-02 10:08:55', '2026-03-02 10:08:55'),
(14, 1, 34, 4, NULL, NULL, 1, '2026-03-02 10:49:45', '2026-03-02 10:49:45'),
(16, 1, 7, 4, NULL, NULL, 1, '2026-03-02 10:51:28', '2026-03-07 01:50:01'),
(17, 1, 6, 4, NULL, NULL, 1, '2026-03-02 10:52:03', '2026-03-07 01:49:48'),
(22, 1, 22, 4, NULL, NULL, 1, '2026-03-07 01:35:31', '2026-03-07 01:35:31'),
(23, 1, 13, 4, NULL, NULL, 1, '2026-03-07 01:35:43', '2026-03-07 01:35:43'),
(27, 1, 16, 4, NULL, NULL, 1, '2026-03-07 01:40:22', '2026-03-07 01:47:44'),
(31, 1, 39, 4, NULL, NULL, 1, '2026-03-07 01:48:01', '2026-03-07 01:52:59'),
(32, 1, 35, 4, NULL, NULL, 1, '2026-03-07 01:48:15', '2026-03-07 01:52:34'),
(33, 1, 11, 4, NULL, NULL, 1, '2026-03-07 01:48:34', '2026-03-07 01:52:21'),
(37, 1, 37, 4, NULL, NULL, 1, '2026-03-07 01:50:16', '2026-03-07 01:50:16'),
(38, 1, 19, 4, NULL, NULL, 1, '2026-03-07 01:50:44', '2026-03-07 01:50:44'),
(39, 1, 23, 4, NULL, NULL, 1, '2026-03-07 01:51:02', '2026-03-07 01:51:02'),
(40, 1, 21, 4, NULL, NULL, 1, '2026-03-07 01:51:12', '2026-03-07 01:51:12'),
(41, 1, 25, 4, NULL, NULL, 1, '2026-03-07 01:51:30', '2026-03-07 01:51:30'),
(42, 1, 12, 4, NULL, NULL, 1, '2026-03-07 01:51:50', '2026-03-07 01:51:50'),
(46, 1, 41, 4, NULL, NULL, 1, '2026-03-07 01:53:29', '2026-03-07 01:55:01'),
(47, 1, 42, 4, NULL, NULL, 1, '2026-03-07 01:54:20', '2026-03-07 01:54:20'),
(48, 1, 27, 4, NULL, NULL, 1, '2026-03-07 01:54:33', '2026-03-07 01:54:33'),
(51, 1, 3, 4, NULL, NULL, 1, '2026-03-07 01:55:27', '2026-03-07 01:55:27'),
(52, 1, 1, 1, NULL, NULL, 1, '2026-03-07 01:58:29', '2026-03-07 02:04:00'),
(53, 1, 38, 1, NULL, NULL, 1, '2026-03-07 01:58:42', '2026-03-07 02:03:16'),
(54, 1, 17, 1, NULL, NULL, 1, '2026-03-07 01:58:55', '2026-03-07 02:02:59'),
(55, 1, 24, 1, 'Exteriores', NULL, 1, '2026-03-07 01:59:12', '2026-03-07 02:03:43'),
(56, 1, 36, 1, NULL, NULL, 1, '2026-03-07 01:59:26', '2026-03-07 01:59:26'),
(57, 1, 30, 1, NULL, 'yellow', 1, '2026-03-07 01:59:37', '2026-03-07 02:04:34'),
(58, 1, 32, 1, NULL, 'yellow', 1, '2026-03-07 02:00:01', '2026-03-07 02:05:14'),
(59, 1, 29, 1, NULL, 'red', 1, '2026-03-07 02:00:18', '2026-03-07 02:59:11'),
(60, 1, 40, 1, NULL, NULL, 1, '2026-03-07 02:00:31', '2026-03-07 02:06:14'),
(61, 1, 14, 1, NULL, NULL, 1, '2026-03-07 02:00:43', '2026-03-07 02:06:26'),
(62, 1, 10, 1, NULL, NULL, 1, '2026-03-07 02:01:07', '2026-03-07 02:01:07'),
(64, 1, 7, 1, NULL, NULL, 1, '2026-03-07 02:02:02', '2026-03-07 02:07:43'),
(65, 1, 6, 1, NULL, NULL, 1, '2026-03-07 02:02:28', '2026-03-07 02:08:10'),
(66, 1, 5, 1, NULL, NULL, 1, '2026-03-07 02:02:42', '2026-03-07 02:02:42'),
(71, 1, 22, 1, NULL, NULL, 1, '2026-03-07 02:04:12', '2026-03-07 02:04:12'),
(72, 1, 13, 1, NULL, NULL, 1, '2026-03-07 02:04:23', '2026-03-07 02:04:23'),
(77, 1, 16, 1, NULL, NULL, 1, '2026-03-07 02:06:01', '2026-03-07 02:06:56'),
(81, 1, 39, 1, NULL, NULL, 1, '2026-03-07 02:07:05', '2026-03-07 02:10:38'),
(82, 1, 35, 1, NULL, NULL, 1, '2026-03-07 02:07:18', '2026-03-07 02:10:26'),
(83, 1, 11, 1, NULL, NULL, 1, '2026-03-07 02:07:29', '2026-03-07 02:10:08'),
(85, 1, 8, 1, NULL, NULL, 1, '2026-03-07 02:07:55', '2026-03-07 02:07:55'),
(87, 1, 33, 1, NULL, NULL, 1, '2026-03-07 02:08:31', '2026-03-07 02:08:31'),
(88, 1, 31, 1, NULL, NULL, 1, '2026-03-07 02:08:41', '2026-03-07 02:08:41'),
(89, 1, 41, 1, NULL, NULL, 1, '2026-03-07 02:09:09', '2026-03-07 02:11:39'),
(90, 1, 19, 1, NULL, NULL, 1, '2026-03-07 02:09:20', '2026-03-07 02:09:20'),
(91, 1, 18, 1, NULL, NULL, 1, '2026-03-07 02:09:30', '2026-03-07 02:09:30'),
(92, 1, 25, 1, NULL, NULL, 1, '2026-03-07 02:09:40', '2026-03-07 02:09:40'),
(96, 1, 3, 1, NULL, NULL, 1, '2026-03-07 02:11:16', '2026-03-07 02:11:16'),
(99, 1, 42, 1, '+1.25 Ext Jardineria', NULL, 1, '2026-03-07 02:11:55', '2026-03-07 02:12:15'),
(100, 1, 27, 1, NULL, NULL, 1, '2026-03-07 02:12:31', '2026-03-07 02:12:31'),
(103, 1, 26, 2, NULL, 'red', 1, '2026-03-07 02:43:15', '2026-03-07 03:02:19'),
(104, 1, 1, 2, NULL, NULL, 1, '2026-03-07 02:43:38', '2026-03-07 03:03:49'),
(105, 1, 38, 2, NULL, NULL, 1, '2026-03-07 02:43:50', '2026-03-07 03:03:21'),
(106, 1, 24, 2, NULL, NULL, 1, '2026-03-07 02:44:04', '2026-03-07 03:03:36'),
(107, 1, 17, 2, NULL, NULL, 1, '2026-03-07 02:44:30', '2026-03-07 03:03:07'),
(108, 1, 30, 2, NULL, 'red', 1, '2026-03-07 02:44:45', '2026-03-07 03:04:43'),
(109, 1, 32, 2, NULL, 'red', 1, '2026-03-07 02:45:05', '2026-03-07 03:04:54'),
(110, 1, 29, 2, NULL, 'yellow', 1, '2026-03-07 02:45:35', '2026-03-07 03:42:41'),
(111, 1, 40, 2, NULL, NULL, 1, '2026-03-07 02:45:55', '2026-03-07 03:05:55'),
(112, 1, 14, 2, NULL, NULL, 1, '2026-03-07 02:46:07', '2026-03-07 03:06:05'),
(113, 1, 10, 2, NULL, NULL, 1, '2026-03-07 03:02:01', '2026-03-07 03:02:01'),
(115, 1, 7, 2, NULL, NULL, 1, '2026-03-07 03:02:40', '2026-03-07 03:34:38'),
(116, 1, 6, 2, NULL, NULL, 1, '2026-03-07 03:02:54', '2026-03-07 03:34:26'),
(121, 1, 22, 2, NULL, NULL, 1, '2026-03-07 03:04:06', '2026-03-07 03:04:06'),
(122, 1, 13, 2, NULL, NULL, 1, '2026-03-07 03:04:27', '2026-03-07 03:04:27'),
(126, 1, 16, 2, NULL, NULL, 1, '2026-03-07 03:05:42', '2026-03-07 03:33:13'),
(130, 1, 39, 2, NULL, NULL, 1, '2026-03-07 03:33:26', '2026-03-07 03:36:44'),
(131, 1, 35, 2, NULL, NULL, 1, '2026-03-07 03:33:40', '2026-03-07 03:36:35'),
(132, 1, 11, 2, NULL, NULL, 1, '2026-03-07 03:34:10', '2026-03-07 03:36:19'),
(135, 1, 37, 2, NULL, NULL, 1, '2026-03-07 03:34:53', '2026-03-07 03:34:53'),
(136, 1, 19, 2, NULL, NULL, 1, '2026-03-07 03:35:26', '2026-03-07 03:35:26'),
(137, 1, 25, 2, NULL, NULL, 1, '2026-03-07 03:35:38', '2026-03-07 03:35:38'),
(138, 1, 4, 2, NULL, NULL, 1, '2026-03-07 03:35:48', '2026-03-07 03:35:48'),
(139, 1, 9, 2, NULL, NULL, 1, '2026-03-07 03:35:56', '2026-03-07 03:35:56'),
(143, 1, 41, 2, NULL, NULL, 1, '2026-03-07 03:37:10', '2026-03-07 03:42:55'),
(144, 1, 15, 2, NULL, NULL, 1, '2026-03-07 03:42:18', '2026-03-07 03:42:18'),
(145, 1, 3, 2, NULL, NULL, 1, '2026-03-07 03:42:29', '2026-03-07 03:42:29'),
(148, 1, 42, 2, NULL, NULL, 1, '2026-03-07 03:43:10', '2026-03-07 03:43:10'),
(149, 1, 27, 2, NULL, NULL, 1, '2026-03-07 03:43:24', '2026-03-07 03:43:24'),
(150, 1, 26, 3, NULL, 'yellow', 1, '2026-03-07 03:50:26', '2026-03-07 03:55:17'),
(151, 1, 1, 3, NULL, NULL, 1, '2026-03-07 03:51:25', '2026-03-07 03:57:56'),
(152, 1, 38, 3, NULL, NULL, 1, '2026-03-07 03:51:35', '2026-03-07 03:57:38'),
(153, 1, 24, 3, NULL, NULL, 1, '2026-03-07 03:51:52', '2026-03-07 03:57:19'),
(154, 1, 17, 3, NULL, NULL, 1, '2026-03-07 03:52:02', '2026-03-07 03:57:03'),
(155, 1, 36, 3, NULL, NULL, 1, '2026-03-07 03:52:31', '2026-03-07 03:52:31'),
(156, 1, 30, 3, NULL, 'yellow', 1, '2026-03-07 03:53:14', '2026-03-07 04:01:50'),
(157, 1, 32, 3, NULL, 'yellow', 1, '2026-03-07 03:53:28', '2026-03-07 04:01:58'),
(158, 1, 29, 3, NULL, 'red', 1, '2026-03-07 03:53:57', '2026-03-07 04:25:47'),
(159, 1, 40, 3, NULL, NULL, 1, '2026-03-07 03:54:12', '2026-03-07 04:02:36'),
(160, 1, 14, 3, NULL, NULL, 1, '2026-03-07 03:54:23', '2026-03-07 04:02:44'),
(161, 1, 10, 3, NULL, NULL, 1, '2026-03-07 03:55:02', '2026-03-07 03:55:02'),
(163, 1, 7, 3, NULL, NULL, 1, '2026-03-07 03:55:38', '2026-03-07 04:03:37'),
(164, 1, 6, 3, NULL, NULL, 1, '2026-03-07 03:55:55', '2026-03-07 04:03:59'),
(169, 1, 22, 3, NULL, NULL, 1, '2026-03-07 03:58:32', '2026-03-07 03:58:32'),
(170, 1, 13, 3, NULL, NULL, 1, '2026-03-07 04:01:36', '2026-03-07 04:01:36'),
(174, 1, 16, 3, NULL, NULL, 1, '2026-03-07 04:02:27', '2026-03-07 04:05:16'),
(177, 1, 31, 3, NULL, NULL, 1, '2026-03-07 04:03:12', '2026-03-07 04:03:12'),
(178, 1, 33, 3, NULL, NULL, 1, '2026-03-07 04:03:20', '2026-03-07 04:03:20'),
(180, 1, 8, 3, NULL, NULL, 1, '2026-03-07 04:03:45', '2026-03-07 04:03:45'),
(182, 1, 11, 3, NULL, NULL, 1, '2026-03-07 04:04:19', '2026-03-07 04:07:03'),
(183, 1, 35, 3, NULL, NULL, 1, '2026-03-07 04:04:53', '2026-03-07 04:07:25'),
(184, 1, 39, 3, NULL, NULL, 1, '2026-03-07 04:05:02', '2026-03-07 04:07:38'),
(186, 1, 19, 3, NULL, NULL, 1, '2026-03-07 04:06:10', '2026-03-07 04:06:10'),
(187, 1, 25, 3, NULL, NULL, 1, '2026-03-07 04:06:25', '2026-03-07 04:06:25'),
(188, 1, 2, 3, NULL, NULL, 1, '2026-03-07 04:06:42', '2026-03-07 04:06:42'),
(192, 1, 41, 3, NULL, NULL, 1, '2026-03-07 04:07:47', '2026-03-07 04:26:09'),
(193, 1, 3, 3, NULL, NULL, 1, '2026-03-07 04:25:34', '2026-03-07 04:25:34'),
(195, 1, 20, 3, NULL, NULL, 1, '2026-03-07 04:25:58', '2026-03-07 04:25:58'),
(197, 1, 42, 3, NULL, NULL, 1, '2026-03-07 04:26:22', '2026-03-07 04:26:22'),
(198, 1, 27, 3, NULL, NULL, 1, '2026-03-07 04:26:59', '2026-03-07 04:26:59');

-- --------------------------------------------------------

--
-- Table structure for table `team_site_cycle_plan_items`
--

CREATE TABLE `team_site_cycle_plan_items` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `assignment_id` int(11) DEFAULT NULL,
  `day_of_week` tinyint(4) NOT NULL,
  `entry_type` enum('SERVICE','BINS') NOT NULL,
  `display_value` decimal(10,2) NOT NULL,
  `item_comment` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `team_site_cycle_plan_items`
--

INSERT INTO `team_site_cycle_plan_items` (`id`, `plan_id`, `assignment_id`, `day_of_week`, `entry_type`, `display_value`, `item_comment`, `created_at`, `updated_at`) VALUES
(1, 1, 26, 1, 'SERVICE', 1.50, NULL, '2026-03-02 10:01:19', '2026-03-02 10:01:19'),
(2, 2, 28, 1, 'SERVICE', 1.50, NULL, '2026-03-02 10:02:12', '2026-03-02 10:02:12'),
(3, 3, 14, 1, 'SERVICE', 1.00, NULL, '2026-03-02 10:02:26', '2026-03-02 10:02:26'),
(4, 4, 40, 1, 'SERVICE', 1.25, NULL, '2026-03-02 10:02:47', '2026-03-02 10:02:47'),
(5, 5, 29, 1, 'BINS', 0.25, NULL, '2026-03-02 10:03:19', '2026-03-02 10:03:19'),
(6, 6, 32, 1, 'SERVICE', 1.00, NULL, '2026-03-02 10:03:47', '2026-03-02 10:03:47'),
(7, 7, 30, 1, 'BINS', 0.25, NULL, '2026-03-02 10:04:09', '2026-03-02 10:04:09'),
(8, 8, 17, 1, 'SERVICE', 1.25, NULL, '2026-03-02 10:04:40', '2026-03-07 03:45:48'),
(9, 9, 24, 1, 'BINS', 0.50, NULL, '2026-03-02 10:05:17', '2026-03-02 10:05:17'),
(10, 10, 38, 1, 'SERVICE', 1.50, NULL, '2026-03-02 10:05:44', '2026-03-02 10:05:44'),
(11, 11, 2, 1, 'BINS', 0.25, NULL, '2026-03-02 10:06:07', '2026-03-02 10:06:07'),
(12, 12, 26, 1, 'SERVICE', 1.50, NULL, '2026-03-02 10:06:25', '2026-03-02 10:06:25'),
(13, 13, 10, 2, 'SERVICE', 1.50, NULL, '2026-03-02 10:08:56', '2026-03-02 10:08:56'),
(14, 14, 34, 2, 'SERVICE', 1.50, NULL, '2026-03-02 10:49:45', '2026-03-02 10:49:45'),
(15, 12, 26, 2, 'BINS', 0.25, NULL, '2026-03-02 10:50:25', '2026-03-02 10:50:25'),
(16, 16, 7, 2, 'BINS', 0.25, NULL, '2026-03-02 10:51:28', '2026-03-02 10:51:28'),
(17, 17, 6, 2, 'SERVICE', 1.00, NULL, '2026-03-02 10:52:04', '2026-03-02 10:52:04'),
(18, 8, 17, 2, 'BINS', 0.25, NULL, '2026-03-02 10:52:25', '2026-03-02 10:52:25'),
(19, 10, 38, 2, 'BINS', 0.25, NULL, '2026-03-07 01:34:47', '2026-03-07 01:34:47'),
(20, 9, 24, 2, 'BINS', 0.50, NULL, '2026-03-07 01:35:01', '2026-03-07 01:35:01'),
(21, 11, 2, 2, 'BINS', 0.25, NULL, '2026-03-07 01:35:14', '2026-03-07 01:35:14'),
(22, 22, 22, 2, 'SERVICE', 1.50, NULL, '2026-03-07 01:35:31', '2026-03-07 01:35:31'),
(23, 23, 13, 2, 'SERVICE', 1.50, NULL, '2026-03-07 01:35:43', '2026-03-07 01:35:43'),
(24, 7, 30, 2, 'BINS', 0.25, NULL, '2026-03-07 01:36:00', '2026-03-07 01:36:00'),
(25, 6, 32, 2, 'BINS', 0.25, NULL, '2026-03-07 01:36:20', '2026-03-07 01:36:20'),
(26, 5, 29, 2, 'SERVICE', 0.50, '+0.25 extra limpieza vidrios', '2026-03-07 01:37:07', '2026-03-07 03:45:37'),
(27, 27, 16, 2, 'BINS', 0.50, NULL, '2026-03-07 01:40:22', '2026-03-07 01:40:22'),
(28, 4, 40, 2, 'BINS', 0.25, NULL, '2026-03-07 01:40:43', '2026-03-07 01:40:43'),
(29, 3, 14, 2, 'BINS', 0.25, NULL, '2026-03-07 01:40:56', '2026-03-07 01:40:56'),
(30, 27, 16, 3, 'SERVICE', 1.50, NULL, '2026-03-07 01:47:44', '2026-03-07 01:47:44'),
(31, 31, 39, 3, 'SERVICE', 1.50, NULL, '2026-03-07 01:48:01', '2026-03-07 01:48:01'),
(32, 32, 35, 3, 'SERVICE', 1.00, NULL, '2026-03-07 01:48:15', '2026-03-07 01:48:15'),
(33, 33, 11, 3, 'BINS', 0.25, NULL, '2026-03-07 01:48:34', '2026-03-07 01:48:34'),
(34, 9, 24, 3, 'SERVICE', 2.00, NULL, '2026-03-07 01:49:02', '2026-03-07 03:46:19'),
(35, 17, 6, 3, 'BINS', 0.25, NULL, '2026-03-07 01:49:48', '2026-03-07 01:49:48'),
(36, 16, 7, 3, 'BINS', 0.25, NULL, '2026-03-07 01:50:01', '2026-03-07 01:50:01'),
(37, 37, 37, 3, 'SERVICE', 1.50, NULL, '2026-03-07 01:50:16', '2026-03-07 01:50:16'),
(38, 38, 19, 4, 'SERVICE', 1.00, NULL, '2026-03-07 01:50:44', '2026-03-07 01:50:44'),
(39, 39, 23, 4, 'SERVICE', 1.75, NULL, '2026-03-07 01:51:02', '2026-03-07 01:51:02'),
(40, 40, 21, 4, 'SERVICE', 1.25, NULL, '2026-03-07 01:51:12', '2026-03-07 01:51:12'),
(41, 41, 25, 4, 'SERVICE', 1.50, NULL, '2026-03-07 01:51:31', '2026-03-07 01:51:31'),
(42, 42, 12, 4, 'SERVICE', 1.50, NULL, '2026-03-07 01:51:50', '2026-03-07 01:51:50'),
(43, 33, 11, 4, 'BINS', 0.25, NULL, '2026-03-07 01:52:21', '2026-03-07 01:52:21'),
(44, 32, 35, 4, 'BINS', 0.25, NULL, '2026-03-07 01:52:34', '2026-03-07 01:52:34'),
(45, 31, 39, 4, 'BINS', 0.25, NULL, '2026-03-07 01:52:59', '2026-03-07 01:52:59'),
(46, 46, 41, 4, 'BINS', 0.50, NULL, '2026-03-07 01:53:30', '2026-03-07 01:53:30'),
(47, 47, 42, 5, 'SERVICE', 1.50, NULL, '2026-03-07 01:54:21', '2026-03-07 01:54:21'),
(48, 48, 27, 5, 'SERVICE', 1.00, NULL, '2026-03-07 01:54:34', '2026-03-07 01:54:34'),
(49, 46, 41, 5, 'SERVICE', 1.50, NULL, '2026-03-07 01:55:01', '2026-03-07 01:55:01'),
(50, 5, 29, 5, 'SERVICE', 1.50, NULL, '2026-03-07 01:55:12', '2026-03-07 01:55:12'),
(51, 51, 4, 5, 'SERVICE', 1.25, NULL, '2026-03-07 01:55:27', '2026-03-07 01:55:27'),
(52, 52, 2, 1, 'BINS', 0.25, NULL, '2026-03-07 01:58:29', '2026-03-07 01:58:29'),
(53, 53, 38, 1, 'SERVICE', 1.50, NULL, '2026-03-07 01:58:43', '2026-03-07 01:58:43'),
(54, 54, 17, 1, 'SERVICE', 1.50, 'test', '2026-03-07 01:58:55', '2026-03-07 02:56:21'),
(55, 55, 24, 1, 'BINS', 0.50, NULL, '2026-03-07 01:59:13', '2026-03-07 01:59:13'),
(56, 56, 36, 1, 'SERVICE', 1.25, NULL, '2026-03-07 01:59:27', '2026-03-07 01:59:27'),
(57, 57, 30, 1, 'BINS', 0.25, NULL, '2026-03-07 01:59:37', '2026-03-07 01:59:37'),
(58, 58, 32, 1, 'SERVICE', 1.00, NULL, '2026-03-07 02:00:01', '2026-03-07 02:00:01'),
(59, 59, 29, 1, 'SERVICE', 1.50, NULL, '2026-03-07 02:00:19', '2026-03-07 02:00:19'),
(60, 60, 40, 1, 'SERVICE', 1.25, NULL, '2026-03-07 02:00:31', '2026-03-07 02:00:31'),
(61, 61, 14, 1, 'SERVICE', 1.00, NULL, '2026-03-07 02:00:43', '2026-03-07 02:00:43'),
(62, 62, 10, 2, 'SERVICE', 1.50, NULL, '2026-03-07 02:01:08', '2026-03-07 02:01:08'),
(63, 1, 26, 2, 'BINS', 0.25, NULL, '2026-03-07 02:01:41', '2026-03-07 02:01:41'),
(64, 64, 7, 2, 'BINS', 0.25, NULL, '2026-03-07 02:02:02', '2026-03-07 02:02:02'),
(65, 65, 6, 2, 'SERVICE', 1.00, NULL, '2026-03-07 02:02:29', '2026-03-07 02:02:29'),
(66, 66, 5, 2, 'SERVICE', 1.00, NULL, '2026-03-07 02:02:42', '2026-03-07 02:02:42'),
(67, 54, 17, 2, 'BINS', 0.25, NULL, '2026-03-07 02:02:59', '2026-03-07 02:02:59'),
(68, 53, 38, 2, 'BINS', 0.25, NULL, '2026-03-07 02:03:16', '2026-03-07 02:03:16'),
(69, 55, 24, 2, 'SERVICE', 2.50, NULL, '2026-03-07 02:03:26', '2026-03-07 02:03:26'),
(70, 52, 2, 2, 'BINS', 0.25, NULL, '2026-03-07 02:04:00', '2026-03-07 02:04:00'),
(71, 71, 22, 2, 'SERVICE', 1.50, NULL, '2026-03-07 02:04:13', '2026-03-07 02:04:13'),
(72, 72, 13, 2, 'SERVICE', 1.50, NULL, '2026-03-07 02:04:23', '2026-03-07 02:04:23'),
(73, 57, 30, 2, 'BINS', 0.25, NULL, '2026-03-07 02:04:34', '2026-03-07 02:04:34'),
(75, 58, 32, 2, 'BINS', 0.25, NULL, '2026-03-07 02:05:14', '2026-03-07 02:05:14'),
(76, 59, 29, 2, 'BINS', 0.25, '+025 Ext Limpieza de vidrios', '2026-03-07 02:05:31', '2026-03-07 02:59:11'),
(77, 77, 16, 2, 'BINS', 0.50, NULL, '2026-03-07 02:06:01', '2026-03-07 02:06:01'),
(78, 60, 40, 2, 'BINS', 0.25, NULL, '2026-03-07 02:06:14', '2026-03-07 02:06:14'),
(79, 61, 14, 2, 'BINS', 0.25, NULL, '2026-03-07 02:06:26', '2026-03-07 02:06:26'),
(80, 77, 16, 3, 'SERVICE', 1.50, NULL, '2026-03-07 02:06:57', '2026-03-07 02:06:57'),
(81, 81, 39, 3, 'BINS', 0.25, NULL, '2026-03-07 02:07:05', '2026-03-07 02:07:05'),
(82, 82, 35, 3, 'BINS', 0.25, NULL, '2026-03-07 02:07:18', '2026-03-07 02:07:18'),
(83, 83, 11, 3, 'BINS', 0.25, NULL, '2026-03-07 02:07:29', '2026-03-07 02:07:29'),
(84, 64, 7, 3, 'SERVICE', 1.25, NULL, '2026-03-07 02:07:43', '2026-03-07 02:07:43'),
(85, 85, 8, 3, 'SERVICE', 0.75, NULL, '2026-03-07 02:07:55', '2026-03-07 02:07:55'),
(86, 65, 6, 3, 'BINS', 0.25, NULL, '2026-03-07 02:08:10', '2026-03-07 02:08:10'),
(87, 87, 33, 3, 'SERVICE', 1.00, NULL, '2026-03-07 02:08:31', '2026-03-07 02:08:31'),
(88, 88, 31, 3, 'SERVICE', 1.00, NULL, '2026-03-07 02:08:41', '2026-03-07 02:08:41'),
(89, 89, 41, 4, 'BINS', 0.50, NULL, '2026-03-07 02:09:09', '2026-03-07 02:09:09'),
(90, 90, 19, 4, 'SERVICE', 1.00, NULL, '2026-03-07 02:09:21', '2026-03-07 02:09:21'),
(91, 91, 18, 4, 'SERVICE', 1.00, NULL, '2026-03-07 02:09:30', '2026-03-07 02:09:30'),
(92, 92, 25, 4, 'SERVICE', 1.50, NULL, '2026-03-07 02:09:41', '2026-03-07 02:09:41'),
(93, 83, 11, 4, 'SERVICE', 1.50, NULL, '2026-03-07 02:10:09', '2026-03-07 02:10:09'),
(94, 82, 35, 4, 'SERVICE', 1.00, NULL, '2026-03-07 02:10:27', '2026-03-07 02:10:27'),
(95, 81, 39, 4, 'BINS', 0.25, NULL, '2026-03-07 02:10:38', '2026-03-07 02:10:38'),
(96, 96, 4, 5, 'SERVICE', 1.25, NULL, '2026-03-07 02:11:16', '2026-03-07 02:11:16'),
(97, 59, 29, 5, 'SERVICE', 1.50, NULL, '2026-03-07 02:11:26', '2026-03-07 02:11:26'),
(98, 89, 41, 5, 'SERVICE', 1.50, NULL, '2026-03-07 02:11:39', '2026-03-07 02:11:39'),
(99, 99, 42, 5, 'SERVICE', 1.50, NULL, '2026-03-07 02:11:55', '2026-03-07 02:11:55'),
(100, 100, 27, 5, 'SERVICE', 1.00, NULL, '2026-03-07 02:12:31', '2026-03-07 02:12:31'),
(103, 103, 26, 1, 'SERVICE', 1.50, NULL, '2026-03-07 02:43:16', '2026-03-07 02:43:16'),
(104, 104, 2, 1, 'BINS', 0.25, NULL, '2026-03-07 02:43:38', '2026-03-07 02:43:38'),
(105, 105, 38, 1, 'SERVICE', 1.50, NULL, '2026-03-07 02:43:50', '2026-03-07 02:43:50'),
(106, 106, 24, 1, 'BINS', 0.50, NULL, '2026-03-07 02:44:04', '2026-03-07 02:44:04'),
(107, 107, 17, 1, 'SERVICE', 1.25, NULL, '2026-03-07 02:44:30', '2026-03-07 03:18:44'),
(108, 108, 30, 1, 'BINS', 0.25, NULL, '2026-03-07 02:44:45', '2026-03-07 02:44:45'),
(109, 109, 32, 1, 'SERVICE', 1.00, NULL, '2026-03-07 02:45:05', '2026-03-07 02:45:05'),
(110, 110, 29, 1, 'BINS', 0.25, NULL, '2026-03-07 02:45:36', '2026-03-07 02:45:36'),
(111, 111, 40, 1, 'SERVICE', 1.25, NULL, '2026-03-07 02:45:56', '2026-03-07 02:45:56'),
(112, 112, 14, 1, 'SERVICE', 1.00, NULL, '2026-03-07 02:46:07', '2026-03-07 02:46:07'),
(113, 113, 10, 2, 'SERVICE', 1.50, NULL, '2026-03-07 03:02:02', '2026-03-07 03:02:02'),
(114, 103, 26, 2, 'SERVICE', 1.50, NULL, '2026-03-07 03:02:20', '2026-03-07 03:02:20'),
(115, 115, 7, 2, 'BINS', 0.25, NULL, '2026-03-07 03:02:40', '2026-03-07 03:02:40'),
(116, 116, 6, 2, 'SERVICE', 1.00, NULL, '2026-03-07 03:02:55', '2026-03-07 03:02:55'),
(117, 107, 17, 2, 'SERVICE', 1.25, NULL, '2026-03-07 03:03:07', '2026-03-07 03:03:07'),
(118, 105, 38, 2, 'BINS', 0.25, NULL, '2026-03-07 03:03:21', '2026-03-07 03:03:21'),
(119, 106, 24, 2, 'SERVICE', 2.50, 'Interiores', '2026-03-07 03:03:36', '2026-03-07 03:03:36'),
(120, 104, 2, 2, 'BINS', 0.25, NULL, '2026-03-07 03:03:50', '2026-03-07 03:03:50'),
(121, 121, 22, 2, 'SERVICE', 1.50, NULL, '2026-03-07 03:04:06', '2026-03-07 03:04:06'),
(122, 122, 13, 2, 'SERVICE', 1.50, NULL, '2026-03-07 03:04:27', '2026-03-07 03:04:27'),
(123, 108, 30, 2, 'BINS', 0.25, NULL, '2026-03-07 03:04:43', '2026-03-07 03:04:43'),
(124, 109, 32, 2, 'BINS', 0.25, NULL, '2026-03-07 03:04:54', '2026-03-07 03:04:54'),
(125, 110, 29, 2, 'BINS', 0.50, '+0.25 Ext Limpieza vidrios', '2026-03-07 03:05:21', '2026-03-07 03:19:00'),
(126, 126, 16, 2, 'BINS', 0.50, NULL, '2026-03-07 03:05:43', '2026-03-07 03:05:43'),
(127, 111, 40, 2, 'BINS', 0.25, NULL, '2026-03-07 03:05:55', '2026-03-07 03:05:55'),
(128, 112, 14, 2, 'BINS', 0.25, NULL, '2026-03-07 03:06:05', '2026-03-07 03:06:05'),
(129, 126, 16, 3, 'SERVICE', 1.50, NULL, '2026-03-07 03:33:13', '2026-03-07 03:33:13'),
(130, 130, 39, 3, 'SERVICE', 1.50, NULL, '2026-03-07 03:33:26', '2026-03-07 03:33:26'),
(131, 131, 35, 3, 'SERVICE', 1.00, NULL, '2026-03-07 03:33:40', '2026-03-07 03:33:40'),
(132, 132, 11, 3, 'BINS', 0.25, NULL, '2026-03-07 03:34:10', '2026-03-07 03:34:10'),
(133, 116, 6, 3, 'BINS', 0.25, NULL, '2026-03-07 03:34:26', '2026-03-07 03:34:26'),
(134, 115, 7, 3, 'BINS', 0.25, NULL, '2026-03-07 03:34:38', '2026-03-07 03:34:38'),
(135, 135, 37, 3, 'SERVICE', 1.50, NULL, '2026-03-07 03:34:53', '2026-03-07 03:34:53'),
(136, 136, 19, 4, 'SERVICE', 1.00, NULL, '2026-03-07 03:35:26', '2026-03-07 03:35:26'),
(137, 137, 25, 4, 'SERVICE', 1.50, NULL, '2026-03-07 03:35:38', '2026-03-07 03:35:38'),
(138, 138, 43, 4, 'SERVICE', 1.25, NULL, '2026-03-07 03:35:48', '2026-03-07 03:35:48'),
(139, 139, 9, 4, 'SERVICE', 1.50, NULL, '2026-03-07 03:35:56', '2026-03-07 03:35:56'),
(140, 132, 11, 4, 'BINS', 0.25, NULL, '2026-03-07 03:36:19', '2026-03-07 03:36:19'),
(141, 131, 35, 4, 'BINS', 0.25, NULL, '2026-03-07 03:36:35', '2026-03-07 03:36:35'),
(142, 130, 39, 4, 'BINS', 0.25, NULL, '2026-03-07 03:36:44', '2026-03-07 03:36:44'),
(143, 143, 41, 4, 'BINS', 0.50, NULL, '2026-03-07 03:37:10', '2026-03-07 03:37:10'),
(144, 144, 15, 5, 'SERVICE', 2.50, NULL, '2026-03-07 03:42:19', '2026-03-07 03:42:19'),
(145, 145, 4, 5, 'SERVICE', 1.25, NULL, '2026-03-07 03:42:29', '2026-03-07 03:42:29'),
(146, 110, 29, 5, 'SERVICE', 1.50, NULL, '2026-03-07 03:42:41', '2026-03-07 03:42:41'),
(147, 143, 41, 5, 'SERVICE', 1.50, NULL, '2026-03-07 03:42:55', '2026-03-07 03:42:55'),
(148, 148, 42, 5, 'SERVICE', 1.50, NULL, '2026-03-07 03:43:10', '2026-03-07 03:43:10'),
(149, 149, 27, 5, 'SERVICE', 1.00, NULL, '2026-03-07 03:43:24', '2026-03-07 03:43:24'),
(150, 150, 26, 1, 'SERVICE', 1.50, NULL, '2026-03-07 03:50:26', '2026-03-07 03:50:26'),
(151, 151, 2, 1, 'BINS', 0.25, NULL, '2026-03-07 03:51:26', '2026-03-07 03:51:26'),
(152, 152, 38, 1, 'SERVICE', 1.50, NULL, '2026-03-07 03:51:36', '2026-03-07 03:51:36'),
(153, 153, 24, 1, 'BINS', 0.50, NULL, '2026-03-07 03:51:52', '2026-03-07 03:51:52'),
(154, 154, 17, 1, 'SERVICE', 1.25, NULL, '2026-03-07 03:52:02', '2026-03-07 03:52:02'),
(155, 155, 36, 1, 'SERVICE', 1.25, NULL, '2026-03-07 03:52:31', '2026-03-07 03:52:31'),
(156, 156, 30, 1, 'BINS', 0.25, NULL, '2026-03-07 03:53:15', '2026-03-07 03:53:15'),
(157, 157, 32, 1, 'SERVICE', 1.00, NULL, '2026-03-07 03:53:28', '2026-03-07 03:53:28'),
(158, 158, 29, 1, 'BINS', 0.25, NULL, '2026-03-07 03:53:57', '2026-03-07 03:53:57'),
(159, 159, 40, 1, 'BINS', 0.25, NULL, '2026-03-07 03:54:13', '2026-03-07 03:54:13'),
(160, 160, 14, 1, 'BINS', 0.25, NULL, '2026-03-07 03:54:23', '2026-03-07 03:54:23'),
(161, 161, 10, 2, 'SERVICE', 1.50, NULL, '2026-03-07 03:55:03', '2026-03-07 03:55:03'),
(162, 150, 26, 2, 'BINS', 0.25, NULL, '2026-03-07 03:55:18', '2026-03-07 03:55:18'),
(163, 163, 7, 2, 'BINS', 0.25, NULL, '2026-03-07 03:55:38', '2026-03-07 03:55:38'),
(164, 164, 6, 2, 'SERVICE', 1.00, NULL, '2026-03-07 03:55:55', '2026-03-07 03:55:55'),
(165, 154, 17, 2, 'BINS', 0.25, NULL, '2026-03-07 03:57:03', '2026-03-07 03:57:03'),
(166, 153, 24, 2, 'SERVICE', 2.50, 'Exteriores', '2026-03-07 03:57:19', '2026-03-07 03:57:19'),
(167, 152, 38, 2, 'BINS', 0.25, NULL, '2026-03-07 03:57:39', '2026-03-07 03:57:39'),
(168, 151, 2, 2, 'BINS', 0.25, NULL, '2026-03-07 03:57:56', '2026-03-07 03:57:56'),
(169, 169, 22, 2, 'SERVICE', 1.50, NULL, '2026-03-07 03:58:32', '2026-03-07 03:58:32'),
(170, 170, 13, 2, 'SERVICE', 1.50, NULL, '2026-03-07 04:01:36', '2026-03-07 04:01:36'),
(171, 156, 30, 2, 'BINS', 0.25, NULL, '2026-03-07 04:01:50', '2026-03-07 04:01:50'),
(172, 157, 32, 2, 'SERVICE', 1.00, NULL, '2026-03-07 04:01:58', '2026-03-07 04:01:58'),
(173, 158, 29, 2, 'SERVICE', 0.50, NULL, '2026-03-07 04:02:13', '2026-03-07 04:02:13'),
(174, 174, 16, 2, 'BINS', 0.50, NULL, '2026-03-07 04:02:28', '2026-03-07 04:02:28'),
(175, 159, 40, 2, 'BINS', 0.25, NULL, '2026-03-07 04:02:37', '2026-03-07 04:02:37'),
(176, 160, 14, 2, 'BINS', 0.25, NULL, '2026-03-07 04:02:45', '2026-03-07 04:02:45'),
(177, 177, 31, 3, 'SERVICE', 1.00, NULL, '2026-03-07 04:03:12', '2026-03-07 04:03:12'),
(178, 178, 33, 3, 'SERVICE', 1.00, NULL, '2026-03-07 04:03:21', '2026-03-07 04:03:21'),
(179, 163, 7, 3, 'SERVICE', 1.25, NULL, '2026-03-07 04:03:38', '2026-03-07 04:03:38'),
(180, 180, 8, 3, 'SERVICE', 0.75, NULL, '2026-03-07 04:03:46', '2026-03-07 04:03:46'),
(181, 164, 6, 3, 'BINS', 0.25, NULL, '2026-03-07 04:03:59', '2026-03-07 04:03:59'),
(182, 182, 11, 3, 'BINS', 0.25, NULL, '2026-03-07 04:04:19', '2026-03-07 04:04:19'),
(183, 183, 35, 3, 'BINS', 0.25, NULL, '2026-03-07 04:04:53', '2026-03-07 04:04:53'),
(184, 184, 39, 3, 'BINS', 0.25, NULL, '2026-03-07 04:05:02', '2026-03-07 04:05:02'),
(185, 174, 16, 3, 'SERVICE', 1.50, NULL, '2026-03-07 04:05:16', '2026-03-07 04:05:16'),
(186, 186, 19, 4, 'SERVICE', 1.00, NULL, '2026-03-07 04:06:10', '2026-03-07 04:06:10'),
(187, 187, 25, 4, 'SERVICE', 1.50, NULL, '2026-03-07 04:06:25', '2026-03-07 04:06:25'),
(188, 188, 3, 4, 'SERVICE', 1.25, NULL, '2026-03-07 04:06:43', '2026-03-07 04:06:43'),
(189, 182, 11, 4, 'SERVICE', 1.50, NULL, '2026-03-07 04:07:03', '2026-03-07 04:07:03'),
(190, 183, 35, 4, 'SERVICE', 1.00, NULL, '2026-03-07 04:07:25', '2026-03-07 04:07:25'),
(191, 184, 39, 4, 'BINS', 0.25, NULL, '2026-03-07 04:07:39', '2026-03-07 04:07:39'),
(192, 192, 41, 4, 'SERVICE', 1.50, NULL, '2026-03-07 04:07:47', '2026-03-07 04:07:47'),
(193, 193, 4, 5, 'SERVICE', 1.25, NULL, '2026-03-07 04:25:34', '2026-03-07 04:25:34'),
(194, 158, 29, 5, 'SERVICE', 1.50, NULL, '2026-03-07 04:25:47', '2026-03-07 04:25:47'),
(195, 195, 20, 5, 'SERVICE', 1.50, NULL, '2026-03-07 04:25:58', '2026-03-07 04:25:58'),
(196, 192, 41, 5, 'BINS', 0.50, NULL, '2026-03-07 04:26:09', '2026-03-07 04:26:09'),
(197, 197, 42, 5, 'SERVICE', 1.50, '+1.25 ext jardineria', '2026-03-07 04:26:22', '2026-03-07 04:26:45'),
(198, 198, 27, 5, 'SERVICE', 1.00, NULL, '2026-03-07 04:27:00', '2026-03-07 04:27:00');

-- --------------------------------------------------------

--
-- Table structure for table `tools`
--

CREATE TABLE `tools` (
  `id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `requiere_mantenimiento` tinyint(1) DEFAULT 0,
  `fecha_ultimo_mantenimiento` date DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `ubicacion` enum('oficina','asignada') DEFAULT NULL,
  `equipo_id` int(11) DEFAULT NULL,
  `image_url` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tools`
--

INSERT INTO `tools` (`id`, `code`, `nombre`, `descripcion`, `requiere_mantenimiento`, `fecha_ultimo_mantenimiento`, `precio_unitario`, `ubicacion`, `equipo_id`, `image_url`) VALUES
(1, 'VAC-01', 'Pacvac Superpro Battery 700 Advanced Backpack Vacuum Cleaner', 'Wireless', 0, NULL, NULL, 'asignada', 1, NULL),
(2, 'VAC-BAT-01', 'Pacvac Battery For Superpro', 'Li-ION 6.0Ah 18V', 0, NULL, NULL, 'asignada', 1, NULL),
(3, 'VAC-BAT-CH-01', 'Battery charger plug type I', 'Li-ION 6.0Ah 18V', 0, NULL, 200.00, 'asignada', 1, NULL),
(4, 'VAC-BAT-CH-02', 'Battery charger plug type I', 'Li-ION 6.0Ah 18V', 0, NULL, 200.00, 'asignada', 1, NULL),
(5, 'VAC-BAT-02', 'Pacvac Battery For Superpro', 'Li-ION 6.0Ah 18V', 0, NULL, NULL, 'asignada', 1, NULL),
(6, 'VAC-BAT-03', 'Pacvac Battery For Superpro', 'Li-ION 6.0Ah 18V', 0, NULL, NULL, 'asignada', 1, NULL),
(7, 'VAC-BAT-04', 'Pacvac Battery For Superpro', 'Li-ION 6.0Ah 18V', 0, NULL, NULL, 'asignada', 1, NULL),
(8, 'BLW-STH-01', 'Stihl Petrol Blower BG 56', 'Green Petrol', 0, NULL, 350.00, 'asignada', 1, NULL),
(9, 'BLW-STH-02', 'Stihl Petrol Blower BG 56', 'Green Petrol', 0, NULL, 350.00, 'asignada', 1, NULL),
(10, 'GUA-STH-01', 'Stihl Petrol Brushcutter', 'Head', 0, NULL, NULL, 'asignada', 1, NULL),
(11, 'TRM-STH-01', 'Stihl Hedge Trimmer', 'Head', 0, NULL, NULL, 'asignada', 1, NULL),
(12, 'MTR-STH-01', 'Stihl KombiEngine Whipper Snipper', 'Green Petrol', 0, NULL, NULL, 'asignada', 1, NULL),
(13, 'MCH-MASS-01', 'Masport President 4000', 'Red Petrol', 1, '2025-08-28', NULL, 'asignada', 1, NULL),
(14, 'WASH-KAR-01', 'Karcher K2 Power Control Pressure Washer', '1750 PSI - Small works', 0, NULL, 170.00, 'asignada', 1, NULL),
(15, 'TJR-WVY-01', 'Saxon Hedge Shear 540mm Wavy Tensioner', 'Tijeras', 0, NULL, NULL, 'asignada', 1, NULL),
(16, 'TJR-CCL-01', 'Cyclone Straight Hedge Shears', 'Tijeras', 0, NULL, NULL, 'asignada', 1, NULL),
(17, 'PIC-SAX-01', 'Saxon Lopper 600mm Bypass', 'Pico de Loro', 0, NULL, NULL, 'asignada', 1, NULL),
(18, 'PAL-SAX-01', 'Saxon Mini Camping Shovel', 'Pala', 0, NULL, NULL, 'asignada', 1, NULL),
(19, NULL, 'Pacvac Superpro Battery 700 Advanced Backpack Vacuum Cleaner', 'Vacuum', 0, NULL, NULL, 'oficina', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fecha_vencimiento_visa` date DEFAULT NULL,
  `tipo_visa` varchar(50) DEFAULT NULL,
  `rol` enum('admin','manager','accountant','cleaner') NOT NULL,
  `password_hash` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nombre`, `apellido`, `direccion`, `telefono`, `email`, `fecha_vencimiento_visa`, `tipo_visa`, `rol`, `password_hash`, `activo`) VALUES
(1, 'Admin', 'Limpia', '7/442 Geelong rd, West Footscray', '0474 779 211', 'admin@limpiacleaning.com', NULL, NULL, 'admin', '$2b$10$YZczEwZgKMcN00Wn5qlhJOcymBmJHW5QTu91jruVLqCbV.BB2dPEm', 1),
(2, 'Bryan', 'Villanueva', '94 hilma street, Sunshine West', '0415738214', 'vbryan0803@gmail.com', '2027-08-24', 'Student Visa', 'cleaner', '$2b$12$i/HwHZcAzSFCTPxrWWrf0.wivGYg7stTMjFVYVIG10FFyFpV8WZmO', 1),
(3, 'Yuleinys', 'Contreras', '94 Hilma Street, Sunshine West', '0415738227', 'yuleinys1999@gmail.com', '2027-08-25', 'Student Visa', 'cleaner', '$2b$12$jSomLR.NZEXhT38syJk.qe4WC0j7JSUzGNFqEa77M9kOrDd/kB472', 1),
(4, 'Juan', 'Carlos', NULL, NULL, 'juan@gmail.com', NULL, NULL, 'cleaner', '$2b$12$RdGtdqjR6gCfbvU712wfr.tJOu1zDtLRqXqMf4/UqY3yiiixyNXaG', 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_team_history`
--

CREATE TABLE `user_team_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_team_history`
--

INSERT INTO `user_team_history` (`id`, `user_id`, `team_id`, `fecha_inicio`, `fecha_fin`) VALUES
(1, 2, 1, '2026-02-26', NULL),
(2, 3, 1, '2026-02-26', NULL),
(3, 4, 2, '2026-03-02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vacation_replacements`
--

CREATE TABLE `vacation_replacements` (
  `id` int(11) NOT NULL,
  `user_id_reemplazado` int(11) DEFAULT NULL,
  `user_id_reemplazo` int(11) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vacation_requests`
--

CREATE TABLE `vacation_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `dias` int(11) DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `fecha_solicitud` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `billing_periods`
--
ALTER TABLE `billing_periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_billing_periods_start` (`start_date`),
  ADD KEY `idx_billing_periods_dates` (`start_date`,`end_date`);

--
-- Indexes for table `billing_weeks`
--
ALTER TABLE `billing_weeks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_billing_weeks_start` (`start_date`),
  ADD KEY `idx_billing_weeks_dates` (`start_date`,`end_date`),
  ADD KEY `fk_billing_weeks_period` (`period_id`);

--
-- Indexes for table `cars`
--
ALTER TABLE `cars`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricula` (`matricula`),
  ADD KEY `equipo_id` (`equipo_id`);

--
-- Indexes for table `car_services`
--
ALTER TABLE `car_services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_car_services_car_id` (`car_id`),
  ADD KEY `idx_car_services_equipo_id` (`equipo_id`),
  ADD KEY `idx_car_services_fecha` (`fecha_mantenimiento`);

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `asignado_team_id` (`asignado_team_id`),
  ADD KEY `asignado_user_id` (`asignado_user_id`);

--
-- Indexes for table `daily_site_logs`
--
ALTER TABLE `daily_site_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_daily_user_fecha` (`user_id`,`fecha`),
  ADD KEY `idx_daily_site_fecha` (`site_id`,`fecha`),
  ADD KEY `idx_daily_team_fecha` (`team_id`,`fecha`),
  ADD KEY `idx_daily_site_logs_billing_week` (`billing_week_id`);

--
-- Indexes for table `providers`
--
ALTER TABLE `providers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_reports_user` (`user_id`),
  ADD KEY `idx_reports_dates` (`fecha_inicio`,`fecha_fin`),
  ADD KEY `fk_reports_billing_period` (`billing_period_id`);

--
-- Indexes for table `report_excluded_logs`
--
ALTER TABLE `report_excluded_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_report_excluded_log` (`report_id`,`daily_site_log_id`),
  ADD KEY `fk_report_excluded_log` (`daily_site_log_id`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Indexes for table `site_comments`
--
ALTER TABLE `site_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `autor_user_id` (`autor_user_id`);

--
-- Indexes for table `site_visits`
--
ALTER TABLE `site_visits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `site_id` (`site_id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `supplies`
--
ALTER TABLE `supplies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_supplies_cloudinary_public_id` (`cloudinary_public_id`),
  ADD KEY `proveedor_id` (`proveedor_id`);

--
-- Indexes for table `supply_orders`
--
ALTER TABLE `supply_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipo_id` (`equipo_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `supply_order_items`
--
ALTER TABLE `supply_order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `supply_id` (`supply_id`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`);

--
-- Indexes for table `team_site_assignments`
--
ALTER TABLE `team_site_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `team_id` (`team_id`),
  ADD KEY `site_id` (`site_id`);

--
-- Indexes for table `team_site_cycle_plan`
--
ALTER TABLE `team_site_cycle_plan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_team_site_week` (`team_id`,`site_id`,`cycle_week`),
  ADD KEY `fk_plan_site` (`site_id`);

--
-- Indexes for table `team_site_cycle_plan_items`
--
ALTER TABLE `team_site_cycle_plan_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plan_day_type` (`plan_id`,`day_of_week`,`entry_type`),
  ADD KEY `fk_item_assignment` (`assignment_id`);

--
-- Indexes for table `tools`
--
ALTER TABLE `tools`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipo_id` (`equipo_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_team_history`
--
ALTER TABLE `user_team_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `team_id` (`team_id`);

--
-- Indexes for table `vacation_replacements`
--
ALTER TABLE `vacation_replacements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id_reemplazado` (`user_id_reemplazado`),
  ADD KEY `user_id_reemplazo` (`user_id_reemplazo`);

--
-- Indexes for table `vacation_requests`
--
ALTER TABLE `vacation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `billing_periods`
--
ALTER TABLE `billing_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `billing_weeks`
--
ALTER TABLE `billing_weeks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `cars`
--
ALTER TABLE `cars`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `car_services`
--
ALTER TABLE `car_services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_site_logs`
--
ALTER TABLE `daily_site_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `providers`
--
ALTER TABLE `providers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `report_excluded_logs`
--
ALTER TABLE `report_excluded_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `site_comments`
--
ALTER TABLE `site_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `site_visits`
--
ALTER TABLE `site_visits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `supplies`
--
ALTER TABLE `supplies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=256;

--
-- AUTO_INCREMENT for table `supply_orders`
--
ALTER TABLE `supply_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `supply_order_items`
--
ALTER TABLE `supply_order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `team_site_assignments`
--
ALTER TABLE `team_site_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `team_site_cycle_plan`
--
ALTER TABLE `team_site_cycle_plan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `team_site_cycle_plan_items`
--
ALTER TABLE `team_site_cycle_plan_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tools`
--
ALTER TABLE `tools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `user_team_history`
--
ALTER TABLE `user_team_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vacation_replacements`
--
ALTER TABLE `vacation_replacements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vacation_requests`
--
ALTER TABLE `vacation_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `billing_weeks`
--
ALTER TABLE `billing_weeks`
  ADD CONSTRAINT `fk_billing_weeks_period` FOREIGN KEY (`period_id`) REFERENCES `billing_periods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `cars`
--
ALTER TABLE `cars`
  ADD CONSTRAINT `cars_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `car_services`
--
ALTER TABLE `car_services`
  ADD CONSTRAINT `fk_car_services_car` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_car_services_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `teams` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`asignado_team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `complaints_ibfk_3` FOREIGN KEY (`asignado_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `daily_site_logs`
--
ALTER TABLE `daily_site_logs`
  ADD CONSTRAINT `daily_site_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `daily_site_logs_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `daily_site_logs_ibfk_3` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `fk_daily_site_logs_billing_week` FOREIGN KEY (`billing_week_id`) REFERENCES `billing_weeks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `fk_reports_billing_period` FOREIGN KEY (`billing_period_id`) REFERENCES `billing_periods` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `report_excluded_logs`
--
ALTER TABLE `report_excluded_logs`
  ADD CONSTRAINT `fk_report_excluded_log` FOREIGN KEY (`daily_site_log_id`) REFERENCES `daily_site_logs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_report_excluded_report` FOREIGN KEY (`report_id`) REFERENCES `reports` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `sites_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clients` (`id`);

--
-- Constraints for table `site_comments`
--
ALTER TABLE `site_comments`
  ADD CONSTRAINT `site_comments_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `site_comments_ibfk_2` FOREIGN KEY (`autor_user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `site_visits`
--
ALTER TABLE `site_visits`
  ADD CONSTRAINT `site_visits_ibfk_1` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `site_visits_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `site_visits_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `supplies`
--
ALTER TABLE `supplies`
  ADD CONSTRAINT `supplies_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `providers` (`id`);

--
-- Constraints for table `supply_orders`
--
ALTER TABLE `supply_orders`
  ADD CONSTRAINT `supply_orders_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `supply_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `supply_order_items`
--
ALTER TABLE `supply_order_items`
  ADD CONSTRAINT `supply_order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `supply_orders` (`id`),
  ADD CONSTRAINT `supply_order_items_ibfk_2` FOREIGN KEY (`supply_id`) REFERENCES `supplies` (`id`);

--
-- Constraints for table `team_site_assignments`
--
ALTER TABLE `team_site_assignments`
  ADD CONSTRAINT `team_site_assignments_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`),
  ADD CONSTRAINT `team_site_assignments_ibfk_2` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);

--
-- Constraints for table `team_site_cycle_plan`
--
ALTER TABLE `team_site_cycle_plan`
  ADD CONSTRAINT `fk_plan_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `fk_plan_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `team_site_cycle_plan_items`
--
ALTER TABLE `team_site_cycle_plan_items`
  ADD CONSTRAINT `fk_item_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `team_site_assignments` (`id`),
  ADD CONSTRAINT `fk_item_plan` FOREIGN KEY (`plan_id`) REFERENCES `team_site_cycle_plan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tools`
--
ALTER TABLE `tools`
  ADD CONSTRAINT `tools_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `user_team_history`
--
ALTER TABLE `user_team_history`
  ADD CONSTRAINT `user_team_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_team_history_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`);

--
-- Constraints for table `vacation_replacements`
--
ALTER TABLE `vacation_replacements`
  ADD CONSTRAINT `vacation_replacements_ibfk_1` FOREIGN KEY (`user_id_reemplazado`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `vacation_replacements_ibfk_2` FOREIGN KEY (`user_id_reemplazo`) REFERENCES `users` (`id`);

--
-- Constraints for table `vacation_requests`
--
ALTER TABLE `vacation_requests`
  ADD CONSTRAINT `vacation_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
