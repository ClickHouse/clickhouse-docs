---
description: 'Документация по NumericIndexedVector и его функциям'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'Функции NumericIndexedVector'
doc_type: 'reference'
---



# NumericIndexedVector

NumericIndexedVector — это абстрактная структура данных, которая инкапсулирует вектор и реализует агрегирующие и поэлементные операции над векторами. В качестве метода хранения используется Bit-Sliced Index. За теоретическим обоснованием и сценариями использования обратитесь к статье [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411).



## BSI {#bit-sliced-index}

В методе хранения BSI (Bit-Sliced Index) данные сохраняются в формате [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268), а затем сжимаются с использованием [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap). Операции агрегирования и поэлементные операции выполняются непосредственно над сжатыми данными, что позволяет значительно повысить эффективность хранения и выполнения запросов.

Вектор содержит индексы и соответствующие им значения. Ниже приведены основные характеристики и ограничения этой структуры данных в режиме хранения BSI:

- Тип индекса может быть одним из следующих: `UInt8`, `UInt16` или `UInt32`. **Примечание:** С учетом производительности 64-битной реализации Roaring Bitmap формат BSI не поддерживает типы `UInt64`/`Int64`.
- Тип значения может быть одним из следующих: `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32` или `Float64`. **Примечание:** Тип значения не расширяется автоматически. Например, если в качестве типа значения используется `UInt8`, любая сумма, превышающая диапазон `UInt8`, приведет к переполнению, а не к автоматическому повышению до более широкого типа; аналогично операции над целыми числами возвращают целочисленные результаты (например, деление не преобразуется автоматически в результат с плавающей точкой). Поэтому важно заранее спланировать и выбрать подходящий тип значения. В практических сценариях обычно используются типы с плавающей точкой (`Float32`/`Float64`).
- Операции могут выполняться только между двумя векторами с одинаковым типом индекса и типом значения.
- Базовое хранилище использует Bit-Sliced Index, при этом индексы сохраняются в битовой карте. В качестве конкретной реализации битовой карты используется Roaring Bitmap. Рекомендуется по возможности концентрировать индексы в минимальном количестве контейнеров Roaring Bitmap для максимального сжатия и производительности запросов.
- Механизм Bit-Sliced Index преобразует значения в двоичный формат. Для типов с плавающей точкой преобразование использует представление с фиксированной точкой, что может привести к потере точности. Точность можно настроить, изменив количество битов, используемых для дробной части; по умолчанию используется 24 бита, чего достаточно для большинства сценариев. Вы можете настроить количество битов для целой и дробной частей при создании NumericIndexedVector с помощью агрегатной функции groupNumericIndexedVector с суффиксом `-State`.
- Для индексов существует три варианта: ненулевое значение, нулевое значение и отсутствующий индекс. В NumericIndexedVector сохраняются только ненулевые и нулевые значения. Кроме того, при поэлементных операциях между двумя NumericIndexedVector значение отсутствующего индекса рассматривается как 0. При делении результат равен нулю, если делитель равен нулю.


## Создание объекта numericIndexedVector {#create-numeric-indexed-vector-object}

Существует два способа создания этой структуры: первый — использовать агрегатную функцию `groupNumericIndexedVector` с суффиксом `-State`.
Можно добавить суффикс `-if` для задания дополнительного условия.
Агрегатная функция будет обрабатывать только строки, удовлетворяющие этому условию.
Второй способ — построить структуру из словаря с помощью функции `numericIndexedVectorBuild`.
Функция `groupNumericIndexedVectorState` позволяет настраивать количество целых и дробных битов через параметры, тогда как `numericIndexedVectorBuild` такой возможности не предоставляет.


## groupNumericIndexedVector {#group-numeric-indexed-vector}

Создаёт NumericIndexedVector из двух столбцов данных и возвращает сумму всех значений типа `Float64`. Если добавлен суффикс `State`, возвращается объект NumericIndexedVector.

**Синтаксис**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**Параметры**

