---
'sidebar_label': '常见问题解答'
'description': '关于 ClickPipes for MySQL 的常见问题。'
'slug': '/integrations/clickpipes/mysql/faq'
'sidebar_position': 2
'title': 'ClickPipes for MySQL 常见问题解答'
'doc_type': 'reference'
---


# ClickPipes for MySQL 常见问题解答

### MySQL ClickPipe 支持 MariaDB 吗？ {#does-the-clickpipe-support-mariadb}
是的，MySQL ClickPipe 支持 MariaDB 10.0 及以上版本。其配置与 MySQL 非常相似，默认使用 GTID 复制。

### MySQL ClickPipe 支持 PlanetScale、Vitess 或 TiDB 吗？ {#does-the-clickpipe-support-planetscale-vitess}
不，这些不支持 MySQL 的 binlog API。

### 复制是如何管理的？ {#how-is-replication-managed}
我们支持 `GTID` 和 `FilePos` 复制。与 Postgres 不同，没有槽来管理偏移量。相反，您必须配置 MySQL 服务器以具有足够的 binlog 保留时间。如果我们在 binlog 中的偏移量失效 *(例如，镜像暂停时间过长，或在使用 `FilePos` 复制时发生数据库故障转移)*，那么您将需要重新同步管道。确保根据目标表优化物化视图，因为低效的查询可能会减慢数据注入，导致超出保留期。

不活动的数据库也可能在未允许 ClickPipes 进展到更新的偏移量的情况下旋转日志文件。您可能需要设置一个带有定期更新的心跳表。

在初始加载开始时，我们记录要启动的 binlog 偏移量。此偏移量在初始加载完成时仍然必须有效，以便 CDC 继续进展。如果您正在注入大量数据，请确保配置适当的 binlog 保留时间。在设置表时，您可以通过在高级设置中配置 *为初始加载使用自定义分区键* 来加快初始加载，以便我们可以并行加载单个表。

### 为什么连接到 MySQL 时会出现 TLS 证书验证错误？ {#tls-certificate-validation-error}

连接到 MySQL 时，您可能会遇到诸如 `x509: certificate is not valid for any names` 或 `x509: certificate signed by unknown authority` 的证书错误。这是因为 ClickPipes 默认启用 TLS 加密。

您有几个选项可以解决这些问题：

1. **设置 TLS 主机字段** - 当您的连接中的主机名与证书不同时（在使用 AWS PrivateLink 通过 Endpoint Service 时常见）。将“TLS 主机（可选）”设置为与证书的公用名 (CN) 或主题备用名称 (SAN) 匹配。

2. **上传您的根 CA** - 对于使用内部证书颁发机构或 Google Cloud SQL 在默认每实例 CA 配置中的 MySQL 服务器。有关如何访问 Google Cloud SQL 证书的更多信息，请参见 [此部分](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)。

3. **配置服务器证书** - 更新您的服务器 SSL 证书以包含所有连接主机名并使用受信任的证书颁发机构。

4. **跳过证书验证** - 对于自托管的 MySQL 或 MariaDB，其默认配置提供无法验证的自签名证书 ([MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic), [MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server))。依赖此证书可以加密传输中的数据，但存在服务器冒充的风险。我们建议在生产环境中使用妥善签署的证书，但在一次性实例上进行测试或连接到遗留基础设施时，此选项非常有用。

### 你们支持架构变更吗？ {#do-you-support-schema-changes}

有关更多信息，请参阅 [ClickPipes for MySQL: 架构变更传播支持](./schema-changes) 页面。

### 你们支持复制 MySQL 外键级联删除 `ON DELETE CASCADE` 吗？ {#support-on-delete-cascade}

由于 MySQL [处理级联删除的方式](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)，因此不将其写入 binlog。因此，ClickPipes（或任何 CDC 工具）无法复制它们。这可能导致数据不一致。建议使用触发器来支持级联删除。

### 为什么我无法复制带有点的表？ {#replicate-table-dot}
PeerDB 目前存在一个限制，源表标识符中的点 - 即架构名称或表名称 - 不支持复制，因为 PeerDB 无法分辨在这种情况下什么是架构，什么是表，因为它是按点分割的。我们正在努力支持分别输入架构和表，以解决此限制。
