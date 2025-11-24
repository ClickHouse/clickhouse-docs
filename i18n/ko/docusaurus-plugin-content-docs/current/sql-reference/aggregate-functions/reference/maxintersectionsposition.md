---
'description': '최댓값 교차점 함수의 발생 위치를 계산하는 집계 함수.'
'sidebar_position': 164
'slug': '/sql-reference/aggregate-functions/reference/maxintersectionsposition'
'title': 'maxIntersectionsPosition'
'doc_type': 'reference'
---


# maxIntersectionsPosition

`maxIntersections` 함수의 발생 위치를 계산하는 집계 함수입니다. 

구문은 다음과 같습니다:

```sql
maxIntersectionsPosition(start_column, end_column)
```

**인수**

- `start_column` – 각 구간의 시작을 나타내는 숫자형 컬럼입니다. `start_column`이 `NULL`이거나 0인 경우 해당 구간은 건너뜁니다.

- `end_column` - 각 구간의 끝을 나타내는 숫자형 컬럼입니다. `end_column`이 `NULL`이거나 0인 경우 해당 구간은 건너뜁니다.

**반환 값**

최대 교차된 구간의 시작 위치를 반환합니다.

**예제**

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

구간은 다음과 같이 보입니다:

```response
1 - 3
1 - - - - 6
  2 - - 5
    3 - - - 7
```

이 세 개의 구간이 4의 값을 공유하며, 2번째 구간에서 시작하는 것을 주목하세요:

```sql
SELECT maxIntersectionsPosition(start, end) FROM my_events;
```

응답:
```response
2
```

즉, `(1,6)` 행은 교차하는 3개의 구간의 시작이며, 3은 교차하는 최대 구간 수입니다.
