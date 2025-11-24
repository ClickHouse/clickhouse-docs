---
'description': '쿼리 실행 스레드의 각 쿼리에서 절반 이상의 경우에 발생하는 값을 찾아내는 heavy hitters 알고리즘을 사용하여
  자주 발생하는 값을 선택합니다. 이 값이 반환됩니다. 일반적으로 결과는 비결정적입니다.'
'sidebar_position': 104
'slug': '/sql-reference/aggregate-functions/reference/anyheavy'
'title': 'anyHeavy'
'doc_type': 'reference'
---


# anyHeavy

주어진 쿼리의 실행 스레드 각각에서 절반 이상의 경우에 자주 발생하는 값을 선택합니다. [heavy hitters](https://doi.org/10.1145/762471.762473) 알고리즘을 사용합니다. 만약 이러한 값이 존재한다면 해당 값이 반환됩니다. 일반적으로 결과는 비결정적입니다.

```sql
anyHeavy(column)
```

**인수**

- `column` – 컬럼 이름.

**예시**

[OnTime](../../../getting-started/example-datasets/ontime.md) 데이터 세트를 가져와 `AirlineID` 컬럼에서 자주 발생하는 값을 선택합니다.

```sql
SELECT anyHeavy(AirlineID) AS res
FROM ontime
```

```text
┌───res─┐
│ 19690 │
└───────┘
```
