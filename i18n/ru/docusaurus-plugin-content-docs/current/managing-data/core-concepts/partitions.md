---
slug: /partitions
title: Партиции таблиц
description: Что такое партиции таблиц в ClickHouse
keywords: [partitions, partition by]
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';

## Что такое партиции таблиц в ClickHouse? {#what-are-table-partitions-in-clickhouse}

<br/>

Партиции группируют [данные части](/parts) таблицы в семействе [MergeTree](/engines/table-engines/mergetree-family) в организованные, логические единицы, что является способом организации данных, который концептуально имеет смысл и соответствует определенным критериям, таким как временные диапазоны, категории или другие ключевые атрибуты. Эти логические единицы облегчают управление, запросы и оптимизацию данных.

### Partition By {#partition-by}

Партиционирование можно включить при первоначальном определении таблицы через [клаузу PARTITION BY](/engines/table-engines/mergetree-family/custom-partitioning-key). Эта клаузула может содержать SQL-выражение на любых колонках, результаты которого будут определять, к какой партиции принадлежит строка.

Чтобы проиллюстрировать это, мы [улучшаем](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) пример таблицы [Что такое части таблиц](/parts), добавляя клаузу `PARTITION BY toStartOfMonth(date)`, которая организует данные части таблицы на основе месяцев продаж недвижимости:

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

Вы можете [запросить эту таблицу](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results) в нашем SQL Playground ClickHouse.

### Структура на диске {#structure-on-disk}

Когда пакет строк вставляется в таблицу, вместо создания (по крайней мере) одного единственного блока данных, содержащего все вставленные строки (как описано [здесь](/parts)), ClickHouse создает один новый блок данных для каждого уникального значения ключа партиции среди вставленных строк:

<img src={partitions} alt='INSERT PROCESSING' class='image' />
<br/>

Сервер ClickHouse сначала делит строки из примера вставки с 4 строками, изображенными на диаграмме выше, по значению их ключа партиции `toStartOfMonth(date)`.
Затем для каждой идентифицированной партиции строки обрабатываются [обычным образом](/parts) путем выполнения нескольких последовательных шагов (① Сортировка, ② Деление на колонки, ③ Сжатие, ④ Запись на диск).

Обратите внимание, что при включенном партиционировании ClickHouse автоматически создает [MinMax индексы](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341) для каждой части данных. Это простые файлы для каждой колонки таблицы, используемой в выражении ключа партиции, содержащие минимальные и максимальные значения этой колонки в пределах части данных.

### Слияния по партициям {#per-partition-merges}

При включенном партиционировании ClickHouse только [сливает](/merges) части данных внутри, но не между партициями. Мы схематически показываем это для нашей примерной таблицы:

<img src={merges_with_partitions} alt='PART MERGES' class='image' />
<br/>

Как показано на диаграмме выше, части, принадлежащие различным партициям, никогда не сливаются. Если выбран ключ партиции с высокой кардинальностью, то части, распределенные по тысячам партиций, никогда не будут кандидатами на слияние - превышая преднастроенные лимиты и вызывая ужасную ошибку `Слишком много частей`. Решение этой проблемы простое: выберите разумный ключ партиции с [кардинальностью ниже 1000..10000](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121).

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

В качестве альтернативы, ClickHouse отслеживает все части и партиции всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) для нашей примерной таблицы выше список всех партиций, плюс текущее количество активных частей и сумма строк в этих частях по каждой партиции:

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

В ClickHouse партиционирование в первую очередь является функцией управления данными. Организуя данные логически на основе выражения партиции, каждая партиция может управляться независимо. Например, схема партиционирования в приведенной выше примерной таблице позволяет сценариям, в которых только последние 12 месяцев данных хранятся в основной таблице, автоматически удаляя более старые данные с помощью [правила TTL](/guides/developer/ttl) (см. добавленную последнюю строку в DDL-заявлении):

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

