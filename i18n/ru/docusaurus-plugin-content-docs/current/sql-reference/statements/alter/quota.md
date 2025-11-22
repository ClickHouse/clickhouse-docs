---
description: 'Документация по квотам'
sidebar_label: 'QUOTA'
sidebar_position: 46
slug: /sql-reference/statements/alter/quota
title: 'ALTER QUOTA'
doc_type: 'reference'
---

Изменяет квоты.

Синтаксис:

```sql
ALTER QUOTA [IF EXISTS] имя [ON CLUSTER имя_кластера]
    [RENAME TO новое_имя]
    [KEYED BY {user_name | ip_address | client_key | client_key,user_name | client_key,ip_address} | NOT KEYED]
    [FOR [RANDOMIZED] INTERVAL число {second | minute | hour | day | week | month | quarter | year}
        {MAX { {queries | query_selects | query_inserts | errors | result_rows | result_bytes | read_rows | read_bytes | execution_time} = число } [,...] |
        NO LIMITS | TRACKING ONLY} [,...]]
    [TO {роль [,...] | ALL | ALL EXCEPT роль [,...]}]
```

Ключи `user_name`, `ip_address`, `client_key`, `client_key, user_name` и `client_key, ip_address` соответствуют столбцам таблицы [system.quotas](../../../operations/system-tables/quotas.md).

Параметры `queries`, `query_selects`, `query_inserts`, `errors`, `result_rows`, `result_bytes`, `read_rows`, `read_bytes`, `execution_time` соответствуют столбцам таблицы [system.quotas&#95;usage](../../../operations/system-tables/quotas_usage.md).

Конструкция `ON CLUSTER` позволяет создавать квоты на кластере, см. [Distributed DDL](../../../sql-reference/distributed-ddl.md).

**Примеры**

Ограничить максимальное количество запросов для текущего пользователя до 123 запросов в течение 15 месяцев:

```sql
ALTER QUOTA IF EXISTS qA FOR INTERVAL 15 month MAX queries = 123 TO CURRENT_USER;
```

Для пользователя по умолчанию ограничьте максимальное время выполнения до половины секунды в течение 30 минут, а также установите ограничение на максимальное число запросов — 321 и максимальное число ошибок — 10 за 5 кварталов:

```sql
ALTER QUOTA IF EXISTS qB FOR INTERVAL 30 minute MAX execution_time = 0.5, FOR INTERVAL 5 quarter MAX queries = 321, errors = 10 TO default;
```
