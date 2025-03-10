---
slug: /sql-reference/statements/undrop
sidebar_label: UNDROP
---


# UNDROP TABLE

Отменяет удаление таблицы.

Начиная с версии ClickHouse 23.3, можно выполнить UNDROP таблицы в атомарной базе данных в течение `database_atomic_delay_before_drop_table_sec` (по умолчанию 8 минут) после выполнения запроса DROP TABLE. Удаленные таблицы перечислены в системной таблице под названием `system.dropped_tables`.

Если у вас есть материализованное представление без условия `TO`, связанного с удаленной таблицей, вам также потребуется выполнить UNDROP внутренней таблицы этого представления.

:::tip
Смотрите также [DROP TABLE](/sql-reference/statements/drop.md)
:::

Синтаксис:

``` sql
UNDROP TABLE [db.]name [UUID '<uuid>'] [ON CLUSTER cluster]
```

**Пример**

```sql
CREATE TABLE tab
(
    `id` UInt8
)
ENGINE = MergeTree
ORDER BY id;

DROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;
```

```response
Row 1:
──────
index:                 0
database:              default
table:                 tab
uuid:                  aa696a1a-1d70-4e60-a841-4c80827706cc
engine:                MergeTree
metadata_dropped_path: /var/lib/clickhouse/metadata_dropped/default.tab.aa696a1a-1d70-4e60-a841-4c80827706cc.sql
table_dropped_time:    2023-04-05 14:12:12

1 row in set. Elapsed: 0.001 sec. 
```

```sql
UNDROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;

```response
Ok.

0 rows in set. Elapsed: 0.001 sec. 
```

```sql
DESCRIBE TABLE tab
FORMAT Vertical;
```

```response
Row 1:
──────
name:               id
type:               UInt8
default_type:       
default_expression: 
comment:            
codec_expression:   
ttl_expression:     
```