Поскольку таблица организована по `toStartOfMonth(date)`, целые партиции (наборы [таблиц](/parts)), которые соответствуют условию TTL, будут удалены, делая операцию очистки более эффективной, [без необходимости переписывать части](/sql-reference/statements/alter#mutations).

Точно так же, вместо удаления старых данных, их можно автоматически и эффективно переместить на более экономичное [уровень хранения](/integrations/s3#storage-tiers):

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

Партиции могут помочь с производительностью запросов, но это сильно зависит от шаблонов доступа. Если запросы нацелены только на несколько партиций (идеально, одну), производительность может потенциально улучшиться. Это обычно полезно, если ключ партиции не входит в первичный ключ, и вы фильтруете по нему, как показано в примере запроса ниже.

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';

   ┌─highest_price─┐
1. │     296280000 │ -- 296.28 миллионов
   └───────────────┘

1 row in set. Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 миллионов строк/с., 9.49 MB/с.)
Peak memory usage: 2.73 MiB.
```

Запрос выполняется по нашей примерной таблице выше и [вычисляет](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) самую высокую цену всех проданных объектов недвижимости в Лондоне в декабре 2020 года, фильтруя по колонке (`date`), использованной в ключе партиции таблицы, и колонке (`town`), использованной в первичном ключе таблицы (при этом `date` не является частью первичного ключа).

ClickHouse обрабатывает этот запрос, применяя последовательность техник отсева, чтобы избежать оценки нерелевантных данных:

<img src={partition_pruning} alt='PART MERGES' class='image' />
<br/>

① **Отсев партиций**: [MinMax индексы](/partitions#what-are-table-partitions-in-clickhouse) используются для игнорирования целых партиций (наборов частей), которые логически не могут соответствовать фильтру запроса по колонкам, использованным в ключе партиции таблицы.

② **Отсев гранул**: Для оставшихся частей данных после шага ①, их [первичный индекс](/guides/best-practices/sparse-primary-indexes) используется для игнорирования всех [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), которые логически не могут соответствовать фильтру запроса по колонкам, используемым в первичном ключе таблицы.

Мы можем наблюдать эти шаги отсевов данных, [изучив](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) физический план выполнения запроса для нашего выше приведенного запроса через клаузу [EXPLAIN](/sql-reference/statements/explain):

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

Вывод выше показывает:

① Отсев партиций: Строки 7 до 18 вывода EXPLAIN показывают, что ClickHouse сначала использует [MinMax индекс](/partitions#what-are-table-partitions-in-clickhouse) поля `date` для идентификации 11 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), хранящихся в 1 из 436 существующих активных блоков данных, которые содержат строки, соответствующие фильтру `date` запроса.

② Отсев гранул: Строки 19 до 24 вывода EXPLAIN указывают, что ClickHouse затем использует [первичный индекс](/guides/best-practices/sparse-primary-indexes) (созданный по полю `town`) части данных, идентифицированной на шаге ①, чтобы дополнительно уменьшить количество гранул (которые также могут содержать строки, соответствующие фильтру `town` запроса) с 11 до 1. Это также отражается в выводе ClickHouse-клиента, который мы распечатали выше для выполненного запроса:

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

Что означает, что ClickHouse просканировал и обработал 1 гранулу (блок [8192](/operations/settings/merge-tree-settings#index_granularity) строк) за 6 миллисекунд для вычисления результата запроса.

### Партиционирование в первую очередь является функцией управления данными {#partitioning-is-primarily-a-data-management-feature}

Имейте в виду, что запросы по всем партициям обычно медленнее, чем выполнение того же запроса в непартиционированной таблице.

С партиционированием данные обычно распределяются по большему количеству частей данных, что часто приводит к тому, что ClickHouse сканирует и обрабатывает больший объем данных.

Мы можем продемонстрировать это, выполнив один и тот же запрос как по [Частям таблицы](/parts) (без включенного партиционирования), так и по нашей текущей примерной таблице выше (с включенным партиционированием). Обе таблицы [содержат](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results) одинаковые данные и количество строк:

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

Однако, в таблице с включенным партиционированием, [количество активных частей данных](/parts) больше, потому что, как уже упоминалось, ClickHouse только [сливает](/parts) части данных внутри, но не между партициями:

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

Как показано выше, партиционированная таблица `uk_price_paid_simple_partitioned` имеет 306 партиций, и поэтому как минимум 306 активных частей данных. В то время как для нашей непартиционированной таблицы `uk_price_paid_simple` все [начальные](/parts) части данных могли быть объединены в одну активную часть с помощью фоновых слияний.

Когда мы [проверяем](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) физический план выполнения запроса с клаузой [EXPLAIN](/sql-reference/statements/explain) для нашего образца запроса выше без фильтра партиции, выполняемого в партиционированной таблице, мы можем увидеть в строках 19 и 20 вывода ниже, что ClickHouse идентифицировал 671 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), распределенных по 431 из 436 существующих активных частей данных, которые потенциально могут содержать строки, соответствующие фильтру запроса, и, следовательно, будут сканироваться и обрабатываться движком запроса:

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

Физический план выполнения запроса для того же примера, выполняемого по таблице без партиций [показывает](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) в строках 11 и 12 вывода ниже, что ClickHouse идентифицировал 241 из 3083 существующих блоков строк в единственной активной части данных таблицы, которые потенциально могут содержать строки, соответствующие фильтру запроса:

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

Для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса по партиционированной версии таблицы ClickHouse сканирует и обрабатывает 671 блока строк (около 5.5 миллионов строк) за 90 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 миллионов
   └───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 миллиона строк, 27.95 MB (60.66 миллионов строк/с., 309.51 MB/с.)
Peak memory usage: 163.44 MiB.
```

В то время как для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса по непартиционированной таблице ClickHouse сканирует и обрабатывает 241 блока (~ 2 миллиона строк) за 12 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 миллионов
   └───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 миллиона строк, 9.87 MB (162.23 миллионов строк/с., 811.17 MB/с.)
Peak memory usage: 62.02 MiB.
```
