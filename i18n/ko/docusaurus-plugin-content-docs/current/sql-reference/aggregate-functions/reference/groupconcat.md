---
'description': '문자열 그룹에서 구분자로 선택적으로 구분되며 최대 요소 수로 선택적으로 제한되는 연결된 문자열을 계산합니다.'
'sidebar_label': 'groupConcat'
'sidebar_position': 363
'slug': '/sql-reference/aggregate-functions/reference/groupconcat'
'title': 'groupConcat'
'doc_type': 'reference'
---

Calculates a concatenated string from a group of strings, optionally separated by a delimiter, and optionally limited by a maximum number of elements.

**문법**

```sql
groupConcat[(delimiter [, limit])](expression);
```

별칭: `group_concat`

**인수**

- `expression` — 연결할 문자열을 출력하는 표현식 또는 컬럼 이름입니다.
- `delimiter` — 연결된 값을 구분하는 데 사용되는 [문자열](../../../sql-reference/data-types/string.md)입니다. 이 매개변수는 선택 사항이며, 지정하지 않을 경우 기본값은 빈 문자열이나 매개변수의 구분자입니다.

**매개변수**

- `delimiter` — 연결된 값을 구분하는 데 사용되는 [문자열](../../../sql-reference/data-types/string.md)입니다. 이 매개변수는 선택 사항이며, 지정하지 않을 경우 기본값은 빈 문자열입니다.
- `limit` — 연결할 최대 요소 수를 지정하는 양의 [정수](../../../sql-reference/data-types/int-uint.md)입니다. 더 많은 요소가 있을 경우 초과 요소는 무시됩니다. 이 매개변수는 선택 사항입니다.

:::note
구분자가 한정 없이 지정된 경우 첫 번째 매개변수여야 합니다. 구분자와 한정이 모두 지정된 경우 구분자가 한정보다 앞서야 합니다.

또한, 서로 다른 구분자가 매개변수와 인수로 지정된 경우, 인수에서의 구분자가 사용됩니다.
:::

**반환 값**

- 연결된 컬럼 또는 표현식의 값을 포함하는 [문자열](../../../sql-reference/data-types/string.md)을 반환합니다. 그룹에 요소가 없거나 null 요소만 있는 경우, 함수가 null 값에 대한 처리를 지정하지 않으면 결과는 null 값을 가진 nullable 문자열입니다.

**예제**

입력 테이블:

```text
┌─id─┬─name─┐
│  1 │ John │
│  2 │ Jane │
│  3 │ Bob  │
└────┴──────┘
```

1. 구분자 없이 기본 사용:

쿼리:

```sql
SELECT groupConcat(Name) FROM Employees;
```

결과:

```text
JohnJaneBob
```

이는 모든 이름을 구분자 없이 하나의 연속 문자열로 연결합니다.

2. 구분자로 쉼표 사용:

쿼리:

```sql
SELECT groupConcat(', ')(Name)  FROM Employees;
```

또는

```sql
SELECT groupConcat(Name, ', ')  FROM Employees;
```

결과:

```text
John, Jane, Bob
```

이 출력은 이름을 쉼표 뒤에 공백을 두고 구분한 형태입니다.

3. 연결된 요소 수 제한

쿼리:

```sql
SELECT groupConcat(', ', 2)(Name) FROM Employees;
```

결과:

```text
John, Jane
```

이 쿼리는 테이블에 더 많은 이름이 있음에도 불구하고 출력 결과를 처음 두 이름으로 제한합니다.
