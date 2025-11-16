---
'description': 'ClickHouse Cloud의 고급 대시보드'
'keywords':
- 'monitoring'
- 'observability'
- 'advanced dashboard'
- 'dashboard'
- 'observability dashboard'
'sidebar_label': '고급 대시보드'
'sidebar_position': 45
'slug': '/cloud/manage/monitor/advanced-dashboard'
'title': 'ClickHouse Cloud의 고급 대시보드'
'doc_type': 'guide'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';
import Image from '@theme/IdealImage';

모니터링 데이터베이스 시스템은 프로덕션 환경에서 배포 상태를 이해하는 데 매우 중요하여 중단을 방지하거나 해결할 수 있습니다.

고급 대시보드는 ClickHouse 시스템과 그 환경에 대한 깊은 통찰력을 제공하도록 설계된 경량 도구로, 성능 병목 현상, 시스템 장애 및 비효율에 앞서 나갈 수 있도록 도와줍니다.

고급 대시보드는 ClickHouse OSS (오픈 소스 소프트웨어)와 Cloud 모두에서 사용할 수 있습니다. 이 문서에서는 Cloud에서 고급 대시보드를 사용하는 방법을 설명합니다.

## 고급 대시보드에 접근하기 {#accessing-the-advanced-dashboard}

고급 대시보드는 다음 경로를 통해 접근할 수 있습니다:

* 왼쪽 사이드 패널
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="Advanced dashboard"/>

## 네이티브 고급 대시보드에 접근하기 {#accessing-the-native-advanced-dashboard}

네이티브 고급 대시보드는 다음 경로를 통해 접근할 수 있습니다:

* 왼쪽 사이드 패널
  * `Monitoring` → `Advanced dashboard`
  * `You can still access the native advanced dashboard.` 클릭

이렇게 하면 네이티브 고급 대시보드가 새 탭에서 열립니다. 대시보드에 접근하려면 인증이 필요합니다.

<Image img={NativeAdvancedDashboard} size="lg" alt="Advanced dashboard"/>

각 시각화에는 해당 시각화를 채우는 SQL 쿼리가 연결되어 있습니다. 펜 아이콘을 클릭하여 이 쿼리를 편집할 수 있습니다.

<Image img={EditVisualization} size="lg" alt="Advanced dashboard"/>

## 기본 제공 시각화 {#out-of-box-visualizations}

고급 대시보드의 기본 차트는 ClickHouse 시스템에 대한 실시간 가시성을 제공하도록 설계되었습니다. 아래는 각 차트에 대한 설명이 포함된 목록입니다. 탐색을 돕기 위해 세 가지 범주로 그룹화되었습니다.

### ClickHouse 특화 {#clickhouse-specific}

이 메트릭은 ClickHouse 인스턴스의 건강 및 성능을 모니터링하도록 맞춤화되어 있습니다.

| 메트릭                     | 설명                                                                                  |
|---------------------------|---------------------------------------------------------------------------------------|
| 초당 쿼리 수              | 처리되고 있는 쿼리의 비율을 추적합니다.                                             |
| 초당 선택된 행            | 쿼리가 읽고 있는 행의 수를 나타냅니다.                                             |
| 초당 삽입된 행            | 데이터 수집 비율을 측정합니다.                                                      |
| 총 MergeTree 파트         | MergeTree 테이블에서 활성 파트의 수를 보여줍니다. 이를 통해 비배치 삽입을 식별하는 데 도움이 됩니다. |
| 파티션당 최대 파트        | 임의의 파티션에서 최대 파트의 수를 강조합니다.                                      |
| 실행 중인 쿼리           | 현재 실행 중인 쿼리의 수를 표시합니다.                                             |
| 초당 선택된 바이트        | 쿼리가 읽고 있는 데이터의 양을 나타냅니다.                                          |

### 시스템 건강 특화 {#system-health-specific}

ClickHouse 자체뿐 아니라 기본 시스템을 모니터링하는 것도 중요합니다.

