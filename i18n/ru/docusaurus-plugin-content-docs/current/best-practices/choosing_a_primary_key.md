---
slug: '/best-practices/choosing-a-primary-key'
sidebar_label: 'Выбор первичного ключа'
sidebar_position: 10
description: 'Страница, описывающая, как выбирать первичный ключ в ClickHouse'
title: 'Выбор первичного ключа'
doc_type: guide
show_related_blogs: true
---
import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> Мы взаимозаменяемо используем термин "ключ сортировки" для обозначения "первичного ключа" на этой странице. Строго говоря, [они различаются в ClickHouse](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), но для целей данного документа читатели могут использовать их взаимозаменяемо, причем ключ сортировки относится к колонкам, указанным в таблице `ORDER BY`.

Обратите внимание, что первичный ключ ClickHouse работает [совершенно иначе](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse), чем те, кто знаком с аналогичными терминами в OLTP базах данных, таких как Postgres.

Выбор эффективного первичного ключа в ClickHouse имеет решающее значение для производительности запросов и эффективности хранения. ClickHouse организует данные в части, каждая из которых содержит свой собственный разреженный первичный индекс. Этот индекс значительно ускоряет выполнение запросов, уменьшая объем сканируемых данных. Кроме того, поскольку первичный ключ определяет физический порядок хранения данных на диске, он напрямую влияет на эффективность сжатия. Оптимально упорядоченные данные лучше сжимаются, что дополнительно улучшает производительность за счет снижения ввода-вывода.

1. При выборе ключа сортировки приоритизируйте колонки, часто использующиеся в фильтрах запросов (т.е. в операторе `WHERE`), особенно те, которые исключают большое количество строк.
2. Колонки, сильно коррелирующие с другими данными в таблице, также будут полезны, так как непрерывное хранение улучшает коэффициенты сжатия и эффективность памяти во время операций `GROUP BY` и `ORDER BY`.
<br/>
Можно применить несколько простых правил для выбора ключа сортировки. Следующие рекомендации могут иногда противоречить друг другу, поэтому рассматривайте их по порядку. **Пользователи могут определить несколько ключей из этого процесса, обычно 4-5 будет достаточно**:

:::note Important
Ключи сортировки должны определяться при создании таблицы и не могут быть добавлены. Дополнительная сортировка может быть добавлена в таблицу после (или до) вставки данных с помощью функции, известной как проекции. Обратите внимание, что это приведет к дублированию данных. Более подробная информация [здесь](/sql-reference/statements/alter/projection).
:::

## Пример {#example}

Рассмотрим следующую таблицу `posts_unordered`. Она содержит одну строку на каждый пост Stack Overflow.

В этой таблице нет первичного ключа - как указано `ORDER BY tuple()`.

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

Предположим, пользователь хочет вычислить количество вопросов, поданных после 2024 года, что представляет собой их наиболее частый шаблон доступа.

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

Предположим, что таблица `posts_ordered`, содержащая те же данные, определена с `ORDER BY`, установленным как `(PostTypeId, toDate(CreationDate))`, т.е.

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

`PostTypeId` имеет кардинальность 8 и представляет собой логический выбор для первой записи в нашем ключе сортировки. Осознавая, что фильтрация по гранулярности даты, вероятно, будет достаточной (это все равно будет полезно для фильтров по датам и времени), мы используем `toDate(CreationDate)` в качестве 2-го компонента нашего ключа. Это также создаст меньший индекс, так как дата может быть представлена 16 битами, ускоряя фильтрацию.

Следующая анимация показывает, как создается оптимизированный разреженный первичный индекс для таблицы постов Stack Overflow. Вместо индексации отдельных строк индекс ориентирован на блоки строк:

<Image img={create_primary_key} size="lg" alt="Primary key" />

Если тот же запрос повторить на таблице с этим ключом сортировки:

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

Этот запрос теперь использует разреженную индексацию, значительно уменьшая объем читаемых данных и ускоряя время выполнения в 4 раза - обратите внимание на сокращение количества строк и прочитанных байтов.

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

Кроме того, мы визуализируем, как разреженный индекс отсеивает все блоки строк, которые не могут содержать совпадения для нашего примера запроса:

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
Все колонки в таблице будут отсортированы на основе значения указанного ключа сортировки, независимо от того, включены ли они в сам ключ. Например, если `CreationDate` используется в качестве ключа, порядок значений во всех других колонках будет соответствовать порядку значений в колонке `CreationDate`. Можно указать несколько ключей сортировки - это будет упорядочивать с теми же семантиками, что и оператор `ORDER BY` в запросе `SELECT`.
:::

Полное руководство по выбору первичных ключей можно найти [здесь](/guides/best-practices/sparse-primary-indexes).

Для более глубокого понимания того, как ключи сортировки улучшают сжатие и дополнительно оптимизируют хранение, изучите официальные руководства по [Сжатию в ClickHouse](/data-compression/compression-in-clickhouse) и [Кодекам сжатия колонок](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).