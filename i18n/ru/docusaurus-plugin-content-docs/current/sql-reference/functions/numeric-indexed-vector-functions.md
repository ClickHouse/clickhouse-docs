---
description: 'Документация по NumericIndexedVector и его функциям'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'Функции NumericIndexedVector'
doc_type: 'reference'
---

# NumericIndexedVector \{#numericindexedvector\}

NumericIndexedVector — это абстрактная структура данных, которая инкапсулирует вектор и реализует агрегирующие и покомпонентные операции над вектором. В качестве метода хранения используется Bit-Sliced Index. Теоретические основы и сценарии использования описаны в статье [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411).

## BSI \{#bit-sliced-index\}

В методе хранения BSI (Bit-Sliced Index) данные хранятся в формате [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268), а затем сжимаются с помощью [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap). Агрегирующие и поэлементные операции выполняются непосредственно над сжатыми данными, что может существенно повысить эффективность хранения и запросов.

Вектор содержит индексы и соответствующие им значения. Ниже приведены некоторые характеристики и ограничения этой структуры данных в режиме хранения BSI:

* Тип индекса может быть одним из `UInt8`, `UInt16` или `UInt32`. **Примечание:** с учётом производительности 64-битной реализации Roaring Bitmap формат BSI не поддерживает `UInt64`/`Int64`.
* Тип значения может быть одним из `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32` или `Float64`. **Примечание:** тип значения не расширяется автоматически. Например, если вы используете `UInt8` как тип значения, любая сумма, превышающая допустимый диапазон `UInt8`, приведёт к переполнению, а не к расширению типа до более широкого; аналогично, операции над целыми числами будут возвращать целочисленный результат (например, деление не будет автоматически приводить к результату с плавающей запятой). Поэтому важно заранее продумать и спроектировать тип значения. В реальных сценариях обычно используются типы с плавающей запятой (`Float32`/`Float64`).
* Операции можно выполнять только над двумя векторами с одинаковым типом индекса и типом значения.
* Подлежащая система хранения использует Bit-Sliced Index, при этом bitmap хранит индексы. Roaring Bitmap используется как конкретная реализация bitmap. Рекомендуемой практикой является по возможности концентрировать индексы в небольшом числе контейнеров Roaring Bitmap для максимизации степени сжатия и производительности запросов.
* Механизм Bit-Sliced Index преобразует значение в двоичное представление. Для типов с плавающей запятой используется фиксированное-точечное представление (fixed-point), что может приводить к потере точности. Точность можно регулировать, настраивая количество бит, отводимых под дробную часть; по умолчанию используется 24 бита, чего достаточно для большинства сценариев. Вы можете настроить количество бит для целой и дробной части при конструировании NumericIndexedVector с помощью агрегатной функции groupNumericIndexedVector с суффиксом `-State`.
* Для индексов возможны три состояния: ненулевое значение, нулевое значение и отсутствие. В NumericIndexedVector хранятся только ненулевые и нулевые значения. Кроме того, в поэлементных операциях между двумя NumericIndexedVector значение отсутствующего индекса трактуется как 0. В сценарии деления результатом будет ноль, если делитель равен нулю.

## Создание объекта numericIndexedVector \{#create-numeric-indexed-vector-object\}

Существует два способа создать эту структуру: первый — использовать агрегатную функцию `groupNumericIndexedVector` с суффиксом `-State`.
Можно добавить суффикс `-if`, чтобы задать дополнительное условие.
Агрегатная функция будет обрабатывать только те строки, для которых выполняется условие.
Второй способ — построить её из map с помощью `numericIndexedVectorBuild`.
Функция `groupNumericIndexedVectorState` позволяет настраивать количество целочисленных и дробных битов через параметры, тогда как `numericIndexedVectorBuild` такой возможности не предоставляет.

## groupNumericIndexedVector \{#group-numeric-indexed-vector\}

Создаёт NumericIndexedVector из двух столбцов данных и возвращает сумму всех значений типа `Float64`. Если к имени функции добавить суффикс `State`, возвращается объект NumericIndexedVector.

**Синтаксис**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**Параметры**

