---
slug: /guides/sre/network-ports
sidebar_label: ネットワークポート
---


# ネットワークポート

:::note
**デフォルト**と説明されているポートは、`/etc/clickhouse-server/config.xml`内でポート番号が設定されています。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/`にファイルを追加してください。詳細は[設定ファイル](../../operations/configuration-files.md#override)のドキュメントを参照してください。
:::

|ポート|説明|
|----|-----------|
|2181|ZooKeeperのデフォルトサービスポート。 **注意: ClickHouse Keeper用には`9181`を参照してください**|
|8123|HTTPのデフォルトポート|
|8443|HTTP SSL/TLSのデフォルトポート|
|9000|ネイティブプロトコルポート（ClickHouse TCPプロトコルとも呼ばれます）。 `clickhouse-server`、`clickhouse-client`、およびネイティブClickHouseツールなど、ClickHouseアプリケーションやプロセスによって使用されます。分散クエリのためのサーバー間通信に使用されます。|
|9004|MySQLエミュレーションポート|
|9005|PostgreSQLエミュレーションポート（ClickHouseでSSLが有効な場合は安全な通信にも使用されます）。|
|9009|低レベルデータアクセス用のサーバー間通信ポート。データ交換、レプリケーション、サーバー間通信に使用されます。|
|9010|サーバー間通信のためのSSL/TLS|
|9011|ネイティブプロトコルPROXYv1プロトコルポート|
|9019|JDBCブリッジ|
|9100|gRPCポート|
|9181|推奨されるClickHouse Keeperポート|
|9234|推奨されるClickHouse Keeper Raftポート（`<secure>1</secure>`が有効な場合は、安全な通信にも使用されます）|
|9363|Prometheusのデフォルトメトリクスポート|
|9281|推奨される安全なSSL ClickHouse Keeperポート|
|9440|ネイティブプロトコルSSL/TLSポート|
|42000|Graphiteのデフォルトポート|
