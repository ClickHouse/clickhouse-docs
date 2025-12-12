---
slug: /migrations/postgresql/dataset
title: 'Миграция данных'
description: 'Пример набора данных для миграции из PostgreSQL в ClickHouse'
keywords: ['Postgres']
show_related_blogs: true
sidebar_label: 'Часть 1'
doc_type: 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> Это **часть 1** руководства по миграции с PostgreSQL на ClickHouse. На практическом примере показано, как эффективно выполнить миграцию с использованием подхода репликации данных в режиме реального времени (CDC — фиксация изменений данных). Многие описанные концепции также применимы к ручной массовой передаче данных из PostgreSQL в ClickHouse.

## Набор данных {#dataset}

В качестве примерного набора данных, демонстрирующего типичную миграцию из Postgres в ClickHouse, мы используем набор данных Stack Overflow, описанный [здесь](/getting-started/example-datasets/stackoverflow). Он содержит каждую запись типов `post`, `vote`, `user`, `comment` и `badge`, появившуюся на Stack Overflow с 2008 по апрель 2024 года. Схема PostgreSQL для этих данных показана ниже:

<Image img={postgres_stackoverflow_schema} size="lg" alt="Схема PostgreSQL Stack Overflow"/>

*Команды DDL для создания таблиц в PostgreSQL доступны [здесь](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==).*

Эта схема, хотя и не обязательно оптимальная, использует ряд популярных возможностей PostgreSQL, включая первичные ключи, внешние ключи, партиционирование и индексы.

Мы отобразим каждую из этих концепций на их эквиваленты в ClickHouse.

Для пользователей, которые хотят загрузить этот набор данных в экземпляр PostgreSQL для тестирования шагов миграции, мы предоставили данные в формате `pg_dump` для скачивания вместе с DDL, а последующие команды загрузки данных приведены ниже:

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

# posts {#posts}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql

# posthistory {#posthistory}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql

# комментарии {#comments}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql

# Голоса {#votes}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql

# Значки {#badges}
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql

# postlinks {#postlinks}

wget [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz)
gzip -d postlinks.sql.gz
psql &lt; postlinks.sql

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

## Миграция данных {#migrating-data}

### Репликация в режиме реального времени (CDC) {#real-time-replication-or-cdc}

Обратитесь к этому [руководству](/integrations/clickpipes/postgres), чтобы настроить ClickPipes для PostgreSQL. В нём рассматриваются многие типы исходных экземпляров Postgres.

При использовании подхода CDC (фиксация изменений данных) с ClickPipes или PeerDB каждая таблица в базе данных PostgreSQL автоматически реплицируется в ClickHouse.

Чтобы обрабатывать обновления и удаления в режиме, близком к реальному времени, ClickPipes сопоставляет таблицы Postgres с таблицами в ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree), специально разработанный для обработки обновлений и удалений в ClickHouse. Дополнительную информацию о том, как данные реплицируются в ClickHouse с помощью ClickPipes, можно найти [здесь](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated). Важно отметить, что репликация с использованием CDC создаёт дублирующиеся строки в ClickHouse при репликации операций обновления и удаления. [См. способы](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) использования модификатора [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) для их обработки в ClickHouse.

Рассмотрим, как создаётся таблица `users` в ClickHouse с использованием ClickPipes.

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

После настройки ClickPipes начинает миграцию всех данных из PostgreSQL в ClickHouse. В зависимости от сети и масштаба развертывания для набора данных Stack Overflow это должно занять всего несколько минут.

### Ручная массовая загрузка с периодическими обновлениями {#initial-bulk-load-with-periodic-updates}

При использовании ручного подхода первоначальная массовая загрузка набора данных может быть выполнена с помощью:

* **Табличные функции** — использование [табличной функции Postgres](/sql-reference/table-functions/postgresql) в ClickHouse для выполнения `SELECT` данных из Postgres и их `INSERT` в таблицу ClickHouse. Актуально для массовых загрузок для наборов данных объёмом до нескольких сотен ГБ.
* **Экспорт** — экспорт в промежуточные форматы, такие как CSV или файл с SQL‑скриптом. Эти файлы затем могут быть загружены в ClickHouse либо с клиента с помощью конструкции `INSERT FROM INFILE`, либо с использованием объектного хранилища и соответствующих функций, т.е. S3, GCS.

При ручной загрузке данных из PostgreSQL необходимо сначала создать таблицы в ClickHouse. Обратитесь к этой [документации по моделированию данных](/data-modeling/schema-design#establish-initial-schema), в которой также используется набор данных Stack Overflow для оптимизации схемы таблиц в ClickHouse.

Типы данных в PostgreSQL и ClickHouse могут отличаться. Чтобы установить эквивалентные типы данных для каждого столбца таблицы, можно использовать команду `DESCRIBE` с [табличной функцией Postgres](/sql-reference/table-functions/postgresql). Следующая команда описывает таблицу `posts` в PostgreSQL, модифицируйте её в соответствии с вашей средой:

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

Общий обзор сопоставления типов данных между PostgreSQL и ClickHouse приведён в [документации в приложении](/migrations/postgresql/appendix#data-type-mappings).

Шаги по оптимизации типов для этой схемы идентичны шагам для случая, когда данные были загружены из других источников, например из Parquet в S3. Применение процесса, описанного в этом [альтернативном руководстве по использованию Parquet](/data-modeling/schema-design), приводит к следующей схеме:

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

Мы можем заполнить это с помощью простого запроса `INSERT INTO SELECT`, считывая данные из PostgreSQL и вставляя их в ClickHouse:

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

Инкрементные загрузки, в свою очередь, можно выполнять по расписанию. Если таблица Postgres только принимает вставки и в ней есть автоинкрементный идентификатор или метка времени, пользователи могут использовать описанный выше подход с табличной функцией для инкрементной загрузки, т. е. к `SELECT` может быть добавлено условие `WHERE`. Этот подход также может использоваться для поддержки обновлений, если гарантируется, что изменяется один и тот же столбец. Поддержка удалений, однако, потребует полной перезагрузки, что может быть сложно реализовать по мере роста таблицы.

Мы демонстрируем начальную и инкрементную загрузку, используя `CreationDate` (предполагается, что это поле обновляется при изменении строк).

```sql
-- первоначальная загрузка
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse будет передавать простые условия `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и `IN`, на сервер PostgreSQL. Инкрементальные загрузки таким образом могут быть сделаны более эффективными, если убедиться, что по столбцам, используемым для идентификации набора изменений, существует индекс.

> Один из возможных способов обнаружения операций UPDATE при использовании репликации запросов — использовать системный столбец [`XMIN`](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (ID транзакций) в качестве водяного знака: изменение в этом столбце указывает на изменение и, следовательно, может быть применено к целевой таблице. Пользователям, применяющим этот подход, следует учитывать, что значения `XMIN` могут циклически повторяться (wrap around), а сравнения требуют полного сканирования таблицы, что усложняет отслеживание изменений.

[Нажмите здесь, чтобы перейти к части 2](/migrations/postgresql/rewriting-queries)
