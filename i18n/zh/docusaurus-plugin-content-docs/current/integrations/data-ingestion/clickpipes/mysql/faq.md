---
sidebar_label: '常见问题'
description: '关于 ClickPipes for MySQL 的常见问题解答。'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL 常见问题解答'
doc_type: 'reference'
keywords: ['MySQL ClickPipes 常见问题', 'ClickPipes MySQL 故障排查', 'MySQL ClickHouse 复制', 'ClickPipes MySQL 支持', 'MySQL CDC ClickHouse']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# 适用于 MySQL 的 ClickPipes 常见问题解答 \{#clickpipes-for-mysql-faq\}

### MySQL ClickPipe 是否支持 MariaDB？ \{#does-the-clickpipe-support-mariadb\}

是的，MySQL ClickPipe 支持 MariaDB 10.0 及更高版本。其配置与 MySQL 非常相似，默认使用 GTID 复制。

### MySQL ClickPipe 是否支持 PlanetScale、Vitess 或 TiDB？ \{#does-the-clickpipe-support-planetscale-vitess\}

不支持，因为这些数据库不支持 MySQL 的 binlog API。

### 如何管理复制？ \{#how-is-replication-managed\}

我们同时支持 `GTID` 和 `FilePos` 复制。与 Postgres 不同，这里没有用于管理 offset 的 slot。相反，您必须将 MySQL 服务器配置为具有足够长的 binlog 保留周期。如果我们在 binlog 中的 offset 失效（*例如，mirror 暂停时间过长，或者在使用 `FilePos` 复制时发生数据库故障切换*），那么您需要重新同步该 ClickPipe。请务必根据目标表优化 materialized view，因为低效的查询会减慢摄取速度，导致进度落后于保留周期。

对于一个不活跃的数据库，也有可能在未允许 ClickPipes 推进到更新 offset 的情况下轮转日志文件。此时您可能需要设置一个带有定期更新的心跳表。

在初始加载开始时，我们会记录一个 binlog offset 作为起始位置。为了让 CDC 能够继续，这个 offset 在初始加载完成时仍然必须是有效的。如果您正在摄取大量数据，请确保配置合适的 binlog 保留周期。在设置表时，您可以通过在高级设置中为大表配置 *Use a custom partitioning key for initial load* 来加速初始加载，这样我们就可以并行加载单个表。

### 为什么在连接 MySQL 时出现 TLS 证书验证错误？ \{#tls-certificate-validation-error\}

在连接 MySQL 时，您可能会遇到类似 `x509: certificate is not valid for any names` 或 `x509: certificate signed by unknown authority` 的证书错误。这是因为 ClickPipes 默认启用了 TLS 加密。

您可以通过以下几种方式来解决这些问题：

1. **设置 TLS Host 字段** - 当连接中使用的主机名与证书中的主机名不一致时（在通过 Endpoint Service 使用 AWS PrivateLink 时很常见），请将 “TLS Host (optional)” 设置为与证书的 Common Name (CN) 或 Subject Alternative Name (SAN) 相匹配。

2. **上传 Root CA** - 适用于使用内部证书颁发机构（CA）的 MySQL 服务器，或使用默认按实例 CA 配置的 Google Cloud SQL。有关如何获取 Google Cloud SQL 证书的更多信息，请参阅[本节](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)。

3. **配置服务器证书** - 更新服务器的 SSL 证书，使其包含所有连接使用的主机名，并由受信任的证书颁发机构签发。

4. **跳过证书验证** - 适用于自托管的 MySQL 或 MariaDB，这类系统的默认配置通常会生成一个我们无法验证的自签名证书（[MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)）。依赖该证书可以对传输中的数据进行加密，但存在服务器被冒充的风险。我们建议在生产环境中使用由权威机构正式签发的证书，但此选项对于在临时实例上进行测试或连接到遗留基础设施时非常有用。

### 是否支持 schema 变更？ \{#do-you-support-schema-changes\}

请参阅[ClickPipes for MySQL：schema 变更传播支持](./schema-changes)页面以了解更多信息。

### 是否支持复制 MySQL 外键级联删除 `ON DELETE CASCADE`？ \{#support-on-delete-cascade\}

由于 MySQL [处理级联删除的方式](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)，这类删除操作不会写入 binlog。因此，ClickPipes（或任何 CDC（变更数据捕获）工具）都无法复制这些删除操作，这可能会导致数据不一致。建议改用触发器来实现级联删除。

### 为什么我无法复制名称中带点号的表？ \{#replicate-table-dot\}

PeerDB 当前存在一个限制：对于源表标识符（即 schema 名称或表名），如果其中包含点号，则不支持复制。因为在这种情况下，PeerDB 会按点号拆分标识符，无法区分哪一部分是 schema、哪一部分是表名。
我们正致力于支持分别输入 schema 和表名，以绕过这一限制。

### 我可以把最初在复制中排除的列重新纳入复制吗？ \{#include-excluded-columns\}

目前尚不支持此功能，替代方案是对你希望包含这些列的[表执行重新同步](./table_resync.md)。