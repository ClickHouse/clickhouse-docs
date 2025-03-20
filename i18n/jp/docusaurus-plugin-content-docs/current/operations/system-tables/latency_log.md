---
slug: /operations/system-tables/latency_log
title: "system.latency_log"
description: "すべての遅延バケットの履歴を含み、定期的にディスクにフラッシュされます。"
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# latency_log

<SystemTableCloud/>

すべての遅延バケットの履歴を含み、定期的にディスクにフラッシュされます。

Columns:
- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — イベントの日付。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — イベントの時間。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のイベント時間。

**例**

``` sql
SELECT * FROM system.latency_log LIMIT 1 FORMAT Vertical;
```

``` text
行 1:
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

**関連情報**

- [latency_log_setting](../../operations/server-configuration-parameters/settings.md#latency_log) - 設定の有効化と無効化。
- [latency_buckets](../../operations/system-tables/latency_buckets.md) - 遅延ログバケットの境界。
- [Monitoring](../../operations/monitoring.md) - ClickHouseモニタリングの基本概念。
