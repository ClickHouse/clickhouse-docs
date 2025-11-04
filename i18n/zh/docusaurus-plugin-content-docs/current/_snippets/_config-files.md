:::important best practices
在通过添加或编辑配置文件来配置 ClickHouse Server 时，您应当：
- 将文件添加到 `/etc/clickhouse-server/config.d/` 目录
- 将文件添加到 `/etc/clickhouse-server/users.d/` 目录
- 保持 `/etc/clickhouse-server/config.xml` 文件不变
- 保持 `/etc/clickhouse-server/users.xml` 文件不变 
:::
