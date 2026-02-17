---
description: 'ClickHouse Cloud의 고급 대시보드'
keywords: ['모니터링', '관측성', '고급 대시보드', '대시보드', '관측성 대시보드']
sidebar_label: '고급 대시보드'
sidebar_position: 45
slug: /cloud/manage/monitor/advanced-dashboard
title: 'ClickHouse Cloud의 고급 대시보드'
doc_type: '가이드'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import EditVisualization from '@site/static/images/cloud/manage/monitoring/edit_visualization.png';
import InsertedRowsSec from '@site/static/images/cloud/manage/monitoring/inserted_rows_max_parts_for_partition.png';
import ResourceIntensiveQuery from '@site/static/images/cloud/manage/monitoring/resource_intensive_query.png';
import SelectedRowsPerSecond from '@site/static/images/cloud/manage/monitoring/selected_rows_sec.png';

import Image from '@theme/IdealImage';

프로덕션 환경에서 데이터베이스 시스템을 모니터링하는 일은 배포 상태를 파악하고 장애를 예방하거나 해결하는 데 필수적입니다.

고급 대시보드는 ClickHouse 시스템과 그 환경에 대한 심층적인 인사이트를 제공하도록 설계된 경량 도구로, 성능 병목, 시스템 장애, 비효율성을 사전에 파악하는 데 도움이 됩니다.

고급 대시보드는 ClickHouse OSS(Open Source Software)와 Cloud 모두에서 사용할 수 있습니다. 이 글에서는 Cloud에서 고급 대시보드를 사용하는 방법을 설명합니다.


## 고급 대시보드에 액세스하기 \{#accessing-the-advanced-dashboard\}

고급 대시보드에 액세스하려면 다음 경로로 이동합니다:

* 왼쪽 사이드 패널
  * `Monitoring` → `Advanced dashboard`

<Image img={AdvancedDashboard} size="lg" alt="고급 대시보드"/>

## 네이티브 고급 대시보드에 접근하기 \{#accessing-the-native-advanced-dashboard\}

네이티브 고급 대시보드는 다음 경로로 이동하여 접근할 수 있습니다:

* 왼쪽 패널
  * `Monitoring` → `Advanced dashboard`
  * 「You can still access the native advanced dashboard.」 클릭

이렇게 하면 새 탭에서 네이티브 고급 대시보드가 열립니다. 대시보드에 접근하려면
인증을 완료해야 합니다.

<Image img={NativeAdvancedDashboard} size="lg" alt="Advanced dashboard"/>

각 시각화에는 해당 시각화에 표시할 데이터를 채우는 SQL 쿼리가 연결되어 있습니다.
펜 아이콘을 클릭하여 이 쿼리를 수정할 수 있습니다.

<Image img={EditVisualization} size="lg" alt="Advanced dashboard"/>

## 기본 제공 시각화 \{#out-of-box-visualizations\}

Advanced Dashboard의 기본 차트는 ClickHouse 시스템에 대한 실시간
가시성을 제공하도록 설계되어 있습니다. 아래는 각 차트에 대한 설명이 포함된
목록입니다. 차트는 탐색하기 쉽도록 세 가지 범주로 묶여 있습니다.

### ClickHouse 전용 \{#clickhouse-specific\}

다음 메트릭은 ClickHouse 인스턴스의 상태와 성능을 모니터링하도록 설계되었습니다.

| Metric                    | Description                                                                                         |
|---------------------------|-----------------------------------------------------------------------------------------------------|
| Queries Per Second        | 처리되는 쿼리의 초당 처리 속도를 추적합니다                                                         |
| Selected Rows/Sec         | 쿼리가 초당 읽는 행 수를 나타냅니다                                                                 |
| Inserted Rows/Sec         | 데이터 삽입(수집) 속도를 측정합니다                                                                 |
| Total MergeTree Parts     | MergeTree 테이블에서 활성 파트 수를 보여 주어, 배치되지 않은 INSERT 작업을 식별하는 데 도움이 됩니다 |
| Max Parts for Partition   | 어느 파티션에서든 존재하는 파트의 최대 개수를 보여 줍니다                                           |
| Queries Running           | 현재 실행 중인 쿼리 수를 표시합니다                                                                 |
| Selected Bytes Per Second | 쿼리가 초당 읽는 데이터 양을 나타냅니다                                                             |

