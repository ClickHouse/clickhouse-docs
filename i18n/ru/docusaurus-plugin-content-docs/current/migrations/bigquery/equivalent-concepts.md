---
title: BigQuery против ClickHouse Cloud
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: Как BigQuery отличается от ClickHouse Cloud
keywords: [миграция, миграция, перенос, данные, etl, elt, BigQuery]
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';


# BigQuery против ClickHouse Cloud: Эквивалентные и различные концепции

## Организация ресурсов {#resource-organization}

Способ организации ресурсов в ClickHouse Cloud схож с [иерархией ресурсов BigQuery](https://cloud.google.com/bigquery/docs/resource-hierarchy). Мы описываем конкретные отличия ниже на основе следующей диаграммы, показывающей иерархию ресурсов ClickHouse Cloud:

<img src={bigquery_1}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

### Организации {#organizations}

Подобно BigQuery, организации являются корневыми узлами в иерархии ресурсов ClickHouse Cloud. Первый пользователь, которого вы настраиваете в своей учетной записи ClickHouse Cloud, автоматически назначается на организацию, принадлежащую пользователю. Пользователь может пригласить дополнительных пользователей в организацию. 

### Проекты BigQuery против Сервисов ClickHouse Cloud {#bigquery-projects-vs-clickhouse-cloud-services}

В пределах организаций вы можете создать сервисы, которые в некотором смысле эквивалентны проектам BigQuery, поскольку сохраненные данные в ClickHouse Cloud ассоциированы с сервисом. В ClickHouse Cloud доступны [несколько типов сервисов](/cloud/manage/cloud-tiers). Каждый сервис ClickHouse Cloud развертывается в конкретном регионе и включает:

1. Группу вычислительных узлов (в настоящее время 2 узла для сервиса уровня Development и 3 для сервиса уровня Production). Для этих узлов ClickHouse Cloud [поддерживает вертикальное и горизонтальное масштабирование](/manage/scaling#how-scaling-works-in-clickhouse-cloud), как вручную, так и автоматически. 
2. Папку объектного хранилища, где сервис хранит все данные.
3. Конечную точку (или несколько конечных точек, созданных через интерфейс ClickHouse Cloud UI) - URL сервиса, который вы используете для подключения к сервису (например, `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### Наборы данных BigQuery против Баз данных ClickHouse Cloud {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse логически группирует таблицы в базы данных. Как и наборы данных BigQuery, базы данных ClickHouse являются логическими контейнерами, которые организуют и контролируют доступ к данным таблиц. 

### Папки BigQuery {#bigquery-folders}

В ClickHouse Cloud в настоящее время отсутствует концепция, эквивалентная папкам BigQuery.

### Резервирование слотов BigQuery и квоты {#bigquery-slot-reservations-and-quotas}

Подобно резервированию слотов BigQuery, вы можете [настроить вертикальное и горизонтальное автоматическое масштабирование](/manage/scaling#configuring-vertical-auto-scaling) в ClickHouse Cloud. Для вертикального автоматического масштабирования вы можете задать минимальный и максимальный размер для памяти и процессорных ядер вычислительных узлов сервиса. Сервис будет масштабироваться по мере необходимости в пределах этих границ. Эти настройки также доступны во время первоначального создания сервиса. Каждый вычислительный узел в сервисе имеет одинаковый размер. Вы можете изменить количество вычислительных узлов в рамках сервиса с помощью [горизонтального масштабирования](/manage/scaling#manual-horizontal-scaling).

Более того, подобно квотам BigQuery, ClickHouse Cloud предоставляет контроль параллелизма, ограничения на использование памяти и планирование ввода-вывода, позволяя пользователям изолировать запросы на классы нагрузки. Устанавливая лимиты на общие ресурсы (процессорные ядра, оперативная память, ввод-вывод на диске и сети) для конкретных классов нагрузки, система обеспечивает то, чтобы эти запросы не влияли на другие критически важные бизнес-запросы. Контроль параллелизма предотвращает переподписку потоков в сценариях с высоким числом одновременных запросов.

ClickHouse отслеживает размеры байтов выделений памяти на уровне сервера, пользователя и запроса, позволяя гибкие лимиты использования памяти. Переподписание памяти позволяет запросам использовать дополнительную свободную память сверх гарантированной памяти, при этом гарантируя лимиты памяти для других запросов. Кроме того, использование памяти для агрегации, сортировки и соединения может быть ограничено, что позволяет переключаться на внешние алгоритмы, когда лимит памяти превышен.

Наконец, планирование ввода-вывода позволяет пользователям ограничивать доступы к локальным и удаленным дискам для классов нагрузки на основе максимальной пропускной способности, активных запросов и политики.

### Разрешения {#permissions}

ClickHouse Cloud [управляет доступом пользователей](/cloud/security/cloud-access-management) в двух местах: через [облачную консоль](/cloud/get-started/sql-console) и через базу данных. Доступ к консоли управляется через интерфейс [clickhouse.cloud](https://console.clickhouse.cloud). Доступ к базе данных управляется через учетные записи пользователей баз данных и роли. Кроме того, пользователям консоли могут быть предоставлены роли в базе данных, которые позволяют пользователю консоли взаимодействовать с базой данных через нашу [SQL консоль](/integrations/sql-clients/sql-console).

## Типы данных {#data-types}

ClickHouse предлагает более тонкую точность в отношении чисел. Например, BigQuery предлагает числовые типы [`INT64`, `NUMERIC`, `BIGNUMERIC` и `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types). В отличие от этого, ClickHouse предлагает несколько типов точности для десятичных, плавающих и целых чисел. С помощью этих типов данных пользователи ClickHouse могут оптимизировать хранилище и использование памяти, что приводит к более быстрым запросам и меньшему потреблению ресурсов. Ниже мы сопоставляем эквивалентный тип ClickHouse для каждого типа BigQuery:

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)    | [Array(t)](/sql-reference/data-types/array)   |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)  | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)    |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types) | [Decimal256(S)](/sql-reference/data-types/decimal) |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)     | [Bool](/sql-reference/data-types/boolean)       |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)    | [FixedString](/sql-reference/data-types/fixedstring) |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)     | [Date32](/sql-reference/data-types/date32) (с более узким диапазоном) |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type) | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (узкий диапазон, высокая точность) |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types)  | [Float64](/sql-reference/data-types/float)    |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type) | [Geo Data Types](/sql-reference/data-types/float) |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)    | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint) |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types) | NA - [поддерживается как выражение](/sql-reference/data-types/special-data-types/interval#usage-remarks) или [через функции](/sql-reference/functions/date-time-functions#addyears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)     | [JSON](/integrations/data-formats/json/inference)       |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)   | [String (bytes)](/sql-reference/data-types/string) |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct)   | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested) |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)     | [DateTime64](/sql-reference/data-types/datetime64) |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type) | [DateTime64](/sql-reference/data-types/datetime64) |

При выборе из нескольких вариантов типов ClickHouse, учитывайте фактический диапазон данных и выбирайте минимально необходимый. Также учитывайте возможность использования [подходящих кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для дальнейшего сжатия. 

## Техники ускорения запросов {#query-acceleration-techniques}

### Первичные и внешние ключи и первичный индекс {#primary-and-foreign-keys-and-primary-index}

В BigQuery таблица может иметь [первичные и внешние ключевые ограничения](https://cloud.google.com/bigquery/docs/information-schema-table-constraints). Обычно первичные и внешние ключи используются в реляционных базах данных для обеспечения целостности данных. Значение первичного ключа обычно уникально для каждой строки и не является `NULL`. Каждое значение внешнего ключа в строке должно присутствовать в колонке первичного ключа таблицы с первичным ключом или быть `NULL`. В BigQuery эти ограничения не применяются, но оптимизатор запросов может использовать эту информацию для улучшения оптимизации запросов. 

В ClickHouse таблица также может иметь первичный ключ. Как и в BigQuery, ClickHouse не накладывает ограничения на уникальность значений колонки первичного ключа таблицы. В отличие от BigQuery, данные таблицы хранятся на диске [в упорядоченном виде](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) по колонке(ам) первичного ключа. Оптимизатор запросов использует этот порядок сортировки, чтобы предотвратить повторное упорядочение, минимизировать использование памяти для соединений и включить короткое замыкание для условий лимита. В отличие от BigQuery, ClickHouse автоматически создает [индекс (разреженный) первичного ключа](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) на основе значений колонки первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по колонкам первичного ключа. В настоящее время ClickHouse не поддерживает ограничения внешнего ключа.

## Второстепенные индексы (доступны только в ClickHouse) {#secondary-indexes-only-available-in-clickhouse}

В дополнение к первичному индексу, созданному из значений колонок первичного ключа таблицы, ClickHouse позволяет создавать второстепенные индексы на колонках, отличных от тех, которые находятся в первичном ключе.  ClickHouse предлагает несколько типов вторичных индексов, каждый из которых подходит для различных типов запросов:

- **Индекс Bloom Filter**:
  - Используется для ускорения запросов с условиями равенства (например, =, IN).
  - Использует вероятностные структуры данных для определения, существует ли значение в блоке данных.
- **Индекс Token Bloom Filter**:
  - Похож на индекс Bloom Filter, но используется для токенизированных строк и подходит для текстовых поисковых запросов.
- **Индекс Min-Max**:
  - Поддерживает минимальные и максимальные значения колонки для каждой части данных.
  - Помогает пропускать чтение частей данных, которые не попадают в заданный диапазон.

## Индексы поиска {#search-indexes}

Аналогично [индексам поиска](https://cloud.google.com/bigquery/docs/search-index) в BigQuery, [индексы полнотекстового поиска](/engines/table-engines/mergetree-family/invertedindexes) могут быть созданы для таблиц ClickHouse на колонках со строковыми значениями.  

## Векторные индексы {#vector-indexes}

Недавно BigQuery представил [векторные индексы](https://cloud.google.com/bigquery/docs/vector-index) как функцию до строгой версии. Точно так же ClickHouse имеет экспериментальную поддержку [индексов для ускорения](/engines/table-engines/mergetree-family/annindexes) случаев поиска векторов.

## Партционирование {#partitioning}

Подобно BigQuery, ClickHouse использует партционирование таблиц для повышения производительности и управляемости больших таблиц путем деления таблиц на более мелкие, более управляемые части, называемые партциями. Подробнее о партционировании ClickHouse мы описываем [здесь](/engines/table-engines/mergetree-family/custom-partitioning-key).

## Кластеризация {#clustering}

С помощью кластеризации BigQuery автоматически сортирует данные таблицы на основе значений нескольких заданных колонок и размещает их в оптимально размерных блоках. Кластеризация улучшает производительность запросов, позволяя BigQuery лучше оценивать стоимость выполнения запроса. С кластеризированными колонками запросы также устраняют сканирование ненужных данных.

В ClickHouse данные автоматически [кластеризуются на диске](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) на основе колонок первичного ключа таблицы и логически организуются в блоки, которые могут быть быстро найдены или отсеяны запросами, использующими структуру данных первичного индекса.

## Материализованные представления {#materialized-views}

Как BigQuery, так и ClickHouse поддерживают материализованные представления - предварительно вычисленные результаты на основе результата трансформационного запроса по отношению к базовой таблице для повышения производительности и эффективности. 

## Запрос к материализованным представлениям {#querying-materialized-views}

Материализованные представления BigQuery могут быть запрошены напрямую или использоваться оптимизатором для обработки запросов к базовым таблицам. Если изменения в базовых таблицах могут сделать материализованное представление недействительным, данные считываются непосредственно из базовых таблиц. Если изменения в базовых таблицах не делают материализованное представление недействительным, то остальные данные читаются из материализованного представления, и только изменения читаются из базовых таблиц.

В ClickHouse материализованные представления могут быть запрошены только напрямую. Однако, по сравнению с BigQuery (в котором материализованные представления автоматически обновляются в течение 5 минут после изменения базовых таблиц, но не чаще чем [раз в 30 минут](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)), материализованные представления всегда синхронизированы с базовой таблицей.

**Обновление материализованных представлений**

BigQuery периодически полностью обновляет материализованные представления, выполняя запрос трансформации представления по отношению к базовой таблице. Между обновлениями BigQuery комбинирует данные материализованного представления с новыми данными базовой таблицы, чтобы предоставить последовательные результаты запросов, используя при этом материализованное представление.

В ClickHouse материализованные представления обновляются инкрементально. Этот механизм инкрементального обновления обеспечивает высокую масштабируемость и низкие вычислительные затраты: инкрементально обновляемые материализованные представления специально разработаны для сценариев, где базовые таблицы содержат миллиарды или триллионы строк. Вместо того чтобы многократно запрашивать постоянно растущую базовую таблицу для обновления материализованного представления, ClickHouse просто вычисляет частичный результат из (только) значений вновь вставленных строк базовой таблицы. Этот частичный результат инкрементально сливается с ранее рассчитанным частичным результатом в фоновом режиме. Это приводит к значительно более низким вычислительным затратам по сравнению с многократным обновлением материализованного представления из всей базовой таблицы.

## Транзакции {#transactions}

В отличие от ClickHouse, BigQuery поддерживает многооперационные транзакции внутри одного запроса или между несколькими запросами при использовании сессий. Многооперационная транзакция позволяет вам выполнять операции модификации, такие как вставка или удаление строк в одной или нескольких таблицах, и либо зафиксировать, либо откатить изменения атомарно.  Многооперационные транзакции находятся на [дорожной карте ClickHouse на 2024 год](https://github.com/ClickHouse/ClickHouse/issues/58392).

## Агрегационные функции {#aggregate-functions}

По сравнению с BigQuery, ClickHouse имеет значительно больше встроенных агрегирующих функций:

- BigQuery предоставляет [18 агрегирующих функций](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions) и [4 приближенные агрегирующие функции](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions).
- ClickHouse имеет более [150 предустановленных агрегирующих функций](/sql-reference/aggregate-functions/reference), а также мощные [агрегирующие комбинаторы](/sql-reference/aggregate-functions/combinators) для [расширения](https://www.youtube.com/watch?v=7ApwD0cfAFI) поведения предустановленных агрегирующих функций. Например, вы можете применять более 150 предустановленных агрегирующих функций к массивам вместо строк таблицы, просто вызвав их с помощью [-Array суффикса](/sql-reference/aggregate-functions/combinators#-array). С помощью [-Map суффикса](/sql-reference/aggregate-functions/combinators#-map) вы можете применять любую агрегирующую функцию к картам. А с помощью [-ForEach суффикса](/sql-reference/aggregate-functions/combinators#-foreach) вы можете применять любую агрегирующую функцию к вложенным массивам.

## Источники данных и форматы файлов {#data-sources-and-file-formats}

По сравнению с BigQuery, ClickHouse поддерживает значительно больше форматов файлов и источников данных:

- ClickHouse имеет нативную поддержку загрузки данных в более чем 90 форматах файлов из практически любого источника данных.
- BigQuery поддерживает 5 форматов файлов и 19 источников данных.

## Особенности языка SQL {#sql-language-features}

ClickHouse предоставляет стандартный SQL с множеством расширений и улучшений, которые делают его более удобным для аналитических задач. Например, SQL ClickHouse [поддерживает лямбда-функции](/sql-reference/functions/overview#arrow-operator-and-lambda) и функции высшего порядка, так что вам не нужно распаковывать/взрывать массивы при применении трансформаций. Это большое преимущество по сравнению с другими системами, такими как BigQuery.

## Массивы {#arrays}

По сравнению с 8 функциями массивов в BigQuery, ClickHouse имеет более 80 [встроенных функций массивов](/sql-reference/functions/array-functions) для элегантного и простого моделирования и решения широкого диапазона задач.

Типичной схемой проектирования в ClickHouse является использование агрегирующей функции [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) для (временного) преобразования определенных значений строк таблицы в массив. Это затем можно удобно обработать с помощью функций массивов, и результат можно вновь преобразовать в отдельные строки таблицы через агрегирующую функцию [`arrayJoin`](/sql-reference/functions/array-join). 

Поскольку SQL ClickHouse поддерживает [функции высшего порядка](/sql-reference/functions/overview#arrow-operator-and-lambda), то многие сложные операции над массивами могут быть достигнуты простым вызовом одной из встроенных функций высшего порядка, вместо того чтобы временно преобразовывать массивы обратно в таблицы, как это часто [требуется](https://cloud.google.com/bigquery/docs/arrays) в BigQuery, например, для [фильтрации](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) или [объединения](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) массивов. В ClickHouse эти операции выполняются просто вызовом функций высшего порядка [`arrayFilter`](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-), и [`arrayZip`](/sql-reference/functions/array-functions#arrayzip).

В дальнейшем мы предоставим сопоставление операций с массивами из BigQuery в ClickHouse:

| BigQuery | ClickHouse |
|----------|------------|
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat) | [arrayConcat](/sql-reference/functions/array-functions#arrayconcat) |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length) | [length](/sql-reference/functions/array-functions#length) |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse) | [arrayReverse](/sql-reference/functions/array-functions#arrayreverse) |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arraystringconcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array) | [range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) |

**Создание массива с одним элементом для каждой строки в подзапросе**

_BigQuery_

[ARRAY функция](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array)

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

_ClickHouse_

[функция groupArray](/sql-reference/aggregate-functions/reference/grouparray)

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

_BigQuery_

[`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) оператор

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

_ClickHouse_

[ARRAY JOIN](/sql-reference/statements/select/array-join) оператор

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

**Возврат массива дат**

_BigQuery_

[GENERATE_DATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_date_array) функция

```sql
SELECT GENERATE_DATE_ARRAY('2016-10-05', '2016-10-08') AS example;

/*--------------------------------------------------*
 | example                                          |
 +--------------------------------------------------+
 | [2016-10-05, 2016-10-06, 2016-10-07, 2016-10-08] |
 *--------------------------------------------------*/
```

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) функции

_ClickHouse_

```sql
SELECT arrayMap(x -> (toDate('2016-10-05') + x), range(toUInt32((toDate('2016-10-08') - toDate('2016-10-05')) + 1))) AS example

   ┌─example───────────────────────────────────────────────┐
1. │ ['2016-10-05','2016-10-06','2016-10-07','2016-10-08'] │
   └───────────────────────────────────────────────────────┘
```

**Возврат массива временных меток**

_BigQuery_

[GENERATE_TIMESTAMP_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_timestamp_array) функция

```sql
SELECT GENERATE_TIMESTAMP_ARRAY('2016-10-05 00:00:00', '2016-10-07 00:00:00',
                                INTERVAL 1 DAY) AS timestamp_array;

/*--------------------------------------------------------------------------*
 | timestamp_array                                                          |
 +--------------------------------------------------------------------------+
 | [2016-10-05 00:00:00+00, 2016-10-06 00:00:00+00, 2016-10-07 00:00:00+00] |
 *--------------------------------------------------------------------------*/
```

_ClickHouse_

[range](/sql-reference/functions/array-functions#rangeend-rangestart--end--step) + [arrayMap](/sql-reference/functions/array-functions#arraymapfunc-arr1-) функции

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**Фильтрация массивов**

_BigQuery_

Требует временного преобразования массивов обратно в таблицы через оператор [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator) 

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

_ClickHouse_

[arrayFilter](/sql-reference/functions/array-functions#arrayfilterfunc-arr1-) функция

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

**Объединение массивов**

_BigQuery_

Требует временного преобразования массивов обратно в таблицы через оператор [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

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

_ClickHouse_

[arrayZip](/sql-reference/functions/array-functions#arrayzip) функция

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

_BigQuery_

Требует преобразования массивов обратно в таблицы через оператор [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

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

_ClickHouse_

[arraySum](/sql-reference/functions/array-functions#arraysum), [arrayAvg](/sql-reference/functions/array-functions#arrayavg), … функция, или любая из более 90 существующих названий агрегирующих функций в качестве аргумента для [arrayReduce](/sql-reference/functions/array-functions#arrayreduce) функции

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
