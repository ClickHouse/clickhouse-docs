---
description: 'Документация по NumericIndexedVector и его функциям'
sidebar_label: 'NumericIndexedVector'
slug: /sql-reference/functions/numeric-indexed-vector-functions
title: 'Функции NumericIndexedVector'
doc_type: 'reference'
---

# NumericIndexedVector {#numericindexedvector}

NumericIndexedVector — это абстрактная структура данных, которая инкапсулирует вектор и реализует агрегирующие и покомпонентные операции над вектором. В качестве метода хранения используется Bit-Sliced Index. Теоретические основы и сценарии использования описаны в статье [Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/pdf/2405.08411).

## BSI {#bit-sliced-index}

В методе хранения BSI (Bit-Sliced Index) данные хранятся в формате [Bit-Sliced Index](https://dl.acm.org/doi/abs/10.1145/253260.253268), а затем сжимаются с помощью [Roaring Bitmap](https://github.com/RoaringBitmap/RoaringBitmap). Агрегирующие и поэлементные операции выполняются непосредственно над сжатыми данными, что может существенно повысить эффективность хранения и запросов.

Вектор содержит индексы и соответствующие им значения. Ниже приведены некоторые характеристики и ограничения этой структуры данных в режиме хранения BSI:

- Тип индекса может быть одним из `UInt8`, `UInt16` или `UInt32`. **Примечание:** с учётом производительности 64-битной реализации Roaring Bitmap формат BSI не поддерживает `UInt64`/`Int64`.
- Тип значения может быть одним из `Int8`, `Int16`, `Int32`, `Int64`, `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Float32` или `Float64`. **Примечание:** тип значения не расширяется автоматически. Например, если вы используете `UInt8` как тип значения, любая сумма, превышающая допустимый диапазон `UInt8`, приведёт к переполнению, а не к расширению типа до более широкого; аналогично, операции над целыми числами будут возвращать целочисленный результат (например, деление не будет автоматически приводить к результату с плавающей запятой). Поэтому важно заранее продумать и спроектировать тип значения. В реальных сценариях обычно используются типы с плавающей запятой (`Float32`/`Float64`).
- Операции можно выполнять только над двумя векторами с одинаковым типом индекса и типом значения.
- Подлежащая система хранения использует Bit-Sliced Index, при этом bitmap хранит индексы. Roaring Bitmap используется как конкретная реализация bitmap. Рекомендуемой практикой является по возможности концентрировать индексы в небольшом числе контейнеров Roaring Bitmap для максимизации степени сжатия и производительности запросов.
- Механизм Bit-Sliced Index преобразует значение в двоичное представление. Для типов с плавающей запятой используется фиксированное-точечное представление (fixed-point), что может приводить к потере точности. Точность можно регулировать, настраивая количество бит, отводимых под дробную часть; по умолчанию используется 24 бита, чего достаточно для большинства сценариев. Вы можете настроить количество бит для целой и дробной части при конструировании NumericIndexedVector с помощью агрегатной функции groupNumericIndexedVector с суффиксом `-State`.
- Для индексов возможны три состояния: ненулевое значение, нулевое значение и отсутствие. В NumericIndexedVector хранятся только ненулевые и нулевые значения. Кроме того, в поэлементных операциях между двумя NumericIndexedVector значение отсутствующего индекса трактуется как 0. В сценарии деления результатом будет ноль, если делитель равен нулю.

## Создание объекта numericIndexedVector {#create-numeric-indexed-vector-object}

Существует два способа создать эту структуру: первый — использовать агрегатную функцию `groupNumericIndexedVector` с суффиксом `-State`.
Можно добавить суффикс `-if`, чтобы задать дополнительное условие.
Агрегатная функция будет обрабатывать только те строки, для которых выполняется условие.
Второй способ — построить её из map с помощью `numericIndexedVectorBuild`.
Функция `groupNumericIndexedVectorState` позволяет настраивать количество целочисленных и дробных битов через параметры, тогда как `numericIndexedVectorBuild` такой возможности не предоставляет.

## groupNumericIndexedVector {#group-numeric-indexed-vector}

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
  расположенные ниже теги используются для генерации документации из системных таблиц, их нельзя удалять.
  Подробнее см. https://github.com/ClickHouse/clickhouse-docs/blob/main/contribute/autogenerated-documentation-from-source.md
  */ }

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
