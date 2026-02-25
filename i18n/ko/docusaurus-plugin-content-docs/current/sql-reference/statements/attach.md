---
description: 'ATTACH에 대한 문서'
sidebar_label: 'ATTACH'
sidebar_position: 40
slug: /sql-reference/statements/attach
title: 'ATTACH SQL 문'
doc_type: 'reference'
---

데이터베이스를 다른 서버로 이동할 때와 같이 테이블이나 딕셔너리를 ATTACH합니다.

**구문**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

쿼리는 디스크에 데이터를 생성하지 않고, 데이터가 이미 적절한 위치에 있다고 가정하며 지정한 테이블, 딕셔너리 또는 데이터베이스에 대한 정보만 서버에 추가합니다. `ATTACH` 쿼리를 실행한 후에는 서버가 해당 테이블, 딕셔너리 또는 데이터베이스의 존재를 알게 됩니다.

이전에 테이블이 ([DETACH](../../sql-reference/statements/detach.md) 쿼리로) 분리되었다면, 즉 구조가 이미 알려져 있는 경우에는 구조를 다시 정의하지 않고 축약 구문을 사용할 수 있습니다.

## 기존 테이블 ATTACH \{#attach-existing-table\}

**구문**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

이 쿼리는 서버를 시작할 때 사용됩니다. 서버는 테이블 메타데이터를 `ATTACH` 쿼리가 들어 있는 파일로 저장하고, 일부 시스템 테이블을 제외하고는 서버가 시작될 때 해당 `ATTACH` 쿼리들을 그대로 실행합니다(일부 시스템 테이블은 서버에서 명시적으로 생성합니다).

테이블이 영구적으로 detach된 경우, 서버 시작 시 자동으로 다시 attach되지 않으므로 `ATTACH` 쿼리를 명시적으로 실행해야 합니다.

## 새 테이블 생성 및 데이터 연결 \{#create-new-table-and-attach-data\}

### 지정된 테이블 데이터 경로 사용 \{#with-specified-path-to-table-data\}

이 쿼리는 제공된 구조로 새 테이블을 생성한 다음, `user_files` 내 지정된 디렉터리에서 테이블 데이터를 연결합니다.

**구문**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**예제**

쿼리:

```sql
DROP TABLE IF EXISTS test;
INSERT INTO TABLE FUNCTION file('01188_attach/test/data.TSV', 'TSV', 's String, n UInt8') VALUES ('test', 42);
ATTACH TABLE test FROM '01188_attach/test' (s String, n UInt8) ENGINE = File(TSV);
SELECT * FROM test;
```

결과:

```sql
┌─s────┬──n─┐
│ test │ 42 │
└──────┴────┘
```

### 지정된 테이블 UUID 사용 \{#with-specified-table-uuid\}

이 쿼리는 제공된 구조로 새 테이블을 생성하고, 지정된 UUID를 가진 테이블의 데이터를 새 테이블에 첨부합니다.
이는 [Atomic](../../engines/database-engines/atomic.md) 데이터베이스 엔진에서 지원됩니다.

**구문**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## MergeTree 테이블을 ReplicatedMergeTree로 Attach \{#attach-mergetree-table-as-replicatedmergetree\}

복제되지 않은 MergeTree 테이블을 ReplicatedMergeTree로 attach할 수 있습니다. ReplicatedMergeTree 테이블은 `default_replica_path` 및 `default_replica_name` 설정 값으로 생성됩니다. 또한 복제된 테이블을 일반 MergeTree로 attach하는 것도 가능합니다.

이 쿼리는 ZooKeeper에 있는 테이블 데이터에는 영향을 주지 않습니다. 따라서 attach 이후에 `SYSTEM RESTORE REPLICA`를 사용하여 ZooKeeper에 메타데이터를 추가하거나, `SYSTEM DROP REPLICA ... FROM ZKPATH ...`로 메타데이터를 삭제해야 합니다.

기존 ReplicatedMergeTree 테이블에 레플리카를 추가하려는 경우, 변환된 MergeTree 테이블의 모든 로컬 데이터가 detach된다는 점에 유의해야 합니다.

**구문**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**테이블을 복제 테이블(Replicated Table)로 변환**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**테이블을 비복제 테이블로 변환**

테이블의 ZooKeeper 경로와 레플리카 이름을 가져옵니다:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```

결과:

```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```

테이블을 복제되지 않은(non-replicated) 상태로 ATTACH하고 ZooKeeper에서 레플리카의 데이터를 삭제합니다.

```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## 기존 딕셔너리 연결 \{#attach-existing-dictionary\}

이전에 분리한 딕셔너리를 다시 연결합니다.

**구문**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## 기존 데이터베이스 연결 \{#attach-existing-database\}

이전에 detach된 데이터베이스를 다시 연결합니다.

**구문**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
