---
slug: /partitions
title: 'Партиции таблиц'
description: 'Что такое партиции таблиц в ClickHouse'
keywords: ['партиции', 'partition by']
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';
import Image from '@theme/IdealImage';

## Что такое партиции таблиц в ClickHouse? {#what-are-table-partitions-in-clickhouse}

<br/>

Партиции группируют [части данных](/parts) таблицы в семействе [MergeTree](/engines/table-engines/mergetree-family) в организованные, логические единицы, что представляет собой способ организации данных, который концептуально имеет смысл и соответствует определенным критериям, таким как диапазоны времени, категории или другие ключевые атрибуты. Эти логические единицы делают данные легче управляемыми, запрашиваемыми и оптимизируемыми.

### Partition By {#partition-by}

Партиционирование может быть включено при первоначальном определении таблицы с помощью [оператора PARTITION BY](/engines/table-engines/mergetree-family/custom-partitioning-key). Этот оператор может содержать SQL-выражение для любых колонок, результаты которого определят, к какой партиции принадлежит строка.

Чтобы проиллюстрировать это, мы [улучшаем](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) пример таблицы [Что такое части таблиц](/parts), добавив оператор `PARTITION BY toStartOfMonth(date)`, который организует части данных таблицы на основе месяцев продаж недвижимости:

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street)
PARTITION BY toStartOfMonth(date);
```

Вы можете [запросить эту таблицу](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results) в нашем ClickHouse SQL Playground.

### Структура на диске {#structure-on-disk}

Каждый раз, когда набор строк вставляется в таблицу, вместо создания (по [крайней мере](/operations/settings/settings#max_insert_block_size)) одной единой части данных, содержащей все вставленные строки (как описано [здесь](/parts)), ClickHouse создает новую часть данных для каждого уникального значения ключа партиции среди вставленных строк:

<Image img={partitions} size="lg"  alt='INSERT PROCESSING' />

<br/>

Сервер ClickHouse сначала разделяет строки из примера вставки с 4 строками, набросанными на диаграмме выше, по их значению ключа партиции `toStartOfMonth(date)`. Затем, для каждой идентифицированной партиции строки обрабатываются [как обычно](/parts) с выполнением нескольких последовательных шагов (① Сортировка, ② Разделение на колонки, ③ Сжатие, ④ Запись на диск).

Обратите внимание, что при включенном партиционировании ClickHouse автоматически создает [индексы MinMax](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341) для каждой части данных. Это просто файлы для каждой колонки таблицы, используемой в выражении ключа партиции, содержащие минимальные и максимальные значения этой колонки в части данных.

### Слияния по партициям {#per-partition-merges}

С включенным партиционированием ClickHouse только [сливает](/merges) части данных внутри партиций, но не между партициями. Мы это иллюстрируем для нашей примерной таблицы выше:

<Image img={merges_with_partitions} size="lg"  alt='PART MERGES' />

<br/>

Как показано на диаграмме выше, части, принадлежащие разным партициям, никогда не сливаются. Если выбран ключ партиции с высокой кардинальностью, части, разбросанные по тысячам партиций, никогда не будут кандидатами на слияние - превышая предварительно настроенные лимиты и вызывая нежелательную ошибку `Слишком много частей`. Решить эту проблему просто: выберите разумный ключ партиционирования с [кардинальностью менее 1000..10000](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121).

## Мониторинг партиций {#monitoring-partitions}

Вы можете [запросить](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results) список всех существующих уникальных партиций нашей примерной таблицы, используя [виртуальную колонку](/engines/table-engines#table_engines-virtual_columns) `_partition_value`:

```sql
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;


     ┌─partition──────┐
  1. │ ('1995-01-01') │
  2. │ ('1995-02-01') │
  3. │ ('1995-03-01') │
 ...
304. │ ('2021-04-01') │
305. │ ('2021-05-01') │
306. │ ('2021-06-01') │
     └────────────────┘
```

Также ClickHouse отслеживает все части и партиции всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) для нашей примерной таблицы выше список всех партиций, а также текущее количество активных частей и сумму строк в этих частях по каждой партиции:

```sql
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;


     ┌─partition──┬─parts─┬───rows─┐
  1. │ 1995-01-01 │     1 │  50473 │
  2. │ 1995-02-01 │     1 │  50840 │
  3. │ 1995-03-01 │     1 │  71276 │
 ...
304. │ 2021-04-01 │     3 │  23160 │
305. │ 2021-05-01 │     3 │  17607 │
306. │ 2021-06-01 │     3 │   5652 │
     └─partition──┴─parts─┴───rows─┘