| 메트릭                    | 설명                                                               |
|---------------------------|--------------------------------------------------------------------|
| IO 대기                   | I/O 대기 시간을 추적합니다.                                        |
| CPU 대기                  | CPU 자원 경합으로 인한 지연을 측정합니다.                         |
| 디스크에서 읽기           | 디스크 또는 블록 장치에서 읽힌 바이트 수를 추적합니다.           |
| 파일 시스템에서 읽기     | 페이지 캐시를 포함하여 파일 시스템에서 읽힌 바이트 수를 추적합니다. |
| 메모리(추적, 바이트)     | ClickHouse에 의해 추적되는 프로세스의 메모리 사용량을 보여줍니다.  |
| 부하 평균 (15분)         | 시스템의 현재 부하 평균 15를 보고합니다.                           |
| OS CPU 사용량 (사용자 공간)| 사용자 공간 코드를 실행할 때의 CPU 사용량을 나타냅니다.          |
| OS CPU 사용량 (커널)     | 커널 코드를 실행할 때의 CPU 사용량을 나타냅니다.                  |

## ClickHouse Cloud 특화 {#clickhouse-cloud-specific}

ClickHouse Cloud는 객체 저장소 (S3 유형)를 사용하여 데이터를 저장합니다. 이 인터페이스를 모니터링하면 문제를 감지하는 데 도움이 될 수 있습니다.

| 메트릭                         | 설명                                                       |
|--------------------------------|-----------------------------------------------------------|
| S3 읽기 대기                   | S3에 대한 읽기 요청의 지연 시간을 측정합니다.             |
| 초당 S3 읽기 오류             | 읽기 오류 비율을 추적합니다.                              |
| 초당 S3에서 읽기 (바이트)      | S3 저장소에서 데이터가 읽히는 비율을 추적합니다.          |
| 초당 디스크 S3 쓰기 요청       | S3 저장소에 대한 쓰기 작업의 빈도를 모니터링합니다.      |
| 초당 디스크 S3 읽기 요청      | S3 저장소에 대한 읽기 작업의 빈도를 모니터링합니다.      |
| 페이지 캐시 적중률             | 페이지 캐시의 적중률입니다.                               |
| 파일 시스템 캐시 적중률       | 파일 시스템 캐시의 적중률입니다.                          |
| 파일 시스템 캐시 크기         | 현재 파일 시스템 캐시의 크기입니다.                       |
| 초당 네트워크 송신 바이트      | 수신되는 네트워크 트래픽의 현재 속도를 추적합니다.       |
| 초당 네트워크 수신 바이트      | 발신되는 네트워크 트래픽의 현재 속도를 추적합니다.       |
| 동시 네트워크 연결 수          | 현재 동시 네트워크 연결 수를 추적합니다.                 |

## 고급 대시보드를 사용하여 문제 식별하기 {#identifying-issues-with-the-advanced-dashboard}

ClickHouse 서비스의 건강 상태에 대한 이 실시간 뷰는 비즈니스에 영향을 미치기 전에 문제를 완화하는 데 큰 도움이 됩니다. 다음은 고급 대시보드를 사용하여 식별할 수 있는 몇 가지 문제입니다.

### 비배치 삽입 {#unbatched-inserts}

[모범 사례 문서](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)에서 설명한 바와 같이, 가능한 경우 항상 ClickHouse에 대량으로 데이터를 삽입하는 것이 권장됩니다.

합리적인 배치 크기로 대량 삽입을 수행하면 수집 중 생성되는 파트 수가 줄어들어 디스크에 대한 더 효율적인 쓰기와 더 적은 병합 작업이 발생합니다.

비최적 삽입을 식별하는 주요 메트릭은 **초당 삽입된 행** 및 **파티션당 최대 파트**입니다.

<Image img={InsertedRowsSec} size="lg" alt="Unbatched inserts"/>

위의 예는 13시와 14시 사이에 **초당 삽입된 행** 및 **파티션당 최대 파트**에서 두 개의 스파이크를 보여줍니다. 이는 우리가 합리적인 속도로 데이터를 수집하고 있다는 것을 나타냅니다.

