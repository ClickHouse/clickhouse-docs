---
description: '테이블 엔진 문서'
slug: /engines/table-engines/
toc_folder_title: '테이블 엔진'
toc_priority: 26
toc_title: '소개'
title: '테이블 엔진'
doc_type: '레퍼런스'
---



# 테이블 엔진 \{#table-engines\}

테이블 엔진(테이블 유형)은 다음을 결정합니다.

- 데이터를 어떻게, 어디에 저장하고 어디에 기록하며 어디에서 읽을지
- 어떤 쿼리를 어떤 방식으로 지원할지
- 동시 데이터 접근 방식을 어떻게 처리할지
- 인덱스가 있는 경우, 인덱스를 어떻게 사용할지
- 다중 스레드 요청 실행이 가능한지 여부
- 데이터 복제 매개변수



## Engine families \{#engine-families\}

### MergeTree \{#mergetree\}

고부하 작업에 가장 범용적이고 기능이 풍부한 테이블 엔진입니다. 이 엔진들이 공통적으로 가지는 특성은 빠른 데이터 삽입과 그 이후의 백그라운드 데이터 처리입니다. `MergeTree` 계열 엔진은 엔진의 [Replicated\*](/engines/table-engines/mergetree-family/replication) 버전을 사용한 데이터 복제, 파티셔닝, 보조 data-skipping 인덱스 등 다른 엔진에서는 지원하지 않는 다양한 기능을 지원합니다.

이 계열에 포함된 엔진:

| MergeTree Engines                                                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                     |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                         |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                  |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                                     |

### Log \{#log\}

기능이 최소화된 경량 [엔진](../../engines/table-engines/log-family/index.md)입니다. 많은 수의 작은 테이블(대략 최대 100만 행 규모)을 빠르게 기록해 두었다가, 나중에 전체를 한 번에 읽어야 할 때 가장 효율적입니다.

이 계열에 포함된 엔진:

| Log Engines                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### Integration engines \{#integration-engines\}

다른 데이터 저장 및 처리 시스템과 통신하기 위한 엔진입니다.

이 계열에 포함된 엔진:

| Integration Engines                                                             |
|---------------------------------------------------------------------------------|
| [ODBC](../../engines/table-engines/integrations/odbc.md)                        |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                        |
| [MySQL](../../engines/table-engines/integrations/mysql.md)                      |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)                  |
| [Redis](../../engines/table-engines/integrations/redis.md)                      |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                        |
| [S3](../../engines/table-engines/integrations/s3.md)                            |
| [Kafka](../../engines/table-engines/integrations/kafka.md)                      |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)                |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)            |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)                  |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)           |

### Special engines \{#special-engines\}

이 계열에 포함된 엔진:



| 특수 엔진                                                       |
|---------------------------------------------------------------|
| [Distributed](/engines/table-engines/special/distributed)     |
| [Dictionary](/engines/table-engines/special/dictionary)       |
| [Merge](/engines/table-engines/special/merge)                 |
| [Executable](/engines/table-engines/special/executable)       |
| [File](/engines/table-engines/special/file)                   |
| [Null](/engines/table-engines/special/null)                   |
| [Set](/engines/table-engines/special/set)                     |
| [Join](/engines/table-engines/special/join)                   |
| [URL](/engines/table-engines/special/url)                     |
| [View](/engines/table-engines/special/view)                   |
| [Memory](/engines/table-engines/special/memory)               |
| [Buffer](/engines/table-engines/special/buffer)               |
| [External Data](/engines/table-engines/special/external-data) |
| [GenerateRandom](/engines/table-engines/special/generate)     |
| [KeeperMap](/engines/table-engines/special/keeper-map)        |
| [FileLog](/engines/table-engines/special/filelog)                                                   |



## Virtual columns \{#table_engines-virtual_columns\}

가상 컬럼은 엔진 소스 코드에서 정의되는, 테이블 엔진의 필수 속성입니다.

`CREATE TABLE` 쿼리에서는 가상 컬럼을 지정하지 않아야 하며, `SHOW CREATE TABLE` 및 `DESCRIBE TABLE` 쿼리 결과에서도 가상 컬럼을 볼 수 없습니다. 가상 컬럼은 읽기 전용이므로, 가상 컬럼에 데이터를 삽입할 수 없습니다.

가상 컬럼에서 데이터를 조회하려면 `SELECT` 쿼리에서 해당 컬럼 이름을 지정해야 합니다. `SELECT *`는 가상 컬럼의 값을 반환하지 않습니다.

테이블 가상 컬럼 중 하나와 동일한 이름의 컬럼으로 테이블을 생성하면, 해당 가상 컬럼에는 접근할 수 없게 됩니다. 이렇게 하는 것은 권장하지 않습니다. 충돌을 피하기 위해, 가상 컬럼 이름은 일반적으로 이름 앞에 밑줄(_)을 붙이는 방식으로 지정합니다.

- `_table` — 데이터를 읽어 온 테이블의 이름을 포함합니다. 타입: [String](../../sql-reference/data-types/string.md).

    사용 중인 테이블 엔진과 무관하게, 각 테이블에는 `_table`이라는 이름의 범용 가상 컬럼이 포함됩니다.

    Merge 테이블 엔진을 사용하는 테이블을 쿼리할 때는 `WHERE/PREWHERE` 절에서 `_table`에 대한 상수 조건을 설정할 수 있습니다(예: `WHERE _table='xyz'`). 이 경우 `_table` 조건을 만족하는 테이블에서만 읽기 작업이 수행되므로, `_table` 컬럼이 인덱스처럼 동작합니다.

    `SELECT ... FROM (... UNION ALL ...)` 형식의 쿼리를 사용할 때는 `_table` 컬럼을 지정하여 반환된 행이 실제로 어떤 테이블에서 읽혀 온 것인지 판별할 수 있습니다.
