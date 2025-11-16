---
'title': 'Using JOINs in ClickHouse'
'description': 'ClickHouse에서 테이블을 조인하는 방법'
'keywords':
- 'joins'
- 'join tables'
'slug': '/guides/joining-tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import joins_1 from '@site/static/images/guides/joins-1.png';
import joins_2 from '@site/static/images/guides/joins-2.png';
import joins_3 from '@site/static/images/guides/joins-3.png';
import joins_4 from '@site/static/images/guides/joins-4.png';
import joins_5 from '@site/static/images/guides/joins-5.png';

ClickHouse는 [전체 `JOIN` 지원](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)을 제공하며, 다양한 조인 알고리즘을 선택할 수 있습니다. 성능을 극대화하기 위해, 이 가이드에 나열된 조인 최적화 제안 사항을 따르는 것을 권장합니다.

- 최적의 성능을 위해 사용자는 쿼리에서 `JOIN` 수를 줄이는 것을 목표로 해야 하며, 특히 밀리초 성능이 요구되는 실시간 분석 작업의 경우에 더 그렇습니다. 쿼리에서 최대 3~4개의 조인을 목표로 하세요. [데이터 모델링 섹션](/data-modeling/schema-design)에서는 비정규화, 딕셔너리, 물리화된 뷰를 포함하여 조인을 최소화하는 여러 가지 변경 사항을 자세히 설명합니다.
- 현재 ClickHouse는 조인의 순서를 재배열하지 않습니다. 항상 작은 테이블이 조인의 오른쪽에 위치하도록 하세요. 이것은 대부분의 조인 알고리즘의 경우 메모리에 저장되며 쿼리의 메모리 오버헤드를 최소화하는 데 도움이 됩니다.
- 쿼리에서 직접 조인, 즉 `LEFT ANY JOIN`이 필요한 경우 아래와 같이 가능한 경우 [Dictionaries](/dictionary)를 사용하는 것을 권장합니다.

<Image img={joins_1} size="sm" alt="Left any join"/>

- 내부 조인을 수행하는 경우, 이를 `IN` 절을 사용한 하위 쿼리로 작성하는 것이 종종 더 최적입니다. 다음 쿼리를 고려해 보세요. 두 쿼리는 기능적으로 동등합니다. 둘 다 질문에서 ClickHouse를 언급하지 않지만 `comments`에서는 언급하는 `posts`의 수를 찾습니다.

```sql
SELECT count()
FROM stackoverflow.posts AS p
ANY INNER `JOIN` stackoverflow.comments AS c ON p.Id = c.PostId
WHERE (p.Title != '') AND (p.Title NOT ILIKE '%clickhouse%') AND (p.Body NOT ILIKE '%clickhouse%') AND (c.Text ILIKE '%clickhouse%')

┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 8.209 sec. Processed 150.20 million rows, 56.05 GB (18.30 million rows/s., 6.83 GB/s.)
Peak memory usage: 1.23 GiB.
```

우리는 카르테시안 곱을 원하지 않기 때문에 `INNER` 조인을 사용할 때 `ANY INNER JOIN`을 사용합니다. 즉, 각 포스트에 대해 하나의 일치만 원합니다.

이 조인은 하위 쿼리를 사용해 다시 작성할 수 있으며 성능이 크게 향상됩니다:

```sql
SELECT count()
FROM stackoverflow.posts
WHERE (Title != '') AND (Title NOT ILIKE '%clickhouse%') AND (Body NOT ILIKE '%clickhouse%') AND (Id IN (
        SELECT PostId
        FROM stackoverflow.comments
        WHERE Text ILIKE '%clickhouse%'
))
┌─count()─┐
│       86 │
└─────────┘

1 row in set. Elapsed: 2.284 sec. Processed 150.20 million rows, 16.61 GB (65.76 million rows/s., 7.27 GB/s.)
Peak memory usage: 323.52 MiB.
```

ClickHouse는 조인 절과 하위 쿼리의 모든 조건을 푸시 다운하려고 시도하지만, 가능한 모든 하위 절에 수동으로 조건을 적용할 것을 항상 권장합니다. 이는 `JOIN`할 데이터의 크기를 최소화하는 데 도움이 됩니다. 다음 예를 고려해 보세요. 여기서는 2020년 이후 Java 관련 게시물에 대한 찬성 투표 수를 계산하려고 합니다.

