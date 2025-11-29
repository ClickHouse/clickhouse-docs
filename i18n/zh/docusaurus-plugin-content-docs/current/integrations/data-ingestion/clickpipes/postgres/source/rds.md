---
sidebar_label: 'Amazon RDS Postgres'
description: '将 Amazon RDS Postgres 配置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/rds
title: 'RDS Postgres 数据源设置指南'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '数据摄取', '实时同步']
---

import parameter_group_in_blade from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/parameter_group_in_blade.png';
import change_rds_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_rds_logical_replication.png';
import change_wal_sender_timeout from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/change_wal_sender_timeout.png';
import modify_parameter_group from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/modify_parameter_group.png';
import reboot_rds from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/reboot_rds.png';
import security_group_in_rds_postgres from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/security_group_in_rds_postgres.png';
import edit_inbound_rules from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/rds/edit_inbound_rules.png';
import Image from '@theme/IdealImage';


# RDS Postgres 数据源配置指南 {#rds-postgres-source-setup-guide}



## 支持的 Postgres 版本 {#supported-postgres-versions}

ClickPipes 支持 Postgres 12 及以上版本。



## 启用逻辑复制 {#enable-logical-replication}

如果您的 RDS 实例已配置以下设置，则可以跳过本节：

* `rds.logical_replication = 1`
* `wal_sender_timeout = 0`

如果您之前使用过其他数据复制工具，这些设置通常已经为您预先配置好了。

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

如果尚未进行相应配置，请按照以下步骤操作：

1. 为您的 Postgres 版本创建一个包含所需设置的新参数组：
   * 将 `rds.logical_replication` 设置为 1
   * 将 `wal_sender_timeout` 设置为 0

<Image img={parameter_group_in_blade} alt="在 RDS 中哪里可以找到参数组？" size="lg" border />

<Image img={change_rds_logical_replication} alt="修改 rds.logical_replication" size="lg" border />

<Image img={change_wal_sender_timeout} alt="修改 wal_sender_timeout" size="lg" border />

2. 将新的参数组应用到您的 RDS Postgres 数据库

<Image img={modify_parameter_group} alt="为 RDS Postgres 应用新的参数组" size="lg" border />

3. 重启您的 RDS 实例以使更改生效

<Image img={reboot_rds} alt="重启 RDS Postgres" size="lg" border />


## 配置数据库用户 {#configure-database-user}

以管理员用户身份连接到您的 RDS Postgres 实例，并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

    ```sql
    CREATE USER clickpipes_user PASSWORD 'some-password';
    ```

2. 授予 schema 权限。以下示例展示了为 `public` schema 授权的命令。对于每个希望复制的 schema，重复执行这些命令：

    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 授予复制权限：

    ```sql
    GRANT rds_replication TO clickpipes_user;
    ```

4. 为复制创建一个 publication（发布集）：

    ```sql
    CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
    ```



## 配置网络访问 {#configure-network-access}

### 基于 IP 的访问控制 {#ip-based-access-control}

如果你想限制到 RDS 实例的访问流量，请将[文档中列出的静态 NAT IP](../../index.md#list-of-static-ips)添加到 RDS 安全组的 `Inbound rules` 中。

<Image img={security_group_in_rds_postgres} alt="在 RDS Postgres 中哪里可以找到安全组？" size="lg" border/>

<Image img={edit_inbound_rules} alt="编辑上述安全组的入站规则" size="lg" border/>

### 通过 AWS PrivateLink 的私有访问 {#private-access-via-aws-privatelink}

要通过私有网络连接到 RDS 实例，可以使用 AWS PrivateLink。请按照我们的[适用于 ClickPipes 的 AWS PrivateLink 配置指南](/knowledgebase/aws-privatelink-setup-for-clickpipes)来完成连接设置。

### RDS Proxy 的变通方案 {#workarounds-for-rds-proxy}
RDS Proxy 不支持逻辑复制类型的连接。如果你在 RDS 中使用动态 IP 地址且无法使用 DNS 名称或 Lambda 函数，可以考虑以下替代方案：

1. 使用 cron 作业，定期解析 RDS 端点的 IP，并在发生变化时更新 NLB。
2. 使用带有 EventBridge/SNS 的 RDS 事件通知：利用 AWS RDS 事件通知自动触发更新。
3. 固定的 EC2 实例：部署一个 EC2 实例，作为轮询服务或基于 IP 的代理。
4. 使用 Terraform 或 CloudFormation 等工具实现 IP 地址管理自动化。



## 下一步 {#whats-next}

现在你可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录下在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 时将会用到这些信息。
