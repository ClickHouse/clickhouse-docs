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

> Это **Часть 1** руководства по миграции с PostgreSQL на ClickHouse. На практическом примере показано, как эффективно выполнить миграцию с использованием подхода репликации изменений в режиме реального времени (CDC). Многие из рассматриваемых концепций также применимы к ручной массовой передаче данных из PostgreSQL в ClickHouse.


## Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции из Postgres в ClickHouse мы используем набор данных Stack Overflow, описанный [здесь](/getting-started/example-datasets/stackoverflow). Он содержит все записи `post`, `vote`, `user`, `comment` и `badge`, которые появились на Stack Overflow с 2008 года по апрель 2024 года. Схема PostgreSQL для этих данных показана ниже:

<Image
  img={postgres_stackoverflow_schema}
  size='lg'
  alt='Схема Stack Overflow в PostgreSQL'
/>

_DDL-команды для создания таблиц в PostgreSQL доступны [здесь](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)._

Эта схема, хотя и не обязательно является самой оптимальной, использует ряд популярных возможностей PostgreSQL, включая первичные ключи, внешние ключи, партиционирование и индексы.

Мы мигрируем каждую из этих концепций на их эквиваленты в ClickHouse.

Для пользователей, которые хотят загрузить этот набор данных в экземпляр PostgreSQL для тестирования шагов миграции, мы предоставили данные в формате `pg_dump` для скачивания вместе с DDL, а последующие команды загрузки данных показаны ниже:


```bash
# пользователи
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql
```


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql



# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql &lt; posthistory.sql



# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql



# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql &lt; votes.sql



# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql



# postlinks

wget [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz)
gzip -d postlinks.sql.gz
psql &lt; postlinks.sql

```

Хотя для ClickHouse этот набор данных невелик, для Postgres он довольно объёмный. Приведённое выше подмножество охватывает первые три месяца 2024 года.

> Хотя в наших примерах используется полный набор данных для демонстрации различий в производительности между Postgres и ClickHouse, все описанные ниже шаги работают идентично и с меньшим подмножеством. Пользователи, желающие загрузить полный набор данных в Postgres, могут ознакомиться с инструкциями [здесь](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==). Из-за ограничений внешних ключей, определённых в приведённой выше схеме, полный набор данных для PostgreSQL содержит только строки, соответствующие требованиям ссылочной целостности. При необходимости [версия в формате Parquet](/getting-started/example-datasets/stackoverflow) без таких ограничений может быть легко загружена непосредственно в ClickHouse.
```


## Миграция данных {#migrating-data}

### Репликация в реальном времени (CDC) {#real-time-replication-or-cdc}

Обратитесь к этому [руководству](/integrations/clickpipes/postgres) для настройки ClickPipes для PostgreSQL. Руководство охватывает множество различных типов исходных экземпляров Postgres.

При использовании подхода CDC с помощью ClickPipes или PeerDB каждая таблица в базе данных PostgreSQL автоматически реплицируется в ClickHouse.

Для обработки обновлений и удалений в режиме, близком к реальному времени, ClickPipes сопоставляет таблицы Postgres с ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree), специально разработанный для обработки обновлений и удалений в ClickHouse. Дополнительную информацию о том, как данные реплицируются в ClickHouse с помощью ClickPipes, можно найти [здесь](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated). Важно отметить, что репликация с использованием CDC создает дублирующиеся строки в ClickHouse при репликации операций обновления или удаления. [См. методы](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) использования модификатора [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) для их обработки в ClickHouse.

Рассмотрим, как таблица `users` создается в ClickHouse с помощью ClickPipes.

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

После настройки ClickPipes начинает миграцию всех данных из PostgreSQL в ClickHouse. В зависимости от сети и размера развертываний для набора данных Stack Overflow это должно занять всего несколько минут.

### Ручная массовая загрузка с периодическими обновлениями {#initial-bulk-load-with-periodic-updates}

