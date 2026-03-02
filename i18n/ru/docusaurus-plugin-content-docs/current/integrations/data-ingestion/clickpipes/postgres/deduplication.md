---
sidebar_label: 'Стратегии дедупликации'
description: 'Обработка дубликатов и удалённых строк.'
slug: /integrations/clickpipes/postgres/deduplication
title: 'Стратегии дедупликации (с использованием CDC)'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Операции обновления и удаления, реплицируемые из Postgres в ClickHouse, приводят к дублированию строк в ClickHouse из‑за его структуры хранения данных и процесса репликации. На этой странице объясняется, почему это происходит, и описываются стратегии работы с дубликатами в ClickHouse.


## Как происходит репликация данных? \{#how-does-data-get-replicated\}

### Логическое декодирование PostgreSQL \{#PostgreSQL-logical-decoding\}

ClickPipes использует механизм [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication), чтобы считывать изменения по мере их появления в Postgres. Процесс Logical Decoding в Postgres позволяет таким клиентам, как ClickPipes, получать изменения в человекочитаемом формате, то есть в виде последовательности операторов INSERT, UPDATE и DELETE.

### ReplacingMergeTree \{#replacingmergetree\}

ClickPipes сопоставляет таблицы Postgres с ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree). ClickHouse лучше всего работает с нагрузками только на добавление данных (append-only) и не рекомендует частые операции UPDATE. В таких сценариях ReplacingMergeTree особенно эффективен.

С ReplacingMergeTree обновления моделируются как вставки новой версии (`_peerdb_version`) строки, а удаления — как вставки с более новой версией и флагом `_peerdb_is_deleted`, установленным в true. Движок ReplacingMergeTree в фоновом режиме устраняет дубликаты и объединяет данные, сохраняя последнюю версию строки для заданного первичного ключа (id), что позволяет эффективно обрабатывать операции UPDATE и DELETE как версионные вставки.

Ниже приведён пример оператора CREATE TABLE, выполняемого ClickPipes для создания таблицы в ClickHouse.

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


### Показательный пример \{#illustrative-example\}

Иллюстрация ниже пошагово показывает базовый пример синхронизации таблицы `users` между PostgreSQL и ClickHouse с использованием ClickPipes.

<Image img={clickpipes_initial_load} alt="Первоначальная загрузка в ClickPipes" size="lg"/>

**Шаг 1** показывает начальный снимок двух строк в PostgreSQL и то, как ClickPipes выполняет первоначальную загрузку этих двух строк в ClickHouse. Как можно увидеть, обе строки копируются в ClickHouse как есть.

**Шаг 2** показывает три операции над таблицей `users`: вставку новой строки, обновление существующей строки и удаление другой строки.

**Шаг 3** показывает, как ClickPipes реплицирует операции INSERT, UPDATE и DELETE в ClickHouse в виде версионированных вставок. Операция UPDATE отображается как новая версия строки с ID 2, а операция DELETE — как новая версия ID 1, помеченная как true с помощью `_is_deleted`. Из-за этого в ClickHouse на три строки больше по сравнению с PostgreSQL.

В результате выполнение простого запроса вроде `SELECT count(*) FROM users;` может дать разные результаты в ClickHouse и PostgreSQL. Согласно [документации по слияниям в ClickHouse](/merges#replacing-merges), устаревшие версии строк в конечном итоге отбрасываются в процессе слияния. Однако момент выполнения этого слияния непредсказуем, поэтому запросы в ClickHouse могут возвращать несогласованные результаты до тех пор, пока оно не произойдет.

Как обеспечить идентичные результаты запросов в ClickHouse и PostgreSQL?

### Удаление дубликатов с помощью ключевого слова FINAL \{#deduplicate-using-final-keyword\}

Рекомендуемый способ удаления дубликатов данных в запросах ClickHouse — использовать [модификатор FINAL.](/sql-reference/statements/select/from#final-modifier) Он гарантирует, что будут возвращены только строки без дубликатов.

Рассмотрим, как применить его к трём разным запросам.

*Обратите внимание на предикат WHERE в следующих запросах, который используется для фильтрации удалённых строк.*

* **Простой запрос с COUNT**: Посчитать количество постов.

Это самый простой запрос, который можно выполнить, чтобы проверить, что синхронизация прошла успешно. Оба запроса должны вернуть одно и то же количество.

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

* **Простая агрегация с JOIN**: топ‑10 пользователей, которые накопили больше всего просмотров.

Пример агрегации по одной таблице. Наличие дубликатов здесь существенно повлияло бы на результат функции sum.

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


#### Параметр FINAL \{#final-setting\}

Вместо того чтобы добавлять модификатор FINAL к каждому имени таблицы в запросе, вы можете использовать [параметр FINAL](/operations/settings/settings#final), чтобы он автоматически применялся ко всем таблицам в запросе.

Этот параметр можно задать как для отдельного запроса, так и для всего сеанса.

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```


#### Политика ROW \{#row-policy\}

Простой способ скрыть избыточный фильтр `_peerdb_is_deleted = 0` — использовать [политику ROW.](/docs/operations/access-rights#row-policy-management) Ниже приведён пример, который создаёт политику ROW для исключения удалённых строк во всех запросах к таблице votes.

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> Политики на уровне строк применяются к списку пользователей и ролей. В этом примере они применяются ко всем пользователям и ролям. Их можно настроить так, чтобы они применялись только к конкретным пользователям или ролям.


### Запросы как в Postgres \{#query-like-with-postgres\}

Миграция аналитического набора данных из PostgreSQL в ClickHouse часто требует изменения запросов приложения с учётом различий в обработке данных и выполнении запросов. 

В этом разделе рассматриваются подходы к дедупликации данных, позволяющие сохранять исходные запросы без изменений.

#### Представления \{#views\}

[Представления](/sql-reference/statements/create/view#normal-view) — отличный способ скрыть ключевое слово FINAL в запросе, так как они не хранят данные и при каждом обращении просто читают данные из другой таблицы.

Ниже приведён пример создания представлений для каждой таблицы в нашей базе данных ClickHouse с использованием ключевого слова FINAL и фильтрации удалённых строк.

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

После этого мы можем выполнять запросы к представлениям, используя тот же самый запрос, что и в PostgreSQL.

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


#### Refreshable materialized view \{#refreshable-material-view\}

Другой подход — использовать [refreshable materialized view](/materialized-view/refreshable-materialized-view), который позволяет по расписанию выполнять запрос для дедупликации строк и сохранения результатов в целевой таблице. При каждом обновлении по расписанию целевая таблица заменяется последними результатами запроса.

Ключевое преимущество этого метода заключается в том, что запрос, использующий ключевое слово FINAL, выполняется только один раз во время обновления, устраняя необходимость запускать последующие запросы к целевой таблице с использованием FINAL.

Однако недостаток в том, что данные в целевой таблице актуальны только по состоянию на момент последнего обновления. Тем не менее, для многих сценариев использования интервалы обновления от нескольких минут до нескольких часов могут быть достаточными.

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

После этого вы можете выполнять запросы к таблице `deduplicated_posts` в обычном режиме.

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
