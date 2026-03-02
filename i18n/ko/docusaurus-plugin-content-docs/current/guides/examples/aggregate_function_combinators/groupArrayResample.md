---
slug: '/examples/aggregate-function-combinators/groupArrayResample'
title: 'groupArrayResample'
description: 'groupArray와 함께 Resample 조합자를 사용하는 예제'
keywords: ['groupArray', 'Resample', 'combinator', 'examples', 'groupArrayResample']
sidebar_label: 'groupArrayResample'
doc_type: 'reference'
---



# groupArrayResample \{#grouparrayresample\}



## Description \{#description\}

[`Resample`](/sql-reference/aggregate-functions/combinators#-resample) 
콤비네이터는 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 집계 함수에 적용하여,
지정된 키 컬럼의 범위를 고정된 개수(`N`)의 구간으로 분할한 다음,
각 구간에 속하는 데이터 포인트들로부터 하나의 대표값
(키가 최소인 값에 해당하는 값)을 선택해 결과 배열을 구성합니다.
이는 모든 값을 수집하는 대신 데이터에 대한 다운샘플링된 뷰를 생성합니다.



## 사용 예시 \{#example-usage\}

예제를 살펴보겠습니다. 직원의 `name`, `age`, `wage`를 포함하는 테이블을 생성하고,
그 안에 몇 개의 행을 INSERT하겠습니다:

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

`[30,60)` 구간과 `[60,75)` 구간에 속하는 사람들의 이름을 가져옵니다. 나이를 정수로 표현하기 때문에 실제로는 `[30, 59]`와 `[60,74]` 구간에 해당하는 나이를 갖게 됩니다.

이름을 배열로 집계하기 위해 `groupArray` 집계 함수를 사용합니다.
이 함수는 인수를 하나 받습니다. 여기서는 이름 컬럼을 인수로 사용합니다. `groupArrayResample`
함수는 나이 컬럼을 사용해 나이별로 이름을 집계해야 합니다. 필요한 구간을 정의하기 위해
`30`, `75`, `30`을 `groupArrayResample` 함수의 인수로 전달합니다:

```sql
SELECT groupArrayResample(30, 75, 30)(name, age) FROM employee_data
```

```response
┌─groupArrayResample(30, 75, 30)(name, age)─────┐
│ [['Alice','Mary','Evelyn'],['David','Brian']] │
└───────────────────────────────────────────────┘
```


## 함께 보기 \{#see-also\}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Resample combinator`](/sql-reference/aggregate-functions/combinators#-resample)