* `type`: String, необязательный. Определяет формат хранения. В настоящее время поддерживается только `'BSI'`.
* `integer_bit_num`: `UInt32`, необязательный. Применяется при формате хранения `'BSI'`; этот параметр задаёт количество бит, используемых для целой части. Когда тип индекса — целочисленный, значение по умолчанию соответствует количеству бит, используемых для его хранения. Например, если тип индекса — UInt16, значение `integer_bit_num` по умолчанию равно 16. Для типов индекса Float32 и Float64 значение `integer_bit_num` по умолчанию равно 40, поэтому целая часть данных, которые могут быть представлены, находится в диапазоне `[-2^39, 2^39 - 1]`. Допустимый диапазон: `[0, 64]`.
* `fraction_bit_num`: `UInt32`, необязательный. Применяется при формате хранения `'BSI'`; этот параметр задаёт количество бит, используемых для дробной части. Когда тип значения — целое число, значение по умолчанию равно 0; когда тип значения — Float32 или Float64, значение по умолчанию равно 24. Допустимый диапазон: `[0, 24]`.
* Также накладывается ограничение: допустимый диапазон суммы integer&#95;bit&#95;num + fraction&#95;bit&#95;num — [0, 64].
* `col1`: Столбец индекса. Поддерживаемые типы: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`.
* `col2`: Столбец значений. Поддерживаемые типы: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`.

**Возвращаемое значение**

Значение `Float64`, представляющее сумму всех значений.

**Пример**

Тестовые данные:

```text
UserID  PlayTime
1       10
2       20
3       30
```

Запрос и результат:

```sql
SELECT groupNumericIndexedVector(UserID, PlayTime) AS num FROM t;
┌─num─┐
│  60 │
└─────┘

SELECT groupNumericIndexedVectorState(UserID, PlayTime) as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)─────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8)  │ 60                                    │
└─────┴─────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴────────────────────────────────────────────────────────────┴───────────────────────────────────────┘

SELECT groupNumericIndexedVectorStateIf('BSI', 32, 0)(UserID, PlayTime, day = '2025-04-22') as res, toTypeName(res), numericIndexedVectorAllValueSum(res) FROM t;
┌─res─┬─toTypeName(res)──────────────────────────────────────────────────────────┬─numericIndexedVectorAllValueSum(res)──┐
│     │ AggregateFunction('BSI', 32, 0)(groupNumericIndexedVector, UInt8, UInt8) │ 30                                    │
└─────┴──────────────────────────────────────────────────────────────────────────┴───────────────────────────────────────┘
```

:::note
Приведённая ниже документация сгенерирована из системной таблицы `system.functions`.
:::

