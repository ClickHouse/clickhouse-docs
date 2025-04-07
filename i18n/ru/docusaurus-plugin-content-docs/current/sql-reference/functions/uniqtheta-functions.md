---
description: 'Документация по функциям uniqTheta'
sidebar_label: 'uniqTheta'
sidebar_position: 210
slug: /sql-reference/functions/uniqtheta-functions
title: 'Функции uniqTheta'
---


# Функции uniqTheta

Функции uniqTheta работают с двумя объектами uniqThetaSketch для выполнения расчетов операций над множествами, таких как ∪ / ∩ / × (объединение/пересечение/разность). Они возвращают новый объект uniqThetaSketch, содержащий результат.

Объект uniqThetaSketch создается с помощью агрегатной функции uniqTheta с -State.

UniqThetaSketch — это структура данных для хранения приблизительных значений множеств. 
Для получения дополнительной информации о RoaringBitmap, смотрите: [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html).

## uniqThetaUnion {#uniqthetaunion}

Два объекта uniqThetaSketch для выполнения операции объединения (∪). Результат — новый объект uniqThetaSketch.

```sql
uniqThetaUnion(uniqThetaSketch,uniqThetaSketch)
```

**Аргументы**

- `uniqThetaSketch` – объект uniqThetaSketch.

**Пример**

```sql
select finalizeAggregation(uniqThetaUnion(a, b)) as a_union_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState',[1,2]) as a, arrayReduce('uniqThetaState',[2,3,4]) as b );
```

```text
┌─a_union_b─┬─a_cardinality─┬─b_cardinality─┐
│         4 │             2 │             3 │
└───────────┴───────────────┴───────────────┘
```

## uniqThetaIntersect {#uniqthetaintersect}

Два объекта uniqThetaSketch для выполнения операции пересечения (∩). Результат — новый объект uniqThetaSketch.

```sql
uniqThetaIntersect(uniqThetaSketch,uniqThetaSketch)
```

**Аргументы**

- `uniqThetaSketch` – объект uniqThetaSketch.

**Пример**

```sql
select finalizeAggregation(uniqThetaIntersect(a, b)) as a_intersect_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState',[1,2]) as a, arrayReduce('uniqThetaState',[2,3,4]) as b );
```

```text
┌─a_intersect_b─┬─a_cardinality─┬─b_cardinality─┐
│             1 │             2 │             3 │
└───────────────┴───────────────┴───────────────┘
```

## uniqThetaNot {#uniqthetanot}

Два объекта uniqThetaSketch для выполнения операции разности (×). Результат — новый объект uniqThetaSketch.

```sql
uniqThetaNot(uniqThetaSketch,uniqThetaSketch)
```

**Аргументы**

- `uniqThetaSketch` – объект uniqThetaSketch.

**Пример**

```sql
select finalizeAggregation(uniqThetaNot(a, b)) as a_not_b, finalizeAggregation(a) as a_cardinality, finalizeAggregation(b) as b_cardinality
from
(select arrayReduce('uniqThetaState',[2,3,4]) as a, arrayReduce('uniqThetaState',[1,2]) as b );
```

```text
┌─a_not_b─┬─a_cardinality─┬─b_cardinality─┐
│       2 │             3 │             2 │
└─────────┴───────────────┴───────────────┘
```

**См. также**

- [uniqThetaSketch](/sql-reference/aggregate-functions/reference/uniqthetasketch)