왼쪽에 큰 테이블이 있는 순진한 쿼리는 56초 만에 완료됩니다:

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.posts AS p
INNER JOIN stackoverflow.votes AS v ON p.Id = v.PostId
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 56.642 sec. Processed 252.30 million rows, 1.62 GB (4.45 million rows/s., 28.60 MB/s.)
```

이 조인을 재배열하면 성능이 극적으로 개선되어 1.5초가 됩니다:

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 1.519 sec. Processed 252.30 million rows, 1.62 GB (166.06 million rows/s., 1.07 GB/s.)
```

왼쪽 테이블에 필터를 추가하면 성능이 더욱 개선되어 0.5초가 됩니다.

```sql
SELECT countIf(VoteTypeId = 2) AS upvotes
FROM stackoverflow.votes AS v
INNER JOIN stackoverflow.posts AS p ON v.PostId = p.Id
WHERE has(arrayFilter(t -> (t != ''), splitByChar('|', p.Tags)), 'java') AND (p.CreationDate >= '2020-01-01') AND (v.CreationDate >= '2020-01-01')

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.597 sec. Processed 81.14 million rows, 1.31 GB (135.82 million rows/s., 2.19 GB/s.)
Peak memory usage: 249.42 MiB.
```

앞서 언급한 바와 같이 `INNER JOIN`을 하위 쿼리로 이동시켜 성능을 한층 더 향상시킬 수 있으며, 외부 및 내부 쿼리 모두에서 필터를 유지합니다.

```sql
SELECT count() AS upvotes
FROM stackoverflow.votes
WHERE (VoteTypeId = 2) AND (PostId IN (
        SELECT Id
        FROM stackoverflow.posts
        WHERE (CreationDate >= '2020-01-01') AND has(arrayFilter(t -> (t != ''), splitByChar('|', Tags)), 'java')
))

┌─upvotes─┐
│  261915 │
└─────────┘

1 row in set. Elapsed: 0.383 sec. Processed 99.64 million rows, 804.55 MB (259.85 million rows/s., 2.10 GB/s.)
Peak memory usage: 250.66 MiB.
```

## 조인 알고리즘 선택하기 {#choosing-a-join-algorithm}

ClickHouse는 여러 가지 [조인 알고리즘](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)을 지원합니다. 이러한 알고리즘은 일반적으로 성능을 위해 메모리 사용량을 희생하게 됩니다. 다음은 ClickHouse 조인 알고리즘에 대한 개요이며, 상대적인 메모리 소비 및 실행 시간에 기반합니다:

<br />

<Image img={joins_2} size="lg" alt="speed by memory for joins"/>

<br />

이러한 알고리즘은 조인 쿼리가 계획되고 실행되는 방식을 결정합니다. 기본적으로 ClickHouse는 사용된 조인 유형 및 조인된 테이블의 엄격성 및 엔진에 따라 직접 또는 해시 조인 알고리즘을 사용합니다. 또는 ClickHouse는 런타임에 리소스 가용성 및 사용에 따라 동적으로 조인 알고리즘을 선택하고 변경하도록 구성할 수 있습니다: `join_algorithm=auto`일 경우 ClickHouse는 먼저 해시 조인 알고리즘을 시도하고, 해당 알고리즘의 메모리 한도가 위반되면 알고리즘을 즉시 부분 병합 조인으로 전환합니다. 사용자가 선택한 알고리즘을 추적 로그를 통해 관찰할 수 있습니다. ClickHouse는 사용자가 `join_algorithm` 설정을 통해 원하는 조인 알고리즘을 직접 지정할 수 있도록 허용합니다.

각 조인 알고리즘에 대해 지원되는 `JOIN` 유형은 아래에 나와 있으며, 최적화 전에 고려해야 합니다:

<br />

<Image img={joins_3} size="lg" alt="join features"/>

<br />

각 `JOIN` 알고리즘에 대한 전체 설명은 [여기](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)에서 확인할 수 있으며, 장점, 단점 및 확장 속성이 포함되어 있습니다.

적절한 조인 알고리즘 선택은 메모리 또는 성능을 최적화하려는 목적에 따라 달라집니다.

## JOIN 성능 최적화 {#optimizing-join-performance}

핵심 최적화 기준이 성능이고 가능한 한 빠르게 조인을 실행하려는 경우, 올바른 조인 알고리즘을 선택하기 위해 다음 결정 나무를 사용할 수 있습니다:

<br />

<Image img={joins_4} size="lg" alt="join flowchart"/>

<br />

- **(1)** 오른쪽 테이블의 데이터가 인메모리 저지연 키-값 데이터 구조(예: 딕셔너리)에 미리 로드될 수 있고, 조인 키가 기본 키-값 저장소의 키 속성과 일치하며, `LEFT ANY JOIN` 의미가 적절하다면 **직접 조인**이 적용 가능하며 가장 빠른 접근 방식을 제공합니다.
  
