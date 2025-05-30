---
'sidebar_label': '常见问题'
'description': '关于 MySQL 的 ClickPipes 的常见问题。'
'slug': '/integrations/clickpipes/mysql/faq'
'sidebar_position': 2
'title': 'MySQL 的 ClickPipes 常见问题'
---


# ClickPipes for MySQL 常见问题

### MySQL ClickPipe 是否支持 MariaDB? {#does-the-clickpipe-support-mariadb}
是的，MySQL ClickPipe 支持 MariaDB 10.0 及以上版本。其配置与 MySQL 非常相似，默认使用 GTID 复制。

### MySQL ClickPipe 是否支持 PlanetScale、Vitess 或 TiDB? {#does-the-clickpipe-support-planetscale-vitess}
不，这些不支持 MySQL 的 binlog API。

### 复制是如何管理的? {#how-is-replication-managed}
我们支持 `GTID` 和 `FilePos` 复制。与 Postgres 不同的是，没有槽位来管理偏移量。相反，您必须配置 MySQL 服务器以具有足够的 binlog 保留期。如果我们在 binlog 中的偏移量无效 *(例如，镜像暂停太长时间，或者在使用 `FilePos` 复制时发生数据库故障转移)*，那么您需要重新同步管道。请确保根据目标表优化物化视图，因为低效的查询会导致数据摄取缓慢，进而落后于保留期。

不活动的数据库也可能轮换日志文件，而不允许 ClickPipes 进展到更新的偏移量。您可能需要设置一个心跳表，并定期更新。

### 为什么我在连接 MySQL 时遇到 TLS 证书验证错误? {#tls-certificate-validation-error}

在连接 MySQL 时，您可能会遇到诸如 `x509: certificate is not valid for any names` 或 `x509: certificate signed by unknown authority` 的证书错误。这是因为 ClickPipes 默认启用了 TLS 加密。

您有几种选项来解决这些问题：

1. **设置 TLS Host 字段** - 当您的连接中的主机名与证书不同时（在通过 Endpoint Service 的 AWS PrivateLink 中常见）。将“TLS Host (可选)”设置为与证书的通用名称 (CN) 或主题备用名称 (SAN) 匹配。

2. **上传您的根 CA** - 针对使用内部证书颁发机构的 MySQL 服务器或在默认实例 CA 配置下的 Google Cloud SQL。有关如何访问 Google Cloud SQL 证书的更多信息，请参见 [这一部分](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)。

3. **配置服务器证书** - 更新服务器的 SSL 证书以包含所有连接主机名，并使用受信任的证书颁发机构。

4. **跳过证书验证** - 对于自托管的 MySQL 或 MariaDB，它们的默认配置提供我们无法验证的自签名证书 ([MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic), [MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server))。依赖此证书在传输中加密数据，但存在服务器冒充的风险。我们建议在生产环境中使用正式签名的证书，但此选项对于在一次性实例上测试或连接到遗留基础设施时非常有用。
