---
slug: /migrations/postgresql/designing-schemas
title: 'Проектирование схем'
description: 'Проектирование схем при миграции из PostgreSQL в ClickHouse'
keywords: ['postgres', 'postgresql', 'миграция', 'миграция', 'схема']
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import Image from '@theme/IdealImage';

> Это **Часть 2** руководства по миграции из PostgreSQL в ClickHouse. Этот контент можно считать вводным, цель которого - помочь пользователям развернуть начальную функциональную систему, которая соответствует передовым практикам ClickHouse. Он избегает сложных тем и не приведет к полностью оптимизированной схеме; скорее, он предоставляет прочную базу для пользователей, чтобы построить производственную систему и основать свое обучение.

Набор данных Stack Overflow содержит ряд связанных таблиц. Мы рекомендуем сосредоточиться на миграции их основной таблицы в первую очередь. Это не обязательно должна быть самая большая таблица, а та, на которую вы ожидаете получить наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse, которые особенно важны, если вы приходите из в основном OLTP окружения. Эта таблица может потребовать переосмысления по мере добавления дополнительных таблиц для полного использования возможностей ClickHouse и получения оптимальной производительности. Мы изучаем этот процесс моделирования в нашей [документации по моделированию данных](/data-modeling/schema-design#next-data-modelling-techniques).

## Установка начальной схемы {#establish-initial-schema}

Следуя этому принципу, мы сосредоточимся на основной таблице `posts`. Схема Postgres для этой таблицы показана ниже:

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

Чтобы установить эквивалентные типы для каждого из указанных столбцов, мы можем использовать команду `DESCRIBE` с [табличной функцией Postgres](/sql-reference/table-functions/postgresql). Измените следующую команду для вашей установки Postgres:

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

22 строки в наборе. Затраченное время: 0.478 сек.
```

Это дает нам начальную не оптимизированную схему.

> Без ограничения `NOT NULL` столбцы Postgres могут содержать нулевые значения. Не проверяя значения строк, ClickHouse сопоставляет их с эквивалентнымиNullable типами. Обратите внимание, что первичный ключ не может быть Null, что является требованием в Postgres.

Мы можем создать таблицу ClickHouse, используя эти типы с помощью команды `CREATE AS EMPTY SELECT`.

```sql title="Запрос"
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
```

Этот же подход можно использовать для загрузки данных из s3 в других форматах. Здесь приведен эквивалентный пример загрузки этих данных из формата Parquet.

## Начальная загрузка {#initial-load}

С созданной таблицей мы можем вставить строки из Postgres в ClickHouse, используя [табличную функцию Postgres](/sql-reference/table-functions/postgresql).

```sql title="Запрос"
INSERT INTO posts SELECT *
FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 строки в наборе. Затраченное время: 1136.841 сек. Обработано 58.89 миллионов строк, 80.85 ГБ (51.80 тысяч строк/с, 71.12 МБ/с).
Пиковое использование памяти: 2.51 GiB.
```

> Эта операция может создать значительную нагрузку на Postgres. Пользователи могут пожелать заполнить с помощью альтернативных операций, чтобы избежать влияния на рабочие загрузки в производстве, например, экспортировать SQL-скрипт. Производительность этой операции будет зависеть от размеров вашего кластера Postgres и ClickHouse и их сетевых соединений.

> Каждый `SELECT` из ClickHouse в Postgres использует одно соединение. Это соединение берется из пула соединений на стороне сервера, размер которого определяется настройкой `postgresql_connection_pool_size` (по умолчанию 16).

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

Шаги по оптимизации типов для этой схемы идентичны, как если бы данные были загружены из других источников, например, Parquet на S3. Применение процесса, описанного в этом [альтернативном руководстве с использованием Parquet](/data-modeling/schema-design), приводит к следующей схеме:

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

Мы можем заполнить эту таблицу простой командой `INSERT INTO SELECT`, считывая данные из нашей предыдущей таблицы и вставляя их в эту:

```sql title="Запрос"
INSERT INTO posts_v2 SELECT * FROM posts
0 строк в наборе. Затраченное время: 146.471 сек. Обработано 59.82 миллионов строк, 83.82 ГБ (408.40 тысяч строк/с, 572.25 МБ/с.)
```

В нашей новой схеме мы не сохраняем никаких Null-значений. Указанный выше запрос преобразует их неявно в значения по умолчанию для соответствующих типов - 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения в их целевую точность.

## Первичные (упорядочивающие) ключи в ClickHouse {#primary-ordering-keys-in-clickhouse}

Пользователи, использующие OLTP базы данных, часто ищут эквивалентное понятие в ClickHouse. Замечая, что ClickHouse поддерживает синтаксис `PRIMARY KEY`, пользователи могут быть склонны определять схему своей таблицы, используя те же ключи, что и в их исходной OLTP базе данных. Это неуместно.

### Чем первичные ключи ClickHouse отличаются? {#how-are-clickhouse-primary-keys-different}

Чтобы понять, почему использование вашего OLTP первичного ключа в ClickHouse неуместно, пользователи должны понять основы индексирования ClickHouse. Мы используем Postgres в качестве примера для сравнения, но эти общие概念 применимы и к другим OLTP базам данных.

- Первичные ключи Postgres по определению уникальны для каждой строки. Использование [B-деревьев](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) позволяет эффективно находить отдельные строки по этому ключу. Хотя ClickHouse может быть оптимизирован для поиска одного значения строки, аналитические нагрузки обычно требуют считывания нескольких столбцов, но для многих строк. Фильтры чаще должны идентифицировать **подмножество строк**, для которых будет выполняться агрегация.
- Эффективность памяти и диска имеет первостепенное значение на том уровне, на котором ClickHouse часто используется. Данные записываются в таблицы ClickHouse порциями, известными как части, с применением правил для слияния частей в фоновом режиме. В ClickHouse у каждой части есть свой первичный индекс. Когда части объединяются, первичные индексы объединенных частей также сливаются. В отличие от Postgres, эти индексы не строятся для каждой строки. Вместо этого первичный индекс для части имеет одну запись индекса на группу строк - эта техника называется **разреженным индексированием**.
- **Разреженное индексирование** возможно, потому что ClickHouse хранит строки для части на диске, упорядоченные по указанному ключу. Вместо того чтобы напрямую находить отдельные строки (как это делает индекс на основе B-дерева), разреженный первичный индекс позволяет быстро (через бинарный поиск по записям индекса) определить группы строк, которые могут соответствовать запросу. Найденные группы потенциально подходящих строк затем параллельно передаются в движок ClickHouse для нахождения совпадений. Этот дизайн индекса позволяет первичному индексу быть небольшим (он полностью помещается в основную память), при этом значительно ускоряет время выполнения запросов, особенно для диапазонных запросов, которые типичны для аналитических случаев использования. Для получения дополнительной информации мы рекомендуем это [подробное руководство](/guides/best-practices/sparse-primary-indexes).

<Image img={postgres_b_tree} size="lg" alt="Индекс B-дерева PostgreSQL"/>

<Image img={postgres_sparse_index} size="lg" alt="Разреженный индекс PostgreSQL"/>

Выбранный ключ в ClickHouse определит не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого это может значительно повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Упорядочивающий ключ, который заставляет значения большинства столбцов записываться в непрерывном порядке, позволит выбранному алгоритму сжатия (и кодекам) более эффективно сжимать данные.

> Все столбцы в таблице будут отсортированы на основе значений указанного упорядочивающего ключа, независимо от того, включены они в сам ключ или нет. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Можно указать несколько упорядочивающих ключей - это будет упорядочивать с теми же семантиками, что и clause `ORDER BY` в запросе `SELECT`.

### Выбор упорядочивающего ключа {#choosing-an-ordering-key}

Для рекомендаций и шагов при выборе упорядочивающего ключа, используя таблицу постов в качестве примера, смотрите [здесь](/data-modeling/schema-design#choosing-an-ordering-key).

## Сжатие {#compression}

Столбцовая структура хранения ClickHouse означает, что сжатие часто будет значительно эффективнее по сравнению с Postgres. Ниже приведено сравнение требований к памяти для всех таблиц Stack Overflow в обеих базах данных:

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

Дополнительные сведения об оптимизации и измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).

[Нажмите здесь для Часть 3](/migrations/postgresql/data-modeling-techniques).
