---
'slug': '/examples/aggregate-function-combinators/groupArrayResample'
'title': 'groupArrayResample'
'description': 'groupArray와 함께 Resample 조합기를 사용하는 예'
'keywords':
- 'groupArray'
- 'Resample'
- 'combinator'
- 'examples'
- 'groupArrayResample'
'sidebar_label': 'groupArrayResample'
'doc_type': 'reference'
---


# groupArrayResample {#grouparrayresample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
조합자는 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 집계 함수에 적용되어 
지정된 키 컬럼의 범위를 고정된 개수의 구간(`N`)으로 나누고, 
각 구간에 해당하는 데이터 포인트에서 최소 키에 해당하는 하나의 대표 값을 선택하여 
결과 배열을 생성합니다. 이는 모든 값을 수집하는 대신 데이터의 다운샘플링된 뷰를 만듭니다.

## Example usage {#example-usage}

예를 살펴보겠습니다. 우리는 직원의 `name`, `age` 및 
`wage`를 포함하는 테이블을 생성하고, 여기에 데이터를 삽입하겠습니다:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

나이가 `[30,60)`와 `[60,75)` 구간에 있는 사람들의 이름을 가져오겠습니다. 
우리는 나이를 정수로 표현하기 때문에 `[30, 59]`와 `[60,74]` 구간의 나이를 얻게 됩니다.

이름을 배열로 집계하기 위해 `groupArray` 집계 함수를 사용합니다. 
이 함수는 하나의 인수를 받습니다. 우리 경우에는 이름 컬럼입니다. 
`groupArrayResample` 함수는 나이를 기준으로 이름을 집계하기 위해 
나이 컬럼을 사용해야 합니다. 필요한 구간을 정의하기 위해 
`30`, `75`, `30`을 `groupArrayResample` 함수에 인수로 전달합니다:

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```

## See also {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