- **(2)** 테이블의 [물리적 행 순서](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)가 조인 키 정렬 순서와 일치하는 경우, 이는 상황에 따라 다릅니다. 이 경우 **전체 정렬 병합 조인**은 정렬 단계를 [건너뛰고](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 메모리 사용량이 크게 줄어들며, 데이터 크기와 조인 키 값 분포에 따라 일부 해시 조인 알고리즘보다 더 빠른 실행 시간을 제공합니다.

- **(3)** 오른쪽 테이블이 메모리에 들어갈 수 있다면, [추가 메모리 사용 오버헤드](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)를 감안하더라도 **병렬 해시 조인** 알고리즘이나 해시 조인이 더 빠를 수 있습니다. 이는 데이터 크기, 데이터 유형 및 조인 키 컬럼의 값 분포에 따라 다릅니다.

- **(4)** 오른쪽 테이블이 메모리에 들어가지 않는다면 상황에 따라 다시 다릅니다. ClickHouse는 데이터가 디스크에 일시적으로 흘리면서 사용되는 세 가지 비메모리 구속 조인 알고리즘을 제공합니다. 이 세 가지 모두 데이터를 일시적으로 디스크로 흘립니다. **전체 정렬 병합 조인**과 **부분 병합 조인**은 데이터의 사전 정렬이 필요합니다. **Grace 해시 조인**은 데이터에서 해시 테이블을 만드는 대신 사용됩니다. 데이터 양, 데이터 유형 및 조인 키 컬럼의 값 분포에 따라 데이터에서 해시 테이블을 만드는 것이 데이터를 정렬하는 것보다 더 빠를 수 있는 시나리오가 있을 수 있습니다. 그리고 그 반대의 경우도 마찬가지입니다.

부분 병합 조인은 큰 테이블을 조인할 때 메모리 사용량을 최소화하기 위해 최적화되어 있으며, 조인 속도는 상당히 느립니다. 이는 특히 왼쪽 테이블의 물리적 행 순서가 조인 키 정렬 순서와 일치하지 않을 때 그렇습니다.

Grace 해시 조인은 세 가지 비메모리 구속 조인 알고리즘 중 가장 유연하며, [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 설정을 통해 메모리 사용량과 조인 속도를 잘 제어할 수 있습니다. 데이터 양에 따라 grace 해시가 부분 병합 알고리즘보다 더 빠르거나 느릴 수 있으며, 이는 [버킷](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)의 양이 두 알고리즘의 메모리 사용량이 대략 정렬되도록 선택되었을 때입니다. grace 해시 조인의 메모리 사용량이 전체 정렬 병합의 메모리 사용량과 대략 정렬되도록 구성되면, 전체 정렬 병합은 항상 우리의 테스트 실행에서 더 빠른 결과를 기록했습니다.

세 가지 비메모리 구속 조인 알고리즘 중 어느 것이 가장 빠른지는 데이터 양, 데이터 유형 및 조인 키 컬럼의 값 분포에 따라 달라집니다. 어떤 알고리즘이 가장 빠른지를 결정하기 위해 현실적인 데이터 양으로 몇 가지 벤치마크를 실행하는 것이 항상 최선입니다.

## 메모리 최적화 {#optimizing-for-memory}

조인을 가장 빠른 실행 시간 대신 최소 메모리 사용량으로 최적화하려는 경우, 이 결정 나무를 대신 사용할 수 있습니다:

<br />

<Image img={joins_5} size="lg" alt="Join memory optimization decision tree" />

<br />

- **(1)** 테이블의 물리적 행 순서가 조인 키 정렬 순서와 일치하는 경우, **전체 정렬 병합 조인**의 메모리 사용량은 최소로 낮아집니다. 정렬 단계가 [비활성화](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)되기 때문에 조인 속도도 좋습니다.
- **(2)** **Grace 해시 조인**은 조인 속도를 희생하는 대신 [구성](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)하여 매우 적은 메모리 사용량을 조정할 수 있습니다. **부분 병합 조인**은 의도적으로 주 메모리의 양을 적게 사용합니다. 외부 정렬이 활성화된 **전체 정렬 병합 조인**은 일반적으로 (행 순서가 키 정렬 순서와 일치하지 않는다고 가정할 때) 부분 병합 조인보다 더 많은 메모리를 사용하며, 조인 실행 시간이 훨씬 개선됩니다.

위에 언급된 내용에 대해 더 많은 세부 정보가 필요한 사용자는 다음 [블로그 시리즈](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)를 참고하시기 바랍니다.
