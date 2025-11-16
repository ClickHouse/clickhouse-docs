---
'sidebar_position': 1
'slug': '/community-wisdom/performance-optimization'
'sidebar_label': '성능 최적화'
'doc_type': 'guide'
'keywords':
- 'performance optimization'
- 'query performance'
- 'database tuning'
- 'slow queries'
- 'memory optimization'
- 'cardinality analysis'
- 'indexing strategies'
- 'aggregation optimization'
- 'sampling techniques'
- 'database performance'
- 'query analysis'
- 'performance troubleshooting'
'title': '레슨 - 성능 최적화'
'description': '성능 최적화 전략의 실제 사례들'
---


# 성능 최적화: 커뮤니티 검증된 전략 {#performance-optimization}
*이 가이드는 커뮤니티 모임에서 얻은 발견 사항 모음의 일부입니다. 더 많은 현실 세계 솔루션과 통찰력을 원하시면 [특정 문제별로 탐색해 보세요](./community-wisdom.md).*
*물리화된 뷰에 문제가 있으신가요? [물리화된 뷰](./materialized-views.md) 커뮤니티 통찰력 가이드를 확인해 보세요.*
*쿼리가 느리고 더 많은 예시를 원하시면, [쿼리 최적화](/optimize/query-optimization) 가이드도 있습니다.*

## 기본 키에 따른 정렬 (최소에서 최대) {#cardinality-ordering}
ClickHouse의 기본 인덱스는 저카디널리티(카디널리가 낮은) 컬럼이 먼저 오면 가장 잘 작동하며, 이를 통해 많은 데이터 블록을 효율적으로 건너뛸 수 있습니다. 키 뒤쪽의 고카디널리티 컬럼은 이러한 블록 내에서 세밀한 정렬을 제공합니다. 고유 값이 적은 컬럼(예: status, category, country)으로 시작하고, 고유 값이 많은 컬럼(예: user_id, timestamp, session_id)으로 끝내세요.

카디널리티와 기본 인덱스에 대한 더 많은 문서를 확인해 보세요:
- [기본 키 선택하기](/best-practices/choosing-a-primary-key)
- [기본 인덱스](/primary-indexes)

## 시간의 세분성이 중요하다 {#time-granularity}
ORDER BY 절에서 타임스탬프를 사용할 때는 카디널리티와 정밀도의 균형을 고려해야 합니다. 마이크로초 정밀도의 타임스탬프는 매우 높은 카디널리티(거의 행당 하나의 고유 값)를 생성하여 ClickHouse의 스파스 기본 인덱스의 효과를 감소시킵니다. 반면에 반올림된 타임스탬프는 낮은 카디널리티를 생성하여 더 나은 인덱스 건너뛰기를 가능하게 하지만, 시간 기반 쿼리에 대한 정밀도를 잃게 됩니다.

```sql runnable editable
-- Challenge: Try different time functions like toStartOfMinute or toStartOfWeek
-- Experiment: Compare the cardinality differences with your own timestamp data
SELECT 
    'Microsecond precision' as granularity,
    uniq(created_at) as unique_values,
    'Creates massive cardinality - bad for sort key' as impact
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL
SELECT 
    'Hour precision',
    uniq(toStartOfHour(created_at)),
    'Much better for sort key - enables skip indexing'
FROM github.github_events
WHERE created_at >= '2024-01-01'
UNION ALL  
SELECT 
    'Day precision',
    uniq(toStartOfDay(created_at)),
    'Best for reporting queries'
FROM github.github_events
WHERE created_at >= '2024-01-01';
```

## 평균이 아닌 개별 쿼리에 집중하기 {#focus-on-individual-queries-not-averages}

ClickHouse 성능을 디버깅할 때 평균 쿼리 시간이나 전체 시스템 메트릭에 의존하지 마세요. 대신, 특정 쿼리가 느린 이유를 식별하세요. 시스템은 평균 성능이 좋을 수 있지만, 개별 쿼리는 메모리 고갈, 잘못된 필터링 또는 고카디널리티 작업으로 고통받을 수 있습니다.

ClickHouse의 CTO인 Alexey에 따르면: *"올바른 방법은 '왜 이 특정 쿼리가 5초 만에 처리되었는가?'라고 스스로에게 질문하는 것입니다... 나는 중앙값이나 다른 쿼리가 빠르게 처리되는 것이 중요하지 않습니다. 나는 내 쿼리가 중요합니다."*

쿼리가 느릴 때 평균을 훑어보지 마세요. "왜 THIS 특정 쿼리가 느렸던가?"라고 물어보고 실제 자원 사용 패턴을 살펴보세요.

