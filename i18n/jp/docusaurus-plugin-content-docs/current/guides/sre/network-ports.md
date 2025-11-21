---
slug: /guides/sre/network-ports
sidebar_label: 'ネットワークポート'
title: 'ネットワークポート'
description: '利用可能なネットワークポートとその使用目的の説明'
doc_type: 'reference'
keywords: ['network', 'ports', 'configuration', 'security', 'firewall']
---

# ネットワークポート

:::note
**デフォルト**として記載されているポートは、ポート番号が `/etc/clickhouse-server/config.xml` で設定されていることを意味します。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/` にファイルを追加してください。[設定ファイル](/operations/configuration-files) のドキュメントを参照してください。
:::

|Port|説明|Cloud|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper のデフォルトサービスポート。**注: ClickHouse Keeper については `9181` を参照してください**||✓|
|8123|HTTP のデフォルトポート||✓|
|8443|HTTP SSL/TLS のデフォルトポート|✓|✓|
|9000|ネイティブプロトコル用ポート（ClickHouse TCP プロトコルとも呼ばれます）。`clickhouse-server`、`clickhouse-client`、ネイティブな ClickHouse ツールなどの ClickHouse アプリケーションおよびプロセスで使用されます。分散クエリのサーバー間通信にも使用されます。||✓|
|9004|MySQL エミュレーション用ポート||✓|
|9005|PostgreSQL エミュレーション用ポート（ClickHouse で SSL が有効な場合、セキュアな通信にも使用されます）。||✓|
|9009|低レベルデータアクセス用のサーバー間通信ポート。データ交換、レプリケーション、およびサーバー間通信に使用されます。||✓|
|9010|サーバー間通信向け SSL/TLS||✓|
|9011|ネイティブプロトコル PROXYv1 用ポート||✓|
|9019|JDBC ブリッジ||✓|
|9100|gRPC ポート||✓|
|9181|推奨される ClickHouse Keeper ポート||✓|
|9234|推奨される ClickHouse Keeper Raft ポート（`<secure>1</secure>` が有効な場合、セキュアな通信にも使用されます）||✓|
|9363|Prometheus のデフォルトメトリクスポート||✓|
|9281|推奨される Secure SSL ClickHouse Keeper ポート||✓|
|9440|ネイティブプロトコル向け SSL/TLS ポート|✓|✓|
|42000|Graphite のデフォルトポート||✓|