---
'description': '包含所有延迟桶的历史记录，定期刷新到磁盘。'
'slug': '/operations/system-tables/latency_log'
'title': 'system.latency_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# latency_log

<SystemTableCloud/>

包含所有延迟桶的历史记录，定期刷新到磁盘。

列：
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 事件日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 事件时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 带有微秒分辨率的事件时间。

**示例**

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

**另请参见**

- [latency_log_setting](../../operations/server-configuration-parameters/settings.md#latency_log) - 启用和禁用该设置。
- [latency_buckets](../../operations/system-tables/latency_buckets.md) - 延迟日志桶的边界。
- [Monitoring](../../operations/monitoring.md) - ClickHouse 监控的基本概念。
