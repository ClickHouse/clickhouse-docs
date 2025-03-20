---
sidebar_label: Amazon RDS Postgres
description: 将 Amazon RDS Postgres 设置为 ClickPipes 的数据源
slug: /integrations/clickpipes/postgres/source/rds
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';


# RDS Postgres 数据源设置指南

## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 版本 12 及更高版本。

## 启用逻辑复制 {#enable-logical-replication}

如果您的 RDS 实例已经配置了以下设置，您可以跳过此部分：
- `rds.logical_replication = 1`
- `wal_sender_timeout = 0`

如果您之前使用过其他数据复制工具，这些设置通常是预配置的。

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

1. 为您的 Postgres 版本创建一个新的参数组，并设置所需的配置：
    - 将 `rds.logical_replication` 设置为 1
    - 将 `wal_sender_timeout` 设置为 0

<img src={parameter_group_in_blade} alt="在哪里找到 RDS 中的参数组？" />

<img src={change_rds_logical_replication} alt="更改 rds.logical_replication" />

<img src={change_wal_sender_timeout} alt="更改 wal_sender_timeout" />

2. 将新参数组应用于您的 RDS Postgres 数据库

<img src={modify_parameter_group} alt="使用新参数组修改 RDS Postgres" />

3. 重启您的 RDS 实例以应用更改

<img src={reboot_rds} alt="重启 RDS Postgres" />

## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到您的 RDS Postgres 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 授予模式权限。以下示例显示了对 `public` 模式的权限。对每个要复制的模式重复这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 授予复制权限：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. 创建一个用于复制的出版物：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```

## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

如果您想限制对 RDS 实例的流量，请将 [文档中的静态 NAT IP](../../index.md#list-of-static-ips) 添加到 RDS 安全组的 `Inbound rules` 中。

<img src={security_group_in_rds_postgres} alt="在哪里找到 RDS Postgres 中的安全组？" />

<img src={edit_inbound_rules} alt="编辑上述安全组的入站规则" />

### 通过 AWS PrivateLink 进行私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到您的 RDS 实例，您可以使用 AWS PrivateLink。请遵循我们的 [ClickPipes 的 AWS PrivateLink 设置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes) 来设置连接。

### RDS Proxy 的变通方法 {#workarounds-for-rds-proxy}
RDS Proxy 不支持逻辑复制连接。如果您在 RDS 中有动态 IP 地址并且不能使用 DNS 名称或 Lambda，以下是一些替代方案：

1. 使用 cron 作业定期解析 RDS 端点的 IP，并在更改时更新 NLB。
2. 使用 RDS 事件通知与 EventBridge/SNS：通过 AWS RDS 事件通知自动触发更新。
3. 稳定的 EC2：部署一个 EC2 实例作为轮询服务或基于 IP 的代理。
4. 使用 Terraform 或 CloudFormation 等工具自动管理 IP 地址。

## 接下来怎么做？ {#whats-next}

您现在可以 [创建您的 ClickPipe](../index.md)，开始将来自 Postgres 实例的数据引入 ClickHouse Cloud。
请记下您在设置 Postgres 实例时使用的连接详细信息，因为在创建 ClickPipe 时将需要这些信息。
