---
'slug': '/migrations/postgresql/dataset'
'title': 'Миграция данных'
'description': 'Пример набора данных для миграции из PostgreSQL в ClickHouse'
'keywords':
- 'Postgres'
'show_related_blogs': true
'sidebar_label': 'Часть 1'
'doc_type': 'guide'
---
import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> Это **Часть 1** руководства по миграции с PostgreSQL на ClickHouse. Используя практический пример, показывается, как эффективно провести миграцию с помощью подхода репликации в реальном времени (CDC). Многие из охватываемых концепций также применимы к ручной пакетной передаче данных из PostgreSQL в ClickHouse.

## Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции из Postgres в ClickHouse мы используем набор данных Stack Overflow, описанный [здесь](/getting-started/example-datasets/stackoverflow). Он содержит каждую `post`, `vote`, `user`, `comment` и `badge`, которые имели место на Stack Overflow с 2008 года по апрель 2024 года. Схема PostgreSQL для этих данных показана ниже:

<Image img={postgres_stackoverflow_schema} size="lg" alt="Схема PostgreSQL Stack Overflow"/>

*DDL-команды для создания таблиц в PostgreSQL доступны [здесь](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==).*

Эта схема, хотя и не совсем оптимальная, использует ряд популярных функций PostgreSQL, включая первичные ключи, внешние ключи, партиционирование и индексы.

Мы мигрируем каждую из этих концепций на их эквиваленты в ClickHouse.

Для тех пользователей, кто хочет заполнить этот набор данных в экземпляр PostgreSQL для тестирования шагов миграции, мы предоставили данные в формате `pg_dump` для загрузки с DDL, а последующие команды загрузки данных показаны ниже:

```bash

# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql


# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql


# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql


# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql


# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql


# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

Хотя для ClickHouse этот набор данных небольшой, для Postgres он значительный. Выше представлена подмножество, охватывающее первые три месяца 2024 года.

> Хотя наши примеры результатов используют полный набор данных для демонстрации различий в производительности между Postgres и ClickHouse, все шаги, документированные ниже, функционально идентичны с меньшим подмножеством. Пользователям, которые хотят загрузить полный набор данных в Postgres, смотрите [здесь](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==). Из-за внешних ограничений, наложенных вышеуказанной схемой, полный набор данных для PostgreSQL содержит только те строки, которые удовлетворяют ссылочной целостности. [Версия Parquet](/getting-started/example-datasets/stackoverflow), не имеющая таких ограничений, может быть легко загружена напрямую в ClickHouse при необходимости.

## Миграция данных {#migrating-data}

### Репликация в реальном времени (CDC) {#real-time-replication-or-cdc}

Обратитесь к этому [руководству](/integrations/clickpipes/postgres) для настройки ClickPipes для PostgreSQL. Руководство охватывает множество различных типов исходных экземпляров Postgres.

С подходом CDC, используя ClickPipes или PeerDB, каждую таблицу в базе данных PostgreSQL автоматически реплицируют в ClickHouse.

Чтобы обработать обновления и удаления в почти реальном времени, ClickPipes сопоставляет таблицы Postgres с ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree), специально разработанный для обработки обновлений и удалений в ClickHouse. Вы можете найти больше информации о том, как данные реплицируются в ClickHouse с использованием ClickPipes [здесь](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated). Важно отметить, что репликация с использованием CDC создает дублированные строки в ClickHouse при репликации операций обновления или удаления. [Смотрите техники](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) с использованием модификатора [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) для обработки этих случаев в ClickHouse.

Давайте посмотрим, как создается таблица `users` в ClickHouse с использованием ClickPipes.

```sql
CREATE TABLE users
(
    `id` Int32,
    `reputation` String,
    `creationdate` DateTime64(6),
    `displayname` String,
    `lastaccessdate` DateTime64(6),
    `aboutme` String,
    `views` Int32,
    `upvotes` Int32,
    `downvotes` Int32,
    `websiteurl` String,
    `location` String,
    `accountid` Int32,
    `_peerdb_synced_at` DateTime64(9) DEFAULT now64(),
    `_peerdb_is_deleted` Int8,
    `_peerdb_version` Int64
)
ENGINE = ReplacingMergeTree(_peerdb_version)
PRIMARY KEY id
ORDER BY id;
```

После настройки ClickPipes начинает мигрировать все данные из PostgreSQL в ClickHouse. В зависимости от сети и размера развертываний, это должно занять всего несколько минут для набора данных Stack Overflow.

### Ручная пакетная загрузка с периодическими обновлениями {#initial-bulk-load-with-periodic-updates}

С использованием ручного подхода начальная пакетная загрузка набора данных может быть выполнена с помощью:

- **Табличных функций** - Используя [табличную функцию Postgres](/sql-reference/table-functions/postgresql) в ClickHouse, чтобы `SELECT` данные из Postgres и `INSERT` их в таблицу ClickHouse. Актуально для пакетных загрузок до наборов данных объемом несколько сотен ГБ.
- **Экспортов** - Экспорт в промежуточные форматы, такие как CSV или SQL-скрипт. Эти файлы затем могут быть загружены в ClickHouse либо с клиента через оператор `INSERT FROM INFILE`, либо используя объектное хранилище и их связанные функции, т.е. s3, gcs.

При загрузке данных вручную из PostgreSQL вам сначала нужно создать таблицы в ClickHouse. Обратитесь к этой [документации по моделированию данных](/data-modeling/schema-design#establish-initial-schema), которая также использует набор данных Stack Overflow для оптимизации схемы таблиц в ClickHouse.

Типы данных между PostgreSQL и ClickHouse могут отличаться. Чтобы определить эквивалентные типы для каждого из столбцов таблицы, мы можем использовать команду `DESCRIBE` с [табличной функцией Postgres](/sql-reference/table-functions/postgresql). Следующая команда описывает таблицу `posts` в PostgreSQL, измените ее в соответствии с вашей средой:

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

Для обзора соответствий типов данных между PostgreSQL и ClickHouse обратитесь к [документации в приложении](/migrations/postgresql/appendix#data-type-mappings).

Шаги для оптимизации типов для этой схемы идентичны тем, что были бы, если данные загружались из других источников, например, Parquet на S3. Применение процесса, описанного в этом [альтернативном руководстве с использованием Parquet](/data-modeling/schema-design), приводит к следующей схеме:

```sql title="Query"
CREATE TABLE stackoverflow.posts
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
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

