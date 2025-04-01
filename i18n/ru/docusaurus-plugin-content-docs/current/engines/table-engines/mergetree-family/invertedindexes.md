---
description: 'Быстро находить поисковые термины в тексте.'
keywords: ['полнотекстовый поиск', 'поиск по тексту', 'индекс', 'индексы']
sidebar_label: 'Полнотекстовые индексы'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'Полнотекстовый поиск с использованием полнотекстовых индексов'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Полнотекстовый поиск с использованием полнотекстовых индексов

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Полнотекстовые индексы - это экспериментальный тип [вторичных индексов](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices), который предоставляет быстрые возможности текстового поиска для колонок [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md). Основная идея полнотекстового индекса заключается в хранении соответствия от "терминов" к строкам, которые содержат эти термины. "Термины" представляют собой токенизированные ячейки строковой колонки. Например, ячейка строки "Я немного опоздаю" по умолчанию токенизируется на шесть терминов: "Я", "немного", "опоздаю". Другой вид токенизатора - это n-граммы. Например, результат токенизации 3-граммами будет 21 термин "Я н", " нем", "нем", "ем", "м ", " о", " оп", " оп", "поз", "оза", "заю" и т.д. Чем более детализированно токенизируются входные строки, тем больше, но и более полезным будет полученный полнотекстовый индекс.

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
Полнотекстовые индексы являются экспериментальными и пока не должны использоваться в производственных средах. В будущем они могут изменяться обратно несовместимыми способами, например, в отношении их синтаксиса DDL/DQL или характеристик производительности/сжатия.
:::

## Использование {#usage}

Чтобы использовать полнотекстовые индексы, сначала активируйте их в конфигурации:

```sql
SET allow_experimental_full_text_index = true;
```

Полнотекстовый индекс можно определить на строковой колонке, используя следующий синтаксис:

```sql
CREATE TABLE tab
(
    `key` UInt64,
    `str` String,
    INDEX inv_idx(str) TYPE full_text(0) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

:::note
В предыдущих версиях ClickHouse соответствующее название типа индекса было `inverted`.
:::

где `N` указывает токенизатор:

- `full_text(0)` (или сокращенно: `full_text()`) устанавливает токенизатор на "токены", т.е. разбивает строки по пробелам,
- `full_text(N)` с `N` от 2 до 8 устанавливает токенизатор на "ngrams(N)".

Максимальное количество строк в списке публикаций может быть указано в качестве второго параметра. Этот параметр может быть использован для контроля размеров списков публикаций, чтобы избежать генерации огромных файлов списков публикаций. Существуют следующие варианты:

- `full_text(ngrams, max_rows_per_postings_list)`: использовать указанный max_rows_per_postings_list (при условии, что он не равен 0)
- `full_text(ngrams, 0)`: без ограничения максимального количества строк в списке публикаций
- `full_text(ngrams)`: использовать максимальное количество строк по умолчанию, которое составляет 64K.

Будучи типом индекса, который пропускает данные, полнотекстовые индексы могут быть удалены или добавлены в колонку после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE full_text(2);
```

Для использования индекса не требуется никаких специальных функций или синтаксиса. Типичные предикаты строкового поиска автоматически используют индекс. В качестве примеров рассмотрим:

```sql
INSERT INTO tab(key, str) values (1, 'Привет, мир');
SELECT * from tab WHERE str == 'Привет, мир';
SELECT * from tab WHERE str IN ('Привет', 'мир');
SELECT * from tab WHERE str LIKE '%Привет%';
SELECT * from tab WHERE multiSearchAny(str, ['Привет', 'мир']);
SELECT * from tab WHERE hasToken(str, 'Привет');
```

Полнотекстовый индекс также работает с колонками типа `Array(String)`, `Array(FixedString)`, `Map(String)` и `Map(String)`.

Как и для других вторичных индексов, каждая часть колонки имеет свой собственный полнотекстовый индекс. Более того, каждый полнотекстовый индекс внутренне делится на "сегменты". Наличие и размер сегментов, как правило, являются прозрачными для пользователей, но размер сегмента определяет потребление памяти во время создания индекса (например, когда два блока сливаются). Параметр конфигурации "max_digestion_size_per_segment" (по умолчанию: 256 МБ) контролирует объем данных, считываемых из подлежащей колонки перед созданием нового сегмента. Увеличение параметра увеличивает промежуточное потребление памяти для создания индекса, но также улучшает производительность поиска, поскольку в среднем нужно проверять меньше сегментов для оценки запроса.

## Полнотекстовый поиск в наборе данных Hacker News {#full-text-search-of-the-hacker-news-dataset}

Давайте рассмотрим улучшения производительности полнотекстовых индексов на большом наборе данных с большим объемом текста. Мы будем использовать 28.7M строк комментариев на популярном сайте Hacker News. Вот таблица без полнотекстового индекса:

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

Мы используем `ALTER TABLE` и добавляем полнотекстовый индекс на строчном варианте колонки `comment`, затем материализуем его (это может занять некоторое время - подождите, пока он будет материализован):

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE full_text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

Мы выполняем тот же запрос...

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

Мы также можем искать один или все из нескольких терминов, т.е. дизъюнкции или конъюнкции:

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
В отличие от других вторичных индексов, полнотекстовые индексы (пока) отображаются на номера строк (идентификаторы строк), а не на идентификаторы гранул. Причина такого дизайна заключается в производительности. На практике пользователи часто ищут несколько терминов одновременно. Например, предикат фильтра `WHERE s LIKE '%little%' OR s LIKE '%big%'` может быть оценен напрямую с использованием полнотекстового индекса путем формирования объединения списков идентификаторов строк для терминов "little" и "big". Это также означает, что параметр `GRANULARITY`, предоставляемый для создания индекса, не имеет значения (в будущем он может быть исключен из синтаксиса).
:::

## Связанный контент {#related-content}

- Блог: [Введение в инвертированные индексы в ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