```

## Для чего используются партиции таблиц? {#what-are-table-partitions-used-for}

### Управление данными {#data-management}

В ClickHouse партиционирование является в первую очередь функцией управления данными. Организуя данные логически на основе выражения партиции, каждая партиция может управляться независимо. Например, схема партиционирования в примерной таблице выше позволяет сценариям, при которых только последние 12 месяцев данных хранятся в основной таблице, автоматически удаляя более старые данные с помощью [правила TTL](/guides/developer/ttl) (см. добавленную последнюю строку команды DDL):

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH DELETE;
```

Поскольку таблица партиционирована по `toStartOfMonth(date)`, целые партиции (наборы [частей таблиц](/parts)), которые соответствуют условию TTL, будут удалены, делая операцию очистки более эффективной, [без необходимости пересоздавать части](/sql-reference/statements/alter#mutations).

Аналогично, вместо удаления старых данных, их можно автоматически и эффективно перемещать на более дешевый [уровень хранения](/integrations/s3#storage-tiers):

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH TO VOLUME 'slow_but_cheap';
```

### Оптимизация запросов {#query-optimization}

Партиции могут помочь с производительностью запросов, но это сильно зависит от паттернов доступа. Если запросы нацелены только на несколько партиций (в идеале на одну), производительность может улучшиться. Это обычно полезно, если ключ партиционирования не входит в первичный ключ, и вы фильтруете по нему, как показано в примере запроса ниже.

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';


   ┌─highest_price─┐
1. │     296280000 │ -- 296.28 миллиона
   └───────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 миллиона строк/с., 9.49 MB/с.)
Peak memory usage: 2.73 MiB.
```

Запрос выполняется над нашей примерной таблицей выше и [вычисляет](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) наивысшую цену всех проданных объектов недвижимости в Лондоне в декабре 2020 года, фильтруя по обоим полям (`date`), использованному в ключе партиционирования таблицы, и по полю (`town`), использованному в первичном ключе (при этом `date` не является частью первичного ключа).

ClickHouse обрабатывает этот запрос, применяя последовательность техник обрезки, чтобы избежать оценки нерелевантных данных:

<Image img={partition_pruning} size="lg"  alt='PART MERGES 2' />

<br/>

① **Обрезка партиций**: [Индексы MinMax](/partitions#what-are-table-partitions-in-clickhouse) используются для игнорирования целых партиций (наборов частей), которые логически не могут соответствовать фильтру запроса по колонкам, используемым в ключе партиции таблицы.

② **Обрезка гранул**: Для оставшихся частей данных после шага ① их [первичный индекс](/guides/best-practices/sparse-primary-indexes) используется для игнорирования всех [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), которые логически не могут соответствовать фильтру запроса по колонкам, использованным в первичном ключе таблицы.

Мы можем наблюдать эти шаги обрезки данных, [исследуя](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) план выполнения запроса для нашего примера запроса выше с использованием [EXPLAIN](/sql-reference/statements/explain) :

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';


    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                                                    │
 2. │   Aggregating                                                                                                │
 3. │     Expression (Before GROUP BY)                                                                             │
 4. │       Expression                                                                                             │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned)                                              │
 6. │         Indexes:                                                                                             │
 7. │           MinMax                                                                                             │
 8. │             Keys:                                                                                            │
 9. │               date                                                                                           │
10. │             Condition: and((date in (-Inf, 18627]), (date in [18597, +Inf)))                                 │
11. │             Parts: 1/436                                                                                     │
12. │             Granules: 11/3257                                                                                │
13. │           Partition                                                                                          │
14. │             Keys:                                                                                            │
15. │               toStartOfMonth(date)                                                                           │
16. │             Condition: and((toStartOfMonth(date) in (-Inf, 18597]), (toStartOfMonth(date) in [18597, +Inf))) │
17. │             Parts: 1/1                                                                                       │
18. │             Granules: 11/11                                                                                  │
19. │           PrimaryKey                                                                                         │
20. │             Keys:                                                                                            │
21. │               town                                                                                           │
22. │             Condition: (town in ['LONDON', 'LONDON'])                                                        │
23. │             Parts: 1/1                                                                                       │
24. │             Granules: 1/11                                                                                   │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Вышеуказанный вывод показывает:

① Обрезка партиций: Строки с 7 по 18 в выводе EXPLAIN показывают, что ClickHouse сначала использует [индекс MinMax](https://partitions#what-are-table-partitions-in-clickhouse) для поля `date`, чтобы определить 11 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), хранящихся в 1 из 436 существующих активных частей данных, которые содержат строки, соответствующие фильтру по `date`.

② Обрезка гранул: Строки с 19 по 24 в выводе EXPLAIN указывают на то, что ClickHouse затем использует [первичный индекс](/guides/best-practices/sparse-primary-indexes) (созданный по полю `town`) части данных, идентифицированной на шаге ①, чтобы еще больше сократить количество гранул (которые также могут содержать строки, соответствующие фильтру по `town`) с 11 до 1. Это также отражается в выводе ClickHouse-клиента, который мы распечатали выше для выполненного запроса:

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 миллиона строк/с., 9.49 MB/с.)
Peak memory usage: 2.73 MiB.
```

Это означает, что ClickHouse просканировал и обработал 1 гранулу (блок [8192](/operations/settings/merge-tree-settings#index_granularity) строк) за 6 миллисекунд для вычисления результата запроса.

### Партиционирование является в первую очередь функцией управления данными {#partitioning-is-primarily-a-data-management-feature}

Учтите, что выполнение запроса через все партиции обычно медленнее, чем выполнение того же запроса на непартиционированной таблице.

С партиционированием данные обычно распределяются по большему количеству частей данных, что часто приводит к тому, что ClickHouse сканирует и обрабатывает больший объем данных.

Мы можем продемонстрировать это, выполнив один и тот же запрос на обеих таблицах: [Что такое части таблиц](/parts) (без включенного партиционирования) и нашей текущей примерной таблице выше (с включенным партиционированием). Обе таблицы [содержат](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZFRVAgaHR0cHM6Ly9zY2hlbWF0cy5jbG9hcmVuZmF0ZHMuY29tL2RsMTAuY2xvdWQ9MTAwJw==&run_query=true&tab=results) одинаковые данные и количество строк:

```sql
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

   ┌─table────────────────────────────┬─────rows─┐
1. │ uk_price_paid_simple             │ 25248433 │
2. │ uk_price_paid_simple_partitioned │ 25248433 │
   └──────────────────────────────────┴──────────┘
```

Однако таблица с включенным партиционированием, [имеет](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) больше активных [частей данных](/parts), потому что, как упоминалось выше, ClickHouse только [сливает](/parts) части данных внутри, но не между партициями:

```sql
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

   ┌─table────────────────────────────┬─parts─┐
1. │ uk_price_paid_simple             │     1 │
2. │ uk_price_paid_simple_partitioned │   436 │
   └──────────────────────────────────┴───────┘
```

Как показано выше, партиционированная таблица `uk_price_paid_simple_partitioned` имеет 306 партиций, и, следовательно, как минимум 306 активных частей данных. В то время как для нашей непартиционированной таблицы `uk_price_paid_simple` все [начальные](/parts) части данных могут быть объединены в одну активную часть посредством фоновых слияний.

Когда мы [проверяем](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) план выполнения физического запроса с использованием [EXPLAIN](/sql-reference/statements/explain) для нашего примерного запроса выше без фильтра партиции, выполняемого на партиционированной таблице, мы можем увидеть в строках 19 и 20 ниже, что ClickHouse определил 671 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), распределённых по 431 из 436 существующих активных частей данных, которые потенциально могут содержать строки, соответствующие фильтру запроса, и, следовательно, будут просканированы и обработаны движком запросов:

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


    ┌─explain─────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                       │
 2. │   Aggregating                                                   │
 3. │     Expression (Before GROUP BY)                                │
 4. │       Expression                                                │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned) │
 6. │         Indexes:                                                │
 7. │           MinMax                                                │
 8. │             Condition: true                                     │
 9. │             Parts: 436/436                                      │
10. │             Granules: 3257/3257                                 │
11. │           Partition                                             │
12. │             Condition: true                                     │
13. │             Parts: 436/436                                      │
14. │             Granules: 3257/3257                                 │
15. │           PrimaryKey                                            │
16. │             Keys:                                               │
17. │               town                                              │
18. │             Condition: (town in ['LONDON', 'LONDON'])           │
19. │             Parts: 431/436                                      │
20. │             Granules: 671/3257                                  │
    └─────────────────────────────────────────────────────────────────┘
```

План выполнения физического запроса для того же примерного запроса, выполняемого над таблицей без партиций, [показывает](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) в строках 11 и 12 ниже, что ClickHouse определил 241 из 3083 существующих блоков строк в единственной активной части данных таблицы, которые потенциально могут содержать строки, соответствующие фильтру запроса:

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 1/1                                │
12. │             Granules: 241/3083                        │
    └───────────────────────────────────────────────────────┘
```

Для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса над партиционированной версией таблицы ClickHouse сканирует и обрабатывает 671 блока строк (~ 5.5 миллиона строк) за 90 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 миллиона
   └───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 million rows, 27.95 MB (60.66 миллиона строк/с., 309.51 MB/с.)
Peak memory usage: 163.44 MiB.
```

В то время как [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса над непартиционированной таблицей ClickHouse сканирует и обрабатывает 241 блока (~ 2 миллиона строк) за 12 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 миллиона
   └───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 million rows, 9.87 MB (162.23 миллиона строк/с., 811.17 MB/с.)
Peak memory usage: 62.02 MiB.
```
