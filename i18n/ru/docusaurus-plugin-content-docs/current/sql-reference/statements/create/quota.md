---
description: 'Документация по квоте'
sidebar_label: 'QUOTA'
sidebar_position: 42
slug: /sql-reference/statements/create/quota
title: 'CREATE QUOTA'
doc_type: 'reference'
---

Создаёт [квоту](../../../guides/sre/user-management/index.md#quotas-management), которую можно назначить пользователю или роли.

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

Ключи `user_name`, `ip_address`, `client_key`, `client_key, user_name` и `client_key, ip_address` соответствуют столбцам в таблице [system.quotas](../../../operations/system-tables/quotas.md).

Параметры `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `written_bytes`, `execution_time`, `failed_sequential_authentications` соответствуют столбцам в таблице [system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md).

Конструкция `ON CLUSTER` позволяет создавать квоты на кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).

**Примеры**

Ограничьте максимальное количество запросов для текущего пользователя значением 123 запроса за период 15 месяцев:

```sql
CREATE QUOTA qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

Для пользователя по умолчанию установите максимальное время выполнения до 0,5 секунды за 30 минут, а также ограничьте максимальное число запросов 321 и максимальное число ошибок — 10 за 5 кварталов:

```sql
CREATE QUOTA qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```

Дополнительные примеры с использованием конфигурации XML (которая не поддерживается в ClickHouse Cloud) можно найти в [руководстве по квотам](/operations/quotas).


## Связанные материалы {#related-content}

- Блог: [Создание одностраничных приложений на базе ClickHouse](https://clickhouse.com/blog/building-single-page-applications-with-clickhouse-and-http)
