---
slug: '/operations/system-tables/jemalloc_bins'
description: 'Системная таблица, содержащая информацию о распределении памяти, выполненном'
title: system.jemalloc_bins
keywords: ['системная таблица', 'jemalloc_bins']
doc_type: reference
---
import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

Содержит информацию о распределении памяти, выполненном через аллокатор jemalloc в различных классах размеров (это ведра), агрегированную из всех арен. Эти статистические данные могут быть не абсолютно точными из-за кэширования на уровне потоков в jemalloc.

Столбцы:

- `index` (UInt64) — Индекс ведра, упорядоченный по размеру
- `large` (Bool) — True для больших распределений и False для малых
- `size` (UInt64) — Размер распределений в этом ведре
- `allocations` (UInt64) — Количество распределений
- `deallocations` (UInt64) — Количество освобождений памяти

**Пример**

Найдите размеры распределений, которые больше всего способствовали текущему общему использованию памяти.

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