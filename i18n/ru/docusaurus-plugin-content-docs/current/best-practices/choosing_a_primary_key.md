---
slug: /best-practices/choosing-a-primary-key
sidebar_position: 10
sidebar_label: 'Выбор первичного ключа'
title: 'Выбор первичного ключа'
description: 'Руководство по выбору первичного ключа в ClickHouse'
keywords: ['первичный ключ']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import create_primary_key from '@site/static/images/bestpractices/create_primary_key.gif';
import primary_key from '@site/static/images/bestpractices/primary_key.gif';

> В этом разделе мы взаимозаменяемо используем термин &quot;ключ упорядочивания&quot; для обозначения &quot;первичного ключа&quot;. Строго говоря, [в ClickHouse они различаются](/engines/table-engines/mergetree-family/mergetree#choosing-a-primary-key-that-differs-from-the-sorting-key), но в рамках этого документа читатели могут использовать их как синонимы, при этом под ключом упорядочивания понимаются столбцы, указанные в `ORDER BY` таблицы.

Обратите внимание, что первичный ключ в ClickHouse работает [существенно иначе](/migrations/postgresql/data-modeling-techniques#primary-ordering-keys-in-clickhouse), чем тот, к которому привыкли пользователи OLTP-баз данных, таких как Postgres.

Выбор эффективного первичного ключа в ClickHouse имеет решающее значение для производительности запросов и эффективности хранения. ClickHouse организует данные в парты, каждая из которых содержит свой разреженный первичный индекс. Этот индекс существенно ускоряет запросы за счет сокращения объема сканируемых данных. Дополнительно, поскольку первичный ключ определяет физический порядок данных на диске, он напрямую влияет на эффективность сжатия. Оптимально упорядоченные данные сжимаются лучше, что дополнительно повышает производительность за счет снижения объема операций ввода-вывода (I/O).

1. При выборе ключа упорядочивания отдавайте приоритет столбцам, которые часто используются в фильтрах запросов (то есть в предложении `WHERE`), особенно тем, которые исключают большое количество строк.
2. Столбцы, сильно коррелирующие с другими данными в таблице, также полезны, поскольку непрерывное размещение улучшает коэффициент сжатия и эффективность использования памяти при операциях `GROUP BY` и `ORDER BY`.

<br />

Можно применить несколько простых правил, которые помогут выбрать ключ упорядочивания. Следующие рекомендации иногда могут конфликтовать между собой, поэтому учитывайте их по порядку. **В результате этого процесса можно определить несколько столбцов для ключа упорядочивания; как правило, достаточно 4–5 столбцов**:

:::note Важно
Ключи упорядочивания должны быть определены при создании таблицы и не могут быть добавлены позже. Дополнительное упорядочивание может быть добавлено к таблице до или после вставки данных с помощью механизма, известного как проекции (projections). Имейте в виду, что это приводит к дублированию данных. Подробности приведены [здесь](/sql-reference/statements/alter/projection).
:::


## Пример {#example}

Рассмотрим следующую таблицу `posts_unordered`. Она содержит по одной строке для каждого поста Stack Overflow.

В этой таблице нет первичного ключа — на это указывает `ORDER BY tuple()`.

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

Предположим, пользователь хочет вычислить количество вопросов, отправленных после 2024 года, и это является наиболее распространённым шаблоном доступа.

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

`PostTypeId` имеет кардинальность 8 и является логичным выбором для первого элемента в ключе сортировки. Учитывая, что фильтрации по гранулярности даты, вероятно, будет достаточно (это всё равно будет полезно для фильтров datetime), мы используем `toDate(CreationDate)` в качестве второго компонента ключа. Это также позволит создать меньший индекс, поскольку дата может быть представлена 16 битами, что ускоряет фильтрацию.

Следующая анимация показывает, как создаётся оптимизированный разреженный первичный индекс для таблицы постов Stack Overflow. Вместо индексации отдельных строк индекс работает с блоками строк:

<Image img={create_primary_key} size='lg' alt='Primary key' />

Если тот же запрос выполнить на таблице с этим ключом сортировки:

```sql
SELECT count()
FROM stackoverflow.posts_ordered
WHERE (CreationDate >= '2024-01-01') AND (PostTypeId = 'Question')

```


┌─count()─┐
│  192611 │
└─────────┘
--highlight-next-line
1 строка в наборе. Прошло: 0.013 сек. Обработано 196.53 тыс. строк, 1.77 MB (14.64 млн строк/с., 131.78 MB/s.)

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

Получено 13 строк. Затрачено: 0.004 сек.
````

Кроме того, мы наглядно показываем, как разреженный индекс отбрасывает все блоки строк, которые заведомо не могут содержать совпадения для нашего примерного запроса:

<Image img={primary_key} size="lg" alt="Первичный ключ" />

:::note
Все столбцы в таблице будут отсортированы в соответствии со значениями указанного ключа упорядочивания, независимо от того, включены ли они в сам ключ. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько ключей упорядочивания — при этом сортировка будет происходить с той же семантикой, что и в предложении `ORDER BY` запроса `SELECT`.
:::

Полное расширенное руководство по выбору первичных ключей можно найти [здесь](/guides/best-practices/sparse-primary-indexes).

Для более глубокого понимания того, как ключи упорядочивания улучшают сжатие и дополнительно оптимизируют хранение, изучите официальные руководства [Сжатие в ClickHouse](/data-compression/compression-in-clickhouse) и [Кодеки сжатия столбцов](/data-compression/compression-in-clickhouse#choosing-the-right-column-compression-codec).
