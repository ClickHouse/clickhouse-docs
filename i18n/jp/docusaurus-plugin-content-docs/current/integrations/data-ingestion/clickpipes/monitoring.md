---
sidebar_label: '監視'
description: 'Prometheus メトリクスを使用して ClickPipes を監視します。'
slug: /integrations/clickpipes/monitoring
title: 'ClickPipes の監視'
doc_type: 'reference'
keywords: ['ClickPipes', '監視', 'メトリクス', 'Prometheus', 'オブザーバビリティ']
---

コンソールでの監視に加えて、ClickPipes はスクレイピング用に [Prometheus 互換エンドポイント](/integrations/prometheus) でメトリクスを公開しています。これらのメトリクスは、他の ClickHouse Cloud サービスのメトリクスとあわせて公開されるため、既存のオブザーバビリティスタック (例: [Grafana](/integrations/prometheus#integrating-with-grafana)、[Datadog](/integrations/prometheus#integrating-with-datadog)) に ClickPipes の監視を統合できます。

## メトリクスラベル \{#metric-labels\}

ClickPipes のメトリクスでは、[標準のサービスレベル ラベル](/integrations/prometheus#metric-labels) (`clickhouse_org`、`clickhouse_service`、`clickhouse_service_name`) に加え、以下の ClickPipes 固有のラベルを使用します。

| Label              | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `clickpipe_id`     | ClickPipe の一意の識別子                                      |
| `clickpipe_name`   | ClickPipe の名前                                          |
| `clickpipe_source` | ソースタイプ (例: `kafka`、`postgres`、`s3`)                    |
| `clickpipe_state`  | ClickPipe の状態 (例: `Stopped`、`Provisioning`、`Running`)  |

### 応答例 \{#sample-response\}

以下は、Prometheus のスクレイプ応答で ClickPipes のメトリクスがどのように表示されるかを示したものです。

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

## 利用できるメトリクス \{#available-metrics\}

### データ転送 \{#metrics-data-transfer\}

| 指標                                         | 型     | 説明                                                                     |
| ------------------------------------------ | ----- | ---------------------------------------------------------------------- |
| `ClickPipes_FetchedBytes_Total`            | カウンター | ソースから取得した非圧縮バイトの総数。                                                    |
| `ClickPipes_FetchedBytesCompressed_Total`  | カウンター | ソースから取得した圧縮バイトの総数。ソースデータが非圧縮の場合、`ClickPipes_FetchedBytes_Total` と同じです。 |
| `ClickPipes_FetchedBytesInitialLoad_Total` | カウンター | **CDC ClickPipes** 初期ロードフェーズ中に取得した非圧縮バイトの総数。                           |
| `ClickPipes_FetchedBytesResync_Total`      | カウンター | **CDC ClickPipes** 再同期処理中に取得した非圧縮バイトの総数。                               |
| `ClickPipes_SentBytes_Total`               | カウンター | ClickHouse に送信した非圧縮バイトの総数。                                             |
| `ClickPipes_SentBytesCompressed_Total`     | カウンター | ClickHouse に送信した圧縮バイトの総数。                                              |

### イベントとレコード \{#metrics-events\}

| Metric                              | 型       | 説明                                                                                                    |
| ----------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| `ClickPipes_FetchedEvents_Total`    | カウンター | ソースから取得したレコードの総数。                                                                                     |
| `ClickPipes_SentEvents_Total`       | カウンター | ClickHouse に送信したレコードの総数。                                                                              |
| `ClickPipes_FetchedEvents_PerTable` | Gauge   | **CDC ClickPipes** 宛先テーブルおよびイベントタイプごとに取得されたレコード数。追加の `destination_table` ラベルと `event_type` ラベルを使用します。 |

### エラー \{#metrics-errors\}

| メトリクス                     | 型     | 説明                                                              |
| ------------------------- | ----- | --------------------------------------------------------------- |
| `ClickPipes_Errors_Total` | カウンター | インジェスト中に発生した[エラー](/integrations/clickpipes#error-reporting)の総数。 |

### レイテンシ \{#metrics-latency\}

| Metric                                    | Type        | Description                                                                                |
| ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `ClickPipes_Latency`                      | Gauge (*avg*) | ソースでレコードが生成されてから、ClickHouse に書き込まれるまでの時間 (ミリ秒) 。                                           |
| `ClickPipes_SourceReplicationLatency_MiB` | Gauge (*avg*) | **CDC ClickPipes** のソース側のレプリケーション遅延 (MiB) 。Postgres ClickPipes では、これはレプリケーションスロットの遅延を表します。 |

### リソース使用量 \{#metrics-resources\}

| メトリクス                            | 型              | 説明                                |
| -------------------------------- | -------------- | --------------------------------- |
| `ClickPipes_Replica_CPUUsage`    | Gauge (*avg*)  | インジェスト レプリカの平均 CPU 使用量 (ミリコア) 。   |
| `ClickPipes_Replica_CPULimit`    | Gauge (*last*) | インジェスト レプリカに設定された CPU 上限 (ミリコア) 。 |
| `ClickPipes_Replica_MemoryUsage` | Gauge (*avg*)  | インジェスト レプリカの平均メモリ使用量 (バイト) 。      |
| `ClickPipes_Replica_MemoryLimit` | Gauge (*last*) | インジェスト レプリカに設定されたメモリ上限 (バイト) 。    |

### 状態と進捗 \{#metrics-state\}

| メトリクス                           | 型     | 説明                                                                        |
| ------------------------------- | ----- | ------------------------------------------------------------------------- |
| `ClickPipes_Info`               | Gauge | 常に `1` です。`clickpipe_state` ラベルを使用して、パイプラインの状態でフィルタリングしたり、アラートを設定したりできます。 |
| `ClickPipes_LastFetchedBatchId` | Gauge | ソースから取得した最後のバッチの ID。                                                      |
| `ClickPipes_LastSentBatchId`    | Gauge | ClickHouse に送信した最後のバッチの ID。                                               |

## 関連ページ \{#related\}

* [Prometheus エンドポイント](/integrations/prometheus) — エンドポイントのリファレンス、認証、外部ツール (Grafana、Datadog など) 向けの設定
* [エラーリポーティング](/integrations/clickpipes#error-reporting) — レコードエラーとシステムエラーの保存先