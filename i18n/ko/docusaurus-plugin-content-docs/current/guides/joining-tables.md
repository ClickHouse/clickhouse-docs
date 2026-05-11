---
title: "ClickHouse에서 JOIN 사용하기"
description: "ClickHouse에서 테이블을 조인하는 방법"
keywords: ["조인", "테이블 조인"]
slug: /ko/guides/joining-tables
doc_type: "guide"
---

import Image from "@theme/IdealImage"
import joins_1 from "@site/static/images/guides/joins-1.png"
import joins_2 from "@site/static/images/guides/joins-2.png"
import joins_3 from "@site/static/images/guides/joins-3.png"
import joins_4 from "@site/static/images/guides/joins-4.png"
import joins_5 from "@site/static/images/guides/joins-5.png"

ClickHouse는 [완전한 `JOIN` 지원](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)을 제공하며, 다양한 조인 알고리즘을 선택할 수 있습니다. 성능을 최대화하려면 이 가이드에 나열된 조인 최적화 권장 사항을 따르시기 바랍니다.

* 최적의 성능을 위해서는, 특히 밀리초 단위의 응답 성능이 요구되는 실시간 분석 워크로드에서 쿼리 내 `JOIN` 수를 줄이는 것을 목표로 해야 합니다. 하나의 쿼리에서 조인은 최대 3~4개 정도로 제한할 것을 권장합니다. [데이터 모델링 섹션](/data-modeling/schema-design)에서는 비정규화, 딕셔너리, materialized view 등을 활용해 조인을 최소화하는 다양한 방법을 자세히 설명합니다.
* ClickHouse 24.12 기준으로, 쿼리 플래너는 성능 최적화를 위해 두 테이블 간 조인에서 더 작은 테이블이 오른쪽에 오도록 자동으로 조인 순서를 재조정합니다. ClickHouse 25.9 버전에서는 세 개 이상의 테이블을 조인하는 쿼리 전반에 걸쳐 조인 순서를 최적화하도록 이 기능이 확장되었습니다.
* 쿼리에서 아래 예시와 같이 `LEFT ANY JOIN`과 같은 직접 조인이 필요한 경우에는, 가능하다면 [딕셔너리](/dictionary)를 사용하는 것을 권장합니다.

<Image img={joins_1} size="sm" alt="LEFT ANY JOIN" />

* inner 조인을 수행하는 경우, `IN` 절을 사용한 서브쿼리로 작성하는 것이 종종 더 효율적입니다. 다음 쿼리들은 기능적으로 동일합니다. 둘 다 질문에서는 ClickHouse를 언급하지 않지만 `comments`에서는 언급하는 `posts`의 개수를 구합니다.

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

카르테시안 곱(cartesian product)을 원하지 않으므로, 즉 각 게시물에 대해 하나의 일치 항목만 필요하므로 단순한 `INNER` 조인이 아닌 `ANY INNER JOIN`을 사용합니다.

이 조인은 서브쿼리를 사용하여 다시 작성할 수 있으며, 성능을 크게 향상시킵니다:

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

ClickHouse는 모든 조인 절과 하위 쿼리에 조건을 푸시다운하려고 시도하지만, 가능한 모든 하위 절에 조건을 수동으로 적용하여 `JOIN`할 데이터의 크기를 최소화할 것을 권장합니다. 아래 예시는 2020년 이후 Java 관련 게시물의 추천 수를 계산합니다.

큰 테이블을 왼쪽에 배치한 단순한 쿼리는 56초 만에 완료됩니다:

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

이 조인의 순서를 재구성하면 성능이 크게 향상되어 1.5초로 줄어듭니다:

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

왼쪽 테이블에 필터를 추가하면 성능이 더 향상되어 0.5초까지 단축됩니다.

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

앞서 언급했듯이, `INNER JOIN`을 서브쿼리로 옮기고 외부 쿼리와 내부 쿼리 모두에 필터를 유지하면 이 쿼리를 한층 더 개선할 수 있습니다.

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


