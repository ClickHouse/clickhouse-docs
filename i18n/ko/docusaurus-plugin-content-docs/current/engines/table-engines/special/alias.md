---
description: 'Alias 테이블 엔진은 다른 테이블에 대한 투명한 프록시를 생성합니다. 모든 연산은 대상 테이블로 전달되며, Alias 자체는 어떠한 데이터도 저장하지 않습니다.'
sidebar_label: 'Alias'
sidebar_position: 5
slug: /engines/table-engines/special/alias
title: 'Alias 테이블 엔진'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Alias 테이블 엔진 \{#alias-table-engine\}

<ExperimentalBadge/>

`Alias` 엔진은 다른 테이블에 대한 프록시를 생성합니다. 모든 읽기 및 쓰기 연산은 대상 테이블로 전달되며, `Alias` 자체는 데이터를 저장하지 않고 대상 테이블에 대한 참조만 유지합니다.

:::info
이 기능은 실험적 기능이며, 향후 릴리스에서 하위 호환성을 보장하지 않는 방식으로 변경될 수 있습니다.
[allow_experimental_alias_table_engine](/operations/settings/settings#allow_experimental_alias_table_engine) 설정을 통해
Alias 테이블 엔진 사용을 활성화하십시오.
`set allow_experimental_alias_table_engine = 1` 명령을 입력하십시오.
:::

## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

또는 데이터베이스 이름을 명시하여:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` 테이블은 컬럼을 명시적으로 정의하는 기능을 지원하지 않습니다. 컬럼은 대상 테이블로부터 자동으로 상속됩니다. 이를 통해 `Alias` 테이블은 항상 대상 테이블의 스키마와 일치합니다.
:::


## 엔진 매개변수 \{#engine-parameters\}

- **`target_db (optional)`** — 대상 테이블이 포함된 데이터베이스의 이름입니다.
- **`target_table`** — 대상 테이블의 이름입니다.

## 지원되는 연산 \{#supported-operations\}

`Alias` 테이블 엔진은 모든 주요 연산을 지원합니다. 

### 대상 테이블에 대한 연산 \{#operations-on-target\}

다음 연산은 대상 테이블로 프록시 처리됩니다:

| Operation | Support | Description |
|-----------|---------|-------------|
| `SELECT` | ✅ | 대상 테이블에서 데이터 읽기 |
| `INSERT` | ✅ | 대상 테이블에 데이터 쓰기 |
| `INSERT SELECT` | ✅ | 대상 테이블에 배치 삽입 |
| `ALTER TABLE ADD COLUMN` | ✅ | 대상 테이블에 컬럼 추가 |
| `ALTER TABLE MODIFY SETTING` | ✅ | 대상 테이블 설정 수정 |
| `ALTER TABLE PARTITION` | ✅ | 대상 테이블에 대한 파티션 연산 (DETACH/ATTACH/DROP) |
| `ALTER TABLE UPDATE` | ✅ | 대상 테이블의 행 업데이트 (mutation) |
| `ALTER TABLE DELETE` | ✅ | 대상 테이블에서 행 삭제 (mutation) |
| `OPTIMIZE TABLE` | ✅ | 대상 테이블 최적화 (파트 병합) |
| `TRUNCATE TABLE` | ✅ | 대상 테이블 비우기 |

### 별칭 자체에 대한 연산 \{#operations-on-alias\}

이 연산들은 대상 테이블이 **아니라** 별칭에만 영향을 줍니다:

| Operation | Support | Description |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | 별칭만 삭제하며, 대상 테이블은 변경되지 않습니다 |
| `RENAME TABLE` | ✅ | 별칭의 이름만 변경되며, 대상 테이블은 변경되지 않습니다 |

## 사용 예제 \{#usage-examples\}

### 기본 Alias 생성 \{#basic-alias-creation\}

동일한 데이터베이스 내에 간단한 alias를 생성합니다:

```sql
-- Create source table
CREATE TABLE source_data (
    id UInt32,
    name String,
    value Float64
) ENGINE = MergeTree
ORDER BY id;

-- Insert some data
INSERT INTO source_data VALUES (1, 'one', 10.1), (2, 'two', 20.2);

-- Create alias
CREATE TABLE data_alias ENGINE = Alias('source_data');

-- Query through alias
SELECT * FROM data_alias;
```

```text
┌─id─┬─name─┬─value─┐
│  1 │ one  │  10.1 │
│  2 │ two  │  20.2 │
└────┴──────┴───────┘
```


### 데이터베이스 간 별칭 \{#cross-database-alias\}

다른 데이터베이스의 테이블을 가리키는 별칭을 생성합니다:

```sql
-- Create databases
CREATE DATABASE db1;
CREATE DATABASE db2;

-- Create source table in db1
CREATE TABLE db1.events (
    timestamp DateTime,
    event_type String,
    user_id UInt32
) ENGINE = MergeTree
ORDER BY timestamp;

-- Create alias in db2 pointing to db1.events
CREATE TABLE db2.events_alias ENGINE = Alias('db1', 'events');

-- Or using database.table format
CREATE TABLE db2.events_alias2 ENGINE = Alias('db1.events');

-- Both aliases work identically
INSERT INTO db2.events_alias VALUES (now(), 'click', 100);
SELECT * FROM db2.events_alias2;
```


### Alias를 통한 쓰기 작업 \{#write-operations\}

모든 쓰기 작업은 대상 테이블로 전달됩니다.

```sql
CREATE TABLE metrics (
    ts DateTime,
    metric_name String,
    value Float64
) ENGINE = MergeTree
ORDER BY ts;

CREATE TABLE metrics_alias ENGINE = Alias('metrics');

-- Insert through alias
INSERT INTO metrics_alias VALUES 
    (now(), 'cpu_usage', 45.2),
    (now(), 'memory_usage', 78.5);

-- Insert with SELECT
INSERT INTO metrics_alias 
SELECT now(), 'disk_usage', number * 10 
FROM system.numbers 
LIMIT 5;

-- Verify data is in the target table
SELECT count() FROM metrics;  -- Returns 7
SELECT count() FROM metrics_alias;  -- Returns 7
```


### 스키마 수정 \{#schema-modification\}

ALTER 연산은 대상 테이블의 스키마를 변경합니다:

```sql
CREATE TABLE users (
    id UInt32,
    name String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE users_alias ENGINE = Alias('users');

-- Add column through alias
ALTER TABLE users_alias ADD COLUMN email String DEFAULT '';

-- Column is added to target table
DESCRIBE users;
```

```text
┌─name──┬─type───┬─default_type─┬─default_expression─┐
│ id    │ UInt32 │              │                    │
│ name  │ String │              │                    │
│ email │ String │ DEFAULT      │ ''                 │
└───────┴────────┴──────────────┴────────────────────┘
```


### 데이터 뮤테이션 \{#data-mutations\}

`UPDATE` 및 `DELETE` 연산이 지원됩니다:

```sql
CREATE TABLE products (
    id UInt32,
    name String,
    price Float64,
    status String DEFAULT 'active'
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE products_alias ENGINE = Alias('products');

INSERT INTO products_alias VALUES 
    (1, 'item_one', 100.0, 'active'),
    (2, 'item_two', 200.0, 'active'),
    (3, 'item_three', 300.0, 'inactive');

-- Update through alias
ALTER TABLE products_alias UPDATE price = price * 1.1 WHERE status = 'active';

-- Delete through alias
ALTER TABLE products_alias DELETE WHERE status = 'inactive';

-- Changes are applied to target table
SELECT * FROM products ORDER BY id;
```

```text
┌─id─┬─name─────┬─price─┬─status─┐
│  1 │ item_one │ 110.0 │ active │
│  2 │ item_two │ 220.0 │ active │
└────┴──────────┴───────┴────────┘
```


### 파티션 작업 \{#partition-operations\}

파티션이 있는 테이블에서는 파티션 작업이 전달됩니다:

```sql
CREATE TABLE logs (
    date Date,
    level String,
    message String
) ENGINE = MergeTree
PARTITION BY toYYYYMM(date)
ORDER BY date;

CREATE TABLE logs_alias ENGINE = Alias('logs');

INSERT INTO logs_alias VALUES 
    ('2024-01-15', 'INFO', 'message1'),
    ('2024-02-15', 'ERROR', 'message2'),
    ('2024-03-15', 'INFO', 'message3');

-- Detach partition through alias
ALTER TABLE logs_alias DETACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Returns 2 (partition 202402 detached)

-- Attach partition back
ALTER TABLE logs_alias ATTACH PARTITION '202402';

SELECT count() FROM logs_alias;  -- Returns 3
```


### 테이블 최적화 \{#table-optimization\}

`Optimize` 연산은 대상 테이블의 파트를 병합합니다.

```sql
CREATE TABLE events (
    id UInt32,
    data String
) ENGINE = MergeTree
ORDER BY id;

CREATE TABLE events_alias ENGINE = Alias('events');

-- Multiple inserts create multiple parts
INSERT INTO events_alias VALUES (1, 'data1');
INSERT INTO events_alias VALUES (2, 'data2');
INSERT INTO events_alias VALUES (3, 'data3');

-- Check parts count
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;

-- Optimize through alias
OPTIMIZE TABLE events_alias FINAL;

-- Parts are merged in target table
SELECT count() FROM system.parts 
WHERE database = currentDatabase() 
  AND table = 'events' 
  AND active;  -- Returns 1
```


### 별칭 관리 \{#alias-management\}

별칭은 서로 독립적으로 이름을 변경하거나 삭제할 수 있습니다:

```sql
CREATE TABLE important_data (
    id UInt32,
    value String
) ENGINE = MergeTree
ORDER BY id;

INSERT INTO important_data VALUES (1, 'critical'), (2, 'important');

CREATE TABLE old_alias ENGINE = Alias('important_data');

-- Rename alias (target table unchanged)
RENAME TABLE old_alias TO new_alias;

-- Create another alias to same table
CREATE TABLE another_alias ENGINE = Alias('important_data');

-- Drop one alias (target table and other aliases unchanged)
DROP TABLE new_alias;

SELECT * FROM another_alias;  -- Still works
SELECT count() FROM important_data;  -- Data intact, returns 2
```
