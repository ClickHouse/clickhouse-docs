---
'title': 'Azure Private Link'
'sidebar_label': 'Azure Private Link'
'slug': '/cloud/security/azure-privatelink'
'description': '如何设置 Azure Private Link'
'keywords':
- 'azure'
- 'private link'
- 'privatelink'
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
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

本指南展示如何使用 Azure Private Link 通过虚拟网络提供 Azure（包括客户拥有和 Microsoft 合作伙伴服务）与 ClickHouse Cloud 之间的私有连接。Azure Private Link 简化了网络架构，并通过消除对公共互联网的数据暴露来确保 Azure 端点之间的连接安全。

<Image img={azure_pe} size="lg" alt="PrivateLink 概述" background='white' />

与 AWS 和 GCP 不同，Azure 支持通过 Private Link 进行跨区域连接。这使您能够在不同区域的虚拟网络（VNet）之间建立连接，在这些区域中您已部署 ClickHouse 服务。

:::note
可能会对跨区域流量收取额外费用。请查看最新的 Azure 文档。
:::

**请完成以下步骤以启用 Azure Private Link：**

1. 获取用于 Private Link 的 Azure 连接别名
1. 在 Azure 中创建一个私有端点
1. 将私有端点 GUID 添加到您的 ClickHouse Cloud 组织中
1. 将私有端点 GUID 添加到您的服务允许列表中
1. 使用 Private Link 访问您的 ClickHouse Cloud 服务


