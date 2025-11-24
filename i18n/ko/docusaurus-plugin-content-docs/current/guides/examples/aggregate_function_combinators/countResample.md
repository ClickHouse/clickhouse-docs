---
'slug': '/examples/aggregate-function-combinators/countResample'
'title': 'countResample'
'description': 'count를 사용하여 Resample 조합기를 사용하는 예제'
'keywords':
- 'count'
- 'Resample'
- 'combinator'
- 'examples'
- 'countResample'
'sidebar_label': 'countResample'
'doc_type': 'reference'
---


# countResample {#countResample}

## Description {#description}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
콤비네이터는 [`count`](/sql-reference/aggregate-functions/reference/count) 
집계 함수에 적용되어 지정된 키 컬럼의 값들을 고정된 수의 
구간(`N`)에서 계산할 수 있습니다.

## Example usage {#example-usage}

### Basic example {#basic-example}

예를 들어 보겠습니다. 우리는 `name`, `age`, 및 
`wage` 컬럼을 포함하는 테이블을 생성하고, 여기에 데이터를 삽입할 것입니다:

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

우리는 나이가 `[30,60)` 
및 `[60,75)` 구간에 속하는 모든 사람들을 세어보겠습니다. 나이에 대한 정수 표현을 사용하므로, 나이는 
`[30, 59]` 및 `[60,74]` 구간에 해당합니다. 이를 위해 `count`에 
`Resample` 콤비네이터를 적용합니다.

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```

## See also {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
