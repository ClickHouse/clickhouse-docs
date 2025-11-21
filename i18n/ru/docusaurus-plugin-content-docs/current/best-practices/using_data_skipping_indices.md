---
slug: /best-practices/use-data-skipping-indices-where-appropriate
sidebar_position: 10
sidebar_label: 'Индексы пропуска данных'
title: 'Применяйте индексы пропуска данных, где это целесообразно'
description: 'Страница, описывающая, как и когда использовать индексы пропуска данных'
keywords: ['индекс пропуска данных', 'skip index']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import building_skipping_indices from '@site/static/images/bestpractices/building_skipping_indices.gif';
import using_skipping_indices from '@site/static/images/bestpractices/using_skipping_indices.gif';

Индексы пропуска данных следует рассматривать после того, как были применены предыдущие рекомендации по оптимизации, т. е. оптимизированы типы, выбран хороший первичный ключ и задействованы материализованные представления. Если вы только начинаете работать с индексами пропуска, [это руководство](/optimize/skipping-indexes) — хорошая отправная точка.

Эти типы индексов можно использовать для ускорения выполнения запросов, если применять их аккуратно и с пониманием того, как они работают.

ClickHouse предоставляет мощный механизм под названием **индексы пропуска данных**, который может значительно сократить объем данных, читаемых во время выполнения запроса — особенно когда первичный ключ не помогает для конкретного условия фильтрации. В отличие от традиционных баз данных, полагающихся на строковые вторичные индексы (например, B-деревья), ClickHouse является колонночным хранилищем и не хранит местоположения строк таким образом, чтобы поддерживать подобные структуры. Вместо этого он использует skip‑индексы, которые помогают избегать чтения блоков данных, гарантированно не соответствующих условиям фильтрации запроса.

Skip‑индексы работают за счет хранения метаданных о блоках данных — таких как минимальные/максимальные значения, множества значений или представления в виде фильтра Блума — и использования этих метаданных при выполнении запроса для определения, какие блоки данных можно полностью пропустить. Они применимы только к семейству движков таблиц [MergeTree](/engines/table-engines/mergetree-family/mergetree) и определяются с использованием выражения, типа индекса, имени и гранулярности, задающей размер каждого индексируемого блока. Эти индексы хранятся вместе с данными таблицы и используются, когда фильтр запроса соответствует выражению индекса.

Существует несколько типов индексов пропуска данных, каждый из которых подходит для разных типов запросов и распределений данных:

* **minmax**: Отслеживает минимальное и максимальное значение выражения на блок. Идеален для диапазонных запросов по слабо отсортированным данным.
* **set(N)**: Отслеживает множество значений до указанного размера N для каждого блока. Эффективен для столбцов с низкой кардинальностью внутри блоков.
* **bloom&#95;filter**: Вероятностно определяет, существует ли значение в блоке, обеспечивая быстрое приближенное фильтрование по принадлежности к множеству. Эффективен для оптимизации запросов по поиску «иголки в стоге сена», когда требуется обнаружить положительное совпадение.
* **tokenbf&#95;v1 / ngrambf&#95;v1**: Специализированные варианты фильтра Блума, предназначенные для поиска токенов или последовательностей символов в строках — особенно полезны для логовых данных или сценариев текстового поиска.

Несмотря на мощь, skip‑индексы необходимо использовать с осторожностью. Они приносят пользу только тогда, когда позволяют исключить значимое количество блоков данных, и могут фактически вносить накладные расходы, если структура запроса или данных им не соответствует. Если в блоке существует хотя бы одно подходящее значение, этот блок всё равно должен быть прочитан.

**Эффективное использование skip‑индексов часто зависит от сильной корреляции между индексируемым столбцом и первичным ключом таблицы или от вставки данных таким образом, чтобы похожие значения группировались вместе.**

В целом, индексы пропуска данных лучше всего применять после того, как обеспечен корректный дизайн первичного ключа и оптимизация типов. Они особенно полезны для:

* Столбцов с высокой общей кардинальностью, но низкой кардинальностью внутри блока.
* Редких значений, критичных для поиска (например, коды ошибок, конкретные идентификаторы).
* Случаев, когда фильтрация выполняется по столбцам, не входящим в первичный ключ, с локализованным распределением.

Всегда:

1. Тестируйте skip‑индексы на реальных данных с реалистичными запросами. Пробуйте разные типы индексов и значения гранулярности.
2. Оценивайте их влияние с помощью инструментов вроде send&#95;logs&#95;level=&#39;trace&#39; и `EXPLAIN indexes=1` для анализа эффективности индексов.
3. Всегда оценивайте размер индекса и то, как на него влияет гранулярность. Уменьшение размера гранулярности зачастую будет улучшать производительность до определенного момента, поскольку больше гранул будет отфильтровано и меньше потребуется сканировать. Однако по мере роста размера индекса при более низкой гранулярности производительность также может ухудшаться. Измеряйте производительность и размер индекса для различных значений гранулярности. Это особенно важно для индексов с фильтром Блума.

