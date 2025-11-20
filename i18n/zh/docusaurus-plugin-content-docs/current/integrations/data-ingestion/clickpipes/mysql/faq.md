---
sidebar_label: '常见问题'
description: '关于 ClickPipes for MySQL 的常见问题。'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL 常见问题解答'
doc_type: 'reference'
keywords: ['MySQL ClickPipes 常见问题', 'ClickPipes MySQL 故障排查', 'MySQL ClickHouse 复制', 'ClickPipes MySQL 支持', 'MySQL CDC ClickHouse']
---



# ClickPipes for MySQL 常见问题解答

### MySQL ClickPipe 是否支持 MariaDB？ {#does-the-clickpipe-support-mariadb}

是的，MySQL ClickPipe 支持 MariaDB 10.0 及以上版本。其配置与 MySQL 非常相似，默认使用 GTID 复制。

### MySQL ClickPipe 是否支持 PlanetScale、Vitess 或 TiDB？ {#does-the-clickpipe-support-planetscale-vitess}

不支持，这些系统不支持 MySQL 的 binlog API。

### 复制是如何管理的？ {#how-is-replication-managed}

我们同时支持 `GTID` 和 `FilePos` 复制。不同于 Postgres，这里没有用于管理偏移量的 slot。相应地，你必须将 MySQL 服务器配置为拥有足够长的 binlog 保留周期。如果我们在 binlog 中的偏移量失效（例如，镜像暂停时间过长，或者在使用 `FilePos` 复制时发生数据库故障切换），则需要重新同步该管道。请务必根据目标表优化物化视图，因为低效查询会拖慢数据写入速度，导致进度落后于保留周期。

对于不活跃的数据库，也可能在未让 ClickPipes 推进到更新偏移量的情况下就轮转日志文件。你可能需要设置一个心跳表，并定期更新它。

在初始加载开始时，我们会记录一个 binlog 起始偏移量。只有当初始加载完成时该偏移量仍然有效，CDC 才能继续推进。如果你要导入大量数据，请务必配置合适的 binlog 保留周期。在创建表时，对于大表可以在高级设置中启用“_为初始加载使用自定义分区键_”，以便我们能够对单个表进行并行加载，从而加快初始加载速度。

### 连接到 MySQL 时为什么会出现 TLS 证书验证错误？ {#tls-certificate-validation-error}

连接到 MySQL 时，你可能会遇到诸如 `x509: certificate is not valid for any names` 或 `x509: certificate signed by unknown authority` 之类的证书错误。这是因为 ClickPipes 默认启用了 TLS 加密。

你可以通过以下几种方式来解决这些问题：

1. **设置 TLS Host 字段** —— 当连接中使用的主机名与证书中的主机名不一致时（在通过 Endpoint Service 使用 AWS PrivateLink 时较常见），将 “TLS Host (optional)” 设置为证书中的 Common Name（CN）或 Subject Alternative Name（SAN）。

2. **上传你的根 CA** —— 适用于使用内部证书颁发机构（CA）的 MySQL 服务器，或使用默认“按实例 CA 配置”的 Google Cloud SQL。关于如何获取 Google Cloud SQL 证书的详细信息，请参阅[此部分](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)。

3. **配置服务器证书** —— 更新服务器的 SSL 证书，使其包含所有可能的连接主机名，并使用受信任的证书颁发机构。

4. **跳过证书验证** —— 适用于自托管的 MySQL 或 MariaDB，这些系统在默认配置下通常使用我们无法验证的自签名证书（[MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)）。依赖这种证书可以对传输中的数据进行加密，但存在服务器被冒充的风险。我们建议在生产环境中使用正确签发的证书，但对于一次性测试实例或连接到遗留基础设施时，该选项会比较实用。

### 是否支持模式（schema）变更？ {#do-you-support-schema-changes}

更多信息请参阅文档页面：[ClickPipes for MySQL：模式变更传播支持](./schema-changes)。

### 是否支持复制 MySQL 外键级联删除 `ON DELETE CASCADE`？ {#support-on-delete-cascade}

由于 MySQL [处理级联删除的方式](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)，这些操作不会写入 binlog。因此，ClickPipes（或任何 CDC 工具）都无法复制这些操作，这可能会导致数据不一致。建议改用触发器来实现级联删除。

### 为什么无法复制名称中带点的表？ {#replicate-table-dot}

PeerDB 目前存在一个限制：源表标识符中包含点（无论是模式名还是表名中带有点）时，不支持复制，因为 PeerDB 会按点进行拆分，在这种情况下无法区分哪个是模式，哪个是表名。  
我们正在努力支持将模式和表以独立字段输入，以绕过这一限制。
