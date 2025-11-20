---
'description': '입력 데이터에 Largest-Triangle-Three-Buckets 알고리즘을 적용합니다.'
'sidebar_label': 'largestTriangleThreeBuckets'
'sidebar_position': 159
'slug': '/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets'
'title': 'largestTriangleThreeBuckets'
'doc_type': 'reference'
---


# largestTriangleThreeBuckets

입력 데이터에 [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) 알고리즘을 적용합니다. 이 알고리즘은 시각화를 위한 시계열 데이터 다운샘플링에 사용됩니다. x 좌표로 정렬된 시리즈에서 작동하도록 설계되었습니다. 정렬된 시리즈를 버킷으로 나누고 각 버킷에서 가장 큰 삼각형을 찾는 방식으로 작동합니다. 버킷의 수는 결과 시리즈의 점의 수와 같습니다. 함수는 데이터를 `x`에 따라 정렬한 후 정렬된 데이터에 다운샘플링 알고리즘을 적용합니다.

**구문**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

별칭: `lttb`.

**인수**

- `x` — x 좌표. [정수](../../../sql-reference/data-types/int-uint.md), [부동소수점](../../../sql-reference/data-types/float.md), [십진수](../../../sql-reference/data-types/decimal.md), [날짜](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [날짜시간](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md).
- `y` — y 좌표. [정수](../../../sql-reference/data-types/int-uint.md), [부동소수점](../../../sql-reference/data-types/float.md), [십진수](../../../sql-reference/data-types/decimal.md), [날짜](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md), [날짜시간](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md).

제공된 시리즈에서 NaN은 무시되므로 NaN 값은 분석에서 제외됩니다. 이를 통해 함수는 유효한 수치 데이터에 대해서만 작동합니다.

**매개변수**

- `n` — 결과 시리즈의 점의 수. [UInt64](../../../sql-reference/data-types/int-uint.md).

**반환 값**

[Tuple](../../../sql-reference/data-types/tuple.md) 두 개 요소의 [배열](../../../sql-reference/data-types/array.md):

**예제**

입력 테이블:

```text
┌─────x───────┬───────y──────┐
│ 1.000000000 │ 10.000000000 │
│ 2.000000000 │ 20.000000000 │
│ 3.000000000 │ 15.000000000 │
│ 8.000000000 │ 60.000000000 │
│ 9.000000000 │ 55.000000000 │
│ 10.00000000 │ 70.000000000 │
│ 4.000000000 │ 30.000000000 │
│ 5.000000000 │ 40.000000000 │
│ 6.000000000 │ 35.000000000 │
│ 7.000000000 │ 50.000000000 │
└─────────────┴──────────────┘
```

쿼리:

```sql
SELECT largestTriangleThreeBuckets(4)(x, y) FROM largestTriangleThreeBuckets_test;
```

결과:

```text
┌────────largestTriangleThreeBuckets(4)(x, y)───────────┐
│           [(1,10),(3,15),(9,55),(10,70)]              │
└───────────────────────────────────────────────────────┘
```
