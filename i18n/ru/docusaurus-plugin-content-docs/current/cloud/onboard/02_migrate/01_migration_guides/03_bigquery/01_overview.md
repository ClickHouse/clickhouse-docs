---
title: 'BigQuery против ClickHouse Cloud'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'Чем BigQuery отличается от ClickHouse Cloud'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: 'Обзор'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# Сравнение ClickHouse Cloud и BigQuery  {#comparing-clickhouse-cloud-and-bigquery} 

## Организация ресурсов {#resource-organization}

Организация ресурсов в ClickHouse Cloud похожа на [иерархию ресурсов BigQuery](https://cloud.google.com/bigquery/docs/resource-hierarchy). Ниже мы описываем конкретные отличия, опираясь на следующую диаграмму, показывающую иерархию ресурсов ClickHouse Cloud:

<Image img={bigquery_1} size="md" alt="Организации ресурсов"/>

### Organizations {#organizations}

Аналогично BigQuery, организации являются корневыми узлами в иерархии ресурсов ClickHouse Cloud. Первый пользователь, которого вы создаёте в своей учетной записи ClickHouse Cloud, автоматически привязывается к организации, принадлежащей этому пользователю. Пользователь может приглашать дополнительных пользователей в организацию.

### BigQuery Projects vs ClickHouse Cloud Services {#bigquery-projects-vs-clickhouse-cloud-services}

Внутри организаций вы можете создавать сервисы, примерно эквивалентные проектам BigQuery, поскольку хранимые данные в ClickHouse Cloud ассоциируются с сервисом. В ClickHouse Cloud доступно [несколько типов сервисов](/cloud/manage/cloud-tiers). Каждый сервис ClickHouse Cloud разворачивается в конкретном регионе и включает:

1. Группу вычислительных узлов (в данный момент 2 узла для сервиса уровня Development и 3 для сервиса уровня Production). Для этих узлов ClickHouse Cloud [поддерживает вертикальное и горизонтальное масштабирование](/manage/scaling#how-scaling-works-in-clickhouse-cloud), как вручную, так и автоматически.
2. Папку в объектном хранилище, где сервис хранит все данные.
3. Конечную точку (endpoint, или несколько конечных точек, созданных через веб‑консоль ClickHouse Cloud) — URL сервиса, который вы используете для подключения к сервису (например, `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### BigQuery Datasets vs ClickHouse Cloud Databases {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse логически группирует таблицы в базы данных. Подобно наборам данных BigQuery, базы данных ClickHouse являются логическими контейнерами, которые организуют и контролируют доступ к данным таблиц.

### BigQuery Folders {#bigquery-folders}

В ClickHouse Cloud в настоящий момент нет концепции, эквивалентной папкам BigQuery.

### BigQuery Slot reservations and Quotas {#bigquery-slot-reservations-and-quotas}

Подобно резервированию слотов в BigQuery, вы можете [настроить вертикальное и горизонтальное автомасштабирование](/manage/scaling#configuring-vertical-auto-scaling) в ClickHouse Cloud. Для вертикального автомасштабирования вы можете задать минимальный и максимальный размер для объема памяти и количества CPU-ядер вычислительных узлов сервиса. Затем сервис будет масштабироваться по мере необходимости в этих пределах. Эти настройки также доступны в процессе первоначального создания сервиса. Каждый вычислительный узел в сервисе имеет одинаковую конфигурацию. Вы можете изменять количество вычислительных узлов в рамках сервиса с помощью [горизонтального масштабирования](/manage/scaling#manual-horizontal-scaling).

Кроме того, аналогично квотам BigQuery, ClickHouse Cloud предлагает контроль параллелизма, ограничения использования памяти и планирование I/O, что позволяет вам изолировать запросы в классы рабочих нагрузок. Ограничивая общие ресурсы (CPU-ядра, DRAM, дисковый и сетевой I/O) для конкретных классов рабочих нагрузок, система гарантирует, что эти запросы не повлияют на другие критически важные бизнес-запросы. Контроль параллелизма предотвращает чрезмерное создание потоков (oversubscription) в сценариях с большим количеством одновременно выполняющихся запросов.

ClickHouse отслеживает объем выделяемой памяти в байтах на уровне сервера, пользователя и запроса, что позволяет гибко задавать лимиты использования памяти. Механизм memory overcommit позволяет запросам использовать дополнительную свободную память сверх гарантированной, при этом обеспечивая соблюдение лимитов памяти для других запросов. Дополнительно, использование памяти для операций агрегирования, сортировки и соединения (JOIN) может быть ограничено, что позволяет переходить к внешним алгоритмам при превышении лимита памяти.

Наконец, планирование I/O позволяет ограничивать локальные и удаленные дисковые обращения для классов рабочих нагрузок на основе максимальной пропускной способности, количества одновременно выполняющихся запросов и выбранной политики.

### Permissions {#permissions}

ClickHouse Cloud управляет доступом пользователей в двух местах: через [cloud console](/cloud/guides/sql-console/manage-sql-console-role-assignments) и через [database](/cloud/security/manage-database-users). Доступ к консоли управляется через пользовательский интерфейс [clickhouse.cloud](https://console.clickhouse.cloud). Доступ к базе данных управляется через учетные записи и роли пользователей базы данных. Кроме того, пользователям консоли могут быть назначены роли внутри базы данных, которые позволяют пользователю консоли взаимодействовать с базой данных через наш [SQL console](/integrations/sql-clients/sql-console).

## Типы данных {#data-types}

ClickHouse предлагает более высокую точность для числовых типов. Например, BigQuery предоставляет числовые типы [`INT64`, `NUMERIC`, `BIGNUMERIC` и `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types). В отличие от него, ClickHouse предлагает несколько вариантов точности для десятичных чисел, чисел с плавающей запятой и целых чисел. Используя эти типы данных, вы можете оптимизировать использование дискового пространства и памяти, что приводит к более быстрым запросам и меньшему потреблению ресурсов. Ниже приведено сопоставление эквивалентных типов ClickHouse для каждого типа BigQuery:

| BigQuery | ClickHouse                                                                                                                                                                        |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (с более узким диапазоном)                                                                                                             |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (более узкий диапазон, более высокая точность)                                |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [географические типы данных](/sql-reference/data-types/float)                                                                                                                     |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | Н/Д — [поддерживается как выражение](/sql-reference/data-types/special-data-types/interval#usage-remarks) или [через функции](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (байтовая строка)](/sql-reference/data-types/string)                                                                                                                      |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

Когда для типов ClickHouse доступно несколько вариантов, учитывайте фактический диапазон данных и выбирайте минимально необходимый тип. Также рассмотрите возможность использования [подходящих кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для дополнительного сжатия.

## Техники ускорения запросов {#query-acceleration-techniques}

### Первичные и внешние ключи и первичный индекс {#primary-and-foreign-keys-and-primary-index}

В BigQuery таблица может иметь [ограничения первичного и внешнего ключей](https://cloud.google.com/bigquery/docs/information-schema-table-constraints). Обычно первичные и внешние ключи используются в реляционных базах данных для обеспечения целостности данных. Значение первичного ключа, как правило, уникально для каждой строки и не может быть `NULL`. Каждое значение внешнего ключа в строке должно присутствовать в столбце первичного ключа соответствующей таблицы или быть `NULL`. В BigQuery соблюдение этих ограничений не обеспечивается, но оптимизатор запросов может использовать эту информацию для более эффективной оптимизации запросов.

В ClickHouse таблица также может иметь первичный ключ. Как и в BigQuery, ClickHouse не гарантирует уникальность значений столбца первичного ключа таблицы. В отличие от BigQuery, данные таблицы на диске хранятся [отсортированными](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) по столбцам первичного ключа. Оптимизатор запросов использует этот порядок сортировки, чтобы избежать пересортировки, минимизировать использование памяти при соединениях и обеспечивать раннее завершение обработки при выполнении операторов LIMIT. В отличие от BigQuery, ClickHouse автоматически создает [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) на основе значений столбцов первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по столбцам первичного ключа. В настоящее время ClickHouse не поддерживает ограничения внешнего ключа.

## Вторичные индексы (доступны только в ClickHouse) {#secondary-indexes-only-available-in-clickhouse}

В дополнение к первичному индексу, создаваемому на основе значений столбцов первичного ключа таблицы, ClickHouse позволяет создавать вторичные индексы по столбцам, не входящим в первичный ключ. ClickHouse предлагает несколько типов вторичных индексов, каждый из которых подходит для разных типов запросов:

- **Bloom Filter Index**:
  - Используется для ускорения запросов с условиями проверки на равенство (например, =, IN).
  - Применяет вероятностные структуры данных, чтобы определить, существует ли значение в блоке данных.
- **Token Bloom Filter Index**:
  - Аналогичен Bloom Filter Index, но используется для токенизированных строк и подходит для полнотекстовых поисковых запросов.
- **Min-Max Index**:
  - Хранит минимальные и максимальные значения столбца для каждой части данных.
  - Помогает пропускать чтение частей данных, которые не попадают в указанный диапазон.

## Поисковые индексы {#search-indexes}

Подобно [поисковым индексам](https://cloud.google.com/bigquery/docs/search-index) в BigQuery, для таблиц ClickHouse можно создавать [полнотекстовые индексы](/engines/table-engines/mergetree-family/invertedindexes) на столбцах со строковыми значениями.

## Векторные индексы {#vector-indexes}

BigQuery недавно представил [векторные индексы](https://cloud.google.com/bigquery/docs/vector-index) на этапе Pre-GA. Аналогично, ClickHouse экспериментально поддерживает [индексы для ускорения](/engines/table-engines/mergetree-family/annindexes) сценариев векторного поиска.

## Секционирование {#partitioning}

Как и BigQuery, ClickHouse использует секционирование таблиц для повышения производительности и удобства управления большими таблицами за счёт разбиения их на более мелкие, более удобные для управления части, называемые секциями. Подробное описание секционирования в ClickHouse можно найти [здесь](/engines/table-engines/mergetree-family/custom-partitioning-key).

## Кластеризация {#clustering}

При кластеризации BigQuery автоматически сортирует данные таблицы по значениям нескольких заданных столбцов и размещает их в блоках оптимального размера. Кластеризация улучшает производительность запросов, позволяя BigQuery точнее оценивать стоимость их выполнения. В кластеризованных столбцах запросы также исключают сканирование ненужных данных.

В ClickHouse данные автоматически [кластеризуются на диске](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) на основе столбцов первичного ключа таблицы и логически организуются в блоки, которые могут быть быстро найдены или отброшены запросами, использующими структуру данных первичного индекса.

## Материализованные представления {#materialized-views}

И BigQuery, и ClickHouse поддерживают материализованные представления — предварительно вычисленные результаты, полученные в результате выполнения трансформационного запроса к базовой таблице, что повышает производительность и эффективность.

## Запросы к материализованным представлениям {#querying-materialized-views}

К материализованным представлениям BigQuery можно обращаться напрямую, либо они могут использоваться оптимизатором для обработки запросов к базовым таблицам. Если изменения в базовых таблицах могут привести к потере актуальности материализованного представления, данные считываются напрямую из базовых таблиц. Если изменения в базовых таблицах не делают материализованное представление неактуальным, остальная часть данных считывается из материализованного представления, а из базовых таблиц считываются только изменения.

В ClickHouse к материализованным представлениям можно обращаться только напрямую. Однако по сравнению с BigQuery (где материализованные представления автоматически обновляются в течение 5 минут после изменения базовых таблиц, но не чаще, чем [раз в 30 минут](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)), материализованные представления в ClickHouse всегда синхронизированы с базовой таблицей.

**Обновление материализованных представлений**

BigQuery периодически полностью обновляет материализованные представления, выполняя запрос преобразования представления к базовой таблице. Между полными обновлениями BigQuery объединяет данные материализованного представления с новыми данными базовой таблицы, чтобы обеспечить согласованные результаты запросов при сохранении использования материализованного представления.

В ClickHouse материализованные представления обновляются инкрементально. Этот механизм инкрементального обновления обеспечивает высокую масштабируемость и низкие вычислительные затраты: инкрементально обновляемые материализованные представления специально спроектированы для сценариев, когда базовые таблицы содержат миллиарды или триллионы строк. Вместо того чтобы многократно выполнять запрос к постоянно растущей базовой таблице для обновления материализованного представления, ClickHouse просто вычисляет частичный результат только по значениям заново вставленных строк базовой таблицы. Этот частичный результат поэтапно объединяется с ранее вычисленным частичным результатом в фоновом режиме. В результате вычислительные затраты оказываются существенно ниже по сравнению с многократным полным обновлением материализованного представления по всей базовой таблице.

## Транзакции {#transactions}

В отличие от ClickHouse, BigQuery поддерживает транзакции, состоящие из нескольких операторов (multi-statement транзакции) внутри одного запроса, а также в рамках нескольких запросов при использовании сессий. Такая транзакция позволяет выполнять изменяющие операции, такие как вставка или удаление строк в одной или нескольких таблицах, и затем атомарно зафиксировать изменения (commit) или откатить их (rollback). Поддержка multi-statement транзакций включена в [дорожную карту ClickHouse на 2024 год](https://github.com/ClickHouse/ClickHouse/issues/58392).

## Агрегатные функции {#aggregate-functions}

По сравнению с BigQuery, в ClickHouse значительно больше встроенных агрегатных функций:

- В BigQuery доступно [18 агрегатных функций](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions) и [4 приближённые агрегатные функции](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions).
- В ClickHouse более [150 предопределённых агрегатных функций](/sql-reference/aggregate-functions/reference), а также мощные [комбинаторы агрегации](/sql-reference/aggregate-functions/combinators) для [расширения](https://www.youtube.com/watch?v=7ApwD0cfAFI) их поведения. Например, вы можете применять все эти более чем 150 агрегатных функций к массивам вместо строк таблицы, просто добавив к их имени суффикс [-Array](/sql-reference/aggregate-functions/combinators#-array). С суффиксом [-Map](/sql-reference/aggregate-functions/combinators#-map) можно применять любую агрегатную функцию к значениям типа Map. А с суффиксом [-ForEach](/sql-reference/aggregate-functions/combinators#-foreach) — любую агрегатную функцию к вложенным массивам.

## Источники данных и форматы файлов {#data-sources-and-file-formats}

По сравнению с BigQuery, ClickHouse поддерживает значительно больше форматов файлов и источников данных:

- ClickHouse имеет встроенную поддержку загрузки данных из более чем 90 форматов файлов практически из любого источника данных
- BigQuery поддерживает 5 форматов файлов и 19 источников данных

## Возможности языка SQL {#sql-language-features}

ClickHouse использует стандартный SQL с множеством расширений и улучшений, которые делают его более удобным для аналитических задач. Например, ClickHouse SQL [поддерживает лямбда-функции](/sql-reference/functions/overview#arrow-operator-and-lambda) и функции высшего порядка, поэтому вам не нужно разворачивать массивы (explode) при применении преобразований. Это большое преимущество по сравнению с другими системами, такими как BigQuery.

## Массивы {#arrays}

По сравнению с восемью функциями работы с массивами в BigQuery, в ClickHouse доступно более 80 [встроенных функций для работы с массивами](/sql-reference/functions/array-functions), которые позволяют элегантно и просто моделировать и решать широкий круг задач.

Типичный паттерн в ClickHouse — использовать агрегатную функцию [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray), чтобы (временно) преобразовать отдельные значения строк таблицы в массив. Затем этот массив удобно обрабатывать с помощью функций для массивов, а результат можно преобразовать обратно в отдельные строки таблицы с помощью агрегатной функции [`arrayJoin`](/sql-reference/functions/array-join).

Поскольку SQL в ClickHouse поддерживает [функции высшего порядка и лямбда-функции](/sql-reference/functions/overview#arrow-operator-and-lambda), многие продвинутые операции над массивами можно выполнить, просто вызвав одну из встроенных функций высшего порядка для массивов, вместо временного преобразования массивов обратно в таблицы, как это часто [требуется](https://cloud.google.com/bigquery/docs/arrays) в BigQuery, например для [фильтрации](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) или [«сшивания» (zipping)](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) массивов. В ClickHouse эти операции сводятся к простому вызову функций высшего порядка [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) и [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) соответственно.

Ниже приведено соответствие операций с массивами в BigQuery и ClickHouse:

| BigQuery                                                                                                                 | ClickHouse                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [ARRAY&#95;CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)           | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY&#95;LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)           | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY&#95;REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)         | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY&#95;TO&#95;STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)       | [range](/sql-reference/functions/array-functions#range)                                     |

**Создать массив с одним элементом для каждой строки во вложенном запросе**

*BigQuery*

[Функция ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

```sql
SELECT ARRAY
  (SELECT 1 UNION  ALL
   SELECT 2 UNION ALL
   SELECT 3) AS new_array;

/*-----------*
 | new_array |
 +-----------+
 | [1, 2, 3] |
 *-----------*/
```

*ClickHouse*

Агрегатная функция [groupArray](/sql-reference/aggregate-functions/reference/grouparray)

```sql
SELECT groupArray(*) AS new_array
FROM
(
    SELECT 1
    UNION ALL
    SELECT 2
    UNION ALL
    SELECT 3
)
   ┌─new_array─┐
1. │ [1,2,3]   │
   └───────────┘
```

**Преобразование массива в набор строк**

*BigQuery*

Оператор [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

```sql
SELECT *
FROM UNNEST(['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'])
  AS element
WITH OFFSET AS offset
ORDER BY offset;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

*ClickHouse*

оператор [ARRAY JOIN](/sql-reference/statements/select/array-join)


```sql
WITH ['foo', 'bar', 'baz', 'qux', 'corge', 'garply', 'waldo', 'fred'] AS values
SELECT element, num-1 AS offset
FROM (SELECT values AS element) AS subquery
ARRAY JOIN element, arrayEnumerate(element) AS num;

/*----------+--------*
 | element  | offset |
 +----------+--------+
 | foo      | 0      |
 | bar      | 1      |
 | baz      | 2      |
 | qux      | 3      |
 | corge    | 4      |
 | garply   | 5      |
 | waldo    | 6      |
 | fred     | 7      |
 *----------+--------*/
```

**Верните массив дат**

*BigQuery*

Функция [GENERATE&#95;DATE&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array)

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

Функции [range](/sql-reference/functions/array-functions#range) и [arrayMap](/sql-reference/functions/array-functions#arrayMap)

*ClickHouse*

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**Возвращает массив меток времени**

*BigQuery*

Функция [GENERATE&#95;TIMESTAMP&#95;ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array)

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

*ClickHouse*

Функции [range](/sql-reference/functions/array-functions#range) + [arrayMap](/sql-reference/functions/array-functions#arrayMap)

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**Фильтрация массивов**

*BigQuery*

Требуется временно преобразовать массивы обратно в таблицы с помощью оператора [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT
  ARRAY(SELECT x * 2
        FROM UNNEST(some_numbers) AS x
        WHERE x < 5) AS doubled_less_than_five
FROM Sequences;

/*------------------------*
 | doubled_less_than_five |
 +------------------------+
 | [0, 2, 2, 4, 6]        |
 | [4, 8]                 |
 | []                     |
 *------------------------*/
```

*ClickHouse*

Функция [arrayFilter](/sql-reference/functions/array-functions#arrayFilter)


```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT arrayMap(x -> (x * 2), arrayFilter(x -> (x < 5), some_numbers)) AS doubled_less_than_five
FROM Sequences;
   ┌─doubled_less_than_five─┐
1. │ [0,2,2,4,6]            │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
2. │ []                     │
   └────────────────────────┘
   ┌─doubled_less_than_five─┐
3. │ [4,8]                  │
   └────────────────────────┘
```

**Объединение массивов по индексам**

*BigQuery*

Требуется временно преобразовывать массивы обратно в таблицы с помощью оператора [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

```sql
WITH
  Combinations AS (
    SELECT
      ['a', 'b'] AS letters,
      [1, 2, 3] AS numbers
  )
SELECT
  ARRAY(
    SELECT AS STRUCT
      letters[SAFE_OFFSET(index)] AS letter,
      numbers[SAFE_OFFSET(index)] AS number
    FROM Combinations
    CROSS JOIN
      UNNEST(
        GENERATE_ARRAY(
          0,
          LEAST(ARRAY_LENGTH(letters), ARRAY_LENGTH(numbers)) - 1)) AS index
    ORDER BY index
  );

/*------------------------------*
 | pairs                        |
 +------------------------------+
 | [{ letter: "a", number: 1 }, |
 |  { letter: "b", number: 2 }] |
 *------------------------------*/
```

*ClickHouse*

Функция [arrayZip](/sql-reference/functions/array-functions#arrayZip)

```sql
WITH Combinations AS
    (
        SELECT
            ['a', 'b'] AS letters,
            [1, 2, 3] AS numbers
    )
SELECT arrayZip(letters, arrayResize(numbers, length(letters))) AS pairs
FROM Combinations;
   ┌─pairs─────────────┐
1. │ [('a',1),('b',2)] │
   └───────────────────┘
```

**Агрегирование массивов**

*BigQuery*

Для этого требуется преобразовать массивы обратно в таблицы с помощью оператора [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

```sql
WITH Sequences AS
  (SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
   UNION ALL SELECT [2, 4, 8, 16, 32] AS some_numbers
   UNION ALL SELECT [5, 10] AS some_numbers)
SELECT some_numbers,
  (SELECT SUM(x)
   FROM UNNEST(s.some_numbers) AS x) AS sums
FROM Sequences AS s;

/*--------------------+------*
 | some_numbers       | sums |
 +--------------------+------+
 | [0, 1, 1, 2, 3, 5] | 12   |
 | [2, 4, 8, 16, 32]  | 62   |
 | [5, 10]            | 15   |
 *--------------------+------*/
```

*ClickHouse*

функции [arraySum](/sql-reference/functions/array-functions#arraySum), [arrayAvg](/sql-reference/functions/array-functions#arrayAvg), ... или любая из более чем 90 существующих агрегатных функций в качестве аргумента функции [arrayReduce](/sql-reference/functions/array-functions#arrayReduce)


```sql
WITH Sequences AS
    (
        SELECT [0, 1, 1, 2, 3, 5] AS some_numbers
        UNION ALL
        SELECT [2, 4, 8, 16, 32] AS some_numbers
        UNION ALL
        SELECT [5, 10] AS some_numbers
    )
SELECT
    some_numbers,
    arraySum(some_numbers) AS sums
FROM Sequences;
   ┌─some_numbers──┬─sums─┐
1. │ [0,1,1,2,3,5] │   12 │
   └───────────────┴──────┘
   ┌─some_numbers──┬─sums─┐
2. │ [2,4,8,16,32] │   62 │
   └───────────────┴──────┘
   ┌─some_numbers─┬─sums─┐
3. │ [5,10]       │   15 │
   └──────────────┴──────┘
```
