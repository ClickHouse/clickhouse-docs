---
'title': 'GCP Private Service Connect'
'description': '本文档描述了如何使用Google Cloud Platform（GCP）Private Service Connect（PSC）连接到ClickHouse
  Cloud，并如何使用ClickHouse Cloud IP访问列表禁用除GCP PSC地址之外的地址对ClickHouse Cloud服务的访问。'
'sidebar_label': 'GCP Private Service Connect'
'slug': '/manage/security/gcp-private-service-connect'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import gcp_psc_overview from '@site/static/images/cloud/security/gcp-psc-overview.png';
import gcp_privatelink_pe_create from '@site/static/images/cloud/security/gcp-privatelink-pe-create.png';
import gcp_psc_open from '@site/static/images/cloud/security/gcp-psc-open.png';
import gcp_psc_enable_global_access from '@site/static/images/cloud/security/gcp-psc-enable-global-access.png';
import gcp_psc_copy_connection_id from '@site/static/images/cloud/security/gcp-psc-copy-connection-id.png';
import gcp_psc_create_zone from '@site/static/images/cloud/security/gcp-psc-create-zone.png';
import gcp_psc_zone_type from '@site/static/images/cloud/security/gcp-psc-zone-type.png';
import gcp_psc_dns_record from '@site/static/images/cloud/security/gcp-psc-dns-record.png';
import gcp_pe_remove_private_endpoint from '@site/static/images/cloud/security/gcp-pe-remove-private-endpoint.png';
import gcp_privatelink_pe_filters from '@site/static/images/cloud/security/gcp-privatelink-pe-filters.png';
import gcp_privatelink_pe_dns from '@site/static/images/cloud/security/gcp-privatelink-pe-dns.png';


# Private Service Connect {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect(PSC) 是一个 Google Cloud 网络功能，允许消费者在其虚拟私有云（VPC）网络内部私密访问托管服务。同样，它允许托管服务提供者在自己独立的 VPC 网络中托管这些服务，并为其消费者提供私密连接。

服务提供者通过创建 Private Service Connect 服务将其应用程序发布给消费者。服务消费者通过这些 Private Service Connect 类型之一直接访问这些 Private Service Connect 服务。

<Image img={gcp_psc_overview} size="lg" alt="Private Service Connect 概述" border />

