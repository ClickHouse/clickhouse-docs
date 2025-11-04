---
'slug': '/guides/sre/network-ports'
'sidebar_label': 'ネットワークポート'
'title': 'ネットワークポート'
'description': '利用可能なネットワークポートの説明とそれらの用途'
'doc_type': 'reference'
---


# ネットワークポート

:::note
**デフォルト** として記述されたポートは、`/etc/clickhouse-server/config.xml` にポート番号が設定されていることを意味します。設定をカスタマイズするには、`/etc/clickhouse-server/config.d/` にファイルを追加します。詳細については、[設定ファイル](/operations/configuration-files) のドキュメントを参照してください。
:::

|ポート|説明|Cloud|OSS|
|----|-----------|-----|---|
|2181|ZooKeeper のデフォルトサービスポート。 **注意: ClickHouse Keeper は `9181` を参照してください**||✓|
|8123|HTTP デフォルトポート||✓|
|8443|HTTP SSL/TLS デフォルトポート|✓|✓|
|9000|ネイティブプロトコルポート（ClickHouse TCP プロトコルとも呼ばれる）。 `clickhouse-server`、`clickhouse-client`、およびネイティブClickHouseツールなど、ClickHouseアプリケーションやプロセスで使用されます。分散クエリのためのサーバー間通信に使用されます。||✓|
|9004|MySQL エミュレーションポート||✓|
|9005|PostgreSQL エミュレーションポート（SSLが有効な場合は、ClickHouseの安全な通信にも使用されます）。||✓|
|9009|低レベルデータアクセスのためのサーバー間通信ポート。データ交換、レプリケーション、およびサーバー間通信に使用されます。||✓|
|9010|サーバー間通信のための SSL/TLS||✓|
|9011|ネイティブプロトコル PROXYv1 プロトコルポート||✓|
|9019|JDBC ブリッジ||✓|
|9100|gRPC ポート||✓|
|9181|推奨される ClickHouse Keeper ポート||✓|
|9234|推奨される ClickHouse Keeper Raft ポート（`<secure>1</secure>` が有効な場合は、安全な通信にも使用されます）||✓|
|9363|Prometheus デフォルトメトリックポート||✓|
|9281|推奨されるセキュアSSL ClickHouse Keeper ポート||✓|
|9440|ネイティブプロトコル SSL/TLS ポート|✓|✓|
|42000|Graphite デフォルトポート||✓|