### 시스템 상태 관련 지표 \{#system-health-specific\}

ClickHouse 자체를 모니터링하는 것 못지않게, 기반 시스템을 모니터링하는 것도 중요합니다.

| Metric                    | Description                                                                  |
|---------------------------|------------------------------------------------------------------------------|
| IO Wait                   | I/O 대기 시간을 추적합니다                                                   |
| CPU Wait                  | CPU 자원 경합으로 인한 지연을 측정합니다                                    |
| Read From Disk            | 디스크 또는 블록 디바이스에서 읽은 바이트 수를 추적합니다                  |
| Read From Filesystem      | 페이지 캐시를 포함하여 파일 시스템에서 읽은 바이트 수를 추적합니다         |
| Memory (tracked, bytes)   | ClickHouse가 추적하는 프로세스의 메모리 사용량을 표시합니다                |
| Load Average (15 minutes) | 시스템의 현재 15분 평균 부하(load average)를 표시합니다                    |
| OS CPU Usage (Userspace)  | 사용자 공간(userspace) 코드 실행 시 CPU 사용량을 나타냅니다                |
| OS CPU Usage (Kernel)     | 커널 코드 실행 시 CPU 사용량을 나타냅니다                                   |

## ClickHouse Cloud 전용 지표 \{#clickhouse-cloud-specific\}

ClickHouse Cloud는 객체 스토리지(S3 타입)를 사용하여 데이터를 저장합니다. 이 인터페이스를 모니터링하면 문제를 탐지하는 데 도움이 됩니다.

| Metric                         | Description                                                       |
|--------------------------------|-------------------------------------------------------------------|
| S3 Read wait                   | S3에 대한 읽기 요청 지연 시간을 측정합니다                       |
| S3 read errors per second      | 초당 읽기 오류 발생률을 추적합니다                               |
| Read From S3 (bytes/sec)       | S3 스토리지에서 초당 읽히는 데이터 양을 추적합니다               |
| Disk S3 write req/sec          | S3 스토리지에 대한 쓰기 작업 빈도를 모니터링합니다               |
| Disk S3 read req/sec           | S3 스토리지에 대한 읽기 작업 빈도를 모니터링합니다               |
| Page cache hit rate            | 페이지 캐시의 히트율을 나타냅니다                                |
| Filesystem cache hit rate      | 파일 시스템 캐시의 히트율을 나타냅니다                           |
| Filesystem cache size          | 현재 파일 시스템 캐시 크기를 나타냅니다                          |
| Network send bytes/sec         | 현재 수신 네트워크 트래픽 속도를 추적합니다                      |
| Network receive bytes/sec      | 현재 발신 네트워크 트래픽 속도를 추적합니다                      |
| Concurrent network connections | 현재 동시 네트워크 연결 수를 추적합니다                          |

## 고급 대시보드를 사용한 문제 식별 \{#identifying-issues-with-the-advanced-dashboard\}

ClickHouse 서비스의 상태를 실시간으로 확인하면, 문제가 비즈니스에 영향을 미치기 전에 사전에 대응하거나 발생한 문제를 해결하는 데 큰 도움이 됩니다. 아래는 고급 대시보드를 사용해 식별할 수 있는 몇 가지 문제 유형입니다.

### Unbatched inserts \{#unbatched-inserts\}

