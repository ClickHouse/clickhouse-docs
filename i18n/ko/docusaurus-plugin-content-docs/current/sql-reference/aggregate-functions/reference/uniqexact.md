---
'description': '다양한 인수 값의 정확한 수를 계산합니다.'
'sidebar_position': 207
'slug': '/sql-reference/aggregate-functions/reference/uniqexact'
'title': 'uniqExact'
'doc_type': 'reference'
---


# uniqExact

다양한 인수 값의 정확한 수를 계산합니다.

```sql
uniqExact(x[, ...])
```

정확한 결과가 반드시 필요하다면 `uniqExact` 함수를 사용하십시오. 그렇지 않다면 [uniq](/sql-reference/aggregate-functions/reference/uniq) 함수를 사용하십시오.

`uniqExact` 함수는 값의 종류 수가 증가함에 따라 상태의 크기가 무제한으로 성장하므로 `uniq`보다 더 많은 메모리를 사용합니다.

**Arguments**

이 함수는 가변 개수의 매개변수를 받습니다. 매개변수는 `Tuple`, `Array`, `Date`, `DateTime`, `String` 또는 숫자형일 수 있습니다.

**Example**

이번 예제에서는 [opensky data set](https://sql.clickhouse.com?query=U0VMRUNUIHVuaXFFeGFjdCh0eXBlY29kZSkgRlJPTSBvcGVuc2t5Lm9wZW5za3k&)에서 항공기의 유형을 나타내는 짧은 식별자인 고유 유형 코드를 세기 위해 `uniqExact` 함수를 사용할 것입니다.

```sql title="Query"
SELECT uniqExact(typecode) FROM opensky.opensky
```

```response title="Response"
1106
```

**See Also**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
