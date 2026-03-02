---
description: '컬럼을 값으로 채운 임시 저장소를 생성합니다.'
keywords: ['values', '테이블 함수']
sidebar_label: 'values'
sidebar_position: 210
slug: /sql-reference/table-functions/values
title: 'values'
doc_type: 'reference'
---



# Values 테이블 함수 \{#values-table-function\}

`Values` 테이블 함수는 컬럼을 값으로 채우는 임시 저장 공간을 생성합니다.
빠르게 테스트를 수행하거나 샘플 데이터를 생성할 때 유용합니다.

:::note
Values는 대소문자를 구분하지 않는 함수입니다. 즉, `VALUES` 또는 `values` 모두 유효합니다.
:::



## 구문 \{#syntax\}

`VALUES` 테이블 FUNCTION의 기본 구문은 다음과 같습니다.

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


## Arguments \{#arguments\}

- `column1_name Type1, ...` (선택 사항). 컬럼 이름과 타입을 지정하는 [String](/sql-reference/data-types/string)입니다.  
  이 인수가 생략되면 컬럼 이름은 `c1`, `c2` 등으로 지정됩니다.
- `(value1_row1, value2_row1)`. 어떤 타입이든 가질 수 있는 값을 포함하는 [Tuples](/sql-reference/data-types/tuple)입니다. 

:::note
쉼표로 구분된 튜플은 단일 값으로도 대체할 수 있습니다. 이 경우 각 값은 각각 새로운 행으로 처리됩니다. 자세한 내용은 아래 [예시](#examples) 섹션을 참조하십시오.
:::



## 반환 값 \{#returned-value\}

- 제공된 값을 포함하는 임시 테이블을 반환합니다.



## 예제 \{#examples\}

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

`VALUES`는 튜플 대신 단일 값에도 사용할 수 있습니다. 예:

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

또는 [구문](#syntax)에서 행 지정(`'column1_name Type1, column2_name Type2, ...'`)을 생략하면 컬럼 이름이 자동으로 생성됩니다.

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


## 같이 보기 \{#see-also\}

- [Values 형식](/interfaces/formats/Values)
