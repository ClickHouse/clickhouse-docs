---
'slug': '/optimize/query-parallelism'
'sidebar_label': '쿼리 병렬성'
'sidebar_position': 20
'description': 'ClickHouse는 처리 레인을 사용하고 max_threads 설정을 통해 쿼리 실행을 병렬화합니다.'
'title': 'ClickHouse가 쿼리를 병렬로 실행하는 방법'
'doc_type': 'guide'
'keywords':
- 'parallel processing'
- 'query optimization'
- 'performance'
- 'threading'
- 'best practices'
---

import visual01 from '@site/static/images/guides/best-practices/query-parallelism_01.gif';
import visual02 from '@site/static/images/guides/best-practices/query-parallelism_02.gif';
import visual03 from '@site/static/images/guides/best-practices/query-parallelism_03.gif';
import visual04 from '@site/static/images/guides/best-practices/query-parallelism_04.gif';
import visual05 from '@site/static/images/guides/best-practices/query-parallelism_05.png';
import Image from '@theme/IdealImage';



# ClickHouse가 쿼리를 병렬로 실행하는 방법

ClickHouse는 [속도를 위해 설계되었습니다](/concepts/why-clickhouse-is-so-fast). 사용할 수 있는 모든 CPU 코어를 활용하여 쿼리를 매우 병렬적으로 실행하며, 데이터를 처리 레인에 분배하고 하드웨어 한계를 가끔씩 가까이 밀어붙입니다.

이 가이드는 ClickHouse에서 쿼리 병렬성이 어떻게 작동하는지, 대규모 작업에서 성능을 개선하기 위해 이를 조정하거나 모니터링하는 방법을 설명합니다.

우리는 [uk_price_paid_simple](/parts) 데이터셋에서 집계 쿼리를 사용하여 주요 개념을 설명합니다.

## 단계별: ClickHouse가 집계 쿼리를 병렬화하는 방법 {#step-by-step-how-clickHouse-parallelizes-an-aggregation-query}

ClickHouse가 ① 테이블의 기본 키에 대한 필터가 있는 집계 쿼리를 실행할 때, ② 기본 인덱스를 메모리에 로드하여 ③ 처리해야 할 그라뉼과 안전하게 건너뛸 수 있는 그라뉼을 식별합니다:

<Image img={visual01} size="md" alt="Index analysis"/>

### 처리 레인 간 작업 분배 {#distributing-work-across-processing-lanes}

