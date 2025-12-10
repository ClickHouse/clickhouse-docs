:::important best practices
ClickHouse Server の設定ファイルを追加・編集して構成する場合は、次の点に注意してください:

- ファイルは `/etc/clickhouse-server/config.d/` ディレクトリに追加する
- ファイルは `/etc/clickhouse-server/users.d/` ディレクトリに追加する
- `/etc/clickhouse-server/config.xml` ファイルは変更せず、そのままにしておく
- `/etc/clickhouse-server/users.xml` ファイルは変更せず、そのままにしておく 
:::