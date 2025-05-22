---
'title': 'GCP Private Service Connect'
'description': '本文档描述了如何使用 Google Cloud Platform (GCP) Private Service Connect (PSC)
  连接到 ClickHouse Cloud，以及如何使用 ClickHouse Cloud IP 访问列表禁用来自 GCP PSC 地址以外的地址对您的 ClickHouse
  Cloud 服务的访问。'
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


# 私有服务连接 {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

私有服务连接（PSC）是Google Cloud的网络功能，允许消费者在其虚拟私有云（VPC）网络内私密访问托管服务。类似地，它允许托管服务提供商在自己独立的VPC网络中托管这些服务，并为其消费者提供私密连接。

服务提供商通过创建私有服务连接服务，将其应用发布给消费者。服务消费者通过以下任一类型的私有服务连接直接访问这些私有服务连接服务。

<Image img={gcp_psc_overview} size="lg" alt="Overview of Private Service Connect" border />

:::important
默认情况下，即使PSC连接已批准并建立，ClickHouse服务也不可通过私有服务连接访问；您需要通过完成下面的[步骤](#add-endpoint-id-to-services-allow-list)，明确将PSC ID添加到实例级别的允许列表中。
:::


**使用私有服务连接全局访问的重要考虑事项**：
1. 利用全局访问的区域必须属于同一VPC。
1. 必须在PSC级别明确启用全局访问（请参阅下面的截图）。
1. 确保您的防火墙设置不会阻止来自其他区域的PSC访问。
1. 请注意，您可能会产生GCP跨区域数据传输费用。

不支持跨区域连接。生产者和消费者区域必须相同。然而，您可以通过在私有服务连接（PSC）级别启用[全球访问](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)从您VPC内的其他地区进行连接。

**请完成以下步骤以启用GCP PSC**：
1. 获取私有服务连接的GCP服务附加。
1. 创建服务端点。
1. 将“端点ID”添加到ClickHouse Cloud服务中。
1. 将“端点ID”添加到ClickHouse服务允许列表中。


## 注意事项 {#attention}
ClickHouse尝试将您的服务分组，以便在GCP区域内重用相同的发布[PSC端点](https://cloud.google.com/vpc/docs/private-service-connect)。然而，尤其是在您将服务分布在多个ClickHouse组织之间时，这种分组不能得到保证。
如果您已经为ClickHouse组织中的其他服务配置了PSC，通常可以跳过大部分步骤，因为分组的原因，直接进行最后一步：[添加“端点ID”到ClickHouse服务允许列表](#add-endpoint-id-to-services-allow-list)。

在[这里](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)找到Terraform示例。

## 在开始之前 {#before-you-get-started}

:::note
下面提供了代码示例，以演示如何在ClickHouse Cloud服务中设置私有服务连接。在下面的示例中，我们将使用：
 - GCP区域：`us-central1`
 - GCP项目（客户GCP项目）：`my-gcp-project`
 - 客户GCP项目中的GCP私有IP地址：`10.128.0.2`
 - 客户GCP项目中的GCP VPC：`default`
:::

您需要检索有关您的ClickHouse Cloud服务的信息。您可以通过ClickHouse Cloud控制台或ClickHouse API来完成。如果您打算使用ClickHouse API，请在继续之前设置以下环境变量：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

您可以[创建一个新的ClickHouse Cloud API密钥](/cloud/manage/openapi)或使用现有的密钥。

通过按区域、提供商和服务名称过滤以获取您的ClickHouse `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - 您可以从ClickHouse控制台（组织 -> 组织详情）中获取您的组织ID。
 - 您可以[创建一个新的密钥](/cloud/manage/openapi)或使用现有的密钥。
:::

## 获取GCP服务附加和私有服务连接的DNS名称 {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### 选项 1：ClickHouse Cloud控制台 {#option-1-clickhouse-cloud-console}

在ClickHouse Cloud控制台中，打开您希望通过私有服务连接连接的服务，然后打开**设置**菜单。点击**设置私有端点**按钮。记下**服务名称**（`endpointServiceId`）和**DNS名称**（`privateDnsHostname`）。您将在接下来的步骤中使用它们。

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### 选项 2：API {#option-2-api}

:::note
您需要在区域中至少部署一个实例才能执行此步骤。
:::

获取GCP服务附加和私有服务连接的DNS名称：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

记下`endpointServiceId`和`privateDnsHostname`。您将在接下来的步骤中使用它们。

## 创建服务端点 {#create-service-endpoint}

:::important
本节涵盖通过GCP PSC（私有服务连接）配置ClickHouse的ClickHouse特定详细信息。GCP特定步骤仅作为参考，以指导您查看相关内容，但它们可能会随时间而变化，无需GCP云提供商通知。请根据您的特定用例考虑GCP配置。

请注意，ClickHouse不负责配置所需的GCP PSC端点、DNS记录。

有关GCP配置任务的任何问题，请直接联系GCP支持。
:::

在本节中，我们将创建一个服务端点。

### 添加私有服务连接 {#adding-a-private-service-connection}

首先，我们将创建私有服务连接。

#### 选项 1：使用Google Cloud控制台 {#option-1-using-google-cloud-console}

在Google Cloud控制台中，导航到**网络服务 -> 私有服务连接**。

<Image img={gcp_psc_open} size="lg" alt="Open Private Service Connect in Google Cloud Console" border />

通过点击**连接端点**按钮打开私有服务连接创建对话框。

- **目标**：使用**已发布的服务**
- **目标服务**：使用来自[获取GCP服务附加和私有服务连接的DNS名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤的`endpointServiceId`<sup>API</sup>或`服务名称`<sup>控制台</sup>。
- **端点名称**：为PSC **端点名称**设置一个名称。
- **网络/子网络/IP地址**：选择您希望用于连接的网络。您需要创建一个IP地址或使用现有的IP地址作为私有服务连接端点。在我们的示例中，我们预先创建了名称为**your-ip-address**的地址，并分配了IP地址`10.128.0.2`
- 为了使端点在任何区域可用，您可以启用**启用全局访问**复选框。

<Image img={gcp_psc_enable_global_access} size="md" alt="Enable Global Access for Private Service Connect" border />

要创建PSC端点，请使用**添加端点**按钮。

**状态**列将在连接获得批准后从**待处理**变为**已接受**。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Copy PSC Connection ID" border />

复制***PSC连接ID***，我们将在接下来的步骤中将其用作***端点ID***。

#### 选项 2：使用Terraform {#option-2-using-terraform}

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
使用来自[获取GCP服务附加和私有服务连接的DNS名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤的`endpointServiceId`<sup>API</sup>或`服务名称`<sup>控制台</sup>。
:::

## 设置端点的私有DNS名称 {#setting-up-dns}

:::note
有多种方式来配置DNS。请根据您的特定用例设置DNS。
:::

您需要将“DNS名称”，即来自[获取GCP服务附加和私有服务连接的DNS名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的名称，指向GCP私有服务连接端点IP地址。这确保服务/组件可以在您的VPC/网络内正确解析它。

## 将端点ID添加到ClickHouse Cloud组织 {#add-endpoint-id-to-clickhouse-cloud-organization}

### 选项 1：ClickHouse Cloud控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到您的组织，请继续到[添加“端点ID”到ClickHouse服务允许列表](#add-endpoint-id-to-services-allow-list)步骤。在ClickHouse Cloud控制台中使用`PSC连接ID`将其添加到服务允许列表中，自动将其添加到组织中。

要删除端点，请打开**组织详情 -> 私有端点**，然后单击删除按钮以移除该端点。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Remove Private Endpoint from ClickHouse Cloud" border />

### 选项 2：API {#option-2-api-1}

在运行任何命令之前，请设置以下环境变量：

用来自[添加一个私有服务连接](#adding-a-private-service-connection)步骤的“端点ID”替换下面的`ENDPOINT_ID`。

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

将私有端点添加/删除到组织：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## 将“端点ID”添加到ClickHouse服务允许列表 {#add-endpoint-id-to-services-allow-list}

您需要将端点ID添加到每个应通过私有服务连接提供的实例的允许列表中。

### 选项 1：ClickHouse Cloud控制台 {#option-1-clickhouse-cloud-console-2}

在ClickHouse Cloud控制台中，打开您希望通过私有服务连接连接的服务，然后导航到**设置**。输入从[添加一个私有服务连接](#adding-a-private-service-connection)步骤中检索到的`端点ID`。点击**创建端点**。

:::note
如果您希望允许来自现有私有服务连接的访问，请使用现有端点下拉菜单。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints Filter" border />

### 选项 2：API {#option-2-api-2}

在运行任何命令之前，请设置以下环境变量：

用来自[添加一个私有服务连接](#adding-a-private-service-connection)步骤的“端点ID”替换下面的**ENDPOINT_ID**。

对每个应通过私有服务连接提供的服务执行此操作。

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

## 使用私有服务连接访问实例 {#accessing-instance-using-private-service-connect}

每个启用了私有链接的服务都有公共和私人端点。要使用私有链接进行连接，您需要使用`privateDnsHostname`，该名称来自[获取GCP服务附加和私有服务连接的DNS名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)。

### 获取私有DNS主机名 {#getting-private-dns-hostname}

#### 选项 1：ClickHouse Cloud控制台 {#option-1-clickhouse-cloud-console-3}

在ClickHouse Cloud控制台中，导航到**设置**。点击**设置私有端点**按钮。在打开的飞出窗口中，复制**DNS名称**。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

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

在此示例中，连接到`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud`主机名将路由到私有服务连接。同时，`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud`将通过互联网路由。

## 疑难解答 {#troubleshooting}

### 测试DNS设置 {#test-dns-setup}

DNS_NAME - 使用来自[获取GCP服务附加和私有服务连接的DNS名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的`privateDnsHostname`

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### 连接被对等方重置 {#connection-reset-by-peer}

- 很可能，未将端点ID添加到服务允许列表。请重新访问[_添加端点ID到服务允许列表_步骤](#add-endpoint-id-to-services-allow-list)。

### 测试连接性 {#test-connectivity}

如果您在使用PSC链接时遇到连接问题，请使用`openssl`检查您的连接性。确保私有服务连接端点的状态为`已接受`：

OpenSSL应该能够连接（请参见输出中的CONNECTED）。`errno=104`是预期的。

DNS_NAME - 使用来自[获取GCP服务附加和私有服务连接的DNS名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的`privateDnsHostname`

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

假设您尝试在ClickHouse Cloud中使用[MySQL](../../sql-reference/table-functions/mysql.md)或[PostgreSQL](../../sql-reference/table-functions/postgresql.md)表函数，并连接到您在GCP中托管的数据库。GCP PSC无法用来安全地启用此连接。PSC是一种单向的单向连接。它允许您的内部网络或GCP VPC安全地连接到ClickHouse Cloud，但它不允许ClickHouse Cloud连接到您的内部网络。

根据[GCP私有服务连接文档](https://cloud.google.com/vpc/docs/private-service-connect)：

> 面向服务的设计：生产者服务通过负载均衡器发布，向消费者VPC网络公开单个IP地址。访问生产者服务的消费者流量是单向的，只能访问服务IP地址，而无法访问整个对等的VPC网络。

为此，请配置您的GCP VPC防火墙规则，以允许ClickHouse Cloud与您的内部/私有数据库服务建立连接。查看[ClickHouse Cloud区域的默认出口IP地址](/manage/security/cloud-endpoints-api)，以及[可用的静态IP地址](https://api.clickhouse.cloud/static-ips.json)。

## 更多信息 {#more-information}

有关更详细的信息，请访问[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)。
