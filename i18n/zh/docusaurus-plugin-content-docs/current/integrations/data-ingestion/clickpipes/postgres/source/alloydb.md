---
sidebar_label: 'AlloyDB Postgres'
description: '将 AlloyDB Postgres 实例设置为 ClickPipes 的数据源'
slug: /integrations/clickpipes/postgres/source/alloydb
title: 'AlloyDB Postgres 源配置指南'
doc_type: 'guide'
---

import edit_instance from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/1_edit_instance.png';
import set_flags from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/2_set_flags.png';
import verify_logical_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/3_verify_logical_replication.png';
import configure_network_security from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/4_configure_network_security.png';
import configure_network_security2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/alloydb/5_configure_network_security.png';
import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# AlloyDB Postgres 数据源配置指南 \{#alloydb-postgres-source-setup-guide\}

## 支持的版本 \{#supported-versions\}

要使用 ClickPipes 将数据从 AlloyDB 实例传输到 ClickHouse Cloud，必须将该实例配置为使用 **逻辑复制（logical replication）**。该功能自 **AlloyDB 14 版本** 起受到支持。

## 启用逻辑复制 \{#enable-logical-replication\}

要检查您的 AlloyDB 实例是否已启用逻辑复制，请在主实例上运行以下查询：

```sql
SHOW  wal_level;
```

如果结果为 `logical`，说明已启用逻辑复制，您可以跳到[下一步](#create-a-clickpipes-user-and-manage-replication-permissions)。如果结果为 `replica`，则必须在主实例中将 [`alloydb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) 和 [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) 标志设置为 `on`。

:::warning
如 [AlloyDB 标志文档](https://cloud.google.com/alloydb/docs/reference/alloydb-flags)所述，修改用于启用逻辑复制的标志需要重新启动主实例。
:::

要启用这些标志：

1. 在 Google Cloud 控制台中，导航到 AlloyDB [Clusters](https://console.cloud.google.com/alloydb/clusters) 页面。在主实例的 **Actions** 菜单中，点击 **Edit**。

   <Image img={edit_instance} alt="编辑主实例配置" size="lg" border />

2. 向下滚动到 **Advanced configuration options** 并展开该部分。在 **Flags** 下，点击 **Add a database flag**。

   * 添加 [`allowdb.enable_pglogical`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.enable_pglogical) 标志并将其值设置为 `on`
   * 添加 [`alloydb.logical_decoding`](https://cloud.google.com/alloydb/docs/reference/alloydb-flags#alloydb.logical_decoding) 标志并将其值设置为 `on`

   <Image img={set_flags} alt="将 allowdb.enable_pglogical 和 alloydb.logical_decoding 标志设置为 on" size="lg" border />

3. 点击 **Update instance** 以保存配置更改。需要特别注意的是，此操作**会触发主实例重启。**

4. 当实例状态从 `Updating` 变为 `Ready` 后，在主实例上运行以下查询，以验证已启用逻辑复制：

   ```sql
   SHOW  wal_level;
   ```

   结果应为 `logical`。

   <Image img={verify_logical_replication} alt="验证逻辑复制已启用" size="lg" border />


## 创建 ClickPipes 用户并管理复制权限 \{#create-a-clickpipes-user-and-manage-replication-permissions\}

以管理员用户连接到 AlloyDB 实例并执行以下命令：

1. 为 ClickPipes 创建一个专用用户：

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. 为上一步创建的用户授予 schema 级别的只读访问权限。下面的示例展示了针对 `public` schema 的权限设置。对于每个包含需要复制的表的 schema，重复执行这些命令：
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. 为该用户授予复制权限：

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. 使用你希望复制的表创建一个 [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html)。强烈建议仅在 publication 中包含实际需要的表，以避免额外的性能开销。

   :::warning
   包含在 publication 中的任意表必须要么定义了 **primary key**，要么将其 **replica identity** 配置为 `FULL`。关于范围设置的指导，请参阅 [Postgres 常见问题](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication)。
   :::

   - 为特定表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - 为特定 schema 中的所有表创建 publication：

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   `clickpipes` publication 将包含由指定表生成的一组变更事件，稍后将用于摄取复制流。

## 配置网络访问 \{#configure-network-access\}

:::note
ClickPipes 不支持 Private Service Connect (PSC) 连接。如果你不允许对 AlloyDB 实例的公共访问，可以[使用 SSH 隧道](#configure-network-access)以安全方式连接。PSC 将在未来提供支持。
:::

接下来，你需要允许 ClickPipes 连接到你的 AlloyDB 实例。

<Tabs groupId="network-configuration">
<TabItem value="public-ip" label="允许 ClickPipes 的 IP">

1. 在 Google Cloud Console 中，导航到 AlloyDB [Clusters](https://console.cloud.google.com/alloydb/clusters) 页面。选择你的主实例以打开 **Overview** 页面。

2. 向下滚动至 **Instances in your cluster** 并点击 **Edit primary**。

3. 勾选 **Enable Public IP** 复选框，以允许通过公共互联网连接到该实例。在 **Authorized external networks** 下，为你的服务部署所在区域输入[ClickPipes 静态 IP 地址列表](../../index.md#list-of-static-ips)。

   <Image img={configure_network_security} alt="使用 IP 允许列表配置公共访问的网络" size="lg" border/>

   :::note
   AlloyDB 要求使用 [CIDR 表示法](https://cloud.google.com/alloydb/docs/connection-overview#public-ip)指定地址。你可以通过在每个地址后追加 `/32`，将提供的 ClickPipes 静态 IP 地址列表调整为符合该表示法。
   :::

4. 在 **Network Security** 下，选择 **Require SSL Encryption (default)**（如果尚未选择）。

5. 点击 **Update instance** 以保存网络安全配置更改。

</TabItem>
<TabItem value="ssh-tunnel" label="使用 SSH 隧道">

如果你不允许对 AlloyDB 实例的公共访问，必须先设置一个 SSH 跳板机，通过安全隧道转发连接。在 Google Cloud Platform 上设置 SSH 跳板机的方法如下：

1. 按照[官方文档](https://cloud.google.com/compute/docs/instances/create-start-instance)创建并启动一个 Google Compute Engine (GCE) 实例。
   - 确保 GCE 实例与 AlloyDB 实例位于同一虚拟私有网络 (VPC) 中。
   - 确保 GCE 实例具有[静态公共 IP 地址](https://cloud.google.com/compute/docs/ip-addresses/reserve-static-external-ip-address)。在将 ClickPipes 连接到 SSH 跳板机时，你将使用此 IP 地址。

2. 更新 SSH 跳板机的防火墙规则，以允许来自你的服务部署所在区域的 [ClickPipes 静态 IP 地址列表](../../index.md#list-of-static-ips) 的流量。

3. 更新 AlloyDB 的防火墙规则，以允许来自 SSH 跳板机的流量。

</TabItem>
</Tabs>

## 下一步 \{#whats-next\}

现在可以[创建 ClickPipe](../index.md)，并开始将 Postgres 实例中的数据摄取到 ClickHouse Cloud 中。
请务必记录在设置 Postgres 实例时使用的连接信息，因为在创建 ClickPipe 时需要用到这些信息。