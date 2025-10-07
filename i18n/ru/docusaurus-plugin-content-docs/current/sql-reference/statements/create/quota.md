---
slug: '/sql-reference/statements/create/quota'
sidebar_label: QUOTA
sidebar_position: 42
description: 'Документация для Quota'
title: 'CREATE QUOTA'
doc_type: reference
---
Создает [квоту](../../../guides/sre/user-management/index.md#quotas-management), которую можно назначить пользователю или роли.

Синтаксис:

```sql
CREATE QUOTA [IF NOT EXISTS | OR REPLACE] name [ON CLUSTER cluster_name]
    [IN access_storage_type]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | written_bytes | execution_time | failed_sequential_authentications} = number } [,...] |
         NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```

Ключи `user_name`, `ip_address`, `client_key`, `client_key, user_name` и `client_key, ip_address` соответствуют полям в таблице [system.quotas](../../../operations/system-tables/quotas.md).

Параметры `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `written_bytes`, `execution_time`, `failed_sequential_authentications` соответствуют полям в таблице [system.quotas_usage](../../../operations/system-tables/quotas_usage.md).

Клауза `ON CLUSTER` позволяет создавать квоты в кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

**Примеры**

Ограничить максимальное количество запросов для текущего пользователя до 123 запросов в течение 15 месяцев:

```sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

Для пользователя по умолчанию ограничить максимальное время выполнения до полусекунды за 30 минут и ограничить максимальное количество запросов до 321 и максимальное количество ошибок до 10 за 5 кварталов:

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

Далее примеры, используя XML-конфигурацию (не поддерживается в ClickHouse Cloud), можно найти в [руководстве по квотам](/operations/quotas).

## Связанный контент {#related-content}

- Блог: [Создание одностраничных приложений с ClickHouse](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)