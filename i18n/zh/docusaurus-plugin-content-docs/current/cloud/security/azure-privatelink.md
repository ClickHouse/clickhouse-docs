---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: '/cloud/security/azure-privatelink'
description: '如何设置 Azure Private Link'
keywords: ['azure', 'private link', 'privatelink']
---

import azure_pe from '@site/static/images/cloud/security/azure-pe.png';
import azure_privatelink_pe_create from '@site/static/images/cloud/security/azure-privatelink-pe-create.png';
import azure_private_link_center from '@site/static/images/cloud/security/azure-private-link-center.png';
import azure_pe_create_basic from '@site/static/images/cloud/security/azure-pe-create-basic.png';
import azure_pe_resource from '@site/static/images/cloud/security/azure-pe-resource.png';
import azure_pe_create_vnet from '@site/static/images/cloud/security/azure-pe-create-vnet.png';
import azure_pe_create_dns from '@site/static/images/cloud/security/azure-pe-create-dns.png';
import azure_pe_create_tags from '@site/static/images/cloud/security/azure-pe-create-tags.png';
import azure_pe_create_review from '@site/static/images/cloud/security/azure-pe-create-review.png';
import azure_pe_ip from '@site/static/images/cloud/security/azure-pe-ip.png';
import azure_pe_view from '@site/static/images/cloud/security/azure-pe-view.png';
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link

:::note
Azure Private Link 只能在 ClickHouse Cloud **生产** 服务上启用。**开发** 服务不支持。
:::

本指南展示了如何使用 Azure Private Link 通过虚拟网络提供 Azure（包括客户拥有和 Microsoft 合作伙伴服务）与 ClickHouse Cloud 之间的私有连接。Azure Private Link 简化了网络架构，并通过消除数据暴露于公共互联网，保护 Azure 中端点之间的连接。

<img src={azure_pe} alt="PrivateLink 概述" />

与 AWS 和 GCP 不同，Azure 支持通过 Private Link 实现跨区域连接。这使您能够在不同区域之间建立连接，您可以在这些区域中部署 ClickHouse 服务。

:::note
跨区域流量可能会产生额外费用。请查看最新的 Azure 文档。
:::

请完成以下步骤以启用 Azure Private Link：

1. 获取 Azure 连接别名以进行 Private Link
1. 在 Azure 中创建一个私有终结点
1. 将私有终结点 GUID 添加到您的 ClickHouse Cloud 组织中
1. 将私有终结点 GUID 添加到您的服务允许列表中
1. 使用 Private Link 访问您的 ClickHouse Cloud 服务

在 [这里](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/PrivateLinkAzure) 查找 Azure Private Link 的完整 Terraform 示例。

## 获取 Azure 连接别名以进行 Private Link {#obtain-azure-connection-alias-for-private-link}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后打开 **设置** 菜单。点击 **设置私有终结点** 按钮。复制将用于设置 Private Link 的 **服务名称**。

<img src={azure_privatelink_pe_create} alt="私有终结点" />

### 选项 2：API {#option-2-api}

在开始之前，您需要一个 ClickHouse Cloud API 密钥。您可以 [创建一个新密钥](/cloud/manage/openapi) 或使用现有密钥。请注意，您需要一个 **管理员** 密钥才能管理 Private Link 配置。

一旦您拥有 API 密钥，在运行任何命令之前设置以下环境变量：

```bash
REGION=<地区代码，使用 Azure 格式>
PROVIDER=azure
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<设置 ClickHouse 组织 ID>
```

从您的区域获取实例 ID：

您需要在指定区域中至少部署一个 ClickHouse Cloud 服务以执行此步骤。

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1 | tee instance_id
```

使用您在之前步骤中接收到的 ID 创建 `INSTANCE_ID` 环境变量：

```bash
INSTANCE_ID=$(cat instance_id)
```

获取您的 Azure 连接别名和私有 DNS 主机名以进行 Private Link：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.63c890a9-4d32-48cc-a08c-8cd92dfb1ad3.westus3.azure.privatelinkservice",
  ...
}
```

