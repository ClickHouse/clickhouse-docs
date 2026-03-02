---
title: 'system.fail_points'
slug: '/en/operations/system-tables/fail_points'
description: '사용 가능한 모든 failpoint의 유형과 현재 상태를 나열합니다.'
keywords: ['system table', 'fail_points', 'failpoint', 'testing', 'debug']
doc_type: 'reference'
---

# system.fail_points \{#fail_points\}

서버에 등록된 사용 가능한 모든 failpoint와 해당 유형, 현재 활성화 상태를 포함합니다.

failpoint는 실행 중에 `SYSTEM ENABLE FAILPOINT` 및 `SYSTEM DISABLE FAILPOINT` SQL 문을 사용하여 활성화하거나 비활성화할 수 있습니다.

## 컬럼 \{#columns\}

- `name` ([String](../../sql-reference/data-types/string.md)) — failpoint의 이름입니다.
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — failpoint의 유형입니다. 가능한 값은 다음과 같습니다.
  - `'once'` — 한 번만 트리거된 뒤 자동으로 비활성화됩니다.
  - `'regular'` — failpoint에 도달할 때마다 트리거됩니다.
  - `'pauseable_once'` — 명시적으로 재개될 때까지 한 번 실행을 차단합니다.
  - `'pauseable'` — 명시적으로 재개될 때까지 failpoint에 도달할 때마다 실행을 차단합니다.
- `enabled` ([UInt8](../../sql-reference/data-types/int-uint.md)) — failpoint가 현재 활성화되어 있는지 여부입니다. `1`은 활성화, `0`은 비활성화를 의미합니다.

## 예제 \{#example\}

```sql
SYSTEM ENABLE FAILPOINT replicated_merge_tree_insert_retry_pause;
SELECT * FROM system.fail_points WHERE enabled = 1
```

```text
┌─name──────────────────────────────────────┬─type────────────┬─enabled─┐
│ replicated_merge_tree_insert_retry_pause  │ pauseable_once  │       1 │
└───────────────────────────────────────────┴─────────────────┴─────────┘
```
