:::important 最佳实践
配置 ClickHouse Server 时,通过添加或编辑配置文件,您应当:

- 将文件添加到 `/etc/clickhouse-server/config.d/` 目录
- 将文件添加到 `/etc/clickhouse-server/users.d/` 目录
- 保持 `/etc/clickhouse-server/config.xml` 文件原样不动
- 保持 `/etc/clickhouse-server/users.xml` 文件原样不动
:::