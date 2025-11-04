---
slug: '/integrations/clickpipes/postgres/deduplication'
sidebar_label: 'Стратегии дедупликации'
description: 'Обработка дублей и удаленных строк.'
title: 'Стратегии дедупликации (с использованием CDC)'
doc_type: guide
---
import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Обновления и удаления, реплицируемые из Postgres в ClickHouse, приводят к дублированию строк в ClickHouse из-за его структуры хранения данных и процесса репликации. Эта страница описывает, почему это происходит, и стратегии, которые можно использовать в ClickHouse для обработки дубликатов.

## Как данные реплицируются? {#how-does-data-get-replicated}

### Логическое декодирование PostgreSQL {#PostgreSQL-logical-decoding}

ClickPipes использует [Логическое декодирование Postgres](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) для получения изменений по мере их появления в Postgres. Процесс Логического декодирования в Postgres позволяет таким клиентам, как ClickPipes, получать изменения в удобочитаемом формате, т.е. в виде серии INSERT, UPDATE и DELETE.

### ReplacingMergeTree {#replacingmergetree}

ClickPipes сопоставляет таблицы Postgres с ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree). ClickHouse показывает наилучшие результаты при работе с нагрузками только на добавление и не рекомендует частые UPDATE. В этом случае ReplacingMergeTree особенно мощен.

С помощью ReplacingMergeTree обновления моделируются как вставки с новой версией (`_peerdb_version`) строки, в то время как удаления представляют собой вставки с новой версией и `_peerdb_is_deleted`, установленным в true. Движок ReplacingMergeTree дедуплицирует/сливает данные в фоновом режиме и сохраняет последнюю версию строки для данного первичного ключа (id), что позволяет эффективно обрабатывать UPDATE и DELETE как версионные вставки.

Ниже приведен пример оператора CREATE TABLE, выполняемого ClickPipes для создания таблицы в ClickHouse.

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

### Иллюстративный пример {#illustrative-example}

На иллюстрации ниже показан базовый пример синхронизации таблицы `users` между PostgreSQL и ClickHouse с использованием ClickPipes.

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**Шаг 1** показывает начальный снимок из 2 строк в PostgreSQL и ClickPipes, выполняющего начальную загрузку этих 2 строк в ClickHouse. Как вы можете видеть, обе строки копируются в ClickHouse без изменений.

**Шаг 2** показывает три операции над таблицей users: вставка новой строки, обновление существующей строки и удаление другой строки.

**Шаг 3** показывает, как ClickPipes реплицирует операции INSERT, UPDATE и DELETE в ClickHouse в виде версионных вставок. UPDATE появляется как новая версия строки с ID 2, в то время как DELETE появляется как новая версия ID 1, которая помечена как true с помощью `_is_deleted`. Из-за этого ClickHouse имеет три дополнительных строки по сравнению с PostgreSQL.

