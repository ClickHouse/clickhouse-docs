---
description: 'ClickHouse에서 FixedString(N) 데이터 타입에 대한 문서'
sidebar_label: 'FixedString(N)'
sidebar_position: 10
slug: /sql-reference/data-types/fixedstring
title: 'FixedString(N)'
doc_type: 'reference'
---

# FixedString(N) \{#fixedstringn\}

길이 N바이트인 고정 길이 문자열입니다(문자나 코드 포인트 단위가 아님).

`FixedString` 타입의 컬럼을 선언하려면 다음 구문을 사용하십시오:

```sql
<column_name> FixedString(N)
```

여기서 `N` 은 자연수입니다.

`FixedString` 타입은 데이터의 길이가 정확히 `N` 바이트인 경우에 효율적입니다. 그 외의 경우에는 효율성이 떨어질 수 있습니다.

`FixedString` 타입 컬럼에 효율적으로 저장할 수 있는 값의 예시는 다음과 같습니다.

* IP 주소의 바이너리 표현(IPv6의 경우 `FixedString(16)`).
* 언어 코드(ru&#95;RU, en&#95;US ... ).
* 통화 코드(USD, RUB ... ).
* 해시의 바이너리 표현(MD5의 경우 `FixedString(16)`, SHA256의 경우 `FixedString(32)`).

UUID 값을 저장하려면 [UUID](../../sql-reference/data-types/uuid.md) 데이터 타입을 사용합니다.

데이터를 삽입할 때 ClickHouse는 다음과 같이 동작합니다.

* 문자열이 `N` 바이트보다 짧으면 널 바이트(null byte)로 문자열을 채웁니다.
* 문자열이 `N` 바이트보다 길면 `Too large value for FixedString(N)` 예외를 발생시킵니다.

다음과 같이 단일 `FixedString(2)` 컬럼을 가진 테이블을 살펴보겠습니다.

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

`FixedString(N)` 값의 길이는 항상 일정합니다. [length](/sql-reference/functions/array-functions#length) 함수는 `FixedString(N)` 값이 null 바이트만으로 채워져 있어도 `N`을 반환하지만, [empty](/sql-reference/functions/array-functions#empty) 함수는 이 경우 `1`을 반환합니다.

`WHERE` 절로 데이터를 선택할 때는 조건을 어떻게 지정하느냐에 따라 다양한 결과가 반환됩니다:

* 같음 연산자 `=` 또는 `==` 혹은 `equals` 함수를 사용하면 ClickHouse는 `\0` 문자를 고려하지 *않습니다*. 즉, `SELECT * FROM FixedStringTable WHERE name = 'a';`와 `SELECT * FROM FixedStringTable WHERE name = 'a\0';` 쿼리는 동일한 결과를 반환합니다.
* `LIKE` 절을 사용하면 ClickHouse는 `\0` 문자를 *고려합니다*. 따라서 필터 조건에 `\0` 문자를 명시적으로 지정해야 할 수 있습니다.

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
