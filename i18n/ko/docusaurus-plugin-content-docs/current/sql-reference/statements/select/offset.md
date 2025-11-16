---
'description': 'Offset에 대한 문서'
'sidebar_label': 'OFFSET'
'slug': '/sql-reference/statements/select/offset'
'title': 'OFFSET FETCH 절'
'doc_type': 'reference'
---

`OFFSET` 및 `FETCH`는 데이터를 부분적으로 검색할 수 있게 해줍니다. 이들은 단일 쿼리로 가져오고자 하는 행 블록을 지정합니다.

```sql
OFFSET offset_row_count {ROW | ROWS}] [FETCH {FIRST | NEXT} fetch_row_count {ROW | ROWS} {ONLY | WITH TIES}]
```

`offset_row_count` 또는 `fetch_row_count` 값은 숫자나 리터럴 상수가 될 수 있습니다. `fetch_row_count`는 생략할 수 있으며 기본값은 1입니다.

`OFFSET`은 쿼리 결과 집합에서 행을 반환하기 시작하기 전에 건너뛸 행의 수를 지정합니다. `OFFSET n`은 결과의 처음 `n` 행을 건너뜁니다.

음수 OFFSET도 지원됩니다: `OFFSET -n`은 결과에서 마지막 `n` 행을 건너뜁니다.

분수 OFFSET도 지원됩니다: `OFFSET n` - 0 < n < 1인 경우, 결과의 처음 n * 100%가 건너뜁니다.

예:
    • `OFFSET 0.1` - 결과의 처음 10%를 건너뜁니다.

> **참고**
> • 분수는 1보다 작고 0보다 큰 [Float64](../../data-types/float.md) 숫자여야 합니다.
> • 계산 결과 행의 분수가 발생하는 경우, 다음 정수로 반올림됩니다.

`FETCH`는 쿼리 결과에 포함될 수 있는 행의 최대 수를 지정합니다.

`ONLY` 옵션은 `OFFSET`에 의해 생략된 행 바로 다음에 오는 행을 반환하는 데 사용됩니다. 이 경우 `FETCH`는 [LIMIT](../../../sql-reference/statements/select/limit.md) 절의 대안입니다. 예를 들어, 다음 쿼리는

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 1 ROW FETCH FIRST 3 ROWS ONLY;
```

다음의 쿼리와 동일합니다.

```sql
SELECT * FROM test_fetch ORDER BY a LIMIT 3 OFFSET 1;
```

`WITH TIES` 옵션은 `ORDER BY` 절에 따라 결과 집합의 마지막 위치에서 동점인 추가 행을 반환하는 데 사용됩니다. 예를 들어, `fetch_row_count`가 5로 설정되어 있지만 다섯 번째 행의 `ORDER BY` 열 값과 일치하는 두 개의 추가 행이 있다면, 결과 집합에는 7개의 행이 포함됩니다.

:::note    
표준에 따르면, `OFFSET` 절은 두 개가 모두 있을 경우 `FETCH` 절보다 먼저 나와야 합니다.
:::

:::note    
실제 오프셋은 [offset](../../../operations/settings/settings.md#offset) 설정에 따라 달라질 수 있습니다.
:::

## 예제 {#examples}

입력 테이블:

```text
┌─a─┬─b─┐
│ 1 │ 1 │
│ 2 │ 1 │
│ 3 │ 4 │
│ 1 │ 3 │
│ 5 │ 4 │
│ 0 │ 6 │
│ 5 │ 7 │
└───┴───┘
```

`ONLY` 옵션 사용:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS ONLY;
```

결과:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
└───┴───┘
```

`WITH TIES` 옵션 사용:

```sql
SELECT * FROM test_fetch ORDER BY a OFFSET 3 ROW FETCH FIRST 3 ROWS WITH TIES;
```

결과:

```text
┌─a─┬─b─┐
│ 2 │ 1 │
│ 3 │ 4 │
│ 5 │ 4 │
│ 5 │ 7 │
└───┴───┘
```
