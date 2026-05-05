---
description: 'Документация по QUOTA'
sidebar_label: 'QUOTA'
sidebar_position: 42
slug: /sql-reference/statements/create/quota
title: 'CREATE QUOTA'
doc_type: 'reference'
---

Создает [квоту](../../../guides/sre/user-management/index.md#quotas-management), которую можно назначить пользователю или роли.

Синтаксис:

```sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address | normalized_query_hash} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | written_bytes | execution_time | failed_sequential_authentications | queries_per_normalized_hash} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

Ключи `user_name`, `ip_address`, `client_key`, `client_key, user_name`, `client_key, ip_address` и `normalized_query_hash` соответствуют полям в таблице [system.quotas](../../../operations/system-tables/quotas.md).

Параметры `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `written_bytes`, `execution_time`, `failed_sequential_authentications`, `queries_per_normalized_hash` соответствуют полям в таблице [system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md).

Предложение `ON CLUSTER` позволяет создавать квоты на кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).

**Примеры**

Ограничьте максимальное число запросов для текущего пользователя значением 123 запроса за период в 15 месяцев:

```sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

Для пользователя по умолчанию задайте следующие ограничения: максимальное время выполнения — полсекунды в течение 30 минут, максимальное число запросов — 321, а максимальное число ошибок — 10 за 5 кварталов:

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

Создайте квоту, в которой для каждого отдельного нормализованного шаблона запроса выделяется собственный бакет с лимитом 100 выполнений в час:

```sql
CREATE QUOTA qC KEYED BY normalized_query_hash FOR INTERVAL 1 hour MAX queries = 100 TO default;
```

Ограничьте любой отдельный нормализованный шаблон запроса до 50 выполнений в час (независимо от типа ключа квоты):

```sql
CREATE QUOTA qD FOR INTERVAL 1 hour MAX queries_per_normalized_hash = 50 TO default;
```

Дополнительные примеры с использованием конфигурации XML (не поддерживается в ClickHouse Cloud) можно найти в [руководстве по QUOTA](/operations/quotas).

## Связанные материалы \{#related-content\}

* Блог: [Создание одностраничных приложений на ClickHouse](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)