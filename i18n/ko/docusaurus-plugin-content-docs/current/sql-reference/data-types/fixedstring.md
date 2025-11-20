---
'description': 'ClickHouse의 FixedString 데이터 타입에 대한 문서'
'sidebar_label': 'FixedString(N)'
'sidebar_position': 10
'slug': '/sql-reference/data-types/fixedstring'
'title': 'FixedString(N)'
'doc_type': 'reference'
---


# FixedString(N)

`N` 바이트의 고정 길이 문자열 (문자나 코드 포인트가 아님).

`FixedString` 유형의 컬럼을 선언하려면 다음 구문을 사용하십시오:

```sql
<column_name> FixedString(N)
```

여기서 `N`은 자연수입니다.

`FixedString` 유형은 데이터의 길이가 정확히 `N` 바이트일 때 효율적입니다. 그 외의 경우에는 효율성이 떨어질 가능성이 높습니다.

`FixedString` 유형의 컬럼에 효율적으로 저장할 수 있는 값의 예:

- IP 주소의 이진 표현 (`FixedString(16)`은 IPv6에 해당).
- 언어 코드 (ru_RU, en_US ... ).
- 통화 코드 (USD, RUB ... ).
- 해시의 이진 표현 (`FixedString(16)`은 MD5에 해당, `FixedString(32)`는 SHA256에 해당).

UUID 값을 저장하려면 [UUID](../../sql-reference/data-types/uuid.md) 데이터 유형을 사용하십시오.

데이터를 삽입할 때 ClickHouse는:

- 문자열이 `N` 바이트보다 적으면 null 바이트로 문자열을 보완합니다.
- 문자열이 `N` 바이트보다 많으면 `Too large value for FixedString(N)` 예외를 발생시킵니다.

다음은 단일 `FixedString(2)` 컬럼을 가진 테이블을 고려해 보겠습니다:

```sql


INSERT INTO FixedStringTable VALUES ('a'), ('ab'), ('');
```

```sql
SELECT
    name,
    toTypeName(name),
    length(name),
    empty(name)
FROM FixedStringTable;
```

```text
┌─name─┬─toTypeName(name)─┬─length(name)─┬─empty(name)─┐
│ a    │ FixedString(2)   │            2 │           0 │
│ ab   │ FixedString(2)   │            2 │           0 │
│      │ FixedString(2)   │            2 │           1 │
└──────┴──────────────────┴──────────────┴─────────────┘
```

`FixedString(N)` 값의 길이는 일정하다는 점에 유의하십시오. [length](/sql-reference/functions/array-functions#length) 함수는 `FixedString(N)` 값이 null 바이트로만 채워져 있더라도 `N`을 반환합니다. 그러나 [empty](/sql-reference/functions/array-functions#empty) 함수는 이 경우 `1`을 반환합니다.

`WHERE` 절이 있는 데이터 선택은 조건이 어떻게 지정되는지에 따라 다양한 결과를 반환합니다:

- 등호 연산자 `=` 또는 `==` 또는 `equals` 함수를 사용하면 ClickHouse는 `\0` 문자를 고려하지 않습니다. 즉, 쿼리 `SELECT * FROM FixedStringTable WHERE name = 'a';`와 `SELECT * FROM FixedStringTable WHERE name = 'a\0';`는 동일한 결과를 반환합니다.
- `LIKE` 절을 사용하는 경우 ClickHouse는 `\0` 문자를 고려하므로 필터 조건에 `\0` 문자를 명시적으로 지정해야 할 수 있습니다.

```sql
SELECT name
FROM FixedStringTable
WHERE name = 'a'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name = 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name = 'a'
FORMAT JSONStringsEachRow

Query id: c32cec28-bb9e-4650-86ce-d74a1694d79e

{"name":"a\u0000"}


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a'
FORMAT JSONStringsEachRow

0 rows in set.


SELECT name
FROM FixedStringTable
WHERE name LIKE 'a\0'
FORMAT JSONStringsEachRow

{"name":"a\u0000"}
```