记录 `endpointServiceId`。您将在下一步中使用它。

## 在 Azure 中创建一个私有终结点 {#create-private-endpoint-in-azure}

在本节中，我们将创建 Azure 中的私有终结点。您可以使用 Azure 门户或 Terraform。

### 选项 1：使用 Azure 门户创建 Azure 中的私有终结点 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

在 Azure 门户中，打开 **Private Link Center → 私有终结点**。

<img src={azure_private_link_center} alt="打开 Azure Private Center" />

单击 **创建** 按钮以打开私有终结点创建对话框。

<img src={azure_private_link_center} alt="打开 Azure Private Center" />

---

在以下屏幕中，指定以下选项：

- **订阅** / **资源组**：请选择用于私有终结点的 Azure 订阅和资源组。
- **名称**：为 **私有终结点** 设置一个名称。
- **地区**：选择将通过 Private Link 连接到 ClickHouse Cloud 的已部署 VNet 的地区。

完成上述步骤后，单击 **下一步：资源** 按钮。

<img src={azure_pe_create_basic} alt="创建私有终结点基本设置" />

---

选择 **通过资源 ID 或别名连接到 Azure 资源** 选项。

对于 **资源 ID 或别名**，使用您从 [获取 Azure 连接别名以进行 Private Link](#obtain-azure-connection-alias-for-private-link) 步骤中获得的 `endpointServiceId`。

单击 **下一步：虚拟网络** 按钮。

<img src={azure_pe_resource} alt="选择私有终结点资源" />

---

- **虚拟网络**：选择您希望通过 Private Link 连接到 ClickHouse Cloud 的 VNet
- **子网**：选择将创建私有终结点的子网

可选：

- **应用程序安全组**：您可以将 ASG 附加到私有终结点，并在网络安全组中使用它来过滤往返于私有终结点的网络流量。

单击 **下一步：DNS** 按钮。

<img src={azure_pe_create_vnet} alt="选择私有终结点虚拟网络" />

单击 **下一步：标签** 按钮。

---

<img src={azure_pe_create_dns} alt="私有终结点 DNS 配置" />

可选地，您可以为您的私有终结点添加标签。

单击 **下一步：查看 + 创建** 按钮。

---

<img src={azure_pe_create_tags} alt="私有终结点标签" />

最后，单击 **创建** 按钮。

<img src={azure_pe_create_review} alt="私有终结点审核" />

所创建的私有终结点的 **连接状态** 将处于 **待处理** 状态。添加此私有终结点到服务允许列表后，它将更改为 **已批准** 状态。

打开与私有终结点相关联的网络接口，并复制 **私有 IPv4 地址**（在此示例中为 10.0.0.4），您将在接下来的步骤中需要此信息。

<img src={azure_pe_ip} alt="私有终结点 IP 地址" />

### 选项 2：使用 Terraform 创建 Azure 中的私有终结点 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

使用以下模板通过 Terraform 创建私有终结点：

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<来自 '获取 Azure 连接别名以进行 Private Link' 步骤的数据>"
    is_manual_connection              = true
  }
}
```

### 获取私有终结点 `resourceGuid` {#obtaining-private-endpoint-resourceguid}

为了使用 Private Link，您需要将私有终结点连接 GUID 添加到您的服务允许列表中。

私有终结点资源 GUID 仅在 Azure 门户中公开。打开在上一步创建的私有终结点并单击 **JSON 视图**：

<img src={azure_pe_view} alt="私有终结点视图" />

在属性下，找到 `resourceGuid` 字段并复制此值：

<img src={azure_pe_resource_guid} alt="私有终结点资源 GUID" />

## 为 Private Link 设置 DNS {#setting-up-dns-for-private-link}

您需要创建一个私有 DNS 区域 (`${location_code}.privatelink.azure.clickhouse.cloud`) 并将其附加到您的 VNet，以便通过 Private Link 访问资源。

### 创建私有 DNS 区域 {#create-private-dns-zone}

**选项 1：使用 Azure 门户**

请遵循以下指南 [使用 Azure 门户创建 Azure 私有 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)。

**选项 2：使用 Terraform**

使用以下 Terraform 模板创建私有 DNS 区域：

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### 创建一个通配符 DNS 记录 {#create-a-wildcard-dns-record}

创建一个通配符记录并指向您的私有终结点：

**选项 1：使用 Azure 门户**

1. 打开 `MyAzureResourceGroup` 资源组并选择 `${region_code}.privatelink.azure.clickhouse.cloud` 私有区域。
2. 选择 + 记录集。
3. 对于名称，输入 `*`。
4. 对于 IP 地址，输入您看到的私有终结点的 IP 地址。
5. 选择 **确定**。

<img src={azure_pl_dns_wildcard} alt="私有链接 DNS 通配符设置" />

**选项 2：使用 Terraform**

使用以下 Terraform 模板创建通配符 DNS 记录：

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### 创建虚拟网络链接 {#create-a-virtual-network-link}

要将私有 DNS 区域链接到虚拟网络，您需要创建一个虚拟网络链接。

**选项 1：使用 Azure 门户**

请遵循以下指南 [将虚拟网络链接到您的私有 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**选项 2：使用 Terraform**

使用以下 Terraform 模板将虚拟网络链接到您的私有 DNS 区域：

```json
resource "azurerm_private_dns_zone_virtual_network_link" "example" {
  name                  = "test"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = var.zone_name
  virtual_network_id    = var.virtual_network_id
}
```

### 验证 DNS 设置 {#verify-dns-setup}

任何位于 `westus3.privatelink.azure.clickhouse.cloud` 域中的记录都应指向私有终结点的 IP 地址。（在此示例中为 10.0.0.4）。

```bash
nslookup instance-id.westus3.privatelink.azure.clickhouse.cloud.
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	instance-id.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## 将私有终结点 GUID 添加到您的 ClickHouse Cloud 组织 {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到组织，请继续进行 [将私有终结点 GUID 添加到您的服务允许列表](#add-private-endpoint-guid-to-services-allow-list) 步骤。通过 ClickHouse Cloud 控制台使用私有终结点 GUID 添加到服务允许列表将自动将其添加到组织。