이후 16시 이후 **파티션당 최대 파트**에서 또 다른 큰 스파이크를 확인하지만 **초당 삽입된 행** 속도는 매우 느립니다. 많은 파트가 생성되지만 생성된 데이터는 매우 적기 때문에 파트의 크기가 비최적임을 나타냅니다.

### 자원 집약적인 쿼리 {#resource-intensive-query}

CPU 또는 메모리와 같은 많은 자원을 소모하는 SQL 쿼리를 실행하는 것은 일반적입니다. 그러나 이러한 쿼리를 모니터링하고 배포의 전체 성능에 미치는 영향을 이해하는 것이 중요합니다.

쿼리 처리량 변화 없이 자원 소비의 갑작스런 변화는 더 비싼 쿼리가 실행되고 있음을 나타낼 수 있습니다. 실행 중인 쿼리 유형에 따라 이는 예상될 수 있지만, 고급 대시보드를 통해 이를 점검할 수 있습니다.

아래는 초당 실행된 쿼리 수가 크게 변하지 않고 CPU 사용량이 peak에 도달하는 예입니다.

<Image img={ResourceIntensiveQuery} size="lg" alt="Resource intensive query"/>

### 잘못된 기본 키 설계 {#bad-primary-key-design}

고급 대시보드를 사용하여 확인할 수 있는 또 다른 문제는 잘못된 기본 키 설계입니다. ["ClickHouse에서 기본 인덱스에 대한 실질적인 소개"](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)에서 설명한 바와 같이, 기본 키를 사용 사례에 가장 적합하게 선택하면 ClickHouse가 쿼리를 실행하기 위해 읽어야 하는 행 수를 줄여 성능이 크게 향상됩니다.

기본 키의 잠재적 개선을 식별하기 위해 따라야 할 메트릭 중 하나는 **초당 선택된 행**입니다. 선택된 행 수의 갑작스러운 피크는 전체 쿼리 처리량의 일반적인 증가와, 쿼리를 실행하기 위해 많은 수의 행을 선택하는 쿼리를 나타낼 수 있습니다.

<Image img={SelectedRowsPerSecond} size="lg" alt="Resource intensive query"/>

타임스탬프를 필터로 사용하여 `system.query_log` 테이블에서 피크가 발생한 시점에 실행된 쿼리를 찾을 수 있습니다.

예를 들어, 특정 날 11시와 11시 사이에 실행된 모든 쿼리를 보여주는 쿼리를 실행하여 어떤 쿼리가 너무 많은 행을 읽는지 이해할 수 있습니다:

```sql title="Query"
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM system.query_log
WHERE has(databases, 'default') AND (event_time >= '2024-12-23 11:20:00') AND (event_time <= '2024-12-23 11:30:00') AND (type = 'QueryFinish')
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

```response title="Response"
Row 1:
──────
type:              QueryFinish
event_time:        2024-12-23 11:22:55
query_duration_ms: 37407
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

Row 2:
──────
type:              QueryFinish
event_time:        2024-12-23 11:26:50
query_duration_ms: 7325
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_no_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         150957260
tables:            ['default.amazon_reviews_no_pk']

Row 3:
──────
type:              QueryFinish
event_time:        2024-12-23 11:24:10
query_duration_ms: 3270
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         6242304
tables:            ['default.amazon_reviews_pk']

Row 4:
──────
type:              QueryFinish
event_time:        2024-12-23 11:28:10
query_duration_ms: 2786
query:             SELECT
    toStartOfMonth(review_date) AS month,
    any(product_title),
    avg(star_rating) AS avg_stars
FROM amazon_reviews_pk
WHERE
    product_category = 'Home'
GROUP BY
    month,
    product_id
ORDER BY
    month DESC,
    product_id ASC
LIMIT 20
read_rows:         6242304
tables:            ['default.amazon_reviews_pk']
```

이 예에서, 우리는 두 개의 테이블 `amazon_reviews_no_pk`와 `amazon_reviews_pk`에 대해 동일한 쿼리가 실행된 것을 볼 수 있습니다. 이는 누군가가 `amazon_reviews` 테이블에 대한 기본 키 옵션을 테스트하고 있었다고 결론을 내릴 수 있습니다.
