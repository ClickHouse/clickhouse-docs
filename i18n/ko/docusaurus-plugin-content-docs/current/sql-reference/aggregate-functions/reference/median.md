---
'description': '`median*` 함수는 해당 `quantile*` 함수의 별칭입니다. 이들은 숫자 데이터 샘플의 중앙값을 계산합니다.'
'sidebar_position': 167
'slug': '/sql-reference/aggregate-functions/reference/median'
'title': '중앙값'
'doc_type': 'reference'
---


# median

`median*` 함수는 해당하는 `quantile*` 함수에 대한 별칭입니다. 이 함수들은 숫자 데이터 샘플의 중간값을 계산합니다.

함수:

- `median` — [quantile](/sql-reference/aggregate-functions/reference/quantile)에 대한 별칭.
- `medianDeterministic` — [quantileDeterministic](/sql-reference/aggregate-functions/reference/quantiledeterministic)에 대한 별칭.
- `medianExact` — [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact)에 대한 별칭.
- `medianExactWeighted` — [quantileExactWeighted](/sql-reference/aggregate-functions/reference/quantileexactweighted)에 대한 별칭.
- `medianTiming` — [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming)에 대한 별칭.
- `medianTimingWeighted` — [quantileTimingWeighted](/sql-reference/aggregate-functions/reference/quantiletimingweighted)에 대한 별칭.
- `medianTDigest` — [quantileTDigest](/sql-reference/aggregate-functions/reference/quantiletdigest)에 대한 별칭.
- `medianTDigestWeighted` — [quantileTDigestWeighted](/sql-reference/aggregate-functions/reference/quantiletdigestweighted)에 대한 별칭.
- `medianBFloat16` — [quantileBFloat16](/sql-reference/aggregate-functions/reference/quantilebfloat16)에 대한 별칭.
- `medianDD` — [quantileDD](/sql-reference/aggregate-functions/reference/quantileddsketch)에 대한 별칭.

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
