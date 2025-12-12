---
description: 'Документация по NumericIndexedVector и его функциям'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'Функции NumericIndexedVector'
doc_type: 'reference'
---

# NumericIndexedVector {#numericindexedvector}

NumericIndexedVector — это абстрактная структура данных, которая инкапсулирует вектор и реализует агрегирующие и покомпонентные операции над векторами. В качестве формата хранения в ней используется Bit-Sliced Index. Теоретические основы и сценарии использования описаны в статье [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411).

## BSI {#bit-sliced-index}

В методе хранения BSI (Bit-Sliced Index) данные сохраняются в формате [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268), а затем сжимаются с помощью [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap). Операции агрегации и покомпонентные операции выполняются непосредственно над сжатыми данными, что может значительно повысить эффективность хранения и выполнения запросов.

Вектор содержит индексы и соответствующие им значения. Ниже перечислены некоторые характеристики и ограничения этой структуры данных в режиме хранения BSI:

- Тип индекса может быть одним из `UInt8`, `UInt16` или `UInt32`. **Примечание:** Учитывая производительность 64-битной реализации Roaring Bitmap, формат BSI не поддерживает `UInt64`/`Int64`.
- Тип значения может быть одним из `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32` или `Float64`. **Примечание:** Тип значения не расширяется автоматически. Например, если вы используете `UInt8` как тип значения, любая сумма, превышающая диапазон `UInt8`, приведёт к переполнению, а не к повышению типа; аналогично, операции над целыми числами будут возвращать целочисленные результаты (например, деление не будет автоматически преобразовано в результат с плавающей запятой). Поэтому важно заранее продумать и спроектировать тип значения. На практике обычно используются типы с плавающей запятой (`Float32`/`Float64`).
- Операции могут выполняться только над двумя векторами с одинаковым типом индекса и типом значения.
- Базовое хранилище использует Bit-Sliced Index, при этом индексы хранятся в виде битовой карты (bitmap). Roaring Bitmap используется как конкретная реализация битовой карты. Рекомендуемой практикой является максимальная концентрация индексов в небольшом числе контейнеров Roaring Bitmap, чтобы максимально повысить степень сжатия и производительность выполнения запросов.
- Механизм Bit-Sliced Index преобразует значение в двоичное представление. Для типов с плавающей запятой используется фиксированно-точечное представление, что может привести к потере точности. Точность можно настраивать, задавая количество бит для дробной части; по умолчанию используется 24 бита, чего достаточно для большинства сценариев. Вы можете задать количество бит для целой и дробной части при создании NumericIndexedVector с помощью агрегатной функции groupNumericIndexedVector с суффиксом `-State`.
- Для индексов возможны три состояния: ненулевое значение, нулевое значение и отсутствие. В NumericIndexedVector хранятся только ненулевые и нулевые значения. Кроме того, при покомпонентных операциях между двумя NumericIndexedVector значение отсутствующего индекса трактуется как 0. В сценарии деления результат также равен нулю, если делитель равен нулю.

## Создание объекта numericIndexedVector {#create-numeric-indexed-vector-object}

Существует два способа создать эту структуру: первый — использовать агрегатную функцию `groupNumericIndexedVector` с суффиксом `-State`.
Вы можете добавить суффикс `-if`, чтобы задать дополнительное условие.
Агрегатная функция будет обрабатывать только те строки, для которых выполняется это условие.
Второй способ — построить её из значения типа Map с помощью `numericIndexedVectorBuild`.
Функция `groupNumericIndexedVectorState` позволяет настроить количество целых и дробных битов через параметры, в то время как `numericIndexedVectorBuild` такой возможности не предоставляет.

## groupNumericIndexedVector {#group-numeric-indexed-vector}

Создает `NumericIndexedVector` из двух столбцов данных и возвращает сумму всех значений как значение типа `Float64`. Если добавить суффикс `State`, возвращает объект `NumericIndexedVector`.

**Синтаксис**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**Параметры**

* `type`: String, необязательный. Определяет формат хранения. В настоящее время поддерживается только `'BSI'`.
* `integer_bit_num`: `UInt32`, необязательный. Актуален для формата хранения `'BSI'`. Этот параметр задаёт количество бит, используемых для целой части. Если тип индекса является целочисленным, значение по умолчанию соответствует количеству бит, используемых для хранения индекса. Например, если тип индекса — UInt16, значение `integer_bit_num` по умолчанию равно 16. Для типов индекса Float32 и Float64 значение `integer&#95;bit&#95;num` по умолчанию равно 40, поэтому целая часть данных, которую можно представить, находится в диапазоне `[-2^39, 2^39 - 1]`. Допустимый диапазон — `[0, 64]`.
* `fraction_bit_num`: `UInt32`, необязательный. Актуален для формата хранения `'BSI'`. Этот параметр задаёт количество бит, используемых для дробной части. Когда тип значения — целочисленный, значение по умолчанию равно 0; когда тип значения — Float32 или Float64, значение по умолчанию равно 24. Допустимый диапазон — `[0, 24]`.
* Дополнительно накладывается ограничение: допустимый диапазон для `integer&#95;bit&#95;num + fraction&#95;bit&#95;num` — `[0, 64]`.
* `col1`: Индексный столбец. Поддерживаемые типы: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`.
* `col2`: Столбец значений. Поддерживаемые типы: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`.

