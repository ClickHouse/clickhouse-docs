---
slug: /en/guides/developer/lightweght-update
sidebar_label: Lightweight Update
title: Lightweight Update
keywords: [lightweight update]
---

## On-fly mutations

On-fly mutation is an implementation of the lightweight update feature. It can be enabled for `MergeTree`-family tables by query-level setting `apply_mutations_on_fly`. On-fly mutations help to achieve the behaviour when you see the effect of `UPDATE` or `DELETE` queries on `SELECT`-s immediately after the `UPDATE` or `DELETE` query is finished. With enabled `apply_mutations_on_fly` all mutations that are not materialized but should be applied for data part will be applied during `SELECT` queries. Only `UPDATE` and `DELETE` mutations can be applied on-fly.


Note: mutations are still being materialized asynchronously in background by a heavy process. You should be careful with enabling setting `apply_mutations_on_fly`. If the number of submitted mutations constantly exceeds the number of mutation that are processed in background in some time interval, the queue of unmaterialized mutations that have to be applied on-fly will grow and the performance of `SELECT`-s will degrade eventually. It's suggested to enable setting `apply_mutations_on_fly` together with another `MergeTree`-level settings `number_of_mutations_to_throw` and `number_of_mutations_to_delay` which restrict the infinite grow of number of unmaterialized mutations.

Note: applying on-fly mutations with subqueries and non-deterministic functions has limited support. Only scalar subqueries with a result that have a reasonable size (controlled by setting `mutations_max_literal_size_to_replace`) are supported. Only constant non-deterministic functions are supported (e.g. function `now()`). This behaviour is controlled by settings:

- `mutations_execute_nondeterministic_on_initiator` - if true nondeterministic function are executed on initiator and replaced to literals in `UPDATE` and `DELETE` queries. Default value: `false`.
- `mutations_execute_subqueries_on_initiator` - if true scalar subqueries are executed on initiator and replaced to literals in `UPDATE` and `DELETE` queries. Default value: `false`.
 - `mutations_max_literal_size_to_replace` - The maximum size of serialized literal in bytes to replace in `UPDATE` and `DELETE` queries. Default value: `16384` (16 KiB).
 
## Example

Let's create a table and run some mutations:
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String) 
ENGINE = MergeTree ORDER BY id;

-- Disable background materialization of mutations.
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

Let's check the result of `SELECT` queries:
```sql
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

```
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

```sql
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

```
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```