При использовании ручного подхода начальная массовая загрузка набора данных может быть выполнена следующими способами:

- **Табличные функции** — использование [табличной функции Postgres](/sql-reference/table-functions/postgresql) в ClickHouse для выполнения `SELECT` данных из Postgres и их вставки `INSERT` в таблицу ClickHouse. Подходит для массовых загрузок наборов данных объемом до нескольких сотен ГБ.
- **Экспорт** — экспорт в промежуточные форматы, такие как CSV или файл SQL-скрипта. Эти файлы затем могут быть загружены в ClickHouse либо из клиента с помощью конструкции `INSERT FROM INFILE`, либо с использованием объектного хранилища и связанных с ним функций, таких как s3, gcs.

При ручной загрузке данных из PostgreSQL необходимо сначала создать таблицы в ClickHouse. Обратитесь к этой [документации по моделированию данных](/data-modeling/schema-design#establish-initial-schema), которая также использует набор данных Stack Overflow для оптимизации схемы таблиц в ClickHouse.

Типы данных между PostgreSQL и ClickHouse могут различаться. Чтобы определить эквивалентные типы для каждого столбца таблицы, можно использовать команду `DESCRIBE` с [табличной функцией Postgres](/sql-reference/table-functions/postgresql). Следующая команда описывает таблицу `posts` в PostgreSQL, измените её в соответствии с вашей средой:

```sql title="Запрос"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

Для обзора сопоставления типов данных между PostgreSQL и ClickHouse обратитесь к [документации в приложении](/migrations/postgresql/appendix#data-type-mappings).

Шаги по оптимизации типов для этой схемы идентичны тем, которые применяются при загрузке данных из других источников, например Parquet на S3. Применение процесса, описанного в этом [альтернативном руководстве с использованием Parquet](/data-modeling/schema-design), приводит к следующей схеме:


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
COMMENT 'Оптимизированные типы'
```

Мы можем заполнить таблицу с помощью простого `INSERT INTO SELECT`, считывая данные из PostgreSQL и вставляя их в ClickHouse:

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 строк в наборе. Затрачено: 146.471 сек. Обработано 59.82 млн строк, 83.82 ГБ (408.40 тыс. строк/с., 572.25 МБ/с.)
```

Инкрементальные загрузки, в свою очередь, можно выполнять по расписанию. Если таблица Postgres получает только вставки и в ней есть монотонно возрастающий `id` или `timestamp`, пользователи могут использовать описанный выше подход с табличной функцией для загрузки инкрементов, т.е. к `SELECT` может быть применено условие `WHERE`. Этот подход также может использоваться для поддержки обновлений, если гарантируется, что обновляется один и тот же столбец. Поддержка удалений, однако, потребует полной перезагрузки, что может быть трудно реализовать по мере роста таблицы.

Ниже мы демонстрируем начальную загрузку и инкрементальную загрузку с использованием `CreationDate` (предполагаем, что это поле обновляется при изменении строк).

```sql
-- первоначальная загрузка
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse будет проталкивать на сервер PostgreSQL простые условия `WHERE`, такие как `=`, `!=`, `>`,`>=`, `<`, `<=` и IN. Таким образом, инкрементальные загрузки можно сделать более эффективными, обеспечив наличие индекса по столбцам, используемым для идентификации набора изменений.

> Один из возможных способов обнаружения операций UPDATE при использовании репликации запросов — использовать [системный столбец `XMIN`](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (идентификаторы транзакций) в качестве водяного знака: изменение в этом столбце свидетельствует об изменении строки и, следовательно, может быть применено к целевой таблице. Пользователи, применяющие этот подход, должны учитывать, что значения `XMIN` могут зацикливаться, а сравнения требуют полного сканирования таблицы, что усложняет отслеживание изменений.

[Нажмите здесь, чтобы перейти к части 2](/migrations/postgresql/rewriting-queries)
