---
'description': 'Attach에 대한 문서'
'sidebar_label': 'ATTACH'
'sidebar_position': 40
'slug': '/sql-reference/statements/attach'
'title': 'ATTACH 문'
'doc_type': 'reference'
---

Attaches a table or a dictionary, for example, when moving a database to another server.

**Syntax**

```sql
ATTACH TABLE|DICTIONARY|DATABASE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster] ...
```

쿼리는 디스크에 데이터를 생성하지 않지만 데이터가 이미 적절한 위치에 있다고 가정하고, 지정된 테이블, 딕셔너리 또는 데이터베이스에 대한 정보를 서버에 추가합니다. `ATTACH` 쿼리 실행 후, 서버는 테이블, 딕셔너리 또는 데이터베이스의 존재를 인지하게 됩니다.

이전에 분리된 테이블([DETACH](../../sql-reference/statements/detach.md) 쿼리)이라면, 즉 구조가 알려져 있다면, 구조를 정의하지 않고도 단축형을 사용할 수 있습니다.

## Attach Existing Table {#attach-existing-table}

**Syntax**

```sql
ATTACH TABLE [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

이 쿼리는 서버 시작 시 사용됩니다. 서버는 `ATTACH` 쿼리로 테이블 메타데이터를 파일로 저장하며, 이는 서버 시작 시 간단히 실행됩니다(명시적으로 서버에 생성되는 일부 시스템 테이블을 제외하고).

테이블이 영구적으로 분리되었다면 서버 시작 시 다시 연결되지 않으므로 `ATTACH` 쿼리를 명시적으로 사용해야 합니다.

## Create New Table And Attach Data {#create-new-table-and-attach-data}

### With Specified Path to Table Data {#with-specified-path-to-table-data}

쿼리는 제공된 구조로 새로운 테이블을 생성하고 `user_files`의 제공된 디렉토리에서 테이블 데이터를 연결합니다.

**Syntax**

```sql
ATTACH TABLE name FROM 'path/to/data/' (col1 Type1, ...)
```

**Example**

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

### With Specified Table UUID {#with-specified-table-uuid}

이 쿼리는 제공된 구조로 새로운 테이블을 생성하고 지정된 UUID를 가진 테이블에서 데이터를 연결합니다. 이는 [Atomic](../../engines/database-engines/atomic.md) 데이터베이스 엔진에서 지원됩니다.

**Syntax**

```sql
ATTACH TABLE name UUID '<uuid>' (col1 Type1, ...)
```

## Attach MergeTree table as ReplicatedMergeTree {#attach-mergetree-table-as-replicatedmergetree}

비복제 MergeTree 테이블을 ReplicatedMergeTree로 연결할 수 있습니다. ReplicatedMergeTree 테이블은 `default_replica_path` 및 `default_replica_name` 설정의 값으로 생성됩니다. 복제 테이블을 일반 MergeTree로 연결하는 것도 가능합니다.

이 쿼리에서는 ZooKeeper의 테이블 데이터에 영향을 미치지 않음을 유의하십시오. 이는 연결 후 `SYSTEM RESTORE REPLICA`를 사용하여 ZooKeeper에 메타데이터를 추가하거나, `SYSTEM DROP REPLICA ... FROM ZKPATH ...`로 지워야 함을 의미합니다.

기존 ReplicatedMergeTree 테이블에 복제본을 추가하려는 경우, 변환된 MergeTree 테이블의 모든 로컬 데이터가 분리된다는 점을 유의하시기 바랍니다.

**Syntax**

```sql
ATTACH TABLE [db.]name AS [NOT] REPLICATED
```

**Convert table to replicated**

```sql
DETACH TABLE test;
ATTACH TABLE test AS REPLICATED;
SYSTEM RESTORE REPLICA test;
```

**Convert table to not replicated**

테이블의 ZooKeeper 경로와 복제본 이름을 가져옵니다:

```sql
SELECT replica_name, zookeeper_path FROM system.replicas WHERE table='test';
```
결과:
```sql
┌─replica_name─┬─zookeeper_path─────────────────────────────────────────────┐
│ r1           │ /clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1 │
└──────────────┴────────────────────────────────────────────────────────────┘
```
복제본이 아닌 테이블로 연결하고 ZooKeeper에서 복제본의 데이터를 삭제합니다:
```sql
DETACH TABLE test;
ATTACH TABLE test AS NOT REPLICATED;
SYSTEM DROP REPLICA 'r1' FROM ZKPATH '/clickhouse/tables/401e6a1f-9bf2-41a3-a900-abb7e94dff98/s1';
```

## Attach Existing Dictionary {#attach-existing-dictionary}

이전에 분리된 딕셔너리를 연결합니다.

**Syntax**

```sql
ATTACH DICTIONARY [IF NOT EXISTS] [db.]name [ON CLUSTER cluster]
```

## Attach Existing Database {#attach-existing-database}

이전에 분리된 데이터베이스를 연결합니다.

**Syntax**

```sql
ATTACH DATABASE [IF NOT EXISTS] name [ENGINE=<database engine>] [ON CLUSTER cluster]
```
