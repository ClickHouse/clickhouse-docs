---
slug: /guides/sre/network-ports
sidebar_label: 'ネットワークポート'
title: 'ネットワークポート'
description: '利用可能なネットワークポートとその用途についての説明'
doc_type: 'reference'
keywords: ['network', 'ports', 'configuration', 'security', 'firewall']
---

# ネットワークポート

:::note
**デフォルト** と記載されているポートは、ポート番号が `/etc/clickhouse-server/config.xml` に設定されています。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/` にファイルを追加してください。[設定ファイル](/operations/configuration-files) のドキュメントを参照してください。
:::

|Port|Description|Cloud|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper のデフォルトサービスポート。**注意: ClickHouse Keeper については `9181` を参照してください**||✓|
|8123|HTTP デフォルトポート||✓|
|8443|HTTP SSL/TLS デフォルトポート|✓|✓|
|9000|ネイティブプロトコルのポート（ClickHouse TCP プロトコルとも呼ばれます）。`clickhouse-server`、`clickhouse-client`、ネイティブ ClickHouse ツールなどの ClickHouse アプリケーションおよびプロセスで使用されます。分散クエリのサーバー間通信にも使用されます。||✓|
|9004|MySQL エミュレーションポート||✓|
|9005|PostgreSQL エミュレーションポート（ClickHouse で SSL が有効化されている場合、安全な通信にも使用されます）。||✓|
|9009|低レベルなデータアクセスのためのサーバー間通信ポート。データ交換、レプリケーション、およびサーバー間通信に使用されます。||✓|
|9010|サーバー間通信向け SSL/TLS||✓|
|9011|ネイティブプロトコル用 PROXYv1 プロトコルポート||✓|
|9019|JDBC ブリッジ||✓|
|9100|gRPC ポート||✓|
|9181|推奨 ClickHouse Keeper ポート||✓|
|9234|推奨 ClickHouse Keeper Raft ポート（`<secure>1</secure>` が有効化されている場合、安全な通信にも使用されます）||✓|
|9363|Prometheus デフォルトメトリクスポート||✓|
|9281|推奨 Secure SSL ClickHouse Keeper ポート||✓|
|9440|ネイティブプロトコル SSL/TLS ポート|✓|✓|
|42000|Graphite デフォルトポート||✓|