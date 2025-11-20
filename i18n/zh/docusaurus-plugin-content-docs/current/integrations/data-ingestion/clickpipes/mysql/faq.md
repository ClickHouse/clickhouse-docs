---
sidebar_label: '常见问题'
description: '关于 ClickPipes for MySQL 的常见问题。'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL 常见问题解答'
doc_type: 'reference'
keywords: ['MySQL ClickPipes 常见问题', 'ClickPipes MySQL 故障排查', 'MySQL ClickHouse 复制', 'ClickPipes MySQL 支持', 'MySQL CDC ClickHouse']
---



# ClickPipes for MySQL 常见问题

### MySQL ClickPipe 是否支持 MariaDB？ {#does-the-clickpipe-support-mariadb}

是的,MySQL ClickPipe 支持 MariaDB 10.0 及以上版本。其配置与 MySQL 非常相似,默认使用 GTID 复制。

### MySQL ClickPipe 是否支持 PlanetScale、Vitess 或 TiDB？ {#does-the-clickpipe-support-planetscale-vitess}

不支持,这些系统不支持 MySQL 的 binlog API。

### 复制是如何管理的？ {#how-is-replication-managed}

我们同时支持 `GTID` 和 `FilePos` 复制。与 Postgres 不同,MySQL 没有槽位来管理偏移量。您必须配置 MySQL 服务器以保留足够长的 binlog 保留期。如果我们在 binlog 中的偏移量失效_(例如,镜像暂停时间过长,或在使用 `FilePos` 复制时发生数据库故障转移)_,则需要重新同步管道。请确保根据目标表优化物化视图,因为低效的查询可能会减慢数据摄取速度,导致落后于保留期。

不活跃的数据库也可能在轮换日志文件时不允许 ClickPipes 推进到更新的偏移量。您可能需要设置一个定期更新的心跳表。

在初始加载开始时,我们会记录起始的 binlog 偏移量。为了使 CDC 能够继续进行,该偏移量在初始加载完成时必须仍然有效。如果您要摄取大量数据,请务必配置适当的 binlog 保留期。在设置表时,您可以通过在高级设置中为大型表配置_使用自定义分区键进行初始加载_来加速初始加载,这样我们就可以并行加载单个表。

### 为什么在连接到 MySQL 时会出现 TLS 证书验证错误？ {#tls-certificate-validation-error}

连接到 MySQL 时,您可能会遇到证书错误,例如 `x509: certificate is not valid for any names` 或 `x509: certificate signed by unknown authority`。这些错误的发生是因为 ClickPipes 默认启用了 TLS 加密。

您有以下几种方式可以解决这些问题:

1. **设置 TLS Host 字段** - 当连接中的主机名与证书不同时(通过 Endpoint Service 使用 AWS PrivateLink 时很常见)。将 "TLS Host (optional)" 设置为与证书的通用名称 (CN) 或主题备用名称 (SAN) 匹配。

2. **上传您的根 CA** - 适用于使用内部证书颁发机构的 MySQL 服务器或采用默认每实例 CA 配置的 Google Cloud SQL。有关如何访问 Google Cloud SQL 证书的更多信息,请参阅[此部分](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)。

3. **配置服务器证书** - 更新服务器的 SSL 证书以包含所有连接主机名,并使用受信任的证书颁发机构。

4. **跳过证书验证** - 适用于自托管的 MySQL 或 MariaDB,其默认配置提供了我们无法验证的自签名证书([MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server))。依赖此证书可以加密传输中的数据,但存在服务器冒充的风险。我们建议在生产环境中使用正确签名的证书,但此选项对于在临时实例上进行测试或连接到旧版基础设施很有用。

### 是否支持 schema 变更？ {#do-you-support-schema-changes}

有关更多信息,请参阅 [ClickPipes for MySQL: Schema 变更传播支持](./schema-changes) 页面。

### 是否支持复制 MySQL 外键级联删除 `ON DELETE CASCADE`？ {#support-on-delete-cascade}

由于 MySQL [处理级联删除的方式](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html),级联删除不会写入 binlog。因此,ClickPipes(或任何 CDC 工具)无法复制它们。这可能导致数据不一致。建议使用触发器来支持级联删除。

### 为什么无法复制名称中包含点号的表？ {#replicate-table-dot}

PeerDB 目前存在一个限制,即不支持复制源表标识符(即 schema 名称或表名称)中包含点号的情况,因为在这种情况下,PeerDB 无法区分哪个是 schema、哪个是表,因为它会按点号进行拆分。
目前正在努力支持单独输入 schema 和表名,以解决此限制。
