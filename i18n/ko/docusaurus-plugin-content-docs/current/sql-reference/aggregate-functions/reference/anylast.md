---
'description': '컬럼의 마지막으로 만난 값을 선택합니다.'
'sidebar_position': 105
'slug': '/sql-reference/aggregate-functions/reference/anylast'
'title': 'anyLast'
'doc_type': 'reference'
---


# anyLast

컬럼에서 마지막으로 나타난 값을 선택합니다.

:::warning
쿼리는 임의의 순서로 실행될 수 있으므로 이 함수의 결과는 비결정적입니다.
임의의 결정적 결과가 필요하다면, [`min`](../reference/min.md) 또는 [`max`](../reference/max.md) 함수 사용을 권장합니다.
:::

기본적으로 이 함수는 NULL을 절대 반환하지 않으며, 즉 입력 컬럼에서 NULL 값을 무시합니다.
다만 `RESPECT NULLS` 수정자와 함께 함수를 사용하면, NULL이든 아니든 먼저 읽은 값을 반환합니다.

**문법**

```sql
anyLast(column) [RESPECT NULLS]
```

별칭 `anyLast(column)` ( `RESPECT NULLS` 없이 사용)
- [`last_value`](../reference/last_value.md).

`anyLast(column) RESPECT NULLS`의 별칭
- `anyLastRespectNulls`, `anyLast_respect_nulls`
- `lastValueRespectNulls`, `last_value_respect_nulls`

**매개변수**
- `column`: 컬럼 이름.

**반환값**

- 마지막으로 나타난 값.

**예제**

쿼리:

```sql
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;

INSERT INTO tab (city) VALUES ('Amsterdam'),(NULL),('New York'),('Tokyo'),('Valencia'),(NULL);

SELECT anyLast(city), anyLastRespectNulls(city) FROM tab;
```

```response
┌─anyLast(city)─┬─anyLastRespectNulls(city)─┐
│ Valencia      │ ᴺᵁᴸᴸ                      │
└───────────────┴───────────────────────────┘
```
