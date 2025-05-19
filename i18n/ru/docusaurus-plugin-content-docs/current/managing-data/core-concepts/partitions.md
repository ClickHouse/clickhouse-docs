---
slug: /partitions
title: 'Партиции таблиц'
description: 'Что такое партиции таблиц в ClickHouse'
keywords: ['partitions', 'partition by']
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';
import Image from '@theme/IdealImage';

## Что такое партиции таблиц в ClickHouse? {#what-are-table-partitions-in-clickhouse}

<br/>

Партиции группируют [части данных](/parts) таблицы в семействе [MergeTree](/engines/table-engines/mergetree-family) в упорядоченные, логические единицы, что является способом организации данных, который имеет концептуальное значение и соответствует определённым критериям, таким как временные диапазоны, категории или другие ключевые атрибуты. Эти логические единицы упрощают управление, запрос и оптимизацию данных.

### Partition By {#partition-by}

Партиционирование может быть включено при первоначальном определении таблицы с помощью [оператора PARTITION BY](/engines/table-engines/mergetree-family/custom-partitioning-key). Этот оператор может содержать SQL-выражение, основанное на любых колонках, результаты которого определяют, к какой партиции принадлежит строка.

Чтобы проиллюстрировать это, мы [увеличиваем](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) пример таблицы [Что такое части таблиц](/parts), добавляя оператор `PARTITION BY toStartOfMonth(date)`, который организует части данных таблицы на основе месяцев продаж недвижимости:

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

Когда набор строк вставляется в таблицу, вместо создания (по крайней мере) одного единственного агрегированного данных (как описано [здесь](/parts)), ClickHouse создаёт одну новую часть данных для каждого уникального значения ключа партиции среди вставленных строк:

<Image img={partitions} size="lg"  alt='INSERT PROCESSING' />

<br/>

Сервер ClickHouse сначала разбивает строки из примера вставки с 4 строками, изображёнными на диаграмме выше, по значению их ключа партиции `toStartOfMonth(date)`. Затем, для каждой определённой партиции, строки обрабатываются [по обычной схеме](/parts), выполняя несколько последовательных шагов (① Сортировка, ② Разделение на колонки, ③ Сжатие, ④ Запись на диск).

Обратите внимание, что с включённым партиционированием ClickHouse автоматически создаёт [индексы MinMax](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341) для каждой части данных. Это просто файлы для каждой колонки таблицы, используемой в выражении ключа партиции, содержащие минимальные и максимальные значения этой колонки в рамках части данных.

### Слияния по партициям {#per-partition-merges}

С включённым партиционированием ClickHouse только [сливает](/merges) части данных внутри партиций, но не между ними. Мы изображаем это для нашей примерной таблицы из выше:

<Image img={merges_with_partitions} size="lg"  alt='PART MERGES' />

<br/>

Как показано на диаграмме выше, части, принадлежащие разным партициям, никогда не сливаются. Если выбран ключ партиции с высокой кардинальностью, то части, распределённые по тысячам партиций, никогда не окажутся в числе кандидатов на слияние - превышая заранее настроенные лимиты и вызывая опасную ошибку `Слишком много частей`. Решение этой проблемы просто: выберите разумный ключ партиции с [кардинальностью меньше 1000..10000](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121).

## Мониторинг партиций {#monitoring-partitions}

Вы можете [запросить](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results) список всех существующих уникальных партиций нашей примерной таблицы, используя [виртуальную колонку](/engines/table-engines#table_engines-virtual_columns) `_partition_value`:

```sql runnable
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;
```

В качестве альтернативы, ClickHouse отслеживает все части и партиции всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) для нашей примерной таблицы выше список всех партиций, плюс текущее количество активных частей и общее число строк в этих частях по каждой партиции:

```sql runnable
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;
```

## Для чего используются партиции таблиц? {#what-are-table-partitions-used-for}

### Управление данными {#data-management}

В ClickHouse партиционирование является прежде всего функцией управления данными. Организуя данные логически на основе выражения партиции, каждую партицию можно управлять независимо. Например, схема партиционирования в примере таблицы выше позволяет проводить сценарии, где в основной таблице сохраняются только последние 12 месяцев данных, автоматически удаляя более старые данные с помощью [правила TTL](/guides/developer/ttl) (см. добавленную последнюю строку DDL):

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

