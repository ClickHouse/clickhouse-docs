---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: '如何配置 Azure Private Link'
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


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

本指南介绍如何使用 Azure Private Link，通过虚拟网络在 Azure（包括客户自有服务和 Microsoft 合作伙伴服务）与 ClickHouse Cloud 之间提供私有连接。Azure Private Link 简化了网络架构，并通过避免数据暴露到公共互联网来保护 Azure 端点之间的连接。

<Image img={azure_pe} size="lg" alt="Overview of PrivateLink" background='white' />

Azure 通过 Private Link 支持跨区域连接。这使你能够在部署有 ClickHouse 服务的不同区域中的 VNet 之间建立连接。

:::note
跨区域流量可能会产生额外费用。请查看最新的 Azure 文档。
:::

**请完成以下步骤以启用 Azure Private Link：**

1. 获取用于 Private Link 的 Azure 连接别名
1. 在 Azure 中创建 Private Endpoint
1. 将 Private Endpoint 的 Resource ID 添加到你的 ClickHouse Cloud 组织
1. 将 Private Endpoint 的 Resource ID 添加到你的服务允许列表
1. 使用 Private Link 访问你的 ClickHouse Cloud 服务

:::note
ClickHouse Cloud Azure PrivateLink 已从使用 resourceGUID 过滤器切换为使用 Resource ID 过滤器。你仍然可以使用 resourceGUID（它是向后兼容的），但我们建议切换到 Resource ID 过滤器。要迁移，只需使用 Resource ID 创建一个新的端点，将其关联到服务，然后删除旧的基于 resourceGUID 的端点。
:::



## 注意事项 {#attention}