**Возвращаемое значение**

Значение типа `Float64`, представляющее сумму всех значений.

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
  нижеприведённые теги используются для генерации документации из системных таблиц и не должны быть удалены.
  Подробнее см. https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

## numericIndexedVectorAllValueSum {#numericIndexedVectorAllValueSum}

Добавлена в версии: v25.7

Возвращает сумму всех значений в numericIndexedVector.

**Синтаксис**

```sql
numericIndexedVectorAllValueSum(v)
```

**Аргументы**

* `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает сумму. [`Float64`](/sql-reference/data-types/float)

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



## numericIndexedVectorBuild {#numericIndexedVectorBuild}

Introduced in: v25.7


Creates a NumericIndexedVector from a map. The map's keys represent the vector's index and map's value represents the vector's value.
        

**Syntax**

```sql
numericIndexedVectorBuild(map)
```

**Arguments**

- `map` — A mapping from index to value. [`Map`](/sql-reference/data-types/map)


**Returned value**

Returns a NumericIndexedVector object. [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=Response
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```



## numericIndexedVectorCardinality {#numericIndexedVectorCardinality}

Introduced in: v25.7


Returns the cardinality (number of unique indexes) of the numericIndexedVector.
        

**Syntax**

```sql
numericIndexedVectorCardinality(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns the number of unique indexes. [`UInt64`](/sql-reference/data-types/int-uint)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res─┐
│  3  │
└─────┘
```



## numericIndexedVectorGetValue {#numericIndexedVectorGetValue}

Introduced in: v25.7


Retrieves the value corresponding to a specified index from a numericIndexedVector.
        

**Syntax**

```sql
numericIndexedVectorGetValue(v, i)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `i` — The index for which the value is to be retrieved. [`(U)Int*`](/sql-reference/data-types/int-uint)


**Returned value**

A numeric value with the same type as the value type of NumericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

```response title=Response
┌─res─┐
│  30 │
└─────┘
```



## numericIndexedVectorPointwiseAdd {#numericIndexedVectorPointwiseAdd}

Introduced in: v25.7


Performs pointwise addition between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseDivide {#numericIndexedVectorPointwiseDivide}

Introduced in: v25.7


Performs pointwise division between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseEqual {#numericIndexedVectorPointwiseEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the values are equal, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

****

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



## numericIndexedVectorPointwiseGreater {#numericIndexedVectorPointwiseGreater}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is greater than the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseGreaterEqual {#numericIndexedVectorPointwiseGreaterEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is greater than or equal to the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseLess {#numericIndexedVectorPointwiseLess}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is less than the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseLessEqual {#numericIndexedVectorPointwiseLessEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the first vector's value is less than or equal to the second vector's value, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseMultiply {#numericIndexedVectorPointwiseMultiply}

Introduced in: v25.7


Performs pointwise multiplication between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

****

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



## numericIndexedVectorPointwiseNotEqual {#numericIndexedVectorPointwiseNotEqual}

Introduced in: v25.7


Performs pointwise comparison between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
The result is a numericIndexedVector containing the indices where the values are not equal, with all corresponding values set to 1.
        

**Syntax**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorPointwiseSubtract {#numericIndexedVectorPointwiseSubtract}

Introduced in: v25.7


Performs pointwise subtraction between a numericIndexedVector and either another numericIndexedVector or a numeric constant.
        

**Syntax**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**Arguments**

- `v1` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — A numeric constant or numericIndexedVector object. [`(U)Int*`](/sql-reference/data-types/int-uint) or [`Float*`](/sql-reference/data-types/float) or [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a new numericIndexedVector object. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Examples**

**Usage example**

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



## numericIndexedVectorShortDebugString {#numericIndexedVectorShortDebugString}

Introduced in: v25.7


Returns internal information of the numericIndexedVector in JSON format.
This function is primarily used for debugging purposes.
        

**Syntax**

```sql
numericIndexedVectorShortDebugString(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a JSON string containing debug information. [`String`](/sql-reference/data-types/string)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```

```response title=Response
Строка 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```



## numericIndexedVectorToMap {#numericIndexedVectorToMap}

Introduced in: v25.7


Converts a numericIndexedVector to a map.
        

**Syntax**

```sql
numericIndexedVectorToMap(v)
```

**Arguments**

- `v` —  [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)


**Returned value**

Returns a map with index-value pairs. [`Map`](/sql-reference/data-types/map)

**Examples**

**Usage example**

```sql title=Query
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Response
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

{/*AUTOGENERATED_END*/ }
