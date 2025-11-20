---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'Индексы пропуска данных'
title: 'Используйте индексы пропуска данных, когда это оправдано'
description: 'Страница, описывающая, как и когда использовать индексы пропуска данных'
keywords: ['data skipping index', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

Индексы пропуска данных следует рассматривать, когда уже выполнены предыдущие рекомендации по лучшим практикам, то есть оптимизированы типы, выбран хороший первичный ключ и используются материализованные представления. Если вы впервые сталкиваетесь с индексами пропуска, [это руководство](/optimize/skipping-indexes) — хорошая отправная точка.

Эти типы индексов можно использовать для ускорения выполнения запросов, если применять их осторожно и с пониманием принципа их работы.

ClickHouse предоставляет мощный механизм под названием **индексы пропуска данных**, который может существенно сократить объем данных, сканируемых при выполнении запроса — особенно когда первичный ключ мало помогает для конкретного условия фильтрации. В отличие от традиционных баз данных, которые полагаются на строковые вторичные индексы (например, B-деревья), ClickHouse является колонночным хранилищем и не хранит положения строк в формате, пригодном для таких структур. Вместо этого он использует индексы пропуска, которые помогают избегать чтения блоков данных, заведомо не соответствующих условиям фильтрации запроса.

Индексы пропуска работают за счет хранения метаданных о блоках данных — таких как минимальные/максимальные значения, наборы значений или представления на основе фильтра Блума — и использования этих метаданных во время выполнения запроса для определения, какие блоки данных можно полностью пропустить. Они применимы только к семейству движков таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree) и задаются с помощью выражения, типа индекса, имени и гранулярности, определяющей размер каждого индексируемого блока. Эти индексы хранятся вместе с данными таблицы и используются, когда фильтр запроса соответствует выражению индекса.

Существует несколько типов индексов пропуска данных, каждый из которых подходит для определенных типов запросов и распределений данных:

* **minmax**: Отслеживает минимальное и максимальное значение выражения на блок. Идеально подходит для диапазонных запросов по слабо отсортированным данным.
* **set(N)**: Отслеживает набор значений размером до N для каждого блока. Эффективен для столбцов с низкой кардинальностью внутри блока.
* **bloom&#95;filter**: Вероятностно определяет, существует ли значение в блоке, обеспечивая быстрое приближенное фильтрование по вхождению в множество. Эффективен для оптимизации запросов, ищущих «иголку в стоге сена», когда важна положительная находка.
* **tokenbf&#95;v1 / ngrambf&#95;v1**: Специализированные варианты фильтра Блума, предназначенные для поиска токенов или последовательностей символов в строках — особенно полезны для логов или сценариев текстового поиска.

Несмотря на свою мощь, индексы пропуска нужно использовать осторожно. Они приносят пользу только тогда, когда исключают значимое количество блоков данных, и могут, напротив, вносить накладные расходы, если структура запросов или данных с ними не согласуется. Если в блоке существует хотя бы одно подходящее значение, этот блок все равно должен быть прочитан целиком.

**Эффективное использование индексов пропуска часто зависит от сильной корреляции между индексируемым столбцом и первичным ключом таблицы или от способа вставки данных, при котором похожие значения группируются вместе.**

В целом, индексы пропуска данных лучше всего применять после того, как обеспечен корректный дизайн первичного ключа и оптимизация типов. Они особенно полезны для:

* Столбцов с высокой общей кардинальностью, но низкой кардинальностью внутри блока.
* Редких значений, критически важных для поиска (например, коды ошибок, конкретные идентификаторы).
* Сценариев, когда фильтрация выполняется по столбцам, не входящим в первичный ключ, но имеющим локализованное распределение.

Всегда:

