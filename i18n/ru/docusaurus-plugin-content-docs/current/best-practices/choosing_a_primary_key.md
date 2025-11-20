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

> На этой странице мы взаимозаменяемо используем термин «ключ сортировки» для обозначения «первичного ключа». Строго говоря, [в ClickHouse они различаются](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), но в рамках этого документа читатели могут рассматривать их как взаимозаменяемые, при этом под ключом сортировки понимаются столбцы, указанные в `ORDER BY` таблицы.

Обратите внимание, что первичный ключ в ClickHouse работает [совершенно иначе](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse) по сравнению с тем, как это понимают пользователи OLTP-баз данных, таких как Postgres.

Выбор эффективного первичного ключа в ClickHouse критически важен для производительности запросов и эффективности хранения. ClickHouse организует данные в части, каждая из которых содержит собственный разреженный первичный индекс. Этот индекс значительно ускоряет запросы за счёт уменьшения объёма сканируемых данных. Кроме того, поскольку первичный ключ определяет физический порядок данных на диске, он напрямую влияет на эффективность сжатия. Оптимально упорядоченные данные сжимаются лучше, что дополнительно повышает производительность за счёт сокращения объёма I/O.

1. При выборе ключа сортировки отдавайте приоритет столбцам, которые часто используются в фильтрах запросов (т. е. в `WHERE`), особенно тем, которые отфильтровывают большие объёмы строк.
2. Также полезны столбцы, сильно коррелирующие с другими данными в таблице, так как непрерывное хранение улучшает коэффициент сжатия и эффективность использования памяти при выполнении операций `GROUP BY` и `ORDER BY`.

<br />

Можно применить несколько простых правил, чтобы помочь выбрать ключ сортировки. Следующие рекомендации иногда могут конфликтовать друг с другом, поэтому учитывайте их по порядку. **С помощью этого процесса пользователи могут определить несколько ключей, при этом обычно достаточно 4–5**:

:::note Important
Ключи сортировки должны быть определены при создании таблицы и не могут быть добавлены позже. Дополнительную сортировку можно добавить к таблице до или после вставки данных с помощью механизма, называемого проекциями. Имейте в виду, что это приводит к дублированию данных. Дополнительные подробности — [здесь](/sql-reference/statements/alter/projection).
:::


## Пример {#example}

Рассмотрим следующую таблицу `posts_unordered`. Она содержит по одной строке на каждую публикацию Stack Overflow.

У этой таблицы нет первичного ключа — на это указывает `ORDER BY tuple()`.

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

Предположим, пользователь хочет подсчитать количество вопросов, отправленных после 2024 года, и это является наиболее частым шаблоном доступа к данным.

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

Обратите внимание на количество строк и байтов, прочитанных этим запросом. Без первичного ключа запросы вынуждены сканировать весь набор данных.

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

Предположим, что таблица `posts_ordered`, содержащая те же данные, определена с `ORDER BY` в виде `(PostTypeId, toDate(CreationDate))`, т. е.

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

`PostTypeId` имеет кардинальность 8 и является логичным выбором для первого элемента ключа сортировки. Учитывая, что фильтрации по дате с точностью до дня, вероятно, будет достаточно (при этом фильтры по datetime также останутся эффективными), мы используем `toDate(CreationDate)` в качестве второго компонента ключа. Это также позволит создать более компактный индекс, поскольку дата представляется 16 битами, что ускоряет фильтрацию.

Следующая анимация показывает, как создаётся оптимизированный разреженный первичный индекс для таблицы публикаций Stack Overflow. Вместо индексации отдельных строк индекс работает с блоками строк:

<Image img={create_primary_key} size='lg' alt='Primary key' />

Если выполнить тот же запрос на таблице с этим ключом сортировки:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

```


┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 строка в наборе. Прошло: 0.013 сек. Обработано 196.53 тыс. строк, 1.77 MB (14.64 млн строк/с, 131.78 MB/s.)

````

Этот запрос теперь использует разреженную индексацию, значительно сокращая объем считываемых данных и ускоряя время выполнения в 4 раза — обратите внимание на уменьшение количества прочитанных строк и байтов. 

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
````

Кроме того, мы показываем наглядно, как разреженный индекс отбрасывает все блоки строк, которые не могут содержать совпадения для нашего примерного запроса:

<Image img={primary_key} size="lg" alt="Primary key" />

:::note
Все столбцы в таблице будут отсортированы на основе значения указанного ключа упорядочения, независимо от того, включены ли они в сам ключ. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько ключей упорядочения — сортировка будет выполняться с той же семантикой, что и предложение `ORDER BY` в запросе `SELECT`.
:::

Полное подробное руководство по выбору первичных ключей можно найти [здесь](/guides/best-practices/sparse-primary-indexes).

Чтобы глубже понять, как ключи упорядочения улучшают сжатие и дополнительно оптимизируют хранение, изучите официальные руководства по [сжатию в ClickHouse](/data-compression/compression-in-clickhouse) и [кодекам сжатия столбцов](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).
