---
description: 'Документация по геометрическим функциям'
sidebar_label: 'Геометрия'
slug: /sql-reference/functions/geo/geometry
title: 'Функции для работы с геометрией'
doc_type: 'reference'
---



## Геометрия {#geometry}

Геометрические функции позволяют вычислять периметр и площадь для геометрических типов, таких как POLYGON, LINESTRING, MULTIPOLYGON, MULTILINESTRING, RING и POINT. Используйте геометрические объекты типа Geometry. Если входное значение равно `NULL`, все перечисленные ниже функции вернут 0.


## perimeterCartesian {#perimetercartesian}

Вычисляет периметр заданного геометрического объекта в декартовой (плоской) системе координат.

**Синтаксис**
perimeterCartesian(geom)

**Входные параметры**

- `geom` — геометрический объект. [Geometry](../../data-types/geo.md).

**Возвращаемое значение**

- Периметр объекта в единицах системы координат. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT perimeterCartesian(geom) FROM geo_dst;

Результат:
┌─perimeterCartesian(geom)─┐
│ 4.0 │
└──────────────────────────┘


## areaCartesian {#areacartesian}

Вычисляет площадь заданного геометрического объекта в декартовой системе координат.

**Синтаксис**
areaCartesian(geom)

**Входные параметры**

- `geom` — геометрический объект. [Geometry](../../data-types/geo.md).

**Возвращаемое значение**

- Число — площадь объекта в единицах системы координат. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaCartesian(geom) FROM geo_dst;

Результат:
┌─areaCartesian(geom)─┐
│ -1 │
└─────────────────────┘


## perimeterSpherical {#perimeterspherical}

Вычисляет периметр геометрического объекта на поверхности сферы.

**Синтаксис**
perimeterSpherical(geom)

**Входные параметры**

- `geom` — геометрический объект. [Geometry](../../data-types/geo.md).

**Возвращаемое значение**

- Периметр. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('LINESTRING(0 0,1 0,1 1,0 1,0 0)');
SELECT perimeterSpherical(geom) FROM geo_dst;

Результат:
┌─perimeterSpherical(geom)─┐
│ 0 │
└──────────────────────────┘


## areaSpherical {#areaspherical}

Вычисляет площадь геометрического объекта на поверхности сферы.

**Синтаксис**
areaSpherical(geom)

**Входные параметры**

- `geom` — геометрия. [Geometry](../../data-types/geo.md).

**Возвращаемое значение**

- Число — площадь. [Float64](../../data-types/float.md).

**Пример**
CREATE TABLE IF NOT EXISTS geo_dst (geom Geometry) ENGINE = Memory();
INSERT INTO geo_dst SELECT readWkt('POLYGON((0 0,1 0,1 1,0 1,0 0))');
SELECT areaSpherical(geom) FROM geo_dst;

Результат:
┌─areaSpherical(geom)─┐
│ -0.0003046096848622019 │
└──────────────────────┘
