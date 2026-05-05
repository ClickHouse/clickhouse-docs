---
description: '`median*` 함수는 해당하는 `quantile*` 함수의 별칭입니다. 수치형 데이터 샘플의 중앙값을 계산합니다.'
slug: /sql-reference/aggregate-functions/reference/median
title: 'median'
doc_type: 'reference'
---

# median \{#median\}

`median*` 함수는 해당하는 `quantile*` 함수의 별칭입니다. 숫자형 데이터 샘플의 중앙값을 계산합니다.

함수:

* `median` — [quantile](/sql-reference/aggregate-functions/reference/quantile)의 별칭입니다.
* `medianDeterministic` — [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantileDeterministic.md)의 별칭입니다.
* `medianExact` — [quantileExact](/sql-reference/aggregate-functions/reference/quantileExact.md)의 별칭입니다.
* `medianExactWeighted` — [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileExactWeighted.md)의 별칭입니다.
* `medianTiming` — [quantileTiming](/sql-reference/aggregate-functions/reference/quantileTiming.md)의 별칭입니다.
* `medianTimingWeighted` — [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantileTimingWeighted.md)의 별칭입니다.
* `medianTDigest` — [quantileTDigest](/sql-reference/aggregate-functions/reference/quantileTDigest.md)의 별칭입니다.
* `medianTDigestWeighted` — [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantileTDigestWeighted.md)의 별칭입니다.
* `medianBFloat16` — [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantileBFloat16.md)의 별칭입니다.
* `medianDD` — [quantileDD](/sql-reference/aggregate-functions/reference/quantileDD.md)의 별칭입니다.

**예시**

입력 테이블:

```text
┌─val─┐
│   1 │
│   1 │
│   2 │
│   3 │
└─────┘
```

쿼리:

```sql
SELECT medianDeterministic(val, 1) FROM t;
```

결과:

```text
┌─medianDeterministic(val, 1)─┐
│                         1.5 │
└─────────────────────────────┘
```
