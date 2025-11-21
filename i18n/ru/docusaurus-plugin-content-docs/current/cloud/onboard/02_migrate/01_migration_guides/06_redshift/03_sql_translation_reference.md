---
sidebar_label: 'Справочник по преобразованию SQL'
slug: /migrations/redshift/sql-translation-reference
description: 'Справочник по преобразованию SQL с Amazon Redshift на ClickHouse'
keywords: ['Redshift']
title: 'Руководство по преобразованию SQL с Amazon Redshift на ClickHouse'
doc_type: 'reference'
---



# Руководство по преобразованию SQL Amazon Redshift



## Типы данных {#data-types}

Пользователи, переносящие данные между ClickHouse и Redshift, сразу заметят,
что ClickHouse предлагает более широкий набор типов, которые также менее
ограничительны. В то время как Redshift требует от пользователей указывать возможную длину строк,
даже если она переменная, ClickHouse снимает это ограничение и нагрузку
с пользователя, сохраняя строки без кодирования в байтах. Таким образом, тип
String в ClickHouse не имеет ограничений или требований к указанию длины.

Кроме того, пользователи могут использовать типы Array, Tuple и Enum — отсутствующие в
Redshift как полноценные типы (хотя Array/Struct можно имитировать
с помощью `SUPER`), что является распространённой проблемой пользователей. ClickHouse также
позволяет сохранять состояния агрегации как во время выполнения запроса, так и в таблице.
Это позволяет предварительно агрегировать данные, обычно
с использованием материализованных представлений, что может значительно повысить производительность
типовых запросов.

Ниже приведено соответствие типов ClickHouse каждому типу Redshift:


| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                        |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                       |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                       |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - (поддерживают высокую точность и большие диапазоны значений) |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                                          |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                                          |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                                           |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                                                  |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                                          |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                                          |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [Геопространственные типы данных](/sql-reference/data-types/geo)                                                                                                                                                                                                      |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [Геопространственные типы данных](/sql-reference/data-types/geo) (менее развиты: например, отсутствуют системы координат — их можно эмулировать [с помощью функций](/sql-reference/functions/geo/))                                                                   |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                                      |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map)                      |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                                |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | [`String`](/sql-reference/data-types/string) в сочетании с функциями [`Bit`](/sql-reference/functions/bit-functions) и [Encoding](/sql-reference/functions/encoding-functions/#hex)                                                                                   |



<sub><span>*</span> Кроме того, ClickHouse поддерживает беззнаковые целые числа с расширенными диапазонами значений, то есть <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`, `UInt32`, `UInt32` и `UInt64`</a>.</sub><br />
<sub><span>**</span>Тип String в ClickHouse по умолчанию не имеет ограничений по длине, но её можно ограничить до конкретной длины с помощью <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>ограничений (Constraints)</a>.</sub>



## Синтаксис DDL {#compression}

### Ключи сортировки {#sorting-keys}

И ClickHouse, и Redshift используют концепцию «ключа сортировки», который определяет,
как данные сортируются при сохранении. В Redshift ключ сортировки определяется с помощью
конструкции `SORTKEY`:

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

В ClickHouse для указания порядка сортировки используется конструкция `ORDER BY`:

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

В большинстве случаев в ClickHouse можно использовать те же столбцы и порядок ключа сортировки,
что и в Redshift, при условии использования типа `COMPOUND` по умолчанию. При добавлении данных
в Redshift необходимо выполнять команды `VACUUM` и `ANALYZE` для пересортировки
вновь добавленных данных и обновления статистики для планировщика запросов — в противном случае
объём несортированных данных увеличивается. В ClickHouse такой процесс не требуется.

Redshift поддерживает несколько дополнительных возможностей для ключей сортировки. Первая —
автоматические ключи сортировки (с использованием `SORTKEY AUTO`). Хотя это может подойти
для начала работы, явные ключи сортировки обеспечивают наилучшую производительность и эффективность
хранения при оптимальном выборе ключа сортировки. Вторая — ключ сортировки `INTERLEAVED`,
который придаёт равный вес подмножеству столбцов в ключе сортировки для улучшения
производительности, когда запрос использует один или несколько вторичных столбцов сортировки. ClickHouse
поддерживает явные [проекции](/data-modeling/projections), которые достигают
того же результата при несколько иной настройке.

Пользователям следует учитывать, что концепция «первичного ключа» имеет разное значение
в ClickHouse и Redshift. В Redshift первичный ключ напоминает традиционную
концепцию РСУБД, предназначенную для обеспечения ограничений целостности. Однако они не строго
соблюдаются в Redshift и вместо этого служат подсказками для планировщика запросов и
распределения данных между узлами. В ClickHouse первичный ключ обозначает столбцы, используемые
для построения разреженного первичного индекса, который обеспечивает упорядоченность данных на
диске, максимизируя сжатие и избегая загрязнения первичного индекса и
нерационального расходования памяти.
