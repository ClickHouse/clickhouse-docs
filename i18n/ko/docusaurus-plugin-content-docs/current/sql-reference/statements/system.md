---
'description': 'SYSTEM 문서'
'sidebar_label': 'SYSTEM'
'sidebar_position': 36
'slug': '/sql-reference/statements/system'
'title': 'SYSTEM 문'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';



# SYSTEM Statements

## SYSTEM RELOAD EMBEDDED DICTIONARIES {#reload-embedded-dictionaries}

모든 [내부 딕셔너리](../../sql-reference/dictionaries/index.md)를 다시 로드합니다.
기본적으로 내부 딕셔너리는 비활성화되어 있습니다.
내부 딕셔너리 업데이트의 결과와 관계없이 항상 `Ok.`를 반환합니다.

## SYSTEM RELOAD DICTIONARIES {#reload-dictionaries}

이전에 성공적으로 로드된 모든 딕셔너리를 다시 로드합니다.
기본적으로 딕셔너리는 지연 로드됩니다 (자세한 내용은 [dictionaries_lazy_load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load)를 참조). 따라서 자동으로 시작 시 로드되는 대신, dictGet 함수나 ENGINE = Dictionary인 테이블에서의 SELECT를 통해 처음 접근할 때 초기화됩니다. `SYSTEM RELOAD DICTIONARIES` 쿼리는 이러한 딕셔너리(로드됨)를 다시 로드합니다.
딕셔너리 업데이트의 결과와 관계없이 항상 `Ok.`를 반환합니다.