{/* 
  Теги ниже используются для генерации документации из системных таблиц, их нельзя удалять.
  Подробнее см. https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## numericIndexedVectorAllValueSum \{#numericIndexedVectorAllValueSum\}

Введено в версии: v25.7.0

Возвращает сумму всех значений в numericIndexedVector.

**Синтаксис**

```sql
numericIndexedVectorAllValueSum(v)
```

**Аргументы**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает сумму в формате [`Float64`](/sql-reference/data-types/float).

**Примеры**

**Пример использования**

```sql title=Query
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  60 │
└─────┘
```

## numericIndexedVectorBuild \{#numericIndexedVectorBuild\}

Введена в версии: v25.7.0

Создаёт NumericIndexedVector из map. Ключи map соответствуют индексам вектора, а значения map — значениям вектора.

**Синтаксис**

```sql
numericIndexedVectorBuild(map)
```

**Аргументы**

* `map` — отображение индекса в значение. [`Map`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает объект NumericIndexedVector. [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**Примеры**

**Пример использования**

```sql title=Query
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=Response
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```

## numericIndexedVectorCardinality \{#numericIndexedVectorCardinality\}

Впервые появилась в: v25.7.0

Возвращает кардинальность (количество уникальных индексов) `numericIndexedVector`.

**Синтаксис**

```sql
numericIndexedVectorCardinality(v)
```

**Аргументы**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает количество уникальных индексов. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Query
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  3  │
└─────┘
```

## numericIndexedVectorGetValue \{#numericIndexedVectorGetValue\}

Добавлен в версии: v25.7.0

Извлекает значение, соответствующее указанному индексу, из numericIndexedVector.

**Синтаксис**

```sql
numericIndexedVectorGetValue(v, i)
```

**Аргументы**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `i` — Индекс, по которому извлекается значение. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Числовое значение того же типа, что и тип значения NumericIndexedVector: [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Query
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

```response title=Response
┌─res─┐
│  30 │
└─────┘
```

## numericIndexedVectorPointwiseAdd \{#numericIndexedVectorPointwiseAdd\}

Добавлена в: v25.7.0

Выполняет покомпонентное сложение между numericIndexedVector и другим numericIndexedVector или числовой константой.

**Синтаксис**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект типа numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект типа numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

```response title=Response
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseDivide \{#numericIndexedVectorPointwiseDivide\}

Введена в версии: v25.7.0

Выполняет покомпонентное деление между `numericIndexedVector` и другим `numericIndexedVector` или числовой константой.

**Синтаксис**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект `numericIndexedVector`. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

```response title=Response
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseEqual \{#numericIndexedVectorPointwiseEqual\}

Введена в версии: v25.7.0

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы элементов с равными значениями; всем соответствующим значениям присваивается 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект `numericIndexedVector` типа [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

***

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```

## numericIndexedVectorPointwiseGreater \{#numericIndexedVectorPointwiseGreater\}

Впервые представлено в: v25.7.0

Выполняет поэлементное сравнение между `numericIndexedVector` и другим `numericIndexedVector` или числовой константой.
Результатом является `numericIndexedVector`, содержащий индексы, для которых значение первого вектора больше значения второго, при этом все соответствующие значения равны 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект типа [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object). [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект типа [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object).

**Примеры**

**Пример использования**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseGreaterEqual \{#numericIndexedVectorPointwiseGreaterEqual\}

Добавлено в: v25.7.0

Выполняет покомпонентное сравнение между `numericIndexedVector` и другим `numericIndexedVector` или числовой константой.
Результатом является `numericIndexedVector`, содержащий индексы позиций, где значение первого вектора больше либо равно значению второго вектора, при этом все соответствующие значения устанавливаются в 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект типа numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект типа numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseLess \{#numericIndexedVectorPointwiseLess\}

Введено в версии: v25.7.0

Выполняет поэлементное сравнение между numericIndexedVector и либо другим numericIndexedVector, либо числовой константой.
Результатом является numericIndexedVector, содержащий индексы тех элементов, для которых значение первого вектора меньше значения второго, при этом все соответствующие значения равны 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект `numericIndexedVector`. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseLessEqual \{#numericIndexedVectorPointwiseLessEqual\}

Добавлена в версии: v25.7.0

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, где значение первого вектора меньше либо равно значению второго вектора, при этом все соответствующие значения равны 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**Аргументы**

* `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа типа [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) либо объект [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseMultiply \{#numericIndexedVectorPointwiseMultiply\}

Введена в версии v25.7.0

Выполняет покомпонентное умножение numericIndexedVector на другой numericIndexedVector или числовую константу.

**Синтаксис**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**Аргументы**

* `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект `numericIndexedVector`. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

***

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseNotEqual \{#numericIndexedVectorPointwiseNotEqual\}

Введено в: v25.7.0

Выполняет поэлементное сравнение между numericIndexedVector и либо другим numericIndexedVector, либо числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значения не равны, при этом все соответствующие значения равны 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект `numericIndexedVector`. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

```response title=Response
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseSubtract \{#numericIndexedVectorPointwiseSubtract\}

Введена в версии: v25.7.0

Выполняет покомпонентное вычитание между numericIndexedVector и другим numericIndexedVector или числовой константой.

**Синтаксис**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**Аргументы**

* `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
* `v2` — числовая константа или объект `numericIndexedVector`. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект `numericIndexedVector`. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Query
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

```response title=Response
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```

## numericIndexedVectorShortDebugString \{#numericIndexedVectorShortDebugString\}

Появилась в версии: v25.7.0

Возвращает внутреннюю информацию о `numericIndexedVector` в формате JSON.
Эта функция в первую очередь используется для отладки.

**Синтаксис**

```sql
numericIndexedVectorShortDebugString(v)
```

**Аргументы**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает JSON-строку с отладочной информацией. [`String`](/sql-reference/data-types/string)

**Примеры**

**Пример использования**

```sql title=Query
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

```response title=Response
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```

## numericIndexedVectorToMap \{#numericIndexedVectorToMap\}

Добавлено в: v25.7.0

Преобразует numericIndexedVector в map.

**Синтаксис**

```sql
numericIndexedVectorToMap(v)
```

**Аргументы**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает значение типа [`Map`](/sql-reference/data-types/map) с парами индекс–значение.

**Примеры**

**Пример использования**

```sql title=Query
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

{/*AUTOGENERATED_END*/ }
