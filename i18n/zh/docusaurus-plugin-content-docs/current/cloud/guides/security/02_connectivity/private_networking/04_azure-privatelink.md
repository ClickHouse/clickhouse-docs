---
title: "Azure Private Link"
sidebar_label: "Azure Private Link"
slug: /cloud/security/azure-privatelink
description: "如何配置 Azure Private Link"
keywords: ['azure', 'private link', 'privatelink']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
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
import azure_pe_resource_id from '@site/static/images/cloud/security/azure-pe-resource-id.png';
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';

# Azure Private Link {#azure-private-link}

<ScalePlanFeatureBadge feature="Azure Private Link"/>

本指南介绍如何使用 Azure Private Link，通过虚拟网络在 Azure（包括客户自有服务和 Microsoft 合作伙伴服务）与 ClickHouse Cloud 之间提供专用连接。Azure Private Link 通过避免数据暴露在公共互联网中，简化网络架构并保护 Azure 中各端点之间的连接安全。

<Image img={azure_pe} size="lg" alt="Private Link 概览" background='white' />

Azure 通过 Private Link 支持跨区域连接。这使您能够在部署了 ClickHouse 服务的不同区域中的虚拟网络（VNet）之间建立连接。

:::note
跨区域流量可能会产生额外费用。请查阅最新的 Azure 文档。
:::

**请完成以下步骤以启用 Azure Private Link：**

1. 获取用于 Private Link 的 Azure 连接别名
1. 在 Azure 中创建 Private Endpoint（专用终结点）
1. 将 Private Endpoint 的 Resource ID 添加到您的 ClickHouse Cloud 组织
1. 将 Private Endpoint 的 Resource ID 添加到您的服务允许列表中
1. 通过 Private Link 访问您的 ClickHouse Cloud 服务

:::note
ClickHouse Cloud Azure Private Link 已从使用 resourceGUID 切换为使用 Resource ID 筛选器。您仍然可以使用 resourceGUID（其具有向后兼容性），但我们建议切换到 Resource ID 筛选器。要迁移，只需使用 Resource ID 创建新的终结点，将其关联到服务，然后移除旧的基于 resourceGUID 的终结点。
:::

