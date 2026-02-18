---
sidebar_position: 1
slug: /community-wisdom/debugging-insights
sidebar_label: '디버깅 인사이트'
doc_type: 'guide'
keywords: [
  'ClickHouse 문제 해결',
  'ClickHouse 오류',
  '느린 쿼리',
  '메모리 문제', 
  '연결 문제',
  '성능 최적화',
  '데이터베이스 오류',
  '구성 문제',
  '디버깅',
  '해결 방법'
]
title: '레슨 - 디버깅 인사이트'
description: '느린 쿼리, 메모리 오류, 연결 문제, 구성 문제 등 가장 흔한 ClickHouse 문제에 대한 해결 방법을 확인할 수 있습니다.'
---

# ClickHouse 운영: 커뮤니티 디버깅 인사이트 \{#clickhouse-operations-community-debugging-insights\}

*이 가이드는 커뮤니티 밋업에서 얻은 인사이트를 모은 컬렉션의 일부입니다. 더 많은 실제 사례 기반 해결책과 인사이트는 [구체적인 문제별로 찾아보면](./community-wisdom.md) 확인할 수 있습니다.*
*운영 비용이 너무 높아 고민하고 있습니까? [비용 최적화](./cost-optimization.md) 커뮤니티 인사이트 가이드를 확인해 보십시오.*

## 핵심 system 테이블 \{#essential-system-tables\}

다음 system 테이블은 운영 환경 디버깅에 필수적입니다.

### system.errors \{#system-errors\}

ClickHouse 인스턴스에서 현재 활성화된 모든 오류를 표시합니다.

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```


### system.replicas \{#system-replicas\}

클러스터 상태 모니터링을 위한 복제 지연 및 상태 정보를 제공합니다.

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas 
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```


### system.replication_queue \{#system-replication-queue\}

복제 관련 문제를 진단하는 데 필요한 상세 정보를 제공합니다.

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue 
WHERE last_exception != ''
ORDER BY create_time DESC;
```


### system.merges \{#system-merges\}

현재 진행 중인 머지 작업을 보여 주며, 중단된 프로세스를 식별하는 데 도움이 됩니다.

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```


### system.parts \{#system-parts\}

파트 수를 모니터링하고 조각화 문제를 식별하는 데 필수적입니다.

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```


## 프로덕션 환경에서 흔히 발생하는 문제 \{#common-production-issues\}

### 디스크 공간 문제 \{#disk-space-problems\}

레플리케이션이 구성된 환경에서 디스크 공간이 고갈되면 연쇄적인 문제가 발생합니다. 한 노드의 공간이 부족해지면 다른 노드들은 계속해서 해당 노드와의 동기화를 시도하고, 이로 인해 네트워크 트래픽이 급증하고 혼란스러운 증상이 나타납니다. 한 커뮤니티 사용자는 단순한 디스크 공간 부족 문제를 디버깅하는 데 4시간을 소모한 사례도 있습니다. 특정 클러스터의 디스크 저장 공간을 모니터링하려면 이 [쿼리](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases)를 참고하십시오.

AWS를 사용하는 경우, 기본 범용 EBS 볼륨에는 16TB 제한이 있다는 점을 알고 있어야 합니다.

### 파트가 너무 많음 오류 \{#too-many-parts-error\}

작은 크기의 데이터를 자주 insert하면 성능 문제가 발생합니다. 커뮤니티에서는 초당 10회 이상 insert 속도에서 ClickHouse가 파트를 충분히 빠르게 머지하지 못해 「too many parts」 오류가 자주 발생한다는 점을 확인했습니다.

**해결 방법:**

- 30초 또는 200MB를 기준으로 데이터를 배치 처리합니다.
- 자동 배치를 위해 async_insert를 활성화합니다.  
- 서버 측 배치를 위해 buffer 테이블을 사용합니다.
- 배치 크기를 제어할 수 있도록 Kafka를 구성합니다.

[공식 권장사항](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous): insert 1회당 최소 1,000행, 이상적으로는 10,000행에서 100,000행을 사용하는 것이 좋습니다.

### 잘못된 타임스탬프로 인한 문제 \{#data-quality-issues\}

임의의 타임스탬프를 사용해 데이터를 전송하는 애플리케이션은 파티션 문제를 일으킵니다. 이로 인해 비현실적인 날짜(예: 1998년 또는 2050년)의 데이터가 포함된 파티션이 생성되어 예기치 않은 스토리지 동작이 발생할 수 있습니다.

### `ALTER` 작업 위험 \{#alter-operation-risks\}

여러 테라바이트 규모의 테이블에서 대규모 `ALTER` 작업을 실행하면 상당한 리소스를 소모하고 데이터베이스가 잠길 수 있습니다. 커뮤니티의 한 사례에서는 14TB 데이터에서 Integer 타입을 Float 타입으로 변경하는 작업을 수행하다 전체 데이터베이스가 잠겨, 백업에서 다시 복구해야 했습니다.

**비용이 큰 뮤테이션을 모니터링하십시오:**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

우선 규모가 더 작은 데이터셋에서 스키마 변경을 테스트하십시오.


## 메모리 및 성능 \{#memory-and-performance\}

### 외부 집계 \{#external-aggregation\}

메모리를 많이 사용하는 연산에는 외부 집계를 활성화하십시오. 디스크로 데이터를 스필(spill)하기 때문에 속도는 더 느려지지만, 메모리 부족으로 인한 비정상 종료를 방지합니다. 대용량 `GROUP BY` 연산에서 메모리 부족으로 인한 비정상 종료를 예방하는 데 도움이 되는 `max_bytes_before_external_group_by`를 사용하여 이를 구성할 수 있습니다. 이 설정에 대해 더 알아보려면 [여기](/operations/settings/settings#max_bytes_before_external_group_by)를 참고하십시오.

```sql
SELECT 
    column1,
    column2,
    COUNT(*) as count,
    SUM(value) as total
