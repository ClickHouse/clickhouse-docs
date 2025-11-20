---
sidebar_label: 'Стратегии дедупликации'
description: 'Обработка дубликатов и удалённых строк.'
slug: /integrations/clickpipes/postgres/deduplication
title: 'Стратегии дедупликации (на основе CDC)'
keywords: ['deduplication', 'postgres', 'clickpipes', 'replacingmergetree', 'final']
doc_type: 'guide'
---

import clickpipes_initial_load from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-cdc-initial-load.png';
import Image from '@theme/IdealImage';

Обновления и удаления, реплицируемые из Postgres в ClickHouse, приводят к дублированию строк в ClickHouse из‑за особенностей структуры хранения данных и процесса репликации. На этой странице объясняется, почему это происходит, и описываются стратегии работы с дубликатами в ClickHouse.


## Как реплицируются данные? {#how-does-data-get-replicated}

### Логическое декодирование PostgreSQL {#PostgreSQL-logical-decoding}

ClickPipes использует [логическое декодирование Postgres](https://www.pgedge.com/blog/logical-replication-evolution-in-chronological-order-clustering-solution-built-around-logical-replication) для получения изменений по мере их возникновения в Postgres. Процесс логического декодирования в Postgres позволяет клиентам, таким как ClickPipes, получать изменения в удобочитаемом формате, то есть в виде последовательности операций INSERT, UPDATE и DELETE.

### ReplacingMergeTree {#replacingmergetree}

ClickPipes сопоставляет таблицы Postgres с ClickHouse, используя движок [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree). ClickHouse работает наиболее эффективно с нагрузками типа append-only и не рекомендуется использовать частые операции UPDATE. Именно здесь ReplacingMergeTree проявляет свои преимущества.

В ReplacingMergeTree обновления моделируются как вставки с более новой версией (`_peerdb_version`) строки, а удаления — как вставки с более новой версией и флагом `_peerdb_is_deleted`, установленным в true. Движок ReplacingMergeTree дедуплицирует и объединяет данные в фоновом режиме, сохраняя последнюю версию строки для заданного первичного ключа (id), что обеспечивает эффективную обработку операций UPDATE и DELETE в виде версионированных вставок.

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

Приведенная ниже иллюстрация демонстрирует базовый пример синхронизации таблицы `users` между PostgreSQL и ClickHouse с использованием ClickPipes.

<Image img={clickpipes_initial_load} alt='Начальная загрузка ClickPipes' size='lg' />

**Шаг 1** показывает начальный снимок 2 строк в PostgreSQL и выполнение ClickPipes начальной загрузки этих 2 строк в ClickHouse. Как видно, обе строки копируются в ClickHouse без изменений.

**Шаг 2** показывает три операции над таблицей users: вставку новой строки, обновление существующей строки и удаление другой строки.

**Шаг 3** показывает, как ClickPipes реплицирует операции INSERT, UPDATE и DELETE в ClickHouse в виде версионированных вставок. UPDATE отображается как новая версия строки с ID 2, а DELETE — как новая версия ID 1, помеченная как true с помощью `_is_deleted`. Из-за этого в ClickHouse на три строки больше, чем в PostgreSQL.

В результате выполнение простого запроса типа `SELECT count(*) FROM users;` может давать разные результаты в ClickHouse и PostgreSQL. Согласно [документации по слияниям ClickHouse](/merges#replacing-merges), устаревшие версии строк в конечном итоге удаляются в процессе слияния. Однако время этого слияния непредсказуемо, что означает, что запросы в ClickHouse могут возвращать несогласованные результаты до его завершения.

Как обеспечить идентичные результаты запросов в ClickHouse и PostgreSQL?

### Дедупликация с использованием ключевого слова FINAL {#deduplicate-using-final-keyword}

Рекомендуемый способ дедупликации данных в запросах ClickHouse — использование [модификатора FINAL.](/sql-reference/statements/select/from#final-modifier) Это гарантирует возврат только дедуплицированных строк.

Рассмотрим, как применить его к трем различным запросам.

_Обратите внимание на предложение WHERE в следующих запросах, используемое для фильтрации удаленных строк._

- **Простой запрос подсчета**: Подсчет количества постов.

Это простейший запрос, который можно выполнить для проверки успешности синхронизации. Оба запроса должны вернуть одинаковое количество.

```sql
-- PostgreSQL
SELECT count(*) FROM posts;

-- ClickHouse
SELECT count(*) FROM posts FINAL WHERE _peerdb_is_deleted=0;
```

- **Простая агрегация с JOIN**: Топ-10 пользователей, набравших наибольшее количество просмотров.

Пример агрегации по одной таблице. Наличие дубликатов здесь существенно повлияет на результат функции суммирования.


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

Вместо добавления модификатора FINAL к каждому имени таблицы в запросе можно использовать [настройку FINAL](/operations/settings/settings#final) для автоматического применения ко всем таблицам в запросе.

Эту настройку можно применить как к отдельному запросу, так и ко всей сессии.

```sql
-- Настройка FINAL для отдельного запроса
SELECT count(*) FROM posts SETTINGS FINAL = 1;

-- Установка FINAL для сессии
SET final = 1;
SELECT count(*) FROM posts;
```

#### Политика строк (ROW policy) {#row-policy}

Простой способ скрыть избыточный фильтр `_peerdb_is_deleted = 0` — использовать [политику строк (ROW policy).](/docs/operations/access-rights#row-policy-management) Ниже приведен пример создания политики строк для исключения удаленных строк из всех запросов к таблице votes.

```sql
-- Применение политики строк ко всем пользователям
CREATE ROW POLICY cdc_policy ON votes FOR SELECT USING _peerdb_is_deleted = 0 TO ALL;
```

> Политики строк применяются к списку пользователей и ролей. В данном примере политика применяется ко всем пользователям и ролям. При необходимости можно ограничить применение только конкретными пользователями или ролями.

### Запросы как в Postgres {#query-like-with-postgres}

Миграция аналитического набора данных из PostgreSQL в ClickHouse часто требует модификации запросов приложения для учета различий в обработке данных и выполнении запросов.

В этом разделе рассматриваются техники дедупликации данных с сохранением исходных запросов без изменений.

#### Представления (Views) {#views}

[Представления](/sql-reference/statements/create/view#normal-view) — отличный способ скрыть ключевое слово FINAL из запроса, поскольку они не хранят данные, а просто выполняют чтение из другой таблицы при каждом обращении.

Ниже приведен пример создания представлений для каждой таблицы базы данных в ClickHouse с ключевым словом FINAL и фильтром для удаленных строк.

```sql
CREATE VIEW posts_view AS SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW users_view AS SELECT * FROM users FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW votes_view AS SELECT * FROM votes FINAL WHERE _peerdb_is_deleted=0;
CREATE VIEW comments_view AS SELECT * FROM comments FINAL WHERE _peerdb_is_deleted=0;
```

Затем можно запрашивать представления, используя тот же запрос, что и в PostgreSQL.

```sql
-- Наиболее просматриваемые посты
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

Другой подход — использовать [обновляемое материализованное представление](/materialized-view/refreshable-materialized-view), которое позволяет планировать выполнение запроса для дедупликации строк и сохранения результатов в целевой таблице. При каждом запланированном обновлении целевая таблица заменяется последними результатами запроса.

Ключевое преимущество этого метода заключается в том, что запрос с использованием ключевого слова FINAL выполняется только один раз во время обновления, что устраняет необходимость использования FINAL в последующих запросах к целевой таблице.

Однако недостатком является то, что данные в целевой таблице актуальны только на момент последнего обновления. Тем не менее для многих сценариев использования интервалы обновления от нескольких минут до нескольких часов могут быть вполне достаточными.

```sql
-- Создание дедуплицированной таблицы постов
CREATE TABLE deduplicated_posts AS posts;

-- Создание материализованного представления с запуском каждый час
CREATE MATERIALIZED VIEW deduplicated_posts_mv REFRESH EVERY 1 HOUR TO deduplicated_posts AS
SELECT * FROM posts FINAL WHERE _peerdb_is_deleted=0
```

Затем можно запрашивать таблицу `deduplicated_posts` обычным образом.


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
