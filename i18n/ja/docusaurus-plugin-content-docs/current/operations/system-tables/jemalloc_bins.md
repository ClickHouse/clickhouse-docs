---
description: "jemallocアロケーターを介して、異なるサイズクラス（ビン）でのメモリアロケーションに関する情報を、全アリーナから集約したシステムテーブル。"
slug: /operations/system-tables/jemalloc_bins
title: "jemalloc_bins"
keywords: ["システムテーブル", "jemalloc_bins"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

jemallocアロケーターを介して、異なるサイズクラス（ビン）でのメモリアロケーションに関する情報を、全アリーナから集約しています。
これらの統計は、jemalloc におけるスレッドローカルキャッシュのため、完全に正確ではない可能性があります。

カラム:

- `index` (UInt64) — サイズ順に並べられたビンのインデックス
- `large` (Bool) — 大きなアロケーションの場合は True、小さな場合は False
- `size` (UInt64) — このビンでのアロケーションのサイズ
- `allocations` (UInt64) — アロケーションの数
- `deallocations` (UInt64) — デアロケーションの数

**例**

現在の全体メモリ使用量に最も寄与したアロケーションのサイズを見つけます。

``` sql
SELECT
    *,
    allocations - deallocations AS active_allocations,
    size * active_allocations AS allocated_bytes
FROM system.jemalloc_bins
WHERE allocated_bytes > 0
ORDER BY allocated_bytes DESC
LIMIT 10
```

``` text
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
