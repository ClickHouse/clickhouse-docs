---
description: 'PREWHERE 절 문서'
sidebar_label: 'PREWHERE'
slug: /sql-reference/statements/select/prewhere
title: 'PREWHERE 절'
doc_type: 'reference'
---



# PREWHERE 절 \{#prewhere-clause\}

`PREWHERE`는 필터링을 더 효율적으로 적용하기 위한 최적화 기능입니다. `PREWHERE` 절을 명시적으로 지정하지 않아도 기본적으로 활성화됩니다. 이 기능은 [WHERE](../../../sql-reference/statements/select/where.md) 조건의 일부를 prewhere 단계로 자동으로 이동시켜 동작합니다. `PREWHERE` 절의 역할은, 기본 동작보다 더 잘 최적화할 수 있다고 판단되는 경우에 한해 이 동작을 직접 제어할 수 있도록 하는 것입니다.

prewhere 최적화가 사용되면, 먼저 prewhere 표현식을 계산하는 데 필요한 컬럼만 읽습니다. 그런 다음, 쿼리의 나머지 부분을 실행하는 데 필요한 다른 컬럼들을 읽되, prewhere 표현식이 적어도 일부 행에 대해 `true`인 블록에 대해서만 읽습니다. prewhere 표현식이 모든 행에 대해 `false`인 블록이 많고, prewhere에서 필요한 컬럼 수가 쿼리의 다른 부분에서 필요한 컬럼 수보다 적은 경우, 쿼리 실행을 위해 디스크에서 읽어야 하는 데이터 양을 크게 줄일 수 있습니다.



## PREWHERE 수동 제어 \{#controlling-prewhere-manually\}

이 절은 `WHERE` 절과 동일한 의미를 갖지만, 테이블에서 어떤 데이터를 읽을지에 차이가 있습니다. 쿼리의 컬럼 중 일부에서만 사용되지만 데이터 필터링 효과가 큰 조건에 대해 `PREWHERE`를 수동으로 지정하면, 읽어야 하는 데이터 양을 줄일 수 있습니다.

하나의 쿼리에 `PREWHERE`와 `WHERE`를 동시에 지정할 수 있습니다. 이 경우 `PREWHERE`가 `WHERE`보다 먼저 실행됩니다.

[optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere) 설정이 0으로 설정되어 있으면, `WHERE`에서 `PREWHERE`로 식 일부를 자동으로 이동하는 휴리스틱이 비활성화됩니다.

쿼리에 [FINAL](/sql-reference/statements/select/from#final-modifier) 수정자가 있는 경우, `PREWHERE` 최적화가 항상 올바르게 동작하지 않을 수 있습니다. [optimize_move_to_prewhere](../../../operations/settings/settings.md#optimize_move_to_prewhere)와 [optimize_move_to_prewhere_if_final](../../../operations/settings/settings.md#optimize_move_to_prewhere_if_final) 두 설정이 모두 활성화된 경우에만 이 최적화가 사용됩니다.

:::note    
`PREWHERE` 절은 `FINAL`보다 먼저 실행되므로, 테이블의 `ORDER BY` 절에 없는 필드와 함께 `PREWHERE`를 사용할 때 `FROM ... FINAL` 쿼리의 결과가 왜곡될 수 있습니다.
:::



## 제한 사항 \{#limitations\}

`PREWHERE`는 [*MergeTree](../../../engines/table-engines/mergetree-family/index.md) 계열의 테이블에서만 지원됩니다.



## 예시 \{#example\}

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
