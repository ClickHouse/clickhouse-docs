---
'description': 'Документация для NumericIndexedVector и его функций'
'sidebar_label': 'NumericIndexedVector'
'slug': '/sql-reference/functions/numeric-indexed-vector-functions'
'title': 'Функции NumericIndexedVector'
'doc_type': 'reference'
---
# NumericIndexedVector

NumericIndexedVector — это абстрактная структура данных, которая инкапсулирует вектор и реализует агрегирующие и покоординатные операции с вектором. Метод хранения — Bit-Sliced Index. Для теоретической базы и сценариев использования см. статью [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411).

## BSI {#bit-sliced-index}

В методе хранения BSI (Bit-Sliced Index) данные хранятся в [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268), а затем сжимаются с использованием [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap). Агрегирующие операции и покоординатные операции выполняются непосредственно над сжатыми данными, что может значительно повысить эффективность хранения и запросов.

Вектор содержит индексы и соответствующие им значения. Ниже приведены некоторые характеристики и ограничения этой структуры данных в режиме хранения BSI:

- Тип индекса может быть одним из `UInt8`, `UInt16` или `UInt32`. **Примечание:** Учитывая производительность 64-битной реализации Roaring Bitmap, формат BSI не поддерживает `UInt64`/`Int64`.
- Тип значения может быть одним из `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32` или `Float64`. **Примечание:** Тип значения не расширяется автоматически. Например, если вы используете `UInt8` в качестве типа значения, любое сумма, превышающая емкость `UInt8`, приведет к переполнению, а не к повышению к более высокому типу; аналогично, операции с целыми числами будут давать целочисленные результаты (например, деление не будет автоматически преобразовано в результат с плавающей запятой). Поэтому важно заранее планировать и проектировать тип значения. В реальных сценариях обычно используются типы с плавающей запятой (`Float32`/`Float64`).
- Операции могут выполняться только для двух векторов с одинаковым типом индекса и типом значения.
- Основное хранилище использует Bit-Sliced Index, с битовой картой, хранящей индексы. Roaring Bitmap используется в качестве конкретной реализации битовой карты. Лучшей практикой является максимально концентрировать индекс в нескольких контейнерах Roaring Bitmap для оптимизации сжатия и производительности запросов.
- Механизм Bit-Sliced Index преобразует значение в двоичный формат. Для типов с плавающей запятой преобразование выполняется с использованием фиксированной записи, что может привести к потере точности. Точность можно настроить путем настройки количества бит, используемых для дробной части, по умолчанию 24 бита, что достаточно для большинства сценариев. Вы можете настроить количество бит целой и дробной части при создании NumericIndexedVector с использованием агрегатной функции groupNumericIndexedVector с `-State`.
- Существуют три случая для индексов: ненулевое значение, нулевое значение и несуществующее. В NumericIndexedVector хранятся только ненулевое значение и нулевое значение. Кроме того, в покоординатных операциях между двумя NumericIndexedVectors значение несуществующего индекса будет считаться равным 0. В случае деления результат равен нулю, когда делитель равен нулю.

## Create a numericIndexedVector object {#create-numeric-indexed-vector-object}

Существует два способа создания этой структуры: один из них — использовать агрегатную функцию `groupNumericIndexedVector` с `-State`. Вы можете добавить суффикс `-if`, чтобы принять дополнительное условие. Агрегатная функция будет обрабатывать только строки, которые вызывают данное условие. Другой способ — построить его из карты с использованием `numericIndexedVectorBuild`. Функция `groupNumericIndexedVectorState` позволяет настраивать количество целых и дробных бит через параметры, тогда как `numericIndexedVectorBuild` этого не делает.

## groupNumericIndexedVector {#group-numeric-indexed-vector}

Конструирует NumericIndexedVector из двух данных колонок и возвращает сумму всех значений в виде типа `Float64`. Если добавлен суффикс `State`, он возвращает объект NumericIndexedVector.

**Синтаксис**

```sql
groupNumericIndexedVectorState(col1, col2)
groupNumericIndexedVectorState(type, integer_bit_num, fraction_bit_num)(col1, col2)
```

**Параметры**

- `type`: Строка, необязательный. Указывает формат хранения. В настоящее время поддерживается только `'BSI'`.
- `integer_bit_num`: `UInt32`, необязательный. Действительно в формате хранения `'BSI'`, этот параметр указывает количество бит, используемых для целой части. Когда тип индекса — целочисленный, значение по умолчанию соответствует количеству бит, используемым для хранения индекса. Например, если тип индекса — UInt16, значение по умолчанию для `integer_bit_num` равно 16. Для типов индекса Float32 и Float64 значение по умолчанию для `integer_bit_num` равно 40, поэтому целая часть данных, которую можно представить, находится в диапазоне `[-2^39, 2^39 - 1]`. Допустимый диапазон — `[0, 64]`.
- `fraction_bit_num`: `UInt32`, необязательный. Действительно в формате хранения `'BSI'`, этот параметр указывает количество бит, используемых для дробной части. Когда тип значения — целочисленный, значение по умолчанию равно 0; когда тип значения — Float32 или Float64, значение по умолчанию равно 24. Допустимый диапазон — `[0, 24]`.
- Также есть ограничение, что допустимый диапазон `integer_bit_num + fraction_bit_num` равен [0, 64].
- `col1`: Колонка индекса. Поддерживаемые типы: `UInt8`/`UInt16`/`UInt32`/`Int8`/`Int16`/`Int32`.
- `col2`: Колонка значений. Поддерживаемые типы: `Int8`/`Int16`/`Int32`/`Int64`/`UInt8`/`UInt16`/`UInt32`/`UInt64`/`Float32`/`Float64`.

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

