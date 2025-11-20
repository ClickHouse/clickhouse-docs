---
'slug': '/guides/developer/on-the-fly-mutations'
'sidebar_label': '즉석 변형'
'title': '즉석 변형'
'keywords':
- 'On-the-fly mutation'
'description': '즉석 변형에 대한 설명을 제공합니다.'
'doc_type': 'guide'
---

## 즉석에서의 변형 {#on-the-fly-mutations}

즉석에서의 변형이 활성화되면, 업데이트된 행은 즉시 업데이트된 것으로 표시되고 이후의 `SELECT` 쿼리는 변경된 값으로 자동으로 반환됩니다. 즉석에서의 변형이 활성화되지 않은 경우, 변경된 값을 보기 위해 변형이 백그라운드 프로세스를 통해 적용될 때까지 기다려야 할 수 있습니다.

즉석에서의 변형은 쿼리 수준 설정 `apply_mutations_on_fly`를 활성화하여 `MergeTree` 계열 테이블에 대해 활성화할 수 있습니다.

```sql
SET apply_mutations_on_fly = 1;
```

## 예제 {#example}

테이블을 만들고 몇 가지 변형을 실행해 보겠습니다:
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

업데이트의 결과를 `SELECT` 쿼리를 통해 확인해 보겠습니다:

```sql
-- Explicitly disable on-the-fly-mutations
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

새 테이블을 쿼리할 때 행의 값이 아직 업데이트되지 않았음을 주의하십시오:

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

이제 즉석에서의 변형을 활성화했을 때 어떤 일이 발생하는지 살펴보겠습니다:

```sql
-- Enable on-the-fly mutations
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

이제 `SELECT` 쿼리는 변형이 적용될 때까지 기다릴 필요 없이 즉시 올바른 결과를 반환합니다:

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## 성능 영향 {#performance-impact}

즉석에서의 변형이 활성화되면, 변형은 즉시 구체화되지 않고 `SELECT` 쿼리 중에만 적용됩니다. 그러나 변형은 여전히 백그라운드에서 비동기적으로 구체화되고 있으며, 이는 무거운 프로세스입니다.

제출된 변형의 수가 일정 기간 동안 백그라운드에서 처리되는 변형의 수를 지속적으로 초과하면 적용해야 할 구체화되지 않은 변형의 큐가 계속 증가할 것입니다. 이로 인해 `SELECT` 쿼리 성능이 결국 저하될 수 있습니다.

구체화되지 않은 변형의 무한 성장을 제한하기 위해 `apply_mutations_on_fly` 설정을 `number_of_mutations_to_throw` 및 `number_of_mutations_to_delay`와 같은 다른 `MergeTree` 수준 설정과 함께 활성화하는 것을 권장합니다.

## 하위 쿼리 및 비결정론적 함수에 대한 지원 {#support-for-subqueries-and-non-deterministic-functions}

즉석에서의 변형은 하위 쿼리 및 비결정론적 함수에 대해 제한된 지원을 제공합니다. 합리적인 크기의 결과를 갖는 스칼라 하위 쿼리만 지원되며(설정 `mutations_max_literal_size_to_replace`로 제어됨), 오직 상수 비결정론적 함수만 지원됩니다(예: 함수 `now()`).

이러한 동작은 다음 설정에 의해 제어됩니다:

- `mutations_execute_nondeterministic_on_initiator` - true인 경우, 비결정론적 함수는 이니시에이터 복제본에서 실행되며 `UPDATE` 및 `DELETE` 쿼리에서 리터럴로 대체됩니다. 기본값: `false`.
- `mutations_execute_subqueries_on_initiator` - true인 경우, 스칼라 하위 쿼리는 이니시에이터 복제본에서 실행되며 `UPDATE` 및 `DELETE` 쿼리에서 리터럴로 대체됩니다. 기본값: `false`.
- `mutations_max_literal_size_to_replace` - `UPDATE` 및 `DELETE` 쿼리에서 대체할 직렬화된 리터럴의 최대 크기(바이트)입니다. 기본값: `16384` (16 KiB).
