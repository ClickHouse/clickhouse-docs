---
'description': '값 그룹 간의 가장 왼쪽과 가장 오른쪽 포인트 사이의 기울기를 계산하는 집계 함수.'
'sidebar_position': 114
'slug': '/sql-reference/aggregate-functions/reference/boundingRatio'
'title': 'boundingRatio'
'doc_type': 'reference'
---

집합 함수는 값 그룹 간의 가장 왼쪽 및 가장 오른쪽 점 사이의 기울기를 계산합니다.

예시:

샘플 데이터:
```sql
SELECT
    number,
    number * 1.5
FROM numbers(10)
```
```response
┌─number─┬─multiply(number, 1.5)─┐
│      0 │                     0 │
│      1 │                   1.5 │
│      2 │                     3 │
│      3 │                   4.5 │
│      4 │                     6 │
│      5 │                   7.5 │
│      6 │                     9 │
│      7 │                  10.5 │
│      8 │                    12 │
│      9 │                  13.5 │
└────────┴───────────────────────┘
```

boundingRatio() 함수는 가장 왼쪽 및 가장 오른쪽 점 사이의 선의 기울기를 반환합니다. 위 데이터에서 이 점은 `(0,0)`과 `(9,13.5)`입니다.

```sql
SELECT boundingRatio(number, number * 1.5)
FROM numbers(10)
```
```response
┌─boundingRatio(number, multiply(number, 1.5))─┐
│                                          1.5 │
└──────────────────────────────────────────────┘
```
