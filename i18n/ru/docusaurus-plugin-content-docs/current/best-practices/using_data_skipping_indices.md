---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'Индексы пропуска данных'
title: 'Используйте индексы пропуска данных, где это уместно'
description: 'Страница, описывающая, как и когда использовать индексы пропуска данных'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

Индексы пропуска данных следует рассматривать, когда были выполнены предыдущие лучшие практики, т.е. типы оптимизированы, выбран хороший первичный ключ и использованы материализованные представления.

Эти типы индексов могут быть использованы для ускорения производительности запросов, если их использовать осторожно, понимая, как они работают.

ClickHouse предоставляет мощный механизм, называемый **индексами пропуска данных**, который может существенно сократить объем данных, сканируемых во время выполнения запроса - особенно когда первичный ключ не полезен для конкретных условий фильтрации. В отличие от традиционных баз данных, которые полагаются на вторичные индексы на основе строк (такие как B-деревья), ClickHouse является столбцовой базой данных и не хранит местоположения строк таким образом, чтобы поддерживать такие структуры. Вместо этого он используетskip indexes, которые помогают избежать чтения блоков данных, которые гарантированно не соответствуют условиям фильтрации запроса.

Индексы пропуска работают, храня метаданные о блоках данных - такие как минимальные/максимальные значения, наборы значений или представления фильтров Блума - и используют эти метаданные во время выполнения запроса, чтобы определить, какие блоки данных можно пропустить полностью. Они применяются только к [семейству MergeTree](/engines/table-engines/mergetree-family/mergetree) движков таблиц и определяются с помощью выражения, типа индекса, имени и гранулярности, которая определяет размер каждого индексируемого блока. Эти индексы хранятся вместе с данными таблицы и учитываются, когда фильтр запроса совпадает с выражением индекса.

Существует несколько типов индексов пропуска данных, каждый из которых подходит для различных типов запросов и распределения данных:

* **minmax**: Отслеживает минимальное и максимальное значение выражения на блок. Идеально подходит для диапазонных запросов на слабо отсортированных данных.
* **set(N)**: Отслеживает набор значений до указанного размера N для каждого блока. Эффективен для колонок с низкой кардинальностью на блоки.
* **bloom_filter**: Вероятностно определяет, существует ли значение в блоке, позволяя выполнять быстрое приближенное фильтрование для проверки принадлежности к множеству. Эффективен для оптимизации запросов, ищущих «иголку в стоге сена», где требуется положительное совпадение.
* **tokenbf_v1 / ngrambf_v1**: Специализированные варианты фильтра Блума, предназначенные для поиска токенов или последовательностей символов в строках - особенно полезно для данных журналов или случаев поиска текста.

Хотя они мощны, индексы пропуска должны использоваться с осторожностью. Они приносят пользу только тогда, когда они исключают значительное количество блоков данных и могут фактически вводить дополнительные затраты, если запрос или структура данных не соответствуют. Если даже одно совпадающее значение существует в блоке, весь этот блок все равно должен быть прочитан.

**Эффективное использование индексов пропуска часто зависит от сильной корреляции между индексируемой колонкой и первичным ключом таблицы или вставкой данных таким образом, чтобы группировать похожие значения вместе.**

В общем, индексы пропуска данных лучше всего применять после обеспечения правильного проектирования первичного ключа и оптимизации типов. Они особенно полезны для:

* Колонок с высокой общей кардинальностью, но низкой кардинальностью внутри блока.
* Редких значений, которые критичны для поиска (например, коды ошибок, конкретные идентификаторы).
* Случаев, когда фильтрация происходит по колонкам, не являющимся первичными ключами, с локализованным распределением.

Всегда:

1. тестируйте индексы пропуска на реальных данных с реалистичными запросами. Пробуйте разные типы индексов и значения гранулярности.
2. Оцените их влияние с помощью инструментов, таких как send_logs_level='trace' и `EXPLAIN indexes=1`, чтобы просмотреть эффективность индекса.
3. Всегда оценивайте размер индекса и то, как он зависит от гранулярности. Уменьшение размера гранулярности часто улучшает производительность до определенного момента, что приводит к фильтрации большего количества гранул и необходимости их сканирования. Однако по мере увеличения размера индекса с меньшей гранулярностью производительность также может ухудшаться. Измеряйте производительность и размер индекса для различных показателей данных гранулярности. Это особенно актуально для индексов фильтра Блума.

<p/>
**При правильном использовании индексы пропуска могут обеспечить значительное увеличение производительности - при неосмотрительном использовании они могут добавить ненужные затраты.**

Для более подробного руководства по индексам пропуска данных см. [здесь](/sql-reference/statements/alter/skipping-index).

## Пример {#example}

Рассмотрим следующую оптимизированную таблицу. Она содержит данные Stack Overflow с одной строкой на пост.

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

