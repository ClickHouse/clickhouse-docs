---
sidebar_label: 'Ключи упорядочивания'
description: 'Как определять пользовательские ключи упорядочивания.'
slug: /integrations/clickpipes/postgres/ordering_keys
title: 'Ключи упорядочивания'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

Ключи упорядочивания (также называемые ключами сортировки) определяют, как данные сортируются на диске и индексируются в таблице ClickHouse. При репликации из Postgres ClickPipes по умолчанию использует первичный ключ таблицы Postgres в качестве ключа упорядочивания для соответствующей таблицы в ClickHouse. В большинстве случаев первичный ключ Postgres является достаточным ключом упорядочивания, так как ClickHouse уже оптимизирован для быстрого сканирования, и пользовательские ключи упорядочивания часто не требуются.

Как описано в [руководстве по миграции](/migrations/postgresql/data-modeling-techniques), для более крупных сценариев использования вам следует включать дополнительные столбцы помимо первичного ключа Postgres в ключ упорядочивания ClickHouse для оптимизации запросов. 

По умолчанию при использовании CDC выбор ключа упорядочивания, отличного от первичного ключа Postgres, может вызвать проблемы с дедупликацией данных в ClickHouse. Это происходит потому, что ключ упорядочивания в ClickHouse выполняет двойную роль: он управляет индексированием и сортировкой данных, одновременно выступая в роли ключа дедупликации. Самый простой способ решить эту проблему — создать refreshable materialized views.

## Использование refreshable materialized views \{#use-refreshable-materialized-views\}

Простой способ задать пользовательские ключи сортировки (ORDER BY) — использовать [refreshable materialized views](/materialized-view/refreshable-materialized-view) (MVs). Они позволяют периодически (например, каждые 5 или 10 минут) создавать копию всей таблицы с нужным ключом сортировки.

Ниже приведён пример Refreshable MV с пользовательским ORDER BY и обязательной дедупликацией:

```sql
CREATE MATERIALIZED VIEW posts_final
REFRESH EVERY 10 second ENGINE = ReplacingMergeTree(_peerdb_version)
ORDER BY (owneruserid,id) -- different ordering key but with suffixed postgres pkey
AS
SELECT * FROM posts FINAL 
WHERE _peerdb_is_deleted = 0; -- this does the deduplication
```


## Пользовательские ключи сортировки без refreshable materialized views \{#custom-ordering-keys-without-refreshable-materialized-views\}

Если refreshable materialized views не подходят из-за объёма данных, ниже приведено несколько рекомендаций, которые помогут задать пользовательские ключи сортировки для больших таблиц и уменьшить проблемы, связанные с дедупликацией.

### Выбирайте столбцы ключа сортировки, которые не меняются для конкретной строки \{#choose-ordering-key-columns-that-dont-change-for-a-given-row\}

При добавлении дополнительных столбцов в ключ сортировки для ClickHouse (помимо первичного ключа из Postgres) мы рекомендуем выбирать столбцы, которые не меняются для одной и той же строки. Это помогает предотвратить проблемы с согласованностью данных и дедупликацией при использовании ReplacingMergeTree.

Например, в многотенантном SaaS‑приложении использование (`tenant_id`, `id`) в качестве ключа сортировки — хороший выбор. Эти столбцы однозначно идентифицируют каждую строку, и `tenant_id` остаётся постоянным для `id`, даже если другие столбцы меняются. Поскольку дедупликация по id совпадает с дедупликацией по (tenant_id, id), это помогает избежать проблем с [дедупликацией данных](https://docs.peerdb.io/mirror/ordering-key-different), которые могли бы возникнуть, если бы tenant_id менялся.

### Настройка Replica Identity на таблицах Postgres на пользовательский ключ упорядочивания \{#set-replica-identity-on-postgres-tables-to-custom-ordering-key\}

Чтобы CDC (фиксация изменений данных) в Postgres работала как ожидается, важно изменить `REPLICA IDENTITY` у таблиц так, чтобы он включал столбцы ключа упорядочивания. Это необходимо для корректной обработки операций DELETE.

Если `REPLICA IDENTITY` не включает столбцы ключа упорядочивания, CDC (фиксация изменений данных) в Postgres не будет фиксировать значения столбцов, отличных от первичного ключа — это ограничение механизма логического декодирования в Postgres. Все столбцы ключа упорядочивания, кроме первичного ключа в Postgres, будут иметь значения NULL. Это влияет на дедупликацию: предыдущая версия строки может не быть дедуплицирована с последней удалённой версией (где `_peerdb_is_deleted` установлено в 1).

В приведённом выше примере с `owneruserid` и `id`, если первичный ключ ещё не включает `owneruserid`, необходимо создать `UNIQUE INDEX` по (`owneruserid`, `id`) и установить его как `REPLICA IDENTITY` для таблицы. Это гарантирует, что CDC (фиксация изменений данных) в Postgres будет фиксировать необходимые значения столбцов для корректной репликации и дедупликации.

Ниже приведён пример того, как это сделать для таблицы `events`. Обязательно примените это ко всем таблицам с изменёнными ключами упорядочивания.

```sql
-- Create a UNIQUE INDEX on (owneruserid, id)
CREATE UNIQUE INDEX posts_unique_owneruserid_idx ON posts(owneruserid, id);
-- Set REPLICA IDENTITY to use this index
ALTER TABLE posts REPLICA IDENTITY USING INDEX posts_unique_owneruserid_idx;
```
