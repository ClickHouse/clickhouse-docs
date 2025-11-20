---
'description': '집계 함수로, 간격 그룹이 서로 교차하는 최대 횟수를 계산합니다 (모든 간격이 최소한 한 번 교차할 경우입니다).'
'sidebar_position': 163
'slug': '/sql-reference/aggregate-functions/reference/maxintersections'
'title': 'maxIntersections'
'doc_type': 'reference'
---


# maxIntersections

간격 그룹이 서로 교차하는 최대 횟수를 계산하는 집계 함수입니다(모든 간격이 최소한 한 번은 교차하는 경우).

구문은 다음과 같습니다:

```sql
maxIntersections(start_column, end_column)
```

**인수**

- `start_column` – 각 간격의 시작을 나타내는 숫자 컬럼입니다. `start_column`이 `NULL`이거나 0인 경우 해당 간격은 생략됩니다.

- `end_column` - 각 간격의 끝을 나타내는 숫자 컬럼입니다. `end_column`이 `NULL`이거나 0인 경우 해당 간격은 생략됩니다.

**반환 값**

교차된 간격의 최대 수를 반환합니다.

**예시**

```sql
CREATE TABLE my_events (
    start UInt32,
    end UInt32
)
ENGINE = MergeTree
ORDER BY tuple();

INSERT INTO my_events VALUES
   (1, 3),
   (1, 6),
   (2, 5),
   (3, 7);
```

간격은 다음과 같습니다:

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

이 간격 중 세 개는 공통된 값을 가집니다(값은 `4`지만, 중요한 것은 공통된 값이 아니라 교차의 수를 측정하는 것입니다). 간격 `(1,3)`과 `(3,7)`은 끝점을 공유하지만 `maxIntersections` 함수에서는 교차하는 것으로 간주되지 않습니다.

```sql
SELECT maxIntersections(start, end) FROM my_events;
```

응답:
```response
3
```

최대 간격이 여러 번 발생하는 경우, [`maxIntersectionsPosition` 함수](./maxintersectionsposition.md)를 사용하여 해당 발생 수와 위치를 찾을 수 있습니다.