ClickHouse 会尝试对您的服务进行分组,以便在 Azure 区域内重用相同的已发布 [Private Link 服务](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)。但是,这种分组并不保证,特别是当您的服务分布在多个 ClickHouse 组织中时。
如果您已经为 ClickHouse 组织中的其他服务配置了 Private Link,由于上述分组机制,您通常可以跳过大部分步骤,直接进入最后一步:[将私有终结点资源 ID 添加到服务的允许列表](#add-private-endpoint-id-to-services-allow-list)。

您可以在 ClickHouse [Terraform Provider 代码仓库](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)中找到 Terraform 示例。


## 获取 Azure Private Link 连接别名 {#obtain-azure-connection-alias-for-private-link}

### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中,打开您希望通过 PrivateLink 连接的服务,然后打开 **Settings** 菜单。点击 **Set up private endpoint** 按钮。记下 `Service name` 和 `DNS name`,它们将用于设置 Private Link。

<Image
  img={azure_privatelink_pe_create}
  size='lg'
  alt='私有端点'
  border
/>

记下 `Service name` 和 `DNS name`,后续步骤中将会用到。

### 选项 2:API {#option-2-api}

在开始之前,您需要一个 ClickHouse Cloud API 密钥。您可以[创建新密钥](/cloud/manage/openapi)或使用现有密钥。

获得 API 密钥后,在运行任何命令之前设置以下环境变量:

```bash
REGION=<区域代码,使用 Azure 格式,例如:westus3>
PROVIDER=azure
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥密文>
ORG_ID=<设置 ClickHouse 组织 ID>
SERVICE_NAME=<您的 ClickHouse 服务名称>
```

通过按区域、提供商和服务名称筛选来获取您的 ClickHouse `INSTANCE_ID`:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取您的 Azure 连接别名和 Private Link 私有 DNS 主机名:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

记下 `endpointServiceId`,下一步中将会用到。


## 在 Azure 中创建私有端点 {#create-private-endpoint-in-azure}

:::important
本节介绍通过 Azure Private Link 配置 ClickHouse 的具体细节。Azure 相关步骤仅供参考,但 Azure 云服务提供商可能随时更改这些步骤且不另行通知。请根据您的具体使用场景进行 Azure 配置。

请注意,ClickHouse 不负责配置所需的 Azure 私有端点和 DNS 记录。

如有任何与 Azure 配置任务相关的问题,请直接联系 Azure Support。
:::

在本节中,我们将在 Azure 中创建一个私有端点。您可以使用 Azure Portal 或 Terraform。

### 选项 1:使用 Azure Portal 在 Azure 中创建私有端点 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

在 Azure Portal 中,打开 **Private Link Center → Private Endpoints**。

<Image
  img={azure_private_link_center}
  size='lg'
  alt='打开 Azure Private Center'
  border
/>

点击 **Create** 按钮打开私有端点创建对话框。

<Image
  img={azure_private_link_center}
  size='lg'
  alt='打开 Azure Private Center'
  border
/>

---

在以下界面中,指定以下选项:

- **Subscription** / **Resource Group**:请为私有端点选择 Azure 订阅和资源组。
- **Name**:为 **Private Endpoint** 设置名称。
- **Region**:选择将通过 Private Link 连接到 ClickHouse Cloud 的已部署 VNet 所在的区域。

完成上述步骤后,点击 **Next: Resource** 按钮。

<Image
  img={azure_pe_create_basic}
  size='md'
  alt='创建私有端点基本信息'
  border
/>

---

选择 **Connect to an Azure resource by resource ID or alias** 选项。

对于 **Resource ID or alias**,使用您从[获取 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link)步骤中获得的 `endpointServiceId`。

点击 **Next: Virtual Network** 按钮。

<Image
  img={azure_pe_resource}
  size='md'
  alt='私有端点资源选择'
  border
/>

---

- **Virtual network**:选择您想要使用 Private Link 连接到 ClickHouse Cloud 的 VNet
- **Subnet**:选择将创建私有端点的子网

可选:

- **Application security group**:您可以将 ASG 附加到私有端点,并在网络安全组中使用它来过滤进出私有端点的网络流量。

点击 **Next: DNS** 按钮。

<Image
  img={azure_pe_create_vnet}
  size='md'
  alt='私有端点虚拟网络选择'
  border
/>

点击 **Next: Tags** 按钮。

---

<Image
  img={azure_pe_create_dns}
  size='md'
  alt='私有端点 DNS 配置'
  border
/>

您可以选择为私有端点附加标签。

点击 **Next: Review + create** 按钮。

---

<Image
  img={azure_pe_create_tags}
  size='md'
  alt='私有端点标签'
  border
/>

最后,点击 **Create** 按钮。

<Image
  img={azure_pe_create_review}
  size='md'
  alt='私有端点审核'
  border
/>

创建的私有端点的 **Connection status** 将处于 **Pending** 状态。一旦您将此私有端点添加到服务允许列表,它将变为 **Approved** 状态。

打开与私有端点关联的网络接口,并复制 **Private IPv4 address**(本例中为 10.0.0.4),您将在后续步骤中需要此信息。

<Image img={azure_pe_ip} size='lg' alt='私有端点 IP 地址' border />

### 选项 2:使用 Terraform 在 Azure 中创建私有端点 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

使用以下模板通过 Terraform 创建私有端点:

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

### 获取私有端点资源 ID {#obtaining-private-endpoint-resourceid}

为了使用 Private Link,您需要将私有端点连接资源 ID 添加到您的服务允许列表中。

私有端点资源 ID 在 Azure Portal 中显示。打开在上一步中创建的私有端点,然后点击 **JSON View**:


<Image img={azure_pe_view} size="lg" alt="专用终结点视图" border />

在属性中找到 `id` 字段并复制其值：

**首选方法：使用 Resource ID**
<Image img={azure_pe_resource_id} size="lg" alt="专用终结点 Resource ID" border />

**旧版方法：使用 resourceGUID**
出于向后兼容性考虑，你仍然可以使用 resourceGUID。找到 `resourceGuid` 字段并复制其值：

<Image img={azure_pe_resource_guid} size="lg" alt="专用终结点 Resource GUID" border />



## 为 Private Link 配置 DNS {#setting-up-dns-for-private-link}

您需要创建一个私有 DNS 区域（`${location_code}.privatelink.azure.clickhouse.cloud`）并将其关联到您的 VNet，以便通过 Private Link 访问资源。

### 创建私有 DNS 区域 {#create-private-dns-zone}

**选项 1：使用 Azure 门户**

请参考此指南[使用 Azure 门户创建 Azure 私有 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)。

**选项 2：使用 Terraform**

使用以下 Terraform 模板创建私有 DNS 区域:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### 创建通配符 DNS 记录 {#create-a-wildcard-dns-record}

创建通配符记录并指向您的私有终结点:

**选项 1：使用 Azure 门户**

1. 打开 `MyAzureResourceGroup` 资源组并选择 `${region_code}.privatelink.azure.clickhouse.cloud` 私有区域。
2. 选择 + 记录集。
3. 在名称字段中输入 `*`。
4. 在 IP 地址字段中输入您看到的私有终结点的 IP 地址。
5. 选择**确定**。

<Image
  img={azure_pl_dns_wildcard}
  size='lg'
  alt='Private Link DNS 通配符设置'
  border
/>

**选项 2：使用 Terraform**

使用以下 Terraform 模板创建通配符 DNS 记录:

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

要将私有 DNS 区域链接到虚拟网络,您需要创建一个虚拟网络链接。

**选项 1：使用 Azure 门户**

请参考此指南[将虚拟网络链接到您的私有 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**选项 2：使用 Terraform**

:::note
配置 DNS 有多种方式。请根据您的具体使用场景设置 DNS。
:::

您需要将从[获取 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link)步骤中获取的"DNS 名称"指向私有终结点 IP 地址。这可确保您的 VPC/网络中的服务/组件能够正确解析该地址。

### 验证 DNS 设置 {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` 域名应指向私有终结点 IP（本示例中为 10.0.0.4）。

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```


## 将私有端点资源 ID 添加到您的 ClickHouse Cloud 组织 {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到组织,请继续执行[将私有端点资源 ID 添加到您的服务允许列表](#add-private-endpoint-id-to-services-allow-list)步骤。通过 ClickHouse Cloud 控制台将私有端点资源 ID 添加到服务允许列表时,会自动将其添加到组织。

要删除端点,请打开 **组织详情 -> 私有端点** 并点击删除按钮以移除端点。

<Image
  img={azure_pe_remove_private_endpoint}
  size='lg'
  alt='移除私有端点'
  border
/>

### 选项 2：API {#option-2-api-1}

在运行任何命令之前,请设置以下环境变量:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

使用[获取私有端点资源 ID](#obtaining-private-endpoint-resourceid)步骤中的数据设置 `ENDPOINT_ID` 环境变量。

运行以下命令添加私有端点:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure 私有端点",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

您也可以运行以下命令移除私有端点:

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

添加或移除私有端点后,运行以下命令将更改应用到您的组织:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## 将私有端点资源 ID 添加到服务允许列表 {#add-private-endpoint-id-to-services-allow-list}

默认情况下,即使 Private Link 连接已获批准并建立,ClickHouse Cloud 服务也无法通过 Private Link 连接进行访问。您需要为每个应通过 Private Link 访问的服务显式添加私有端点资源 ID。

### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中,打开您想要通过 PrivateLink 连接的服务,然后导航到 **Settings**。输入从[上一步](#obtaining-private-endpoint-resourceid)中获取的 `Resource ID`。

:::note
如果您想允许从现有 PrivateLink 连接进行访问,请使用现有端点下拉菜单。
:::

<Image
  img={azure_privatelink_pe_filter}
  size='lg'
  alt='私有端点筛选器'
  border
/>

### 选项 2:API {#option-2-api-2}

在运行任何命令之前,请先设置以下环境变量:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

对每个应通过 Private Link 访问的服务执行此操作。

运行以下命令将私有端点添加到服务允许列表:

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

您也可以运行以下命令从服务允许列表中移除私有端点:

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

在向服务允许列表添加或移除私有端点后,运行以下命令将更改应用到您的组织:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```


## 使用 Private Link 访问 ClickHouse Cloud 服务 {#access-your-clickhouse-cloud-service-using-private-link}

每个启用了 Private Link 的服务都有一个公共端点和一个私有端点。要使用 Private Link 进行连接,需要使用私有端点,该端点为从[获取 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link)中获取的 `privateDnsHostname`<sup>API</sup> 或 `DNS name`<sup>控制台</sup>。

### 获取私有 DNS 主机名 {#obtaining-the-private-dns-hostname}

#### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中,导航至 **Settings**。点击 **Set up private endpoint** 按钮。在打开的弹出窗口中,复制 **DNS Name**。

<Image
  img={azure_privatelink_pe_dns}
  size='lg'
  alt='私有端点 DNS 名称'
  border
/>

#### 选项 2:API {#option-2-api-3}

在运行任何命令之前,设置以下环境变量:

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥密文>
ORG_ID=<设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

运行以下命令:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

您应该会收到类似以下内容的响应:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

在此示例中,连接到 `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` 主机名将通过 Private Link 路由。而 `xxxxxxx.region_code.azure.clickhouse.cloud` 将通过互联网路由。

使用 `privateDnsHostname` 通过 Private Link 连接到 ClickHouse Cloud 服务。


## 故障排查 {#troubleshooting}

### 测试 DNS 配置 {#test-dns-setup}

运行以下命令：

```bash
nslookup <dns name>
```

其中 "dns name" 是从[获取 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link)中获得的 `privateDnsHostname`<sup>API</sup> 或 `DNS name`<sup>console</sup>

您应该收到以下响应：

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### 连接被对端重置 {#connection-reset-by-peer}

最可能的原因是 Private Endpoint Resource ID 未添加到服务允许列表中。请重新查看[_将 Private Endpoint Resource ID 添加到服务允许列表_步骤](#add-private-endpoint-id-to-services-allow-list)。

### Private Endpoint 处于待处理状态 {#private-endpoint-is-in-pending-state}

最可能的原因是 Private Endpoint Resource ID 未添加到服务允许列表中。请重新查看[_将 Private Endpoint Resource ID 添加到服务允许列表_步骤](#add-private-endpoint-id-to-services-allow-list)。

### 测试连接性 {#test-connectivity}

如果您在使用 Private Link 连接时遇到问题，请使用 `openssl` 检查连接性。确保 Private Link 端点状态为 `Accepted`。

OpenSSL 应该能够连接（在输出中查看 CONNECTED）。`errno=104` 是预期结果。

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

在运行任何命令之前,设置以下环境变量:

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥密钥>
ORG_ID=<请设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

运行以下命令检查私有端点过滤器:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```


## 更多信息 {#more-information}

有关 Azure Private Link 的更多信息,请访问 [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)。
