---
'sidebar_position': 1
'slug': '/community-wisdom/debugging-insights'
'sidebar_label': '디버깅 인사이트'
'doc_type': 'guide'
'keywords':
- 'clickhouse troubleshooting'
- 'clickhouse errors'
- 'slow queries'
- 'memory problems'
- 'connection issues'
- 'performance optimization'
- 'database errors'
- 'configuration problems'
- 'debug'
- 'solutions'
'title': '교훈 - 디버깅 인사이트'
'description': '느린 쿼리, 메모리 오류, 연결 문제 및 구성 문제를 포함하여 가장 흔한 ClickHouse 문제에 대한 해결책을 찾으십시오.'
---


# ClickHouse 운영: 커뮤니티 디버깅 통찰 {#clickhouse-operations-community-debugging-insights}
*이 가이드는 커뮤니티 모임에서 얻은 발견 내용을 모은 컬렉션의 일부입니다. 실질적인 솔루션과 통찰력을 원하시면 [특정 문제별 탐색하기](./community-wisdom.md)를 참고하시기 바랍니다.*
*높은 운영 비용에 고통받고 계십니까? [비용 최적화](./cost-optimization.md) 커뮤니티 통찰력 가이드를 확인하세요.*

## 필수 시스템 테이블 {#essential-system-tables}

이 시스템 테이블은 프로덕션 디버깅에 필수적입니다:

### system.errors {#system-errors}

ClickHouse 인스턴스의 모든 활성 에러를 보여줍니다.

```sql
SELECT name, value, changed 
FROM system.errors 
WHERE value > 0 
ORDER BY value DESC;
```

### system.replicas {#system-replicas}

클러스터 건강을 모니터링하기 위한 복제 지연 및 상태 정보를 포함합니다.

```sql
SELECT database, table, replica_name, absolute_delay, queue_size, inserts_in_queue
FROM system.replicas 
WHERE absolute_delay > 60
ORDER BY absolute_delay DESC;
```

### system.replication_queue {#system-replication-queue}

복제 문제를 진단하기 위한 상세 정보를 제공합니다.

```sql
SELECT database, table, replica_name, position, type, create_time, last_exception
FROM system.replication_queue 
WHERE last_exception != ''
ORDER BY create_time DESC;
```

### system.merges {#system-merges}

현재 병합 작업을 보여주며, 막힌 프로세스를 식별할 수 있습니다.

```sql
SELECT database, table, elapsed, progress, is_mutation, total_size_bytes_compressed
FROM system.merges 
ORDER BY elapsed DESC;
```

### system.parts {#system-parts}

파트 수를 모니터링하고 단편화 문제를 식별하는 데 필수적입니다.

```sql
SELECT database, table, count() as part_count
FROM system.parts 
WHERE active = 1
GROUP BY database, table
ORDER BY count() DESC;
```

## 일반적인 프로덕션 문제 {#common-production-issues}

### 디스크 공간 문제 {#disk-space-problems}