선택된 데이터는 `n`개의 병렬 [처리 레인](/academic_overview#4-2-multi-core-parallelization)으로 [동적으로](#load-balancing-across-processing-lanes) 분배되어, 데이터를 블록 단위로 최종 결과로 처리합니다:

<Image img={visual02} size="md" alt="4 parallel processing lanes"/>

<br/><br/>
`n`개의 병렬 처리 레인의 수는 기본적으로 ClickHouse가 서버에서 사용할 수 있는 CPU 코어 수와 일치하는 [max_threads](/operations/settings/settings#max_threads) 설정에 의해 제어됩니다. 위의 예에서는 `4` 코어를 가정합니다.

`8` 코어가 있는 머신에서는 쿼리 처리량이 대략 두 배로 증가합니다(하지만 메모리 사용량도 그에 따라 증가함). 더 많은 레인이 병렬로 데이터를 처리합니다:

<Image img={visual03} size="md" alt="8 parallel processing lanes"/>

<br/><br/>
효율적인 레인 분배는 CPU 활용도를 극대화하고 총 쿼리 시간을 줄이는 데 핵심입니다.

### 샤드 테이블에서 쿼리 처리 {#processing-queries-on-sharded-tables}

테이블 데이터가 [샤드](/shards)로 여러 서버에 분산된 경우, 각 서버는 자신의 샤드를 병렬로 처리합니다. 각 서버 내에서 로컬 데이터는 위에서 설명한 것처럼 병렬 처리 레인을 사용하여 처리됩니다:

<Image img={visual04} size="md" alt="Distributed lanes"/>

<br/><br/>
처음 쿼리를 수신하는 서버는 샤드에서 모든 하위 결과를 수집하고 이를 최종 글로벌 결과로 병합합니다.

샤드 전반에 쿼리 로드를 분산시키는 것은 특히 높은 처리량 환경에서 병렬성을 수평으로 확장하는 데 도움이 됩니다.

:::note ClickHouse Cloud는 샤드 대신 병렬 복제본을 사용합니다
ClickHouse Cloud에서는 이 동일한 병렬성이 [병렬 복제본](https://clickhouse.com/docs/deployment-guides/parallel-replicas)을 통해 달성되며, 이는 공유하지 않는 클러스터의 샤드와 비슷한 기능을 합니다. 각 ClickHouse Cloud 복제본(무상태 컴퓨팅 노드)은 데이터를 병렬로 처리하고 최종 결과에 기여합니다. 이는 독립된 샤드와 비슷합니다.
:::

## 쿼리 병렬성 모니터링 {#monitoring-query-parallelism}

이 도구를 사용하여 쿼리가 사용 가능한 CPU 리소스를 완전히 활용하는지 확인하고 그렇지 않을 때 진단합니다.

우리는 59 CPU 코어가 있는 테스트 서버에서 실행하고 있으며, 이는 ClickHouse가 쿼리 병렬성을 완전히 보여줄 수 있게 합니다.

예제 쿼리가 어떻게 실행되는지 관찰하려면 ClickHouse 서버에 집계 쿼리 동안 모든 추적 수준의 로그 항목을 반환하도록 지시할 수 있습니다. 이 시연에서는 쿼리의 술어를 제거했습니다. 그렇지 않으면 3개의 그라뉼만 처리되며, ClickHouse가 더 많은 병렬 처리 레인을 사용할 만큼 충분한 데이터가 아닙니다:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
SETTINGS send_logs_level='trace';
```

```txt
① <Debug> ...: 3609 marks to read from 3 ranges
② <Trace> ...: Spreading mark ranges among streams
② <Debug> ...: Reading approx. 29564928 rows with 59 streams
```

다음과 같은 정보를 확인할 수 있습니다:

* ① ClickHouse는 3개의 데이터 범위에서 3,609 그라뉼(추적 로그에서 마크로 표시됨)을 읽어야 합니다.
* ② 59 CPU 코어로, 이 작업은 59개의 병렬 처리 스트림—각 레인마다 하나씩—에 분배됩니다.

대안으로, 우리는 집계 쿼리를 위한 [물리적 연산자 계획](/academic_overview#4-2-multi-core-parallelization)—"쿼리 파이프라인"으로도 알려져 있음—을 검사하기 위해 [EXPLAIN](/sql-reference/statements/explain#explain-pipeline) 절을 사용할 수 있습니다:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple;
```

```txt
    ┌─explain───────────────────────────────────────────────────────────────────────────┐
 1. │ (Expression)                                                                      │
 2. │ ExpressionTransform × 59                                                          │
 3. │   (Aggregating)                                                                   │
 4. │   Resize 59 → 59                                                                  │
 5. │     AggregatingTransform × 59                                                     │
 6. │       StrictResize 59 → 59                                                        │
 7. │         (Expression)                                                              │
 8. │         ExpressionTransform × 59                                                  │
 9. │           (ReadFromMergeTree)                                                     │
10. │           MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59 0 → 1 │
    └───────────────────────────────────────────────────────────────────────────────────┘
```

참고: 위의 연산자 계획은 아래에서 위로 읽어야 합니다. 각 행은 아래에서 스토리지에서 데이터를 읽는 것으로 시작하여 최종 처리 단계에서 종료되는 물리적 실행 계획의 단계를 나타냅니다. `× 59`로 표시된 연산자는 59개의 병렬 처리 레인 간에 겹치지 않는 데이터 영역에서 동시 실행됩니다. 이는 `max_threads` 값을 반영하며 각 쿼리 단계를 CPU 코어에 걸쳐 병렬화하는 방법을 보여줍니다.

ClickHouse의 [내장 웹 UI](/interfaces/http) ( `/play` 엔드포인트에서 사용 가능)는 위의 물리적 계획을 그래픽 시각화로 렌더링할 수 있습니다. 이 예제에서는 시각화를 간결하게 유지하기 위해 `max_threads`를 `4`로 설정하여 4개의 병렬 처리 레인만 표시합니다:

<Image img={visual05} alt="Query pipeline"/>

참고: 시각화를 왼쪽에서 오른쪽으로 읽습니다. 각 행은 데이터를 블록 단위로 스트리밍하며 필터링, 집계 및 최종 처리 단계와 같은 변환을 적용하는 병렬 처리 레인을 나타냅니다. 이 예제에서는 `max_threads = 4` 설정에 해당하는 4개의 병렬 레인을 볼 수 있습니다.

### 처리 레인 간 로드 밸런싱 {#load-balancing-across-processing-lanes}

위 물리 계획에서 `Resize` 연산자는 처리 레인 간 데이터 블록 스트림을 [재분배하고 재분배](https://academic_overview#4-2-multi-core-parallelization)하여 고르게 활용되도록 합니다. 이 재조정은 쿼리 술어와 일치하는 행 수에 따라 데이터 범위가 다를 때 특히 중요합니다. 그렇지 않으면 일부 레인은 과부하가 걸리고 다른 레인은 유휴 상태일 수 있습니다. 작업을 재분배함으로써 더 빠른 레인이 느린 레인을 도와 전체 쿼리 실행 시간을 최적화합니다.

## max_threads가 항상 준수되지 않는 이유 {#why-max-threads-isnt-always-respected}

위에서 언급했듯이, `n`개의 병렬 처리 레인의 수는 기본적으로 ClickHouse가 서버에서 사용할 수 있는 CPU 코어 수와 일치하는 `max_threads` 설정에 의해 제어됩니다:
```sql runnable=false
SELECT getSetting('max_threads');
```

```txt
   ┌─getSetting('max_threads')─┐
1. │                        59 │
   └───────────────────────────┘
```

그러나 처리할 데이터 양에 따라 `max_threads` 값이 무시될 수 있습니다:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 30
```

위의 연산자 계획 추출에서 보여지듯이, `max_threads`가 `59`로 설정되어 있음에도 불구하고 ClickHouse는 데이터 스캔을 위해 **30**개의 동시 스트림만 사용합니다.

이제 쿼리를 실행해 보겠습니다:
```sql runnable=false
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
   ┌─max(price)─┐
1. │  594300000 │ -- 594.30 million
   └────────────┘

1 row in set. Elapsed: 0.013 sec. Processed 2.31 million rows, 13.66 MB (173.12 million rows/s., 1.02 GB/s.)
Peak memory usage: 27.24 MiB.   
```

위의 결과에서 볼 수 있듯이, 쿼리는 231만 개의 행을 처리하고 13.66MB의 데이터를 읽었습니다. 이는 인덱스 분석 단계에서 ClickHouse가 처리할 **282 그라뉼**을 선택했기 때문이며, 각 그라뉼에는 8,192개의 행이 포함되어 총 약 231만 개의 행을 이루게 됩니다:

```sql runnable=false
EXPLAIN indexes = 1
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON';
```

```txt
    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 3/3                                │
12. │             Granules: 282/3609                        │
    └───────────────────────────────────────────────────────┘  
```

구성된 `max_threads` 값에 관계없이, ClickHouse는 충분한 데이터가 없을 경우에는 추가적인 병렬 처리 레인을 할당하지 않습니다. `max_threads`의 "최대"는 보장된 스레드 수가 아닌 상한선을 의미합니다.

"충분한 데이터"는 주로 각 처리 레인이 처리해야 하는 최소 행 수(기본값 163,840)와 최소 바이트 수(기본값 2,097,152)를 정의하는 두 가지 설정에 의해 결정됩니다:

공유하지 않는 클러스터의 경우:
* [merge_tree_min_rows_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read)
* [merge_tree_min_bytes_for_concurrent_read](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read)

공유 저장소가 있는 클러스터(예: ClickHouse Cloud)의 경우:
* [merge_tree_min_rows_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_rows_for_concurrent_read_for_remote_filesystem)
* [merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem)

또한, 다음에 의해 제어되는 읽기 작업 크기에 대한 하드 하한이 있습니다:
* [Merge_tree_min_read_task_size](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_read_task_size) + [merge_tree_min_bytes_per_task_for_remote_reading](https://clickhouse.com/docs/operations/settings/settings#merge_tree_min_bytes_per_task_for_remote_reading)

:::warning 이러한 설정을 수정하지 마십시오
생산 환경에서 이러한 설정을 수정하는 것은 권장되지 않습니다. 이 설정들은 `max_threads`가 항상 실제 병렬성 수준을 결정하지 않는 이유를 설명하기 위해 여기에 표시됩니다.
:::

시연 목적으로, 최대 동시성을 강제하는 설정을 덮어쓴 물리적 계획을 검사해 보겠습니다:
```sql runnable=false
EXPLAIN PIPELINE
SELECT
   max(price)
FROM
   uk.uk_price_paid_simple
WHERE town = 'LONDON'
SETTINGS
  max_threads = 59,
  merge_tree_min_read_task_size = 0,
  merge_tree_min_rows_for_concurrent_read_for_remote_filesystem = 0, 
  merge_tree_min_bytes_for_concurrent_read_for_remote_filesystem = 0;
```

```txt
...   
(ReadFromMergeTree)
MergeTreeSelect(pool: PrefetchedReadPool, algorithm: Thread) × 59
```

이제 ClickHouse는 데이터를 스캔하기 위해 59개의 동시 스트림을 사용하며, 구성된 `max_threads`를 완전히 준수합니다.

이는 작은 데이터 세트에 대한 쿼리의 경우 ClickHouse가 의도적으로 동시성을 제한한다는 것을 보여줍니다. 설정 덮어쓰기는 테스트 용도로만 사용하고 생산 환경에서는 사용하지 마십시오. 이는 비효율적인 실행 또는 리소스 경합으로 이어질 수 있습니다.

## 주요 요약 {#key-takeaways}

* ClickHouse는 `max_threads`에 연결된 처리 레인을 사용하여 쿼리를 병렬화합니다.
* 실제 레인의 수는 처리할 데이터의 크기에 따라 다릅니다.
* `EXPLAIN PIPELINE` 및 추적 로그를 사용하여 레인 사용을 분석하십시오.

## 추가 정보를 찾을 수 있는 곳 {#where-to-find-more-information}

ClickHouse가 쿼리를 병렬적으로 실행하는 방법 및 고성능을 어떻게 달성하는지에 대해 더 깊이 파고들고 싶다면, 다음 리소스를 탐색해보세요:

* [쿼리 처리 계층 – VLDB 2024 논문 (웹 판)](/academic_overview#4-query-processing-layer) - ClickHouse의 내부 실행 모델에 대한 자세한 설명으로, 스케줄링, 파이프라인 처리 및 연산자 설계를 포함합니다.
  
* [부분 집계 상태 설명](https://clickhouse.com/blog/clickhouse_vs_elasticsearch_mechanics_of_count_aggregations#-multi-core-parallelization) - 부분 집계 상태가 처리 레인 간 효율적인 병렬 실행을 어떻게 가능하게 하는지에 대한 기술적 심층 분석.

* ClickHouse 쿼리 처리 단계를 자세히 설명하는 비디오 자습서:
<iframe width="1024" height="576" src="https://www.youtube.com/embed/hP6G2Nlz_cA?si=Imd_i427J_kZOXHe" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
