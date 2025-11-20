:::important best practices
ClickHouse Server を設定する際に、設定ファイルを追加または編集する場合は、次の点に従ってください。

- ファイルは `/etc/clickhouse-server/config.d/` ディレクトリに追加する
- ファイルは `/etc/clickhouse-server/users.d/` ディレクトリに追加する
- `/etc/clickhouse-server/config.xml` ファイルは変更せずそのままにしておく
- `/etc/clickhouse-server/users.xml` ファイルは変更せずそのままにしておく
:::