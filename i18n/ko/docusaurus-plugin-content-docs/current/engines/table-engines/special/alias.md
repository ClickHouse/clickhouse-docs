---
'description': 'Alias 테이블 엔진은 다른 테이블에 대한 투명한 프록시를 생성합니다. 모든 작업은 대상 테이블로 전달되며, 별칭 자체는
  데이터를 저장하지 않습니다.'
'sidebar_label': 'Alias'
'sidebar_position': 5
'slug': '/engines/table-engines/special/alias'
'title': '별칭 테이블 엔진'
'doc_type': 'reference'
---


# Alias 테이블 엔진

`Alias` 엔진은 다른 테이블에 대한 프록시를 생성합니다. 모든 읽기 및 쓰기 작업은 대상 테이블로 전달되며, 별칭 자체는 데이터를 저장하지 않고 대상 테이블에 대한 참조만 유지합니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_table)
```

또는 명시적 데이터베이스 이름으로:

```sql
CREATE TABLE [db_name.]alias_name
ENGINE = Alias(target_db, target_table)
```

:::note
`Alias` 테이블은 명시적 컬럼 정의를 지원하지 않습니다. 컬럼은 자동으로 대상 테이블에서 상속됩니다. 이는 별칭이 항상 대상 테이블의 스키마와 일치하도록 보장합니다.
:::

## 엔진 매개변수 {#engine-parameters}

- **`target_db (선택 사항)`** — 대상 테이블이 포함된 데이터베이스의 이름입니다.
- **`target_table`** — 대상 테이블의 이름입니다.

## 지원되는 작업 {#supported-operations}

`Alias` 테이블 엔진은 모든 주요 작업을 지원합니다. 
### 대상 테이블의 작업 {#operations-on-target}

이 작업들은 대상 테이블로 프록시됩니다:

| 작업 | 지원 | 설명 |
|-----------|---------|-------------|
| `SELECT` | ✅ | 대상 테이블에서 데이터 읽기 |
| `INSERT` | ✅ | 대상 테이블에 데이터 쓰기 |
| `INSERT SELECT` | ✅ | 대상 테이블에 배치 삽입 |
| `ALTER TABLE ADD COLUMN` | ✅ | 대상 테이블에 컬럼 추가 |
| `ALTER TABLE MODIFY SETTING` | ✅ | 대상 테이블 설정 수정 |
| `ALTER TABLE PARTITION` | ✅ | 대상 테이블에서의 파티션 작업 (DETACH/ATTACH/DROP) |
| `ALTER TABLE UPDATE` | ✅ | 대상 테이블의 행 업데이트 (변경) |
| `ALTER TABLE DELETE` | ✅ | 대상 테이블에서 행 삭제 (변경) |
| `OPTIMIZE TABLE` | ✅ | 대상 테이블 최적화 (파트 병합) |
| `TRUNCATE TABLE` | ✅ | 대상 테이블 잘라내기 |

### 별칭 자체의 작업 {#operations-on-alias}

이 작업들은 별칭에만 영향을 미치며, **대상 테이블**에는 영향을 주지 않습니다:

| 작업 | 지원 | 설명 |
|-----------|---------|-------------|
| `DROP TABLE` | ✅ | 별칭만 삭제, 대상 테이블은 변경되지 않음 |
| `RENAME TABLE` | ✅ | 별칭만 이름 변경, 대상 테이블은 변경되지 않음 |

## 사용 예시 {#usage-examples}

### 기본 별칭 생성 {#basic-alias-creation}

같은 데이터베이스에 간단한 별칭 생성:

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

### 교차 데이터베이스 별칭 {#cross-database-alias}

다른 데이터베이스의 테이블을 가리키는 별칭 생성:

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

### 별칭을 통한 쓰기 작업 {#write-operations}

모든 쓰기 작업은 대상 테이블로 전달됩니다:

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

### 스키마 수정 {#schema-modification}

ALTER 작업은 대상 테이블의 스키마를 수정합니다:

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

### 데이터 변형 {#data-mutations}

UPDATE 및 DELETE 작업이 지원됩니다:

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

### 파티션 작업 {#partition-operations}

파티셔닝된 테이블에 대해, 파티션 작업이 전달됩니다:

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

### 테이블 최적화 {#table-optimization}

최적화 작업은 대상 테이블에서 파트를 병합합니다:

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

### 별칭 관리 {#alias-management}

별칭은 독립적으로 이름을 변경하거나 삭제할 수 있습니다:

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