## 메모리 및 행 스캔 {#memory-and-row-scanning}

Sentry는 400만 명 이상의 개발자로부터 매일 수십억 개의 이벤트를 처리하는 개발 중심의 오류 추적 플랫폼입니다. 그들의 주요 통찰력: *"이 특정 상황에서 메모리를 유발하는 그룹화 키의 카디널리티"* - 고카디널리티 집계는 행 스캔이 아니라 메모리 고갈을 통해 성능을 저하시킵니다.

쿼리가 실패할 경우, 메모리 문제(너무 많은 그룹)인지 스캔 문제(너무 많은 행)인지 확인하세요.

쿼리 `GROUP BY user_id, error_message, url_path`는 세 가지 값의 모든 고유 조합에 대해 별도의 메모리 상태를 생성합니다. 사용자 수, 오류 유형 및 URL 경로가 많아질수록 동시에 메모리에 보관해야 할 집계 상태가 수백만 개가 될 수 있습니다.

극단적인 경우에 대해 Sentry는 결정론적 샘플링을 사용합니다. 10% 샘플은 대부분의 집계에 대해 약 5%의 정밀도를 유지하면서 메모리 사용량을 90% 줄입니다:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

이렇게 하면 동일한 사용자가 모든 쿼리에 나타나, 시간대에 걸쳐 일관된 결과를 제공합니다. 핵심 통찰력: `cityHash64()`는 동일한 입력에 대해 일관된 해시 값을 생성하므로, `user_id = 12345`는 항상 동일한 값으로 해시되어, 사용자가 10% 샘플에 항상 나타나거나 절대 나타나지 않게 되며, 쿼리 간 깜박임이 없습니다.

## Sentry의 비트 마스크 최적화 {#bit-mask-optimization}

고카디널리티 컬럼(예: URL)로 집계할 때, 각 고유 값은 메모리에서 별도의 집계 상태를 생성해 메모리 고갈을 초래합니다. Sentry의 해결책: 실제 URL 문자열로 그룹화하는 대신 비트 마스크로 축소되는 부울 표현식으로 그룹화합니다.

이와 같은 상황이라면, 아래 쿼리를 자신의 테이블에서 시도해 보세요:

```sql
-- Memory-Efficient Aggregation Pattern: Each condition = one integer per group
-- Key insight: sumIf() creates bounded memory regardless of data volume
-- Memory per group: N integers (N * 8 bytes) where N = number of conditions

SELECT 
    your_grouping_column,

    -- Each sumIf creates exactly one integer counter per group
    -- Memory stays constant regardless of how many rows match each condition
    sumIf(1, your_condition_1) as condition_1_count,
    sumIf(1, your_condition_2) as condition_2_count,
    sumIf(1, your_text_column LIKE '%pattern%') as pattern_matches,
    sumIf(1, your_numeric_column > threshold_value) as above_threshold,

    -- Complex multi-condition aggregations still use constant memory
    sumIf(1, your_condition_1 AND your_text_column LIKE '%pattern%') as complex_condition_count,

    -- Standard aggregations for context
    count() as total_rows,
    avg(your_numeric_column) as average_value,
    max(your_timestamp_column) as latest_timestamp

FROM your_schema.your_table
WHERE your_timestamp_column >= 'start_date' 
  AND your_timestamp_column < 'end_date'
GROUP BY your_grouping_column
HAVING condition_1_count > minimum_threshold 
   OR condition_2_count > another_threshold
ORDER BY (condition_1_count + condition_2_count + pattern_matches) DESC
LIMIT 20
```

매우 고유한 각 문자열을 메모리에 저장하는 대신, 해당 문자열에 대한 질문의 답을 정수로 저장하고 있습니다. 데이터 다양성과 관계없이 집계 상태는 제한되며 작아집니다.

Sentry 엔지니어링 팀에서: "이러한 무거운 쿼리는 10배 이상 빠르고, 우리의 메모리 사용량은 100배 낮아졌습니다(더 중요한 것은, 제한되어 있다는 점입니다). 우리의 가장 큰 고객은 이제 재생 검색 중 오류를 겪지 않으며, 우리는 메모리가 부족해지는 일 없이 임의의 크기의 고객을 지원할 수 있습니다."

## 비디오 소스 {#video-sources}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - 메모리 최적화에 대한 Sentry의 생산 교훈
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - 디버깅 방법론에 대한 Alexey Milovidov
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - 커뮤니티 최적화 전략

**다음 읽기**:
- [쿼리 최적화 가이드](/optimize/query-optimization)
- [물리화된 뷰 커뮤니티 통찰력](./materialized-views.md)
