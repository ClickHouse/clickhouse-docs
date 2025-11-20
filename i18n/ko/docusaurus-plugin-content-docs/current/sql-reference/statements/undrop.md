---
'description': 'UNDROP TABLE에 대한 문서'
'sidebar_label': 'UNDROP'
'slug': '/sql-reference/statements/undrop'
'title': 'UNDROP TABLE'
'doc_type': 'reference'
---


# UNDROP TABLE

테이블의 삭제를 취소합니다.

ClickHouse 버전 23.3부터는 DROP TABLE 문을 실행한 후 `database_atomic_delay_before_drop_table_sec` (기본값 8분) 내에서 Atomic 데이터베이스에서 테이블을 UNDROP하는 것이 가능합니다. 삭제된 테이블은 `system.dropped_tables`라는 시스템 테이블에 나열됩니다.

삭제된 테이블과 연결된 `TO` 절이 없는 물리화된 뷰가 있는 경우, 해당 뷰의 내부 테이블도 UNDROP해야 합니다.

:::tip
또한 [DROP TABLE](/sql-reference/statements/drop.md)를 참조하세요.
:::

구문:

```sql
UNDROP TABLE [db.]name [UUID '<uuid>'] [ON CLUSTER cluster]
```

**예제**

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
