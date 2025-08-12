---
slug: '/guides/sre/network-ports'
sidebar_label: 'ネットワークポート'
title: 'ネットワークポート'
description: '利用可能なネットワークポートの説明とそれらの用途について'
---




# ネットワークポート

:::note
**デフォルト**として説明されるポートは、ポート番号が「/etc/clickhouse-server/config.xml」に設定されていることを意味します。設定をカスタマイズするには、「/etc/clickhouse-server/config.d/」にファイルを追加してください。 [設定ファイル](/operations/configuration-files) に関するドキュメントを参照してください。
:::

|ポート|説明|
|----|-----------|
|2181|ZooKeeper デフォルトサービスポート。 **注意: ClickHouse Keeper のために `9181` を参照してください**|
|8123|HTTP デフォルトポート|
|8443|HTTP SSL/TLS デフォルトポート|
|9000|ネイティブプロトコルポート（ClickHouse TCP プロトコルとも呼ばれます）。 `clickhouse-server`、`clickhouse-client`、およびネイティブ ClickHouse ツールなどの ClickHouse アプリケーションとプロセスによって使用されます。分散クエリのためのサーバー間通信に使用されます。|
|9004|MySQL エミュレーションポート|
|9005|PostgreSQL エミュレーションポート（SSL が ClickHouse 用に有効になっている場合は、安全な通信にも使用されます）。|
|9009|低レベルのデータアクセスのためのサーバー間通信ポート。データの交換、レプリケーション、サーバー間通信に使用されます。|
|9010|サーバー間通信のための SSL/TLS|
|9011|ネイティブプロトコル PROXYv1 プロトコルポート|
|9019|JDBC ブリッジ|
|9100|gRPC ポート|
|9181|推奨される ClickHouse Keeper ポート|
|9234|推奨される ClickHouse Keeper Raft ポート（`<secure>1</secure>` が有効な場合は、安全な通信にも使用されます）|
|9363|Prometheus デフォルトメトリクスポート|
|9281|推奨されるセキュア SSL ClickHouse Keeper ポート|
|9440|ネイティブプロトコル SSL/TLS ポート|
|42000|Graphite デフォルトポート|