Эта таблица оптимизирована для запросов, которые фильтруют и агрегируют по типу поста и дате. Предположим, мы хотели бы подсчитать количество постов с более чем 10,000,000 просмотров, опубликованных после 2009 года.

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

Этот запрос может исключить некоторые строки (и гранулы) с помощью первичного индекса. Однако большинство строк все равно необходимо прочитать, как указано в вышеуказанном ответе и следующем `EXPLAIN indexes=1`:

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
LIMIT 1

┌─explain──────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                        │
│   Limit (preliminary LIMIT (without OFFSET))                     │
│     Aggregating                                                  │
│       Expression (Before GROUP BY)                               │
│         Expression                                               │
│           ReadFromMergeTree (stackoverflow.posts)                │
│           Indexes:                                               │
│             MinMax                                               │
│               Keys:                                              │
│                 CreationDate                                     │
│               Condition: (CreationDate in ('1230768000', +Inf))  │
│               Parts: 123/128                                     │
│               Granules: 8513/8545                                │
│             Partition                                            │
│               Keys:                                              │
│                 toYear(CreationDate)                             │
│               Condition: (toYear(CreationDate) in [2009, +Inf))  │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
│             PrimaryKey                                           │
│               Keys:                                              │
│                 toDate(CreationDate)                             │
│               Condition: (toDate(CreationDate) in [14245, +Inf)) │
│               Parts: 123/123                                     │
│               Granules: 8513/8513                                │
└──────────────────────────────────────────────────────────────────┘

25 rows in set. Elapsed: 0.070 sec.
```

Простой анализ показывает, что `ViewCount` коррелирует с `CreationDate` (первичный ключ), как можно ожидать - чем дольше пост существует, тем больше времени у него для просмотра.

```sql
SELECT toDate(CreationDate) as day, avg(ViewCount) as view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

Это делает выборку логичным выбором для индекса пропуска данных. Учитывая числовой тип, индекс min_max имеет смысл. Мы добавляем индекс с помощью следующих команд `ALTER TABLE` - сначала добавляя его, затем «материализуя».

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

Этот индекс можно было бы также добавить во время первоначального создания таблицы. Схема с индексом min max, определенным как частью DDL:

```sql
CREATE TABLE stackoverflow.posts
(
  `Id` Int32 CODEC(Delta(4), ZSTD(1)),
  `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
  `AcceptedAnswerId` UInt32,
  `CreationDate` DateTime64(3, 'UTC'),
  `Score` Int32,
  `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
  `Body` String,
  `OwnerUserId` Int32,
  `OwnerDisplayName` String,
  `LastEditorUserId` Int32,
  `LastEditorDisplayName` String,
  `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
  `LastActivityDate` DateTime64(3, 'UTC'),
  `Title` String,
  `Tags` String,
  `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
  `CommentCount` UInt8,
  `FavoriteCount` UInt8,
  `ContentLicense` LowCardinality(String),
  `ParentId` String,
  `CommunityOwnedDate` DateTime64(3, 'UTC'),
  `ClosedDate` DateTime64(3, 'UTC'),
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --index здесь
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

Следующая анимация иллюстрирует, как наш индекс minmax создается для примера таблицы, отслеживая минимальные и максимальные значения `ViewCount` для каждого блока строк (гранулы) в таблице:

<Image img={building_skipping_indices} size="lg" alt="Создание индексов пропуска"/>

Повторение нашего предыдущего запроса показывает значительные улучшения в производительности. Обратите внимание на сокращение количества просканированных строк:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

`EXPLAIN indexes=1` подтверждает использование индекса.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─explain────────────────────────────────────────────────────────────┐
│ Expression ((Project names + Projection))                          │
│   Aggregating                                                      │
│     Expression (Before GROUP BY)                                   │
│       Expression                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                    │
│         Indexes:                                                   │
│           MinMax                                                   │
│             Keys:                                                  │
│               CreationDate                                         │
│             Condition: (CreationDate in ('1230768000', +Inf))      │
│             Parts: 123/128                                         │
│             Granules: 8513/8545                                    │
│           Partition                                                │
│             Keys:                                                  │
│               toYear(CreationDate)                                 │
│             Condition: (toYear(CreationDate) in [2009, +Inf))      │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           PrimaryKey                                               │
│             Keys:                                                  │
│               toDate(CreationDate)                                 │
│             Condition: (toDate(CreationDate) in [14245, +Inf))     │
│             Parts: 123/123                                         │
│             Granules: 8513/8513                                    │
│           Skip                                                     │
│             Name: view_count_idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 rows in set. Elapsed: 0.211 sec.
```

Мы также показываем анимацию, как индекс minmax отсекает все блоки строк, которые не могут содержать совпадения для условия `ViewCount` > 10,000,000 в нашем примере запроса:

<Image img={using_skipping_indices} size="lg" alt="Использование индексов пропуска"/>
