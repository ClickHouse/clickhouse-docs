---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: 'Выбор первичного ключа'
title: 'Выбор первичного ключа'
description: 'Страница, описывающая, как выбрать первичный ключ в ClickHouse'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';


> Мы взаимозаменяемо используем термин "ключ сортировки", чтобы ссылаться на "первичный ключ" на этой странице. Строго говоря, [они отличаются в ClickHouse](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), но для целей этого документа читатели могут использовать их взаимозаменяемо, при этом ключ сортировки будет относиться к колонкам, указанным в таблице `ORDER BY`.

Обратите внимание, что первичный ключ ClickHouse работает [совсем иначе](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse) для тех, кто знаком с аналогичными терминами в OLTP базах данных, таких как Postgres.

Выбор эффективного первичного ключа в ClickHouse имеет решающее значение для производительности запросов и эффективности хранения. ClickHouse организует данные в части, каждая из которых содержит свой разреженный первичный индекс. Этот индекс значительно ускоряет запросы, уменьшая объем просматриваемых данных. Кроме того, поскольку первичный ключ определяет физический порядок данных на диске, он напрямую влияет на эффективность сжатия. Оптимально упорядоченные данные сжимаются более эффективно, что дополнительно повышает производительность, уменьшая ввод-вывод.

1. При выборе ключа сортировки следует приоритизировать колонки, часто используемые в фильтрах запросов (т.е. в `WHERE` клаузе), особенно те, которые исключают большое количество строк.
2. Колонки, высоко коррелирующие с другими данными в таблице, также полезны, так как непрерывное хранение улучшает коэффициенты сжатия и эффективность памяти во время операций `GROUP BY` и `ORDER BY`.
<br/>
Некоторые простые правила могут быть применены, чтобы помочь выбрать ключ сортировки. Следующие могут иногда конфликтовать, поэтому рассмотрите их в порядке. **Пользователи могут определить несколько ключей из этого процесса, при этом 4-5 обычно достаточно**:

:::note Важно
Ключи сортировки должны быть определены при создании таблицы и не могут быть добавлены. Дополнительная сортировка может быть добавлена к таблице после (или перед) вставкой данных через функцию, известную как проекции. Обратите внимание, что это приведет к дублированию данных. Более подробную информацию можно найти [здесь](/sql-reference/statements/alter/projection).
:::

## Пример {#example}

Рассмотрим следующую таблицу `posts_unordered`. Она содержит по одной строке на пост Stack Overflow.

Эта таблица не имеет первичного ключа - как указано в `ORDER BY tuple()`.

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
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime,
  `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
```

Предположим, что пользователь хочет вычислить количество вопросов, отправленных после 2024 года, что представляет собой их наиболее распространенный шаблон доступа.

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

Обратите внимание на количество строк и байт, прочитанных в этом запросе. Без первичного ключа запросы должны сканировать весь набор данных.

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

Предположим, таблица `posts_ordered`, содержащая те же данные, определяется с `ORDER BY`, установленным как `(PostTypeId, toDate(CreationDate))`, т.е.

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

`PostTypeId` имеет кардинальность 8 и является логическим выбором для первого элемента в нашем ключе сортировки. Признавая, что фильтрация по гранулярности даты, вероятно, будет достаточной (это также будет полезно для фильтров по дате и времени), мы используем `toDate(CreationDate)` в качестве второго компонента нашего ключа. Это также даст меньший индекс, поскольку дату можно представить 16 битами, что ускоряет фильтрацию.

Следующая анимация показывает, как создается оптимизированный разреженный первичный индекс для таблицы постов Stack Overflow. Вместо индексации отдельных строк индекс нацеливается на блоки строк:

<Image img={create_primary_key} size="lg" alt="Первичный ключ" />

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

Теперь этот запрос использует разреженное индексирование, значительно сокращая объём прочитанных данных и ускоряя время выполнения в 4 раза - обратите внимание на сокращение количества строк и байт, прочитанных. 

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

Кроме того, мы визуализируем, как разреженный индекс обрезает все блоки строк, которые не могут содержать совпадения для нашего примерного запроса:

<Image img={primary_key} size="lg" alt="Первичный ключ" />

:::note
Все колонки в таблице будут отсортированы на основе значений указанного ключа сортировки, не важно, включены ли они в сам ключ. Например, если `CreationDate` используется как ключ, порядок значений во всех остальных колонках будет соответствовать порядку значений в колонке `CreationDate`. Можно указать несколько ключей сортировки - это будет упорядочивать с теми же семантиками, что и клаузула `ORDER BY` в запросе `SELECT`.
:::

Полное руководство по выбору первичных ключей можно найти [здесь](/guides/best-practices/sparse-primary-indexes).

Для более глубокого понимания того, как ключи сортировки улучшают сжатие и дополнительно оптимизируют хранение, изучите официальные руководства по [Сжатию в ClickHouse](/data-compression/compression-in-clickhouse) и [Кодекам сжатия колонок](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).