**Syntax**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD DICTIONARY {#reload-dictionary}

딕셔너리 `dictionary_name`을 완전히 다시 로드합니다. 딕셔너리 상태 (로드됨 / 비로드됨 / 실패)와 관계없이 항상 `Ok.`를 반환합니다.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

딕셔너리 상태는 `system.dictionaries` 테이블을 쿼리하여 확인할 수 있습니다.

```sql
SELECT name, status FROM system.dictionaries;
```

## SYSTEM RELOAD MODELS {#reload-models}

:::note
이 문과 `SYSTEM RELOAD MODEL`은 클릭하우스 라이브러리 다리에서 catboost 모델을 언로드합니다. `catboostEvaluate()` 함수는 모델이 아직 로드되지 않았다면 첫 접근 시 모델을 로드합니다.
:::

모든 CatBoost 모델을 언로드합니다.

**Syntax**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD MODEL {#reload-model}

`model_path`에서 CatBoost 모델을 언로드합니다.

**Syntax**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```

## SYSTEM RELOAD FUNCTIONS {#reload-functions}

등록된 모든 [실행 가능한 사용자 정의 함수](/sql-reference/functions/udf#executable-user-defined-functions)를 구성 파일에서 다시 로드합니다.

**Syntax**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```

## SYSTEM RELOAD ASYNCHRONOUS METRICS {#reload-asynchronous-metrics}

모든 [비동기 메트릭](../../operations/system-tables/asynchronous_metrics.md)을 다시 계산합니다. 비동기 메트릭은 [asynchronous_metrics_update_period_s](../../operations/server-configuration-parameters/settings.md) 설정에 따라 주기적으로 업데이트되므로, 이 문을 사용하여 수동으로 업데이트할 필요는 일반적으로 없습니다.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```

## SYSTEM DROP DNS CACHE {#drop-dns-cache}

ClickHouse의 내부 DNS 캐시를 지웁니다. 때때로 (구버전의 ClickHouse에서는) 인프라를 변경할 때 이 명령을 사용해야 합니다 (다른 ClickHouse 서버의 IP 주소 또는 딕셔너리에 사용되는 서버의 IP 변경).

더 편리한 (자동) 캐시 관리를 위해 `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period` 매개변수를 참조하십시오.

## SYSTEM DROP MARK CACHE {#drop-mark-cache}

마크 캐시를 지웁니다.

## SYSTEM DROP ICEBERG METADATA CACHE {#drop-iceberg-metadata-cache}

아이사버그 메타데이터 캐시를 지웁니다.

## SYSTEM DROP TEXT INDEX DICTIONARY CACHE {#drop-text-index-dictionary-cache}

텍스트 인덱스 딕셔너리 캐시를 지웁니다.

## SYSTEM DROP TEXT INDEX HEADER CACHE {#drop-text-index-header-cache}

텍스트 인덱스 헤더 캐시를 지웁니다.

## SYSTEM DROP TEXT INDEX POSTINGS CACHE {#drop-text-index-postings-cache}

텍스트 인덱스 포스팅 캐시를 지웁니다.

## SYSTEM DROP REPLICA {#drop-replica}

`ReplicatedMergeTree` 테이블의 비활성 복제본을 다음 구문을 사용하여 삭제할 수 있습니다:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

쿼리는 ZooKeeper에서 `ReplicatedMergeTree` 복제본 경로를 제거합니다. 복제본이 죽어 있고 `DROP TABLE`을 통해 ZooKeeper에서 메타데이터를 제거할 수 없을 때 유용합니다. 비활성/오래된 복제본만 삭제되며, 로컬 복제본은 삭제할 수 없습니다. 이를 위해 `DROP TABLE`을 사용하십시오. `DROP REPLICA`는 테이블을 삭제하지 않으며 디스크에서 데이터나 메타데이터를 제거하지 않습니다.

첫 번째는 `database.table` 테이블의 `'replica_name'` 복제본의 메타데이터를 제거합니다.
두 번째는 데이터베이스의 모든 복제 테이블에 대해 동일한 작업을 수행합니다.
세 번째는 로컬 서버의 모든 복제 테이블에 대해 동일한 작업을 수행합니다.
네 번째는 테이블의 모든 다른 복제본이 삭제되었을 때 비활성 복제본의 메타데이터를 제거하는 데 유용합니다. 테이블 경로를 명시적으로 지정해야 하며, 이것은 테이블 생성 시 `ReplicatedMergeTree` 엔진의 첫 번째 인수에 전달된 경로와 동일해야 합니다.

## SYSTEM DROP DATABASE REPLICA {#drop-database-replica}

`Replicated` 데이터베이스의 비활성 복제본을 다음 구문을 사용하여 삭제할 수 있습니다:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA`와 유사하게, `DROP DATABASE`를 실행할 데이터베이스가 없을 때 ZooKeeper에서 `Replicated` 데이터베이스 복제본 경로를 제거합니다. `ReplicatedMergeTree` 복제본은 제거되지 않으므로 `SYSTEM DROP REPLICA`도 필요할 수 있습니다. 샤드 및 복제본 이름은 데이터베이스를 생성할 때 `Replicated` 엔진 인수에 지정된 이름입니다. 또한, 이러한 이름은 `system.clusters`의 `database_shard_name` 및 `database_replica_name` 컬럼에서 얻을 수 있습니다. `FROM SHARD` 절이 누락된 경우, `replica_name`은 `shard_name|replica_name` 형식의 전체 복제본 이름이어야 합니다.

## SYSTEM DROP UNCOMPRESSED CACHE {#drop-uncompressed-cache}

압축 해제된 데이터 캐시를 지웁니다.
비압축 데이터 캐시는 쿼리/사용자/프로파일 수준 설정 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)로 활성화/비활성화됩니다.
그 크기는 서버 수준 설정 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size)로 구성할 수 있습니다.

## SYSTEM DROP COMPILED EXPRESSION CACHE {#drop-compiled-expression-cache}

컴파일된 표현식 캐시를 지웁니다.
컴파일된 표현식 캐시는 쿼리/사용자/프로파일 수준 설정 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions)로 활성화/비활성화됩니다.

## SYSTEM DROP QUERY CONDITION CACHE {#drop-query-condition-cache}

쿼리 조건 캐시를 지웁니다.

## SYSTEM DROP QUERY CACHE {#drop-query-cache}

