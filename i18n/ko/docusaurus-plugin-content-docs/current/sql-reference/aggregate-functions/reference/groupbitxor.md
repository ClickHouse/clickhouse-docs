---
'description': '일련의 숫자에 대해 비트 단위 `XOR`을 적용합니다.'
'sidebar_position': 153
'slug': '/sql-reference/aggregate-functions/reference/groupbitxor'
'title': 'groupBitXor'
'doc_type': 'reference'
---


# groupBitXor

숫자 시리즈에 대해 비트 단위 `XOR`를 적용합니다.

```sql
groupBitXor(expr)
```

**인수**

`expr` – `UInt*` 또는 `Int*` 유형의 결과를 반환하는 표현식입니다.

**반환 값**

`UInt*` 또는 `Int*` 유형의 값입니다.

**예제**

테스트 데이터:

```text
binary     decimal
00101100 = 44
00011100 = 28
00001101 = 13
01010101 = 85
```

쿼리:

```sql
SELECT groupBitXor(num) FROM t
```

여기서 `num`은 테스트 데이터가 있는 컬럼입니다.

결과:

```text
binary     decimal
01101000 = 104
```