要删除端点，请打开 **组织详细信息 -> 私有终结点** 并单击删除按钮以移除端点。

<img src={azure_pe_remove_private_endpoint} alt="删除私有终结点" />

### 选项 2：API {#option-2-api-1}

在运行任何命令之前设置以下环境变量：

```bash
PROVIDER=azure
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<设置 ClickHouse 组织 ID>
ENDPOINT_ID=<私有终结点 resourceGuid>
REGION=<地区代码，使用 Azure 格式>
```

使用来自 [获取私有终结点 `resourceGuid`](#obtaining-private-endpoint-resourceguid) 步骤的数据设置 `VPC_ENDPOINT` 环境变量。

运行以下命令以添加私有终结点：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure 私有终结点",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

您还可以运行以下命令以删除私有终结点：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

添加或删除私有终结点后，运行以下命令将其应用到您的组织：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## 将私有终结点 GUID 添加到您的服务允许列表 {#add-private-endpoint-guid-to-services-allow-list}

默认情况下，即使私有链接连接已被批准并建立，ClickHouse Cloud 服务也不可通过私有链接连接使用。您需要明确添加每个应通过私有链接可用的服务的私有终结点 GUID。

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后导航到 **设置**。输入从 [上一步](#obtaining-private-endpoint-resourceguid) 中获得的 `Endpoint ID`。

:::note
如果您希望允许来自现有 PrivateLink 连接的访问，请使用现有端点下拉菜单。
:::

<img src={azure_privatelink_pe_filter} alt="私有终结点过滤器" />

### 选项 2：API {#option-2-api-2}

在运行任何命令之前设置这些环境变量：

```bash
PROVIDER=azure
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<设置 ClickHouse 组织 ID>
ENDPOINT_ID=<私有终结点 resourceGuid>
INSTANCE_ID=<实例 ID>
```

为每个应通过私有链接可用的服务执行此操作。

运行以下命令将私有终结点添加到服务允许列表：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF
```

您还可以运行以下命令从服务允许列表中删除私有终结点：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF
```

在将私有终结点添加或删除到服务允许列表后，运行以下命令将其应用到您的组织：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID?} -d @pl_config.json | jq
```

## 使用 Private Link 访问您的 ClickHouse Cloud 服务 {#access-your-clickhouse-cloud-service-using-private-link}

每个启用私有链接的服务都有公共和私有端点。要使用私有链接进行连接，您需要使用私有端点，即 `privateDnsHostname`。

:::note
私有 DNS 主机名仅可通过您的 Azure VNet 使用。请不要尝试从位于 Azure VNet 外部的计算机解析此 DNS 主机。
:::

### 获取私有 DNS 主机名 {#obtaining-the-private-dns-hostname}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航到 **设置**。单击 **设置私有终结点** 按钮。在打开的飞出窗口中，复制 **DNS 名称**。

<img src={azure_privatelink_pe_dns} alt="私有终结点 DNS 名称" />

#### 选项 2：API {#option-2-api-3}

在运行任何命令之前设置以下环境变量：

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

运行以下命令：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result
```

您应该收到如下响应：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

在此示例中，连接到 `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` 主机名将路由到 Private Link。同时，`xxxxxxx.region_code.azure.clickhouse.cloud` 将通过互联网路由。

使用 `privateDnsHostname` 通过 Private Link 连接到您的 ClickHouse Cloud 服务。

## 故障排除 {#troubleshooting}

### 测试 DNS 设置 {#test-dns-setup}

`${region_code}.privatelink.azure.clickhouse.cloud.` 区域中的所有 DNS 记录应指向来自 [*在 Azure 中创建私有终结点*](#create-private-endpoint-in-azure) 步骤的内部 IP 地址。在此示例中，地区是 `westus3`。

运行以下命令：

```bash
nslookup abcd.westus3.privatelink.azure.clickhouse.cloud.
```

您应该收到以下响应：

```response
非权威回答:
名称:	abcd.westus3.privatelink.azure.clickhouse.cloud
地址: 10.0.0.4
```

### 连接重置由对等方 {#connection-reset-by-peer}

很可能，私有终结点 GUID 未添加到服务允许列表中。请重新检查 [_将私有终结点 GUID 添加到您的服务允许列表_ 步骤](#add-private-endpoint-guid-to-services-allow-list)。

### 私有终结点处于待处理状态 {#private-endpoint-is-in-pending-state}

很可能，私有终结点 GUID 未添加到服务允许列表中。请重新检查 [_将私有终结点 GUID 添加到您的服务允许列表_ 步骤](#add-private-endpoint-guid-to-services-allow-list)。

### 测试连接 {#test-connectivity}

如果您在使用私有链接连接时遇到问题，请使用 `openssl` 检查连接性。确保私有链接端点状态为 `Accepted`。

OpenSSL 应能够连接（输出中应显示 CONNECTED）。`errno=104` 是预期的。

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud.cloud:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
没有可用的对等证书
---
未发送客户端证书 CA 名称
---
SSL 握手已读取 0 字节并写入 335 字节
验证：好
---
新，(NONE)，密码 (NONE)
安全重协商不支持
压缩：没有
扩展：没有
没有协商 ALPN
未发送早期数据
验证返回代码：0 (好)
```

### 检查私有终结点过滤器 {#checking-private-endpoint-filters}

在运行任何命令之前设置以下环境变量：

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<请设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

运行以下命令检查私有终结点过滤器：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | jq .result.privateEndpointIds
[]
```

## 更多信息 {#more-information}

有关 Azure Private Link 的更多信息，请访问 [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)。