FROM large_table
GROUP BY column1, column2
SETTINGS max_bytes_before_external_group_by = 1000000000; -- 1GB threshold
```


### Async insert 세부 정보 \{#async-insert-details\}

Async insert는 서버 측에서 작은 insert를 자동으로 배치 처리하여 성능을 향상시킵니다. 디스크에 데이터가 기록될 때까지 응답을 기다릴지, 아니면 응답을 즉시 반환할지 구성할 수 있습니다. 즉시 반환은 더 빠르지만 내구성은 낮아집니다. 최신 버전에서는 배치 내 중복 데이터 처리를 위한 중복 제거를 지원합니다.

**관련 문서**

- [insert 전략 선택하기](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### 분산 테이블 구성 \{#distributed-table-configuration\}

기본적으로 분산 테이블은 단일 스레드로 데이터를 삽입합니다. 병렬 처리와 각 세그먼트로의 데이터 즉시 전송을 위해 `insert_distributed_sync`를 활성화하십시오.

분산 테이블을 사용할 때 임시 데이터 누적을 모니터링하십시오.

### 성능 모니터링 임계값 \{#performance-monitoring-thresholds\}

커뮤니티에서 권장하는 모니터링 임계값은 다음과 같습니다.

- 파티션당 파트 수: 가급적 100개 미만으로 유지합니다.
- 지연된 insert: 0으로 유지하는 것이 바람직합니다.
- Insert 속도: 최적의 성능을 위해 초당 약 1회로 제한합니다.

**관련 문서**

- [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key)

## 빠른 참조 \{#quick-reference\}

| 이슈 | 탐지 방법 | 해결 방법 |
|-------|-----------|----------|
| 디스크 공간 | `system.parts`의 총 바이트 수 확인 | 사용량 모니터링, 스케일링 계획 수립 |
| 파트 과다 | 테이블별 파트 개수 확인 | 배치 인서트 사용, async_insert 활성화 |
| 복제 지연 | `system.replicas`의 지연 확인 | 네트워크 모니터링, 레플리카 재시작 |
| 잘못된 데이터 | 파티션 날짜 검증 | 타임스탬프 검증 로직 구현 |
| 뮤테이션 중단 | `system.mutations` 상태 확인 | 우선 소량 데이터로 테스트 수행 |

### 동영상 자료 \{#video-sources\}

- [ClickHouse 운영 경험에서 얻은 10가지 교훈](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouse에서 빠르고 동시성이며 일관된 비동기 INSERTS 구현](https://www.youtube.com/watch?v=AsMPEfN5QtM)