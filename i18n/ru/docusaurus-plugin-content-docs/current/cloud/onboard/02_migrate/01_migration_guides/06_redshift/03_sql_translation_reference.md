---
sidebar_label: 'Справочник по преобразованию SQL'
slug: /migrations/redshift/sql-translation-reference
description: 'Справочник по преобразованию SQL для миграции с Amazon Redshift на ClickHouse'
keywords: ['Redshift']
title: 'Руководство по преобразованию SQL из Amazon Redshift'
doc_type: 'reference'
---



# Руководство по преобразованию SQL-запросов Amazon Redshift {#amazon-redshift-sql-translation-guide}



## Типы данных {#data-types}

Пользователи, переносящие данные между ClickHouse и Redshift, сразу заметят,
что ClickHouse предлагает более широкий и при этом менее строгий набор типов.
В то время как Redshift требует от пользователей указывать возможную длину
строк, даже если она переменная, ClickHouse снимает это ограничение и
нагрузку с пользователя, храня строки в виде байтов без кодирования. Тип
String в ClickHouse, таким образом, не имеет ограничений по длине и не
требует её явного указания.

Кроме того, пользователи могут использовать Arrays, Tuples и Enums — типы,
отсутствующие в Redshift как полноценные сущности (хотя Arrays/Structs можно
имитировать с помощью `SUPER`), что является распространённым источником
неудобств для пользователей. Дополнительно ClickHouse позволяет сохранять
состояния агрегирования как на этапе выполнения запроса, так и непосредственно
в таблице. Это даёт возможность предварительно агрегировать данные, обычно
с использованием материализованного представления, и может существенно
улучшить производительность запросов для типичных сценариев.

Ниже мы сопоставляем эквивалентный тип ClickHouse для каждого типа Redshift:



