---
sidebar_label: 'Amazon Aurora Postgres'
description: '将 Amazon Aurora Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres 数据源配置指南'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS 数据库', '逻辑复制配置']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';

# Aurora Postgres 数据源配置指南 \{#aurora-postgres-source-setup-guide\}

## 支持的 Postgres 版本 \{#supported-postgres-versions\}

ClickPipes 支持 Aurora PostgreSQL-Compatible Edition 12 及以上版本。

## 启用逻辑复制 \{#enable-logical-replication\}

如果您的 Aurora 实例已配置以下设置，则可以跳过本节：

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

如果您之前使用过其他数据复制工具，这些设置通常已预先配置。

```text
postgres=> SHOW rds.logical_replication ;
 rds.logical_replication
-------------------------
 on
(1 row)

postgres=> SHOW wal_sender_timeout ;
 wal_sender_timeout
--------------------
 0
(1 row)
```

如果尚未完成配置，请按以下步骤操作：

1. 为您的 Aurora PostgreSQL 版本创建一个包含必需设置的新参数组：
   * 将 `rds.logical_replication` 设置为 1
   * 将 `wal_sender_timeout` 设置为 0

<Image img={parameter_group_in_blade} alt="在 Aurora 中查找参数组的位置" size="lg" border />

<Image img={change_rds_logical_replication} alt="修改 rds.logical_replication" size="lg" border />

<Image img={change_wal_sender_timeout} alt="修改 wal_sender_timeout" size="lg" border />

2. 将新参数组应用到您的 Aurora PostgreSQL 集群

<Image img={modify_parameter_group} alt="使用新参数组修改 Aurora PostgreSQL" size="lg" border />

3. 重启您的 Aurora 集群以使更改生效

<Image img={reboot_rds} alt="重启 Aurora PostgreSQL" size="lg" border />

## 配置数据库用户 \{#configure-database-user\}

使用管理员用户连接到您的 Aurora PostgreSQL 写入实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为您在上一步创建的用户授予 schema 级别的只读权限。以下示例展示了 `public` schema 的权限。对于每个包含待复制表的 schema，都请重复执行这些命令：

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 为该用户授予复制权限：

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. 使用您要复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。我们强烈建议只将所需的表包含在 publication 中，以避免额外的性能开销。

   :::warning
   publication 中包含的任何表都必须已定义 **primary key**，*或者* 将其 **副本 identity** 配置为 `FULL`。有关如何确定范围的指导，请参阅 [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   * 为特定表创建 publication：

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
     ```

   * 为特定 schema 中的所有表创建 publication：

     ```sql
     CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
     ```

   `clickpipes` publication 将包含指定表产生的变更事件集合，后续将用于摄取复制流。

## 配置网络访问权限 \{#configure-network-access\}

### 基于 IP 的访问控制 \{#ip-based-access-control\}

如果您想限制对您的 Aurora 集群的访问流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips)添加到您的 Aurora 安全组的 `Inbound rules` 中。

<Image img={security_group_in_rds_postgres} alt="在哪里可以找到 Aurora PostgreSQL 的安全组？" size="lg" border />

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border />

### 通过 AWS PrivateLink 进行私有访问 \{#private-access-via-aws-privatelink\}

如需通过私有网络连接到您的 Aurora 集群，可以使用 AWS PrivateLink。请按照我们的 [ClickPipes AWS PrivateLink 配置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 完成连接配置。

### Aurora 特定注意事项 \{#aurora-specific-considerations\}

使用 Aurora PostgreSQL 设置 ClickPipes 时，请牢记以下注意事项：

1. **连接端点**：始终连接到 Aurora 集群 的写入端点，因为逻辑复制需要写入权限来创建复制槽，并且必须连接到主 实例。

2. **故障切换处理**：发生故障切换时，Aurora 会自动将一个 reader 提升为新的写入节点。ClickPipes 会检测到连接中断，并尝试重新连接到写入端点，而该端点此时会指向新的主 实例。

3. **Global Database**：如果您使用的是 Aurora Global Database，则应连接到主区域的写入端点，因为跨区域复制已负责处理区域之间的数据传输。

4. **存储注意事项**：Aurora 的存储层由 集群 中的所有 实例 共享，因此与标准 RDS 相比，通常能为逻辑复制提供更好的性能。

### 处理动态集群端点 \{#dealing-with-dynamic-cluster-endpoints\}

虽然 Aurora 提供了稳定的端点，并会自动路由到相应的实例，但您还可以采用以下方法来确保连接始终保持一致：

1. 对于高可用配置，请将您的应用配置为使用 Aurora 写入端点，该端点会自动指向当前的主实例。

2. 如果使用跨区域复制，建议为每个区域分别设置 ClickPipes，以降低延迟并提高容错能力。

## 接下来做什么？ \{#whats-next\}

您现在可以[创建您的 ClickPipe](../index.md)，并开始将 Aurora PostgreSQL 集群中的数据摄取到 ClickHouse Cloud。
请务必记下您在设置 Aurora PostgreSQL 集群时使用的连接信息，因为在创建 ClickPipe 的过程中需要用到这些信息。