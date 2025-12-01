---
sidebar_label: 'Amazon Aurora Postgres'
description: '将 Amazon Aurora Postgres 设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres 数据源配置指南'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS 数据库', '逻辑复制配置']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Aurora Postgres 源端配置指南 {#aurora-postgres-source-setup-guide}



## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Aurora PostgreSQL-Compatible Edition 12 及以上版本。



## 启用逻辑复制 {#enable-logical-replication}

如果您的 Aurora 实例已经配置了以下设置，则可以跳过本节：

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

如果您之前使用过其他数据复制工具，这些设置通常已经预先配置好了。

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

如果尚未配置，请按照以下步骤操作：

1. 为当前使用的 Aurora PostgreSQL 版本创建一个新的参数组，并设置以下参数：
   * 将 `rds.logical_replication` 设置为 1
   * 将 `wal_sender_timeout` 设置为 0

<Image img={parameter_group_in_blade} alt="在 Aurora 中查找参数组的位置" size="lg" border />

<Image img={change_rds_logical_replication} alt="修改 rds.logical_replication" size="lg" border />

<Image img={change_wal_sender_timeout} alt="修改 wal_sender_timeout" size="lg" border />

2. 将新的参数组应用到 Aurora PostgreSQL 集群

<Image img={modify_parameter_group} alt="使用新的参数组修改 Aurora PostgreSQL" size="lg" border />

3. 重启 Aurora 集群以应用更改

<Image img={reboot_rds} alt="重启 Aurora PostgreSQL" size="lg" border />


## 配置数据库用户 {#configure-database-user}

以管理员用户连接到你的 Aurora PostgreSQL writer 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 授予 schema 权限。以下示例演示如何为 `public` schema 授权。对于每个你希望复制的 schema，重复执行这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 授予复制权限：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. 为复制创建一个 publication：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```



## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

如果希望限制访问 Aurora 集群的入站流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 Aurora 安全组的 `Inbound rules` 中。

<Image img={security_group_in_rds_postgres} alt="在 Aurora PostgreSQL 中在哪里可以找到安全组？" size="lg" border/>

<Image img={edit_inbound_rules} alt="为上述安全组编辑入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到 Aurora 集群，可以使用 AWS PrivateLink。请按照我们的 [ClickPipes 的 AWS PrivateLink 配置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 来完成连接设置。

### Aurora 专用注意事项 {#aurora-specific-considerations}

在为 Aurora PostgreSQL 配置 ClickPipes 时，请注意以下事项：

1. **连接端点**：始终连接到 Aurora 集群的 writer 端点，因为逻辑复制需要写入权限来创建复制插槽，并且必须连接到主实例。

2. **故障转移处理**：在发生故障转移时，Aurora 会自动将某个 reader 提升为新的 writer。ClickPipes 会检测到连接中断，并尝试重新连接到 writer 端点，此时该端点会指向新的主实例。

3. **全局数据库**：如果使用的是 Aurora Global Database，则应连接到主区域的 writer 端点，因为跨区域复制已经负责在各区域之间传输数据。

4. **存储注意事项**：Aurora 的存储层在集群中的所有实例之间共享，与标准 RDS 相比，这可以为逻辑复制提供更好的性能。

### 处理动态集群端点 {#dealing-with-dynamic-cluster-endpoints}

虽然 Aurora 提供的端点是稳定的，并会自动路由到合适的实例，但以下是一些确保连接稳定性的一般做法：

1. 对于高可用部署，将应用程序配置为使用 Aurora writer 端点，该端点会自动指向当前的主实例。

2. 如果使用跨区域复制，建议为每个区域分别配置独立的 ClickPipes，以降低延迟并提升容错能力。



## 接下来 {#whats-next}

现在，你可以[创建 ClickPipe](../index.md)，并开始将 Aurora PostgreSQL 集群中的数据摄取到 ClickHouse Cloud 中。
请务必记录你在设置 Aurora PostgreSQL 集群时使用的连接信息，因为在创建 ClickPipe 的过程中你将需要这些信息。