:::important
默认情况下，ClickHouse 服务无法通过 Private Service 连接访问，即使 PSC 连接已获批准并已建立；您需要通过完成下面的 [步骤](#add-endpoint-id-to-services-allow-list) 明确将 PSC ID 添加到实例级的允许列表中。
:::


**使用 Private Service Connect 全局访问的重要考虑事项**：
1. 使用全局访问的区域必须属于同一个 VPC。
2. 必须在 PSC 层面显式启用全局访问（请参见下面的截图）。
3. 确保您的防火墙设置不会阻止其他区域对 PSC 的访问。
4. 请注意，您可能会产生 GCP 区域间数据传输费用。

不支持跨区域连接。生产者和消费者区域必须相同。然而，您可以通过在 Private Service Connect (PSC) 层启用 [全局访问](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) 从 VPC 内的其他区域进行连接。

**请完成以下步骤以启用 GCP PSC**：
1. 获取 Private Service Connect 的 GCP 服务附件。
2. 创建服务端点。
3. 将 "Endpoint ID" 添加到 ClickHouse Cloud 服务。
4. 将 "Endpoint ID" 添加到 ClickHouse 服务允许列表中。


## 注意事项 {#attention}
ClickHouse 尝试将您的服务进行分组，以在 GCP 区域内重用同一个发布的 [PSC 端点](https://cloud.google.com/vpc/docs/private-service-connect)。但是，这种分组并不总是保证，特别是如果您将服务分散在多个 ClickHouse 组织中。
如果您已为 ClickHouse 组织中的其他服务配置了 PSC，您通常可以跳过大部分步骤，因为这种分组，直接进行最后一步：[将 "Endpoint ID" 添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)。

可以在 [这里](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) 查找 Terraform 示例。

## 在开始之前 {#before-you-get-started}

:::note
下面提供了代码示例，以展示如何在 ClickHouse Cloud 服务中设置 Private Service Connect。在我们的示例中，我们将使用：
 - GCP 区域： `us-central1`
 - GCP 项目（客户 GCP 项目）： `my-gcp-project`
 - GCP 私有 IP 地址在客户 GCP 项目中： `10.128.0.2`
 - GCP VPC 在客户 GCP 项目中： `default`
:::

您需要检索有关 ClickHouse Cloud 服务的信息。您可以通过 ClickHouse Cloud 控制台或 ClickHouse API 完成此操作。如果要使用 ClickHouse API，请在继续之前设置以下环境变量：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

您可以 [创建新的 ClickHouse Cloud API 密钥](/cloud/manage/openapi) 或使用现有密钥。

通过按区域、提供者和服务名称筛选来获取 ClickHouse 的 `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - 您可以从 ClickHouse 控制台（组织 -> 组织详情）检索您的组织 ID。
 - 您可以 [创建新的密钥](/cloud/manage/openapi) 或使用现有密钥。
:::

## 获取 GCP 服务附件和 Private Service Connect 的 DNS 名称 {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您希望通过 Private Service Connect 连接的服务，然后打开 **设置** 菜单。单击 **设置私有端点** 按钮。请记下 **服务名称** （ `endpointServiceId`）和 **DNS 名称** （`privateDnsHostname`）。您将在下一步中使用它们。

<Image img={gcp_privatelink_pe_create} size="lg" alt="私有端点" border />

### 选项 2：API {#option-2-api}

:::note
您需要在该区域至少部署一个实例才能执行此步骤。
:::

获取 GCP 服务附件和 Private Service Connect 的 DNS 名称：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

请记下 `endpointServiceId` 和 `privateDnsHostname`。您将在下一步中使用它们。

## 创建服务端点 {#create-service-endpoint}

:::important
本节涵盖通过 GCP PSC(Private Service Connect) 配置 ClickHouse 的 ClickHouse 特定细节。提供 GCP 相关步骤作为参考，以指导您查找位置，但它们可能会随时间而变化，且未必提前通知 GCP 云提供商。请根据您的具体用例考虑配置 GCP。

请注意，ClickHouse 不负责配置所需的 GCP PSC 端点、DNS 记录。

有关 GCP 配置任务的任何问题，请直接联系 GCP 支持。
:::

在本节中，我们将创建一个服务端点。

### 添加一个 Private Service 连接 {#adding-a-private-service-connection}

首先，我们将创建一个 Private Service 连接。

#### 选项 1：使用 Google Cloud 控制台 {#option-1-using-google-cloud-console}

在 Google Cloud 控制台中，导航至 **网络服务 -> Private Service Connect**。

<Image img={gcp_psc_open} size="lg" alt="在 Google Cloud 控制台中打开 Private Service Connect" border />

通过单击 **连接端点** 按钮打开 Private Service Connect 创建对话框。

- **目标**：使用 **已发布服务**
- **目标服务**：使用 [从获取 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中的 `endpointServiceId`<sup>API</sup> 或 `服务名称`<sup>控制台</sup>。
- **端点名称**：为 PSC **端点名称** 设置一个名称。
- **网络/子网/IP 地址**：选择您希望用于连接的网络。您需要创建一个 IP 地址或使用现有的 Private Service Connect 端点。在我们的示例中，我们预先创建了名为 **your-ip-address** 的地址，并分配了 IP 地址 `10.128.0.2`。
- 要使端点可从任何区域访问，您可以启用 **启用全局访问** 复选框。

<Image img={gcp_psc_enable_global_access} size="md" alt="为 Private Service Connect 启用全局访问" border />

要创建 PSC 端点，请使用 **添加端点** 按钮。

**状态** 列将在连接获批准后从 **待处理** 更改为 **已接受**。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="复制 PSC 连接 ID" border />

复制 ***PSC 连接 ID***，我们将在下一步中将其用作 ***Endpoint ID***。

#### 选项 2：使用 Terraform {#option-2-using-terraform}

```json
provider "google" {
  project = "my-gcp-project"
  region  = "us-central1"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "subnetwork" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/regions/us-central1/subnetworks/default"
}

variable "network" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
}

resource "google_compute_address" "psc_endpoint_ip" {
  address      = "10.128.0.2"
  address_type = "INTERNAL"
  name         = "your-ip-address"
  purpose      = "GCE_ENDPOINT"
  region       = var.region
  subnetwork   = var.subnetwork
}

resource "google_compute_forwarding_rule" "clickhouse_cloud_psc" {
  ip_address            = google_compute_address.psc_endpoint_ip.self_link
  name                  = "ch-cloud-${var.region}"
  network               = var.network
  region                = var.region
  load_balancing_scheme = ""
  # service attachment
  target = "https://www.googleapis.com/compute/v1/$TARGET" # See below in notes
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Add GCP PSC Connection ID to allow list on instance level."
}
```

:::note
使用 [从获取 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中的 `endpointServiceId`<sup>API</sup> 或 `服务名称`<sup>控制台</sup>。
:::

## 为端点设置私有 DNS 名称 {#setting-up-dns}

:::note
配置 DNS 有多种方法。请根据您的具体用例设置 DNS。
:::

您需要将 "DNS 名称" 指向 [从获取 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中获得的 GCP Private Service Connect 端点的 IP 地址。这确保您 VPC/网络中的服务/组件能够正确解析。

## 将 Endpoint ID 添加到 ClickHouse Cloud 组织 {#add-endpoint-id-to-clickhouse-cloud-organization}

### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到您的组织，请继续执行 [将 "Endpoint ID" 添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list) 步骤。使用 ClickHouse Cloud 控制台将 `PSC 连接 ID` 添加到服务允许列表中将其自动添加到组织。

要删除一个端点，请打开 **组织详情 -> 私有端点** 并单击删除按钮以移除该端点。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="从 ClickHouse Cloud 删除私有端点" border />

### 选项 2：API {#option-2-api-1}

在运行任何命令之前，请设置这些环境变量：

用 **从添加私有服务连接** 步骤中的 **Endpoint ID** 替换下面的 `ENDPOINT_ID`。

要添加端点，请运行：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "A GCP private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

要删除端点，请运行：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

向组织添加/删除私有端点：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## 将 "Endpoint ID" 添加到 ClickHouse 服务允许列表 {#add-endpoint-id-to-services-allow-list}

您需要将 Endpoint ID 添加到每个应该通过 Private Service Connect 可用的实例的允许列表中。


### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中，打开您希望通过 Private Service Connect 连接的服务，然后导航到 **设置**。输入从 [添加一个 Private Service 连接](#adding-a-private-service-connection) 步骤中获取的 `Endpoint ID`。单击 **创建端点**。

:::note
如果您想允许从现有的 Private Service Connect 连接访问，请使用现有端点下拉菜单。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="私有端点筛选器" border />

### 选项 2：API {#option-2-api-2}

在运行任何命令之前，请设置这些环境变量：

用 [从添加私有服务连接](#adding-a-private-service-connection) 步骤中的 **Endpoint ID** 替换 **ENDPOINT_ID**。

对每个应通过 Private Service Connect 可用的服务执行以下操作。

要添加：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

要删除：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## 使用 Private Service Connect 访问实例 {#accessing-instance-using-private-service-connect}

每个启用 Private Link 的服务都有一个公共和一个私有端点。为了使用 Private Link 进行连接，您需要使用 `privateDnsHostname` 作为私有端点，该名称来自 [从获取 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤。

### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航到 **设置**。单击 **设置私有端点** 按钮。在打开的弹出窗口中，复制 **DNS 名称**。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="私有端点 DNS 名称" border />

#### 选项 2：API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

在此示例中，连接到 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` 主机名将被路由到 Private Service Connect。同时，`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` 将通过互联网路由。

## 故障排除 {#troubleshooting}

### 测试 DNS 设置 {#test-dns-setup}

DNS_NAME - 使用 [从获取 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中的 `privateDnsHostname`。

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### 连接被对等方重置 {#connection-reset-by-peer}

- 最有可能的原因是未将 Endpoint ID 添加到服务允许列表。请重新访问 [_将 Endpoint ID 添加到服务允许列表_ 步骤](#add-endpoint-id-to-services-allow-list)。

### 测试连接性 {#test-connectivity}

如果您在使用 PSC 链接时遇到问题，请使用 `openssl` 检查您的连接性。确保 Private Service Connect 端点状态为 `Accepted`：

OpenSSL 应该能够连接（在输出中看到 CONNECTED）。`errno=104` 是预期的。

DNS_NAME - 使用 [从获取 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中的 `privateDnsHostname`。

```bash
openssl s_client -connect ${DNS_NAME}:9440
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

### 检查端点过滤器 {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### 连接到远程数据库 {#connecting-to-a-remote-database}

假设您试图在 ClickHouse Cloud 中使用 [MySQL](../../sql-reference/table-functions/mysql.md) 或 [PostgreSQL](../../sql-reference/table-functions/postgresql.md) 表函数，并连接到您在 GCP 中托管的数据库。GCP PSC 无法用于安全地启用此连接。PSC 是单向的单向连接。它允许您的内部网络或 GCP VPC 安全连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [GCP Private Service Connect 文档](https://cloud.google.com/vpc/docs/private-service-connect)：

> 面向服务的设计：生产者服务通过负载均衡器发布，这些负载均衡器向消费者 VPC 网络公开一个单一的 IP 地址。访问生产者服务的消费者流量是单向的，仅能访问服务 IP 地址，而不是访问整个对等 VPC 网络。

为此，请配置您的 GCP VPC 防火墙规则，以允许 ClickHouse Cloud 连接到您的内部/私有数据库服务。请检查 [ClickHouse Cloud 区域的默认出口 IP 地址](/manage/security/cloud-endpoints-api) 以及 [可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。

## 更多信息 {#more-information}

要获取更详细的信息，请访问 [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)。
