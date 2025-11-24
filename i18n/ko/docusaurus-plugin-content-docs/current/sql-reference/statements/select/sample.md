---
'description': 'SAMPLE 절에 대한 문서'
'sidebar_label': 'SAMPLE'
'slug': '/sql-reference/statements/select/sample'
'title': '샘플 절'
'doc_type': 'reference'
---


# SAMPLE 절

`SAMPLE` 절은 근사된 `SELECT` 쿼리 처리를 가능하게 합니다.

데이터 샘플링이 활성화되면, 쿼리는 모든 데이터에서 실행되는 것이 아니라 특정 데이터의 일부(샘플)에서만 실행됩니다. 예를 들어, 모든 방문에 대한 통계를 계산해야 할 경우, 모든 방문의 1/10만 쿼리를 실행하고 그 결과를 10으로 곱하면 충분합니다.

근사된 쿼리 처리는 다음과 같은 경우에 유용할 수 있습니다:

- 엄격한 지연 시간 요구 사항이 있는 경우(100ms 이하) 하지만 이를 충족하기 위해 추가 하드웨어 자원의 비용을 정당화할 수 없는 경우.
- 원시 데이터가 정확하지 않아, 근사가 품질을 눈에 띄게 저하하지 않는 경우.
- 비즈니스 요구 사항이 근사 결과를 목표로 하는 경우(비용 효율성 또는 프리미엄 사용자에게 정확한 결과를 마케팅하기 위해).

:::note    
샘플링은 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) 계열의 테이블에서만 사용할 수 있으며, 테이블 생성 시 샘플링 표현이 지정된 경우에만 사용할 수 있습니다 (자세한 내용은 [MergeTree 엔진](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)을 참조하십시오).
:::

데이터 샘플링의 특징은 다음과 같습니다:

- 데이터 샘플링은 결정론적 메커니즘입니다. 동일한 `SELECT .. SAMPLE` 쿼리의 결과는 항상 동일합니다.
- 샘플링은 서로 다른 테이블에서 일관되게 작동합니다. 단일 샘플링 키가 있는 테이블의 경우, 동일한 계수를 가진 샘플은 항상 가능한 데이터의 동일한 하위 집합을 선택합니다. 예를 들어, 사용자 ID의 샘플은 서로 다른 테이블에서 가능한 모든 사용자 ID의 동일한 하위 집합을 선택합니다. 이는 [IN](../../../sql-reference/operators/in.md) 절에서 서브쿼리에 샘플을 사용할 수 있도록 합니다. 또한, [JOIN](../../../sql-reference/statements/select/join.md) 절을 사용하여 샘플을 조인할 수 있습니다.
- 샘플링은 디스크에서 읽는 데이터 양을 줄이는 데 도움이 됩니다. 샘플링 키를 올바르게 지정해야 하는 점에 유의하십시오. 자세한 내용은 [MergeTree 테이블 생성하기](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)를 참조하십시오.

`SAMPLE` 절에 대해 지원되는 구문은 다음과 같습니다:

| SAMPLE 절 구문       | 설명                                                                                                                                                                                                                                    |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `SAMPLE k`      | 여기서 `k`는 0에서 1까지의 숫자입니다. 쿼리는 `k` 비율의 데이터에서 실행됩니다. 예를 들어, `SAMPLE 0.1`은 10%의 데이터에서 쿼리를 실행합니다. [자세히 읽기](#sample-k)                                                       |
| `SAMPLE n`      | 여기서 `n`은 충분히 큰 정수입니다. 쿼리는 최소 `n` 행의 샘플에서 실행됩니다(하지만 그 이상은 아니어야 합니다). 예를 들어, `SAMPLE 10000000`은 최소 10,000,000 행에서 쿼리를 실행합니다. [자세히 읽기](#sample-n)    |
| `SAMPLE k OFFSET m` | 여기서 `k`와 `m`은 0에서 1까지의 숫자입니다. 쿼리는 데이터의 `k` 비율 샘플에서 실행됩니다. 샘플에 사용되는 데이터는 `m` 비율만큼 오프셋됩니다. [자세히 읽기](#sample-k-offset-m)                                      |

## SAMPLE K {#sample-k}

여기서 `k`는 0에서 1까지의 숫자입니다(분수 및 소수 표기가 지원됩니다). 예를 들어, `SAMPLE 1/2` 또는 `SAMPLE 0.5`입니다.

`SAMPLE k` 절에서는 데이터의 `k` 비율에서 샘플이 추출됩니다. 예시는 아래와 같습니다:

```sql
SELECT
    Title,
    count() * 10 AS PageViews
FROM hits_distributed
SAMPLE 0.1
WHERE
    CounterID = 34
GROUP BY Title
ORDER BY PageViews DESC LIMIT 1000
```

이 예제에서 쿼리는 데이터의 0.1(10%) 샘플에서 실행됩니다. 집계 함수의 값은 자동으로 수정되지 않으므로, 근사 결과를 얻으려면 `count()` 값을 수동으로 10배 해야 합니다.

## SAMPLE N {#sample-n}

여기서 `n`은 충분히 큰 정수입니다. 예를 들어, `SAMPLE 10000000`입니다.

이 경우, 쿼리는 최소 `n` 행의 샘플에서 실행됩니다(하지만 그 이상은 아니어야 합니다). 예를 들어, `SAMPLE 10000000`은 최소 10,000,000 행에서 쿼리를 실행합니다.

데이터 읽기에 대한 최소 단위는 하나의 과립(크기는 `index_granularity` 설정으로 설정됨)이므로, 과립의 크기보다 훨씬 큰 샘플을 설정하는 것이 의미가 있습니다.

`SAMPLE n` 절을 사용하는 경우, 처리된 데이터의 상대 비율이 무엇인지 알 수 없습니다. 따라서 집계 함수에 곱할 계수를 알 수 없습니다. 근사 결과를 얻으려면 `_sample_factor` 가상 열을 사용하십시오.

`_sample_factor` 열에는 동적으로 계산된 상대 계수가 포함되어 있습니다. 이 열은 지정된 샘플링 키로 테이블을 [생성](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)할 때 자동으로 생성됩니다. `_sample_factor` 열의 사용 예시는 아래와 같습니다.

사이트 방문에 대한 통계를 포함하는 `visits` 테이블을 고려해 보겠습니다. 첫 번째 예제는 페이지 뷰 수를 계산하는 방법을 보여줍니다:

```sql
SELECT sum(PageViews * _sample_factor)
FROM visits
SAMPLE 10000000
```

다음 예제는 총 방문 수를 계산하는 방법을 보여줍니다:

```sql
SELECT sum(_sample_factor)
FROM visits
SAMPLE 10000000
```

아래 예제는 평균 세션 지속 시간을 계산하는 방법을 보여줍니다. 평균 값을 계산할 때 상대 계수를 사용할 필요가 없다는 점에 유의하십시오.

```sql
SELECT avg(Duration)
FROM visits
SAMPLE 10000000
```

## SAMPLE K OFFSET M {#sample-k-offset-m}

여기서 `k`와 `m`은 0에서 1까지의 숫자입니다. 아래 예제가 있습니다.

**예제 1**

```sql
SAMPLE 1/10
```

이 예제에서는 전체 데이터의 1/10 샘플이 추출됩니다:

`[++------------]`

**예제 2**

```sql
SAMPLE 1/10 OFFSET 1/2
```

여기서는 데이터의 두 번째 절반에서 10% 샘플이 추출됩니다.

`[------++------]`
