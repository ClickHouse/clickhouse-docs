---
description: 'Быстро находите поисковые термины в тексте.'
keywords: ['full-text search', 'text search', 'index', 'indices']
sidebar_label: 'Полнотекстовые индексы'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'Полнотекстовый поиск с использованием полнотекстовых индексов'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Полнотекстовый поиск с использованием полнотекстовых индексов

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Полнотекстовые индексы являются экспериментальным типом [вторичных индексов](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices), которые обеспечивают быстрые возможности текстового поиска для колонок [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md). Основная идея полнотекстового индекса заключается в хранении отображения от "терминов" к строкам, которые содержат эти термины. "Термины" - это токенизированные ячейки строковой колонки. Например, строковая ячейка "I will be a little late" по умолчанию токенизируется на шесть терминов: "I", "will", "be", "a", "little" и "late". Другой вид токенизатора - это n-граммы. Например, результат токенизации 3-граммами составит 21 термин: "I w", " wi", "wil", "ill", "ll ", "l b", " be" и т.д. Чем более мелко токенизированы входные строки, тем больше, но и более полезным будет полученный полнотекстовый индекс.

<div class='vimeo-container'>
  <iframe src="//www.youtube.com/embed/O_MnyUkrIq8"
    width="640"
    height="360"
    frameborder="0"
    allow="autoplay;
    fullscreen;
    picture-in-picture"
    allowfullscreen>
  </iframe>
</div>

:::note
Полнотекстовые индексы являются экспериментальными и не должны использоваться в производственных средах. Они могут измениться в будущем несоответствующим образом, например, в отношении их синтаксиса DDL/DQL или характеристик производительности/сжатия.
:::

## Использование {#usage}

Чтобы использовать полнотекстовые индексы, сначала включите их в конфигурации:

```sql
SET allow_experimental_full_text_index = true;
```

Полнотекстовый индекс можно определить на строковой колонке, используя следующий синтаксис:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX inv_idx(str) TYPE gin(0) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

где `N` задает токенизатор:

- `gin(0)` (или короче: `gin()`) устанавливает токенизатор на "tokens", т.е. разбивает строки по пробелам,
- `gin(N)` с `N` от 2 до 8 устанавливает токенизатор на "ngrams(N)"

Максимальное количество строк на один список публикаций можно указать как второй параметр. Этот параметр может использоваться для управления размерами списков публикаций, чтобы избежать генерации огромных файлов списков публикаций. Существуют следующие варианты:

- `gin(ngrams, max_rows_per_postings_list)`: Использовать данный max_rows_per_postings_list (при условии, что он не равен 0)
- `gin(ngrams, 0)`: Нет ограничения на максимальное количество строк на список публикаций
- `gin(ngrams)`: Использовать максимальное количество строк по умолчанию, равное 64K.

Будучи типом индекса пропуска, полнотекстовые индексы можно удалять или добавлять к колонке после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE gin(2);
```

Чтобы использовать индекс, не требуется специальных функций или синтаксиса. Типичные предикаты поиска строк автоматически используют индекс. В качестве примеров рассмотрим:

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

Полнотекстовый индекс также работает на колонках типа `Array(String)`, `Array(FixedString)`, `Map(String)` и `Map(String)`.

Как и для других вторичных индексов, каждая часть колонки имеет свой собственный полнотекстовый индекс. Кроме того, каждый полнотекстовый индекс внутренне делится на "сегменты". Существование и размер сегментов в целом прозрачны для пользователей, но размер сегмента определяет потребление памяти во время создания индекса (например, когда два компонента объединяются). Параметр конфигурации "max_digestion_size_per_segment" (по умолчанию: 256 МБ) контролирует количество данных, читаемых из основной колонки, прежде чем будет создан новый сегмент. Увеличение параметра повышает промежуточное потребление памяти для создания индекса, но также улучшает производительность поиска, поскольку в среднем требуется проверить меньше сегментов для оценки запроса.

## Полнотекстовый поиск по набору данных Hacker News {#full-text-search-of-the-hacker-news-dataset}

Давайте рассмотрим улучшение производительности полнотекстовых индексов на большом наборе данных с большим количеством текста. Мы используем 28.7M строк комментариев на популярном сайте Hacker News. Вот таблица без полнотекстового индекса:

```sql
CREATE TABLE hackernews (
    id UInt64,
    deleted UInt8,
    type String,
    author String,
    timestamp DateTime,
    comment String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    children Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);
```

28.7M строк находятся в файле Parquet в S3 - давайте вставим их в таблицу `hackernews`:

```sql
INSERT INTO hackernews
    SELECT * FROM s3Cluster(
        'default',
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        '
    id UInt64,
    deleted UInt8,
    type String,
    by String,
    time DateTime,
    text String,
    dead UInt8,
    parent UInt64,
    poll UInt64,
    kids Array(UInt32),
    url String,
    score UInt32,
    title String,
    parts Array(UInt32),
    descendants UInt32');
```

Рассмотрим следующий простой поиск термина `ClickHouse` (и его различные варианты с заглавными и строчными буквами) в колонке `comment`:

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

Обратите внимание, что выполнение запроса занимает 3 секунды:

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 3.001 sec. Processed 28.74 million rows, 9.75 GB (9.58 million rows/s., 3.25 GB/s.)
```

Мы добавим полнотекстовый индекс на строчные буквы колонки `comment`, затем материализуем его (это может занять некоторое время - подождите, пока он будет материализован):

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE gin;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

Мы повторяем тот же запрос...

```sql
SELECT count()
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

...и замечаем, что запрос выполняется в 4 раза быстрее:

```response
┌─count()─┐
│    1145 │
└─────────┘

1 row in set. Elapsed: 0.747 sec. Processed 4.49 million rows, 1.77 GB (6.01 million rows/s., 2.37 GB/s.)
```

Мы также можем искать один или все несколько терминов, т.е. дизъюнкции или конъюнкции:

```sql
-- несколько терминов с OR
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- несколько терминов с AND
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
В отличие от других вторичных индексов, полнотекстовые индексы (на данный момент) отображают номера строк (идентификаторы строк) вместо идентификаторов гранул. Причина этого дизайна заключается в производительности. На практике пользователи часто ищут несколько терминов одновременно. Например, предикат фильтрации `WHERE s LIKE '%little%' OR s LIKE '%big%'` может быть оценен напрямую с использованием полнотекстового индекса, формируя объединение списков идентификаторов строк для терминов "little" и "big". Это также означает, что параметр `GRANULARITY`, указанный при создании индекса, не имеет смысла (он может быть удален из синтаксиса в будущем).
:::

## Связанный контент {#related-content}

- Блог: [Введение в об inverted индексы в ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
