---
date: 2023-05-02
---

# When are TTL rules applied, and do we have control over it?

TTL is going to be ***eventually*** applied. What does that mean? The `MergeTree` table setting [`merge_with_ttl_timeout`](https://clickhouse.com/docs/en/engines/table-engines/mergetree-family/mergetree#merge_with_ttl_timeout) sets the minimum delay in seconds before repeating a merge with delete TTL. The default value is 14400 seconds (4 hours). But that is just the minimum delay, it can take longer until a merge for delete TTL is triggered.

You can view all of your current TTL settings (like `merge_with_ttl_timeout`) with this query:

```sql
SELECT *
FROM system.merge_tree_settings
WHERE name like '%ttl%'
```

The response looks like:

```response
┌─name───────────────────────────────────────────────────────────┬─value───┬─changed─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─min──┬─max──┬─readonly─┬─type───┐
│ max_replicated_merges_with_ttl_in_queue                        │ 1       │       0 │ How many tasks of merging parts with TTL are allowed simultaneously in ReplicatedMergeTree queue.                                                                                          │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ UInt64 │
│ max_number_of_merges_with_ttl_in_pool                          │ 2       │       0 │ When there is more than specified number of merges with TTL entries in pool, do not assign new merge with TTL. This is to leave free threads for regular merges and avoid "Too many parts" │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ UInt64 │
│ merge_tree_clear_old_broken_detached_parts_ttl_timeout_seconds │ 2592000 │       1 │ Remove old broken detached parts in the background if they remained intouched for a specified by this setting period of time.                                                              │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ UInt64 │
│ merge_with_ttl_timeout                                         │ 14400   │       0 │ Minimal time in seconds, when merge with delete TTL can be repeated.                                                                                                                       │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ Int64  │
│ merge_with_recompression_ttl_timeout                           │ 14400   │       0 │ Minimal time in seconds, when merge with recompression TTL can be repeated.                                                                                                                │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ Int64  │
│ ttl_only_drop_parts                                            │ 0       │       0 │ Only drop altogether the expired parts and not partially prune them.                                                                                                                       │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ Bool   │
│ materialize_ttl_recalculate_only                               │ 0       │       0 │ Only recalculate ttl info when MATERIALIZE TTL                                                                                                                                             │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ Bool   │
└────────────────────────────────────────────────────────────────┴─────────┴─────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────┴──────┴──────────┴────────┘
```

You can use `SHOW CREATE TABLE` to check if your table contains TTL rules, as well as if any of the table `SETTINGS` modified the values of the settings above:

```sql
SHOW CREATE TABLE <TableName>
```

## Force a TTL rule to be applied

This is not the most elegant solution, but you can explicitly call `MATERIALIZE TTL`, which forces all the TTL rules of a table to be materialized:

```sql
ALTER TABLE my_table
    MATERIALIZE TTL
```

## Background threads affecting TTL

It is possible that your TTL rules are not being applied because there are not enough working threads in the background pool. For example, if you insert data intensively, then the whole background pool might be utilized for normal merges. However, you can increase the background pool size.

You can check your current background pool size with this query:

```sql
SELECT *
FROM system.settings
WHERE name = 'background_pool_size';
```

The response looks like:

```response
┌─name─────────────────┬─value─┬─changed─┬─description─────────────────────┬─min──┬─max──┬─readonly─┬─type───┬─default─┬─alias_for─┐
│ background_pool_size │ 16    │       0 │ Obsolete setting, does nothing. │ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │        0 │ UInt64 │ 16      │           │
└──────────────────────┴───────┴─────────┴─────────────────────────────────┴──────┴──────┴──────────┴────────┴─────────┴───────────┘
```

Check the docs for how to modify the [`background_pool_size` setting](https://clickhouse.com/docs/en/operations/server-configuration-parameters/settings#background_pool_size), which is configured as:

```xml
<background_pool_size>16</background_pool_size>
```

You can check the current background pool activity with this query:

```sql
SELECT *
FROM system.metrics
WHERE metric like 'Background%'
```