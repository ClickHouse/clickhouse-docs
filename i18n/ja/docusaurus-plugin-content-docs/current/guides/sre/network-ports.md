---
slug: /guides/sre/network-ports
sidebar_label: ネットワークポート
---

# ネットワークポート

:::note
**デフォルト**と記載されたポートは、ポート番号が`/etc/clickhouse-server/config.xml`に設定されていることを意味します。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/`にファイルを追加してください。詳細は[設定ファイル](../../operations/configuration-files.md#override)のドキュメントを参照してください。
:::

| ポート | 説明 |
|-------|-------|
| 2181 | ZooKeeperのデフォルトサービスポート。**注意: ClickHouse Keeperについては`9181`を参照** |
| 8123 | HTTPのデフォルトポート |
| 8443 | HTTP SSL/TLSのデフォルトポート |
| 9000 | ネイティブプロトコルポート（ClickHouse TCPプロトコルとも呼ばれます）。`clickhouse-server`、`clickhouse-client`、およびネイティブのClickHouseツールなどのClickHouseアプリケーションやプロセスによって使用されます。分散クエリのためのサーバ間通信に使用されます。 |
| 9004 | MySQLエミュレーションポート |
| 9005 | PostgreSQLエミュレーションポート（ClickHouseのSSLが有効な場合は安全な通信にも使用されます） |
| 9009 | 低レベルデータアクセスのためのサーバ間通信ポート。データ交換、レプリケーション、およびサーバ間通信に使用されます。 |
| 9010 | サーバ間通信のためのSSL/TLS |
| 9011 | ネイティブプロトコルPROXYv1プロトコルポート |
| 9019 | JDBCブリッジ |
| 9100 | gRPCポート |
| 9181 | 推奨されるClickHouse Keeperポート |
| 9234 | 推奨されるClickHouse Keeper Raftポート（`<secure>1</secure>`が有効な場合は安全な通信にも使用されます） |
| 9363 | Prometheusのデフォルトメトリクスポート |
| 9281 | 推奨されるセキュアSSL ClickHouse Keeperポート |
| 9440 | ネイティブプロトコルSSL/TLSポート |
| 42000 | Graphiteのデフォルトポート |