```sql
SYSTEM DROP QUERY CACHE;
SYSTEM DROP QUERY CACHE TAG '<tag>'
````

Clears the [query cache](../../operations/query-cache.md).
If a tag is specified, only query cache entries with the specified tag are deleted.

## SYSTEM DROP FORMAT SCHEMA CACHE {#system-drop-schema-format}

Clears cache for schemas loaded from [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path).

Supported targets:
- Protobuf: Removes imported Protobuf message definitions from memory.
- Files: Deletes cached schema files stored locally in the [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path), generated when `format_schema_source` is set to `query`.
Note: If no target is specified, both caches are cleared.

```sql
SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```

## SYSTEM FLUSH LOGS {#flush-logs}

버퍼에 저장된 로그 메시지를 시스템 테이블, 예: system.query_log로 플러시합니다. 주로 디버깅에 유용하며, 대부분의 시스템 테이블은 기본 플러시 간격이 7.5초입니다.
이 작업은 메시지 큐가 비어 있어도 시스템 테이블을 생성합니다.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

모든 항목을 플러시하고 싶지 않은 경우 로그 이름이나 대상 테이블을 전달하여 하나 이상의 개별 로그를 플러시할 수 있습니다:

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```

## SYSTEM RELOAD CONFIG {#reload-config}

ClickHouse 구성을 다시 로드합니다. 구성 파일이 ZooKeeper에 저장되어 있을 때 사용됩니다. `SYSTEM RELOAD CONFIG`는 ZooKeeper에 저장된 `USER` 구성을 다시 로드하지 않으며, `users.xml`에 저장된 `USER` 구성만을 다시 로드합니다. 모든 `USER` 구성을 다시 로드하려면 `SYSTEM RELOAD USERS`를 사용하십시오.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```

## SYSTEM RELOAD USERS {#reload-users}

사용자.xml, 로컬 디스크 접근 저장소, (ZooKeeper에 있는) 복제 접근 저장소를 포함하여 모든 접근 저장소를 다시 로드합니다.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```

## SYSTEM SHUTDOWN {#shutdown}

<CloudNotSupportedBadge/>

ClickHouse를 정상적으로 종료합니다 (예: `service clickhouse-server stop` / `kill {$pid_clickhouse-server}`)

## SYSTEM KILL {#kill}

ClickHouse 프로세스를 중단합니다 (예: `kill -9 {$ pid_clickhouse-server}`)

## Managing Distributed Tables {#managing-distributed-tables}

ClickHouse는 [분산](../../engines/table-engines/special/distributed.md) 테이블을 관리할 수 있습니다. 사용자가 이러한 테이블에 데이터를 삽입하면 ClickHouse는 먼저 클러스터 노드에 전송해야 할 데이터 큐를 생성하고, 이후 비동기적으로 전송합니다. 큐 처리는 [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed), 및 [`START DISTRIBUTED SENDS`](#start-distributed-sends) 쿼리를 통해 관리할 수 있습니다. 또한 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) 설정으로 분산 데이터를 동기식으로 삽입할 수 있습니다.

### SYSTEM STOP DISTRIBUTED SENDS {#stop-distributed-sends}

분산 테이블에 데이터를 삽입할 때 배경 데이터 전송을 비활성화합니다.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)가 활성화된 경우(기본값) 모든 경우에 대해 데이터가 로컬 샤드에 삽입됩니다.
:::

### SYSTEM FLUSH DISTRIBUTED {#flush-distributed}

ClickHouse가 클러스터 노드에 데이터를 동기적으로 전송하도록 강제합니다. 노드 중 하나라도 사용할 수 없으면 ClickHouse는 예외를 발생시키고 쿼리 실행을 중단합니다. 쿼리는 모든 노드가 다시 온라인 상태가 될 때까지 성공할 때까지 재시도할 수 있습니다.

`SETTINGS` 조항을 통해 일부 설정을 재정의할 수도 있습니다. 이는 `max_concurrent_queries_for_all_users` 또는 `max_memory_usage` 같은 임시 제한을 피하는 데 유용할 수 있습니다.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
각 보류 블록은 초기 INSERT 쿼리의 설정과 함께 디스크에 저장되므로, 때때로 설정을 재정의하려는 이유가 있습니다.
:::

