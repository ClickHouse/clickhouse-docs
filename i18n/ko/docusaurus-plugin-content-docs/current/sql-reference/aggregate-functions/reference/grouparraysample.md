---
'description': '샘플 인수 값의 배열을 생성합니다. 결과 배열의 크기는 `max_size` 요소로 제한됩니다. 인수 값은 무작위로 선택되어
  배열에 추가됩니다.'
'sidebar_position': 145
'slug': '/sql-reference/aggregate-functions/reference/grouparraysample'
'title': 'groupArraySample'
'doc_type': 'reference'
---


# groupArraySample

샘플 인수 값의 배열을 생성합니다. 결과 배열의 크기는 `max_size` 요소로 제한됩니다. 인수 값은 무작위로 선택되어 배열에 추가됩니다.

**구문**

```sql
groupArraySample(max_size[, seed])(x)
```

**인수**

- `max_size` — 결과 배열의 최대 크기. [UInt64](../../data-types/int-uint.md).
- `seed` — 난수 생성기의 시드. 선택적. [UInt64](../../data-types/int-uint.md). 기본값: `123456`.
- `x` — 인수(컬럼 이름 또는 표현식).

**반환 값**

- 무작위로 선택된 `x` 인수의 배열.

유형: [Array](../../data-types/array.md).

**예제**

`colors` 테이블을 고려합니다:

```text
┌─id─┬─color──┐
│  1 │ red    │
│  2 │ blue   │
│  3 │ green  │
│  4 │ white  │
│  5 │ orange │
└────┴────────┘
```

인수를 컬럼 이름으로 하는 쿼리:

```sql
SELECT groupArraySample(3)(color) as newcolors FROM colors;
```

결과:

```text
┌─newcolors──────────────────┐
│ ['white','blue','green']   │
└────────────────────────────┘
```

컬럼 이름과 다른 시드를 사용하는 쿼리:

```sql
SELECT groupArraySample(3, 987654321)(color) as newcolors FROM colors;
```

결과:

```text
┌─newcolors──────────────────┐
│ ['red','orange','green']   │
└────────────────────────────┘
```

인수를 표현식으로 하는 쿼리:

```sql
SELECT groupArraySample(3)(concat('light-', color)) as newcolors FROM colors;
```

결과:

```text
┌─newcolors───────────────────────────────────┐
│ ['light-blue','light-orange','light-green'] │
└─────────────────────────────────────────────┘
```
