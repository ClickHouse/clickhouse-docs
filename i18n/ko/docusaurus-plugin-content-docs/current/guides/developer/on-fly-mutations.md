---
slug: /guides/developer/on-the-fly-mutations
sidebar_label: '온더플라이 뮤테이션'
title: '온더플라이 뮤테이션'
keywords: ['온더플라이 뮤테이션']
description: '온더플라이 뮤테이션에 대해 설명합니다'
doc_type: 'guide'
---

## 온더플라이 뮤테이션 \{#on-the-fly-mutations\}

온더플라이 뮤테이션이 활성화되어 있으면 업데이트된 행은 즉시 갱신된 것으로 표시되며, 이후 `SELECT` 쿼리는 변경된 값을 자동으로 반환합니다. 온더플라이 뮤테이션이 비활성화되어 있으면 변경된 값을 확인하기 위해, 백그라운드 프로세스를 통해 뮤테이션이 적용될 때까지 기다려야 할 수 있습니다.

온더플라이 뮤테이션은 쿼리 수준 SETTING인 `apply_mutations_on_fly`를 활성화하여 `MergeTree` 계열 테이블에서 사용할 수 있습니다.

```sql
SET apply_mutations_on_fly = 1;
```


## 예시 \{#example\}

테이블을 하나 생성한 후 몇 가지 뮤테이션을 실행합니다:

```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- Disable background materialization of mutations to showcase
-- default behavior when on-the-fly mutations are not enabled
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- Insert some rows in our new table
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- Update the values of the rows
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

`SELECT` 쿼리를 통해 업데이트 결과를 확인해 보겠습니다:

```sql
-- Explicitly disable on-the-fly-mutations
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

새 테이블을 쿼리할 때는 행 값이 아직 업데이트되지 않았다는 점에 유의하십시오.

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

이제 실시간 뮤테이션(on-the-fly mutations)을 활성화했을 때 어떤 일이 발생하는지 살펴보겠습니다.

```sql
-- Enable on-the-fly mutations
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` 쿼리는 이제 뮤테이션이 적용되기를 기다리지 않고도 즉시 올바른 결과를 반환합니다.

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```


## 성능 영향 \{#performance-impact\}

on-the-fly 뮤테이션이 활성화되어 있으면 뮤테이션은 즉시 구체화되지 않고 `SELECT` 쿼리가 실행될 때에만 적용됩니다. 다만 뮤테이션은 여전히 백그라운드에서 비동기적으로 구체화되고 있으며, 이는 부하가 큰 작업임을 유의해야 합니다.

제출되는 뮤테이션 수가 일정 시간 동안 백그라운드에서 처리되는 뮤테이션 수를 지속적으로 초과하는 경우, 적용되어야 하는 구체화되지 않은 뮤테이션의 대기열이 계속 증가하게 됩니다. 이로 인해 결국 `SELECT` 쿼리 성능이 저하됩니다.

구체화되지 않은 뮤테이션의 무제한 증가를 제한하기 위해, `apply_mutations_on_fly` 설정을 `number_of_mutations_to_throw`, `number_of_mutations_to_delay`와 같은 다른 `MergeTree` 수준 설정과 함께 활성화할 것을 권장합니다.

## 서브쿼리와 비결정적 함수 지원 \{#support-for-subqueries-and-non-deterministic-functions\}

실시간 뮤테이션은 서브쿼리와 비결정적 함수에 대해 제한적으로만 지원됩니다. 결과 크기가 적절한 범위(설정 `mutations_max_literal_size_to_replace` 로 제어됨)인 스칼라 서브쿼리만 지원됩니다. 비결정적 함수는 상수인 경우에만 지원됩니다(예: 함수 `now()`).

이러한 동작은 다음 설정으로 제어됩니다.

- `mutations_execute_nondeterministic_on_initiator` - `true`인 경우 비결정적 함수가 이니시에이터 레플리카에서 실행되고, `UPDATE` 및 `DELETE` 쿼리에서 리터럴로 대체됩니다. 기본값: `false`.
- `mutations_execute_subqueries_on_initiator` - `true`인 경우 스칼라 서브쿼리가 이니시에이터 레플리카에서 실행되고, `UPDATE` 및 `DELETE` 쿼리에서 리터럴로 대체됩니다. 기본값: `false`.
- `mutations_max_literal_size_to_replace` - `UPDATE` 및 `DELETE` 쿼리에서 대체할 직렬화된 리터럴의 최대 크기(바이트 단위)입니다. 기본값: `16384`(16 KiB).