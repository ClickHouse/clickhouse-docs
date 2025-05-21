---
slug: /guides/sre/network-ports
sidebar_label: 'ネットワークポート'
title: 'ネットワークポート'
description: '利用可能なネットワークポートの説明とその使用目的'
---


# ネットワークポート

:::note
**デフォルト**として記述されているポートは、`/etc/clickhouse-server/config.xml`にポート番号が設定されていることを意味します。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/`にファイルを追加してください。詳細は[設定ファイル](/operations/configuration-files)ドキュメントを参照してください。
:::

|ポート|説明|
|----|-----------|
|2181|ZooKeeperデフォルトサービスポート。 **注意: ClickHouse Keeperについては`9181`を参照してください**|
|8123|HTTPデフォルトポート|
|8443|HTTP SSL/TLSデフォルトポート|
|9000|ネイティブプロトコルポート（ClickHouse TCPプロトコルとも呼ばれます）。 `clickhouse-server`、`clickhouse-client`、およびネイティブClickHouseツールなど、ClickHouseアプリケーションとプロセスで使用されます。分散クエリのためのサーバー間通信に使用されます。|
|9004|MySQLエミュレーションポート|
|9005|PostgreSQLエミュレーションポート（ClickHouseに対してSSLが有効な場合、セキュアな通信にも使用されます）。|
|9009|低レベルのデータアクセスのためのサーバー間通信ポート。データ交換、レプリケーション、サーバー間通信に使用されます。|
|9010|サーバー間通信のためのSSL/TLS|
|9011|ネイティブプロトコルPROXYv1プロトコルポート|
|9019|JDBCブリッジ|
|9100|gRPCポート|
|9181|推奨されるClickHouse Keeperポート|
|9234|推奨されるClickHouse Keeper Raftポート（`<secure>1</secure>`が有効な場合、セキュアな通信にも使用されます）|
|9363|Prometheusデフォルトメトリクスポート|
|9281|推奨されるセキュアSSL ClickHouse Keeperポート|
|9440|ネイティブプロトコルSSL/TLSポート|
|42000|Graphiteデフォルトポート|
