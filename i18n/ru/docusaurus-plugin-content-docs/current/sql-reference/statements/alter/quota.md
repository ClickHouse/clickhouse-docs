---
slug: '/sql-reference/statements/alter/quota'
sidebar_label: QUOTA
sidebar_position: 46
description: 'Документация для Quota'
title: 'ALTER QUOTA'
doc_type: reference
---
Изменение квот.

Синтаксис:

```sql
ALTER QUOTA [IF EXISTS] name [ON CLUSTER cluster_name]
    [RENAME TO new_name]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL number {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = number } [,...] |
        NO LIMITS | TRACKING ONLY} [,...]]
    [TO {role [,...] | ALL | ALL EXCEPT role [,...]}]
```
Ключи `user_name`, `ip_address`, `client_key`, `client_key, user_name` и `client_key, ip_address` соответствуют полям в таблице [system.quotas](../../../operations/system-tables/quotas.md).

Параметры `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `execution_time` соответствуют полям в таблице [system.quotas_usage](../../../operations/system-tables/quotas_usage.md).

Клаузула `ON CLUSTER` позволяет создавать квоты в кластере, см. [Распределенный DDL](../../../sql-reference/distributed-ddl.md).

**Примеры**

Ограничьте максимальное количество запросов для текущего пользователя до 123 запросов в течение 15 месяцев:

```sql
ALTER QUOTA IF EXISTS qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

Для пользователя по умолчанию ограничьте максимальное время выполнения до половины секунды в течение 30 минут, и ограничьте максимальное количество запросов до 321 и максимальное количество ошибок до 10 в течение 5 кварталов:

```sql
ALTER QUOTA IF EXISTS qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```