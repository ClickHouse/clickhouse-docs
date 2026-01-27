---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'Индексы пропуска данных'
title: 'Используйте индексы пропуска данных там, где это уместно'
description: 'Страница, описывающая, как и когда использовать индексы пропуска данных'
keywords: ['индекс пропуска данных', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

Индексы пропуска данных следует рассматривать после того, как соблюдены предыдущие рекомендации по лучшим практикам, то есть оптимизированы типы, выбран хороший первичный ключ и задействованы материализованные представления. Если вы впервые сталкиваетесь с индексами пропуска, [это руководство](/optimize/skipping-indexes) — хорошая отправная точка.

Эти типы индексов могут использоваться для ускорения выполнения запросов, если применять их осторожно и с пониманием того, как они работают.

ClickHouse предоставляет мощный механизм под названием **индексы пропуска данных**, который может значительно сократить объем данных, сканируемых при выполнении запроса — особенно когда первичный ключ не помогает для конкретного условия фильтрации. В отличие от традиционных баз данных, полагающихся на строковые вторичные индексы (например, B-деревья), ClickHouse является колоночным хранилищем и не хранит расположения строк в формате, подходящем для таких структур. Вместо этого он использует индексы пропуска, которые помогают избегать чтения блоков данных, заведомо не соответствующих условиям фильтрации запроса.

Индексы пропуска работают за счет хранения метаданных о блоках данных — таких как минимальные/максимальные значения, множества значений или представления в виде фильтра Блума — и использования этих метаданных при выполнении запроса для определения того, какие блоки данных можно полностью пропустить. Они применимы только к семейству движков таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree) и определяются при помощи выражения, типа индекса, имени и гранулярности, задающей размер каждого индексируемого блока. Эти индексы хранятся вместе с данными таблицы и используются, когда фильтр запроса соответствует выражению индекса.

Существует несколько типов индексов пропуска данных, каждый из которых подходит для разных типов запросов и распределений данных:

* **minmax**: Отслеживает минимальное и максимальное значение выражения на блок. Идеально подходит для диапазонных запросов по слабо отсортированным данным.
* **set(N)**: Отслеживает множество значений размером до N для каждого блока. Эффективен для столбцов с низкой кардинальностью внутри блоков.
* **bloom&#95;filter**: Вероятностно определяет, существует ли значение в блоке, обеспечивая быстрое приближенное фильтрование по принадлежности к множеству. Эффективен для оптимизации запросов, которые ищут «иглу в стоге сена», где требуется положительное совпадение.
* **tokenbf&#95;v1 / ngrambf&#95;v1**: Специализированные варианты фильтра Блума, предназначенные для поиска токенов или последовательностей символов в строках — особенно полезны для логов или сценариев полнотекстового поиска.

Несмотря на мощь, индексы пропуска нужно использовать осторожно. Они приносят пользу только тогда, когда позволяют исключить значимое количество блоков данных, и могут, наоборот, вносить дополнительный оверхед, если структура запроса или данных не соответствует их модели. Если в блоке существует хотя бы одно подходящее значение, весь этот блок все равно должен быть прочитан.

**Эффективное использование индексов пропуска часто зависит от сильной корреляции между индексируемым столбцом и первичным ключом таблицы либо от вставки данных таким образом, чтобы схожие значения группировались вместе.**

В целом, индексы пропуска данных лучше всего применять после того, как вы убедились в корректном проектировании первичного ключа и оптимизации типов. Они особенно полезны для:

* Столбцов с высокой общей кардинальностью, но низкой кардинальностью внутри блока.
* Редких значений, критичных для поиска (например, коды ошибок, конкретные идентификаторы).
* Случаев, когда фильтрация выполняется по непервичным столбцам с локализованным распределением.

Всегда:

1. Тестируйте индексы пропуска на реальных данных с реалистичными запросами. Пробуйте разные типы индексов и значения гранулярности.
2. Оценивайте их влияние с помощью инструментов, таких как send&#95;logs&#95;level=&#39;trace&#39; и `EXPLAIN indexes=1`, чтобы увидеть эффективность индекса.
3. Всегда оценивайте размер индекса и то, как на него влияет гранулярность. Уменьшение размера гранулярности часто улучшает производительность до определенного момента, поскольку больше гранул может быть отфильтровано и не потребует сканирования. Однако по мере роста размера индекса при меньшей гранулярности производительность также может снижаться. Измеряйте производительность и размер индекса для различных значений гранулярности. Это особенно актуально для индексов с фильтром Блума.