### SYSTEM START DISTRIBUTED SENDS {#start-distributed-sends}

분산 테이블에 데이터를 삽입할 때 배경 데이터 전송을 활성화합니다.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

### SYSTEM STOP LISTEN {#stop-listen}

지정된 프로토콜의 지정된 포트에 대한 기존 연결을 닫고 정상적으로 서버에 종료합니다.

그러나 클릭하우스 서버 구성에서 해당 프로토콜 설정이 지정되지 않았다면 이 명령은 효과가 없습니다.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

- `CUSTOM 'protocol'` 수정자가 지정된 경우, 설정의 프로토콜 섹션에 정의된 지정된 이름의 사용자 정의 프로토콜이 중지됩니다.
- `QUERIES ALL [EXCEPT .. [, ..]]` 수정자가 지정된 경우, `EXCEPT` 절로 지정되지 않는 한 모든 프로토콜이 중지됩니다.
- `QUERIES DEFAULT [EXCEPT .. [, ..]]` 수정자가 지정된 경우, `EXCEPT` 절로 지정되지 않는 한 모든 기본 프로토콜이 중지됩니다.
- `QUERIES CUSTOM [EXCEPT .. [, ..]]` 수정자가 지정된 경우, `EXCEPT` 절로 지정되지 않는 한 모든 사용자 정의 프로토콜이 중지됩니다.

### SYSTEM START LISTEN {#start-listen}

지정된 프로토콜에서 새로운 연결을 수립할 수 있습니다.

그러나 지정된 포트 및 프로토콜에서 서버가 `SYSTEM STOP LISTEN` 명령을 사용하여 중지되지 않았다면 이 명령은 효과가 없습니다.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

## Managing MergeTree Tables {#managing-mergetree-tables}

ClickHouse는 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 백그라운드 프로세스를 관리할 수 있습니다.

### SYSTEM STOP MERGES {#stop-merges}

<CloudNotSupportedBadge/>

MergeTree 계열의 테이블에 대한 백그라운드 병합을 중지할 수 있습니다:

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH` 테이블은 모든 MergeTree 테이블에 대해 병합이 중지된 경우에도 테이블에 대한 백그라운드 병합을 시작합니다.
:::

### SYSTEM START MERGES {#start-merges}

<CloudNotSupportedBadge/>

MergeTree 계열의 테이블에 대한 백그라운드 병합을 시작할 수 있습니다:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

### SYSTEM STOP TTL MERGES {#stop-ttl-merges}

MergeTree 계열 테이블에서 [TTL 표현식](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)을 기준으로 오래된 데이터를 배경에서 삭제하는 것을 중지할 수 있습니다:
테이블이 존재하지 않거나 MergeTree 엔진이 아닌 경우에도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않을 경우 오류를 반환합니다:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START TTL MERGES {#start-ttl-merges}

MergeTree 계열 테이블에서 [TTL 표현식](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)을 기준으로 오래된 데이터를 배경에서 삭제하는 것을 시작할 수 있습니다:
테이블이 존재하지 않더라도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않을 경우 오류를 반환합니다:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM STOP MOVES {#stop-moves}

MergeTree 계열 테이블에서 [TTL 테이블 표현식을 사용하여 TO VOLUME 또는 TO DISK 절](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)에 따라 데이터를 배경에서 이동하는 것을 중단할 수 있습니다:
테이블이 존재하지 않더라도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않을 경우 오류를 반환합니다:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM START MOVES {#start-moves}

MergeTree 계열 테이블에서 [TTL 테이블 표현식을 사용하여 TO VOLUME 및 TO DISK 절](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)에 따라 데이터를 배경에서 이동하는 것을 시작할 수 있습니다:
테이블이 존재하지 않더라도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않을 경우 오류를 반환합니다:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```

### SYSTEM SYSTEM UNFREEZE {#query_language-system-unfreeze}