1. Тестируйте индексы пропуска на реальных данных с реалистичными запросами. Пробуйте разные типы индексов и значения гранулярности.
2. Оценивайте их влияние с помощью таких инструментов, как send&#95;logs&#95;level=&#39;trace&#39; и `EXPLAIN indexes=1`, чтобы увидеть эффективность индексов.
3. Всегда оценивайте размер индекса и то, как на него влияет гранулярность. Уменьшение размера гранулярности часто улучшает производительность до определенного предела, поскольку больше гранул будет отфильтровано и потребует сканирования. Однако по мере увеличения размера индекса при меньшей гранулярности производительность также может ухудшаться. Измеряйте производительность и размер индекса для различных значений гранулярности. Это особенно актуально для индексов на основе фильтра Блума.

<p />

**При корректном использовании индексы пропуска могут дать существенный прирост производительности — при неосознанном применении они могут добавить ненужные затраты.**

Более подробное руководство по индексам пропуска данных см. [здесь](/sql-reference/statements/alter/skipping-index).


## Пример {#example}

Рассмотрим следующую оптимизированную таблицу. Она содержит данные Stack Overflow, где каждая строка соответствует одной публикации.

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

Эта таблица оптимизирована для запросов, которые фильтруют и агрегируют данные по типу публикации и дате. Предположим, нам нужно подсчитать количество публикаций с более чем 10 000 000 просмотров, опубликованных после 2009 года.

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

Этот запрос может исключить часть строк (и гранул) с помощью первичного индекса. Однако большинство строк всё равно необходимо прочитать, как видно из приведённого выше результата и следующего вывода `EXPLAIN indexes = 1`:

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

Простой анализ показывает, что `ViewCount` коррелирует с `CreationDate` (первичным ключом), как и следовало ожидать — чем дольше существует публикация, тем больше времени она доступна для просмотра.


```sql
SELECT toDate(CreationDate) AS day, avg(ViewCount) AS view_count FROM stackoverflow.posts WHERE day > '2009-01-01'  GROUP BY day
```

Следовательно, это логичный выбор для индекса пропуска данных. Учитывая числовой тип, имеет смысл использовать индекс `minmax`. Мы добавляем индекс с помощью следующих команд `ALTER TABLE`: сначала добавляем его, затем «материализуем».

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
  INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1 --индекс здесь
)
ENGINE = MergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate))
```

Следующая анимация показывает, как для примерной таблицы строится наш пропускающий индекс `minmax`, который отслеживает минимальные и максимальные значения `ViewCount` для каждого блока строк (гранулы) в таблице:

<Image img={building_skipping_indices} size="lg" alt="Построение пропускающих индексов" />

Повторный запуск нашего предыдущего запроса демонстрирует значительный прирост производительности. Обратите внимание на уменьшение числа просканированных строк:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

Получена 1 строка. Затрачено: 0.012 сек. Обработано 39.11 тыс. строк, 321.39 КБ (3.40 млн строк/сек., 27.93 МБ/сек.)
```

Команда `EXPLAIN indexes = 1` подтверждает использование индекса.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


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
│             Condition: (CreationDate in (&#39;1230768000&#39;, +Inf))      │
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
│             Name: view&#95;count&#95;idx                                   │
│             Description: minmax GRANULARITY 1                      │
│             Parts: 5/123                                           │
│             Granules: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 rows in set. Elapsed: 0.211 sec.

```

Также мы показываем анимацию того, как индекс minmax пропускает все блоки строк, которые заведомо не могут содержать совпадения для предиката `ViewCount` > 10,000,000 в нашем примере запроса:

<Image img={using_skipping_indices} size="lg" alt="Использование индексов пропуска"/>
```


## Связанные документы {#related-docs}

- [Руководство по индексам пропуска данных](/optimize/skipping-indexes)
- [Примеры индексов пропуска данных](/optimize/skipping-indexes/examples)
- [Управление индексами пропуска данных](/sql-reference/statements/alter/skipping-index)
- [Информация в системных таблицах](/operations/system-tables/data_skipping_indices)
