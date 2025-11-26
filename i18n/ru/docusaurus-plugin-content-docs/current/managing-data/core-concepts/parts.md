---
slug: /parts
title: 'Части таблицы'
description: 'Что такое части данных в ClickHouse'
keywords: ['part']
doc_type: 'reference'
---

import merges from '@site/static/images/managing-data/core-concepts/merges.png';
import part from '@site/static/images/managing-data/core-concepts/part.png';
import Image from '@theme/IdealImage';


## Что такое части таблицы в ClickHouse?

<br />

Данные каждой таблицы в семействе движков таблиц ClickHouse [MergeTree](/engines/table-engines/mergetree-family) организованы на диске как набор неизменяемых частей данных (`data parts`).

Чтобы проиллюстрировать это, мы используем [эту](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGU\&run_query=true\&tab=results) таблицу (адаптированную из [набора данных о ценах на недвижимость в Великобритании](/getting-started/example-datasets/uk-price-paid)), в которой фиксируются дата, город, улица и цена по проданным объектам недвижимости в Соединенном Королевстве:

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

Вы можете [выполнить запрос к этой таблице](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZTs\&run_query=true\&tab=results) в нашем ClickHouse SQL Playground.

Часть (data part) создаётся каждый раз, когда в таблицу вставляется набор строк. Следующая диаграмма иллюстрирует это:

<Image img={part} size="lg" />

<br />

Когда сервер ClickHouse обрабатывает пример вставки с 4 строками (например, через [оператор INSERT INTO](/sql-reference/statements/insert-into)), показанный на диаграмме выше, он выполняет несколько шагов:

① **Сортировка**: Строки сортируются по ^^ключу сортировки^^ таблицы `(town, street)`, а для отсортированных строк генерируется [разреженный первичный индекс](/guides/best-practices/sparse-primary-indexes).

② **Разделение**: Отсортированные данные разделяются на столбцы.

③ **Сжатие**: Каждый столбец [сжимается](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema).

④ **Запись на диск**: Сжатые столбцы сохраняются как двоичные файлы столбцов в новом каталоге, представляющем часть данных вставки. Разреженный первичный индекс также сжимается и сохраняется в том же каталоге.

В зависимости от конкретного движка таблицы дополнительные преобразования [могут](/operations/settings/settings) выполняться вместе с сортировкой.

Части ^^данных^^ являются самодостаточными и включают все метаданные, необходимые для интерпретации их содержимого без обращения к центральному каталогу. Помимо разреженного первичного индекса, ^^части^^ содержат дополнительные метаданные, такие как вторичные [индексы пропуска данных](/optimize/skipping-indexes), [статистика столбцов](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere), контрольные суммы, min-max индексы (если используется [partitioning](/partitions)) и [другое](https://github.com/ClickHouse/ClickHouse/blob/a065b11d591f22b5dd50cb6224fab2ca557b4989/src/Storages/MergeTree/MergeTreeData.h#L104).


## Слияния частей {#part-merges}

Чтобы управлять числом ^^parts^^ в таблице, фоновый процесс [background merge](/merges) периодически объединяет меньшие ^^parts^^ в более крупные до тех пор, пока они не достигнут [настраиваемого](/operations/settings/merge-tree-settings#max_bytes_to_merge_at_max_space_in_pool) сжатого размера (обычно около 150 ГБ). Слитые ^^parts^^ помечаются как неактивные и удаляются по истечении [настраиваемого](/operations/settings/merge-tree-settings#old_parts_lifetime) временного интервала. Со временем этот процесс создаёт иерархическую структуру слитых ^^parts^^, поэтому таблица и называется ^^MergeTree^^:

<Image img={merges} size="lg" />

<br />

Чтобы минимизировать количество исходных ^^parts^^ и накладные расходы на слияния, клиентским приложениям базы данных [рекомендуется](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) либо выполнять пакетные вставки данных, например по 20 000 строк за раз, либо использовать [режим асинхронной вставки](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse), при котором ClickHouse буферизует строки из нескольких входящих операторов INSERT в одну и ту же таблицу и создаёт новую ^^part^^ только после того, как размер буфера превысит настраиваемый порог или истечёт таймаут.



## Мониторинг частей таблицы

Вы можете [выполнить запрос](https://sql.clickhouse.com/?query=U0VMRUNUIF9wYXJ0CkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKR1JPVVAgQlkgX3BhcnQKT1JERVIgQlkgX3BhcnQgQVNDOw\&run_query=true\&tab=results), чтобы получить список всех существующих в данный момент активных ^^частей^^ нашей таблицы-примера, используя [виртуальный столбец](/engines/table-engines#table_engines-virtual_columns) `_part`:

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

Приведённый выше запрос извлекает имена каталогов на диске; каждый каталог соответствует активной части данных таблицы. Компоненты этих имён каталогов имеют определённые значения, которые описаны [здесь](https://github.com/ClickHouse/ClickHouse/blob/f90551824bb90ade2d8a1d8edd7b0a3c0a459617/src/Storages/MergeTree/MergeTreeData.h#L130) для тех, кто заинтересован в более подробном изучении.

Кроме того, ClickHouse ведёт учёт информации обо всех ^^частях^^ всех таблиц в системной таблице [system.parts](/operations/system-tables/parts), и следующий запрос для нашей таблицы из примера выше [возвращает](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBuYW1lLAogICAgbGV2ZWwsCiAgICByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCA9ICd1a19wcmljZV9wYWlkX3NpbXBsZScpIEFORCBhY3RpdmUKT1JERVIgQlkgbmFtZSBBU0M7\&run_query=true\&tab=results) список всех текущих активных ^^частей^^, их уровень слияния и количество строк, хранящихся в этих ^^частях^^:

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

Уровень слияния увеличивается на единицу при каждом дополнительном слиянии этой части. Уровень 0 означает, что это новая часть, которая ещё ни разу не сливалась.