복제된 설정에서 디스크 공간 고갈은 연쇄적인 문제를 일으킵니다. 하나의 노드가 공간이 부족하면, 다른 노드들은 계속해서 동기화를 시도하며 네트워크 트래픽이 급증하고 혼란스러운 증상이 발생합니다. 커뮤니티의 한 회원은 단순히 디스크 공간 부족으로 4시간을 디버깅했습니다. 특정 클러스터에서 디스크 저장소를 모니터링하기 위해 이 [쿼리](/knowledgebase/useful-queries-for-troubleshooting#show-disk-storage-number-of-parts-number-of-rows-in-systemparts-and-marks-across-databases)를 확인해 보세요.

AWS 사용자는 기본 일반 목적 EBS 볼륨이 16TB 제한이 있다는 점에 유의해야 합니다.

### 너무 많은 파트 오류 {#too-many-parts-error}

작은 빈번한 삽입은 성능 문제를 초래할 수 있습니다. 커뮤니티에서는 초당 10번 이상의 삽입 속도가 "너무 많은 파트" 오류를 종종 발생시키는 것으로 확인했습니다. 이는 ClickHouse가 파트를 충분히 빨리 병합할 수 없기 때문입니다.

**해결책:**
- 30초 또는 200MB 임계값을 사용하여 데이터를 배치합니다.
- 자동 배치를 위해 async_insert를 활성화합니다.
- 서버 측 배치를 위해 버퍼 테이블을 사용합니다.
- 제어된 배치 크기를 위해 Kafka를 구성합니다.

[공식 권장사항](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous): 최소 1,000행을 삽입하며, 이상적으로는 10,000행에서 100,000행입니다.

### 유효하지 않은 타임스탬프 문제 {#data-quality-issues}

임의의 타임스탬프를 가진 데이터를 전송하는 응용 프로그램은 파티션 문제를 일으킵니다. 이는 비현실적인 날짜(예: 1998년 또는 2050년)로 데이터가 포함된 파티션을 초래하여 예상치 못한 저장 동작을 유발합니다.

### `ALTER` 작업 위험 {#alter-operation-risks}

멀티 테라바이트 테이블에서 대규모 `ALTER` 작업은 상당한 리소스를 소모하고 데이터베이스를 잠글 수 있습니다. 커뮤니티의 한 사례에서는 14TB의 데이터에서 Integer를 Float로 변경하는 과정이 전체 데이터베이스를 잠그고 백업에서 재구축해야 했습니다.

**비용이 많이 드는 변이를 모니터링하세요:**

```sql
SELECT database, table, mutation_id, command, parts_to_do, is_done
FROM system.mutations 
WHERE is_done = 0;
```

작은 데이터셋에서 스키마 변경을 테스트하세요.

## 메모리 및 성능 {#memory-and-performance}

### 외부 집계 {#external-aggregation}

메모리 집약적인 작업을 위해 외부 집계를 활성화하세요. 이것은 느리지만 디스크로 넘겨 스택 오버플로우를 방지합니다. `max_bytes_before_external_group_by`를 사용하여 큰 `GROUP BY` 작업에서 out of memory 크래시를 방지할 수 있습니다. 이 설정에 대해 더 알고 싶다면 [여기](/operations/settings/settings#max_bytes_before_external_group_by)를 확인하세요.

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

### 비동기 삽입 세부정보 {#async-insert-details}

비동기 삽입은 작은 삽입을 서버 측에서 자동으로 배치하여 성능을 개선합니다. 데이터가 디스크에 기록될 때까지 대기할지 여부를 구성할 수 있으며, 즉시 반환은 더 빠르지만 내구성은 떨어집니다. 최신 버전은 배치 내 중복 데이터를 처리하기 위한 중복 제거를 지원합니다.

**관련 문서**
- [삽입 전략 선택하기](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)

### 분산 테이블 구성 {#distributed-table-configuration}

기본적으로 분산 테이블은 단일 스레드 삽입을 사용합니다. `insert_distributed_sync`를 활성화하면 병렬 처리와 샤드에 대한 즉각적인 데이터 전송이 이루어집니다.

분산 테이블을 사용할 때 임시 데이터 축적을 모니터링하세요.

### 성능 모니터링 임계값 {#performance-monitoring-thresholds}

커뮤니티에서 권장하는 모니터링 임계값:
- 파티션당 파트 수: 바람직하게는 100 미만
- 지연된 삽입: 0점 유지
- 삽입 속도: 최적 성능을 위해 초당 약 1로 제한

**관련 문서**
- [사용자 정의 파티셔닝 키](/engines/table-engines/mergetree-family/custom-partitioning-key)

## 빠른 참고 {#quick-reference}

| 문제 | 탐지 방법 | 해결책 |
|------|-----------|---------|
| 디스크 공간 | `system.parts`의 총 바이트 확인 | 사용량 모니터링, 확장 계획 |
| 너무 많은 파트 | 테이블당 파트 수 카운트 | 삽입 배치, async_insert 활성화 |
| 복제 지연 | `system.replicas` 지연 확인 | 네트워크 모니터링, 복제본 재시작 |
| 잘못된 데이터 | 파티션 날짜 검증 | 타임스탬프 검증 구현 |
| 막힌 변이 | `system.mutations` 상태 확인 | 먼저 작은 데이터로 테스트 |

### 비디오 자료 {#video-sources}
- [ClickHouse 운영에서 배운 10가지 교훈](https://www.youtube.com/watch?v=liTgGiTuhJE)
- [ClickHouse에서 빠르고 동시적이며 일관된 비동기 INSERT 구문](https://www.youtube.com/watch?v=AsMPEfN5QtM)
