---
'title': 'Эффективность хранения - Данные временных рядов'
'sidebar_label': 'Эффективность хранения'
'description': 'Улучшение эффективности хранения данных временных рядов'
'slug': '/use-cases/time-series/storage-efficiency'
'keywords':
- 'time-series'
'show_related_blogs': true
'doc_type': 'guide'
---


# Эффективность хранения временных рядов

После изучения того, как запрашивать наш набор данных по статистике Википедии, давайте сосредоточимся на оптимизации его эффективности хранения в ClickHouse. 
В этом разделе представлены практические методы уменьшения требований к хранению при сохранении производительности запросов.

## Оптимизация типов {#time-series-type-optimization}

Общий подход к оптимизации эффективности хранения заключается в использовании оптимальных типов данных. 
Возьмем колонки `project` и `subproject`. Эти колонки имеют тип String, но имеют относительно небольшое количество уникальных значений:

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

Это означает, что мы можем использовать тип данных LowCardinality(), который использует кодирование на основе словаря. Это позволяет ClickHouse хранить внутренний идентификатор значения вместо оригинального строкового значения, что, в свою очередь, экономит много места:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `project` LowCardinality(String),
MODIFY COLUMN `subproject` LowCardinality(String)
```

Мы также использовали тип UInt64 для колонки hits, который занимает 8 байт, но имеет относительно небольшое максимальное значение:

```sql
SELECT max(hits)
FROM wikistat;
```

```text
┌─max(hits)─┐
│    449017 │
└───────────┘
```

Учитывая это значение, мы можем использовать вместо этого тип UInt32, который занимает всего 4 байта и позволяет нам хранить до ~4b в качестве максимального значения:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `hits` UInt32;
```

Это уменьшит размер этой колонки в памяти как минимум в 2 раза. Обратите внимание, что размер на диске останется неизменным из-за сжатия. Но будьте осторожны, выбирайте типы данных, которые не слишком малы!

## Специализированные кодеки {#time-series-specialized-codecs}

Когда мы работаем с последовательными данными, такими как временные ряды, мы можем дополнительно улучшить эффективность хранения, используя специальные кодеки. 
Общая идея состоит в том, чтобы хранить изменения между значениями вместо самих абсолютных значений, что приводит к гораздо меньшему объему необходимого места при работе с медленно изменяющимися данными:

```sql
ALTER TABLE wikistat
MODIFY COLUMN `time` CODEC(Delta, ZSTD);
```

Мы использовали кодек Delta для колонки времени, который хорошо подходит для данных временных рядов. 

Правильный ключ сортировки также может сэкономить место на диске. 
Поскольку мы обычно хотим фильтровать по пути, мы добавим `path` в ключ сортировки.
Это потребует пересоздания таблицы. 

Ниже мы можем увидеть команду `CREATE` для нашей начальной таблицы и оптимизированной таблицы:

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