## 注意 {#attention}
ClickHouse 尝试将您的服务分组以重用同一区域内发布的 [Private Link 服务](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)。但是，这种分组并不保证，特别是在您将服务分散在多个 ClickHouse 组织中时。
如果您已经为 ClickHouse 组织中的其他服务配置了 Private Link，通常可以跳过大部分步骤，直接进到最后一步：[将私有端点 GUID 添加到您的服务允许列表](#add-private-endpoint-guid-to-services-allow-list)。

在 ClickHouse [Terraform 提供者仓库](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) 中找到 Terraform 示例。

## 获取用于 Private Link 的 Azure 连接别名 {#obtain-azure-connection-alias-for-private-link}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后打开 **设置** 菜单。点击 **设置私有端点** 按钮。记录下 `服务名称` 和 `DNS 名称`，这将用于设置 Private Link。

<Image img={azure_privatelink_pe_create} size="lg" alt="私有端点" border />

记下 `服务名称` 和 `DNS 名称`，后续步骤中将需要用到。

### 选项 2：API {#option-2-api}

在开始之前，您需要一个 ClickHouse Cloud API 密钥。您可以 [创建新密钥](/cloud/manage/openapi) 或使用现有密钥。

获得 API 密钥后，在运行任何命令之前设置以下环境变量：

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

通过区域、提供者和服务名称筛选以获取 ClickHouse 的 `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取用于 Private Link 的 Azure 连接别名和私有 DNS 主机名：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

记下 `endpointServiceId`，将在下一步骤中使用。

## 在 Azure 中创建私有端点 {#create-private-endpoint-in-azure}

:::important
本节涵盖通过 Azure Private Link 配置 ClickHouse 的 ClickHouse 特定细节。提供的 Azure 特定步骤作为参考，指导您查找相关文章，但随着时间的推移可能会在没有通知的情况下发生变化。请根据您的具体用例考虑 Azure 配置。  

请注意，ClickHouse 对所需的 Azure 私有端点、DNS 记录的配置不负任何责任。  

对于任何与 Azure 配置任务相关的问题，请直接联系 Azure 支持。
:::

在本节中，我们将创建 Azure 中的私有端点。您可以使用 Azure 门户或 Terraform。

### 选项 1：使用 Azure 门户在 Azure 中创建私有端点 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

在 Azure 门户中，打开 **Private Link Center → 私有端点**。

<Image img={azure_private_link_center} size="lg" alt="打开 Azure 私有中心" border />

通过点击 **创建** 按钮打开私有端点创建对话框。

<Image img={azure_private_link_center} size="lg" alt="打开 Azure 私有中心" border />

---

在接下来的屏幕中，指定以下选项：

- **订阅** / **资源组**：请选择用于私有端点的 Azure 订阅和资源组。
- **名称**：为 **私有端点** 设置名称。
- **区域**：选择将连接到 ClickHouse Cloud 的已部署 VNet 的区域。

完成上述步骤后，点击 **下一步：资源** 按钮。

<Image img={azure_pe_create_basic} size="md" alt="创建私有端点基础" border />

---

选择选项 **通过资源 ID 或别名连接到 Azure 资源**。

在 **资源 ID 或别名** 中，使用您在 [获取用于 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link) 步骤中获取的 `endpointServiceId`。

点击 **下一步：虚拟网络** 按钮。

<Image img={azure_pe_resource} size="md" alt="私有端点资源选择" border />

---

- **虚拟网络**：选择要通过 Private Link 连接到 ClickHouse Cloud 的 VNet
- **子网**：选择将创建私有端点的子网

可选：

- **应用程序安全组**：您可以将 ASG 附加到私有端点，并在网络安全组中使用它来过滤到/来自私有端点的网络流量。

点击 **下一步：DNS** 按钮。

<Image img={azure_pe_create_vnet} size="md" alt="私有端点虚拟网络选择" border />

点击 **下一步：标签** 按钮。

---

<Image img={azure_pe_create_dns} size="md" alt="私有端点 DNS 配置" border />

可选，您可以为私有端点附加标签。

点击 **下一步：审核 + 创建** 按钮。

---

<Image img={azure_pe_create_tags} size="md" alt="私有端点标签" border />

最后，点击 **创建** 按钮。

<Image img={azure_pe_create_review} size="md" alt="私有端点审核" border />

创建的私有端点的 **连接状态** 将处于 **待定** 状态。一旦您将此私有端点添加到服务允许列表中，状态将更改为 **已批准**。

打开与私有端点关联的网络接口并复制 **私有 IPv4 地址**（在本示例中为 10.0.0.4），您将在后续步骤中需要此信息。

<Image img={azure_pe_ip} size="lg" alt="私有端点 IP 地址" border />

### 选项 2：使用 Terraform 在 Azure 中创建私有端点 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

使用以下模板通过 Terraform 创建私有端点：

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

### 获取私有端点 `resourceGuid` {#obtaining-private-endpoint-resourceguid}

为了使用 Private Link，您需要将私有端点连接 GUID 添加到您的服务允许列表中。

私有端点资源 GUID 仅在 Azure 门户中公开。打开在上一步中创建的私有端点，然后点击 **JSON 视图**：

<Image img={azure_pe_view} size="lg" alt="私有端点视图" border />

在属性下，找到 `resourceGuid` 字段并复制此值：

<Image img={azure_pe_resource_guid} size="lg" alt="私有端点资源 GUID" border />

## 为 Private Link 设置 DNS {#setting-up-dns-for-private-link}

您需要创建一个私有 DNS 区域（`${location_code}.privatelink.azure.clickhouse.cloud`）并将其附加到您的 VNet 以通过 Private Link 访问资源。

### 创建私有 DNS 区域 {#create-private-dns-zone}

**选项 1：使用 Azure 门户**

请按照以下指南使用 Azure 门户 [创建 Azure 私有 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)。

**选项 2：使用 Terraform**

使用以下 Terraform 模板创建私有 DNS 区域：

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### 创建通配符 DNS 记录 {#create-a-wildcard-dns-record}

创建一个通配符记录并指向您的私有端点：

**选项 1：使用 Azure 门户**

1. 打开 `MyAzureResourceGroup` 资源组并选择 `${region_code}.privatelink.azure.clickhouse.cloud` 私有区域。
2. 选择 + 记录集。
3. 在名称中输入 `*`。
4. 在 IP 地址中输入您看到的私有端点 IP 地址。
5. 选择 **确定**。

<Image img={azure_pl_dns_wildcard} size="lg" alt="私有链接 DNS 通配符设置" border />

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

请按照以下指南 [将虚拟网络链接到您的私有 DNS 区域](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**选项 2：使用 Terraform**

:::note
配置 DNS 有多种方式。请根据您的具体用例设置 DNS。
:::

您需要将从 [获取用于 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link) 步骤中获取的 "DNS 名称" 指向私有端点 IP 地址。这确保服务/组件可以在您的虚拟私有云/网络中正确解析它。

### 验证 DNS 设置 {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` 域应指向私有端点 IP。（在本示例中为 10.0.0.4）。

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## 将私有端点 GUID 添加到您的 ClickHouse Cloud 组织 {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到组织，继续 [将私有端点 GUID 添加到您的服务允许列表](#add-private-endpoint-guid-to-services-allow-list) 步骤。通过 ClickHouse Cloud 控制台将 `私有端点 GUID` 添加到服务允许列表时，自动将其添加到组织。

要删除端点，请打开 **组织详情 -> 私有端点** 并单击删除按钮以删除端点。

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="删除私有端点" border />

### 选项 2：API {#option-2-api-1}

在运行任何命令之前，设置以下环境变量：

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint resourceGuid>
REGION=<region code, use Azure format>
```

使用从 [获得私有端点 `resourceGuid`](#obtaining-private-endpoint-resourceguid) 步骤中获得的数据设置 `ENDPOINT_ID` 环境变量。

运行以下命令以添加私有端点：

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

您还可以运行以下命令从服务允许列表中删除私有端点：

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

在添加或删除私有端点后，运行以下命令使其应用于您的组织：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## 将私有端点 GUID 添加到您的服务允许列表 {#add-private-endpoint-guid-to-services-allow-list}

默认情况下，即使私有链接连接已获得批准并建立，ClickHouse Cloud 服务通过私有链接连接也不可用。您需要明确为每个应通过私有链接使用的服务添加私有端点 GUID。

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后导航到 **设置**。输入从 [之前的步骤](#obtaining-private-endpoint-resourceguid) 中获取的 `Endpoint ID`。

:::note
如果您想允许来自现有 PrivateLink 连接的访问，请使用现有的端点下拉菜单。
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="私有端点过滤器" border />

### 选项 2：API {#option-2-api-2}

在运行任何命令之前，设置这些环境变量：

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint resourceGuid>
INSTANCE_ID=<Instance ID>
```

为每个应通过私有链接可用的服务执行此操作。

运行以下命令以将私有端点添加到服务允许列表中：

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

您还可以运行以下命令从服务允许列表中删除私有端点：

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

在将私有端点添加或移除到服务允许列表中后，运行以下命令使其应用于您的组织：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## 使用 Private Link 访问您的 ClickHouse Cloud 服务 {#access-your-clickhouse-cloud-service-using-private-link}

每个启用私有链接的服务都有一个公共和私有端点。为了通过私有链接连接，您需要使用将用于 `privateDnsHostname`<sup>API</sup> 或 `DNS 名称`<sup>控制台</sup> 从 [获取 Azure 连接别名用作 Private Link](#obtain-azure-connection-alias-for-private-link) 中获取的私有端点。

### 获取私有 DNS 主机名 {#obtaining-the-private-dns-hostname}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航到 **设置**。点击 **设置私有端点** 按钮。在打开的侧边栏中，复制 **DNS 名称**。

<Image img={azure_privatelink_pe_dns} size="lg" alt="私有端点 DNS 名称" border />

#### 选项 2：API {#option-2-api-3}

在运行任何命令之前，设置以下环境变量：

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

您应该收到类似以下的响应：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

在本示例中，连接到 `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` 主机名将路由到私有链接。同时，`xxxxxxx.region_code.azure.clickhouse.cloud` 将通过互联网路由。

使用 `privateDnsHostname` 通过私有链接连接到您的 ClickHouse Cloud 服务。

## 故障排除 {#troubleshooting}

### 测试 DNS 设置 {#test-dns-setup}

运行以下命令：

```bash
nslookup <dns name>
```
其中 "dns 名称" 是从 [获取用于 Private Link 的 Azure 连接别名](#obtain-azure-connection-alias-for-private-link) 的 `privateDnsHostname`<sup>API</sup> 或 `DNS 名称`<sup>控制台</sup>

您应该收到以下响应：

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### 连接被对等方重置 {#connection-reset-by-peer}

很可能，私有端点 GUID 未添加到服务允许列表中。请重新访问 [_将私有端点 GUID 添加到您的服务允许列表_ 步骤](#add-private-endpoint-guid-to-services-allow-list)。

### 私有端点处于待定状态 {#private-endpoint-is-in-pending-state}

很可能，私有端点 GUID 未添加到服务允许列表中。请重新访问 [_将私有端点 GUID 添加到您的服务允许列表_ 步骤](#add-private-endpoint-guid-to-services-allow-list)。

### 测试连接性 {#test-connectivity}

如果您在使用私有链接进行连接时遇到问题，请使用 `openssl` 检查您的连接性。确保私有链接端点状态为 `Accepted`。

OpenSSL 应能够连接（输出中看到 CONNECTED）。 `errno=104` 是预期的。

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud.cloud:9440
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

在运行任何命令之前，设置以下环境变量：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

运行以下命令以检查私有端点过滤器：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## 更多信息 {#more-information}

有关 Azure Private Link 的更多信息，请访问 [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)。