- `type`: String, необязательный. Задаёт формат хранения. В настоящее время поддерживается только `'BSI'`.
- `integer_bit_num`: `UInt32`, необязательный. Применяется при формате хранения `'BSI'`. Этот параметр задаёт количество битов для целой части. Если тип индекса является целочисленным, значение по умолчанию соответствует количеству битов, используемых для хранения индекса. Например, если тип индекса — UInt16, значение `integer_bit_num` по умолчанию равно 16. Для типов индексов Float32 и Float64 значение integer_bit_num по умолчанию равно 40, поэтому целая часть данных может находиться в диапазоне `[-2^39, 2^39 - 1]`. Допустимый диапазон: `[0, 64]`.
- `fraction_bit_num`: `UInt32`, необязательный. Применяется при формате хранения `'BSI'`. Этот параметр задаёт количество битов для дробной части. Если тип значения является целочисленным, значение по умолчанию равно 0; если тип значения — Float32 или Float64, значение по умолчанию равно 24. Допустимый диапазон: `[0, 24]`.
- Также существует ограничение: допустимый диапазон суммы integer_bit_num + fraction_bit_num составляет [0, 64].
- `col1`: Столбец индекса. Поддерживаемые типы: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`.
- `col2`: Столбец значений. Поддерживаемые типы: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`.

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
Документация ниже сгенерирована из системной таблицы `system.functions`.
:::

<!--
теги ниже используются для генерации документации из системных таблиц и не должны удаляться.
Подробнее см. https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->


<!--AUTOGENERATED_START-->

## numericIndexedVectorAllValueSum {#numericIndexedVectorAllValueSum}

Введена в версии: v25.7

Возвращает сумму всех значений в numericIndexedVector.

**Синтаксис**

```sql
numericIndexedVectorAllValueSum(v)
```

**Аргументы**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает сумму. [`Float64`](/sql-reference/data-types/float)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Ответ
┌─res─┐
│  60 │
└─────┘
```


## numericIndexedVectorBuild {#numericIndexedVectorBuild}

Введена в версии: v25.7

Создаёт NumericIndexedVector из словаря. Ключи словаря представляют индексы вектора, а значения словаря — значения вектора.

**Синтаксис**

```sql
numericIndexedVectorBuild(map)
```

**Аргументы**

- `map` — Отображение индекса на значение. [`Map`](/sql-reference/data-types/map)

**Возвращаемое значение**

Возвращает объект NumericIndexedVector. [`AggregateFunction`](/sql-reference/data-types/aggregatefunction)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

```response title=Результат
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```


## numericIndexedVectorCardinality {#numericIndexedVectorCardinality}

Введена в версии: v25.7

Возвращает мощность (количество уникальных индексов) numericIndexedVector.

**Синтаксис**

```sql
numericIndexedVectorCardinality(v)
```

**Аргументы**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает количество уникальных индексов. [`UInt64`](/sql-reference/data-types/int-uint)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Ответ
┌─res─┐
│  3  │
└─────┘
```


## numericIndexedVectorGetValue {#numericIndexedVectorGetValue}

Введена в версии: v25.7

Извлекает значение, соответствующее указанному индексу из numericIndexedVector.

**Синтаксис**

```sql
numericIndexedVectorGetValue(v, i)
```

**Аргументы**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `i` — Индекс, для которого извлекается значение. [`(U)Int*`](/sql-reference/data-types/int-uint)

**Возвращаемое значение**

Числовое значение того же типа, что и тип значения NumericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float)

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


## numericIndexedVectorPointwiseAdd {#numericIndexedVectorPointwiseAdd}

Введена в версии: v25.7

Выполняет поэлементное сложение между numericIndexedVector и другим numericIndexedVector или числовой константой.

**Синтаксис**

