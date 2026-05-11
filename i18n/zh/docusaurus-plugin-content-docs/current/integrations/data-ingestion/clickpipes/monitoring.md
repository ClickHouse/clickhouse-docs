---
sidebar_label: '监控'
description: '使用 Prometheus 指标监控 ClickPipes。'
slug: /integrations/clickpipes/monitoring
title: '监控 ClickPipes'
doc_type: 'reference'
keywords: ['ClickPipes', '监控', '指标', 'Prometheus', '可观测性']
---

# 监控 ClickPipes \{#monitoring-clickpipes\}

除了在控制台中监控外，ClickPipes 还通过一个[兼容 Prometheus 的端点](/integrations/prometheus)公开指标，以供抓取。这些指标会与其他 ClickHouse Cloud 服务指标一同发布，使您能够将 ClickPipes 监控集成到现有的可观测性堆栈中 (例如 [Grafana](/integrations/prometheus#integrating-with-grafana)、[Datadog](/integrations/prometheus#integrating-with-datadog)) 。

## 指标标签 \{#metric-labels\}

ClickPipes 指标使用[标准服务级标签](/integrations/prometheus#metric-labels) (`clickhouse_org`、`clickhouse_service`、`clickhouse_service_name`) ，以及以下 ClickPipes 专用标签：

| 标签                 | 说明                                                     |
| ------------------ | ------------------------------------------------------ |
| `clickpipe_id`     | ClickPipe 的唯一标识符                                       |
| `clickpipe_name`   | ClickPipe 的名称                                          |
| `clickpipe_source` | 数据源类型 (例如：`kafka`、`postgres`、`s3`)                     |
| `clickpipe_state`  | ClickPipe 的状态 (例如：`Stopped`、`Provisioning`、`Running`)  |

### 响应示例 \{#sample-response\}

以下展示了 ClickPipes 指标在 Prometheus 抓取响应中的示例：

```response
# HELP ClickPipes_Info Always equal to 1. Label "clickpipe_state" contains the current state of the pipe: Stopped/Provisioning/Running/Paused/Failed
# TYPE ClickPipes_Info gauge
ClickPipes_Info{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent",clickpipe_state="Running"} 1

# HELP ClickPipes_FetchedEvents_Total Total number of records fetched from the source.
# TYPE ClickPipes_FetchedEvents_Total counter
ClickPipes_FetchedEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 5535376

# HELP ClickPipes_SentEvents_Total Total number of records sent to ClickHouse
# TYPE ClickPipes_SentEvents_Total counter
ClickPipes_SentEvents_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 5534250

# HELP ClickPipes_FetchedBytes_Total Total uncompressed bytes fetched from the source.
# TYPE ClickPipes_FetchedBytes_Total counter
ClickPipes_FetchedBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 873286202

# HELP ClickPipes_SentBytes_Total Total uncompressed bytes sent to ClickHouse.
# TYPE ClickPipes_SentBytes_Total counter
ClickPipes_SentBytes_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 477187967

# HELP ClickPipes_Errors_Total Total errors ingesting data.
# TYPE ClickPipes_Errors_Total counter
ClickPipes_Errors_Total{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 0

# HELP ClickPipes_Latency Time in milliseconds between when the record was produced to when it was written to ClickHouse.
# TYPE ClickPipes_Latency gauge
ClickPipes_Latency{clickhouse_org="11dfa1ec-767d-43cb-bfad-618ce2aaf959",clickhouse_service="82b83b6a-5568-4a82-aa78-fed9239db83f",clickhouse_service_name="my service",clickpipe_id="642bb967-940b-459e-9f63-a2833f62ec44",clickpipe_name="my kafka pipe",clickpipe_source="confluent"} 340
```

## 可用指标 \{#available-metrics\}

### 数据传输 \{#metrics-data-transfer\}

| 指标                                     | 类型      | 描述                                                           |
| ------------------------------------------ | ------- | ------------------------------------------------------------ |
| `ClickPipes_FetchedBytes_Total`            | Counter | 从源端拉取的未压缩字节总数。                                               |
| `ClickPipes_FetchedBytesCompressed_Total`  | Counter | 从源端拉取的压缩字节总数。如果源数据未压缩，则与 `ClickPipes_FetchedBytes_Total` 相同。 |
| `ClickPipes_FetchedBytesInitialLoad_Total` | Counter | **CDC ClickPipes** 在初始加载阶段拉取的未压缩字节总数。                        |
| `ClickPipes_FetchedBytesResync_Total`      | Counter | **CDC ClickPipes** 在重新同步期间拉取的未压缩字节总数。                        |
| `ClickPipes_SentBytes_Total`               | Counter | 发送到 ClickHouse 的未压缩字节总数。                                     |
| `ClickPipes_SentBytesCompressed_Total`     | Counter | 发送到 ClickHouse 的压缩字节总数。                                      |

### 事件和记录 \{#metrics-events\}

| 指标                                  | 类型      | 描述                                                                                |
| ----------------------------------- | ------- | --------------------------------------------------------------------------------- |
| `ClickPipes_FetchedEvents_Total`    | Counter | 从源端拉取的记录总数。                                                                       |
| `ClickPipes_SentEvents_Total`       | Counter | 发送到 ClickHouse 的记录总数。                                                             |
| `ClickPipes_FetchedEvents_PerTable` | Gauge   | **CDC ClickPipes** 按目标表和事件类型统计的拉取记录数。使用额外的 `destination_table` 和 `event_type` 标签。 |

### 错误 \{#metrics-errors\}

| 指标                        | 类型      | 描述                                                        |
| ------------------------- | ------- | --------------------------------------------------------- |
| `ClickPipes_Errors_Total` | Counter | 摄取过程中遇到的[错误](/integrations/clickpipes#error-reporting)总数。 |

### 延迟 \{#metrics-latency\}

| 指标                                        | 类型            | 描述                                                                                    |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| `ClickPipes_Latency`                      | Gauge (*avg*) | 记录从源端生成到写入 ClickHouse 之间的时间，单位为毫秒。                                                    |
| `ClickPipes_SourceReplicationLatency_MiB` | Gauge (*avg*) | **CDC ClickPipes** 在源端的复制延迟，单位为 MiB。对于 Postgres ClickPipes，这反映的是 replication slot 延迟。 |

### 资源使用情况 \{#metrics-resources\}

| 指标                               | 类型             | 描述                     |
| -------------------------------- | -------------- | ---------------------- |
| `ClickPipes_Replica_CPUUsage`    | Gauge (*avg*)  | 摄取副本的平均 CPU 使用率，单位为毫核。 |
| `ClickPipes_Replica_CPULimit`    | Gauge (*last*) | 摄取副本配置的 CPU 上限，单位为毫核。  |
| `ClickPipes_Replica_MemoryUsage` | Gauge (*avg*)  | 摄取副本的平均内存使用量，单位为字节。    |
| `ClickPipes_Replica_MemoryLimit` | Gauge (*last*) | 摄取副本配置的内存上限，单位为字节。     |

### 状态和进度 \{#metrics-state\}

| 指标                              | 类型    | 描述                                                        |
| ------------------------------- | ----- | --------------------------------------------------------- |
| `ClickPipes_Info`               | Gauge | 始终等于 `1`。使用 `clickpipe_state` 标签可按 ClickPipe 状态进行筛选或设置告警。 |
| `ClickPipes_LastFetchedBatchId` | Gauge | 从源端拉取的最后一个批次的 ID。                                         |
| `ClickPipes_LastSentBatchId`    | Gauge | 发送到 ClickHouse 的最后一个批次的 ID。                               |

## 相关页面 \{#related\}

* [Prometheus 端点](/integrations/prometheus) — 外部工具 (如 Grafana、Datadog) 的端点参考、身份验证和设置
* [错误报告](/integrations/clickpipes#error-reporting) — 记录错误和系统错误的存储位置