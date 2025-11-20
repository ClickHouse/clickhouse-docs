---
sidebar_label: 'Amazon Aurora Postgres'
description: '将 Amazon Aurora Postgres 配置为 ClickPipes 的源'
slug: /integrations/clickpipes/postgres/source/aurora
title: 'Aurora Postgres 源配置指南'
doc_type: 'guide'
keywords: ['Amazon Aurora', 'PostgreSQL', 'ClickPipes', 'AWS database', 'logical replication setup']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# Aurora Postgres 源端设置指南



## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Aurora PostgreSQL 兼容版 12 及更高版本。


## 启用逻辑复制 {#enable-logical-replication}

如果您的 Aurora 实例已配置以下设置,则可以跳过本节:

- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

如果您之前使用过其他数据复制工具,通常这些设置已经预先配置好了。

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

如果尚未配置,请按以下步骤操作:

1. 为您的 Aurora PostgreSQL 版本创建新的参数组并配置所需设置:
   - 将 `rds.logical_replication` 设置为 1
   - 将 `wal_sender_timeout` 设置为 0

<Image
  img={parameter_group_in_blade}
  alt='在 Aurora 中查找参数组的位置'
  size='lg'
  border
/>

<Image
  img={change_rds_logical_replication}
  alt='更改 rds.logical_replication'
  size='lg'
  border
/>

<Image
  img={change_wal_sender_timeout}
  alt='更改 wal_sender_timeout'
  size='lg'
  border
/>

2. 将新参数组应用到您的 Aurora PostgreSQL 集群

<Image
  img={modify_parameter_group}
  alt='使用新参数组修改 Aurora PostgreSQL'
  size='lg'
  border
/>

3. 重启 Aurora 集群以应用更改

<Image img={reboot_rds} alt='重启 Aurora PostgreSQL' size='lg' border />


## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到 Aurora PostgreSQL 写入实例,并执行以下命令:

1. 为 ClickPipes 创建专用用户:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 授予 schema 权限。以下示例展示了 `public` schema 的权限设置。对每个需要复制的 schema 重复执行这些命令:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. 授予复制权限:

   ```sql
   GRANT rds_replication TO clickpipes_user;
   ```

4. 创建用于复制的发布:

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```


## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

如果您想限制对 Aurora 集群的流量访问,请将[文档中记录的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 Aurora 安全组的 `Inbound rules` 中。

<Image
  img={security_group_in_rds_postgres}
  alt='在 Aurora PostgreSQL 中哪里可以找到安全组?'
  size='lg'
  border
/>

<Image
  img={edit_inbound_rules}
  alt='编辑上述安全组的入站规则'
  size='lg'
  border
/>

### 通过 AWS PrivateLink 进行私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到您的 Aurora 集群,您可以使用 AWS PrivateLink。请按照我们的 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes)来建立连接。

### Aurora 特定注意事项 {#aurora-specific-considerations}

在使用 Aurora PostgreSQL 设置 ClickPipes 时,请注意以下事项:

1. **连接端点**:始终连接到 Aurora 集群的写入端点,因为逻辑复制需要写入权限来创建复制槽,并且必须连接到主实例。

2. **故障转移处理**:在发生故障转移时,Aurora 会自动将一个读取器提升为新的写入器。ClickPipes 将检测到断开连接并尝试重新连接到写入端点,该端点现在将指向新的主实例。

3. **全局数据库**:如果您使用的是 Aurora Global Database,应连接到主区域的写入端点,因为跨区域复制已经处理了区域之间的数据移动。

4. **存储注意事项**:Aurora 的存储层在集群中的所有实例之间共享,与标准 RDS 相比,这可以为逻辑复制提供更好的性能。

### 处理动态集群端点 {#dealing-with-dynamic-cluster-endpoints}

虽然 Aurora 提供了自动路由到适当实例的稳定端点,但以下是确保连接一致性的一些额外方法:

1. 对于高可用性设置,请将您的应用程序配置为使用 Aurora 写入端点,该端点会自动指向当前的主实例。

2. 如果使用跨区域复制,请考虑为每个区域设置单独的 ClickPipes,以减少延迟并提高容错能力。


## 下一步 {#whats-next}

现在您可以[创建 ClickPipe](../index.md)，开始将 Aurora PostgreSQL 集群中的数据导入 ClickHouse Cloud。
请务必记录设置 Aurora PostgreSQL 集群时使用的连接信息，创建 ClickPipe 时需要用到这些信息。
