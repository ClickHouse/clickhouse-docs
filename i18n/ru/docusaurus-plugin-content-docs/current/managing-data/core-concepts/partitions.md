---
slug: /partitions
title: 'Разделы таблиц'
description: 'Что такое разделы таблиц в ClickHouse'
keywords: ['разделы', 'раздел по']
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';
import Image from '@theme/IdealImage';

## Что такое разделы таблиц в ClickHouse? {#what-are-table-partitions-in-clickhouse}

<br/>

Разделы группируют [части данных](/parts) таблицы в семействе [MergeTree](/engines/table-engines/mergetree-family) в организованные, логические единицы, которые являются способом организации данных, имеющим концептуальное значение и соответствующим определенным критериям, таким как диапазоны времени, категории или другие ключевые атрибуты. Эти логические единицы облегчают управление, выполнение запросов и оптимизацию данных.

### Раздел по {#partition-by}

Разделение может быть включено, когда таблица изначально определяется с помощью [предложения PARTITION BY](/engines/table-engines/mergetree-family/custom-partitioning-key). Это предложение может содержать SQL-выражение на любых столбцах, результаты которого определяют, к какому разделу принадлежит строка.

Чтобы проиллюстрировать это, мы [усиливаем](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) пример таблицы [Что такое части таблиц](/parts), добавляя предложение `PARTITION BY toStartOfMonth(date)`, которое организует части данных таблицы на основе месяцев продаж недвижимости:

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

Вы можете [выполнить запрос к этой таблице](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results) в нашем SQL Playground ClickHouse.

### Структура на диске {#structure-on-disk}

Когда набор строк вставляется в таблицу, вместо создания (по крайней мере) одного единственного раздела данных, содержащего все вставленные строки (как описано [здесь](/parts)), ClickHouse создает новый раздел данных для каждого уникального значения ключа раздела среди вставленных строк:

<Image img={partitions} size="lg"  alt='ПРОЦЕСС ВСТАВКИ' />

<br/>

Сервер ClickHouse сначала разбивает строки из примера вставки с 4 строками, нарисованными на диаграмме выше, по их значению ключа раздела `toStartOfMonth(date)`. Затем для каждого идентифицированного раздела строки обрабатываются [как обычно](/parts), выполняя несколько последовательных шагов (① Сортировка, ② Разделение на столбцы, ③ Сжатие, ④ Запись на диск).

Обратите внимание, что при включении разделения ClickHouse автоматически создает [MinMax индексы](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341) для каждого раздела данных. Это просто файлы для каждого столбца таблицы, используемого в выражении ключа раздела, содержащие минимальные и максимальные значения этого столбца в пределах раздела данных.

### Слияния по разделам {#per-partition-merges}

С включенным разделением ClickHouse объединяет только [части данных](/merges) внутри разделов, но не между ними. Мы это проиллюстрируем на примере нашей таблицы:

<Image img={merges_with_partitions} size="lg"  alt='СЛИЯНИЯ ЧАСТЕЙ' />

<br/>

Как показано на диаграмме выше, части, принадлежащие различным разделам, никогда не объединяются. Если выбран ключ раздела с высокой кардинальностью, то части, распределенные по тысячам разделов, никогда не будут кандидатами на слияние - превышая заранее настроенные лимиты и вызывая ужасную ошибку `Слишком много частей`. Решить эту проблему просто: выберите разумный ключ раздела с [кардинальностью менее 1000..10000](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121).

## Мониторинг разделов {#monitoring-partitions}

Вы можете [выполнить запрос](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results) на список всех существующих уникальных разделов нашей примерной таблицы, используя [виртуальный столбец](/engines/table-engines#table_engines-virtual_columns) `_partition_value`:

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

Альтернативно, ClickHouse отслеживает все части и разделы всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) для нашей примерной таблицы выше список всех разделов, плюс текущее количество активных частей и сумма строк в этих частях по разделу:

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

## Для чего используются разделы таблиц? {#what-are-table-partitions-used-for}

### Управление данными {#data-management}

