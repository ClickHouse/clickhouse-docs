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

> На этой странице мы используем термин &quot;ordering key&quot; взаимозаменяемо с термином &quot;primary key&quot;. Строго говоря, [в ClickHouse они различаются](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), но в рамках этого документа читатели могут считать их синонимами, при этом под ordering key подразумеваются столбцы, указанные в `ORDER BY` таблицы.

Обратите внимание, что primary key в ClickHouse работает [совершенно иначе](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse), чем это обычно понимают пользователи OLTP-баз данных, таких как Postgres.

Выбор эффективного primary key в ClickHouse имеет критически важное значение для производительности запросов и эффективности хранения. ClickHouse организует данные в части, каждая из которых содержит собственный разреженный первичный индекс. Этот индекс существенно ускоряет запросы, уменьшая объём сканируемых данных. Кроме того, поскольку primary key определяет физический порядок данных на диске, он напрямую влияет на эффективность сжатия. Оптимально упорядоченные данные сжимаются эффективнее, что дополнительно повышает производительность за счёт сокращения операций ввода-вывода (I/O).

1. При выборе ordering key отдавайте приоритет столбцам, которые часто используются в фильтрах запросов (то есть в `WHERE`-условиях), особенно тем, которые исключают большое количество строк.
2. Столбцы, сильно коррелированные с другими данными в таблице, также полезны, поскольку непрерывное размещение данных улучшает коэффициенты сжатия и эффективность использования памяти при операциях `GROUP BY` и `ORDER BY`.

<br />

Можно применить несколько простых правил, чтобы помочь выбрать ordering key. Следующие рекомендации могут иногда противоречить друг другу, поэтому учитывайте их по порядку. **Вы можете определить несколько вариантов ключей с помощью этого процесса, при этом обычно достаточно 4–5**:

:::note Важно
Ordering keys должны быть определены при создании таблицы и не могут быть добавлены позже. Дополнительное упорядочение может быть добавлено в таблицу после (или до) вставки данных с помощью механизма под названием projections (проекции). Имейте в виду, что это приводит к дублированию данных. Подробности см. [здесь](/sql-reference/statements/alter/projection).
:::

## Пример \{#example\}

Рассмотрим следующую таблицу `posts_unordered`. Она содержит по одной строке для каждого поста Stack Overflow.

У этой таблицы нет первичного ключа — на что указывает выражение `ORDER BY tuple()`.

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

Предположим, что пользователь хочет вычислить число вопросов, отправленных после 2024 года, и это представляет собой его наиболее распространённый паттерн доступа.

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

Обратите внимание на количество строк и байт, прочитанных этим запросом. Без первичного ключа запросам приходится сканировать весь набор данных.

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

Предположим, что таблица `posts_ordered`, содержащая те же данные, определена с `ORDER BY` как `(PostTypeId, toDate(CreationDate))`, то есть

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

`PostTypeId` имеет кардинальность 8 и является логичным выбором для первого столбца в нашем ключе сортировки. Понимая, что фильтрации по дате с такой гранулярностью, скорее всего, будет достаточно (она по‑прежнему принесёт пользу и при фильтрации по `datetime`), мы используем `toDate(CreationDate)` как второй компонент нашего ключа. Это также приведёт к меньшему индексу, поскольку дата может быть представлена 16 битами, что ускоряет фильтрацию.

Следующая анимация показывает, как создаётся оптимизированный разреженный первичный индекс для таблицы постов Stack Overflow. Вместо индексирования отдельных строк индекс строится по блокам строк:

<Image img={create_primary_key} size="lg" alt="Первичный ключ" />

Если один и тот же запрос повторно выполняется для таблицы с таким ключом сортировки:

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

Теперь этот запрос использует разреженную индексацию, что значительно сокращает объём считываемых данных и ускоряет выполнение в 4 раза — обратите внимание на уменьшение количества прочитанных строк и байтов.

Использование индекса можно проверить с помощью `EXPLAIN indexes=1`.

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

Кроме того, мы наглядно показываем, как разреженный индекс отфильтровывает все блоки строк, которые не могут содержать совпадения для нашего примерного запроса:

<Image img={primary_key} size="lg" alt="Первичный ключ" />

:::note
Все столбцы в таблице будут отсортированы на основе значения указанного ключа сортировки, независимо от того, включены ли они в сам ключ. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько ключей сортировки — в этом случае сортировка будет выполняться с той же семантикой, что и предложение `ORDER BY` в запросе `SELECT`.
:::

Полное подробное руководство по выбору первичных ключей можно найти [здесь](/guides/best-practices/sparse-primary-indexes).

Для более глубокого понимания того, как ключи сортировки улучшают сжатие и дополнительно оптимизируют хранение, ознакомьтесь с официальными руководствами [Compression in ClickHouse](/data-compression/compression-in-clickhouse) и [Column Compression Codecs](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).