[모범 사례 문서](/best-practices/selecting-an-insert-strategy#batch-inserts-if-synchronous)에 설명된 것처럼, 가능한 경우에는 항상 동기 방식으로
데이터를 ClickHouse에 대량(batch) insert하는 것이 권장됩니다.

적절한 배치 크기의 대량 insert는 수집(ingestion) 중에 생성되는 파트 수를 줄여
디스크에 더 효율적으로 쓰고, 머지(merge) 연산을 줄이는 데 도움이 됩니다.

비효율적인 insert를 찾아내기 위한 핵심 지표는 **Inserted Rows/sec** 및 
**Max Parts for Partition**입니다.

<Image img={InsertedRowsSec} size="lg" alt="배치되지 않은 insert"/>

위 예시는 13시와 14시 사이에 **Inserted Rows/sec** 및 **Max Parts for Partition**에
두 번의 스파이크가 발생하는 모습을 보여줍니다. 이는 합리적인 속도로 데이터를
수집하고 있음을 나타냅니다.

그다음 16시 이후에 **Max Parts for Partition**에 또 한 번 큰 스파이크가 나타나지만
**Inserted Rows/sec 속도**는 매우 느립니다. 데이터 양은 매우 적은데 많은 파트가
생성되고 있으며, 이는 파트 크기가 최적이 아님을 나타냅니다.

### 리소스를 많이 사용하는 쿼리 \{#resource-intensive-query\}

CPU나 메모리처럼 많은 양의 리소스를 사용하는 SQL 쿼리를 실행하는 것은 일반적입니다. 그러나 이러한 쿼리를 모니터링하고, 배포 환경의 전체 성능에 미치는 영향을 이해하는 것이 중요합니다.

쿼리 처리량에 변화가 없는데 리소스 사용량이 갑자기 변한다면 더 비용이 많이 드는 쿼리가 실행되고 있음을 나타낼 수 있습니다. 실행 중인 쿼리 유형에 따라 이는 예상된 현상일 수 있지만, 고급 대시보드에서 이를 식별할 수 있으면 유용합니다.

아래는 초당 실행되는 쿼리 수가 크게 변하지 않은 상태에서 CPU 사용량이 급격히 치솟은 예시입니다.

<Image img={ResourceIntensiveQuery} size="lg" alt="리소스를 많이 사용하는 쿼리"/>

### 잘못된 기본 키 설계 \{#bad-primary-key-design\}

고급 대시보드를 사용하면 또 다른 문제인 잘못된 기본 키 설계를 찾아낼 수 있습니다.
[「ClickHouse의 기본 인덱스에 대한 실용적인 소개」](/guides/best-practices/sparse-primary-indexes#a-table-with-a-primary-key)에 설명된 것처럼,
사용 사례에 가장 잘 맞는 기본 키를 선택하면 ClickHouse가 쿼리를 실행하기 위해
읽어야 하는 행 수를 줄여 성능을 크게 향상할 수 있습니다.

기본 키에서 개선 가능성을 파악하는 데 참고할 수 있는 지표 중 하나는
**Selected Rows per second**입니다. 선택된 행 수가 갑자기 급증하면, 전체 쿼리 처리량이
전반적으로 증가했음을 의미할 수도 있고, 특정 쿼리가 실행을 위해
매우 많은 행을 선택하고 있음을 나타낼 수도 있습니다.

<Image img={SelectedRowsPerSecond} size="lg" alt="리소스를 많이 사용하는 쿼리" />

타임스탬프를 필터로 사용하여, 피크가 발생한 시점에 실행된 쿼리를
`system.query_log` 테이블에서 찾을 수 있습니다.

예를 들어, 특정 날짜의 오전 11시부터 오전 11시 사이에 실행된 모든 쿼리를
조회하는 쿼리를 실행하여 어떤 쿼리가 너무 많은 행을 읽고 있는지 파악할 수 있습니다.

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

이 예제에서는 동일한 쿼리가 두 테이블 `amazon_reviews_no_pk`와 `amazon_reviews_pk`에 대해 실행되고 있음을 볼 수 있습니다. 따라서 누군가 테이블 `amazon_reviews`에 대해 기본 키 옵션을 테스트하고 있었음을 알 수 있습니다.