## JOIN 알고리즘 선택 \{#choosing-a-join-algorithm\}

ClickHouse는 여러 [조인 알고리즘](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)을 지원합니다. 이러한 알고리즘은 일반적으로 메모리 사용량과 성능 사이에서 트레이드오프 관계에 있습니다. 아래에서는 상대적인 메모리 사용량과 실행 시간을 기준으로 ClickHouse 조인 알고리즘을 개괄적으로 설명합니다.

<br />

<Image img={joins_2} size="lg" alt="조인의 메모리 사용량 대비 속도"/>

<br />

이러한 알고리즘은 조인 쿼리가 계획되고 실행되는 방식을 결정합니다. 기본적으로 ClickHouse는 사용된 조인 유형, 엄격도, 그리고 조인된 테이블의 엔진에 따라 direct 또는 hash 조인 알고리즘을 사용합니다. 또한 ClickHouse를 설정하여 리소스 가용성과 사용량에 따라 런타임에 사용할 조인 알고리즘을 적응적으로 선택하고 동적으로 변경하도록 구성할 수도 있습니다. `join_algorithm=auto`인 경우 ClickHouse는 먼저 hash 조인 알고리즘을 시도하고, 해당 알고리즘의 메모리 한도가 초과되면 실행 중에 알고리즘을 partial merge join으로 전환합니다. 어떤 알고리즘이 선택되었는지는 트레이스 로깅을 통해 확인할 수 있습니다. 또한 ClickHouse에서는 `join_algorithm` 설정을 통해 원하는 조인 알고리즘을 직접 지정할 수도 있습니다.

각 조인 알고리즘에서 지원되는 `JOIN` 유형은 아래에 나와 있으며, 최적화를 수행하기 전에 고려해야 합니다.

<br />

<Image img={joins_3} size="lg" alt="조인 기능 비교"/>

<br />

각 `JOIN` 알고리즘에 대한 자세한 설명은 [여기](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2)에서 확인할 수 있으며, 장단점과 확장 특성도 포함되어 있습니다.

적절한 조인 알고리즘의 선택은 메모리 최적화를 중시하는지, 성능 최적화를 중시하는지에 따라 달라집니다.

## JOIN 성능 최적화 \{#optimizing-join-performance\}

최적화의 핵심 지표가 성능이고 조인을 가능한 한 빠르게 실행하려는 경우, 다음 결정 트리를 사용하여 적절한 조인 알고리즘을 선택할 수 있습니다:

<br />

<Image img={joins_4} size="lg" alt="조인 플로우차트"/>

<br />

- **(1)** 우측 테이블의 데이터를, 예를 들어 딕셔너리와 같은 인메모리 저지연 키-값 데이터 구조에 미리 적재할 수 있고, 조인 키가 해당 키-값 스토리지의 키 속성(key attribute)과 일치하며, `LEFT ANY JOIN` 의미론으로 충분하다면, **direct join**을 적용할 수 있으며 가장 빠른 접근 방식을 제공합니다.

- **(2)** 테이블의 [물리적 행 순서](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)가 조인 키의 정렬 순서와 일치하는 경우에는 선택이 다시 달라집니다. 이때 **full sorting merge join**은 정렬 단계를 [건너뛰어](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order) 메모리 사용량을 크게 줄이고, 데이터 크기와 조인 키 값 분포에 따라 일부 해시 조인 알고리즘보다 더 빠른 실행 시간을 제공합니다.

