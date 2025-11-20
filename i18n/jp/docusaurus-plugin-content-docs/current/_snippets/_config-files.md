:::important best practices
ClickHouse Server を設定ファイルの追加や編集によって構成する場合は、次の点に留意してください。

- ファイルを `/etc/clickhouse-server/config.d/` ディレクトリに追加する
- ファイルを `/etc/clickhouse-server/users.d/` ディレクトリに追加する
- `/etc/clickhouse-server/config.xml` ファイルはそのままにしておく
- `/etc/clickhouse-server/users.xml` ファイルはそのままにしておく 
:::