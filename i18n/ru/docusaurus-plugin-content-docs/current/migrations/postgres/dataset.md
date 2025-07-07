---
slug: /migrations/postgresql/dataset
title: 'Миграция данных'
description: 'Пример набора данных для миграции из PostgreSQL в ClickHouse'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> Это **Часть 1** руководства по миграции из PostgreSQL в ClickHouse. Используя практический пример, оно демонстрирует, как эффективно выполнить миграцию с использованием подхода репликации в реальном времени (CDC). Многие из охваченных концепций также применимы к ручным массовым передачам данных из PostgreSQL в ClickHouse.

## Набор данных {#dataset}

В качестве примера набора данных для демонстрации типичной миграции из Postgres в ClickHouse мы используем набор данных Stack Overflow, документированный [здесь](/getting-started/example-datasets/stackoverflow). Он содержит каждый `post`, `vote`, `user`, `comment` и `badge`, которые произошли на Stack Overflow с 2008 года по апрель 2024 года. Схема PostgreSQL для этих данных представлена ниже:

<Image img={postgres_stackoverflow_schema} size="lg" alt="Схема PostgreSQL Stack Overflow"/>

*DDL команды для создания таблиц в PostgreSQL доступны [здесь](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==).*

Эта схема, хотя и не обязательно является наиболее оптимальной, использует ряд популярных функций PostgreSQL, включая первичные ключи, внешние ключи, партиционирование и индексы.

Мы мигрируем каждую из этих концепций к соответствующим им в ClickHouse.

Для пользователей, которые хотят заполнить этот набор данных в экземпляр PostgreSQL, чтобы протестировать этапы миграции, мы предоставили данные в формате `pg_dump` для загрузки, а DDL и последующие команды загрузки данных представлены ниже:

```bash

# пользователи
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql


# посты
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql


# история постов
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql


# комментарии
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql


# голоса
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql


# значки
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql


# ссылки на посты
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

Хотя этот набор данных невелик для ClickHouse, он значительно объемен для Postgres. Выше представлен поднабор, охватывающий первые три месяца 2024 года.

> Хотя наши примеры результатов используют полный набор данных, чтобы показать различия в производительности между Postgres и ClickHouse, все шаги, документированные ниже, функционально идентичны для меньшего поднабора. Пользователи, желающие загрузить полный набор данных в Postgres, могут увидеть [здесь](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==). Из-за внешних ограничений, наложенных вышеуказанной схемой, полный набор данных для PostgreSQL содержит только строки, которые удовлетворяют ссылочной целостности. [Версия Parquet](/getting-started/example-datasets/stackoverflow) без таких ограничений может быть легко загружена напрямую в ClickHouse, если это необходимо.

## Миграция данных {#migrating-data}

### Репликация в реальном времени (CDC) {#real-time-replication-or-cdc}

Обратитесь к этому [руководству](/integrations/clickpipes/postgres), чтобы настроить ClickPipes для PostgreSQL. В руководстве охватываются многие разные типы исходных экземпляров Postgres.

При подходе CDC с использованием ClickPipes или PeerDB каждая таблица в базе данных PostgreSQL автоматически реплицируется в ClickHouse. 

Чтобы обрабатывать обновления и удаления в почти реальном времени, ClickPipes сопоставляет таблицы Postgres с ClickHouse с использованием движка [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree), специально разработанного для обработки обновлений и удалений в ClickHouse. Вы можете найти дополнительную информацию о том, как данные реплицируются в ClickHouse с использованием ClickPipes [здесь](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated). Важно отметить, что репликация с использованием CDC создает дублированные строки в ClickHouse при репликации операций обновления или удаления. [См. техники](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) с использованием модификатора [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) для обработки их в ClickHouse.

Давайте посмотрим, как таблица `users` создается в ClickHouse с использованием ClickPipes. 

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

После настройки ClickPipes начинает миграцию всех данных из PostgreSQL в ClickHouse. В зависимости от сети и размера развертывания, это должно занять всего несколько минут для набора данных Stack Overflow. 

### Ручная массовая загрузка с периодическими обновлениями {#initial-bulk-load-with-periodic-updates}

Используя ручной подход, начальная массовая загрузка набора данных может быть выполнена через:

- **Табличные функции** - Используя [табличную функцию Postgres](/sql-reference/table-functions/postgresql) в ClickHouse для `SELECT` данных из Postgres и `INSERT` их в таблицу ClickHouse. Это актуально для массовых загрузок до наборов данных нескольких сотен ГБ.
- **Экспорт** - Экспорт в промежуточные форматы, такие как CSV или SQL файл скрипта. Эти файлы затем могут быть загружены в ClickHouse либо с клиента с помощью команды `INSERT FROM INFILE`, либо с использованием объектного хранилища и их связанных функций, т.е. s3, gcs.

При ручной загрузке данных из PostgreSQL необходимо сначала создать таблицы в ClickHouse. Обратитесь к этой [документации по моделированию данных](/data-modeling/schema-design#establish-initial-schema), которая также использует набор данных Stack Overflow для оптимизации схемы таблиц в ClickHouse.

Типы данных между PostgreSQL и ClickHouse могут отличаться. Чтобы установить эквивалентные типы для каждого из столбцов таблицы, мы можем использовать команду `DESCRIBE` с [табличной функцией Postgres](/sql-reference/table-functions/postgresql). Следующая команда описывает таблицу `posts` в PostgreSQL, измените её в соответствии с вашей средой:

```sql title="Запрос"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

