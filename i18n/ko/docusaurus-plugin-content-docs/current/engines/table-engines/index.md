---
'description': '테이블 엔진에 대한 Documentation'
'slug': '/engines/table-engines/'
'toc_folder_title': 'Table Engines'
'toc_priority': 26
'toc_title': 'Introduction'
'title': '테이블 엔진'
'doc_type': 'reference'
---


# 테이블 엔진

테이블 엔진(테이블 유형)은 다음을 결정합니다:

- 데이터가 저장되는 방법과 위치, 데이터가 쓰여지는 위치, 읽혀지는 위치.
- 지원되는 쿼리 유형 및 방법.
- 동시 데이터 접근.
- 인덱스 사용 여부(있는 경우).
- 다중 스레드 요청 실행이 가능한지 여부.
- 데이터 복제 매개변수.

## 엔진 패밀리 {#engine-families}

### MergeTree {#mergetree}

고부하 작업을 위한 가장 보편적이고 기능적인 테이블 엔진입니다. 이러한 엔진들의 공통적인 속성은 빠른 데이터 삽입과 이후 백그라운드 데이터 처리입니다. `MergeTree` 패밀리 엔진은 데이터 복제(엔진의 [Replicated\*](/engines/table-engines/mergetree-family/replication) 버전 포함), 파티셔닝, 이차 데이터 스킵 인덱스 및 다른 엔진에서 지원되지 않는 여러 기능을 지원합니다.

가족 내 엔진:

| MergeTree 엔진                                                                                                                         |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                     |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                         |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                  |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                                     |

### Log {#log}

최소 기능을 갖춘 경량 [엔진](../../engines/table-engines/log-family/index.md)입니다. 많은 소규모 테이블(약 100만 행까지)을 즉시 작성하고 나중에 전체를 읽어야 할 때 가장 효과적입니다.

가족 내 엔진:

| Log 엔진                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 통합 엔진 {#integration-engines}

다른 데이터 저장 및 처리 시스템과 통신하기 위한 엔진입니다.

가족 내 엔진:

| 통합 엔진                                                             |
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

### 특수 엔진 {#special-engines}

가족 내 엔진:

| 특수 엔진                                               |
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

## 가상 컬럼 {#table_engines-virtual_columns}

가상 컬럼은 엔진 소스 코드에 정의된 필수 테이블 엔진 속성입니다.

`CREATE TABLE` 쿼리에서 가상 컬럼을 지정해서는 안 되며, `SHOW CREATE TABLE` 및 `DESCRIBE TABLE` 쿼리 결과에서 볼 수 없습니다. 가상 컬럼은 읽기 전용이므로 데이터는 가상 컬럼에 삽입할 수 없습니다.

가상 컬럼에서 데이터를 선택하려면 `SELECT` 쿼리에서 그 이름을 지정해야 합니다. `SELECT *`는 가상 컬럼의 값을 반환하지 않습니다.

테이블 가상 컬럼 중 하나와 동일한 이름을 가진 컬럼이 있는 테이블을 생성하면 가상 컬럼에 접근할 수 없게 됩니다. 이를 피하는 것이 좋습니다. 충돌을 피하기 위해 가상 컬럼 이름은 일반적으로 밑줄(_)로 접두사가 붙습니다.

- `_table` — 데이터가 읽혀진 테이블의 이름을 포함합니다. 유형: [String](../../sql-reference/data-types/string.md).

    사용 중인 테이블 엔진에 관계없이 각 테이블은 `_table`이라는 보편적인 가상 컬럼을 포함합니다.

    Merge 테이블 엔진으로 쿼리할 때, `WHERE/PREWHERE` 절에서 `_table`에 대한 상수 조건을 설정할 수 있습니다(예: `WHERE _table='xyz'`). 이 경우 조건이 만족되는 테이블에 대해서만 읽기 작업이 수행되므로 `_table` 컬럼은 인덱스 역할을 합니다.

    `SELECT ... FROM (... UNION ALL ...)` 형식의 쿼리를 사용할 때, 반환된 행이 실제로 어느 테이블에서 기원했는지를 `_table` 컬럼을 지정하여 확인할 수 있습니다.
