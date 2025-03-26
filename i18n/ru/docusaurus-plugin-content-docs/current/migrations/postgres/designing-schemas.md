---
slug: /migrations/postgresql/designing-schemas
title: 'Проектирование схем'
description: 'Проектирование схем при миграции с PostgreSQL на ClickHouse'
keywords: ['postgres', 'postgresql', 'мигрировать', 'миграция', 'схема']
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import Image from '@theme/IdealImage';

> Это **Часть 2** руководства по миграции с PostgreSQL на ClickHouse. Этот материал можно считать вводным, с целью помочь пользователям развернуть первоначальную функциональную систему, соответствующую лучшим практикам ClickHouse. Избегается сложные темы и это не приведет к полностью оптимизированной схеме; скорее, это предоставит надежную основу для пользователей, чтобы построить производственную систему и на базе этого учиться.

Набор данных Stack Overflow содержит ряд связанных таблиц. Мы рекомендуем сосредоточить миграцию на первичной таблице в первую очередь. Это может быть не обязательно самая большая таблица, а та, по которой вы ожидаете получить наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse, которые особенно важны, если вы пришли из преимущественно OLTP-среды. Эта таблица может потребовать переработки по мере добавления дополнительных таблиц, чтобы полностью использовать функции ClickHouse и достичь оптимальной производительности. Мы изучаем этот процесс моделирования в нашей [Документации по моделированию данных](/data-modeling/schema-design#next-data-modelling-techniques).

## Установление первоначальной схемы {#establish-initial-schema}

Соблюдая этот принцип, мы сосредоточимся на основной таблице `posts`. Схема Postgres для этой таблицы показана ниже:

```sql title="Запрос"
CREATE TABLE posts (
   Id int,
   PostTypeId int,
   AcceptedAnswerId text,
   CreationDate timestamp,
   Score int,
   ViewCount int,
   Body text,
   OwnerUserId int,
   OwnerDisplayName text,
   LastEditorUserId text,
   LastEditorDisplayName text,
   LastEditDate timestamp,
   LastActivityDate timestamp,
   Title text,
   Tags text,
   AnswerCount int,
   CommentCount int,
   FavoriteCount int,
   ContentLicense text,
   ParentId text,
   CommunityOwnedDate timestamp,
   ClosedDate timestamp,
   PRIMARY KEY (Id),
   FOREIGN KEY (OwnerUserId) REFERENCES users(Id)
)
```

Чтобы установить эквивалентные типы для каждого из приведенных выше столбцов, мы можем использовать команду `DESCRIBE` с [табличной функцией Postgres](/sql-reference/table-functions/postgresql). Измените следующую команду для вашей инстанции Postgres:

```sql title="Запрос"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

```response title="Ответ"
┌─name──────────────────┬─type────────────────────┐
│ id                    │ Int32                   │
│ posttypeid            │ Nullable(Int32)         │
│ acceptedanswerid      │ Nullable(String)        │
│ creationdate          │ Nullable(DateTime64(6)) │
│ score                 │ Nullable(Int32)         │
│ viewcount             │ Nullable(Int32)         │
│ body                  │ Nullable(String)        │
│ owneruserid           │ Nullable(Int32)         │
│ ownerdisplayname      │ Nullable(String)        │
│ lasteditoruserid      │ Nullable(String)        │
│ lasteditordisplayname │ Nullable(String)        │
│ lasteditdate          │ Nullable(DateTime64(6)) │
│ lastactivitydate      │ Nullable(DateTime64(6)) │
│ title                 │ Nullable(String)        │
│ tags                  │ Nullable(String)        │
│ answercount           │ Nullable(Int32)         │
│ commentcount          │ Nullable(Int32)         │
│ favoritecount         │ Nullable(Int32)         │
│ contentlicense        │ Nullable(String)        │
│ parentid              │ Nullable(String)        │
│ communityowneddate    │ Nullable(DateTime64(6)) │
│ closeddate            │ Nullable(DateTime64(6)) │
└───────────────────────┴─────────────────────────┘

22 строки в наборе. Затрачено: 0.478 сек.
```

Это дает нам первоначальную не оптимизированную схему.

> Без ограничения `NOT NULL` столбцы Postgres могут содержать Null значения. Без проверки значений строк ClickHouse сопоставляет их эквивалентным Nullable типам. Обратите внимание, что первичный ключ не может быть Null, что является обязательным в Postgres.

Мы можем создать таблицу ClickHouse, используя эти типы, с помощью простой команды `CREATE AS EMPTY SELECT`.

```sql title="Запрос"
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
```

Тот же подход можно использовать для загрузки данных из s3 в других форматах. См. здесь аналогичный пример загрузки этих данных из формата Parquet.

## Первоначальная загрузка {#initial-load}

Создав таблицу, мы можем вставить строки из Postgres в ClickHouse, используя [табличную функцию Postgres](/sql-reference/table-functions/postgresql).

```sql title="Запрос"
INSERT INTO posts SELECT *
FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 строки в наборе. Затрачено: 1136.841 сек. Обработано 58.89 миллиона строк, 80.85 ГБ (51.80 тысяч строк/с., 71.12 МБ/с.)
Пиковое использование памяти: 2.51 GiB.
```

> Эта операция может создавать значительную нагрузку на Postgres. Пользователи могут захотеть восполнить данные альтернативными операциями, чтобы избежать воздействия на производственные нагрузки, например, экспортировать SQL-скрипт. Производительность этой операции будет зависеть от размеров кластера Postgres и ClickHouse и их сетевого соединения.

> Каждый `SELECT` из ClickHouse в Postgres использует одно соединение. Это соединение берется из пула подключений на стороне сервера, размеры которого определяются настройкой `postgresql_connection_pool_size` (по умолчанию 16).

Если использовать полный набор данных, пример должен загрузить 59 миллионов постов. Подтвердите с помощью простого подсчета в ClickHouse:

```sql title="Запрос"
SELECT count()
FROM posts
```

```response title="Ответ"
┌──count()─┐
│ 58889566 │
└──────────┘
```

## Оптимизация типов {#optimizing-types}

Шаги по оптимизации типов для этой схемы идентичны тем, что используются, если данные были загружены из других источников, например, Parquet на S3. Применение процесса, описанного в этом [альтернативном руководстве с использованием Parquet](/data-modeling/schema-design), приводит к следующей схеме:

```sql title="Запрос"
CREATE TABLE posts_v2
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
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
COMMENT 'Оптимизированные типы'
```

Мы можем заполнить это простым запросом `INSERT INTO SELECT`, читая данные из нашей предыдущей таблицы и вставляя в эту:

```sql title="Запрос"
INSERT INTO posts_v2 SELECT * FROM posts
0 строк в наборе. Затрачено: 146.471 сек. Обработано 59.82 миллиона строк, 83.82 ГБ (408.40 тысяч строк/с., 572.25 МБ/с.)
```

Мы не сохраняем никаких null в нашей новой схеме. Вышеупомянутая вставка неявно преобразует их в значения по умолчанию для их соответствующих типов - 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения к их целевой точности.

## Первичные (упорядочивающие) ключи в ClickHouse {#primary-ordering-keys-in-clickhouse}

Пользователи, пришедшие из OLTP баз данных, часто ищут эквивалентную концепцию в ClickHouse. Замечая, что ClickHouse поддерживает синтаксис `PRIMARY KEY`, пользователи могут быть искушены определить схему своей таблицы, используя те же ключи, что и в исходной OLTP базе данных. Это нецелесообразно.

### Чем первичные ключи ClickHouse отличаются? {#how-are-clickhouse-primary-keys-different}

Чтобы понять, почему использование вашего OLTP первичного ключа в ClickHouse нецелесообразно, пользователи должны понимать основы индексирования ClickHouse. Мы используем Postgres как пример для сравнения, но эти общие концепции применимы и к другим OLTP базам данных.

- Первичные ключи Postgres, по определению, уникальны для каждой строки. Использование [структур B-дерева](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) позволяет эффективно находить отдельные строки по этому ключу. Хотя ClickHouse может быть оптимизирован для поиска значения одной строки, аналитические нагрузки обычно требуют чтения нескольких столбцов, но для множества строк. Фильтры часто должны определять **подмножество строк**, на которых будет выполняться агрегация.
- Эффективность памяти и диска имеет первостепенное значение в масштабе, на котором ClickHouse часто используется. Данные записываются в таблицы ClickHouse партиями, известными как части, с применением правил для слияния частей в фоновом режиме. В ClickHouse каждая часть имеет свой первичный индекс. Когда части сливаются, первичные индексы слитых частей также сливаются. В отличие от Postgres, эти индексы не строятся для каждой строки. Вместо этого первичный индекс для части имеет одну запись индекса на группу строк - эта техника называется **разреженным индексированием**.
- **Разреженное индексирование** возможно, потому что ClickHouse хранит строки для части на диске в порядке, заданном указанным ключом. Вместо того, чтобы напрямую находить отдельные строки (как в индексе на основе B-дерева), разреженный первичный индекс позволяет быстро (через бинарный поиск по записям индекса) определить группы строк, которые могут соответствовать запросу. Найденные группы потенциально соответствующих строк затем параллельно передаются в движок ClickHouse, чтобы найти соответствия. Этот дизайн индекса позволяет сделать первичный индекс небольшим (он полностью помещается в основную память), при этом значительно ускоряя время выполнения запросов, особенно для диапазонных запросов, которые типичны для аналитических задач. Для получения более подробной информации мы рекомендуем это [углубленное руководство](/guides/best-practices/sparse-primary-indexes).

<Image img={postgres_b_tree} size="lg" alt="Индекс B-дерева PostgreSQL"/>

<Image img={postgres_sparse_index} size="lg" alt="Разреженный индекс PostgreSQL"/>

Выбранный ключ в ClickHouse определяет не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого это может значительно повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Упорядочивающий ключ, который заставляет значения большинства столбцов записываться в непрерывном порядке, позволяет выбранному алгоритму сжатия (и кодекам) более эффективно сжимать данные.

> Все столбцы в таблице будут отсортированы на основе значения указанного упорядочивающего ключа, независимо от того, включены ли они в сам ключ. Например, если `CreationDate` используется как ключ, порядок значений во всех других столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько упорядочивающих ключей - это будет упорядочивать с той же семантикой, что и предложение `ORDER BY` в запросе `SELECT`.

### Выбор упорядочивающего ключа {#choosing-an-ordering-key}

Для соображений и шагов по выбору упорядочивающего ключа, используя таблицу постов в качестве примера, см. [здесь](/data-modeling/schema-design#choosing-an-ordering-key).

## Сжатие {#compression}

Столбцовая структура хранения ClickHouse означает, что сжатие часто будет значительно лучше по сравнению с Postgres. Следующее иллюстрирует сравнение требований к хранению для всех таблиц Stack Overflow в обеих базах данных:

```sql title="Запрос (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="Запрос (ClickHouse)"
SELECT
        `table`,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="Ответ"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB       │
│ users       │ 846.57 MiB      │
│ badges      │ 513.13 MiB      │
│ comments    │ 7.11 GiB        │
│ votes       │ 1.28 GiB        │
│ posthistory │ 40.44 GiB       │
│ postlinks   │ 79.22 MiB       │
└─────────────┴─────────────────┘
```

Дополнительные детали по оптимизации и измерению сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).

[Нажмите здесь, чтобы перейти к Часть 3](/migrations/postgresql/data-modeling-techniques).
