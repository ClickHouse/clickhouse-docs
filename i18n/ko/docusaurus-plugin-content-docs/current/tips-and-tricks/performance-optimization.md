---
sidebar_position: 1
slug: /community-wisdom/performance-optimization
sidebar_label: '성능 최적화'
doc_type: 'guide'
keywords: [
  '성능 최적화',
  '쿼리 성능',
  '데이터베이스 튜닝',
  '느린 쿼리',
  '메모리 최적화',
  '카디널리티 분석',
  '인덱싱 전략',
  '집계 최적화',
  '샘플링 기법',
  '데이터베이스 성능',
  '쿼리 분석',
  '성능 문제 해결'
]
title: '사례 - 성능 최적화'
description: '성능 최적화 전략의 실제 사례'
---

# 성능 최적화: 커뮤니티가 검증한 전략 \{#performance-optimization\}

*이 가이드는 커뮤니티 밋업 행사에서 얻은 인사이트를 모아 정리한 컬렉션의 일부입니다. 더 많은 실제 사례 기반 해결책과 인사이트는 [문제 유형별로 찾아보기](./community-wisdom.md)를 참고하십시오.*
*materialized view 사용에 어려움이 있다면 [Materialized Views](./materialized-views.md) 커뮤니티 인사이트 가이드를 확인하십시오.*
*쿼리 성능 저하를 겪고 있고 더 많은 예제가 필요하다면 [Query Optimization](/optimize/query-optimization) 가이드도 참고하십시오.*

## 카디널리티 순서대로 정렬하기 (낮은 카디널리티 → 높은 카디널리티) \{#cardinality-ordering\}

ClickHouse의 기본 인덱스(primary index)는 카디널리티가 낮은 컬럼이 먼저 올 때 가장 잘 동작하며, 이렇게 하면 큰 데이터 청크를 효율적으로 건너뛸 수 있습니다. 키 뒤쪽에 위치한 높은 카디널리티 컬럼은 해당 청크 내부에서 세밀한 정렬을 제공합니다. 고유 값이 적은 컬럼(예: status, category, country)부터 시작하고, 고유 값이 많은 컬럼(예: user_id, timestamp, session_id)으로 끝나도록 설계하십시오.

카디널리티 및 기본 인덱스에 대한 자세한 내용은 다음 문서를 참고하십시오.

- [기본 키 선택하기](/best-practices/choosing-a-primary-key)
- [기본 인덱스](/primary-indexes)

## 시간 세분성이 중요합니다 \{#time-granularity\}

ORDER BY 절에서 타임스탬프를 사용할 때는 카디널리티와 정밀도 간의 상충 관계를 고려해야 합니다. 마이크로초 단위 정밀 타임스탬프는 매우 높은 카디널리티(거의 행마다 하나의 고유 값)를 만들어 ClickHouse의 희소 기본 인덱스 효율을 떨어뜨립니다. 반면 반올림된 타임스탬프는 더 낮은 카디널리티를 만들어 인덱스 스키핑(index skipping)을 더 잘 활용할 수 있게 해 주지만, 시간 기반 쿼리의 정밀도는 떨어지게 됩니다.

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


## 평균이 아닌 개별 쿼리에 집중하십시오 \{#focus-on-individual-queries-not-averages\}

ClickHouse 성능을 디버깅할 때는 평균 쿼리 시간이나 전체 시스템 메트릭에 의존하지 마십시오. 대신 왜 특정 쿼리가 느린지 파악해야 합니다. 전체적으로 평균 성능은 좋아 보이더라도, 개별 쿼리는 메모리 고갈, 비효율적인 필터링, 높은 카디널리티 연산 때문에 성능 저하를 겪을 수 있습니다.

ClickHouse CTO인 Alexey에 따르면: *「올바른 방법은 왜 이 특정 쿼리가 5초가 걸렸는지를 스스로에게 묻는 것입니다... 중앙값이나 다른 쿼리가 빨리 처리되는지는 신경 쓰지 않습니다. 저는 제 쿼리만 신경 씁니다」*

쿼리가 느릴 때는 평균만 보지 마십시오. 「왜 바로 이 특정 쿼리가 느렸는가?」라고 스스로 질문하고 실제 리소스 사용 패턴을 살펴보십시오.