지정된 이름으로 모든 디스크에서 동결된 백업을 지웁니다. [ALTER TABLE table_name UNFREEZE WITH NAME](/sql-reference/statements/alter/partition#unfreeze-partition)에서 개별 파트를 동결 해제하는 방법에 대한 자세한 내용을 참조하십시오.

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```

### SYSTEM WAIT LOADING PARTS {#wait-loading-parts}

테이블의 모든 비동기 로드 데이터 파트(구버전 데이터 파트)가 로드될 때까지 대기합니다.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```

## Managing ReplicatedMergeTree Tables {#managing-replicatedmergetree-tables}

ClickHouse는 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 테이블에서 백그라운드 복제 관련 프로세스를 관리할 수 있습니다.

### SYSTEM STOP FETCHES {#stop-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` 계열 테이블의 삽입된 파트에 대한 백그라운드 패치 작업을 중지할 수 있습니다:
테이블 엔진과 관계없이, 또는 테이블 또는 데이터베이스가 존재하지 않더라도 항상 `Ok.`를 반환합니다.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START FETCHES {#start-fetches}

<CloudNotSupportedBadge/>

`ReplicatedMergeTree` 계열 테이블의 삽입된 파트에 대한 백그라운드 패치 작업을 시작할 수 있습니다:
테이블 엔진과 관계없이, 또는 테이블 또는 데이터베이스가 존재하지 않더라도 항상 `Ok.`를 반환합니다.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATED SENDS {#stop-replicated-sends}

`ReplicatedMergeTree` 계열 테이블의 새로 삽입된 파트에 대해 클러스터 내 다른 복제본으로의 백그라운드 전송을 중지할 수 있습니다:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATED SENDS {#start-replicated-sends}

`ReplicatedMergeTree` 계열 테이블의 새로 삽입된 파트에 대해 클러스터 내 다른 복제본으로의 백그라운드 전송을 시작할 수 있습니다:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP REPLICATION QUEUES {#stop-replication-queues}

`ReplicatedMergeTree` 계열 테이블에 대한 복제 큐에서 Zookeeper에 저장된 백그라운드 패치 작업을 중지할 수 있습니다. 가능한 백그라운드 작업 유형 - 병합, 패치, 변조, ON CLUSTER 절이 포함된 DDL 문:

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START REPLICATION QUEUES {#start-replication-queues}

`ReplicatedMergeTree` 계열 테이블에 대한 복제 큐에서 Zookeeper에 저장된 백그라운드 패치 작업을 시작할 수 있습니다. 가능한 백그라운드 작업 유형 - 병합, 패치, 변조, ON CLUSTER 절이 포함된 DDL 문:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM STOP PULLING REPLICATION LOG {#stop-pulling-replication-log}

`ReplicatedMergeTree` 테이블에서 복제 로그에서 새 항목을 로드하는 것을 중지합니다.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM START PULLING REPLICATION LOG {#start-pulling-replication-log}

`SYSTEM STOP PULLING REPLICATION LOG`를 취소합니다.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```

### SYSTEM SYNC REPLICA {#sync-replica}

`ReplicatedMergeTree` 테이블이 클러스터 내 다른 복제본과 동기화될 때까지 대기하지만, `receive_timeout` 초를 초과할 수 없습니다.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

이 문을 실행한 후 `[db.]replicated_merge_tree_family_table_name`은 공통 복제 로그에서 명령을 패치하여 자신의 복제 큐로 가져온 다음, 쿼리는 복제본이 패치된 모든 명령을 처리할 때까지 대기합니다. 다음 수정자가 지원됩니다:

- `IF EXISTS`가 지정된 경우 (버전 25.6부터 사용 가능) 테이블이 존재하지 않는 경우 쿼리는 오류를 발생시키지 않습니다. 이 기능은 클러스터에 새 복제본을 추가할 때 유용하며, 클러스터 구성의 일부이지만 여전히 테이블을 생성하고 동기화 중입니다.
- `STRICT` 수정자가 지정된 경우 복제 큐가 비어 있을 때까지 대기합니다. `STRICT` 버전은 복제 큐에 항상 새로운 항목이 나타나면 결코 성공하지 않을 수 있습니다.
- `LIGHTWEIGHT` 수정자가 지정된 경우 쿼리는 `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE` 및 `DROP_PART` 항목이 처리될 때까지 대기합니다.
  추가로, LIGHTWEIGHT 수정자는 선택적 FROM 'srcReplicas' 절을 지원하며, 여기서 'srcReplicas'는 소스 복제본 이름의 쉼표로 구분된 목록입니다. 이 확장은 지정된 소스 복제본에서 발생하는 복제 작업에만 집중하여 보다 타겟된 동기화를 허용합니다.
- `PULL` 수정자가 지정된 경우 쿼리는 ZooKeeper에서 새로운 복제 큐 항목을 가져오지만, 처리될 때까지 대기하지는 않습니다.

### SYNC DATABASE REPLICA {#sync-database-replica}

지정된 [복제 데이터베이스](/engines/database-engines/replicated)가 해당 데이터베이스의 DDL 큐에서 모든 스키마 변경을 적용할 때까지 대기합니다.

**Syntax**
```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```

### SYSTEM RESTART REPLICA {#restart-replica}

`ReplicatedMergeTree` 테이블에 대한 Zookeeper 세션의 상태를 재초기화하는 기능을 제공합니다. 현재 상태를 진실의 원천으로서 Zookeeper와 비교하고 필요시 Zookeeper 큐에 작업을 추가합니다.
ZooKeeper 데이터를 기반으로 한 복제 큐 초기화는 `ATTACH TABLE` 문과 동일하게 수행됩니다. 잠시 동안 테이블은 모든 작업에 대해 사용할 수 없게 됩니다.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

### SYSTEM RESTORE REPLICA {#restore-replica}

데이터가 [가능할 경우] 존재하지만 Zookeeper 메타데이터가 손실된 경우 복제본을 복원합니다.

읽기 전용 `ReplicatedMergeTree` 테이블에서만 작동합니다.

다음과 같은 경우 쿼리를 실행할 수 있습니다:

- ZooKeeper 루트 `/` 손실.
- 복제본 경로 `/replicas` 손실.
- 개별 복제본 경로 `/replicas/replica_name/` 손실.

복제본은 로컬에서 찾은 파트를 첨부하고 이에 대한 정보를 Zookeeper에 보냅니다.
메타데이터 손실 이전에 복제본에 존재했던 파트는 오래된 것이 아닌 한 다른 파트에서 재패치되지 않습니다 (따라서 복제본 복원은 모든 데이터를 네트워크를 통해 다시 다운로드하는 것을 의미하지 않습니다).

:::note
모든 상태의 파트가 `detached/` 폴더로 이동됩니다. 데이터 손실 이전에 활성 상태(커밋된)인 파트는 첨부됩니다.
:::

### SYSTEM RESTORE DATABASE REPLICA {#restore-database-replica}

데이터가 [가능할 경우] 존재하지만 Zookeeper 메타데이터가 손실된 경우 복제본을 복원합니다.

**Syntax**

```sql
SYSTEM RESTORE DATABASE REPLICA repl_db [ON CLUSTER cluster]
```

**Example**

```sql
CREATE DATABASE repl_db 
ENGINE=Replicated("/clickhouse/repl_db", shard1, replica1);

CREATE TABLE repl_db.test_table (n UInt32)
ENGINE = ReplicatedMergeTree
ORDER BY n PARTITION BY n % 10;

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- root loss.

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**Syntax**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

대체 구문:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**Example**

여러 서버에서 테이블을 생성합니다. 복제본의 메타데이터가 ZooKeeper에서 손실된 후, 메타데이터가 없으므로 테이블은 읽기 전용으로 첨부됩니다. 마지막 쿼리는 모든 복제본에서 실행해야 합니다.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

또 다른 방법:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```

### SYSTEM RESTART REPLICAS {#restart-replicas}

모든 `ReplicatedMergeTree` 테이블에 대한 Zookeeper 세션 상태를 재초기화하는 기능을 제공합니다. 현재 상태를 진실의 원천으로서 Zookeeper와 비교하고 필요시 Zookeeper 큐에 작업을 추가합니다.

### SYSTEM DROP FILESYSTEM CACHE {#drop-filesystem-cache}

파일 시스템 캐시를 삭제할 수 있습니다.

```sql
SYSTEM DROP FILESYSTEM CACHE [ON CLUSTER cluster_name]
```

### SYSTEM SYNC FILE CACHE {#sync-file-cache}

:::note
무겁고 남용될 가능성이 있습니다.
:::

동기화 시스템 호출을 수행합니다.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```

### SYSTEM LOAD PRIMARY KEY {#load-primary-key}

지정된 테이블 또는 모든 테이블에 대해 기본 키를 로드합니다.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```

### SYSTEM UNLOAD PRIMARY KEY {#unload-primary-key}

지정된 테이블 또는 모든 테이블에 대해 기본 키를 언로드합니다.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```

## Managing Refreshable Materialized Views {#refreshable-materialized-views}

[Refreshable Materialized Views](../../sql-reference/statements/create/view.md#refreshable-materialized-view)에서 수행되는 백그라운드 작업을 제어하는 명령

사용하는 동안 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)를 주의 깊게 살펴보십시오.

### SYSTEM REFRESH VIEW {#refresh-view}

지정된 뷰의 즉각적인 예약되지 않은 새로 고침을 트리거합니다.

```sql
SYSTEM REFRESH VIEW [db.]name
```

### SYSTEM WAIT VIEW {#wait-view}

현재 실행 중인 새로 고침이 완료될 때까지 대기합니다. 새로 고침이 실패하면 예외를 발생시킵니다. 새로 고침이 실행되지 않으면 즉시 완료되며, 이전 새로 고침이 실패한 경우 예외를 발생시킵니다.

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS {#stop-view-stop-views}

지정된 뷰 또는 모든 새로 고칠 수 있는 뷰에 대한 주기적인 새로 고침을 비활성화합니다. 새로 고침이 진행 중인 경우 그것도 취소합니다.

뷰가 복제되거나 공유된 데이터베이스에 있는 경우, `STOP VIEW`는 현재 복제본에만 영향을 미치고, `STOP REPLICATED VIEW`는 모든 복제본에 영향을 미칩니다.

```sql
SYSTEM STOP VIEW [db.]name
```
```sql
SYSTEM STOP VIEWS
```

### SYSTEM START [REPLICATED] VIEW, START VIEWS {#start-view-start-views}

지정된 뷰 또는 모든 새로 고칠 수 있는 뷰에 대한 주기적인 새로 고침을 활성화합니다. 즉각적인 새로 고침은 트리거되지 않습니다.

뷰가 복제되거나 공유된 데이터베이스에 있는 경우, `START VIEW`는 `STOP VIEW`의 효과를 취소하고, `START REPLICATED VIEW`는 `STOP REPLICATED VIEW`의 효과를 취소합니다.

```sql
SYSTEM START VIEW [db.]name
```
```sql
SYSTEM START VIEWS
```

### SYSTEM CANCEL VIEW {#cancel-view}

현재 복제본에서 지정된 뷰에 대한 새로 고침이 진행 중인 경우, 이를 중지하고 취소합니다. 그렇지 않으면 아무것도 하지 않습니다.

```sql
SYSTEM CANCEL VIEW [db.]name
```

### SYSTEM WAIT VIEW {#system-wait-view}

실행 중인 새로 고침이 완료될 때까지 대기합니다. 새로 고침이 실행 중이지 않으면 즉시 반환됩니다. 최근 새로 고침 시도가 실패한 경우 오류를 보고합니다.

새로운 새로 고치기 가능한 물리화된 뷰(EMPTY 키워드 없이)를 생성한 직후에 초기 새로 고침이 완료될 때까지 대기하는 데 사용될 수 있습니다.

뷰가 복제되거나 공유된 데이터베이스에 있고, 다른 복제본에서 새로 고침이 실행 중인 경우, 해당 새로 고침이 완료될 때까지 대기합니다.

```sql
SYSTEM WAIT VIEW [db.]name
```
