---
slug: /parts
title: 'Части таблицы'
description: 'Что такое части данных в ClickHouse'
keywords: ['part']
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';

## Что такое части таблицы в ClickHouse? {#what-are-table-parts-in-clickhouse}

<br/>

Данные из каждой таблицы в семействах [движков MergeTree](/engines/table-engines/mergetree-family) ClickHouse организованы на диске как коллекция неизменяемых `data parts`.

Для иллюстрации мы используем [эту](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU&run_query=true&tab=results) таблицу (адаптированную из [набора данных о ценах на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid)), отслеживающую дату, город, улицу и цену проданных объектов недвижимости в Великобритании:

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

Вы можете [запросить эту таблицу](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs&run_query=true&tab=results) на нашем SQL Playground ClickHouse.

Часть данных создается всякий раз, когда в таблицу вставляется набор строк. Следующая диаграмма иллюстрирует этот процесс:

<Image img={part} size="lg"/>

<br/>

Когда сервер ClickHouse обрабатывает пример вставки с 4 строками (например, с помощью [оператора INSERT INTO](/sql-reference/statements/insert-into)), показанного на диаграмме выше, выполняется несколько шагов:

① **Сортировка**: Строки сортируются по ключу сортировки таблицы `(town, street)`, и создается [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes) для отсортированных строк.

② **Разделение**: Отсортированные данные разбиваются на колонки.

③ **Сжатие**: Каждая колонка [сжимается](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema).

④ **Запись на диск**: Сжатые колонки сохраняются как двоичные файлы колонок в новой директории, представляющей часть данных вставки. Разреженный первичный индекс также сжимается и хранится в той же директории.

В зависимости от конкретного движка таблицы, дополнительно могут происходить другие преобразования [вместе](/operations/settings/settings) с сортировкой.

Части данных являются самодостаточными, включая все метаданные, необходимые для интерпретации их содержимого без необходимости в центральном каталоге. Кроме разреженного первичного индекса, части содержат дополнительные метаданные, такие как вторичные [индексы пропуска данных](/optimize/skipping-indexes), [статистика по колонкам](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), контрольные суммы, минимально-максимальные индексы (если используется [партиционирование](/partitions)) и [многое другое](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104).

## Слияние частей {#part-merges}

Чтобы управлять количеством частей в каждой таблице, работа [в фоне](/merges) периодически объединяет меньшие части в более крупные до тех пор, пока они не достигнут [настраиваемого](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) размера в сжатом виде (обычно ~150 ГБ). Слитые части помечаются как неактивные и удаляются после [настраиваемого](/operations/settings/merge-tree-settings#old_parts_lifetime) временного интервала. Со временем этот процесс создает иерархическую структуру слитых частей, именно поэтому таблицы называются MergeTree:

<Image img={merges} size="lg"/>

<br/>

Чтобы минимизировать количество начальных частей и накладные расходы на слияние, клиентам баз данных [рекомендуется](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) вставлять кортежи оптом, например, 20,000 строк сразу, или использовать [асинхронный режим вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), в котором ClickHouse буферизует строки из нескольких входящих INSERT в одну и ту же таблицу и создает новую часть только после того, как размер буфера превышает настраиваемый порог или истекает тайм-аут.

## Мониторинг частей таблицы {#monitoring-table-parts}

Вы можете [запросить](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw&run_query=true&tab=results) список всех активных частей нашей примерной таблицы, используя [виртуальную колонку](/engines/table-engines#table_engines-virtual_columns) `_part`:

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
Запрос выше извлекает имена директорий на диске, каждая из которых представляет активную часть данных таблицы. Компоненты этих имен директорий имеют специфические значения, которые задокументированы [здесь](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) для тех, кто заинтересован в дальнейшем изучении.

В качестве альтернативы, ClickHouse отслеживает информацию для всех частей всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7&run_query=true&tab=results) для нашей примерной таблицы список всех активных частей, их уровень слияния и количество строк, хранящихся в этих частях:

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
Уровень слияния увеличивается на один с каждым дополнительным слиянием части. Уровень 0 указывает на то, что это новая часть, которая еще не была слита.
