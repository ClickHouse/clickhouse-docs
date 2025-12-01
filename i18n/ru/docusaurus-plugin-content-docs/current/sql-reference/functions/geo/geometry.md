---
description: 'Документация по геометрическим функциям'
sidebar_label: 'Геометрия'
slug: /sql-reference/functions/geo/geometry
title: 'Функции для работы с геометрией'
doc_type: 'reference'
---



## Геометрия {#geometry}

Функции для работы с геометрией позволяют вычислять периметр и площадь для геометрических типов, таких как POLYGON, LINESTRING, MULTIPOLYGON, MULTILINESTRING, RING и POINT. Используйте геометрические объекты в типе данных Geometry. Если входное значение равно `NULL`, все приведённые ниже функции вернут 0.



## perimeterCartesian {#perimetercartesian}

Вычисляет периметр заданного объекта типа Geometry в декартовой (плоской) системе координат.

**Синтаксис**
perimeterCartesian(geom)

**Входные значения**
- `geom` — объект типа Geometry. [Geometry](../../data-types/geo.md).

**Возвращаемые значения**
- Number — периметр объекта в единицах системы координат. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT perimeterCartesian(geom) FROM geo_dst;

Результат:
┌─perimeterCartesian(geom)─┐
│              4.0          │
└──────────────────────────┘



## areaCartesian {#areacartesian}

Вычисляет площадь заданного объекта Geometry в декартовой системе координат.

**Синтаксис**
areaCartesian(geom)

**Входные значения**
- `geom` — объект типа Geometry. [Geometry](../../data-types/geo.md).

**Возвращаемые значения**
- Number — площадь объекта в единицах координатной системы. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaCartesian(geom) FROM geo_dst;

Результат:
┌─areaCartesian(geom)─┐
│ -1 │
└─────────────────────┘



## perimeterSpherical {#perimeterspherical}

Вычисляет периметр объекта Geometry на поверхности сферы.

**Синтаксис**
perimeterSpherical(geom)

**Входные значения**
- `geom` — объект Geometry. [Geometry](../../data-types/geo.md).

**Возвращаемые значения**
- Число — периметр. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('LINESTRING(0 0,1 0,1 1,0 1,0 0)');
SELECT perimeterSpherical(geom) FROM geo_dst;

Результат:
┌─perimeterSpherical(geom)─┐
│ 0 │
└──────────────────────────┘



## areaSpherical {#areaspherical}

Вычисляет площадь объекта типа Geometry на поверхности сферы.

**Синтаксис**
areaSpherical(geom)

**Входные значения**
- `geom` — объект типа Geometry. [Geometry](../../data-types/geo.md).

**Возвращаемые значения**
- Number — площадь. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaSpherical(geom) FROM geo_dst;

Результат:
┌─areaSpherical(geom)─┐
│ -0.0003046096848622019 │
└──────────────────────┘
