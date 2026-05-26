---
slug: /cloud/managed-postgres/monitoring/metrics
sidebar_label: 'メトリクス リファレンス'
title: 'Managed Postgres メトリクス リファレンス'
description: 'Managed Postgres の Prometheus エンドポイントで公開されるメトリクスの完全な一覧'
keywords: ['managed postgres', 'メトリクス', 'Prometheus', 'リファレンス', 'オブザーバビリティ']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

# メトリクス リファレンス \{#metrics-reference\}

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="monitoring-metrics" />

このページでは、[Managed Postgres Prometheus エンドポイント](/cloud/managed-postgres/monitoring/prometheus) で公開されているすべてのメトリックを一覧で確認できます。
セットアップと認証については、[Prometheus エンドポイント] ページを参照してください。

## 共通ラベル \{#common-labels\}

すべてのメトリクスには、以下のラベルが付きます。

| Label                   | Description      |
| ----------------------- | ---------------- |
| `clickhouse_org`        | 組織 ID            |
| `postgres_service`      | Postgres サービス ID |
| `postgres_service_name` | Postgres サービス名   |

一部のメトリクスには、内訳の次元を表すラベルが追加されます (たとえば、CPU メトリクスの
`mode`、接続の `state`、データベースサイズの `database`
など) 。これらは各メトリクスの説明とあわせて記載しています。

## 情報メトリクス \{#information-metric\}

`PostgresServiceInfo` は、常に `1` となる Gauge で、ラベルに
サービスの現在のステータスとバージョンを保持します。これを使用して、
他のメトリクスにステータスを結合したり、サービスが
`running` 状態から外れたときにアラートを出したりできます。

| メトリクス                | Type  | Extra labels                          | Description                          |
| --------------------- | ----- | ------------------------------------- | ------------------------------------ |
| `PostgresServiceInfo` | gauge | `postgres_status`, `postgres_version` | サービスごとに 1 つの series があり、値は常に `1` です。 |

`postgres_status` は、サービスの現在のライフサイクル状態を示します
(例: `running`、`creating`、`stopped`) 。`postgres_version`
は、Postgres のメジャーバージョン (例: `17`、`18`) を示します。

## 容量 \{#capacity\}

サービスにプロビジョニングされる静的な上限値です。これらが変わるのは、
サービスのサイズを変更した場合のみです。

| メトリクス                              | 型     | 単位    | 説明                   |
| ---------------------------------- | ----- | ----- | -------------------- |
| `PostgresServer_CPUCores`          | gauge | cores | サービスに割り当てられたCPUコア数。  |
| `PostgresServer_MemoryLimitBytes`  | gauge | bytes | サービスに割り当てられたメモリ容量。   |
| `PostgresServer_StorageLimitBytes` | gauge | bytes | サービスに割り当てられたストレージ容量。 |

## リソース使用率 \{#resource-utilization\}

| メトリクス                                 | Type  | Extra labels | Description                                                                                |
| -------------------------------------- | ----- | ------------ | ------------------------------------------------------------------------------------------ |
| `PostgresServer_CPUSeconds_Total`      | カウンター | `mode`       | 消費された CPU 時間。`user`、`system`、`iowait`、`softirq`、`steal`、`irq`、`nice`、`idle` の各モード別に分類されます。 |
| `PostgresServer_MemoryUsedPercent`     | Gauge |              | 使用中のメモリ量。`PostgresServer_MemoryLimitBytes` に対する割合です。                                       |
| `PostgresServer_MemoryCachePercent`    | Gauge |              | キャッシュとバッファで使用されるメモリ量。総メモリに対する割合です。                                                         |
| `PostgresServer_FilesystemUsedPercent` | Gauge |              | 使用中のファイルシステム領域。総ストレージに対する割合です。                                                             |

CPU 使用率をパーセンテージで計算するには、
対象のモードに対する `PostgresServer_CPUSeconds_Total` の
rate を求め、
それを `PostgresServer_CPUCores` で割ります。

## ディスクおよびネットワークI/O \{#io\}

| メトリクス                                       | 型     | 単位    | 説明                 |
| ------------------------------------------- | ----- | ----- | ------------------ |
| `PostgresServer_DiskReads_Total`            | カウンター | ops   | 完了したディスク読み取り操作数。   |
| `PostgresServer_DiskWrites_Total`           | カウンター | ops   | 完了したディスク書き込み操作数。   |
| `PostgresServer_NetworkReceiveBytes_Total`  | カウンター | bytes | ネットワーク経由で受信したバイト数。 |
| `PostgresServer_NetworkTransmitBytes_Total` | カウンター | bytes | ネットワーク経由で送信したバイト数。 |

## データベースアクティビティ \{#database-activity\}

サービス開始以降の累積カウンターです。1 秒あたりの値にするには、`rate()` または `irate()` を使用します。

| メトリクス                                        | Type  | Description        |
| --------------------------------------------- | ----- | ------------------ |
| `PostgresServer_TuplesFetched_Total`          | カウンター | クエリで取得された行。        |
| `PostgresServer_TuplesInserted_Total`         | カウンター | 挿入された行。            |
| `PostgresServer_TuplesUpdated_Total`          | カウンター | 更新された行。            |
| `PostgresServer_TuplesDeleted_Total`          | カウンター | 削除された行。            |
| `PostgresServer_TransactionsCommitted_Total`  | カウンター | コミットされたトランザクション。   |
| `PostgresServer_TransactionsRolledBack_Total` | カウンター | ロールバックされたトランザクション。 |
| `PostgresServer_Deadlocks_Total`              | カウンター | 検出されたデッドロック。       |

## 接続、キャッシュ、データベースサイズ \{#connections-cache-size\}

| メトリクス                             | Type  | Extra labels | Description                                                            |
| ---------------------------------- | ----- | ------------ | ---------------------------------------------------------------------- |
| `PostgresServer_ActiveConnections` | gauge | `state`      | 状態別の接続数 (例: `active`、`idle`) 。                                         |
| `PostgresServer_CacheHitRatio`     | gauge |              | バッファキャッシュのヒット率。キャッシュから提供されたブロック数が、アクセスされた総ブロック数に占める割合 (パーセンテージ) です。    |
| `PostgresServer_DatabaseSizeBytes` | gauge | `database`   | 各データベースのディスクサイズ (バイト単位) 。デフォルトの `postgres` と、ユーザーが作成したすべてのデータベースを含みます。 |

## 関連ページ \{#related\}

* [Prometheus エンドポイント] — 設定、認証、スクレイピング
* [ダッシュボード](/cloud/managed-postgres/monitoring/dashboard) — Cloud Console に組み込まれているチャート
* [OpenAPI ガイド](/cloud/managed-postgres/openapi) — API キーの作成
  と組織 ID および service ID の確認

[Prometheus エンドポイント]: /cloud/managed-postgres/monitoring/prometheus