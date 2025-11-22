---
description: 'Документация по оператору UNDROP TABLE'
sidebar_label: 'UNDROP'
slug: /sql-reference/statements/undrop
title: 'UNDROP TABLE'
doc_type: 'reference'
---

# UNDROP TABLE

Отменяет удаление таблицы.

Начиная с версии ClickHouse 23.3, можно выполнить UNDROP таблицы в базе данных типа Atomic
в течение интервала `database_atomic_delay_before_drop_table_sec` (по умолчанию 8 минут) после выполнения запроса DROP TABLE. Удалённые таблицы перечислены
в системной таблице `system.dropped_tables`.

Если у вас есть материализованное представление без предложения `TO`, связанное с удалённой таблицей, то вам также необходимо выполнить UNDROP для внутренней таблицы этого представления.

:::tip
См. также [DROP TABLE](/sql-reference/statements/drop.md)
:::

Синтаксис:

```sql
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
Строка 1:
──────
index:                 0
database:              default
table:                 tab
uuid:                  aa696a1a-1d70-4e60-a841-4c80827706cc
engine:                MergeTree
metadata_dropped_path: /var/lib/clickhouse/metadata_dropped/default.tab.aa696a1a-1d70-4e60-a841-4c80827706cc.sql
table_dropped_time:    2023-04-05 14:12:12

Получена 1 строка. Затрачено: 0.001 сек. 
```

````sql
UNDROP TABLE tab;

SELECT *
FROM system.dropped_tables
FORMAT Vertical;

```response
Ok.

0 rows in set. Elapsed: 0.001 sec. 
````

```sql
DESCRIBE TABLE tab
FORMAT Vertical;
```

```response
Строка 1:
──────
name:               id
type:               UInt8
default_type:       
default_expression: 
comment:            
codec_expression:   
ttl_expression:     
```
