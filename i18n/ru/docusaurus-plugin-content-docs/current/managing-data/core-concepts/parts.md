---
slug: /parts
title: Части таблицы
description: Что такое части данных в ClickHouse
keywords: [part]
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';

## Что такое части таблицы в ClickHouse? {#what-are-table-parts-in-clickhouse}

<br/>

Данные из каждой таблицы в семье [движков MergeTree](/engines/table-engines/mergetree-family) хранятся на диске в виде коллекции неизменяемых `data parts`.

Чтобы проиллюстрировать это, мы используем [эту](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) таблицу (адаптированную из [набора данных о ценах на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid)), отслеживающую дату, город, улицу и цену проданных объектов недвижимости в Великобритании:

```sql
CREATE TABLE uk.uk_price_paid_simple
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street);
```

Вы можете [выполнить запрос к этой таблице](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results) в нашем SQL Playground ClickHouse.

Часть данных создается каждый раз, когда набор строк вставляется в таблицу. Следующая схема иллюстрирует это:

<img src={part} alt='INSERT PROCESSING' class='image' />
<br/>

Когда сервер ClickHouse обрабатывает пример вставки с 4 строками (например, через [оператор INSERT INTO](/sql-reference/statements/insert-into)), описанный на схеме выше, он выполняет несколько шагов:

① **Сортировка**: Строки сортируются по ключу сортировки таблицы `(town, street)`, и для отсортированных строк генерируется [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes).

② **Разбиение**: Отсортированные данные разделяются на колонки.

③ **Сжатие**: Каждая колонка [сжимается](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema).

④ **Запись на диск**: Сжатые колонки сохраняются как бинарные файлы колонок в новой директории, представляющей часть данных вставки. Разреженный первичный индекс также сжимается и хранится в той же директории.

В зависимости от конкретного движка таблицы могут происходить дополнительные преобразования [возможно](/operations/settings/settings) параллельно со сортировкой.

Части данных являются самодостаточными, включая всю метаинформацию, необходимую для интерпретации их содержимого без необходимости в центральном каталоге. Помимо разреженного первичного индекса, части содержат дополнительную метаинформацию, такую как вторичные [индексы пропуска данных](/optimize/skipping-indexes), [статистика колонок](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), контрольные суммы, минимально-максимальные индексы (если используется [партиционирование](/partitions)) и [другие](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104).

## Слияние частей {#part-merges}

Чтобы управлять количеством частей для таблицы, периодически выполняется [фоновая задача слияния](/merges), которая объединяет меньшие части в большие, пока они не достигнут [настраиваемого](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) размера после сжатия (обычно ~150 ГБ). Слитые части помечаются как неактивные и удаляются после [настраиваемого](/operations/settings/merge-tree-settings#old-parts-lifetime) временного интервала. Со временем этот процесс создает иерархическую структуру слитых частей, благодаря чему таблица называется MergeTree:

<img src={merges} alt='PART MERGES' class='image' />
<br/>

Чтобы минимизировать количество первоначальных частей и накладные расходы на слияние, клиентам баз данных [рекомендуется](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) вставлять кортежи в пакетах, например, по 20,000 строк за один раз, или использовать [асинхронный режим вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), в котором ClickHouse буферизует строки из нескольких входящих INSERT в одну и ту же таблицу и создает новую часть только после превышения размера буфера заданного порога или истечения времени ожидания.

## Мониторинг частей таблицы {#monitoring-table-parts}

Вы можете [выполнить запрос](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) на список всех существующих активных частей нашей примерной таблицы, используя [виртуальную колонку](/engines/table-engines#table_engines-virtual_columns) `_part`:

```sql
SELECT _part
FROM uk.uk_price_paid_simple
GROUP BY _part
ORDER BY _part ASC;

   ┌─_part───────┐
1. │ all_0_5_1   │
2. │ all_12_17_1 │
3. │ all_18_23_1 │
4. │ all_6_11_1  │
   └─────────────┘
```
Запрос выше извлекает имена директорий на диске, каждая из которых представляет активную часть данных таблицы. Компоненты этих имен директорий имеют конкретные значения, которые документированы [здесь](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) для тех, кто хочет исследовать дальше.

Либо ClickHouse отслеживает информацию для всех частей всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) для нашей примерной таблицы список всех текущих активных частей, их уровень слияния и количество строк, хранящихся в этих частях:

```sql
SELECT
    name,
    level,
    rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple') AND active
ORDER BY name ASC;


   ┌─name────────┬─level─┬────rows─┐
1. │ all_0_5_1   │     1 │ 6368414 │
2. │ all_12_17_1 │     1 │ 6442494 │
3. │ all_18_23_1 │     1 │ 5977762 │
4. │ all_6_11_1  │     1 │ 6459763 │
   └─────────────┴───────┴─────────┘
```
Уровень слияния увеличивается на единицу с каждым дополнительным слиянием части. Уровень 0 указывает на то, что это новая часть, которая еще не была слита.
