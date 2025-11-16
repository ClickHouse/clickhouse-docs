---
'description': '부호 없는 정수 컬럼에서 비트맵 또는 집계 계산을 수행하고, UInt64 유형의 기수를 반환합니다. -State 접미사를
  추가하면 비트맵 객체를 반환합니다.'
'sidebar_position': 148
'slug': '/sql-reference/aggregate-functions/reference/groupbitmap'
'title': 'groupBitmap'
'doc_type': 'reference'
---


# groupBitmap

부호 없는 정수 컬럼에서의 비트맵 또는 집계 계산, UInt64 유형의 기수(cardinality)를 반환하며, 접미사 -State를 추가하면 [비트맵 객체](../../../sql-reference/functions/bitmap-functions.md)를 반환합니다.

```sql
groupBitmap(expr)
```

**인자**

`expr` – `UInt*` 유형의 결과를 생성하는 표현식.

**반환 값**

`UInt64` 유형의 값.

**예시**

테스트 데이터:

```text
UserID
1
1
2
3
```

쿼리:

```sql
SELECT groupBitmap(UserID) AS num FROM t
```

결과:

```text
num
3
```