В результате выполнение простого запроса, такого как `SELECT count(*) FROM users;`, может привести к различным результатам в ClickHouse и PostgreSQL. Согласно [документации по слиянию ClickHouse](/merges#replacing-merges), устаревшие версии строк в конечном итоге отбрасываются в процессе слияния. Однако время выполнения этого слияния непредсказуемо, что означает, что запросы в ClickHouse могут возвращать непоследовательные результаты до его выполнения.

Как мы можем обеспечить идентичные результаты запросов как в ClickHouse, так и в PostgreSQL?

### Дедупликация с использованием ключевого слова FINAL {#deduplicate-using-final-keyword}

Рекомендуемый способ дедупликации данных в запросах ClickHouse — использовать [модификатор FINAL](/sql-reference/statements/select/from#final-modifier). Это гарантирует, что возвращаются только дедуплицированные строки.

Давайте посмотрим, как применить его к трем различным запросам.

_Обратите внимание на условие WHERE в следующих запросах, используемое для фильтрации удаленных строк._

- **Простой запрос для подсчета**: Подсчитать количество постов.

Это самый простой запрос, который вы можете выполнить, чтобы проверить, правильно ли прошла синхронизация. Оба запроса должны возвращать одинаковое количество.

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

- **Простая агрегация с JOIN**: Топ 10 пользователей, которые накопили наибольшее количество просмотров.

Пример агрегации по одной таблице. Наличие дубликатов здесь сильно повлияло бы на результат функции суммы.

```sql
-- PostgreSQL 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts p
LEFT JOIN users u ON u.id = p.owneruserid
-- highlight-next-line
WHERE p.owneruserid > 0
GROUP BY user_id, display_name
ORDER BY viewcount DESC
LIMIT 10;

-- ClickHouse 
SELECT
    sum(p.viewcount) AS viewcount,
    p.owneruserid AS user_id,
    u.displayname AS display_name
FROM posts AS p
FINAL
LEFT JOIN users AS u
FINAL ON (u.id = p.owneruserid) AND (u._peerdb_is_deleted = 0)
-- highlight-next-line
WHERE (p.owneruserid > 0) AND (p._peerdb_is_deleted = 0)
GROUP BY
    user_id,
    display_name
ORDER BY viewcount DESC
LIMIT 10
```

#### Настройка FINAL {#final-setting}

Вместо того чтобы добавлять модификатор FINAL к каждому имени таблицы в запросе, вы можете использовать [настройку FINAL](/operations/settings/settings#final), чтобы применить ее автоматически ко всем таблицам в запросе.

Эта настройка может применяться как к запросу, так и ко всей сессии.

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```

#### Политика ROW {#row-policy}

Легкий способ скрыть избыточный фильтр `_peerdb_is_deleted = 0` — использовать [политику ROW](/docs/operations/access-rights#row-policy-management). Ниже приведен пример, создающий политику строки для исключения удаленных строк из всех запросов к таблице votes.

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> Политики строк применяются к списку пользователей и ролей. В этом примере она применяется ко всем пользователям и ролям. Это можно настроить только для конкретных пользователей или ролей.

### Запросы как в Postgres {#query-like-with-postgres}

Миграция аналитического набора данных из PostgreSQL в ClickHouse часто требует модификации запросов приложения, чтобы учесть различия в обработке данных и выполнении запросов.

В этом разделе будут рассмотрены методы дедупликации данных при сохранении исходных запросов без изменений.

#### Представления {#views}

[Представления](/sql-reference/statements/create/view#normal-view) — отличный способ скрыть ключевое слово FINAL от запроса, поскольку они не хранят никаких данных и просто выполняют чтение из другой таблицы при каждом доступе.

Ниже приведен пример создания представлений для каждой таблицы нашей базы данных в ClickHouse с ключевым словом FINAL и фильтром для удаленных строк.

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

Затем мы можем запрашивать представления, используя такой же запрос, какой мы использовали бы в PostgreSQL.

```sql
-- Most viewed posts
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM posts_view
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10
```

#### Обновляемое материализованное представление {#refreshable-material-view}

Другой подход — использовать [обновляемое материализованное представление](/materialized-view/refreshable-materialized-view), которое позволяет планировать выполнение запросов для дедупликации строк и хранения результатов в целевой таблице. При каждом запланированном обновлении целевая таблица заменяется на последние результаты запроса.

Ключевое преимущество этого метода заключается в том, что запрос, использующий ключевое слово FINAL, выполняется только один раз во время обновления, что устраняет необходимость в последующих запросах к целевой таблице с использованием FINAL.

Однако недостатком является то, что данные в целевой таблице актуальны только на момент последнего обновления. Тем не менее, для многих случаев использования интервалы обновления от нескольких минут до нескольких часов могут быть достаточными.

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

Затем вы можете обычным образом запрашивать таблицу `deduplicated_posts`.

```sql
SELECT
    sum(viewcount) AS viewcount,
    owneruserid
FROM deduplicated_posts
WHERE owneruserid > 0
GROUP BY owneruserid
ORDER BY viewcount DESC
LIMIT 10;
```