---
sidebar_label: 'Стратегии дедупликации'
description: 'Обработка дубликатов и удалённых строк.'
slug: /integrations/clickpipes/postgres/deduplication
title: 'Стратегии дедупликации (на основе CDC)'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Обновления и удаления, реплицируемые из Postgres в ClickHouse, приводят к дублированию строк в ClickHouse из‑за структуры хранения данных и процесса репликации. На этой странице объясняется, почему это происходит, и какие стратегии можно использовать в ClickHouse для обработки дубликатов.

## Как происходит репликация данных? \\{#how-does-data-get-replicated\\}

### Логическое декодирование PostgreSQL \\{#PostgreSQL-logical-decoding\\}

ClickPipes использует [Postgres Logical Decoding](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) для считывания изменений по мере их возникновения в Postgres. Процесс логического декодирования в Postgres позволяет клиентам, таким как ClickPipes, получать изменения в человекочитаемом формате, то есть в виде последовательности команд INSERT, UPDATE и DELETE.

### ReplacingMergeTree \\{#replacingmergetree\\}

ClickPipes сопоставляет таблицы Postgres с таблицами в ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree). ClickHouse лучше всего работает с нагрузками только на добавление данных и не рекомендует частые операции UPDATE. Именно здесь ReplacingMergeTree особенно эффективен.

С ReplacingMergeTree обновления моделируются как вставки с более новой версией строки (`_peerdb_version`), а удаления — как вставки с более новой версией и флагом `_peerdb_is_deleted`, установленным в true. Движок ReplacingMergeTree в фоновом режиме выполняет дедупликацию и слияние данных и сохраняет последнюю версию строки для заданного первичного ключа (id), обеспечивая эффективную обработку операций UPDATE и DELETE как версионированных вставок.

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


### Показательный пример \\{#illustrative-example\\}

Ниже приведена иллюстрация базового примера синхронизации таблицы `users` между PostgreSQL и ClickHouse с использованием ClickPipes.

<Image img={clickpipes_initial_load} alt="ClickPipes initial load" size="lg"/>

**Шаг 1** показывает начальный снимок с 2 строками в PostgreSQL и то, как ClickPipes выполняет их начальную загрузку в ClickHouse. Как видно, обе строки копируются в ClickHouse без изменений.

**Шаг 2** показывает три операции над таблицей `users`: вставку новой строки, обновление существующей строки и удаление другой строки.

**Шаг 3** показывает, как ClickPipes реплицирует операции INSERT, UPDATE и DELETE в ClickHouse в виде версионируемых вставок. Операция UPDATE отображается как новая версия строки с ID 2, а операция DELETE — как новая версия ID 1, помеченная как true с помощью `_is_deleted`. Из‑за этого в ClickHouse на три строки больше, чем в PostgreSQL.

В результате выполнение простого запроса вроде `SELECT count(*) FROM users;` может давать разные результаты в ClickHouse и PostgreSQL. Согласно [документации по слияниям в ClickHouse](/merges#replacing-merges), устаревшие версии строк в конечном итоге отбрасываются в процессе слияния. Однако момент этого слияния непредсказуем, поэтому запросы в ClickHouse могут возвращать несогласованные результаты до его выполнения.

Как обеспечить идентичные результаты запросов и в ClickHouse, и в PostgreSQL?

### Дедупликация с помощью ключевого слова FINAL \\{#deduplicate-using-final-keyword\\}

Рекомендуемый способ выполнять дедупликацию данных в запросах ClickHouse — использовать [модификатор FINAL.](/sql-reference/statements/select/from#final-modifier) Это гарантирует, что будут возвращены только дедуплицированные строки.

Рассмотрим, как применить его к трём разным запросам.

*Обратите внимание на предложение WHERE в следующих запросах, которое используется для фильтрации удалённых строк.*

* **Простой запрос для подсчёта**: подсчитать количество записей.

Это самый простой запрос, который можно выполнить, чтобы проверить, что синхронизация прошла корректно. Оба запроса должны вернуть одинаковое количество.

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse 
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

* **Простая агрегация с JOIN**: Топ-10 пользователей, набравших больше всего просмотров.

Пример агрегации по одной таблице. Наличие дубликатов здесь сильно повлияет на результат функции `sum`.

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


#### Настройка FINAL \\{#final-setting\\}

Вместо того чтобы добавлять модификатор FINAL к каждой таблице в запросе, вы можете использовать [настройку FINAL](/operations/settings/settings#final), чтобы применять его автоматически ко всем таблицам в запросе.

Эту настройку можно задавать как для отдельного запроса, так и для всей сессии.

```sql
-- Per query FINAL setting
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Set FINAL for the session
SET final = 1;
SELECT count(*) FROM posts; 
```


#### Политика строк (ROW policy) \\{#row-policy\\}

Простой способ скрыть избыточный фильтр `_peerdb_is_deleted = 0` — использовать [политику строк (ROW policy).](/docs/operations/access-rights#row-policy-management) Ниже приведён пример, который создаёт политику строк для исключения удалённых строк из всех запросов к таблице votes.

```sql
-- Apply row policy to all users
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> Политики строк применяются к определённому списку пользователей и ролей. В этом примере политика применяется ко всем пользователям и ролям. Это можно настроить так, чтобы она применялась только к конкретным пользователям или ролям.


### Запросы в стиле Postgres \\{#query-like-with-postgres\\}

Миграция аналитического набора данных из PostgreSQL в ClickHouse часто требует модификации запросов приложения с учётом различий в обработке данных и выполнении запросов. 

В этом разделе будут рассмотрены методы дедупликации данных при сохранении исходных запросов без изменений.

#### Представления \\{#views\\}

[Представления](/sql-reference/statements/create/view#normal-view) — отличный способ скрыть ключевое слово FINAL из запроса, так как они не хранят данные и при каждом обращении просто читают их из другой таблицы.

Ниже приведён пример создания представлений для каждой таблицы нашей базы данных в ClickHouse с ключевым словом FINAL и фильтром для удалённых строк.

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

Затем мы можем обращаться к представлениям тем же запросом, что и в PostgreSQL.

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


#### Обновляемое материализованное представление \\{#refreshable-material-view\\}

Другой подход — использовать [обновляемое материализованное представление](/materialized-view/refreshable-materialized-view), которое позволяет планировать выполнение запроса для дедупликации строк и сохранения результатов в целевой таблице. При каждом запланированном обновлении целевая таблица полностью заменяется последними результатами запроса.

Ключевое преимущество этого метода заключается в том, что запрос с использованием ключевого слова FINAL выполняется только один раз во время обновления, что устраняет необходимость последующих запросов к целевой таблице с использованием FINAL.

Однако недостатком является то, что данные в целевой таблице актуальны только на момент последнего обновления. Тем не менее для многих сценариев использования интервалы обновления от нескольких минут до нескольких часов могут быть вполне достаточными.

```sql
-- Create deduplicated posts table 
CREATE TABLE deduplicated_posts AS posts;

-- Create the Materialized view and schedule to run every hour
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS 
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0 
```

После этого вы можете выполнять запросы к таблице `deduplicated_posts` как обычно.

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
