---
'slug': '/examples/aggregate-function-combinators/avgResample'
'title': 'avgResample'
'description': 'avg를 사용하여 Resample 조합기를 사용하는 예제'
'keywords':
- 'avg'
- 'Resample'
- 'combinator'
- 'examples'
- 'avgResample'
'sidebar_label': 'avgResample'
'doc_type': 'reference'
---


# countResample {#countResample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
결합기는 지정된 키 컬럼의 값을 고정된 수의 구간(`N`)으로 세기 위해 
[`count`](/sql-reference/aggregate-functions/reference/count) 집계 함수에 적용될 수 있습니다.

## Example usage {#example-usage}

### Basic example {#basic-example}

예시를 살펴보겠습니다. 우리는 직원의 `name`, `age` 및 `wage`를 포함하는 테이블을 생성하고, 일부 데이터를 삽입하겠습니다:

```sql
CREATE TABLE employee_data 
(
    name String,
    age UInt8,
    wage Float32
) 
ENGINE = MergeTree()
ORDER BY tuple()

INSERT INTO employee_data (name, age, wage) VALUES
    ('John', 16, 10.0),
    ('Alice', 30, 15.0),
    ('Mary', 35, 8.0),
    ('Evelyn', 48, 11.5),
    ('David', 62, 9.9),
    ('Brian', 60, 16.0);
```

연령이 `[30,60)` 및 `[60,75)` 구간에 있는 사람들의 평균 임금을 구해보겠습니다. 
(`[`는 exclusive이고 `)`는 inclusive입니다). 우리는 나이를 정수로 표현하므로, 
구간에서 나이는 `[30, 59]` 및 `[60,74]`가 됩니다. 
이를 위해 `avg` 집계 함수에 `Resample` 결합기를 적용합니다.

```sql
WITH avg_wage AS
(
    SELECT avgResample(30, 75, 30)(wage, age) AS original_avg_wage
    FROM employee_data
)
SELECT
    arrayMap(x -> round(x, 3), original_avg_wage) AS avg_wage_rounded
FROM avg_wage;
```

```response
┌─avg_wage_rounded─┐
│ [11.5,12.95]     │
└──────────────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