## 메모리와 행 스캐닝 \{#memory-and-row-scanning\}

Sentry는 400만 명 이상의 개발자로부터 매일 수십억 개의 이벤트를 처리하는 개발자 중심 오류 추적 플랫폼입니다. 이들이 얻은 핵심 통찰은 다음과 같습니다: *「이 특정 상황에서 메모리 사용량을 결정하는 것은 그룹화 키의 카디널리티이다」* - 카디널리티가 높은 집계는 행 스캐닝이 아니라 메모리 고갈을 통해 성능을 저하시킵니다.

쿼리가 실패할 때, 메모리 문제(그룹이 너무 많음)인지 스캐닝 문제(행이 너무 많음)인지 판단해야 합니다.

`GROUP BY user_id, error_message, url_path`와 같은 쿼리는 이 세 값의 모든 고유 조합마다 개별 메모리 상태를 생성합니다. 사용자 수, 오류 유형, URL 경로가 늘어나면, 동시에 메모리에 유지해야 하는 집계 상태가 수백만 개까지 쉽게 증가할 수 있습니다.

극단적인 경우, Sentry는 결정론적 샘플링을 사용합니다. 10% 샘플은 대부분의 집계에서 약 5% 정도의 정확도를 유지하면서 메모리 사용량을 90% 줄여 줍니다:

```sql
WHERE cityHash64(user_id) % 10 = 0  -- Always same 10% of users
```

이렇게 하면 모든 쿼리에서 동일한 사용자가 나타나 각 기간에 걸쳐 일관된 결과를 얻을 수 있습니다. 핵심은 `cityHash64()`가 동일한 입력에 대해 항상 동일한 해시 값을 생성한다는 점입니다. 따라서 `user_id = 12345`는 항상 같은 값으로 해시되며, 해당 사용자는 10% 샘플에 항상 포함되거나 아예 포함되지 않게 되어 쿼리마다 포함 여부가 변동되는 일이 없습니다.


## Sentry의 비트 마스크 최적화 \{#bit-mask-optimization\}

고카디널리티 컬럼(예: URL)으로 집계할 때는 각 고유 값마다 메모리에서 별도의 집계 상태가 생성되어, 메모리 고갈로 이어질 수 있습니다. Sentry의 해결책은 실제 URL 문자열로 그룹화하는 대신, 비트 마스크로 압축되는 불리언 표현식으로 그룹화하는 방식입니다.

다음은 이 상황이 사용 중인 테이블에도 해당되는 경우 직접 시도해 볼 수 있는 쿼리입니다:

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

모든 고유한 문자열을 메모리에 저장하는 대신, 해당 문자열에 대한 질문의 답을 정수로 저장하는 방식입니다. 데이터 다양성과 관계없이 집계 상태는 상한이 있는 아주 작은 크기로 유지됩니다.

Sentry 엔지니어링 팀에 따르면 다음과 같습니다. 「이러한 부하가 큰 쿼리는 이제 10배 이상 빨라졌고, 메모리 사용량은 100배 줄어들었습니다(그리고 더 중요하게는, 상한이 명확해졌습니다). 가장 큰 고객사에서도 더 이상 리플레이(replay)를 검색할 때 오류가 발생하지 않으며, 이제는 메모리 부족 없이 임의의 규모의 고객을 지원할 수 있습니다。」


## 동영상 자료 \{#video-sources\}

- [Lost in the Haystack - Optimizing High Cardinality Aggregations](https://www.youtube.com/watch?v=paK84-EUJCA) - Sentry 프로덕션 환경에서의 메모리 최적화 사례
- [ClickHouse Performance Analysis](https://www.youtube.com/watch?v=lxKbvmcLngo) - Alexey Milovidov의 디버깅 방법론
- [ClickHouse Meetup: Query Optimization Techniques](https://www.youtube.com/watch?v=JBomQk4Icjo) - 커뮤니티에서 검증된 최적화 전략

**다음 문서**:

- [쿼리 최적화 가이드](/optimize/query-optimization)
- [구체화된 뷰(Materialized View) 커뮤니티 인사이트](./materialized-views.md)