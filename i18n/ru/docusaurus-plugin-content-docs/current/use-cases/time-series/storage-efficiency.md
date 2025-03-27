---
title: 'Эффективность хранения - Временные ряды'
sidebar_label: 'Эффективность хранения'
description: 'Улучшение эффективности хранения временных рядов'
slug: /use-cases/time-series/storage-efficiency
keywords: ['временные ряды']
---


# Эффективность хранения временных рядов

После изучения того, как запрашивать набор данных статистики Википедии, давайте сосредоточимся на оптимизации его эффективности хранения в ClickHouse. 
В этом разделе представлены практические методы сокращения требований к хранению при сохранении производительности запросов.

## Оптимизация типов {#time-series-type-optimization}

Общий подход к оптимизации эффективности хранения заключается в использовании оптимальных типов данных. 
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

Это значит, что мы можем использовать тип данных LowCardinality(), который использует кодирование на основе словаря. Это позволяет ClickHouse хранить внутренний идентификатор значения вместо оригинального строкового значения, что в свою очередь экономит много места:


```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

Мы также использовали тип UInt64 для столбца hits, который занимает 8 байт, но имеет относительно небольшое максимальное значение:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

Учитывая это значение, мы можем вместо этого использовать UInt32, который занимает всего 4 байта и позволяет хранить максимальное значение до ~4b:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

Это уменьшит размер этого столбца в памяти как минимум в 2 раза. Обратите внимание, что размер на диске останется неизменным из-за сжатия. Но будьте осторожны, выбирайте типы данных, которые не слишком малы!

## Специальные кодеки {#time-series-specialized-codecs}

Когда мы имеем дело с последовательными данными, такими как временные ряды, мы можем дополнительно улучшить эффективность хранения, используя специальные кодеки. 
Общая идея заключается в том, чтобы хранить изменения между значениями вместо самих абсолютных значений, что значительно экономит место при работе с медленно изменяющимися данными:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

Мы использовали кодек Delta для столбца времени, который хорошо подходит для данных временных рядов.

Правильный ключ сортировки также может сэкономить место на диске. 
Поскольку мы обычно хотим фильтровать по пути, мы добавим `path` в ключ сортировки.
Для этого необходимо пересоздать таблицу. 

Ниже мы можем увидеть команду `CREATE` для нашей исходной таблицы и оптимизированной таблицы:

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

И давайте взглянем на объем занимаемого пространства данными в каждой таблице:

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

Оптимизированная таблица занимает более чем в 4 раза меньше места в сжатом виде.
