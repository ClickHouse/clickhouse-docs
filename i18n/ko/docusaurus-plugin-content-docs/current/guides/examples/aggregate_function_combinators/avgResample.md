---
slug: '/examples/aggregate-function-combinators/avgResample'
title: 'avgResample'
description: 'Resample 결합자(combinator)를 avg 함수와 함께 사용하는 예제'
keywords: ['avg', 'Resample', 'combinator', 'examples', 'avgResample']
sidebar_label: 'avgResample'
doc_type: 'reference'
---



# countResample \{#countResample\}



## 설명 \{#description\}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
조합자는 [`count`](/sql-reference/aggregate-functions/reference/count)
집계 함수에 적용하면, 지정된 키 컬럼 값의 개수를 고정된 개수(`N`)의 구간에 걸쳐 셀 수 있습니다.



## 사용 예시 \{#example-usage\}

### 기본 예시 \{#basic-example\}

예제를 살펴보겠습니다. 직원의 `name`, `age`, `wage`를 포함하는 테이블을 생성하고, 여기에 일부 데이터를 삽입해 보겠습니다:

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

`[30,60)` 구간과 `[60,75)` 구간(여기서 `[` 는 배제, `)` 는 포함)을 기준으로 해당 연령대 사람들의 평균 임금을 구합니다. 나이를 정수형으로 표현하므로 실제로는 `[30, 59]` 및 `[60,74]` 구간에 해당하는 나이를 얻게 됩니다. 이를 위해 `avg` 집계 함수에 `Resample` 조합자를 적용합니다.

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


## 같이 보기 \{#see-also\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample 조합자`](/sql-reference/aggregate-functions/combinators#-resample)
