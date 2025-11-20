---
'description': '컬럼에 값을 채우는 임시 저장소를 생성합니다.'
'keywords':
- 'values'
- 'table function'
'sidebar_label': '값'
'sidebar_position': 210
'slug': '/sql-reference/table-functions/values'
'title': '값'
'doc_type': 'reference'
---


# Values Table Function {#values-table-function}

`Values` 테이블 함수는 값을 사용하여 컬럼을 채우는 임시 저장소를 생성할 수 있게 해줍니다. 이 함수는 빠른 테스트나 샘플 데이터를 생성하는 데 유용합니다.

:::note
Values는 대소문자를 구분하지 않는 함수입니다. 즉, `VALUES` 또는 `values` 모두 유효합니다.
:::

## Syntax {#syntax}

`VALUES` 테이블 함수의 기본 구문은 다음과 같습니다:

```sql
VALUES([structure,] values...)
```

일반적으로 다음과 같이 사용됩니다:

```sql
VALUES(
    ['column1_name Type1, column2_name Type2, ...'],
    (value1_row1, value2_row1, ...),
    (value1_row2, value2_row2, ...),
    ...
)
```

## Arguments {#arguments}

- `column1_name Type1, ...` (선택적). [String](/sql-reference/data-types/string) 
 으로 컬럼 이름과 타입을 지정합니다. 이 인자가 생략되면 컬럼 이름은 `c1`, `c2` 등으로 자동 지정됩니다.
- `(value1_row1, value2_row1)`. [Tuples](/sql-reference/data-types/tuple) 
   다양한 타입의 값을 포함하는 튜플입니다.

:::note
쉼표로 구분된 튜플은 단일 값으로 대체될 수 있습니다. 이 경우 각 값은 새로운 행으로 간주됩니다. 자세한 내용은 [예제](#examples) 섹션을 참조하세요.
:::

## Returned value {#returned-value}

- 제공된 값을 포함하는 임시 테이블을 반환합니다.

## Examples {#examples}

```sql title="Query"
SELECT *
FROM VALUES(
    'person String, place String',
    ('Noah', 'Paris'),
    ('Emma', 'Tokyo'),
    ('Liam', 'Sydney'),
    ('Olivia', 'Berlin'),
    ('Ilya', 'London'),
    ('Sophia', 'London'),
    ('Jackson', 'Madrid'),
    ('Alexey', 'Amsterdam'),
    ('Mason', 'Venice'),
    ('Isabella', 'Prague')
)
```

```response title="Response"
    ┌─person───┬─place─────┐
 1. │ Noah     │ Paris     │
 2. │ Emma     │ Tokyo     │
 3. │ Liam     │ Sydney    │
 4. │ Olivia   │ Berlin    │
 5. │ Ilya     │ London    │
 6. │ Sophia   │ London    │
 7. │ Jackson  │ Madrid    │
 8. │ Alexey   │ Amsterdam │
 9. │ Mason    │ Venice    │
10. │ Isabella │ Prague    │
    └──────────┴───────────┘
```

`VALUES`는 튜플 대신 단일 값과 함께 사용할 수도 있습니다. 예를 들어:

```sql title="Query"
SELECT *
FROM VALUES(
    'person String',
    'Noah',
    'Emma',
    'Liam',
    'Olivia',
    'Ilya',
    'Sophia',
    'Jackson',
    'Alexey',
    'Mason',
    'Isabella'
)
```

```response title="Response"
    ┌─person───┐
 1. │ Noah     │
 2. │ Emma     │
 3. │ Liam     │
 4. │ Olivia   │
 5. │ Ilya     │
 6. │ Sophia   │
 7. │ Jackson  │
 8. │ Alexey   │
 9. │ Mason    │
10. │ Isabella │
    └──────────┘
```

또는 행 명세 없이 사용할 수 있습니다 (`'column1_name Type1, column2_name Type2, ...'`
는 [구문](#syntax)에서). 이 경우 컬럼 이름은 자동으로 지정됩니다.

예를 들어:

```sql title="Query"
-- tuples as values
SELECT *
FROM VALUES(
    ('Noah', 'Paris'),
    ('Emma', 'Tokyo'),
    ('Liam', 'Sydney'),
    ('Olivia', 'Berlin'),
    ('Ilya', 'London'),
    ('Sophia', 'London'),
    ('Jackson', 'Madrid'),
    ('Alexey', 'Amsterdam'),
    ('Mason', 'Venice'),
    ('Isabella', 'Prague')
)
```

```response title="Response"
    ┌─c1───────┬─c2────────┐
 1. │ Noah     │ Paris     │
 2. │ Emma     │ Tokyo     │
 3. │ Liam     │ Sydney    │
 4. │ Olivia   │ Berlin    │
 5. │ Ilya     │ London    │
 6. │ Sophia   │ London    │
 7. │ Jackson  │ Madrid    │
 8. │ Alexey   │ Amsterdam │
 9. │ Mason    │ Venice    │
10. │ Isabella │ Prague    │
    └──────────┴───────────┘
```

```sql
-- single values
SELECT *
FROM VALUES(
    'Noah',
    'Emma',
    'Liam',
    'Olivia',
    'Ilya',
    'Sophia',
    'Jackson',
    'Alexey',
    'Mason',
    'Isabella'
)
```

```response title="Response"
    ┌─c1───────┐
 1. │ Noah     │
 2. │ Emma     │
 3. │ Liam     │
 4. │ Olivia   │
 5. │ Ilya     │
 6. │ Sophia   │
 7. │ Jackson  │
 8. │ Alexey   │
 9. │ Mason    │
10. │ Isabella │
    └──────────┘
```

## See also {#see-also}

- [Values format](/interfaces/formats/Values)
