---
title: '管理とデプロイの概要'
description: '管理とデプロイの概要ページ'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['デプロイ', '管理', '運用管理', '運用', 'ガイド']
---

# 管理とデプロイ

このセクションには、次のトピックが含まれます。

| トピック                                                                                                 | 説明                                                                                                                                   |
|-------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| [Deployment and Scaling](/deployment-guides/index)                                                 | ClickHouse Support and Services 組織が ClickHouse ユーザーに提供しているアドバイスに基づいた、実運用に即したデプロイ例。                    |
| [Separation of Storage and Compute](/guides/separation-storage-compute)                       | ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法を解説したガイド。                            |
| [Sizing and hardware recommendations'](/guides/sizing-and-hardware-recommendations)            | オープンソースユーザー向けに、ハードウェア、コンピュート、メモリ、ディスク構成に関する一般的な推奨事項を解説したガイド。                  |
| [Configuring ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | ClickHouse Keeper の設定方法に関する情報と例。                                                                                         |
| [Network ports](/guides/sre/network-ports)                                                    | ClickHouse で使用されるネットワークポートの一覧。                                                                                     |
| [Re-balancing Shards](/guides/sre/scaling-clusters)                                           | シャード再バランシングに関する推奨事項。                                                                                               |
| [Does ClickHouse support multi-region replication?](/faq/operations/multi-region-replication) | マルチリージョンレプリケーションに関する FAQ。                                                                                         |
| [Which ClickHouse version to use in production?](/faq/operations/production)                  | 本番環境で使用する ClickHouse バージョンに関する FAQ。                                                                                |
| [Cluster Discovery](/operations/cluster-discovery)                                            | ClickHouse の Cluster Discovery 機能に関する情報と例。                                                                                 |
| [Monitoring](/operations/monitoring)                                                          | ClickHouse のハードウェアリソース使用状況およびサーバーメトリクスを監視する方法に関する情報。                                           |
| [Tracing ClickHouse with OpenTelemetry](/operations/opentelemetry)                            | OpenTelemetry を ClickHouse と併用する方法に関する情報。                                                                              |
| [Quotas](/operations/quotas)                                                                  | ClickHouse におけるクォータに関する情報と例。                                                                                         |
| [Secured Communication with Zookeeper](/operations/ssl-zookeeper)                             | ClickHouse と Zookeeper 間のセキュアな通信を設定するためのガイド。                                                                    |
| [Startup Scripts](/operations/startup-scripts)                                                | 起動時にスタートアップスクリプトを実行する方法の例。マイグレーションや自動スキーマ作成に便利。                                         |
| [External Disks for Storing Data](/operations/storing-data)                                   | ClickHouse で外部ストレージを構成する方法に関する情報と例。                                                                           |
| [Allocation profiling](/operations/allocation-profiling)                                      | jemalloc を用いたアロケーションのサンプリングおよびプロファイリングに関する情報と例。                                                 |
| [Backup and Restore](/operations/backup)                                                      | ローカルディスクまたは外部ストレージへのバックアップおよびリストアのためのガイド。                                                   |
| [Caches](/operations/caches)                                                                  | ClickHouse に存在するさまざまなキャッシュタイプの解説。                                                                               |
| [Workload scheduling](/operations/workload-scheduling)                                        | ClickHouse におけるワークロードスケジューリングの解説。                                                                               |
| [Self-managed Upgrade](/operations/update)                                                    | セルフマネージド環境でのアップグレードを実施するためのガイドライン。                                                                  |
| [Troubleshooting](/guides/troubleshooting)                                                    | さまざまなトラブルシューティングのヒント。                                                                                            |
| [Usage Recommendations](/operations/tips)                                                     | ClickHouse のハードウェアおよびソフトウェアの利用に関する各種推奨事項。                                                                |
| [Distributed DDL](/sql-reference/distributed-ddl)                                             | `ON CLUSTER` 句の解説。                                                                                                              |