---
description: '마스킹 정책(Masking Policy)에 대한 문서'
sidebar_label: 'MASKING POLICY'
sidebar_position: 42
slug: /sql-reference/statements/create/masking-policy
title: 'CREATE MASKING POLICY'
doc_type: 'reference'
---

import CloudOnlyBadge from '@theme/badges/CloudOnlyBadge';

<CloudOnlyBadge />

마스킹 정책을 생성합니다. 마스킹 정책은 특정 사용자 또는 역할이 테이블을 쿼리할 때 해당 컬럼 값을 동적으로 변환하거나 마스킹할 수 있도록 합니다.

:::tip
마스킹 정책은 저장된 데이터를 수정하지 않고 쿼리 시점에 민감한 데이터를 변환하거나 마스킹함으로써 컬럼 수준의 데이터 보안을 제공합니다.
:::

구문:

```sql
CREATE MASKING POLICY [IF NOT EXISTS | OR REPLACE] policy_name ON [database.]table
    UPDATE column1 = expression1 [, column2 = expression2 ...]
    [WHERE condition]
    TO {role1 [, role2 ...] | ALL | ALL EXCEPT role1 [, role2 ...]}
    [PRIORITY priority_number]
```


## UPDATE 절 \{#update-clause\}

`UPDATE` 절은 마스킹할 컬럼과 어떻게 변환할지를 지정합니다. 하나의 정책에서 여러 컬럼을 마스킹할 수 있습니다.

예:

- 단순 마스킹: `UPDATE email = '***masked***'`
- 부분 마스킹: `UPDATE email = concat(substring(email, 1, 3), '***@***.***')`
- 해시 기반 마스킹: `UPDATE email = concat('masked_', substring(hex(cityHash64(email)), 1, 8))`
- 여러 컬럼 마스킹: `UPDATE email = '***@***.***', phone = '***-***-****'`

## WHERE 절 \{#where-clause\}

선택적인 `WHERE` 절은 행 값에 따라 조건부 마스킹을 수행할 수 있도록 합니다. 조건을 만족하는 행에만 마스킹이 적용됩니다.

예시:

```sql
CREATE MASKING POLICY mask_high_salaries ON employees
UPDATE salary = 0
WHERE salary > 100000
TO analyst;
```


## TO 절 \{#to-clause\}

`TO` 섹션에서는 어떤 사용자와 역할에 정책을 적용할지 지정합니다.

- `TO user1, user2`: 특정 사용자/역할에 적용합니다
- `TO ALL`: 모든 사용자에게 적용합니다
- `TO ALL EXCEPT user1, user2`: 지정된 사용자를 제외한 모든 사용자에게 적용합니다

:::note
행 정책과는 달리, 마스킹 정책은 해당 정책이 적용되지 않은 사용자에게는 영향을 주지 않습니다. 어떤 사용자에게도 마스킹 정책이 적용되지 않으면, 원본 데이터를 그대로 보게 됩니다.
:::

## PRIORITY 절 \{#priority-clause\}

특정 사용자에 대해 동일한 컬럼을 대상으로 여러 마스킹 정책이 정의된 경우, `PRIORITY` 절이 적용 순서를 결정합니다. 정책은 우선순위가 높은 것부터 낮은 것 순으로 적용됩니다.

기본 우선순위는 0입니다. 동일한 우선순위를 가진 정책은 정의되지 않은 순서로 적용됩니다.

예시:

```sql
-- Applied second (lower priority)
CREATE MASKING POLICY mask1 ON users
UPDATE email = 'low@priority.com'
TO analyst
PRIORITY 1;

-- Applied first (higher priority)
CREATE MASKING POLICY mask2 ON users
UPDATE email = 'high@priority.com'
TO analyst
PRIORITY 10;

-- analyst sees 'low@priority.com' because it's applied last
```

:::note 성능 고려사항

* 마스킹 정책은 표현식의 복잡성에 따라 쿼리 성능에 영향을 줄 수 있습니다
* 마스킹 정책이 활성화된 테이블에서는 일부 최적화가 비활성화될 수 있습니다
  :::
