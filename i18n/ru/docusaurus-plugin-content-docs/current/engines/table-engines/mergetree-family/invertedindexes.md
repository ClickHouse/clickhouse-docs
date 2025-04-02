---
description: 'Быстро находите поисковые термины в тексте.'
keywords: ['полнотекстовый поиск', 'поиск текста', 'индекс', 'индексы']
sidebar_label: 'Полнотекстовые индексы'
slug: /engines/table-engines/mergetree-family/invertedindexes
title: 'Полнотекстовый поиск с использованием полнотекстовых индексов'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Полнотекстовый поиск с использованием полнотекстовых индексов

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

Полнотекстовые индексы — это экспериментальный тип [вторичных индексов](/engines/table-engines/mergetree-family/mergetree.md/#available-types-of-indices), который обеспечивает быстрые возможности текстового поиска для колонок [String](/sql-reference/data-types/string.md) или [FixedString](/sql-reference/data-types/fixedstring.md). Основная идея полнотекстового индекса заключается в том, чтобы хранить отображение от "терминов" к строкам, которые содержат эти термины. "Термины" — это токенизированные ячейки строковой колонки. Например, строковая ячейка "I will be a little late" по умолчанию токенизируется на шесть терминов: "I", "will", "be", "a", "little" и "late". Другой тип токенизатора — n-grams. Например, результат токенизации 3-граммы будет 21 термин: "I w", " wi", "wil", "ill", "ll ", "l b", " be" и т.д. Чем более тонко токенизируются входные строки, тем больше, но также и более полезным будет полученный полнотекстовый индекс.

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
Полнотекстовые индексы являются экспериментальными и пока не должны использоваться в производственных средах. Они могут измениться в будущем с обратной несовместимостью, например, в отношении их синтаксиса DDL/DQL или характеристик производительности/сжатия.
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
    INDEX inv_idx(str) TYPE full_text(0) GRANULARITY 1
)
ENGINE = MergeTree
ORDER BY key
```

:::note
В предыдущих версиях ClickHouse соответствующее имя типа индекса было `inverted`.
:::

где `N` задает токенизатор:

- `full_text(0)` (или короче: `full_text()`) устанавливает токенизатор на "токены", т.е. разбивает строки по пробелам,
- `full_text(N)` с `N` от 2 до 8 устанавливает токенизатор на "ngrams(N)"

Максимальное количество строк на список публикаций можно указать в качестве второго параметра. Этот параметр можно использовать для управления размерами списков публикаций, чтобы избежать генерации огромных файлов списков публикаций. Существуют следующие варианты:

- `full_text(ngrams, max_rows_per_postings_list)`: Использовать заданный max_rows_per_postings_list (при условии, что он не равен 0)
- `full_text(ngrams, 0)`: Нет ограничения на максимальное количество строк в списке публикаций
- `full_text(ngrams)`: Использовать максимальное количество строк по умолчанию, равное 64K.

Будучи типом индекса пропуска, полнотекстовые индексы могут быть удалены или добавлены к колонке после создания таблицы:

```sql
ALTER TABLE tab DROP INDEX inv_idx;
ALTER TABLE tab ADD INDEX inv_idx(s) TYPE full_text(2);
```

Для использования индекса не требуется никаких специальных функций или синтаксиса. Типичные предикаты поиска строк автоматически используют индекс. Примеры:

```sql
INSERT INTO tab(key, str) values (1, 'Hello World');
SELECT * from tab WHERE str == 'Hello World';
SELECT * from tab WHERE str IN ('Hello', 'World');
SELECT * from tab WHERE str LIKE '%Hello%';
SELECT * from tab WHERE multiSearchAny(str, ['Hello', 'World']);
SELECT * from tab WHERE hasToken(str, 'Hello');
```

Полнотекстовый индекс также работает с колонками типа `Array(String)`, `Array(FixedString)`, `Map(String)` и `Map(String)`.

Как и для других вторичных индексов, у каждой части колонки есть свой собственный полнотекстовый индекс. Более того, каждый полнотекстовый индекс внутренне делится на "сегменты". Наличие и размер сегментов в целом прозрачно для пользователей, но размер сегмента определяет потребление памяти во время построения индекса (например, когда сливаются две части). Параметр конфигурации "max_digestion_size_per_segment" (по умолчанию: 256 МБ) управляет объемом считываемых данных из основной колонки перед созданием нового сегмента. Увеличение параметра повышает промежуточное потребление памяти для построения индекса, но также улучшает производительность поиска, так как среднее число сегментов, которые необходимо проверить для оценки запроса, уменьшается.

## Полнотекстовый поиск в наборе данных Hacker News {#full-text-search-of-the-hacker-news-dataset}

Рассмотрим улучшения производительности полнотекстовых индексов на большом наборе данных с множеством текста. Мы будем использовать 28.7M строк комментариев на популярном сайте Hacker News. Вот таблица без полнотекстового индекса:

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

Рассмотрим следующий простой поиск по термину `ClickHouse` (и его различным вариантам с заглавными и строчными буквами) в колонке `comment`:

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

Используем `ALTER TABLE` и добавим полнотекстовый индекс по нижнему регистру колонки `comment`, затем материализуем его (это может занять время - подождите, пока он материализуется):

```sql
ALTER TABLE hackernews
     ADD INDEX comment_lowercase(lower(comment)) TYPE full_text;

ALTER TABLE hackernews MATERIALIZE INDEX comment_lowercase;
```

Запускаем тот же запрос...

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
-- несколько терминов через OR
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);

-- несколько терминов через AND
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

:::note
В отличие от других вторичных индексов, полнотекстовые индексы (пока что) сопоставляют номера строк (идентификаторы строк), а не идентификаторы гранул. Причина для этого дизайна — производительность. На практике пользователи часто ищут сразу несколько терминов. Например, предикат фильтрации `WHERE s LIKE '%little%' OR s LIKE '%big%'` можно оценить напрямую, используя полнотекстовый индекс, формируя объединение списков идентификаторов строк для терминов "little" и "big". Это также означает, что параметр `GRANULARITY`, указанный при создании индекса, не имеет смысла (в будущем он может быть удален из синтаксиса).
:::

## Связанный контент {#related-content}

- Блог: [Введение в инвертированные индексы в ClickHouse](https://clickhouse.com/blog/clickhouse-search-with-inverted-indices)