- **(3)** 우측 테이블이 **parallel hash join**의 [추가 메모리 사용 오버헤드](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#summary)를 포함하더라도 메모리에 들어갈 수 있다면, 이 알고리즘 또는 일반적인 hash join이 더 빠를 수 있습니다. 이는 데이터 크기, 데이터 타입, 조인 키 컬럼의 값 분포에 따라 달라집니다.

- **(4)** 우측 테이블이 메모리에 들어가지 않는다면, 이 경우에도 선택은 다시 상황에 따라 달라집니다. ClickHouse는 메모리 제약이 없는(non-memory bound) 세 가지 조인 알고리즘을 제공합니다. 이 세 알고리즘 모두 일시적으로 데이터를 디스크로 기록합니다. **Full sorting merge join**과 **partial merge join**은 사전에 데이터 정렬이 필요합니다. **Grace hash join**은 대신 데이터로부터 해시 테이블을 생성합니다. 데이터 양, 데이터 타입, 조인 키 컬럼의 값 분포에 따라, 데이터를 정렬하는 것보다 데이터로부터 해시 테이블을 생성하는 쪽이 더 빠른 경우도 있고, 그 반대의 경우도 있습니다.

Partial merge join은 큰 테이블을 조인할 때 메모리 사용량을 최소화하도록 최적화되어 있으며, 그 대가로 조인 속도가 상당히 느립니다. 특히 좌측 테이블의 물리적 행 순서가 조인 키의 정렬 순서와 일치하지 않는 경우에 그렇습니다.

Grace hash join은 세 가지 메모리 제약이 없는 조인 알고리즘 가운데 가장 유연하며, [grace_hash_join_initial_buckets](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759) 설정을 통해 메모리 사용량과 조인 속도 간의 균형을 잘 제어할 수 있습니다. 데이터 양에 따라, 두 알고리즘의 메모리 사용량이 대략 같아지도록 [버킷](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2) 수를 선택했을 때 grace hash가 partial merge 알고리즘보다 더 빠를 수도 있고 느릴 수도 있습니다. Grace hash join의 메모리 사용량을 full sorting merge의 메모리 사용량과 대략 일치하도록 설정한 경우, 테스트 실행에서는 항상 full sorting merge가 더 빨랐습니다.

세 가지 메모리 제약이 없는 알고리즘 가운데 어느 것이 가장 빠른지는 데이터 양, 데이터 타입, 그리고 조인 키 컬럼의 값 분포에 따라 달라집니다. 어떤 알고리즘이 가장 빠른지 판단하기 위해서는 현실적인 데이터 양과 실제에 가까운 데이터를 사용하여 벤치마크를 수행하는 것이 가장 좋습니다.

## 메모리 최적화 \{#optimizing-for-memory\}

조인의 실행 시간을 최대한 빠르게 하는 대신 메모리 사용량을 최소화하도록 최적화하려는 경우, 다음 의사결정 트리를 사용할 수 있습니다:

<br />

<Image img={joins_5} size="lg" alt="조인 메모리 최적화 의사결정 트리" />

<br />

- **(1)** 테이블의 물리적 행 순서가 조인 키 정렬 순서와 일치하는 경우, **full sorting merge join**의 메모리 사용량은 가능한 한 최소 수준입니다. 이때 정렬 단계가 [비활성화](https://clickhouse.com/blog/clickhouse-fully-supports-joins-full-sort-partial-merge-part3#utilizing-physical-row-order)되므로 조인 속도 또한 우수하다는 추가적인 이점이 있습니다.
- **(2)** **grace hash join**은 많은 개수의 [버킷](https://clickhouse.com/blog/clickhouse-fully-supports-joins-hash-joins-part2#description-2)을 [설정](https://github.com/ClickHouse/ClickHouse/blob/23.5/src/Core/Settings.h#L759)하여 조인 속도를 희생하는 대신 매우 낮은 메모리 사용량으로 튜닝할 수 있습니다. **partial merge join**은 의도적으로 주 메모리 사용량을 적게 사용하도록 설계되었습니다. 외부 정렬이 활성화된 **full sorting merge join**은 일반적으로 partial merge join보다 더 많은 메모리를 사용하지만(행 순서가 키 정렬 순서와 일치하지 않는다고 가정할 때), 그 대가로 조인 실행 시간이 크게 개선됩니다.

위 내용에 대해 더 자세한 정보가 필요하면 다음 [블로그 시리즈](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)를 참고하시기 바랍니다.