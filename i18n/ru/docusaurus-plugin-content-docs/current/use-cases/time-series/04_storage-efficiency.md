---
title: 'Эффективность хранения — временные ряды'
sidebar_label: 'Эффективность хранения'
description: 'Повышение эффективности хранения временных рядов'
slug: /use-cases/time-series/storage-efficiency
keywords: ['time-series', 'storage efficiency', 'compression', 'data retention', 'TTL', 'storage optimization', 'disk usage']
show_related_blogs: true
doc_type: 'guide'
---



# Эффективность хранения временных рядов

После того как мы рассмотрели, как выполнять запросы к нашему набору данных со статистикой Wikipedia, давайте сосредоточимся на оптимизации эффективности его хранения в ClickHouse.
В этом разделе демонстрируются практические методы снижения требований к хранилищу при сохранении производительности запросов.



## Оптимизация типов данных {#time-series-type-optimization}

Общий подход к оптимизации эффективности хранения данных заключается в использовании оптимальных типов данных.
Рассмотрим столбцы `project` и `subproject`. Эти столбцы имеют тип String, но содержат относительно небольшое количество уникальных значений:

```sql
SELECT
    uniq(project),
    uniq(subproject)
FROM wikistat;
```

```text
┌─uniq(project)─┬─uniq(subproject)─┐
│          1332 │              130 │
└───────────────┴──────────────────┘
```

Это означает, что мы можем использовать тип данных LowCardinality(), который использует словарное кодирование. В результате ClickHouse сохраняет внутренний идентификатор значения вместо исходного строкового значения, что позволяет существенно сэкономить место:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

Мы также использовали тип UInt64 для столбца `hits`, который занимает 8 байт, но имеет относительно небольшое максимальное значение:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

Учитывая это значение, мы можем использовать вместо него UInt32, который занимает всего 4 байта и позволяет хранить значения до ~4 млрд:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

Это уменьшит размер данного столбца в памяти как минимум в два раза. Обратите внимание, что размер на диске останется неизменным благодаря сжатию. Однако будьте внимательны: не выбирайте слишком малые типы данных!


## Специализированные кодеки {#time-series-specialized-codecs}

При работе с последовательными данными, такими как временные ряды, можно дополнительно повысить эффективность хранения, используя специальные кодеки.
Общая идея заключается в хранении изменений между значениями вместо самих абсолютных значений, что приводит к значительному сокращению требуемого пространства при работе с медленно изменяющимися данными:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

Мы использовали кодек Delta для столбца `time`, который хорошо подходит для данных временных рядов.

Правильный ключ сортировки также может сэкономить дисковое пространство.
Поскольку обычно требуется фильтрация по пути, мы добавим `path` в ключ сортировки.
Для этого необходимо пересоздать таблицу.

Ниже приведена команда `CREATE` для исходной таблицы и оптимизированной таблицы:

```sql
CREATE TABLE wikistat
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (time);
```

```sql
CREATE TABLE optimized_wikistat
(
    `time` DateTime CODEC(Delta(4), ZSTD(1)),
    `project` LowCardinality(String),
    `subproject` LowCardinality(String),
    `path` String,
    `hits` UInt32
)
ENGINE = MergeTree
ORDER BY (path, time);
```

Теперь посмотрим на объём пространства, занимаемого данными в каждой таблице:

```sql
SELECT
    table,
    formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed,
    formatReadableSize(sum(data_compressed_bytes)) AS compressed,
    count() AS parts
FROM system.parts
WHERE table LIKE '%wikistat%'
GROUP BY ALL;
```

```text
┌─table──────────────┬─uncompressed─┬─compressed─┬─parts─┐
│ wikistat           │ 35.28 GiB    │ 12.03 GiB  │     1 │
│ optimized_wikistat │ 30.31 GiB    │ 2.84 GiB   │     1 │
└────────────────────┴──────────────┴────────────┴───────┘
```

Оптимизированная таблица занимает чуть более чем в 4 раза меньше места в сжатом виде.