Для получения обзора сопоставления типов данных между PostgreSQL и ClickHouse обратитесь к [документации приложения](/migrations/postgresql/appendix#data-type-mappings).

Шаги для оптимизации типов для этой схемы идентичны тем, которые применяются, если данные были загружены из других источников, например, Parquet на S3. Применение процесса, описанного в этом [альтернативном руководстве с использованием Parquet](/data-modeling/schema-design), приводит к следующей схеме:

```sql title="Запрос"
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
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Оптимизированные типы'
```

Мы можем заполнить это с помощью простого `INSERT INTO SELECT`, считывая данные из PostgreSQL и вставляя в ClickHouse:

```sql title="Запрос"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

Инкрементные загрузки могут, в свою очередь, быть запланированы. Если таблица Postgres принимает только вставки и существует увеличивающийся id или временной штамп, пользователи могут использовать вышеуказанный подход с табличной функцией для загрузки приростов, т.е. к `SELECT` можно применить клаузу `WHERE`. Этот подход также может быть использован для поддержки обновлений, если эти обновления гарантированно будут вноситься в один и тот же столбец. Поддержка удалений, однако, потребует полной перезагрузки, что может быть сложно осуществить по мере роста таблицы.

Мы демонстрируем начальную загрузку и инкрементную загрузку с использованием `CreationDate` (мы предполагаем, что это обновляется, если строки обновляются).

```sql
-- начальная загрузка
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse будет передавать простые клаузулы `WHERE`, такие как `=`, `!=`, `>`, `>=`, `<`, `<=` и IN серверу PostgreSQL. Инкрементные загрузки могут стать более эффективными при условии, что индекс существует на столбцах, используемых для идентификации набора изменений.

> Возможный метод обнаружения обновлений при использовании репликации запросов - использование системного столбца [`XMIN`](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) (идентификаторы транзакций) в качестве водяного знака - изменение в этом столбце указывает на изменение, и, следовательно, может быть применено к целевой таблице. Пользователи, использующие этот подход, должны помнить, что значения `XMIN` могут перезаписываться, и сравнения требуют полной проверки таблицы, что усложняет отслеживание изменений.

[Щелкните здесь, чтобы перейти к Часть 2](./rewriting-queries.md)