| Redshift                                                                                                                             | ClickHouse                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`SMALLINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                | [`Int8`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                       |
| [`INTEGER`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                 | [`Int32`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                      |
| [`BIGINT`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-integer-types)                  | [`Int64`](/sql-reference/data-types/int-uint) *                                                                                                                                                                                                                      |
| [`DECIMAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-decimal-or-numeric-type)       | [`UInt128`, `UInt256`, `Int128`, `Int256`](/sql-reference/data-types/int-uint), [`Decimal(P, S)`, `Decimal32(S)`, `Decimal64(S)`, `Decimal128(S)`, `Decimal256(S)`](/sql-reference/data-types/decimal) - (поддерживают высокую точность и широкий диапазон значений) |
| [`REAL`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types)             | [`Float32`](/sql-reference/data-types/float)                                                                                                                                                                                                                         |
| [`DOUBLE PRECISION`](https://docs.aws.amazon.com/redshift/latest/dg/r_Numeric_types201.html#r_Numeric_types201-floating-point-types) | [`Float64`](/sql-reference/data-types/float)                                                                                                                                                                                                                         |
| [`BOOLEAN`](https://docs.aws.amazon.com/redshift/latest/dg/r_Boolean_type.html)                                                      | [`Bool`](/sql-reference/data-types/boolean)                                                                                                                                                                                                                          |
| [`CHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-char-or-character)                  | [`String`](/sql-reference/data-types/string), [`FixedString`](/sql-reference/data-types/fixedstring)                                                                                                                                                                 |
| [`VARCHAR`](https://docs.aws.amazon.com/redshift/latest/dg/r_Character_types.html#r_Character_types-varchar-or-character-varying) ** | [`String`](/sql-reference/data-types/string)                                                                                                                                                                                                                         |
| [`DATE`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-date)                                 | [`Date32`](/sql-reference/data-types/date32)                                                                                                                                                                                                                         |
| [`TIMESTAMP`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamp)                       | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                               |
| [`TIMESTAMPTZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timestamptz)                   | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                               |
| [`GEOMETRY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                                | [Геоданные (Geo Data Types)](/sql-reference/data-types/geo)                                                                                                                                                                                                          |
| [`GEOGRAPHY`](https://docs.aws.amazon.com/redshift/latest/dg/geospatial-overview.html)                                               | [Гео-типы данных](/sql-reference/data-types/geo) (функциональность развита слабее, например нет систем координат — их можно эмулировать [с помощью функций](/sql-reference/functions/geo/))                                                                          |
| [`HLLSKETCH`](https://docs.aws.amazon.com/redshift/latest/dg/r_HLLSKTECH_type.html)                                                  | [`AggregateFunction(uniqHLL12, X)`](/sql-reference/data-types/aggregatefunction)                                                                                                                                                                                     |
| [`SUPER`](https://docs.aws.amazon.com/redshift/latest/dg/r_SUPER_type.html)                                                          | [`Tuple`](/sql-reference/data-types/tuple), [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Array`](/sql-reference/data-types/array), [`JSON`](/sql-reference/data-types/newjson), [`Map`](/sql-reference/data-types/map)                     |
| [`TIME`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-time)                                 | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                               |
| [`TIMETZ`](https://docs.aws.amazon.com/redshift/latest/dg/r_Datetime_types.html#r_Datetime_types-timetz)                             | [`DateTime`](/sql-reference/data-types/datetime), [`DateTime64`](/sql-reference/data-types/datetime64)                                                                                                                                                               |
| [`VARBYTE`](https://docs.aws.amazon.com/redshift/latest/dg/r_VARBYTE_type.html) **                                                   | Тип [`String`](/sql-reference/data-types/string) в сочетании с функциями [`Bit`](/sql-reference/functions/bit-functions) и [Encoding](/sql-reference/functions/encoding-functions/#hex)                                                                              |



<sub><span>*</span> Кроме того, ClickHouse поддерживает беззнаковые целые числа с расширенными диапазонами значений, например <a href='http://clickhouse.com/docs/sql-reference/data-types/int-uint'>`UInt8`, `UInt32`, `UInt32` и `UInt64`</a>.</sub><br />
<sub><span>**</span>Тип String в ClickHouse по умолчанию имеет неограниченную длину, но может быть ограничен по длине с помощью <a href='http://clickhouse.com/docs/sql-reference/statements/create/table#constraints'>Constraints</a>.</sub>



## Синтаксис DDL {#compression}

### Ключи сортировки {#sorting-keys}

И в ClickHouse, и в Redshift есть понятие «ключ сортировки», который определяет,
как данные упорядочиваются при сохранении. В Redshift ключ сортировки задаётся с помощью
предложения `SORTKEY`:

```sql
CREATE TABLE some_table(...) SORTKEY (column1, column2)
```

Для сравнения, ClickHouse использует оператор `ORDER BY`, чтобы задать порядок сортировки:

```sql
CREATE TABLE some_table(...) ENGINE = MergeTree ORDER BY (column1, column2)
```

В большинстве случаев вы можете использовать те же столбцы и тот же порядок ключа сортировки в ClickHouse,
что и в Redshift, при условии, что вы используете тип по умолчанию `COMPOUND`. Когда данные
добавляются в Redshift, необходимо запускать команды `VACUUM` и `ANALYZE`, чтобы переотсортировать
недавно добавленные данные и обновить статистику для планировщика запросов — в противном случае
объём несортированных данных растёт. Для ClickHouse такой процесс не требуется.

Redshift поддерживает несколько удобных механизмов для ключей сортировки. Первый —
автоматические ключи сортировки (с помощью `SORTKEY AUTO`). Хотя это может быть уместно
на начальном этапе, явное задание ключей сортировки обеспечивает наилучшую производительность
и эффективность хранения, когда ключ сортировки выбран оптимально. Второй — сортировочный ключ
`INTERLEAVED`, который придаёт равный вес подмножеству столбцов в ключе сортировки, чтобы повысить
производительность, когда запрос использует один или несколько вторичных сортировочных столбцов.
ClickHouse поддерживает явные [проекции](/data-modeling/projections), которые позволяют добиться
того же конечного результата при несколько иной конфигурации.

Пользователям следует учитывать, что концепция «первичного ключа» означает разные вещи
в ClickHouse и Redshift. В Redshift первичный ключ напоминает традиционную
концепцию в реляционных СУБД (RDBMS), предназначенную для обеспечения целостностных ограничений.
Однако в Redshift они строго не применяются и вместо этого выступают подсказками для планировщика запросов
и распределения данных между узлами. В ClickHouse первичный ключ обозначает столбцы, используемые
для построения разреженного первичного индекса, который обеспечивает упорядочивание данных на
диске, максимизируя эффективность сжатия и избегая засорения первичного индекса и
нерационального расхода памяти.
