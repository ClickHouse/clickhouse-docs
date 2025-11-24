---
'description': 'PREWHERE 절에 대한 문서'
'sidebar_label': 'PREWHERE'
'slug': '/sql-reference/statements/select/prewhere'
'title': 'PREWHERE 절'
'doc_type': 'reference'
---


# PREWHERE 절

Prewhere는 필터링을 더 효율적으로 적용하기 위한 최적화 방법입니다. `PREWHERE` 절이 명시적으로 지정되지 않더라도 기본적으로 활성화되어 있습니다. 이는 [WHERE](../../../sql-reference/statements/select/where.md) 조건의 일부가 prewhere 단계로 자동으로 이동하여 작동합니다. `PREWHERE` 절의 역할은 기본적으로 발생하는 것보다 더 잘 수행할 방법을 안다고 생각할 때 이 최적화를 제어하는 것입니다.

prewhere 최적화를 사용하면, 먼저 prewhere 식을 실행하는 데 필요한 컬럼만 읽습니다. 그 다음에는 나머지 쿼리를 실행하는 데 필요한 다른 컬럼을 읽지만, prewhere 식이 일부 행에 대해 `true`인 블록만 읽습니다. 만약 모든 행에 대해 prewhere 식이 `false`인 블록이 많고 prewhere가 쿼리의 다른 부분보다 적은 컬럼을 필요로 한다면, 이는 종종 쿼리 실행을 위해 디스크에서 읽는 데이터 양을 대폭 줄이는 데 도움이 됩니다.

## 수동으로 Prewhere 제어하기 {#controlling-prewhere-manually}

이 절은 `WHERE` 절과 동일한 의미를 가집니다. 차이점은 테이블에서 어떤 데이터를 읽는지에 있습니다. 쿼리에서 소수의 컬럼에 사용되지만 강력한 데이터 필터링을 제공하는 필터링 조건을 위해 `PREWHERE`를 수동으로 제어할 때 사용됩니다. 이는 읽어야 할 데이터의 양을 줄입니다.

쿼리는 동시에 `PREWHERE`와 `WHERE`를 지정할 수 있습니다. 이 경우, `PREWHERE`가 `WHERE`보다 먼저 실행됩니다.

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 설정이 0으로 설정되어 있으면, `WHERE`에서 `PREWHERE`로 자동으로 표현의 일부를 이동하는 휴리스틱이 비활성화됩니다.

쿼리에 [FINAL](/sql-reference/statements/select/from#final-modifier) 수정자가 포함되어 있는 경우, `PREWHERE` 최적화는 항상 정확하지 않습니다. 두 설정 [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)와 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final)이 모두 활성화된 경우에만 활성화됩니다.

:::note    
`PREWHERE` 섹션은 `FINAL` 이전에 실행되므로, 테이블의 `ORDER BY` 섹션에 없는 필드를 사용하여 `PREWHERE`를 사용할 때 `FROM ... FINAL` 쿼리의 결과가 왜곡될 수 있습니다.
:::

## 제한 사항 {#limitations}

`PREWHERE`는 [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 계열의 테이블에서만 지원됩니다.

## 예시 {#example}

```sql
CREATE TABLE mydata
(
    `A` Int64,
    `B` Int8,
    `C` String
)
ENGINE = MergeTree
ORDER BY A AS
SELECT
    number,
    0,
    if(number between 1000 and 2000, 'x', toString(number))
FROM numbers(10000000);

SELECT count()
FROM mydata
WHERE (B = 0) AND (C = 'x');

1 row in set. Elapsed: 0.074 sec. Processed 10.00 million rows, 168.89 MB (134.98 million rows/s., 2.28 GB/s.)

-- let's enable tracing to see which predicate are moved to PREWHERE
set send_logs_level='debug';

MergeTreeWhereOptimizer: condition "B = 0" moved to PREWHERE  
-- Clickhouse moves automatically `B = 0` to PREWHERE, but it has no sense because B is always 0.

-- Let's move other predicate `C = 'x'` 

SELECT count()
FROM mydata
PREWHERE C = 'x'
WHERE B = 0;

1 row in set. Elapsed: 0.069 sec. Processed 10.00 million rows, 158.89 MB (144.90 million rows/s., 2.30 GB/s.)

-- This query with manual `PREWHERE` processes slightly less data: 158.89 MB VS 168.89 MB
```
