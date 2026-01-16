---
title: '管理とデプロイメントの概要'
description: 'Manage and Deploy の概要ページ'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['デプロイメント', '管理', '運用管理', '運用', 'ガイド']
---

# 管理とデプロイ \\{#manage-and-deploy\\}

このセクションには次のトピックが含まれます。

| トピック                                                                                               | 説明                                                                                                                                     |
|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| [Deployment and Scaling](/deployment-guides/index)                                                 | ClickHouse の Support &amp; Services チームが ClickHouse ユーザーに提供しているアドバイスに基づく、実用的なデプロイメント例。               |
| [Separation of Storage and Compute](/guides/separation-storage-compute)                       | ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法を解説するガイド。                                |
| [Sizing and hardware recommendations&#39;](/guides/sizing-and-hardware-recommendations)            | オープンソースユーザー向けに、ハードウェア、コンピュート、メモリ、およびディスク構成に関する一般的な推奨事項を説明するガイド。                |
| [Configuring ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | ClickHouse Keeper を設定する方法に関する情報と例。                                                                                       |
| [Network ports](/guides/sre/network-ports)                                                    | ClickHouse が使用するネットワークポートの一覧。                                                                                         |
| [Re-balancing Shards](/guides/sre/scaling-clusters)                                           | シャードの再バランシングに関する推奨事項。                                                                                               |
| [Does ClickHouse support multi-region replication?](/faq/operations/multi-region-replication) | マルチリージョンレプリケーションに関する FAQ。                                                                                          |
| [Which ClickHouse version to use in production?](/faq/operations/production)                  | 本番環境で使用する ClickHouse バージョンに関する FAQ。                                                                                  |
| [Cluster Discovery](/operations/cluster-discovery)                                            | ClickHouse のクラスターディスカバリー機能に関する情報と例。                                                                             |
| [Monitoring](/operations/monitoring)                                                          | ClickHouse のハードウェアリソース使用率およびサーバーメトリクスを監視する方法に関する情報。                                              |
| [Tracing ClickHouse with OpenTelemetry](/operations/opentelemetry)                            | ClickHouse で OpenTelemetry を使用する方法に関する情報。                                                                                |
| [Quotas](/operations/quotas)                                                                  | ClickHouse のクォータに関する情報と例。                                                                                                  |
| [Secured Communication with Zookeeper](/operations/ssl-zookeeper)                             | ClickHouse と Zookeeper 間のセキュアな通信を設定するためのガイド。                                                                      |
| [Startup Scripts](/operations/startup-scripts)                                                | マイグレーションや自動スキーマ作成に有用な、起動時にスタートアップスクリプトを実行する方法の例。                                        |
| [External Disks for Storing Data](/operations/storing-data)                                   | ClickHouse で外部ストレージを構成する方法に関する情報と例。                                                                             |
| [Allocation profiling](/operations/allocation-profiling)                                      | jemalloc を用いたアロケーションサンプリングおよびプロファイリングに関する情報と例。                                                     |
| [Backup and Restore](/operations/backup/overview)                                             | ローカルディスクまたは外部ストレージへのバックアップに関するガイド。                                                                   |
| [Caches](/operations/caches)                                                                  | ClickHouse におけるさまざまなキャッシュタイプの解説。                                                                                   |
| [Workload scheduling](/operations/workload-scheduling)                                        | ClickHouse におけるワークロードスケジューリングの解説。                                                                                 |
| [Self-managed Upgrade](/operations/update)                                                    | セルフマネージド環境でアップグレードを実施する際のガイドライン。                                                                        |
| [Troubleshooting](/guides/troubleshooting)                                                    | さまざまなトラブルシューティングのヒント集。                                                                                            |
| [Usage Recommendations](/operations/tips)                                                     | ClickHouse のハードウェアおよびソフトウェアの利用に関する各種推奨事項。                                                                  |
| [Distributed DDL](/sql-reference/distributed-ddl)                                             | `ON CLUSTER` 句の解説。                                                                                                                |