В ClickHouse разделение в первую очередь является функцией управления данными. Организуя данные логически на основе выражения раздела, каждый раздел может управляться независимо. Например, схема разделения в приведенной выше примерной таблице позволяет сценариям, где только последние 12 месяцев данных сохраняются в основной таблице, автоматически удаляя старые данные с помощью [правила TTL](/guides/developer/ttl) (см. добавленную последнюю строку оператора DDL):

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
Так как таблица разделена по `toStartOfMonth(date)`, целые разделы (наборы [частей таблиц](/parts)), которые соответствуют условию TTL, будут удалены, что делает операцию очистки более эффективной, [без необходимости переписывать части](/sql-reference/statements/alter#mutations).

Аналогично, вместо удаления старых данных, их можно автоматически и эффективно перемещать на более доступный [уровень хранения](/integrations/s3#storage-tiers):

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

Разделы могут помочь с производительностью запросов, но это сильно зависит от шаблонов доступа. Если запросы нацелены только на несколько разделов (идеально - один), производительность может улучшиться. Это обычно полезно только в том случае, если ключ раздела не входит в первичный ключ и вы фильтруете по нему, как показано в примере запроса ниже.

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';

   ┌─highest_price─┐
1. │     296280000 │ -- 296.28 миллиона
   └───────────────┘

1 row in set. Затратили: 0.006 sec. Обработано 8.19 тысяч строк, 57.34 KB (1.36 миллиона строк/с., 9.49 MB/c.)
Пиковое использование памяти: 2.73 MiB.
```

Запрос выполняется над нашей примерной таблицей выше и [вычисляет](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) наивысшую цену всех проданных объектов недвижимости в Лондоне в декабре 2020 года, фильтруя как по столбцу (`date`), использованному в ключе раздела таблицы, так и по столбцу (`town`), использованному в первичном ключе таблицы (и `date` не является частью первичного ключа).

ClickHouse обрабатывает этот запрос, применяя последовательность методов обрезки, чтобы избежать оценки неуместных данных:

<Image img={partition_pruning} size="lg"  alt='ЧАСТИ СЛИЯНИЯ 2' />

<br/>

① **Обрезка по разделам**: [MinMax индексы](/partitions#what-are-table-partitions-in-clickhouse) используются для игнорирования целых разделов (наборов частей), которые логически не могут соответствовать фильтру запроса по столбцам, использованным в ключе раздела таблицы.

② **Обрезка гранул**: Для оставшихся частей данных после шага ① их [первичный индекс](/guides/best-practices/sparse-primary-indexes) используется для игнорирования всех [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), которые логически не могут соответствовать фильтру запроса по столбцам, использованным в первичном ключе таблицы.

Мы можем наблюдать эти шаги обрезки данных, [исследуя](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) физический план выполнения запроса для нашего примерного запроса выше через предложение [EXPLAIN](/sql-reference/statements/explain):

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

① Обрезка по разделам: Строки 7 по 18 вывода EXPLAIN выше показывают, что ClickHouse сначала использует [MinMax индекс](https://partitions#what-are-table-partitions-in-clickhouse) поля `date`, чтобы определить 11 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), хранящихся в 1 из 436 существующих активных частей данных, которые содержат строки, соответствующие фильтру `date` запроса.

② Обрезка гранул: Строки 19 по 24 вывода EXPLAIN выше указывают на то, что ClickHouse затем использует [первичный индекс](/guides/best-practices/sparse-primary-indexes) (созданный по полю `town`) части данных, определенной на шаге ①, чтобы дополнительно сократить количество гранул (содержат строки, которые также могут соответствовать фильтру запроса по полю `town`) с 11 до 1. Это также отражено в выводе ClickHouse-клиента, который мы напечатали чуть выше для выполненного запроса:

```response
... Затратили: 0.006 sec. Обработано 8.19 тысяч строк, 57.34 KB (1.36 миллиона строк/с., 9.49 MB/c.)
Пиковое использование памяти: 2.73 MiB.
```

Что означает, что ClickHouse отсканировал и обработал 1 гранулу (блок [8192](/operations/settings/merge-tree-settings#index_granularity) строк) за 6 миллисекунд для вычисления результата запроса.

### Разделение в первую очередь является функцией управления данными {#partitioning-is-primarily-a-data-management-feature}

Имейте в виду, что выполнение запросов через все разделы обычно медленнее, чем выполнение того же запроса на непартционированной таблице.

С разделением данные обычно распределяются по большему количеству частей данных, что часто приводит к тому, что ClickHouse сканирует и обрабатывает более объемные данные.

Мы можем продемонстрировать это, запустив один и тот же запрос как над таблицей [Что такое части таблиц](/parts) (без включенного разделения), так и над нашей текущей примерной таблицей выше (с включенным разделением). Обе таблицы [содержат](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results) одинаковые данные и количество строк:

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

Однако таблица с включенным разделением, [имеет](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) больше активных [частей данных](/parts), потому что, как было упомянуто выше, ClickHouse только [сливает](/parts) части данных внутри, но не между разделами:

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
Как показано выше, таблица с разделами `uk_price_paid_simple_partitioned` имеет 306 разделов, и, следовательно, по крайней мере 306 активных частей данных. В то время как для нашей непартционированной таблицы `uk_price_paid_simple` все [инициальные](/parts) части данных могут быть объединены в один активный раздел благодаря фоновой слиянии.

Когда мы [проверяем](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) физический план выполнения запроса с помощью предложения [EXPLAIN](/sql-reference/statements/explain) для нашего примерного запроса выше без фильтрации по разделу, выполняемого над таблицей с разделами, мы можем увидеть в строках 19 и 20 вывода ниже, что ClickHouse идентифицировал 671 из 3257 существующих [гранул](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing) (блоков строк), распределенных по 431 из 436 существующих активных частей данных, которые потенциально содержат строки, соответствующие фильтру запроса, и, следовательно, будут отсканированы и обработаны движком запросов:

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

Физический план выполнения запроса для того же примерного запроса, выполняемого над таблицей без разделов [показывает](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) в строках 11 и 12 вывода ниже, что ClickHouse идентифицировал 241 из 3083 существующих блоков строк внутри единой активной части данных таблицы, которые потенциально содержат строки, соответствующие фильтру запроса:

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

Для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса над разделенной версией таблицы ClickHouse сканирует и обрабатывает 671 блока строк (~ 5.5 миллионов строк) за 90 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 миллиона
   └───────────────┘

1 row in set. Затратили: 0.090 sec. Обработано 5.48 миллионов строк, 27.95 MB (60.66 миллиона строк/с., 309.51 MB/c.)
Пиковое использование памяти: 163.44 MiB.
```

В то время как для [выполнения](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) запроса над непартционированной таблицей ClickHouse сканирует и обрабатывает 241 блока (~ 2 миллиона строк) за 12 миллисекунд:

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

   ┌─highest_price─┐
1. │     594300000 │ -- 594.30 миллиона
   └───────────────┘

1 row in set. Затратили: 0.012 sec. Обработано 1.97 миллиона строк, 9.87 MB (162.23 миллиона строк/с., 811.17 MB/c.)
Пиковое использование памяти: 62.02 MiB.
```
