---
date: 2024-04-22
title: Comparing metrics between queries
description: A query to compare metrics between two queries in ClickHouse.
keywords: [compare queries, compare metrics, query performance]
---

# Comparing metrics between queries

To compare metrics between two queries, you must first obtain the `query_id` for both queries.

You can then run the following query:

```sql
WITH
    initial_query_id = '82142964-0b5d-4263-b996-302ce14bd779' AS second,
    initial_query_id = '7ea39e31-2f89-4085-843c-7246cb3baa5c' AS first
SELECT
    PE.Names AS metric,
    sumIf(PE.Values, first) AS v1,
    sumIf(PE.Values, second) AS v2,
    10 * log10(v2 / v1) AS dB
FROM clusterAllReplicas(
    default, system.query_log)
ARRAY JOIN ProfileEvents AS PE
WHERE (first OR second)
    AND (event_date >= today() - 3) AND (type = 2)
GROUP BY metric
HAVING v1 != v2
ORDER BY
    dB DESC,
    v2 DESC,
    metric ASC FORMAT PrettyCompactMonoBlock

WITH
    initial_query_id = '82142964-0b5d-4263-b996-302ce14bd779' AS second,
    initial_query_id = '7ea39e31-2f89-4085-843c-7246cb3baa5c' AS first
SELECT
    PE.Names AS metric,
    sumIf(PE.Values, first) AS v1,
    sumIf(PE.Values, second) AS v2,
    10 * log10(v2 / v1) AS dB
FROM clusterAllReplicas(default, system.query_log)
ARRAY JOIN ProfileEvents AS PE
WHERE (first OR second) AND (event_date >= (today() - 3)) AND (type = 2)
GROUP BY metric
HAVING v1 != v2
ORDER BY
    dB DESC,
    v2 DESC,
    metric ASC
FORMAT PrettyCompactMonoBlock
```

You will receive a table with metrics comparing the two queries:

```sql
Query id: d7747d26-a231-47c8-ae8c-284895b1aeaf

┌─metric──────────────────────────────────────┬─────────v1─┬─────────v2─┬───────────────────────dB─┐
│ SystemTimeMicroseconds                      │   13812127 │   24081938 │       2.4143087099482767 │
│ SoftPageFaults                              │    2651887 │    4056889 │        1.846381108610876 │
│ DiskReadElapsedMicroseconds                 │    1113947 │    1273786 │        0.582319430863304 │
│ CachedReadBufferReadFromCacheMicroseconds   │    1126505 │    1285450 │         0.57322064922068 │
│ OSCPUVirtualTimeMicroseconds                │   70301588 │   80045377 │       0.5637111926869545 │
│ RealTimeMicroseconds                        │   86686457 │   96339471 │       0.4585300419916516 │
│ QueryProfilerRuns                           │        157 │        174 │       0.4464959587336597 │
│ NetworkSendBytes                            │     868197 │     940859 │        0.349062627796429 │
│ NetworkReceiveElapsedMicroseconds           │        161 │        174 │       0.3372337225075003 │
│ ArenaAllocBytes                             │ 1480589312 │ 1497366528 │      0.04893510724370622 │
│ OSWriteBytes                                │     380928 │     385024 │      0.04644905045763538 │
│ ArenaAllocChunks                            │       2153 │       2157 │      0.00806115279057892 │
│ FileOpen                                    │       7511 │       7516 │    0.0028900944828012766 │
│ OpenedFileCacheMisses                       │       7511 │       7516 │    0.0028900944828012766 │
│ ContextLock                                 │       5880 │       5881 │    0.0007385332589917156 │
│ OSReadChars                                 │ 2340791432 │ 2340789818 │ -0.000002994506583727971 │
│ OSWriteChars                                │    2521310 │    2513992 │    -0.012623549714419216 │
│ AggregationPreallocatedElementsInHashTables │  128039910 │  127563540 │    -0.016187974135432794 │
│ OSCPUWaitMicroseconds                       │    1543643 │    1536999 │    -0.018732829140838268 │
│ OpenedFileCacheHits                         │        539 │        534 │    -0.040475081581823065 │
│ UserTimeMicroseconds                        │   56490840 │   55961729 │     -0.04086908559606555 │
│ WaitMarksLoadMicroseconds                   │     388571 │     359985 │      -0.3318598023153847 │
│ ThreadpoolReaderTaskMicroseconds            │    3816669 │    3392522 │      -0.5116182478775457 │
│ NetworkSendElapsedMicroseconds              │       4745 │       4122 │      -0.6112822932011739 │
│ AsynchronousReadWaitMicroseconds            │    2380284 │    2025078 │      -0.7018702173136342 │
│ NetworkReceiveBytes                         │        516 │        372 │      -1.4210676174531387 │
└─────────────────────────────────────────────┴────────────┴────────────┴──────────────────────────┘

26 rows in set. Elapsed: 0.173 sec. Processed 5.86 million rows, 2.40 GB (33.92 million rows/s., 13.92 GB/s.)
```