:::important ベストプラクティス
構成ファイルを追加・編集して ClickHouse Server を設定する場合は、次のようにしてください:

- ファイルを `/etc/clickhouse-server/config.d/` ディレクトリに追加する
- ファイルを `/etc/clickhouse-server/users.d/` ディレクトリに追加する
- `/etc/clickhouse-server/config.xml` ファイルは変更しない
- `/etc/clickhouse-server/users.xml` ファイルは変更しない
:::