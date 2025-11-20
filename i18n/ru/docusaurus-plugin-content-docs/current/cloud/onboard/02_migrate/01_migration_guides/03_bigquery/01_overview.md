---
title: 'BigQuery и ClickHouse Cloud'
slug: /migrations/bigquery/biquery-vs-clickhouse-cloud
description: 'Чем BigQuery отличается от ClickHouse Cloud'
keywords: ['BigQuery']
show_related_blogs: true
sidebar_label: 'Обзор'
doc_type: 'guide'
---

import bigquery_1 from '@site/static/images/migrations/bigquery-1.png';
import Image from '@theme/IdealImage';


# Сравнение ClickHouse Cloud с BigQuery 



## Организация ресурсов {#resource-organization}

Способ организации ресурсов в ClickHouse Cloud аналогичен [иерархии ресурсов BigQuery](https://cloud.google.com/bigquery/docs/resource-hierarchy). Ниже мы описываем конкретные различия на основе следующей диаграммы, показывающей иерархию ресурсов ClickHouse Cloud:

<Image img={bigquery_1} size='md' alt='Организация ресурсов' />

### Организации {#organizations}

Как и в BigQuery, организации являются корневыми узлами в иерархии ресурсов ClickHouse Cloud. Первый пользователь, которого вы создаете в своей учетной записи ClickHouse Cloud, автоматически назначается в организацию, принадлежащую этому пользователю. Пользователь может приглашать дополнительных пользователей в организацию.

### Проекты BigQuery и сервисы ClickHouse Cloud {#bigquery-projects-vs-clickhouse-cloud-services}

Внутри организаций вы можете создавать сервисы, приблизительно эквивалентные проектам BigQuery, поскольку хранимые данные в ClickHouse Cloud связаны с сервисом. В ClickHouse Cloud [доступно несколько типов сервисов](/cloud/manage/cloud-tiers). Каждый сервис ClickHouse Cloud развертывается в определенном регионе и включает:

1. Группу вычислительных узлов (в настоящее время 2 узла для сервиса уровня Development и 3 для сервиса уровня Production). Для этих узлов ClickHouse Cloud [поддерживает вертикальное и горизонтальное масштабирование](/manage/scaling#how-scaling-works-in-clickhouse-cloud) как в ручном, так и в автоматическом режиме.
2. Папку объектного хранилища, где сервис хранит все данные.
3. Конечную точку (или несколько конечных точек, созданных через консоль пользовательского интерфейса ClickHouse Cloud) — URL сервиса, который вы используете для подключения к сервису (например, `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)

### Наборы данных BigQuery и базы данных ClickHouse Cloud {#bigquery-datasets-vs-clickhouse-cloud-databases}

ClickHouse логически группирует таблицы в базы данных. Как и наборы данных BigQuery, базы данных ClickHouse являются логическими контейнерами, которые организуют и контролируют доступ к табличным данным.

### Папки BigQuery {#bigquery-folders}

В настоящее время в ClickHouse Cloud отсутствует концепция, эквивалентная папкам BigQuery.

### Резервирование слотов и квоты BigQuery {#bigquery-slot-reservations-and-quotas}

Как и при резервировании слотов BigQuery, вы можете [настроить вертикальное и горизонтальное автомасштабирование](/manage/scaling#configuring-vertical-auto-scaling) в ClickHouse Cloud. Для вертикального автомасштабирования вы можете установить минимальный и максимальный размер памяти и количество ядер CPU вычислительных узлов для сервиса. Затем сервис будет масштабироваться по мере необходимости в пределах этих границ. Эти настройки также доступны во время первоначального процесса создания сервиса. Каждый вычислительный узел в сервисе имеет одинаковый размер. Вы можете изменить количество вычислительных узлов в сервисе с помощью [горизонтального масштабирования](/manage/scaling#manual-horizontal-scaling).

Кроме того, как и квоты BigQuery, ClickHouse Cloud предлагает управление параллелизмом, ограничения использования памяти и планирование ввода-вывода, позволяя пользователям изолировать запросы в классы рабочих нагрузок. Устанавливая ограничения на общие ресурсы (ядра CPU, оперативную память, дисковый и сетевой ввод-вывод) для конкретных классов рабочих нагрузок, система гарантирует, что эти запросы не влияют на другие критически важные бизнес-запросы. Управление параллелизмом предотвращает избыточную подписку потоков в сценариях с большим количеством параллельных запросов.

ClickHouse отслеживает размеры выделения памяти в байтах на уровне сервера, пользователя и запроса, обеспечивая гибкие ограничения использования памяти. Избыточное выделение памяти позволяет запросам использовать дополнительную свободную память сверх гарантированной, при этом обеспечивая ограничения памяти для других запросов. Кроме того, использование памяти для операций агрегации, сортировки и соединения может быть ограничено, что позволяет переключаться на внешние алгоритмы при превышении лимита памяти.

Наконец, планирование ввода-вывода позволяет пользователям ограничивать доступ к локальным и удаленным дискам для классов рабочих нагрузок на основе максимальной пропускной способности, количества активных запросов и политики.

### Разрешения {#permissions}

ClickHouse Cloud контролирует доступ пользователей в двух местах: через [облачную консоль](/cloud/guides/sql-console/manage-sql-console-role-assignments) и через [базу данных](/cloud/security/manage-database-users). Доступ к консоли управляется через пользовательский интерфейс [clickhouse.cloud](https://console.clickhouse.cloud). Доступ к базе данных управляется через учетные записи пользователей базы данных и роли. Кроме того, пользователям консоли могут быть предоставлены роли в базе данных, которые позволяют пользователю консоли взаимодействовать с базой данных через нашу [SQL-консоль](/integrations/sql-clients/sql-console).


## Типы данных {#data-types}

ClickHouse обеспечивает более детальную точность для числовых типов. Например, BigQuery предоставляет числовые типы [`INT64`, `NUMERIC`, `BIGNUMERIC` и `FLOAT64`](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#numeric_types). В отличие от этого, ClickHouse предлагает множество типов с различной точностью для десятичных чисел, чисел с плавающей точкой и целых чисел. Благодаря этим типам данных пользователи ClickHouse могут оптимизировать использование хранилища и памяти, что приводит к более быстрому выполнению запросов и меньшему потреблению ресурсов. Ниже приведено соответствие типов ClickHouse каждому типу BigQuery:

| BigQuery                                                                                                 | ClickHouse                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#array_type)             | [Array(t)](/sql-reference/data-types/array)                                                                                                                                       |
| [NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)        | [Decimal(P, S), Decimal32(S), Decimal64(S), Decimal128(S)](/sql-reference/data-types/decimal)                                                                                     |
| [BIG NUMERIC](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#decimal_types)    | [Decimal256(S)](/sql-reference/data-types/decimal)                                                                                                                                |
| [BOOL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#boolean_type)            | [Bool](/sql-reference/data-types/boolean)                                                                                                                                         |
| [BYTES](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#bytes_type)             | [FixedString](/sql-reference/data-types/fixedstring)                                                                                                                              |
| [DATE](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#date_type)               | [Date32](/sql-reference/data-types/date32) (с более узким диапазоном)                                                                                                                  |
| [DATETIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#datetime_type)       | [DateTime](/sql-reference/data-types/datetime), [DateTime64](/sql-reference/data-types/datetime64) (узкий диапазон, более высокая точность)                                               |
| [FLOAT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#floating_point_types) | [Float64](/sql-reference/data-types/float)                                                                                                                                        |
| [GEOGRAPHY](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#geography_type)     | [Geo Data Types](/sql-reference/data-types/float)                                                                                                                                 |
| [INT64](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)          | [UInt8, UInt16, UInt32, UInt64, UInt128, UInt256, Int8, Int16, Int32, Int64, Int128, Int256](/sql-reference/data-types/int-uint)                                                  |
| [INTERVAL](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#integer_types)       | Не применимо — [поддерживается как выражение](/sql-reference/data-types/special-data-types/interval#usage-remarks) или [через функции](/sql-reference/functions/date-time-functions#addYears) |
| [JSON](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#json_type)               | [JSON](/integrations/data-formats/json/inference)                                                                                                                                 |
| [STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#string_type)           | [String (байты)](/sql-reference/data-types/string)                                                                                                                                |
| [STRUCT](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#constructing_a_struct) | [Tuple](/sql-reference/data-types/tuple), [Nested](/sql-reference/data-types/nested-data-structures/nested)                                                                       |
| [TIME](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#time_type)               | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |
| [TIMESTAMP](https://cloud.google.com/bigquery/docs/reference/standard-sql/data-types#timestamp_type)     | [DateTime64](/sql-reference/data-types/datetime64)                                                                                                                                |

При наличии нескольких вариантов типов ClickHouse учитывайте фактический диапазон данных и выбирайте минимально необходимый тип. Также рассмотрите возможность использования [подходящих кодеков](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) для дополнительного сжатия.


## Методы ускорения запросов {#query-acceleration-techniques}

### Первичные и внешние ключи и первичный индекс {#primary-and-foreign-keys-and-primary-index}

В BigQuery таблица может иметь [ограничения первичного и внешнего ключей](https://cloud.google.com/bigquery/docs/information-schema-table-constraints). Обычно первичные и внешние ключи используются в реляционных базах данных для обеспечения целостности данных. Значение первичного ключа, как правило, уникально для каждой строки и не равно `NULL`. Каждое значение внешнего ключа в строке должно присутствовать в столбце первичного ключа соответствующей таблицы или быть равно `NULL`. В BigQuery эти ограничения не применяются принудительно, но оптимизатор запросов может использовать эту информацию для более эффективной оптимизации запросов.

В ClickHouse таблица также может иметь первичный ключ. Как и BigQuery, ClickHouse не обеспечивает уникальность значений столбцов первичного ключа таблицы. В отличие от BigQuery, данные таблицы хранятся на диске [упорядоченными](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) по столбцам первичного ключа. Оптимизатор запросов использует этот порядок сортировки для предотвращения повторной сортировки, минимизации использования памяти при соединениях и обеспечения досрочного завершения для предложений limit. В отличие от BigQuery, ClickHouse автоматически создаёт [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) на основе значений столбцов первичного ключа. Этот индекс используется для ускорения всех запросов, содержащих фильтры по столбцам первичного ключа. В настоящее время ClickHouse не поддерживает ограничения внешних ключей.


## Вторичные индексы (доступны только в ClickHouse) {#secondary-indexes-only-available-in-clickhouse}

Помимо первичного индекса, создаваемого на основе значений столбцов первичного ключа таблицы, ClickHouse позволяет создавать вторичные индексы для столбцов, не входящих в первичный ключ. ClickHouse предлагает несколько типов вторичных индексов, каждый из которых предназначен для различных типов запросов:

- **Индекс Bloom Filter**:
  - Используется для ускорения запросов с условиями равенства (например, =, IN).
  - Использует вероятностные структуры данных для определения того, существует ли значение в блоке данных.
- **Индекс Token Bloom Filter**:
  - Аналогичен индексу Bloom Filter, но используется для токенизированных строк и подходит для полнотекстового поиска.
- **Индекс Min-Max**:
  - Хранит минимальное и максимальное значения столбца для каждой части данных.
  - Позволяет пропускать чтение частей данных, не попадающих в указанный диапазон.


## Поисковые индексы {#search-indexes}

Подобно [поисковым индексам](https://cloud.google.com/bigquery/docs/search-index) в BigQuery, в ClickHouse можно создавать [полнотекстовые индексы](/engines/table-engines/mergetree-family/invertedindexes) для столбцов таблиц со строковыми значениями.


## Векторные индексы {#vector-indexes}

BigQuery недавно представил [векторные индексы](https://cloud.google.com/bigquery/docs/vector-index) в качестве функции Pre-GA. Аналогичным образом, ClickHouse имеет экспериментальную поддержку [индексов для ускорения](/engines/table-engines/mergetree-family/annindexes) задач векторного поиска.


## Партиционирование {#partitioning}

Как и BigQuery, ClickHouse использует партиционирование таблиц для повышения производительности и удобства управления большими таблицами путём разделения их на более мелкие и управляемые части, называемые партициями. Подробное описание партиционирования в ClickHouse приведено [здесь](/engines/table-engines/mergetree-family/custom-partitioning-key).


## Кластеризация {#clustering}

При кластеризации BigQuery автоматически сортирует данные таблицы по значениям нескольких указанных столбцов и размещает их в блоках оптимального размера. Кластеризация повышает производительность запросов, позволяя BigQuery точнее оценивать стоимость их выполнения. При использовании кластеризованных столбцов запросы также исключают сканирование ненужных данных.

В ClickHouse данные автоматически [кластеризуются на диске](/guides/best-practices/sparse-primary-indexes#optimal-compression-ratio-of-data-files) на основе столбцов первичного ключа таблицы и логически организуются в блоки, которые могут быть быстро найдены или исключены из обработки запросами, использующими структуру данных первичного индекса.


## Материализованные представления {#materialized-views}

И BigQuery, и ClickHouse поддерживают материализованные представления — предварительно вычисленные результаты, основанные на запросе преобразования к базовой таблице, что повышает производительность и эффективность.


## Запросы к материализованным представлениям {#querying-materialized-views}

Материализованные представления BigQuery можно запрашивать напрямую или использовать оптимизатором для обработки запросов к базовым таблицам. Если изменения в базовых таблицах могут привести к устареванию материализованного представления, данные читаются непосредственно из базовых таблиц. Если изменения в базовых таблицах не приводят к устареванию материализованного представления, то остальные данные читаются из материализованного представления, а только изменённые данные читаются из базовых таблиц.

В ClickHouse материализованные представления можно запрашивать только напрямую. Однако, в отличие от BigQuery (где материализованные представления автоматически обновляются в течение 5 минут после изменения базовых таблиц, но не чаще, чем [каждые 30 минут](https://cloud.google.com/bigquery/docs/materialized-views-manage#refresh)), материализованные представления всегда синхронизированы с базовой таблицей.

**Обновление материализованных представлений**

BigQuery периодически полностью обновляет материализованные представления, выполняя запрос преобразования представления к базовой таблице. Между обновлениями BigQuery объединяет данные материализованного представления с новыми данными базовой таблицы для получения согласованных результатов запросов, продолжая при этом использовать материализованное представление.

В ClickHouse материализованные представления обновляются инкрементально. Этот механизм инкрементального обновления обеспечивает высокую масштабируемость и низкие вычислительные затраты: инкрементально обновляемые материализованные представления разработаны специально для сценариев, в которых базовые таблицы содержат миллиарды или триллионы строк. Вместо повторного запроса постоянно растущей базовой таблицы для обновления материализованного представления ClickHouse просто вычисляет частичный результат только из значений вновь вставленных строк базовой таблицы. Этот частичный результат инкрементально объединяется с ранее вычисленным частичным результатом в фоновом режиме. Это приводит к значительному снижению вычислительных затрат по сравнению с повторным обновлением материализованного представления на основе всей базовой таблицы.


## Транзакции {#transactions}

В отличие от ClickHouse, BigQuery поддерживает многооператорные транзакции как внутри одного запроса, так и между несколькими запросами при использовании сессий. Многооператорная транзакция позволяет выполнять операции изменения данных, такие как вставка или удаление строк в одной или нескольких таблицах, с последующей атомарной фиксацией или откатом изменений. Многооператорные транзакции включены в [дорожную карту ClickHouse на 2024 год](https://github.com/ClickHouse/ClickHouse/issues/58392).


## Агрегатные функции {#aggregate-functions}

По сравнению с BigQuery, ClickHouse содержит значительно больше встроенных агрегатных функций:

- BigQuery включает [18 агрегатных функций](https://cloud.google.com/bigquery/docs/reference/standard-sql/aggregate_functions) и [4 приближённые агрегатные функции](https://cloud.google.com/bigquery/docs/reference/standard-sql/approximate_aggregate_functions).
- ClickHouse содержит более [150 готовых агрегатных функций](/sql-reference/aggregate-functions/reference), а также мощные [комбинаторы агрегатных функций](/sql-reference/aggregate-functions/combinators) для [расширения](https://www.youtube.com/watch?v=7ApwD0cfAFI) возможностей готовых агрегатных функций. Например, любую из более чем 150 готовых агрегатных функций можно применить к массивам вместо строк таблицы, просто добавив [суффикс -Array](/sql-reference/aggregate-functions/combinators#-array). С [суффиксом -Map](/sql-reference/aggregate-functions/combinators#-map) можно применить любую агрегатную функцию к словарям. А с [суффиксом -ForEach](/sql-reference/aggregate-functions/combinators#-foreach) можно применить любую агрегатную функцию к вложенным массивам.


## Источники данных и форматы файлов {#data-sources-and-file-formats}

По сравнению с BigQuery, ClickHouse поддерживает значительно больше форматов файлов и источников данных:

- ClickHouse имеет встроенную поддержку загрузки данных более чем в 90 форматах файлов практически из любого источника данных
- BigQuery поддерживает 5 форматов файлов и 19 источников данных


## Возможности языка SQL {#sql-language-features}

ClickHouse предоставляет стандартный SQL с множеством расширений и улучшений, делающих его более удобным для аналитических задач. Например, ClickHouse SQL [поддерживает лямбда-функции](/sql-reference/functions/overview#arrow-operator-and-lambda) и функции высшего порядка, поэтому при применении преобразований не требуется разворачивать массивы. Это существенное преимущество перед другими системами, такими как BigQuery.


## Массивы {#arrays}

В отличие от 8 функций для работы с массивами в BigQuery, ClickHouse предоставляет более 80 [встроенных функций для массивов](/sql-reference/functions/array-functions) для моделирования и элегантного решения широкого спектра задач.

Типичный паттерн проектирования в ClickHouse — использование агрегатной функции [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) для (временного) преобразования определённых значений строк таблицы в массив. Затем массив можно удобно обработать с помощью функций для массивов, а результат преобразовать обратно в отдельные строки таблицы с помощью функции [`arrayJoin`](/sql-reference/functions/array-join).

Поскольку ClickHouse SQL поддерживает [функции высшего порядка с лямбда-выражениями](/sql-reference/functions/overview#arrow-operator-and-lambda), многие сложные операции с массивами можно выполнить простым вызовом одной из встроенных функций высшего порядка, вместо временного преобразования массивов обратно в таблицы, как это часто [требуется](https://cloud.google.com/bigquery/docs/arrays) в BigQuery, например, для [фильтрации](https://cloud.google.com/bigquery/docs/arrays#filtering_arrays) или [объединения](https://cloud.google.com/bigquery/docs/arrays#zipping_arrays) массивов. В ClickHouse эти операции выполняются простым вызовом функций высшего порядка [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter) и [`arrayZip`](/sql-reference/functions/array-functions#arrayZip) соответственно.

Ниже приведено соответствие операций с массивами между BigQuery и ClickHouse:

| BigQuery                                                                                                         | ClickHouse                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [ARRAY_CONCAT](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_concat)       | [arrayConcat](/sql-reference/functions/array-functions#arrayConcat)                         |
| [ARRAY_LENGTH](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_length)       | [length](/sql-reference/functions/array-functions#length)                                   |
| [ARRAY_REVERSE](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_reverse)     | [arrayReverse](/sql-reference/functions/array-functions#arrayReverse)                       |
| [ARRAY_TO_STRING](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#array_to_string) | [arrayStringConcat](/sql-reference/functions/splitting-merging-functions#arrayStringConcat) |
| [GENERATE_ARRAY](https://cloud.google.com/bigquery/docs/reference/standard-sql/array_functions#generate_array)   | [range](/sql-reference/functions/array-functions#range)                                     |

**Создание массива с одним элементом для каждой строки подзапроса**

_BigQuery_

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

_ClickHouse_

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

_BigQuery_

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

_ClickHouse_

Секция [ARRAY JOIN](/sql-reference/statements/select/array-join)


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

**Вернуть массив дат**

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

**Возврат массива отметок времени**

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

Функции [range](/sql-reference/functions/array-functions#range) и [arrayMap](/sql-reference/functions/array-functions#arrayMap)

```sql
SELECT arrayMap(x -> (toDateTime('2016-10-05 00:00:00') + toIntervalDay(x)), range(dateDiff('day', toDateTime('2016-10-05 00:00:00'), toDateTime('2016-10-07 00:00:00')) + 1)) AS timestamp_array

Query id: b324c11f-655b-479f-9337-f4d34fd02190

   ┌─timestamp_array─────────────────────────────────────────────────────┐
1. │ ['2016-10-05 00:00:00','2016-10-06 00:00:00','2016-10-07 00:00:00'] │
   └─────────────────────────────────────────────────────────────────────┘
```

**Фильтрация массивов**

*BigQuery*

Требует предварительного преобразования массивов обратно в таблицы с помощью оператора [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

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


Функция [`arrayFilter`](/sql-reference/functions/array-functions#arrayFilter)

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

**Поэлементное объединение массивов**

*BigQuery*

Требуется временно преобразовать массивы обратно в таблицы с помощью оператора [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

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

Требует преобразовать массивы обратно в таблицы с помощью оператора [`UNNEST`](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#unnest_operator)

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

функция [arraySum](/sql-reference/functions/array-functions#arraySum), [arrayAvg](/sql-reference/functions/array-functions#arrayAvg), ... или любое из более чем 90 существующих названий агрегатных функций в качестве аргумента для функции [arrayReduce](/sql-reference/functions/array-functions#arrayReduce)


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