Поскольку таблица партиционирована по `toStartOfMonth(date)`, целые партиции (наборы [частей таблиц](/parts)), соответствующие условию TTL, будут удалены, что делает операцию очистки более эффективной, [без необходимости переписывать части](/sql-reference/statements/alter#mutations).

Аналогичным образом, вместо удаления старых данных их можно автоматически и эффективно переместить на более экономичную [уровень хранения](/integrations/s3#storage-tiers):

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

Партиции могут помочь с производительностью запросов, но это во многом зависит от паттернов доступа. Если запросы нацелены только на несколько партиций (в идеале на одну), производительность может потенциально улучшиться. Это обычно полезно, если ключ партиционирования не входит в первичный ключ, и вы фильтруете по нему, как показано в примере запроса ниже.

```sql runnable
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';
```

Запрос выполняется по нашей примерной таблице из выше и [вычисляет](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) самую высокую цену всех проданных объектов недвижимости в Лондоне в декабре 2020 года, фильтруя по обоим колонкам (`date`), использованным в ключе партиции таблицы, и по колонке (`town`), использованной в первичном ключе таблицы (и `date` не является частью первичного ключа).

ClickHouse обрабатывает этот запрос, применяя последовательность методов отбраковки, чтобы избежать оценки нерелевантных данных:

<Image img={partition_pruning} size="lg"  alt='PART MERGES 2' />

<br/>

① **Отбраковка партиций**: [Индексы MinMax](/partitions#what-are-table-partitions-in-clickhouse) используются для игнорирования целых партиций (наборов частей), которые логически не могут соответствовать фильтру запроса по колонкам, использованным в ключе партиции таблицы.

② **Отбраковка гранул**: Для оставшихся частей данных после этапа ① используется их [первичный индекс](/guides/best-practices/sparse-primary-indexes), чтобы игнорировать все [гранулы](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоки строк), которые логически не могут соответствовать фильтру запроса по колонкам, использованным в первичном ключе таблицы.

Мы можем наблюдать эти этапы отбора данных, [исследуя](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) физический план выполнения запроса для нашего примерного запроса из выше через оператор [EXPLAIN](/sql-reference/statements/explain):

```sql style="fontSize:13px"
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';
```

Вывод выше показывает:

① Отбраковка партиций: Строки 7-18 вывода EXPLAIN показывают, что ClickHouse сначала использует [индекс MinMax](/partitions#what-are-table-partitions-in-clickhouse) поля `date`, чтобы идентифицировать 11 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing), хранящихся в 1 из 436 существующих активных частей данных, которые содержат строки, соответствующие фильтру запроса по `date`.

② Отбраковка гранул: Строки 19-24 вывода EXPLAIN указывают, что ClickHouse затем использует [первичный индекс](/guides/best-practices/sparse-primary-indexes) (созданный по полю `town`) первой части данных, определённой на шаге ①, чтобы дополнительно сократить количество гранул (содержащих строки, потенциально также соответствующие фильтру запроса по `town`) с 11 до 1. Это также отображается в выводе ClickHouse-клиента, который мы напечатали выше для выполненного запроса:

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

Это означает, что ClickHouse просканировал и обработал 1 гранулу (блок [8192](/operations/settings/merge-tree-settings#index_granularity) строк) за 6 миллисекунд для вычисления результата запроса.

### Партиционирование в первую очередь является функцией управления данными {#partitioning-is-primarily-a-data-management-feature}

Имейте в виду, что запросы на всех партициях обычно медленнее, чем выполнение того же запроса на непартиционированной таблице.

С партиционированием данные обычно распределены по большему количеству частей данных, что часто приводит к тому, что ClickHouse сканирует и обрабатывает больший объём данных.

Мы можем продемонстрировать это, выполнив один и тот же запрос как для таблицы [Что такое части таблиц](/parts) (без включённого партиционирования), так и для нашей текущей примерной таблицы из выше (с включённым партиционированием). Обе таблицы [содержат](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results) одинаковые данные и количество строк:

```sql runnable
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

Тем не менее, таблица с включёнными партициями [имеет](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) больше активных [частей данных](/parts), потому что, как уже упоминалось, ClickHouse только [сливает](/parts) части данных внутри, но не между партициями:

```sql runnable
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

Как показано выше, партиционированная таблица `uk_price_paid_simple_partitioned` имеет более 600 партиций, и, следовательно, 600 306 активных частей данных. В то время как для нашей непартиционированной таблицы `uk_price_paid_simple` все [начальные](/parts) части данных могли быть объединены в единую активную часть, благодаря фоновой агрегации.

Когда мы [проверяем](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) физический план выполнения запроса с оператором [EXPLAIN](/sql-reference/statements/explain) для нашего примерного запроса из выше без фильтра партиции, выполняемого на партиционированной таблице, мы можем видеть в строках 19 и 20 выводе ниже, что ClickHouse идентифицировал 671 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing), распределённых по 431 из 436 существующих активных частей данных, которые потенциально содержат строки, соответствующие фильтру запроса, и, следовательно, будут сканироваться и обрабатываться движком запросов:

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

Физический план выполнения запроса для того же примерного запроса, выполняемого на таблице без партиций, [показывает](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) в строках 11 и 12 вывода ниже, что ClickHouse идентифицировал 241 из 3083 существующих блоков строк внутри единственной активной части данных таблицы, которые потенциально могут содержать строки, соответствующие фильтру запроса:

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

Для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса по партиционированной версии таблицы ClickHouse сканирует и обрабатывает 671 блока строк (~ 5.5 миллиона строк) за 90 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 миллиона
└───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 million rows, 27.95 MB (60.66 million rows/s., 309.51 MB/s.)
Peak memory usage: 163.44 MiB.
```

В то время как для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса по непартиционированной таблице ClickHouse сканирует и обрабатывает 241 блока (~ 2 миллиона строк) за 12 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 миллиона
└───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 million rows, 9.87 MB (162.23 million rows/s., 811.17 MB/s.)
Peak memory usage: 62.02 MiB.
```
