---
description: 'SYSTEM SQL 문에 대한 문서'
sidebar_label: 'SYSTEM'
sidebar_position: 36
slug: /sql-reference/statements/system
title: 'SYSTEM SQL 문'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SYSTEM SQL 문 \{#system-statements\}

## SYSTEM RELOAD EMBEDDED DICTIONARIES \{#reload-embedded-dictionaries\}

모든 [내부 딕셔너리](../../sql-reference/dictionaries/index.md)를 다시 로드합니다.
기본적으로 내부 딕셔너리는 비활성화되어 있습니다.
내부 딕셔너리 업데이트 결과와 관계없이 항상 `Ok.`를 반환합니다.

## SYSTEM RELOAD DICTIONARIES \{#reload-dictionaries\}

`SYSTEM RELOAD DICTIONARIES` 쿼리는 상태가 `LOADED`인 딕셔너리를 다시 로드합니다. 즉, 이전에 이미 성공적으로 로드된 딕셔너리입니다. 상태는 [`system.dictionaries`](/operations/system-tables/dictionaries)의 `status` 컬럼에서 확인할 수 있습니다.
기본적으로 딕셔너리는 지연 로드됩니다([dictionaries&#95;lazy&#95;load](../../operations/server-configuration-parameters/settings.md#dictionaries_lazy_load) 참고). 따라서 시작 시 자동으로 로드되지 않고, [`dictGet`](/sql-reference/functions/ext-dict-functions#dictGet) 함수 사용 또는 `ENGINE = Dictionary`인 테이블에 대한 `SELECT`를 통해 처음 접근할 때 초기화됩니다.

**구문**

```sql
SYSTEM RELOAD DICTIONARIES [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD DICTIONARY \{#reload-dictionary\}

딕셔너리 상태(LOADED / NOT&#95;LOADED / FAILED)와 무관하게 딕셔너리 `dictionary_name`을 완전히 다시 로드합니다.
딕셔너리 업데이트 결과와 관계없이 항상 `Ok.`를 반환합니다.

```sql
SYSTEM RELOAD DICTIONARY [ON CLUSTER cluster_name] dictionary_name
```

딕셔너리의 상태는 `system.dictionaries` 테이블을 쿼리하여 확인할 수 있습니다.

```sql
SELECT name, status FROM system.dictionaries;
```


## SYSTEM RELOAD MODELS \{#reload-models\}

:::note
이 구문과 `SYSTEM RELOAD MODEL`은 catboost 모델을 clickhouse-library-bridge에서 언로드하는 역할만 합니다. 함수 `catboostEvaluate()`
는 모델이 아직 로드되지 않은 경우 최초 접근 시 모델을 로드합니다.
:::

모든 CatBoost 모델을 언로드합니다.

**구문**

```sql
SYSTEM RELOAD MODELS [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD MODEL \{#reload-model\}

`model_path` 경로의 CatBoost 모델을 언로드합니다.

**구문**

```sql
SYSTEM RELOAD MODEL [ON CLUSTER cluster_name] <model_path>
```


## SYSTEM RELOAD FUNCTIONS \{#reload-functions\}

구성 파일에서 등록된 [실행형 사용자 정의 함수(executable user defined functions)](/sql-reference/functions/udf#executable-user-defined-functions)를 전부 또는 개별 함수 하나를 다시 로드합니다.

**구문**

```sql
SYSTEM RELOAD FUNCTIONS [ON CLUSTER cluster_name]
SYSTEM RELOAD FUNCTION [ON CLUSTER cluster_name] function_name
```


## SYSTEM RELOAD ASYNCHRONOUS METRICS \{#reload-asynchronous-metrics\}

모든 [비동기 메트릭](../../operations/system-tables/asynchronous_metrics.md)을 다시 계산합니다. 비동기 메트릭은 설정값 [asynchronous&#95;metrics&#95;update&#95;period&#95;s](../../operations/server-configuration-parameters/settings.md)에 따라 주기적으로 업데이트되므로, 이 구문을 사용해 수동으로 업데이트할 필요는 일반적으로 없습니다.

```sql
SYSTEM RELOAD ASYNCHRONOUS METRICS [ON CLUSTER cluster_name]
```


## SYSTEM CLEAR|DROP DNS CACHE \{#drop-dns-cache\}

ClickHouse의 내부 DNS 캐시를 지웁니다. 인프라를 변경할 때(다른 ClickHouse 서버나 딕셔너리에 사용되는 서버의 IP 주소를 변경하는 경우 등), 특히 이전 ClickHouse 버전에서는 이 명령을 사용해야 할 수 있습니다.

보다 편리한(자동화된) 캐시 관리를 위해서는 `disable_internal_dns_cache`, `dns_cache_max_entries`, `dns_cache_update_period` 파라미터를 참조하십시오.

## SYSTEM CLEAR|DROP MARK CACHE \{#drop-mark-cache\}

mark 캐시를 초기화합니다.

## SYSTEM CLEAR|DROP ICEBERG METADATA CACHE \{#drop-iceberg-metadata-cache\}

iceberg 메타데이터 캐시를 초기화합니다.

## SYSTEM CLEAR|DROP TEXT INDEX CACHES \{#drop-text-index-caches\}

텍스트 인덱스의 헤더, 딕셔너리 및 포스팅 캐시를 비웁니다.

이 캐시들 중 하나만 개별적으로 비우려면 다음을 실행합니다.

- `SYSTEM CLEAR TEXT INDEX HEADER CACHE`,
- `SYSTEM CLEAR TEXT INDEX DICTIONARY CACHE`, 또는
- `SYSTEM CLEAR TEXT INDEX POSTINGS CACHE`

## SYSTEM DROP REPLICA \{#drop-replica\}

`ReplicatedMergeTree` 테이블의 비활성 레플리카(dead replica)는 다음 구문을 사용하여 삭제할 수 있습니다:

```sql
SYSTEM DROP REPLICA 'replica_name' FROM TABLE database.table;
SYSTEM DROP REPLICA 'replica_name' FROM DATABASE database;
SYSTEM DROP REPLICA 'replica_name';
SYSTEM DROP REPLICA 'replica_name' FROM ZKPATH '/path/to/table/in/zk';
```

이 쿼리는 ZooKeeper에서 `ReplicatedMergeTree` 레플리카 경로를 제거합니다. 레플리카가 비정상 상태이거나 이미 제거되어 해당 테이블이 더 이상 존재하지 않아, `DROP TABLE`로 ZooKeeper에서 메타데이터를 삭제할 수 없을 때 유용합니다. 비활성/오래된 레플리카만 삭제하며, 로컬 레플리카는 삭제하지 않습니다. 로컬 레플리카를 삭제하려면 `DROP TABLE`을 사용해야 합니다. `DROP REPLICA`는 어떤 테이블도 삭제하지 않으며, 디스크에서 데이터나 메타데이터를 제거하지 않습니다.

첫 번째 쿼리는 `database.table` 테이블의 `'replica_name'` 레플리카 메타데이터를 제거합니다.
두 번째 쿼리는 데이터베이스 내의 모든 복제된 테이블에 대해 동일한 작업을 수행합니다.
세 번째 쿼리는 로컬 서버의 모든 복제된 테이블에 대해 동일한 작업을 수행합니다.
네 번째 쿼리는 특정 테이블의 나머지 모든 레플리카가 삭제된 후, 죽은 레플리카의 메타데이터를 제거할 때 유용합니다. 테이블 경로를 명시적으로 지정해야 합니다. 이 경로는 테이블 생성 시 `ReplicatedMergeTree` 엔진의 첫 번째 인수로 전달된 경로와 동일해야 합니다.


## SYSTEM DROP DATABASE REPLICA \{#drop-database-replica\}

`Replicated` 데이터베이스의 죽은 레플리카는 다음 구문으로 삭제할 수 있습니다:

```sql
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM DATABASE database;
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'];
SYSTEM DROP DATABASE REPLICA 'replica_name' [FROM SHARD 'shard_name'] FROM ZKPATH '/path/to/table/in/zk';
```

`SYSTEM DROP REPLICA`와 비슷하지만, `DROP DATABASE`를 실행할 데이터베이스가 없을 때 ZooKeeper에서 `Replicated` 데이터베이스 레플리카 경로를 제거합니다. `ReplicatedMergeTree` 레플리카는 제거하지 않으므로(따라서 `SYSTEM DROP REPLICA`도 필요할 수 있음) 이 점에 유의하십시오. 세그먼트와 레플리카 이름은 데이터베이스를 생성할 때 `Replicated` 엔진 인수에서 지정한 이름입니다. 또한 이 이름들은 `system.clusters`의 `database_shard_name` 및 `database_replica_name` 컬럼에서 확인할 수 있습니다. `FROM SHARD` 절이 없으면 `replica_name`은 `shard_name|replica_name` 형식의 전체 레플리카 이름이어야 합니다.


## SYSTEM CLEAR|DROP UNCOMPRESSED CACHE \{#drop-uncompressed-cache\}

압축 해제된 데이터 캐시를 비웁니다.
압축 해제된 데이터 캐시는 쿼리/USER/프로필 수준 설정인 [`use_uncompressed_cache`](../../operations/settings/settings.md#use_uncompressed_cache)로 활성화하거나 비활성화할 수 있습니다.
캐시 크기는 서버 수준 설정인 [`uncompressed_cache_size`](../../operations/server-configuration-parameters/settings.md#uncompressed_cache_size)로 지정할 수 있습니다.

## SYSTEM CLEAR|DROP COMPILED EXPRESSION CACHE \{#drop-compiled-expression-cache\}

컴파일된 expression 캐시를 비웁니다.
컴파일된 expression 캐시는 쿼리, USER, 프로필 수준 설정인 [`compile_expressions`](../../operations/settings/settings.md#compile_expressions)으로 활성화하거나 비활성화합니다.

## SYSTEM CLEAR|DROP QUERY CONDITION CACHE \{#drop-query-condition-cache\}

쿼리 조건 캐시를 지웁니다.

## SYSTEM CLEAR|DROP QUERY CACHE \{#drop-query-cache\}

```sql
SYSTEM CLEAR QUERY CACHE;
SYSTEM CLEAR QUERY CACHE TAG '<tag>'
```

[쿼리 캐시](../../operations/query-cache.md)를 비웁니다.
태그를 지정하면 지정된 태그를 가진 쿼리 캐시 항목만 삭제됩니다.


## SYSTEM CLEAR|DROP FORMAT SCHEMA CACHE \{#system-drop-schema-format\}

[`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)에서 로드된 스키마 캐시를 비웁니다.

지원되는 대상:

* Protobuf: 메모리에 로드된 Protobuf 메시지 정의를 제거합니다.
* Files: `format_schema_source`가 `query`로 설정되었을 때 생성되어 [`format_schema_path`](../../operations/server-configuration-parameters/settings.md#format_schema_path)에 로컬로 저장되는 스키마 파일 캐시를 삭제합니다.
  참고: 대상을 지정하지 않으면 두 캐시가 모두 지워집니다.

```sql
SYSTEM CLEAR|DROP FORMAT SCHEMA CACHE [FOR Protobuf/Files]
```


## SYSTEM FLUSH LOGS \{#flush-logs\}

버퍼링된 로그 메시지를 `system.query_log`과 같은 시스템 테이블로 플러시합니다. 대부분의 시스템 테이블에서 기본 플러시 간격이 7.5초로 설정되어 있으므로, 주로 디버깅 시에 유용합니다.
이 명령은 메시지 큐가 비어 있더라도 시스템 테이블을 생성합니다.

```sql
SYSTEM FLUSH LOGS [ON CLUSTER cluster_name] [log_name|[database.table]] [, ...]
```

전체를 모두 플러시하지 않으려면, 이름이나 대상 테이블을 지정하여 하나 이상의 개별 로그만 플러시할 수 있습니다.

```sql
SYSTEM FLUSH LOGS query_log, system.query_views_log;
```


## SYSTEM RELOAD CONFIG \{#reload-config\}

ClickHouse 설정을 다시 로드합니다. 설정이 ZooKeeper에 저장되어 있을 때 사용합니다. 단, `SYSTEM RELOAD CONFIG`는 ZooKeeper에 저장된 `USER` 설정은 다시 로드하지 않고, `users.xml`에 저장된 `USER` 설정만 다시 로드합니다. 모든 `USER` 설정을 다시 로드하려면 `SYSTEM RELOAD USERS`를 사용합니다.

```sql
SYSTEM RELOAD CONFIG [ON CLUSTER cluster_name]
```


## SYSTEM RELOAD USERS \{#reload-users\}

users.xml, 로컬 디스크 액세스 스토리지, ZooKeeper에 있는 복제된 액세스 스토리지를 포함하여 모든 액세스 스토리지를 다시 로드합니다.

```sql
SYSTEM RELOAD USERS [ON CLUSTER cluster_name]
```


## SYSTEM SHUTDOWN \{#shutdown\}

<CloudNotSupportedBadge/>

일반적으로 ClickHouse를 종료합니다 (`service clickhouse-server stop` / `kill {$pid_clickhouse-server}`와 유사함).

## SYSTEM KILL \{#kill\}

ClickHouse 프로세스를 강제 종료합니다 (예: `kill -9 {$ pid_clickhouse-server}`와 유사합니다).

## SYSTEM INSTRUMENT \{#instrument\}

LLVM의 XRay 기능을 활용하여 계측 지점을 관리합니다. 이 기능은 ClickHouse를 `ENABLE_XRAY=1` 옵션으로 빌드했을 때 사용할 수 있습니다.
이를 통해 소스 코드를 수정하지 않고도 프로덕션 환경에서 디버깅과 프로파일링을 최소한의 오버헤드로 수행할 수 있습니다.
계측 지점이 하나도 추가되지 않은 경우, 200개 이상의 명령어로 이루어진 함수의 프롤로그와 에필로그에서 인접한 주소로의 점프만 하나 추가되므로
성능 저하는 무시할 수 있을 정도로 미미합니다.

### SYSTEM INSTRUMENT ADD \{#instrument-add\}

새로운 계측 지점을 추가합니다. 계측된 FUNCTION은 [`system.instrumentation`](../../operations/system-tables/instrumentation.md) 시스템 테이블에서 조회할 수 있습니다. 동일한 FUNCTION에 대해 둘 이상의 핸들러를 추가할 수 있으며, 계측을 추가한 순서와 동일한 순서로 실행됩니다.
계측할 FUNCTION은 [`system.symbols`](../../operations/system-tables/symbols.md) 시스템 테이블에서 확인할 수 있습니다.

FUNCTION에 추가할 수 있는 핸들러에는 세 가지 유형이 있습니다:

**Syntax**

```sql
SYSTEM INSTRUMENT ADD FUNCTION HANDLER [PARAMETERS]
```

여기서 `FUNCTION`은 `QueryMetricLog::startQuery`와 같은 임의의 함수 또는 해당 함수의 부분 문자열을 의미하며, 핸들러는 다음 중 하나입니다.


#### LOG \{#instrument-add-log\}

인수로 전달된 텍스트와 스택 트레이스를 해당 FUNCTION의 `ENTRY` 또는 `EXIT` 시점에서 출력합니다.

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' LOG ENTRY 'this is a log printed at entry'
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' LOG EXIT 'this is a log printed at exit'
```


#### SLEEP \{#instrument-add-sleep\}

`ENTRY` 또는 `EXIT` 시점에서 지정된 초 수만큼 대기합니다:

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' SLEEP ENTRY 0.5
```

또는 최소값과 최대값을 공백으로 구분해 지정하면, 균등 분포를 따르는 임의의 초 단위 값으로 설정됩니다:

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' SLEEP ENTRY 0 1
```


#### PROFILE \{#instrument-add-profile\}

FUNCTION의 `ENTRY`와 `EXIT` 사이 구간에 소요된 시간을 측정합니다.
프로파일링 결과는 [`system.trace_log`](../../operations/system-tables/trace_log.md)에 저장되며,
[Chrome Event Trace Format](../../operations/system-tables/trace_log.md#chrome-event-trace-format)으로 변환할 수 있습니다.

```sql
SYSTEM INSTRUMENT ADD 'QueryMetricLog::startQuery' PROFILE
```


### SYSTEM INSTRUMENT REMOVE \{#instrument-remove\}

다음을 사용하여 단일 계측 지점을 제거합니다:

```sql
SYSTEM INSTRUMENT REMOVE ID
```

이들 모두에서 `ALL` 파라미터를 사용합니다:

```sql
SYSTEM INSTRUMENT REMOVE ALL
```

서브쿼리 결과로 얻은 ID 집합:

```sql
SYSTEM INSTRUMENT REMOVE (SELECT id FROM system.instrumentation WHERE handler = 'log')
```

또는 주어진 function&#95;name과 일치하는 모든 계측 지점에 대해:

```sql
SYSTEM INSTRUMENT REMOVE 'QueryMetricLog::startQuery'
```

계측 지점 정보는 [`system.instrumentation`](../../operations/system-tables/instrumentation.md) 시스템 테이블에서 수집할 수 있습니다.


## 분산 테이블 관리 \{#managing-distributed-tables\}

ClickHouse는 [분산](../../engines/table-engines/special/distributed.md) 테이블을 관리합니다. 사용자가 이러한 테이블에 데이터를 삽입하면, ClickHouse는 먼저 클러스터 노드로 전송해야 하는 데이터의 큐를 생성한 다음 이를 비동기적으로 전송합니다. [`STOP DISTRIBUTED SENDS`](#stop-distributed-sends), [FLUSH DISTRIBUTED](#flush-distributed), [`START DISTRIBUTED SENDS`](#start-distributed-sends) 쿼리를 사용하여 큐 처리를 관리할 수 있습니다. 또한 [`distributed_foreground_insert`](../../operations/settings/settings.md#distributed_foreground_insert) SETTING을 사용하여 분산 데이터를 동기적으로 삽입할 수도 있습니다.

### SYSTEM STOP DISTRIBUTED SENDS \{#stop-distributed-sends\}

분산 테이블에 데이터를 삽입할 때 수행되는 백그라운드 데이터 분산을 중지합니다.

```sql
SYSTEM STOP DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```

:::note
[`prefer_localhost_replica`](../../operations/settings/settings.md#prefer_localhost_replica)가 활성화되어 있는 경우(기본값), 데이터는 로컬 세그먼트에 여전히 삽입됩니다.
:::


### SYSTEM FLUSH DISTRIBUTED \{#flush-distributed\}

ClickHouse가 클러스터 노드로 데이터를 동기적으로 전송하도록 강제합니다. 일부 노드를 사용할 수 없는 경우 ClickHouse는 예외를 던지고 쿼리 실행을 중지합니다. 모든 노드가 다시 사용 가능한 상태가 되면 쿼리가 성공하므로, 성공할 때까지 쿼리를 반복해서 시도할 수 있습니다.

`SETTINGS` 절을 통해 일부 설정을 일시적으로 변경할 수도 있습니다. 이는 `max_concurrent_queries_for_all_users` 또는 `max_memory_usage`와 같은 일시적인 제한을 우회하는 데 유용합니다.

```sql
SYSTEM FLUSH DISTRIBUTED [db.]<distributed_table_name> [ON CLUSTER cluster_name] [SETTINGS ...]
```

:::note
각 대기 중인 블록은 최초 INSERT 쿼리의 설정이 적용된 상태로 디스크에 저장되므로, 이 때문에 설정을 재정의해야 하는 경우가 있을 수 있습니다.
:::


### SYSTEM START DISTRIBUTED SENDS \{#start-distributed-sends\}

분산 테이블에 데이터를 삽입할 때 데이터를 백그라운드에서 분산 전송하도록 활성화합니다.

```sql
SYSTEM START DISTRIBUTED SENDS [db.]<distributed_table_name> [ON CLUSTER cluster_name]
```


### SYSTEM STOP LISTEN \{#stop-listen\}

소켓을 닫고, 지정된 포트에서 지정된 프로토콜을 사용하는 서버와의 기존 연결을 정상적으로 종료합니다.

단, 해당 프로토콜에 대한 설정이 `clickhouse-server` 구성에서 정의되지 않은 경우 이 명령은 아무 효과도 없습니다.

```sql
SYSTEM STOP LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```

* `CUSTOM 'protocol'` 수정자가 지정되면, 서버 설정의 protocols 섹션에 정의된 지정한 이름의 커스텀 프로토콜이 중지됩니다.
* `QUERIES ALL [EXCEPT .. [,..]]` 수정자가 지정되면, `EXCEPT` 절로 지정된 경우를 제외한 모든 프로토콜이 중지됩니다.
* `QUERIES DEFAULT [EXCEPT .. [,..]]` 수정자가 지정되면, `EXCEPT` 절로 지정된 경우를 제외한 모든 기본 프로토콜이 중지됩니다.
* `QUERIES CUSTOM [EXCEPT .. [,..]]` 수정자가 지정되면, `EXCEPT` 절로 지정된 경우를 제외한 모든 커스텀 프로토콜이 중지됩니다.


### SYSTEM START LISTEN \{#start-listen\}

지정된 프로토콜에서 새로운 연결을 허용합니다.

단, 지정된 포트와 프로토콜에서 동작하는 서버가 SYSTEM STOP LISTEN 명령으로 중지되지 않았다면, 이 명령은 효과가 없습니다.

```sql
SYSTEM START LISTEN [ON CLUSTER cluster_name] [QUERIES ALL | QUERIES DEFAULT | QUERIES CUSTOM | TCP | TCP WITH PROXY | TCP SECURE | HTTP | HTTPS | MYSQL | GRPC | POSTGRESQL | PROMETHEUS | CUSTOM 'protocol']
```


## MergeTree 테이블 관리 \{#managing-mergetree-tables\}

ClickHouse는 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) 테이블의 백그라운드 프로세스를 관리할 수 있습니다.

### SYSTEM STOP MERGES \{#stop-merges\}

<CloudNotSupportedBadge />

MergeTree 계열 테이블의 백그라운드 merge 작업을 중지할 수 있는 기능을 제공합니다.

```sql
SYSTEM STOP MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```

:::note
`DETACH / ATTACH`를 수행하면, 이전에 모든 MergeTree 테이블에 대한 머지를 중지해 두었더라도 해당 테이블에서 백그라운드 머지가 시작됩니다.
:::


### SYSTEM START MERGES \{#start-merges\}

<CloudNotSupportedBadge />

MergeTree 계열 테이블에 대한 백그라운드 머지를 시작할 수 있습니다:

```sql
SYSTEM START MERGES [ON CLUSTER cluster_name] [ON VOLUME <volume_name> | [db.]merge_tree_family_table_name]
```


### SYSTEM STOP TTL MERGES \{#stop-ttl-merges\}

MergeTree 계열 테이블에 대해 [TTL expression](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)에 따라 오래된 데이터를 삭제하는 백그라운드 작업을 중지할 수 있습니다.
테이블이 존재하지 않거나 테이블이 MergeTree 엔진을 사용하지 않는 경우에도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않으면 오류를 반환합니다:

```sql
SYSTEM STOP TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START TTL MERGES \{#start-ttl-merges\}

MergeTree 패밀리의 테이블에 대해 [TTL expression](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl)에 따라 오래된 데이터를 백그라운드에서 삭제하는 작업을 시작할 수 있습니다.
테이블이 존재하지 않아도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않으면 오류를 반환합니다:

```sql
SYSTEM START TTL MERGES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM STOP MOVES \{#stop-moves\}

MergeTree 계열 테이블에 대해 [TO VOLUME 또는 TO DISK 절이 포함된 TTL 테이블 표현식](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)에 따라 백그라운드에서 데이터 이동을 중지할 수 있습니다.
테이블이 존재하지 않아도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않으면 오류를 반환합니다:

```sql
SYSTEM STOP MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM START MOVES \{#start-moves\}

MergeTree 계열 테이블에 대해 [TO VOLUME 및 TO DISK 절이 있는 TTL 테이블 표현식](../../engines/table-engines/mergetree-family/mergetree.md#mergetree-table-ttl)에 따라 백그라운드 데이터 이동을 시작합니다.
테이블이 존재하지 않아도 `Ok.`를 반환합니다. 데이터베이스가 존재하지 않으면 오류를 반환합니다:

```sql
SYSTEM START MOVES [ON CLUSTER cluster_name] [[db.]merge_tree_family_table_name]
```


### SYSTEM SYSTEM UNFREEZE \{#query_language-system-unfreeze\}

지정된 이름의 동결된 백업을 모든 디스크에서 제거합니다. 개별 파트를 해제(unfreeze)하는 방법은 [ALTER TABLE table&#95;name UNFREEZE WITH NAME ](/sql-reference/statements/alter/partition#unfreeze-partition)을 참고하십시오.

```sql
SYSTEM UNFREEZE WITH NAME <backup_name>
```


### SYSTEM WAIT LOADING PARTS \{#wait-loading-parts\}

테이블의 비동기적으로 로드되는 모든 오래된 데이터 파트가 모두 로드될 때까지 대기합니다.

```sql
SYSTEM WAIT LOADING PARTS [ON CLUSTER cluster_name] [db.]merge_tree_family_table_name
```


## ReplicatedMergeTree 테이블 관리 \{#managing-replicatedmergetree-tables\}

ClickHouse는 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 테이블에서 백그라운드에서 실행되는 복제 관련 프로세스를 관리할 수 있습니다.

### SYSTEM STOP FETCHES \{#stop-fetches\}

<CloudNotSupportedBadge />

`ReplicatedMergeTree` 계열 테이블에서 삽입된 파트에 대한 백그라운드 fetch 작업을 중지할 수 있는 기능을 제공합니다.
테이블 엔진과 무관하게, 테이블이나 데이터베이스가 존재하지 않는 경우에도 항상 `Ok.`를 반환합니다.

```sql
SYSTEM STOP FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START FETCHES \{#start-fetches\}

<CloudNotSupportedBadge />

`ReplicatedMergeTree` 계열 테이블에서 삽입된 파트에 대한 백그라운드 가져오기(fetch) 작업을 시작할 수 있도록 합니다.
테이블 엔진과 관계없이, 테이블이나 데이터베이스가 존재하지 않더라도 항상 `Ok.`를 반환합니다.

```sql
SYSTEM START FETCHES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATED SENDS \{#stop-replicated-sends\}

`ReplicatedMergeTree` 패밀리의 테이블에서 새로 삽입된 파트에 대해 클러스터 내 다른 레플리카로의 백그라운드 전송을 중지할 수 있는 기능을 제공합니다:

```sql
SYSTEM STOP REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATED SENDS \{#start-replicated-sends\}

`ReplicatedMergeTree` 계열 테이블에서 새로 삽입된 파트를 클러스터 내 다른 레플리카로 백그라운드로 전송하기를 시작할 수 있도록 합니다:

```sql
SYSTEM START REPLICATED SENDS [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP REPLICATION QUEUES \{#stop-replication-queues\}

`ReplicatedMergeTree` 계열 테이블에 대해 Zookeeper에 저장된 복제 큐(replication queue)에서 발생하는 백그라운드 fetch 작업을 중지할 수 있습니다. 가능한 백그라운드 작업 유형은 merges, fetches, mutations, 그리고 ON CLUSTER 절이 포함된 DDL SQL 문입니다.

```sql
SYSTEM STOP REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START REPLICATION QUEUES \{#start-replication-queues\}

`ReplicatedMergeTree` 계열 테이블에 대해 Zookeeper에 저장된 replication 큐에서 백그라운드 fetch 작업을 시작할 수 있습니다. 가능한 백그라운드 작업 유형은 merge, fetch, mutation, ON CLUSTER 절이 있는 DDL SQL 문 등입니다:

```sql
SYSTEM START REPLICATION QUEUES [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM STOP PULLING REPLICATION LOG \{#stop-pulling-replication-log\}

`ReplicatedMergeTree` 테이블에서 replication log에서 replication queue로 새로운 항목을 불러오는 작업을 중지합니다.

```sql
SYSTEM STOP PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM START PULLING REPLICATION LOG \{#start-pulling-replication-log\}

`SYSTEM STOP PULLING REPLICATION LOG` 명령을 취소합니다.

```sql
SYSTEM START PULLING REPLICATION LOG [ON CLUSTER cluster_name] [[db.]replicated_merge_tree_family_table_name]
```


### SYSTEM SYNC REPLICA \{#sync-replica\}

클러스터의 다른 레플리카와 `ReplicatedMergeTree` 테이블이 동기화될 때까지 대기하되, 최대 `receive_timeout`초까지만 대기합니다.

```sql
SYSTEM SYNC REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name [IF EXISTS] [STRICT | LIGHTWEIGHT [FROM 'srcReplica1'[, 'srcReplica2'[, ...]]] | PULL]
```

이 구문을 실행하면 `[db.]replicated_merge_tree_family_table_name`이(가) 공통 복제 로그에서 명령을 가져와 자체 복제 큐에 넣고, 레플리카가 가져온 모든 명령을 처리할 때까지 쿼리가 대기합니다. 다음과 같은 수정자를 사용할 수 있습니다:

* `IF EXISTS`(25.6부터 사용 가능)를 사용하면 테이블이 존재하지 않더라도 쿼리가 오류를 발생시키지 않습니다. 이는 새 레플리카를 클러스터에 추가할 때, 해당 레플리카가 이미 클러스터 설정에 포함되어 있지만 테이블을 생성하고 동기화하는 과정에 있는 경우에 유용합니다.
* `STRICT` 수정자가 지정되면 쿼리는 복제 큐가 비워질 때까지 대기합니다. 복제 큐에 새 항목이 지속해서 추가되는 경우 `STRICT` 버전은 완료되지 못할 수 있습니다.
* `LIGHTWEIGHT` 수정자가 지정되면 쿼리는 `GET_PART`, `ATTACH_PART`, `DROP_RANGE`, `REPLACE_RANGE`, `DROP_PART` 항목이 처리되는 것만 기다립니다.
  추가로, LIGHTWEIGHT 수정자는 선택적인 FROM 「srcReplicas」 절을 지원하며, 여기서 「srcReplicas」는 소스 레플리카 이름의 쉼표로 구분된 목록입니다. 이 확장을 사용하면 지정된 소스 레플리카에서 발생한 복제 작업에만 집중하여 보다 목표 지향적인 동기화를 수행할 수 있습니다.
* `PULL` 수정자가 지정되면 쿼리는 ZooKeeper에서 새로운 복제 큐 항목을 가져오지만, 어떤 항목이 처리되기를 기다리지는 않습니다.


### SYNC DATABASE REPLICA \{#sync-database-replica\}

지정된 [복제 데이터베이스](/engines/database-engines/replicated)가 해당 데이터베이스의 DDL 대기열에 있는 모든 스키마 변경 사항 적용을 완료할 때까지 대기합니다.

**문법**

```sql
SYSTEM SYNC DATABASE REPLICA replicated_database_name;
```


### SYSTEM RESTART REPLICA \{#restart-replica\}

`ReplicatedMergeTree` 테이블에 대해 Zookeeper 세션 상태를 다시 초기화할 수 있는 기능을 제공합니다. 현재 상태를 신뢰 가능한 기준(Source of truth)인 Zookeeper 상태와 비교하고, 필요한 경우 작업을 Zookeeper 큐에 추가합니다.
ZooKeeper 데이터를 기반으로 하는 복제 큐 초기화는 `ATTACH TABLE` 문과 동일한 방식으로 수행됩니다. 짧은 시간 동안 해당 테이블은 어떤 작업에도 사용할 수 없게 됩니다.

```sql
SYSTEM RESTART REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```


### SYSTEM RESTORE REPLICA \{#restore-replica\}

데이터는 존재할 수 있지만 ZooKeeper 메타데이터가 손실된 경우 레플리카를 복원합니다.

읽기 전용인 `ReplicatedMergeTree` 테이블에서만 동작합니다.

다음과 같은 상황 이후에 이 쿼리를 실행할 수 있습니다:

- ZooKeeper 루트 `/` 손실.
- 레플리카 경로 `/replicas` 손실.
- 개별 레플리카 경로 `/replicas/replica_name/` 손실.

레플리카는 로컬에서 발견한 파트를 attach하고 그 정보를 ZooKeeper로 전송합니다.
메타데이터 손실 이전에 레플리카에 존재하던 파트는 구버전이 아닌 경우 다른 레플리카에서 다시 가져오지 않습니다(따라서 레플리카 복원이 네트워크를 통해 모든 데이터를 다시 다운로드하는 것을 의미하지는 않습니다).

:::note
모든 상태의 파트는 `detached/` 폴더로 이동됩니다. 데이터 손실 이전에 활성(커밋된) 상태였던 파트는 attach됩니다.
:::

### SYSTEM RESTORE DATABASE REPLICA \{#restore-database-replica\}

데이터는 [존재할 수 있지만] Zookeeper 메타데이터가 손실된 경우 레플리카를 복원합니다.

**구문**

```sql
SYSTEM RESTORE DATABASE REPLICA repl_db [ON CLUSTER cluster]
```

**예시**

```sql
CREATE DATABASE repl_db
ENGINE=Replicated("/clickhouse/repl_db", shard1, replica1);

CREATE TABLE repl_db.test_table (n UInt32)
ENGINE = ReplicatedMergeTree
ORDER BY n PARTITION BY n % 10;

-- zookeeper_delete_path("/clickhouse/repl_db", recursive=True) <- root loss.

SYSTEM RESTORE DATABASE REPLICA repl_db;
```

**구문**

```sql
SYSTEM RESTORE REPLICA [db.]replicated_merge_tree_family_table_name [ON CLUSTER cluster_name]
```

대체 구문:

```sql
SYSTEM RESTORE REPLICA [ON CLUSTER cluster_name] [db.]replicated_merge_tree_family_table_name
```

**예시**

여러 서버에서 테이블을 생성합니다. ZooKeeper에서 레플리카의 메타데이터가 손실되면 메타데이터가 없기 때문에 테이블이 읽기 전용으로만 attach됩니다. 마지막 쿼리는 모든 레플리카에서 실행되어야 합니다.

```sql
CREATE TABLE test(n UInt32)
ENGINE = ReplicatedMergeTree('/clickhouse/tables/test/', '{replica}')
ORDER BY n PARTITION BY n % 10;

INSERT INTO test SELECT * FROM numbers(1000);

-- zookeeper_delete_path("/clickhouse/tables/test", recursive=True) <- root loss.

SYSTEM RESTART REPLICA test;
SYSTEM RESTORE REPLICA test;
```

다른 방법:

```sql
SYSTEM RESTORE REPLICA test ON CLUSTER cluster;
```


### SYSTEM RESTART REPLICAS \{#restart-replicas\}

모든 `ReplicatedMergeTree` 테이블에 대해 Zookeeper 세션 상태를 다시 초기화할 수 있게 하며, 현재 상태를 단일 진실 소스인 Zookeeper 상태와 비교하여 필요하면 Zookeeper 큐에 작업을 추가합니다

### SYSTEM CLEAR|DROP FILESYSTEM CACHE \{#drop-filesystem-cache\}

파일 시스템 캐시를 비웁니다.

```sql
SYSTEM CLEAR FILESYSTEM CACHE [ON CLUSTER cluster_name]
```


### SYSTEM SYNC FILE CACHE \{#sync-file-cache\}

:::note
부하가 크고 오용될 소지가 있습니다.
:::

sync 시스템 호출을 수행합니다.

```sql
SYSTEM SYNC FILE CACHE [ON CLUSTER cluster_name]
```


### SYSTEM LOAD PRIMARY KEY \{#load-primary-key\}

지정된 테이블 또는 모든 테이블의 기본 키를 로드합니다.

```sql
SYSTEM LOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM LOAD PRIMARY KEY
```


### SYSTEM UNLOAD PRIMARY KEY \{#unload-primary-key\}

지정된 테이블 또는 모든 테이블의 기본 키를 언로드합니다.

```sql
SYSTEM UNLOAD PRIMARY KEY [db.]name
```

```sql
SYSTEM UNLOAD PRIMARY KEY
```


## 갱신 가능 구체화 뷰(refreshable materialized view) 관리 \{#refreshable-materialized-views\}

[갱신 가능 구체화 뷰(refreshable materialized view)](../../sql-reference/statements/create/view.md#refreshable-materialized-view)가 수행하는 백그라운드 작업을 제어하는 명령을 설명합니다.

사용 시에는 [`system.view_refreshes`](../../operations/system-tables/view_refreshes.md)를 주시하십시오.

### SYSTEM REFRESH VIEW \{#refresh-view\}

지정된 VIEW를 예약된 주기와 관계없이 즉시 새로 고치도록 트리거합니다.

```sql
SYSTEM REFRESH VIEW [db.]name
```


### SYSTEM WAIT VIEW \{#wait-view\}

현재 실행 중인 새로 고침이 완료될 때까지 대기합니다. 새로 고침이 실패하면 예외를 발생시킵니다. 실행 중인 새로 고침이 없으면 즉시 완료되며, 이전 새로 고침이 실패한 경우 예외를 발생시킵니다.

### SYSTEM STOP [REPLICATED] VIEW, STOP VIEWS \{#stop-view-stop-views\}

지정한 VIEW 또는 모든 갱신 가능 VIEW의 주기적인 새로고침을 비활성화합니다. 새로고침이 진행 중이면 해당 작업도 취소합니다.

VIEW가 Replicated 또는 Shared 데이터베이스에 있는 경우, `STOP VIEW`는 현재 레플리카에만 영향을 미치며, `STOP REPLICATED VIEW`는 모든 레플리카에 영향을 미칩니다.

:::note
중지된 상태는 서버를 재시작해도 유지되지 않습니다. 재시작 후에는 VIEW가 구성된 새로고침 일정에 따라 다시 실행됩니다.
Replicated 또는 Shared 데이터베이스에서는 `SYSTEM STOP VIEW`가 현재 레플리카에만 영향을 미칩니다. 모든 레플리카에서 새로고침을 중지하려면 `SYSTEM STOP REPLICATED VIEW`를 사용하십시오.
:::

```sql
SYSTEM STOP VIEW [db.]name
```

```sql
SYSTEM STOP VIEWS
```


### SYSTEM START [REPLICATED] VIEW, START VIEWS \{#start-view-start-views\}

지정된 VIEW 또는 모든 갱신 가능한 VIEW에 대해 주기적 갱신을 다시 활성화합니다. 즉시 갱신은 수행되지 않습니다.

VIEW가 Replicated 또는 Shared 데이터베이스에 있는 경우, `START VIEW`는 `STOP VIEW`의 영향을 되돌리고, `START REPLICATED VIEW`는 `STOP REPLICATED VIEW`의 영향을 되돌립니다.

```sql
SYSTEM START VIEW [db.]name
```

```sql
SYSTEM START VIEWS
```


### SYSTEM CANCEL VIEW \{#cancel-view\}

지정된 VIEW에 대해 현재 레플리카에서 진행 중인 리프레시 작업이 있으면 이를 중단하고 취소합니다. 그렇지 않으면 아무 작업도 수행하지 않습니다.

```sql
SYSTEM CANCEL VIEW [db.]name
```


### SYSTEM WAIT VIEW \{#system-wait-view\}

실행 중인 리프레시가 완료될 때까지 대기합니다. 실행 중인 리프레시가 없으면 즉시 반환합니다. 마지막 리프레시 시도가 실패한 경우 오류를 반환합니다.

새로 갱신 가능 구체화 뷰를 생성한 직후(EMPTY 키워드 없이) 초기 리프레시가 완료될 때까지 대기하는 데 사용할 수 있습니다.

뷰가 Replicated 또는 Shared 데이터베이스에 있고, 리프레시가 다른 레플리카에서 실행 중인 경우 해당 리프레시가 완료될 때까지 대기합니다.

```sql
SYSTEM WAIT VIEW [db.]name
```
