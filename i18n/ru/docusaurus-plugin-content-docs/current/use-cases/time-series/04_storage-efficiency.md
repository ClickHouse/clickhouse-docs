---
title: 'Эффективность хранения — временные ряды'
sidebar_label: 'Эффективность хранения'
description: 'Повышение эффективности хранения данных временных рядов'
slug: /use-cases/time-series/storage-efficiency
keywords: ['временные ряды', 'эффективность хранения', 'сжатие', 'хранение данных', 'TTL', 'оптимизация хранения', 'использование диска']
show_related_blogs: true
doc_type: 'guide'
---

# Эффективность хранения временных рядов \\{#time-series-storage-efficiency\\}

Разобравшись, как выполнять запросы к нашему набору данных со статистикой Wikipedia, сосредоточимся на оптимизации эффективности его хранения в ClickHouse.
В этом разделе рассматриваются практические методы снижения требований к хранилищу при сохранении производительности запросов.

## Оптимизация типов \\{#time-series-type-optimization\\}

Общий подход к оптимизации эффективности хранения заключается в использовании наиболее подходящих типов данных.
Возьмём столбцы `project` и `subproject`. Эти столбцы имеют тип String, но содержат относительно небольшое количество уникальных значений:

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

Это означает, что мы можем использовать тип данных LowCardinality(), который применяет кодирование на основе словаря. В результате ClickHouse хранит внутренний идентификатор значения вместо исходного строкового значения, что, в свою очередь, существенно экономит место:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

Мы также использовали тип UInt64 для столбца `hits`, который занимает 8 байт, но обладает относительно небольшим максимально допустимым значением:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

С учетом этого значения мы можем использовать тип UInt32, который занимает всего 4 байта и позволяет хранить значения до примерно 4 млрд в качестве максимального:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

Это уменьшит размер этого столбца в памяти как минимум вдвое. Обратите внимание, что размер на диске останется неизменным из-за сжатия. Но будьте осторожны: не выбирайте слишком маленькие типы данных!

## Специализированные кодеки \\{#time-series-specialized-codecs\\}

При работе с последовательными данными, например временными рядами, мы можем дополнительно повысить эффективность хранения, используя специальные кодеки.
Общая идея заключается в том, чтобы хранить изменения между значениями вместо самих абсолютных значений, что позволяет существенно сократить объём занимаемого места при работе с медленно изменяющимися данными:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

Мы использовали кодек Delta для столбца `time`, который хорошо подходит для данных временных рядов.

Правильный ключ сортировки также может сэкономить место на диске.
Поскольку мы обычно фильтруем по пути, добавим столбец `path` в ключ сортировки.
Для этого таблицу нужно пересоздать.

Ниже приведена команда `CREATE` для нашей исходной и оптимизированной таблиц:

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

Посмотрим, сколько места занимают данные в каждой таблице:

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

Оптимизированная таблица в сжатом виде занимает чуть более чем в четыре раза меньше места.