<p />

**При правильном использовании skip‑индексы могут обеспечить существенный прирост производительности — при бездумном использовании они могут добавить ненужные затраты.**

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

Эта таблица оптимизирована для запросов, которые фильтруют и агрегируют данные по типу публикации и дате. Предположим, необходимо подсчитать количество публикаций с более чем 10 000 000 просмотров, опубликованных после 2009 года.

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

1 row in set. Elapsed: 0.720 sec. Processed 59.55 million rows, 230.23 MB (82.66 million rows/s., 319.56 MB/s.)
```

Этот запрос может исключить некоторые строки (и гранулы) с помощью первичного индекса. Однако большинство строк всё равно необходимо прочитать, как показано в приведённом выше ответе и следующем выводе `EXPLAIN indexes = 1`:

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

Следовательно, это логичный выбор для индекса пропуска данных. Учитывая числовой тип, имеет смысл использовать индекс minmax. Мы добавляем индекс с помощью следующих команд `ALTER TABLE`: сначала добавляем его, затем «материализуем».

```sql
ALTER TABLE stackoverflow.posts
  (ADD INDEX view_count_idx ViewCount TYPE minmax GRANULARITY 1);

ALTER TABLE stackoverflow.posts MATERIALIZE INDEX view_count_idx;
```

Этот индекс можно было также добавить при первоначальном создании таблицы. Схема, в которой индекс minmax определён как часть DDL:

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

Следующая анимация демонстрирует, как для нашей примерной таблицы строится индекс пропуска minmax, который отслеживает минимальные и максимальные значения `ViewCount` для каждого блока строк (гранулы) в таблице:

<Image img={building_skipping_indices} size="lg" alt="Построение индексов пропуска" />

Повторный запуск нашего предыдущего запроса показывает существенный прирост производительности. Обратите внимание на уменьшившееся количество просканированных строк:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)

┌─count()─┐
│     5   │
└─────────┘

Получена 1 строка. Затрачено: 0.012 сек. Обработано 39.11 тыс. строк, 321.39 КБ (3.40 млн строк/сек., 27.93 МБ/сек.)
```

Команда `EXPLAIN indexes = 1` показывает, что используется индекс.

```sql
EXPLAIN indexes = 1
SELECT count()
FROM stackoverflow.posts
WHERE (CreationDate > '2009-01-01') AND (ViewCount > 10000000)
```


┌─explain────────────────────────────────────────────────────────────┐
│ Выражение ((Project names + Projection))                          │
│   Агрегирование                                                   │
│     Выражение (До GROUP BY)                                       │
│       Выражение                                                   │
│         ReadFromMergeTree (stackoverflow.posts)                   │
│         Индексы:                                                  │
│           MinMax                                                  │
│             Ключи:                                                │
│               CreationDate                                        │
│             Условие: (CreationDate in (&#39;1230768000&#39;, +Inf))      │
│             Части: 123/128                                        │
│             Гранулы: 8513/8545                                    │
│           Partition                                               │
│             Ключи:                                                │
│               toYear(CreationDate)                                │
│             Условие: (toYear(CreationDate) in [2009, +Inf))       │
│             Части: 123/123                                        │
│             Гранулы: 8513/8513                                    │
│           PrimaryKey                                              │
│             Ключи:                                                │
│               toDate(CreationDate)                                │
│             Условие: (toDate(CreationDate) in [14245, +Inf))      │
│             Части: 123/123                                        │
│             Гранулы: 8513/8513                                    │
│           Skip                                                    │
│             Имя: view&#95;count&#95;idx                             │
│             Описание: minmax GRANULARITY 1                        │
│             Части: 5/123                                          │
│             Гранулы: 23/8513                                      │
└────────────────────────────────────────────────────────────────────┘

29 строк в наборе. Прошло: 0.211 сек.

```

Также мы показываем анимацию того, как индекс пропуска minmax исключает все блоки строк, которые заведомо не могут содержать совпадения для предиката `ViewCount` > 10,000,000 в нашем примере запроса:

<Image img={using_skipping_indices} size="lg" alt="Использование индексов пропуска"/>
```


## Связанные документы {#related-docs}

- [Руководство по индексам пропуска данных](/optimize/skipping-indexes)
- [Примеры индексов пропуска данных](/optimize/skipping-indexes/examples)
- [Управление индексами пропуска данных](/sql-reference/statements/alter/skipping-index)
- [Информация в системных таблицах](/operations/system-tables/data_skipping_indices)
