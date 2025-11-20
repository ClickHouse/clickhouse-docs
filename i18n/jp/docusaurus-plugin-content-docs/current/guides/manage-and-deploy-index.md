---
title: '管理とデプロイの概要'
description: '管理とデプロイに関する概要ページ'
slug: /guides/manage-and-deploy-index
doc_type: 'landing-page'
keywords: ['deployment', 'management', 'administration', 'operations', 'guides']
---

# 管理とデプロイ

このセクションには次のトピックが含まれます。

| トピック                                                                                                 | 説明                                                                                                                                 |
|-------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| [Deployment and Scaling](/deployment-guides/index)                                                 | ClickHouse Support and Services チームが ClickHouse ユーザーに提供しているアドバイスに基づく、実用的なデプロイメント例。                  |
| [Separation of Storage and Compute](/guides/separation-storage-compute)                       | ClickHouse と S3 を使用して、ストレージとコンピュートを分離したアーキテクチャを実装する方法を解説するガイド。                            |
| [Sizing and hardware recommendations'](/guides/sizing-and-hardware-recommendations)            | オープンソースユーザー向けのハードウェア、コンピュート、メモリ、およびディスク構成に関する一般的な推奨事項を解説するガイド。              |
| [Configuring ClickHouse Keeper](/guides/sre/keeper/clickhouse-keeper)                         | ClickHouse Keeper の設定方法に関する情報と例。                                                                                     |
| [Network ports](/guides/sre/network-ports)                                                    | ClickHouse が使用するネットワークポートの一覧。                                                                                    |
| [Re-balancing Shards](/guides/sre/scaling-clusters)                                           | シャードの再バランスに関する推奨事項。                                                                                             |
| [Does ClickHouse support multi-region replication?](/faq/operations/multi-region-replication) | マルチリージョンレプリケーションに関する FAQ。                                                                                      |
| [Which ClickHouse version to use in production?](/faq/operations/production)                  | 本番環境で使用する ClickHouse バージョンに関する FAQ。                                                                              |
| [Cluster Discovery](/operations/cluster-discovery)                                            | ClickHouse のクラスターディスカバリ機能に関する情報と例。                                                                           |
| [Monitoring](/operations/monitoring)                                                          | ClickHouse のハードウェアリソース使用状況やサーバーメトリクスを監視する方法に関する情報。                                           |
| [Tracing ClickHouse with OpenTelemetry](/operations/opentelemetry)                            | OpenTelemetry を ClickHouse と組み合わせて使用する方法に関する情報。                                                                |
| [Quotas](/operations/quotas)                                                                  | ClickHouse におけるクォータに関する情報と例。                                                                                      |
| [Secured Communication with Zookeeper](/operations/ssl-zookeeper)                             | ClickHouse と Zookeeper 間のセキュアな通信を設定するためのガイド。                                                                 |
| [Startup Scripts](/operations/startup-scripts)                                                | 起動時にスタートアップスクリプトを実行する方法の例。マイグレーションや自動スキーマ作成に役立つ。                                     |
| [External Disks for Storing Data](/operations/storing-data)                                   | ClickHouse で外部ストレージを構成する方法に関する情報と例。                                                                        |
| [Allocation profiling](/operations/allocation-profiling)                                      | jemalloc を使用したアロケーションサンプリングおよびプロファイリングに関する情報と例。                                               |
| [Backup and Restore](/operations/backup)                                                      | ローカルディスクまたは外部ストレージへのバックアップおよびリストアに関するガイド。                                                 |
| [Caches](/operations/caches)                                                                  | ClickHouse におけるさまざまなキャッシュタイプの解説。                                                                               |
| [Workload scheduling](/operations/workload-scheduling)                                        | ClickHouse におけるワークロードスケジューリングの解説。                                                                             |
| [Self-managed Upgrade](/operations/update)                                                    | セルフマネージドなアップグレードを実施するためのガイドライン。                                                                     |
| [Troubleshooting](/guides/troubleshooting)                                                    | 各種トラブルシューティングのヒント。                                                                                                |
| [Usage Recommendations](/operations/tips)                                                     | ClickHouse のハードウェアおよびソフトウェアの使用に関する各種推奨事項。                                                             |
| [Distributed DDL](/sql-reference/distributed-ddl)                                             | `ON CLUSTER` 句の解説。                                                                                                            |