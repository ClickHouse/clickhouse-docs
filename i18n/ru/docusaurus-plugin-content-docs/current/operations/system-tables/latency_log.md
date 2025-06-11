---
description: 'Содержит историю всех бакетов задержки, периодически сбрасываемых на диск.'
slug: /operations/system-tables/latency_log
title: 'system.latency_log'
---

import SystemTableCloud from '@site/i18n/docusaurus-plugin-content-docs/ru/current/_snippets/_system_table_cloud.md';


# latency_log

<SystemTableCloud/>

Содержит историю всех бакетов задержки, периодически сбрасываемых на диск.

Колонки:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — Имя хоста сервера, выполняющего запрос.
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — Дата события.
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — Время события.
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — Время события с разрешением в микросекундах.

**Пример**

```sql
SELECT * FROM system.latency_log LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                                              clickhouse.eu-central1.internal
event_date:                                            2024-09-19
event_time:                                            2024-09-19 17:09:17
event_time_microseconds:                               2024-09-19 17:09:17.712477
LatencyEvent_S3FirstByteReadAttempt1Microseconds:      [278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278]
LatencyEvent_S3FirstByteWriteAttempt1Microseconds:     [1774,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776]
LatencyEvent_S3FirstByteReadAttempt2Microseconds:      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_S3FirstByteWriteAttempt2Microseconds:     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_S3FirstByteReadAttemptNMicroseconds:      [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_S3FirstByteWriteAttemptNMicroseconds:     [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_S3ReadConnectMicroseconds:                [1,1,1,1,1,1,1,1,1,1]
LatencyEvent_S3WriteConnectMicroseconds:               [329,362,362,363,363,363,363,363,363,363]
LatencyEvent_DiskS3FirstByteReadAttempt1Microseconds:  [278,278,278,278,278,278,278,278,278,278,278,278,278,278,278,278]
LatencyEvent_DiskS3FirstByteWriteAttempt1Microseconds: [1774,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776,1776]
LatencyEvent_DiskS3FirstByteReadAttempt2Microseconds:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_DiskS3FirstByteWriteAttempt2Microseconds: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_DiskS3FirstByteReadAttemptNMicroseconds:  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_DiskS3FirstByteWriteAttemptNMicroseconds: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
LatencyEvent_DiskS3ReadConnectMicroseconds:            [1,1,1,1,1,1,1,1,1,1]
LatencyEvent_DiskS3WriteConnectMicroseconds:           [329,362,362,363,363,363,363,363,363,363]
```

**См. также**

- [latency_log_setting](../../operations/server-configuration-parameters/settings.md#latency_log) - Включение и отключение настройки.
- [latency_buckets](../../operations/system-tables/latency_buckets.md) - Границы бакетов журнала задержки.
- [Monitoring](../../operations/monitoring.md) - Основные понятия мониторинга ClickHouse.
