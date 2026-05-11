---
slug: /dictionary/best-practices
title: '딕셔너리 모범 사례'
sidebar_label: '모범 사례'
description: '딕셔너리 레이아웃 선택, 딕셔너리와 JOIN 중 언제 딕셔너리를 사용해야 하는지, 그리고 딕셔너리 사용량 모니터링에 대한 지침입니다.'
doc_type: 'guide'
keywords: ['dictionary', 'dictionaries', 'layout', 'dictGet', 'JOIN', 'hashed', 'flat', 'performance']
---

# 딕셔너리 모범 사례 \{#dictionary-best-practices\}

이 페이지에서는 적절한 딕셔너리 레이아웃을 선택하기 위한 실용적인 지침, 딕셔너리가 언제 JOIN보다 더 효과적이고 언제 그렇지 않은지, 그리고 딕셔너리 사용 현황을 모니터링하는 방법을 설명합니다.

예시와 함께 딕셔너리를 소개하는 내용은 [딕셔너리 기본 가이드](/dictionary)를 참조하십시오.

## 딕셔너리와 JOIN을 언제 사용할지 \{#when-to-use-dictionaries-vs-joins\}

딕셔너리는 JOIN의 한쪽이 메모리에 적재 가능한 조회 테이블일 때 가장 효과적입니다. 일반적인 JOIN에서는 ClickHouse가 먼저 오른쪽에서 해시 테이블을 만든 뒤, 왼쪽을 사용해 이를 조회합니다. 이후 대부분의 행이 `WHERE` 필터로 걸러지더라도 마찬가지입니다. 최근 버전(24.12+)에서는 많은 경우 필터를 JOIN 전에 적용하지만, 그렇다고 해서 오버헤드가 항상 없어지는 것은 아닙니다. 반면 딕셔너리에서는 `dictGet`을 인라인으로 호출하므로, 이미 필터링을 통과한 행에 대해서만 조회가 수행됩니다.

하지만 `dictGet`이 항상 적절한 선택은 아닙니다. 테이블에서 상당수의 행에 대해 `dictGet`을 호출해야 한다면(예: `dictGet('dict', 'elevation', id) > 1800`과 같은 `WHERE` 조건) 기본 인덱스를 사용할 수 있는 일반 컬럼이 더 적합할 수 있습니다. 일반 컬럼의 경우 ClickHouse는 `PREWHERE`를 사용해 그래뉼을 건너뛸 수 있지만, `dictGet`은 인덱스 지원 없이 행별로 평가됩니다.

경험칙은 다음과 같습니다.

* 조회 키를 이미 사용할 수 있는 작은 차원 테이블에 대한 JOIN을 대체할 때는 딕셔너리를 사용하십시오.
* 많은 행에서 조회된 값을 기준으로 필터링해야 할 때는 일반 컬럼과 인덱스를 사용하십시오.

## 레이아웃 선택하기 \{#choosing-a-layout\}

`LAYOUT` 절은 딕셔너리의 내부 데이터 구조를 제어합니다. 사용 가능한 모든 레이아웃은 [레이아웃 참조](/sql-reference/statements/create/dictionary/layouts#storing-dictionaries-in-memory)에 문서화되어 있습니다.

레이아웃을 선택할 때는 다음 지침을 따르십시오.

* **`flat`** — 가장 빠른 레이아웃입니다(단순 배열 오프셋 조회). 다만 키는 `UInt64`여야 하며, 기본적으로 500,000개(`max_array_size`)로 제한됩니다. 작거나 중간 규모의 테이블에서 단조롭게 증가하는 정수 키에 가장 적합합니다. 희소 키 분포(예: 키 값이 1과 500,000)에서는 배열 크기가 가장 큰 키를 기준으로 결정되므로 메모리가 낭비됩니다. 500k 제한에 도달한다면 `hashed_array`로 전환해야 할 신호입니다.
* **`hashed_array`** — 대부분의 사용 사례에 권장되는 기본 레이아웃입니다. 속성은 배열에 저장하고, 키를 배열 인덱스에 대응시키는 해시 테이블을 사용합니다. `hashed`와 거의 비슷한 속도를 제공하면서도, 특히 속성이 많을수록 메모리 효율이 더 높습니다.
* **`hashed`** — 전체 딕셔너리를 해시 테이블에 저장합니다. 속성이 매우 적을 때는 `hashed_array`보다 더 빠를 수 있지만, 속성 수가 늘어날수록 메모리 사용량도 증가합니다.
* **`complex_key_hashed` / `complex_key_hashed_array`** — 키를 `UInt64`로 CAST할 수 없을 때(예: `String` 키) 사용하십시오. 성능상 절충 관계는 복합 키가 아닌 대응 레이아웃과 동일합니다.
* **`sparse_hashed`** — `hashed`보다 메모리를 적게 사용하는 대신 CPU를 더 사용합니다. 최선의 선택인 경우는 드물며, 단일 속성만 있을 때에만 효율적입니다. 대부분의 경우 `hashed_array`가 더 적합합니다.
* **`cache` / `ssd_cache`** — 자주 액세스되는 키만 캐시합니다. 전체 데이터세트가 메모리에 들어가지 않을 때 유용하지만, 캐시 미스가 발생하면 조회 시 소스에 접근할 수 있습니다. 지연 시간에 민감한 워크로드에는 권장되지 않습니다.
* **`direct`** — 메모리 내 저장 없이 조회할 때마다 소스를 질의합니다. 데이터가 너무 자주 변경되어 캐시할 수 없거나 딕셔너리가 메모리에 담기에는 너무 클 때 사용하십시오.

## 딕셔너리 사용량 모니터링 \{#monitoring-dictionary-usage\}

[`system.dictionaries`](/operations/system-tables/dictionaries) 테이블을 통해 메모리 사용량과 상태를 확인할 수 있습니다:

```sql
SELECT
    name,
    status,
    element_count,
    formatReadableSize(bytes_allocated) AS size,
    query_count,
    hit_rate,
    found_rate,
    last_exception
FROM system.dictionaries
```

주요 컬럼:

* `bytes_allocated` — 딕셔너리가 사용하는 메모리입니다. 딕셔너리는 데이터를 압축하지 않은 상태로 저장하므로 압축된 테이블 크기보다 훨씬 클 수 있습니다.
* `hit_rate` 및 `found_rate` — `cache` 레이아웃의 효율을 평가하는 데 유용합니다.
* `last_exception` — 딕셔너리를 로드하거나 새로 고치는 데 실패할 때 확인하십시오.