```sql
numericIndexedVectorPointwiseAdd(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

```response title=Результат
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```


## numericIndexedVectorPointwiseDivide {#numericIndexedVectorPointwiseDivide}

Введена в версии: v25.7

Выполняет поэлементное деление numericIndexedVector на другой numericIndexedVector или числовую константу.

**Синтаксис**

```sql
numericIndexedVectorPointwiseDivide(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

```response title=Результат
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```


## numericIndexedVectorPointwiseEqual {#numericIndexedVectorPointwiseEqual}

Введена в версии: v25.7

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значения равны, при этом все соответствующие значения устанавливаются равными 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseEqual(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

---

```sql title=Запрос
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

```response title=Результат
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```


## numericIndexedVectorPointwiseGreater {#numericIndexedVectorPointwiseGreater}

Введена в версии: v25.7

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значение первого вектора больше значения второго вектора, при этом все соответствующие значения устанавливаются равными 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseGreater(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

```response title=Ответ
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```


## numericIndexedVectorPointwiseGreaterEqual {#numericIndexedVectorPointwiseGreaterEqual}

Введена в версии: v25.7

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значение первого вектора больше или равно значению второго вектора, при этом все соответствующие значения устанавливаются равными 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseGreaterEqual(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

```response title=Результат
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseLess {#numericIndexedVectorPointwiseLess}

Введена в версии: v25.7

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значение первого вектора меньше значения второго вектора, при этом все соответствующие значения устанавливаются равными 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseLess(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

```response title=Ответ
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```


## numericIndexedVectorPointwiseLessEqual {#numericIndexedVectorPointwiseLessEqual}

Введена в версии: v25.7

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значение первого вектора меньше или равно значению второго вектора, при этом все соответствующие значения устанавливаются равными 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseLessEqual(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
with
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) as vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) as vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

```response title=Ответ
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```


## numericIndexedVectorPointwiseMultiply {#numericIndexedVectorPointwiseMultiply}

Введена в версии: v25.7

Выполняет поэлементное умножение numericIndexedVector на другой numericIndexedVector или числовую константу.

**Синтаксис**

```sql
numericIndexedVectorPointwiseMultiply(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

---

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

Введена в версии: v25.7

Выполняет поэлементное сравнение между numericIndexedVector и другим numericIndexedVector или числовой константой.
Результатом является numericIndexedVector, содержащий индексы, в которых значения не равны, при этом все соответствующие значения устанавливаются равными 1.

**Синтаксис**

```sql
numericIndexedVectorPointwiseNotEqual(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint), [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

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


## numericIndexedVectorPointwiseSubtract {#numericIndexedVectorPointwiseSubtract}

Введена в версии: v25.7

Выполняет поэлементное вычитание между numericIndexedVector и другим numericIndexedVector или числовой константой.

**Синтаксис**

```sql
numericIndexedVectorPointwiseSubtract(v1, v2)
```

**Аргументы**

- `v1` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)
- `v2` — Числовая константа или объект numericIndexedVector. [`(U)Int*`](/sql-reference/data-types/int-uint) или [`Float*`](/sql-reference/data-types/float) или [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает новый объект numericIndexedVector. [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Примеры**

**Пример использования**

```sql title=Запрос
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

```response title=Результат
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```


## numericIndexedVectorShortDebugString {#numericIndexedVectorShortDebugString}

Введена в версии: v25.7

Возвращает внутреннюю информацию о numericIndexedVector в формате JSON.
Функция предназначена в первую очередь для отладки.

**Синтаксис**

```sql
numericIndexedVectorShortDebugString(v)
```

**Аргументы**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

JSON-строка с отладочной информацией. [`String`](/sql-reference/data-types/string)

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


## numericIndexedVectorToMap {#numericIndexedVectorToMap}

Добавлено в версии: v25.7

Преобразует numericIndexedVector в map.

**Синтаксис**

```sql
numericIndexedVectorToMap(v)
```

**Аргументы**

- `v` — [`numericIndexedVector`](/sql-reference/functions/numeric-indexed-vector-functions#create-numeric-indexed-vector-object)

**Возвращаемое значение**

Возвращает map с парами индекс-значение. [`Map`](/sql-reference/data-types/map)

**Примеры**

**Пример использования**

```sql title=Запрос
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

```response title=Ответ
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

<!--AUTOGENERATED_END-->
