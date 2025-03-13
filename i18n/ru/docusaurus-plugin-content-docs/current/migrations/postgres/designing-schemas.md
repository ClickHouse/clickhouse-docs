---
slug: /migrations/postgresql/designing-schemas
title: Проектирование схем
description: Проектирование схем при миграции из PostgreSQL в ClickHouse
keywords: [postgres, postgresql, migrate, migration, schema]
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';

> Это **Часть 2** руководства по миграции из PostgreSQL в ClickHouse. Этот контент можно считать вводным, с целью помочь пользователям развернуть начальную функциональную систему, которая соответствует лучшим практикам ClickHouse. Здесь избегаются сложные темы, и это не приведет к полной оптимизации схемы; вместо этого он предоставляет прочную основу для пользователей, чтобы построить производственную систему и на основе этого начать обучение.

Набор данных Stack Overflow содержит ряд связанных таблиц. Мы рекомендуем сосредоточиться на миграции их первичной таблицы сначала. Это может быть не обязательно самая большая таблица, но скорее та, по которой вы ожидаете получить наибольшее количество аналитических запросов. Это позволит вам ознакомиться с основными концепциями ClickHouse, которые особенно важны, если вы приходите из преимущественно OLTP-бэкенда. Эта таблица может потребовать переработки по мере добавления дополнительных таблиц для полной эксплуатации возможностей ClickHouse и получения оптимальной производительности. Мы подробно рассматриваем этот процесс моделирования в нашем [документе по моделированию данных](/data-modeling/schema-design#next-data-modelling-techniques).

## Установите начальную схему {#establish-initial-schema}

Соблюдая этот принцип, мы сосредотачиваемся на основной таблице `posts`. Схема Postgres для этого показана ниже:

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

Чтобы установить эквивалентные типы для каждого из приведенных выше столбцов, мы можем использовать команду `DESCRIBE` с [функцией таблицы Postgres](/sql-reference/table-functions/postgresql). Измените следующий запрос в соответствии с вашим экземпляром Postgres:

```sql title="Запрос"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

```response title="Ответ"
┌─name──────────────────┬─type────────────────────┐
│ id           		│ Int32                   │
│ posttypeid   		│ Nullable(Int32)	  │
│ acceptedanswerid 	│ Nullable(String)   	  │
│ creationdate 		│ Nullable(DateTime64(6)) │
│ score        		│ Nullable(Int32)	  │
│ viewcount    		│ Nullable(Int32)	  │
│ body         		│ Nullable(String)   	  │
│ owneruserid  		│ Nullable(Int32)	  │
│ ownerdisplayname 	│ Nullable(String)   	  │
│ lasteditoruserid 	│ Nullable(String)   	  │
│ lasteditordisplayname │ Nullable(String)   	  │
│ lasteditdate 		│ Nullable(DateTime64(6)) │
│ lastactivitydate 	│ Nullable(DateTime64(6)) │
│ title        		│ Nullable(String)   	  │
│ tags         		│ Nullable(String)   	  │
│ answercount  		│ Nullable(Int32)	  │
│ commentcount 		│ Nullable(Int32)	  │
│ favoritecount		│ Nullable(Int32)	  │
│ contentlicense   	│ Nullable(String)   	  │
│ parentid     		│ Nullable(String)   	  │
│ communityowneddate    │ Nullable(DateTime64(6)) │
│ closeddate   		│ Nullable(DateTime64(6)) │
└───────────────────────┴─────────────────────────┘

22 строки в наборе. Прошло: 0.478 сек.
```

Это дает нам начальную не оптимизированную схему.

> Без ограничения `NOT NULL`, столбцы Postgres могут содержать нулевые значения. Не проверяя значения строк, ClickHouse сопоставляет их с эквивалентными Nullable типами. Обратите внимание, что первичный ключ не может быть NULL, что является требованием в Postgres.

Мы можем создать таблицу ClickHouse, используя эти типы, с простой командой `CREATE AS EMPTY SELECT`.

```sql title="Запрос"
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
```

Тот же подход может быть использован для загрузки данных из s3 в других форматах. См. здесь эквивалентный пример загрузки этих данных из формата Parquet.

## Первоначальная загрузка {#initial-load}

Создав таблицу, мы можем вставить строки из Postgres в ClickHouse, используя [функцию таблицы Postgres](/sql-reference/table-functions/postgresql).

```sql title="Запрос"
INSERT INTO posts SELECT *
FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 строк в наборе. Прошло: 1136.841 сек. Обработано 58.89 миллионов строк, 80.85 ГБ (51.80 тысяч строк/с., 71.12 МБ/с.)
Максимальное использование памяти: 2.51 ГБ.
```

> Эта операция может значительно нагружать Postgres. Пользователи могут желать выполнить забор данных другими способами, чтобы избежать влияния на производственные нагрузки, например, экспортировать SQL-скрипт. Производительность этой операции будет зависеть от размеров вашего кластера Postgres и ClickHouse, а также от их сетевых соединений.

> Каждый `SELECT` из ClickHouse в Postgres использует одно соединение. Это соединение берется из пула соединений на стороне сервера, размеры которого управляются настройкой `postgresql_connection_pool_size` (по умолчанию 16).

Если использовать полный набор данных, пример должен загрузить 59 миллионов постов. Подтвердите это с помощью простого подсчета в ClickHouse:

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

Шаги по оптимизации типов для этой схемы идентичны тем, что применяются и к данным, загруженным из других источников, например, Parquet на S3. Применение процесса, описанного в этом [альтернативном руководстве по использованию Parquet](/data-modeling/schema-design), приводит к следующей схеме:

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
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Оптимизированные типы'
```

Мы можем заполнить это простым `INSERT INTO SELECT`, считывая данные из нашей предыдущей таблицы и вставляя в эту:

```sql title="Запрос"
INSERT INTO posts_v2 SELECT * FROM posts
0 строк в наборе. Прошло: 146.471 сек. Обработано 59.82 миллиона строк, 83.82 ГБ (408.40 тысяч строк/с., 572.25 МБ/с.)
```

Мы не сохраняем никаких null в нашей новой схеме. Вышеупомянутая вставка неявно преобразует их в значения по умолчанию для их соответствующих типов - 0 для целых чисел и пустое значение для строк. ClickHouse также автоматически преобразует любые числовые значения в их целевую точность.

## Первичные (упорядочивающие) ключи в ClickHouse {#primary-ordering-keys-in-clickhouse}

Пользователи, приходящие из OLTP баз данных, часто ищут эквивалентную концепцию в ClickHouse. Обнаружив, что ClickHouse поддерживает синтаксис `PRIMARY KEY`, пользователи могут быть искушены определить свою схему таблицы, используя те же ключи, что и в их исходной OLTP базе данных. Это нецелесообразно.

### В чем отличие первичных ключей ClickHouse? {#how-are-clickhouse-primary-keys-different}

Чтобы понять, почему использовать ваш первичный ключ OLTP в ClickHouse нецелесообразно, пользователи должны понять основы индексации в ClickHouse. Мы используем Postgres в качестве примера для сравнения, но эти общие концепции применимы и к другим OLTP базам данных.

- Первичные ключи Postgres, по определению, уникальны для каждой строки. Использование [структур B-дерева](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) позволяет эффективно искать отдельные строки по этому ключу. Хотя ClickHouse также может быть оптимизирован для поиска одного значения строки, аналитические нагрузки обычно требуют чтения нескольких столбцов, но для многих строк. Фильтры чаще всего должны идентифицировать **подмножество строк**, по которым будет выполняться агрегация.
- Эффективность памяти и диска имеет первостепенное значение на масштабах, на которых ClickHouse обычно используется. Данные записываются в таблицы ClickHouse с использованием блоков, которые называют parts, с правилами для объединения этих блоков в фоновом режиме. В ClickHouse каждый блок имеет свой собственный первичный индекс. Когда блоки объединяются, первичные индексы объединенного блока также объединяются. В отличие от Postgres, эти индексы не строятся для каждой строки. Вместо этого первичный индекс для блока имеет одну запись индекса на группу строк - эта техника называется **разреженной индексацией**.
- **Разреженная индексация** возможна, поскольку ClickHouse хранит строки для блока на диске, упорядоченные по заданному ключу. Вместо того чтобы напрямую находить отдельные строки (как в индексе на основе B-дерева), разреженный первичный индекс позволяет быстро (посредством бинарного поиска по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Обнаруженные группы потенциально совпадающих строк затем обрабатываются параллельно и передаются в механизм ClickHouse для поиска совпадений. Этот дизайн индекса позволяет первичному индексу быть небольшим (он полностью помещается в основную память), при этом значительно ускоряя время выполнения запросов, особенно для диапазонных запросов, которые типичны для аналитических случаев использования данных. Для получения дополнительной информации мы рекомендуем этот [подробный гид](/guides/best-practices/sparse-primary-indexes).

<br />

<img src={postgres_b_tree} class="image" alt="Индекс B-Tree PostgreSQL" style={{width: '800px'}} />

<br />

<img src={postgres_sparse_index} class="image" alt="Разреженный индекс PostgreSQL" style={{width: '800px'}} />

<br />

Выбранный ключ в ClickHouse будет определять не только индекс, но и порядок, в котором данные записываются на диск. Из-за этого это может значительно повлиять на уровни сжатия, что, в свою очередь, может повлиять на производительность запросов. Упорядочивающий ключ, который приводит к тому, что значения большинства столбцов записываются в непрерывном порядке, позволит выбранному алгоритму сжатия (и кодекам) более эффективно сжимать данные.

> Все столбцы в таблице будут отсортированы на основе значения указанного упорядочивающего ключа, независимо от того, включены ли они в сам ключ. Например, если в качестве ключа используется `CreationDate`, порядок значений во всех остальных столбцах будет соответствовать порядку значений в столбце `CreationDate`. Множество упорядочивающих ключей можно указать - это будет сортировать с той же семантикой, что и оператор `ORDER BY` в запросе `SELECT`.

### Выбор упорядочивающего ключа {#choosing-an-ordering-key}

По вопросам и шагам при выборе упорядочивающего ключа, используя таблицу постов в качестве примера, см. [здесь](/data-modeling/schema-design#choosing-an-ordering-key).

## Сжатие {#compression}

Колоночное хранилище ClickHouse означает, что сжатие часто будет значительно лучше по сравнению с Postgres. Следующее показано на сравнении требований к хранению для всех таблиц Stack Overflow в обеих базах данных:

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
│ posts       │ 25.17 GiB  	│
│ users       │ 846.57 MiB 	│
│ badges      │ 513.13 MiB 	│
│ comments    │ 7.11 GiB   	│
│ votes       │ 1.28 GiB   	│
│ posthistory │ 40.44 GiB  	│
│ postlinks   │ 79.22 MiB  	│
└─────────────┴─────────────────┘
```

Дополнительные сведения об оптимизации и измерении сжатия можно найти [здесь](/data-compression/compression-in-clickhouse).

[Нажмите здесь для части 3](/migrations/postgresql/data-modeling-techniques).
