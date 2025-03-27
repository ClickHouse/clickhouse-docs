---
description: 'Быстро находите поисковые термины в тексте.'
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

Полнотекстовые индексы — это экспериментальный тип [вторичных индексов](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices), которые обеспечивают быстрые возможности поиска по тексту для [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md) столбцов. Основная идея полнотекстового индекса заключается в том, чтобы хранить отображение от "терминов" к строкам, которые содержат эти термины. "Термины" — это токенизированные ячейки строкового столбца. Например, строковая ячейка "Я немного опоздаю" по умолчанию токенизируется на шесть терминов "Я", "немного", "опоздаю". Другой вид токенизатора — n-grams. Например, результат токенизации 3-граммами будет 21 термин "Я н", " н", "не", "е", "ем", "м ", " о", "о п", " п", "по", "о ", "н", "н", " н", "н", "н", "н". Чем более тонко токенизируются входные строки, тем больше, но также и более полезный будет результативный полнотекстовый индекс.

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
Полнотекстовые индексы являются экспериментальными и не должны использоваться в производственных средах. Они могут измениться в будущем с несовместимыми изменениями, например, в отношении их синтаксиса DDL/DQL или характеристик производительности/сжатия.
:::

## Использование {#usage}

Чтобы использовать полнотекстовые индексы, сначала включите их в конфигурации:

```sql
SET allow_experimental_full_text_index = true;
```

Полнотекстовый индекс может быть определен для строкового столбца с использованием следующего синтаксиса:

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
В более ранних версиях ClickHouse соответствующее название типа индекса было `inverted`.
:::

где `N` указывает на токенизатор:

- `full_text(0)` (или короче: `full_text()`) устанавливает токенизатор на "токены", т.е. разбивает строки по пробелам,
- `full_text(N)` с `N` от 2 до 8 устанавливает токенизатор на "ngrams(N)"

Максимальное количество строк в списке публикаций можно указать как второй параметр. Этот параметр может быть использован для контроля размеров списков публикаций, чтобы избежать создания огромных файлов списков публикаций. Существуют следующие варианты:

- `full_text(ngrams, max_rows_per_postings_list)`: Используйте данный max_rows_per_postings_list (при условии, что он не равен 0)
- `full_text(ngrams, 0)`: Без ограничения максимального числа строк в списке публикаций
- `full_text(ngrams)`: Используйте значение по умолчанию, максимальное количество строк, которое равно 64K.

Будучи типом пропуска индекса, полнотекстовые индексы могут быть удалены или добавлены к столбцу после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE full_text(2);
```

Чтобы использовать индекс, не требуются специальные функции или синтаксис. Типичные предикаты поиска строк автоматически используют индекс. В качестве примеров рассмотрим:

```sql
INSERT INTO tab(key, str) values (1, 'Привет, мир');
SELECT * from tab WHERE str == 'Привет, мир';
SELECT * from tab WHERE str IN ('Привет', 'мир');
SELECT * from tab WHERE str LIKE '%Привет%';
SELECT * from tab WHERE multiSearchAny(str, ['Привет', 'мир']);
SELECT * from tab WHERE hasToken(str, 'Привет');
```

Полнотекстовый индекс также работает со столбцами типа `Array(String)`, `Array(FixedString)`, `Map(String)` и `Map(String)`.

Как и для других вторичных индексов, каждая часть столбца имеет свой собственный полнотекстовый индекс. Более того, каждый полнотекстовый индекс внутренне делится на "сегменты". Наличие и размер сегментов обычно не прозрачны для пользователей, но размер сегмента определяет потребление памяти во время создания индекса (например, когда сливаются две части). Параметр конфигурации "max_digestion_size_per_segment" (по умолчанию: 256 МБ) контролирует количество прочитанных данных из основного столбца перед созданием нового сегмента. Увеличение этого параметра повышает промежуточное потребление памяти при создании индекса, но также улучшает производительность поиска, поскольку в среднем необходимо проверять меньшее количество сегментов для выполнения запроса.

## Полнотекстовый поиск по набору данных Hacker News {#full-text-search-of-the-hacker-news-dataset}

Давайте рассмотрим улучшения производительности полнотекстовых индексов на большом наборе данных с множеством текста. Мы будем использовать 28,7 млн строк комментариев на популярном сайте Hacker News. Вот таблица без полнотекстового индекса:

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

28,7 млн строк находятся в файле Parquet в S3 — давайте вставим их в таблицу `hackernews`:

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

Рассмотрим следующий простой поиск термина `ClickHouse` (и его различные варианты верхнего и нижнего регистра) в столбце `comment`:

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

Мы используем `ALTER TABLE` и добавляем полнотекстовый индекс на строчные буквы столбца `comment`, затем материализуем его (что может занять некоторое время — подождите, пока он не материализуется):

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
В отличие от других вторичных индексов, полнотекстовые индексы (пока) отображаются на номера строк (ID строк), а не на ID гранул. Причина этой разработки — производительность. На практике пользователи часто ищут несколько терминов одновременно. Например, предикат фильтрации `WHERE s LIKE '%little%' OR s LIKE '%big%'` может быть оценен напрямую, используя полнотекстовый индекс, формируя объединение списков ID строк для терминов "little" и "big". Это также означает, что параметр `GRANULARITY`, указанный при создании индекса, не имеет значения (он может быть удален из синтаксиса в будущем).
:::

## Связанный контент {#related-content}

- Блог: [Введение в инвертированные индексы в ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
