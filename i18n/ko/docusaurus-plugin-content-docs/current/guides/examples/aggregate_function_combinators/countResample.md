---
slug: '/examples/aggregate-function-combinators/countResample'
title: 'countResample'
description: 'count와 함께 Resample 결합자를 사용하는 예'
keywords: ['count', 'Resample', 'combinator', '예시', 'countResample']
sidebar_label: 'countResample'
doc_type: 'reference'
---



# countResample \{#countResample\}



## 설명 \{#description\}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
조합자는 [`count`](/sql-reference/aggregate-functions/reference/count)
집계 함수에 적용하여, 지정된 키 컬럼 값의 개수를 고정된 개수의 구간(`N`)으로 나누어 셀 수 있습니다.



## 사용 예시 \{#example-usage\}

### 기본 예시 \{#basic-example\}

예제를 살펴보겠습니다. 직원의 `name`, `age`, `wage`를 포함하는 테이블을 만들고,
여기에 몇 개의 데이터를 삽입합니다:

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

`[30,60)`과 `[60,75)` 구간에 속하는 모든 사람 수를 세어 보겠습니다.
나이를 정수형으로 표현하므로 실제로는 `[30, 59]` 및 `[60, 74]` 구간의 나이를 대상으로 하게 됩니다.
이를 위해 `count`에 `Resample` 조합자(combinator)를 적용합니다.

```sql
SELECT countResample(30, 75, 30)(name, age) AS amount FROM employee_data
```

```response
┌─amount─┐
│ [3,2]  │
└────────┘
```


## 함께 보기 \{#see-also\}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
