---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: 'Выбор первичного ключа'
title: 'Выбор первичного ключа'
description: 'Страница о том, как выбрать первичный ключ в ClickHouse'
keywords: ['primary key']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> На этой странице мы используем термины "ключ сортировки" и "первичный ключ" как взаимозаменяемые. Строго говоря, [в ClickHouse они различаются](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), но для целей данного документа читатели могут использовать их как синонимы, при этом ключ сортировки относится к столбцам, указанным в `ORDER BY` таблицы.

Обратите внимание, что первичный ключ ClickHouse работает [совершенно иначе](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse), чем знакомые термины в OLTP базах данных, таких как Postgres.

Выбор эффективного первичного ключа в ClickHouse имеет решающее значение для производительности запросов и эффективности хранения. ClickHouse организует данные в части (parts), каждая из которых содержит собственный разреженный первичный индекс. Этот индекс значительно ускоряет запросы, уменьшая объем сканируемых данных. Кроме того, поскольку первичный ключ определяет физический порядок данных на диске, он напрямую влияет на эффективность сжатия. Оптимально упорядоченные данные сжимаются более эффективно, что дополнительно повышает производительность за счет уменьшения I/O.

1. При выборе ключа сортировки отдавайте приоритет столбцам, часто используемым в фильтрах запросов (т.е. в предложении `WHERE`), особенно тем, которые исключают большое количество строк.
2. Столбцы, сильно коррелированные с другими данными в таблице, также полезны, поскольку непрерывное хранение улучшает коэффициенты сжатия и эффективность памяти во время операций `GROUP BY` и `ORDER BY`.
<br/>
Можно применить несколько простых правил, чтобы помочь выбрать ключ сортировки. Следующие правила иногда могут конфликтовать, поэтому рассматривайте их по порядку. **Вы можете определить несколько ключей из этого процесса, обычно достаточно 4-5**:

:::note Важно
Ключи сортировки должны быть определены при создании таблицы и не могут быть добавлены позже. Дополнительная сортировка может быть добавлена к таблице после (или до) вставки данных через функцию, известную как проекции. Имейте в виду, что это приводит к дублированию данных. Дополнительные сведения [здесь](/sql-reference/statements/alter/projection).
:::

## Пример {#example}

Рассмотрим следующую таблицу `posts_unordered`. Она содержит по одной строке на каждый пост Stack Overflow.

Эта таблица не имеет первичного ключа - на что указывает `ORDER BY tuple()`.

```sql
CREATE TABLE posts_unordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4,
  'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime,
  `Score` Int32,
  `ViewCount` UInt32,
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime,
  `LastActivityDate` DateTime,
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16,
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense`LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime,
  `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

Предположим, пользователь хочет подсчитать количество вопросов, поданных после 2024 года, и это представляет собой наиболее распространенный паттерн доступа.

```sql
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.055 sec. Processed 59.82 million rows, 361.34 MB (1.09 billion rows/s., 6.61 GB/s.)
```

Обратите внимание на количество строк и байтов, прочитанных этим запросом. Без первичного ключа запросы должны сканировать весь набор данных.

Использование `EXPLAIN indexes=1` подтверждает полное сканирование таблицы из-за отсутствия индексации.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_unordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain───────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                 │
│   Aggregating                                             │
│     Expression (Before GROUP BY)                          │
│       Expression                                          │
│         ReadFromMergeTree (stackoverflow.posts_unordered) │
└───────────────────────────────────────────────────────────┘

5 rows in set. Elapsed: 0.003 sec.
```

Предположим, что таблица `posts_ordered`, содержащая те же данные, определена с `ORDER BY`, заданным как `(PostTypeId, toDate(CreationDate))`, т.е.

```sql
CREATE TABLE posts_ordered
(
  `Id` Int32,
  `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6,
  'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
...
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate))
```

`PostTypeId` имеет кардинальность 8 и представляет собой логичный выбор для первого элемента в нашем ключе сортировки. Признавая, что фильтрация с точностью до даты, вероятно, будет достаточной (она все равно будет полезна для фильтров datetime), мы используем `toDate(CreationDate)` в качестве второго компонента нашего ключа. Это также приведет к меньшему индексу, поскольку дата может быть представлена 16 битами, что ускоряет фильтрацию.

Следующая анимация показывает, как создается оптимизированный разреженный первичный индекс для таблицы постов Stack Overflow. Вместо индексации отдельных строк, индекс нацелен на блоки строк:

<Image img={create_primary_key} size="lg" alt="Primary key" />

Если тот же запрос повторяется на таблице с этим ключом сортировки:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 row in set. Elapsed: 0.013 sec. Processed 196.53 thousand rows, 1.77 MB (14.64 million rows/s., 131.78 MB/s.)
```

Этот запрос теперь использует разреженное индексирование, значительно уменьшая объем прочитанных данных и ускоряя время выполнения в 4 раза - обратите внимание на сокращение прочитанных строк и байтов.

Использование индекса можно подтвердить с помощью `EXPLAIN indexes=1`.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

┌─explain─────────────────────────────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                                                   │
│   Aggregating                                                                               │
│     Expression (Before GROUP BY)                                                            │
│       Expression                                                                            │
│         ReadFromMergeTree (stackoverflow.posts_ordered)                                     │
│         Indexes:                                                                            │
│           PrimaryKey                                                                        │
│             Keys:                                                                           │
│               PostTypeId                                                                    │
│               toDate(CreationDate)                                                          │
│             Condition: and((PostTypeId in [1, 1]), (toDate(CreationDate) in [19723, +Inf))) │
│             Parts: 14/14                                                                    │
│             Granules: 39/7578                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

13 rows in set. Elapsed: 0.004 sec.
```

Кроме того, мы визуализируем, как разреженный индекс отсекает все блоки строк, которые не могут содержать совпадения для нашего примера запроса:

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
Все столбцы в таблице будут отсортированы на основе значения указанного ключа сортировки, независимо от того, включены ли они в сам ключ. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех других столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько ключей сортировки - это будет упорядочивать с той же семантикой, что и предложение `ORDER BY` в запросе `SELECT`.
:::

Полное расширенное руководство по выбору первичных ключей можно найти [здесь](/guides/best-practices/sparse-primary-indexes).

Для более глубокого понимания того, как ключи сортировки улучшают сжатие и дополнительно оптимизируют хранилище, изучите официальные руководства по [Сжатию в ClickHouse](/data-compression/compression-in-clickhouse) и [Кодекам сжатия столбцов](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).
