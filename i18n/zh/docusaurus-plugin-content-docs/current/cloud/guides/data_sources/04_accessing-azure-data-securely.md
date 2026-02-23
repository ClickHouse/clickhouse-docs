---
slug: /cloud/data-sources/secure-azure
sidebar_label: '安全访问 Azure 数据'
title: '将 ClickHouse Cloud 连接到 Azure Blob Storage'
description: '本文演示 ClickHouse Cloud 客户如何安全地访问其在 Azure 上的数据'
keywords: ['ABS', 'azure blob storage']
doc_type: 'guide'
---

本指南介绍如何安全地将 ClickHouse Cloud 连接到 Azure Blob Storage，用于数据摄取、外部表以及其他集成场景。

## 概述 \{#overview\}

ClickHouse Cloud 可以使用多种身份验证方法连接到 Azure Blob Storage。
本指南将帮助你选择合适的方式并安全地配置连接。

支持的使用场景：

- 使用 [azureBlobStorage 表函数](/sql-reference/table-functions/azureBlobStorage) 从 Azure Blob Storage 读取数据
- 使用 [AzureBlobStorage 表引擎](/engines/table-engines/integrations/azureBlobStorage) 创建外部表
- 通过 ClickPipes 摄取数据
- [将备份存储到 Azure Blob Storage](/cloud/manage/backups/backup-restore-via-ui#azure)

:::warning 重要的网络限制
当你的 ClickHouse Cloud 服务和 Azure Blob Storage 容器部署在同一 Azure 区域时，IP 地址白名单不起作用。

这是因为 Azure 会将同一区域内的流量通过其内部网络（VNet + Service Endpoints）进行路由，绕过公共互联网和 NAT 网关。
因此，你基于公共 IP 地址配置的 Azure Storage Account 防火墙规则将不会生效。

在以下情况下，IP 白名单可以生效：

- ClickHouse Cloud 服务所在的 Azure 区域与存储帐户所在区域不同
- ClickHouse Cloud 服务运行在 AWS/GCP 上并连接到 Azure 存储

在以下情况下，IP 白名单会失效：

- ClickHouse Cloud 服务与存储位于同一 Azure 区域。请通过连接字符串使用 [共享访问签名 (SAS)](/integrations/clickpipes/object-storage/abs/overview#authentication) 来替代 IP 白名单，或将 ABS 和 ClickHouse 部署在不同区域。
:::

## 网络配置（仅跨区域） \{#network-config\}

:::warning 仅限跨区域
本节仅适用于以下情况：你的 ClickHouse Cloud 服务与 Azure Blob Storage 容器位于不同的 Azure 区域，或 ClickHouse Cloud 运行在 AWS/GCP 上。
对于同一区域的部署，请改用 SAS 令牌。
:::

<VerticalStepper headerLevel="h3">

### 查找你的 ClickHouse Cloud 出站 IP \{#find-egress-ips\}

要配置基于 IP 的防火墙规则，你需要将 ClickHouse Cloud 所在区域的出站 IP 地址加入允许列表。

运行以下命令，以按区域获取出站和入站 IP 列表。  
将下面的 `eastus` 替换为你的区域，以过滤掉其他区域：

```bash
# 对于 Azure 区域
curl https://api.clickhouse.cloud/static-ips.json | jq '.azure[] | select(.region == "westus")'
```

你将看到类似如下的输出：

```response
{
  "egress_ips": [
    "20.14.94.21",
    "20.150.217.205",
    "20.38.32.164"
  ],
  "ingress_ips": [
    "4.227.34.126"
  ],
  "region": "westus3"
}
```

:::tip
参见 [Azure 区域](/cloud/reference/supported-regions#azure-regions) 中受支持的 Cloud 区域列表，
以及 [Azure 区域列表](https://learn.microsoft.com/en-us/azure/reliability/regions-list#azure-regions-list-1) 中
“Programmatic name” 列了解应使用的名称。
:::

更多详情参见 ["Cloud IP addresses"](/manage/data-sources/cloud-endpoints-api)。

### 配置 Azure 存储防火墙 \{#configure-firewall\}

在 Azure Portal 中打开你的 Storage Account：

1. 转到 **Networking** → **Firewalls and virtual networks**
2. 选择 **Enabled from selected virtual networks and IP addresses**
3. 将上一步获取的每个 ClickHouse Cloud 出站 IP 地址添加到 **Address range** 字段

:::warning
不要添加 ClickHouse Cloud 私有 IP（10.x.x.x 地址）
:::

4. 单击 **Save**

更多详情参见 [配置 Azure Storage 防火墙文档](https://learn.microsoft.com/en-us/azure/storage/common/storage-network-security?tabs=azure-portal)。

</VerticalStepper>

## ClickPipes 配置 \{#clickpipes-config\}

当在 Azure Blob Storage 中使用 [ClickPipes](/integrations/clickpipes) 时，你需要在 ClickPipes UI 中配置身份验证。
更多细节请参阅 ["创建你的第一个 Azure ClickPipe"](/integrations/clickpipes/object-storage/azure-blob-storage/get-started)。

:::note
ClickPipes 为出站连接使用单独的静态 IP 地址。
如果你使用基于 IP 的防火墙规则，这些 IP 必须被加入允许列表。

请参阅 ["静态 IP 列表"](/integrations/clickpipes#list-of-static-ips)
:::

:::tip
本文开头提到的同区域 IP 允许列表限制同样适用于 ClickPipes。
如果你的 ClickPipes 服务和 Azure Blob Storage 位于同一区域，请使用 SAS 令牌身份验证，而不是 IP 允许列表。
:::