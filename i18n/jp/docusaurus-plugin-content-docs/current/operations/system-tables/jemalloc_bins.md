---
'description': 'システムテーブルは、さまざまなサイズクラス（ビン）でjemallocアロケータを介して行われたメモリ割り当てに関する情報を、すべてのアリーナから集約して含んでいます。'
'keywords':
- 'system table'
- 'jemalloc_bins'
'slug': '/operations/system-tables/jemalloc_bins'
'title': 'system.jemalloc_bins'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

jemallocアロケーターを介して行われたメモリ割り当てに関する情報が、異なるサイズクラス（ビン）からすべてのアリーナを集計して含まれています。これらの統計は、jemallocにおけるスレッドローカルキャッシュのため、完全に正確ではない可能性があります。

カラム:

- `index` (UInt64) — サイズで順序付けられたビンのインデックス
- `large` (Bool) — 大きな割り当ての場合はTrue、小さな場合はFalse
- `size` (UInt64) — このビンの割り当てサイズ
- `allocations` (UInt64) — 割り当ての数
- `deallocations` (UInt64) — 解放の数

**例**

現在の全体的なメモリ使用量に最も寄与した割り当てのサイズを見つける。

```sql
SELECT
    *,
    allocations - deallocations AS active_allocations,
    size * active_allocations AS allocated_bytes
FROM system.jemalloc_bins
WHERE allocated_bytes > 0
ORDER BY allocated_bytes DESC
LIMIT 10
```

```text
┌─index─┬─large─┬─────size─┬─allocactions─┬─deallocations─┬─active_allocations─┬─allocated_bytes─┐
│    82 │     1 │ 50331648 │            1 │             0 │                  1 │        50331648 │
│    10 │     0 │      192 │       512336 │        370710 │             141626 │        27192192 │
│    69 │     1 │  5242880 │            6 │             2 │                  4 │        20971520 │
│     3 │     0 │       48 │     16938224 │      16559484 │             378740 │        18179520 │
│    28 │     0 │     4096 │       122924 │        119142 │               3782 │        15491072 │
│    61 │     1 │  1310720 │        44569 │         44558 │                 11 │        14417920 │
│    39 │     1 │    28672 │         1285 │           913 │                372 │        10665984 │
│     4 │     0 │       64 │      2837225 │       2680568 │             156657 │        10026048 │
│     6 │     0 │       96 │      2617803 │       2531435 │              86368 │         8291328 │
│    36 │     1 │    16384 │        22431 │         21970 │                461 │         7553024 │
└───────┴───────┴──────────┴──────────────┴───────────────┴────────────────────┴─────────────────┘
```