## 注意 {#attention}
ClickHouse 会尝试对您的服务进行分组，以便在同一 Azure 区域内复用同一个已发布的 [Private Link 服务](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)。但无法保证始终能够实现这种分组，尤其是在您将服务分散到多个 ClickHouse 组织时。
如果您已经在 ClickHouse 组织中的其他服务上配置了 Private Link，那么通常可以利用这一分组跳过大部分步骤，直接进行最后一步：[将 Private Endpoint Resource ID 添加到服务的允许列表](#add-private-endpoint-id-to-services-allow-list)。

您可以在 ClickHouse 的 [Terraform Provider 仓库](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)中找到 Terraform 示例。

## 获取用于 Private Link 的 Azure 连接别名 {#obtain-azure-connection-alias-for-private-link}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您希望通过 Private Link 连接的服务，然后打开 **Settings** 菜单。点击 **Set up private endpoint** 按钮。记录用于配置 Private Link 的 `Service name` 和 `DNS name`。

<Image img={azure_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

请记录下 `Service name` 和 `DNS name`，它们将在后续步骤中使用。

### 选项 2：API {#option-2-api}

在开始之前，您需要一个 ClickHouse Cloud API 密钥。您可以[创建一个新的密钥](/cloud/manage/openapi)或使用已有的密钥。

获得 API 密钥后，在运行任何命令之前，先设置以下环境变量：

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

通过根据区域、云服务提供商和服务名称进行筛选来获取 ClickHouse `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取 Azure Private Link 的连接别名和专用 DNS 主机名：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

记录下 `endpointServiceId`。您将在下一步中用到它。

## 在 Azure 中创建专用终结点 {#create-private-endpoint-in-azure}

:::important
本节介绍通过 Azure Private Link 配置 ClickHouse 时与 ClickHouse 相关的特定细节。文中给出的 Azure 相关操作步骤仅作为参考，帮助你了解需要在何处进行配置；这些步骤可能会随着 Azure 云服务提供商的调整而变更且恕不另行通知。请根据你的具体使用场景自行评估并规划 Azure 的配置。

请注意，ClickHouse 不负责为你配置所需的 Azure 专用终结点和 DNS 记录。

如在执行 Azure 配置任务时遇到任何问题，请直接联系 Azure 支持团队。
:::

在本节中，我们将在 Azure 中创建一个 Private Endpoint（专用终结点）。你可以使用 Azure Portal 或 Terraform 完成此操作。

### 选项 1：使用 Azure Portal 在 Azure 中创建专用终结点 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

在 Azure Portal 中，打开 **Private Link Center → Private Endpoints**。

<Image img={azure_private_link_center} size="lg" alt="打开 Azure Private Center" border />

点击 **Create** 按钮，打开创建 Private Endpoint 的对话框。

<Image img={azure_private_link_center} size="lg" alt="打开 Azure Private Center" border />

***

在接下来的界面中，指定以下选项：

* **Subscription** / **Resource Group**：选择用于该 Private Endpoint 的 Azure 订阅和资源组。
* **Name**：为该 **Private Endpoint** 设置名称。
* **Region**：选择已部署 VNet 所在的区域，该 VNet 将通过 Private Link 连接到 ClickHouse Cloud。

完成上述步骤后，点击 **Next: Resource** 按钮。

<Image img={azure_pe_create_basic} size="md" alt="创建 Private Endpoint 基本信息" border />

***

选择 **Connect to an Azure resource by resource ID or alias** 选项。

在 **Resource ID or alias** 中，使用你在 [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) 步骤中获取的 `endpointServiceId`。

点击 **Next: Virtual Network** 按钮。

<Image img={azure_pe_resource} size="md" alt="Private Endpoint 资源选择" border />

***

* **Virtual network**：选择你希望通过 Private Link 连接到 ClickHouse Cloud 的 VNet。
* **Subnet**：选择将要在其中创建 Private Endpoint 的子网。

可选项：

* **Application security group**：你可以将 ASG 附加到 Private Endpoint，并在 Network Security Groups 中使用它来过滤往返于 Private Endpoint 的网络流量。

点击 **Next: DNS** 按钮。

<Image img={azure_pe_create_vnet} size="md" alt="Private Endpoint 虚拟网络选择" border />

点击 **Next: Tags** 按钮。

***

<Image img={azure_pe_create_dns} size="md" alt="Private Endpoint DNS 配置" border />

你可以选择为 Private Endpoint 附加标签（tags）。

点击 **Next: Review + create** 按钮。

***

<Image img={azure_pe_create_tags} size="md" alt="Private Endpoint 标签" border />

最后，点击 **Create** 按钮。

<Image img={azure_pe_create_review} size="md" alt="Private Endpoint 审核" border />

新建的 Private Endpoint 的 **Connection status** 将处于 **Pending** 状态。当你将该 Private Endpoint 添加到服务允许列表后，其状态将变为 **Approved**。

打开与该 Private Endpoint 关联的网络接口，并复制其 **Private IPv4 address**（本示例中为 10.0.0.4），你将在后续步骤中用到该信息。

<Image img={azure_pe_ip} size="lg" alt="Private Endpoint IP 地址" border />

### 选项 2：使用 Terraform 在 Azure 中创建专用终结点 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

使用如下模板，通过 Terraform 创建一个 Private Endpoint：

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<data from 'Obtain Azure connection alias for Private Link' step>"
    is_manual_connection              = true
  }
}
```

### 获取专用终结点资源 ID {#obtaining-private-endpoint-resourceid}

要使用 Private Link，你需要将专用终结点连接的资源 ID 添加到服务的允许列表中。

专用终结点资源 ID 可在 Azure 门户中查看。打开在上一步中创建的专用终结点，然后单击 **JSON 视图**：

<Image img={azure_pe_view} size="lg" alt="Private Endpoint View" border />

在 properties 属性中找到 `id` 字段，并复制其值：

**首选方法：使用 Resource ID**
<Image img={azure_pe_resource_id} size="lg" alt="Private Endpoint Resource ID" border />

**旧方法：使用 resourceGUID**
出于向后兼容的考虑，您仍然可以使用 resourceGUID。找到 `resourceGuid` 字段并复制该值：

<Image img={azure_pe_resource_guid} size="lg" alt="Private Endpoint Resource GUID" border />

## 为 Private Link 配置 DNS {#setting-up-dns-for-private-link}

您需要创建一个专用 DNS 区域 (`${location_code}.privatelink.azure.clickhouse.cloud`)，并将其关联到您的虚拟网络 (VNet)，以便通过 Private Link 访问资源。

### 创建专用 DNS 区域 {#create-private-dns-zone}

**选项 1：使用 Azure 门户**

请按照此指南[使用 Azure 门户创建 Azure 专用 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)。

**选项 2：使用 Terraform**

使用以下 Terraform 模板来创建一个专用 DNS 区域：

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### 创建通配符 DNS 记录 {#create-a-wildcard-dns-record}

创建一个通配符记录并将其指向你的 Private Endpoint：

**选项 1：使用 Azure Portal**

1. 打开 `MyAzureResourceGroup` 资源组并选择 `${region_code}.privatelink.azure.clickhouse.cloud` Private DNS 区域。
2. 选择 **+ Record set**。
3. 在 **Name** 中输入 `*`。
4. 在 **IP Address** 中输入你在 Private Endpoint 上看到的 IP 地址。
5. 选择 **OK**。

<Image img={azure_pl_dns_wildcard} size="lg" alt="Private Link DNS 通配符配置" border />

**选项 2：使用 Terraform**

使用以下 Terraform 模板来创建通配符 DNS 记录：

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

要将专用 DNS 区域链接到虚拟网络，你需要创建一个虚拟网络链接。

**选项 1：使用 Azure 门户**

请按照此指南将[虚拟网络链接到你的专用 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**选项 2：使用 Terraform**

:::note
配置 DNS 有多种方式。请根据你的具体使用场景来设置 DNS。
:::

你需要将从[获取用于 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link)步骤中得到的 “DNS name” 指向 Private Endpoint 的 IP 地址。这样可以确保你的 VPC/网络中的服务或组件能够正确解析它。

### 验证 DNS 设置 {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` 域名应解析到 Private Endpoint 的 IP（本示例中为 10.0.0.4）。

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## 将专用终结点资源 ID 添加到你的 ClickHouse Cloud 组织 {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

若要向组织添加终结点，请继续执行[将专用终结点资源 ID 添加到你的服务允许列表](#add-private-endpoint-id-to-services-allow-list)步骤。通过 ClickHouse Cloud 控制台将专用终结点资源 ID 添加到服务允许列表时，会自动将其添加到组织中。

若要移除终结点，打开 **Organization details -&gt; Private Endpoints**，然后点击删除按钮以移除该终结点。

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="移除专用终结点" border />

### 选项 2：API {#option-2-api-1}

在运行任何命令之前，先设置以下环境变量：

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

使用 [获取专用终结点资源 ID](#obtaining-private-endpoint-resourceid) 步骤中获取的数据来设置 `ENDPOINT_ID` 环境变量。

运行以下命令以添加专用终结点：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

您还可以通过运行以下命令删除 Private Endpoint：

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

添加或删除 Private Endpoint 后，运行以下命令使其在您的组织中生效：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## 将 Private Endpoint Resource ID 添加到服务的允许列表 {#add-private-endpoint-id-to-services-allow-list}

默认情况下，即使 Private Link 连接已获批准并建立，ClickHouse Cloud 服务也无法通过 Private Link 连接访问。你需要为每个需要通过 Private Link 访问的服务显式添加对应的 Private Endpoint Resource ID。

### 选项 1：通过 ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中，打开你希望通过 PrivateLink 进行连接的服务，然后导航到 **Settings**。输入在[上一步](#obtaining-private-endpoint-resourceid)中获取的 `Resource ID`。

:::note
如果你希望允许来自现有 PrivateLink 连接的访问，请使用现有 endpoint 的下拉菜单。
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Private Endpoint 筛选器" border />

### 选项 2：通过 API {#option-2-api-2}

在运行任何命令之前先设置以下环境变量：

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

对每个需要通过 Private Link 访问的服务执行一次该命令。

运行以下命令，将 Private Endpoint 添加到服务的允许列表中：

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

您还可以运行以下命令，将某个 Private Endpoint 从服务的允许列表中删除：

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

在将专用终结点添加到服务允许列表或从中移除后，运行以下命令将更改应用到您的组织：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## 使用 Private Link 访问 ClickHouse Cloud 服务 {#access-your-clickhouse-cloud-service-using-private-link}

每个启用了 Private Link 的服务都具有一个公共端点和一个私有端点。要通过 Private Link 进行连接，您需要使用私有端点，即从[获取用于 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link)中取得的 `privateDnsHostname`<sup>API</sup> 或 `DNS name`<sup>console</sup>。

### 获取私有 DNS 主机名 {#obtaining-the-private-dns-hostname}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，进入 **Settings**。点击 **Set up private endpoint** 按钮。在打开的侧边面板中，复制 **DNS Name**。

<Image img={azure_privatelink_pe_dns} size="lg" alt="私有端点 DNS 名称" border />

#### 选项 2：API {#option-2-api-3}

在运行任何命令之前，先设置以下环境变量：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

运行以下命令：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

你将会看到类似如下的响应：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

在此示例中，对主机名 `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` 的连接将被路由到 Private Link。与此同时，`xxxxxxx.region_code.azure.clickhouse.cloud` 将通过公共互联网进行路由。

使用 `privateDnsHostname` 通过 Private Link 连接到您的 ClickHouse Cloud 服务。

## 故障排除 {#troubleshooting}

### 测试 DNS 配置 {#test-dns-setup}

运行以下命令：

```bash
nslookup <dns name>
```

其中 &quot;dns name&quot; 是来自 [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) 的 `privateDnsHostname`<sup>API</sup> 或 `DNS name`<sup>console</sup>

你应该会收到如下所示的响应：

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### 连接被对端重置 {#connection-reset-by-peer}

最有可能的原因是没有将 Private Endpoint Resource ID 添加到服务的允许列表中。请返回到 [*Add Private Endpoint Resource ID to your services allow-list* 步骤](#add-private-endpoint-id-to-services-allow-list)。

### Private Endpoint 处于 pending 状态 {#private-endpoint-is-in-pending-state}

最有可能的原因是没有将 Private Endpoint Resource ID 添加到服务的允许列表中。请返回到 [*Add Private Endpoint Resource ID to your services allow-list* 步骤](#add-private-endpoint-id-to-services-allow-list)。

### 测试连通性 {#test-connectivity}

如果使用 Private Link 连接时遇到问题，请使用 `openssl` 检查连通性。请确保 Private Link endpoint 的状态为 `Accepted`。

OpenSSL 应该能够建立连接（在输出中可以看到 CONNECTED）。`errno=104` 是预期的结果。

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud:9440
```

```response
# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
no peer certificate available
---
No client certificate CA names sent
---
SSL handshake has read 0 bytes and written 335 bytes
Verification: OK
---
New, (NONE), Cipher is (NONE)
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
```

### 检查私有端点过滤器 {#checking-private-endpoint-filters}

在运行任何命令之前，先设置以下环境变量：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

运行以下命令检查 Private Endpoint 筛选器：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## 更多信息 {#more-information}

如需了解有关 Azure Private Link 的更多信息，请访问 [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)。