## numericIndexedVectorBuild {#numeric-indexed-vector-build}

Создает NumericIndexedVector из карты. Ключи карты представляют индекс вектора, а значения карты представляют значение вектора.

Синтаксис

```sql
numericIndexedVectorBuild(map)
```

Аргументы

- `map` — Соответствие от индекса к значению.

Пример

```sql
SELECT numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])) AS res, toTypeName(res);
```

Результат

```text
┌─res─┬─toTypeName(res)────────────────────────────────────────────┐
│     │ AggregateFunction(groupNumericIndexedVector, UInt8, UInt8) │
└─────┴────────────────────────────────────────────────────────────┘
```

## numericIndexedVectorToMap

Конвертирует NumericIndexedVector в карту.

Синтаксис

```sql
numericIndexedVectorToMap(numericIndexedVector)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.

Пример

```sql
SELECT numericIndexedVectorToMap(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

Результат

```text
┌─res──────────────┐
│ {1:10,2:20,3:30} │
└──────────────────┘
```

## numericIndexedVectorCardinality

Возвращает кардинальность (число уникальных индексов) NumericIndexedVector.

Синтаксис

```sql
numericIndexedVectorCardinality(numericIndexedVector)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.

Пример

```sql
SELECT numericIndexedVectorCardinality(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

Результат

```text
┌─res─┐
│  3  │
└─────┘
```

## numericIndexedVectorAllValueSum

Возвращает сумму всех значений в NumericIndexedVector.

Синтаксис

```sql
numericIndexedVectorAllValueSum(numericIndexedVector)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.

Пример

```sql
SELECT numericIndexedVectorAllValueSum(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res;
```

Результат

```text
┌─res─┐
│  60 │
└─────┘
```

## numericIndexedVectorGetValue

Получает значение, соответствующее указанному индексу.

Синтаксис

```sql
numericIndexedVectorGetValue(numericIndexedVector, index)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `index` — Индекс, для которого нужно получить значение.

Пример

```sql
SELECT numericIndexedVectorGetValue(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30])), 3) AS res;
```

Результат

```text
┌─res─┐
│  30 │
└─────┘
```

## numericIndexedVectorShortDebugString

Возвращает внутреннюю информацию о NumericIndexedVector в формате json. Эта функция в первую очередь используется для целей отладки.

Синтаксис

```sql
numericIndexedVectorShortDebugString(numericIndexedVector)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.

Пример

```sql
SELECT numericIndexedVectorShortDebugString(numericIndexedVectorBuild(mapFromArrays([1, 2, 3], [10, 20, 30]))) AS res\G;
```
Результат

```text
Row 1:
──────
res: {"vector_type":"BSI","index_type":"char8_t","value_type":"char8_t","integer_bit_num":8,"fraction_bit_num":0,"zero_indexes_info":{"cardinality":"0"},"non_zero_indexes_info":{"total_cardinality":"3","all_value_sum":60,"number_of_bitmaps":"8","bitmap_info":{"cardinality":{"0":"0","1":"2","2":"2","3":"2","4":"2","5":"0","6":"0","7":"0"}}}}
```

- `vector_type`: тип хранения вектора, в настоящее время поддерживается только `BSI`.
- `index_type`: тип индекса.
- `value_type`: тип значения.

Следующая информация действительна для вектора типа BSI.

- `integer_bit_num`: количество бит, используемых для целой части.
- `fraction_bit_num`: количество бит, используемых для дробной части.
- `zero_indexes info`: информация об индексах со значением, равным 0
    - `cardinality`: количество индексов со значением, равным 0.
- `non_zero_indexes info`: информация об индексах со значением, не равным 0
    - `total_cardinality`: количество индексов со значением, не равным 0.
    - `all value sum`: сумма всех значений.
    - `number_of_bitmaps`: количество битовых карт, используемых этими индексами, которые имеют значение не 0.
    - `bitmap_info`: информация о каждой битовой карте
        - `cardinality`: количество индексов в каждой битовой карте.

## numericIndexedVectorPointwiseAdd

Выполняет покоординатное сложение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Функция возвращает новый NumericIndexedVector.

Синтаксис

```sql
numericIndexedVectorPointwiseAdd(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseAdd(vec1, 2)) AS res2;
```

Результат

```text
┌─res1──────────────────┬─res2─────────────┐
│ {1:10,2:30,3:50,4:30} │ {1:12,2:22,3:32} │
└───────────────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseSubtract

Выполняет покоординатное вычитание между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Функция возвращает новый NumericIndexedVector.

Синтаксис

```sql
numericIndexedVectorPointwiseSubtract(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseSubtract(vec1, 2)) AS res2;
```

Результат

```text
┌─res1───────────────────┬─res2────────────┐
│ {1:10,2:10,3:10,4:-30} │ {1:8,2:18,3:28} │
└────────────────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseMultiply

Выполняет покоординатное умножение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Функция возвращает новый NumericIndexedVector.

Синтаксис

```sql
numericIndexedVectorPointwiseMultiply(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toInt32(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseMultiply(vec1, 2)) AS res2;
```

Результат

```text
┌─res1──────────┬─res2─────────────┐
│ {2:200,3:600} │ {1:20,2:40,3:60} │
└───────────────┴──────────────────┘
```

## numericIndexedVectorPointwiseDivide

Выполняет покоординатное деление между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Функция возвращает новый NumericIndexedVector. Результат равен нулю, когда делитель равен нулю.

Синтаксис

```sql
numericIndexedVectorPointwiseDivide(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseDivide(vec1, 2)) AS res2;
```

Результат

```text
┌─res1────────┬─res2────────────┐
│ {2:2,3:1.5} │ {1:5,2:10,3:15} │
└─────────────┴─────────────────┘
```

## numericIndexedVectorPointwiseEqual

Выполняет покоординатное сравнение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Результат — это NumericIndexedVector, содержащий индексы, где значения равны, со всеми соответствующими значениями, установленными в 1.

Синтаксис

```sql
numericIndexedVectorPointwiseEqual(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseEqual(vec1, 20)) AS res2;
```

Результат

```text
┌─res1──┬─res2──┐
│ {2:1} │ {2:1} │
└───────┴───────┘
```

## numericIndexedVectorPointwiseNotEqual

Выполняет покоординатное сравнение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Результат — это NumericIndexedVector, содержащий индексы, где значения не равны, со всеми соответствующими значениями, установленными в 1.

Синтаксис

```sql
numericIndexedVectorPointwiseNotEqual(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 20, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseNotEqual(vec1, 20)) AS res2;
```

Результат

```text
┌─res1──────────┬─res2──────┐
│ {1:1,3:1,4:1} │ {1:1,3:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseLess

Выполняет покоординатное сравнение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Результат — это NumericIndexedVector, содержащий индексы, где значение первого вектора меньше значения второго вектора, со всеми соответствующими значениями, установленными в 1.

Синтаксис

```sql
numericIndexedVectorPointwiseLess(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLess(vec1, 20)) AS res2;
```

Результат

```text
┌─res1──────┬─res2──┐
│ {3:1,4:1} │ {1:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseLessEqual

Выполняет покоординатное сравнение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Результат — это NumericIndexedVector, содержащий индексы, где значение первого вектора меньше либо равно значению второго вектора, со всеми соответствующими значениями, установленными в 1.

Синтаксис

```sql
numericIndexedVectorPointwiseLessEqual(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 30]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseLessEqual(vec1, 20)) AS res2;
```

Результат

```text
┌─res1──────────┬─res2──────┐
│ {2:1,3:1,4:1} │ {1:1,2:1} │
└───────────────┴───────────┘
```

## numericIndexedVectorPointwiseGreater

Выполняет покоординатное сравнение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Результат — это NumericIndexedVector, содержащий индексы, где значение первого вектора больше значения второго вектора, со всеми соответствующими значениями, установленными в 1.

Синтаксис

```sql
numericIndexedVectorPointwiseGreater(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreater(vec1, 20)) AS res2;
```

Результат

```text
┌─res1──────┬─res2──┐
│ {1:1,3:1} │ {3:1} │
└───────────┴───────┘
```

## numericIndexedVectorPointwiseGreaterEqual

Выполняет покоординатное сравнение между NumericIndexedVector и либо другим NumericIndexedVector, либо числовой константой. Результат — это NumericIndexedVector, содержащий индексы, где значение первого вектора больше либо равно значению второго вектора, со всеми соответствующими значениями, установленными в 1.

Синтаксис

```sql
numericIndexedVectorPointwiseGreaterEqual(numericIndexedVector, numericIndexedVector | numeric)
```

Аргументы

- `numericIndexedVector` — Объект NumericIndexedVector.
- `numeric` - числовая константа.

Пример

```sql
WITH
    numericIndexedVectorBuild(mapFromArrays([1, 2, 3], arrayMap(x -> toFloat64(x), [10, 20, 50]))) AS vec1,
    numericIndexedVectorBuild(mapFromArrays([2, 3, 4], arrayMap(x -> toFloat64(x), [20, 40, 30]))) AS vec2
SELECT
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, vec2)) AS res1,
    numericIndexedVectorToMap(numericIndexedVectorPointwiseGreaterEqual(vec1, 20)) AS res2;
```

Результат

```text
┌─res1──────────┬─res2──────┐
│ {1:1,2:1,3:1} │ {2:1,3:1} │
└───────────────┴───────────┘
```

<!-- 
the tags below are used to generate the documentation from system tables, and should not be removed.
For more details see https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
-->

<!--AUTOGENERATED_START-->
<!--AUTOGENERATED_END-->