<p />

**При корректном использовании индексы пропуска могут обеспечить существенный прирост производительности — при бездумном применении они могут добавить ненужные затраты.**

Более подробное руководство по индексам пропуска данных смотрите [здесь](/sql-reference/statements/alter/skipping-index).

## Пример \{#example\}

Рассмотрим следующую оптимизированную таблицу. Она содержит данные Stack Overflow, по одной строке на каждую публикацию.

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

Эта таблица оптимизирована для запросов, которые фильтруют и агрегируют данные по типу поста и дате. Предположим, что мы хотим посчитать количество постов с числом просмотров более 10 000 000, опубликованных после 2009 года.

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

Этот запрос может исключить часть строк (и гранул), используя первичный индекс. Однако основную часть строк всё равно необходимо прочитать, как видно из приведённого выше вывода и следующего результата команды `EXPLAIN indexes = 1`:

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

Простой анализ показывает, что `ViewCount` коррелирует с `CreationDate` (первичным ключом), как и следовало ожидать — чем дольше существует пост, тем больше времени есть, чтобы его просмотреть.

```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

Поэтому это является логичным выбором для индекса пропуска данных. Учитывая числовой тип, имеет смысл использовать индекс `minmax`. Мы добавляем индекс с помощью следующих команд `ALTER TABLE`: сначала создаём его, затем «материализуем».

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

Этот индекс можно было также добавить при первоначальном создании таблицы. Схема с индексом minmax, определённым как часть DDL:

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
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --index here
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

Следующая анимация иллюстрирует, как строится наш индекс пропуска minmax для таблицы из примера: при этом отслеживаются минимальные и максимальные значения `ViewCount` для каждого блока строк (гранулы) в таблице:

<Image img={building_skipping_indices} size="lg" alt="Building skipping indices" />

Повторив наш предыдущий запрос, мы увидим значительный прирост производительности. Обратите внимание на уменьшившееся количество сканируемых строк:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.012 sec. Processed 39.11 thousand rows, 321.39 KB (3.40 million rows/s., 27.93 MB/s.)
```

Запрос `EXPLAIN indexes = 1` подтверждает, что используется индекс.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```

┌─explain────────────────────────────────────────────────────────────┐
│ Выражение ((Project names + Projection))                          │
│   Агрегирование                                                   │
│     Выражение (до GROUP BY)                                       │
│       Выражение                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                   │
│         Индексы:                                                  │
│           MinMax                                                  │
│             Ключи:                                                │
│               CreationDate                                        │
│             Условие: (CreationDate in (&#39;1230768000&#39;, +Inf))      │
│             Частей: 123/128                                       │
│             Гранул: 8513/8545                                     │
│           Partition                                               │
│             Ключи:                                                │
│               toYear(CreationDate)                                │
│             Условие: (toYear(CreationDate) in [2009, +Inf))       │
│             Частей: 123/123                                       │
│             Гранул: 8513/8513                                     │
│           PrimaryKey                                              │
│             Ключи:                                                │
│               toDate(CreationDate)                                │
│             Условие: (toDate(CreationDate) in [14245, +Inf))      │
│             Частей: 123/123                                       │
│             Гранул: 8513/8513                                     │
│           Skip                                                    │
│             Имя: view&#95;count&#95;idx                             │
│             Описание: minmax GRANULARITY 1                        │
│             Частей: 5/123                                         │
│             Гранул: 23/8513                                       │
└────────────────────────────────────────────────────────────────────┘

29 строк в наборе. Прошло: 0.211 сек.

```

Также показана анимация того, как индекс пропуска minmax отсекает все блоки строк, которые заведомо не могут содержать совпадения для предиката `ViewCount` > 10,000,000 в нашем примере запроса:

<Image img={using_skipping_indices} size="lg" alt="Использование индексов пропуска"/>
```

## Связанные материалы \{#related-docs\}
- [Руководство по индексам пропуска данных](/optimize/skipping-indexes)
- [Примеры индексов пропуска данных](/optimize/skipping-indexes/examples)
- [Управление индексами пропуска данных](/sql-reference/statements/alter/skipping-index)
- [Информация о системной таблице](/operations/system-tables/data_skipping_indices)
