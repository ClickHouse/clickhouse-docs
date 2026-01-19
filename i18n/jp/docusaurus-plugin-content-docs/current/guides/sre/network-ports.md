---
slug: /guides/sre/network-ports
sidebar_label: 'ネットワークポート'
title: 'ネットワークポート'
description: '利用可能なネットワークポートとその用途についての説明'
doc_type: 'reference'
keywords: ['ネットワーク', 'ポート', '設定', 'セキュリティ', 'ファイアウォール']
---

# ネットワークポート \{#network-ports\}

:::note
**デフォルト** として記載されているポートは、ポート番号が `/etc/clickhouse-server/config.xml` で設定されていることを意味します。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/` にファイルを追加してください。詳細は [構成ファイル](/operations/configuration-files) ドキュメントを参照してください。
:::

|Port|Description|Cloud|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper のデフォルトサービスポート。**注意: ClickHouse Keeper については `9181` を参照**||✓|
|8123|HTTP デフォルトポート||✓|
|8443|HTTP SSL/TLS デフォルトポート|✓|✓|
|9000|ネイティブプロトコルポート（ClickHouse TCP プロトコルとも呼ばれます）。`clickhouse-server`、`clickhouse-client`、ネイティブ ClickHouse ツールなどの ClickHouse アプリケーションおよびプロセスで使用されます。分散クエリのサーバー間通信にも使用されます。||✓|
|9004|MySQL エミュレーションポート||✓|
|9005|PostgreSQL エミュレーションポート（ClickHouse で SSL が有効な場合、安全な通信にも使用されます）。||✓|
|9009|低レベルなデータアクセス用のサーバー間通信ポート。データ交換、レプリケーション、およびサーバー間通信で使用されます。||✓|
|9010|サーバー間通信向け SSL/TLS ポート||✓|
|9011|ネイティブプロトコル向け PROXYv1 プロトコルポート||✓|
|9019|JDBC ブリッジ||✓|
|9100|gRPC ポート||✓|
|9181|推奨される ClickHouse Keeper ポート||✓|
|9234|推奨される ClickHouse Keeper Raft ポート（`<secure>1</secure>` が有効な場合、安全な通信にも使用されます）||✓|
|9363|Prometheus デフォルトメトリクスポート||✓|
|9281|推奨されるセキュア SSL ClickHouse Keeper ポート||✓|
|9440|ネイティブプロトコル SSL/TLS ポート|✓|✓|
|42000|Graphite デフォルトポート||✓|