Мы можем заполнить это с помощью простого `INSERT INTO SELECT`, считывая данные из PostgreSQL и вставляя их в ClickHouse:

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

Инкрементные загрузки могут, в свою очередь, быть запланированы. Если таблица Postgres принимает только вставки и существует инкрементный id или временная метка, пользователи могут использовать вышеописанный подход с табличной функцией для загрузки инкрементов, т.е. оператор `WHERE` может быть применен к `SELECT`. Этот подход также может быть использован для поддержки обновлений, если гарантируется, что они обновляют один и тот же столбец. Поддержка удалений, однако, потребует полной перезагрузки, что может быть сложно осуществить по мере роста таблицы.

Мы демонстрируем начальную загрузку и инкрементную загрузку, используя `CreationDate` (мы предполагаем, что он обновляется, если строки обновляются).

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse будет передавать простые операторы `WHERE`, такие как `=`, `!=`, `>`,`>=`, `<`, `<=`, и IN на сервер PostgreSQL. Таким образом, инкрементные загрузки можно сделать более эффективными, обеспечив наличие индекса на столбцах, используемых для идентификации измененного набора.

> Возможный метод обнаружения операций UPDATE при использовании репликации запросов заключается в использовании системного столбца [`XMIN`](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (идентификаторы транзакций) в качестве водяного знака - изменение в этом столбце указывает на изменение и, следовательно, может быть применено к целевой таблице. Пользователи, использующие этот подход, должны быть осведомлены о том, что значения `XMIN` могут оборачиваться, и сравнения требуют полного сканирования таблицы, что делает отслеживание изменений более сложным.

[Нажмите здесь для Части 2](/migrations/postgresql/rewriting-queries)