---
title: 'GCP 私有服务连接'
description: '本文档介绍如何通过 Google Cloud Platform (GCP) Private Service Connect (PSC) 连接到 ClickHouse Cloud，以及如何使用 ClickHouse Cloud IP 访问列表阻止非 GCP PSC 地址访问您的 ClickHouse Cloud 服务。'
sidebar_label: 'GCP 私有服务连接'
slug: /manage/security/gcp-private-service-connect
doc_type: 'guide'
keywords: ['Private Service Connect']
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

# Private Service Connect \{#private-service-connect\}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect（PSC）是 Google Cloud 的一项网络功能，允许服务使用方在其虚拟私有云（VPC）网络内部以私有方式访问托管服务。同样，它也允许托管服务提供方在其各自独立的 VPC 网络中托管这些服务，并向其使用方提供私有连接。

服务提供方通过创建 Private Service Connect 服务，将其应用发布给服务使用方。服务使用方则通过以下任一 Private Service Connect 类型，直接访问这些 Private Service Connect 服务。

<Image img={gcp_psc_overview} size="lg" alt="Private Service Connect 概览" border />

:::important
默认情况下，即使 PSC 连接已经批准并建立，ClickHouse 服务也无法通过 Private Service Connect 连接访问；你需要在实例级别显式地将 PSC ID 添加到允许列表中，具体方法是完成下方的[步骤](#add-endpoint-id-to-services-allow-list)。
:::

**使用 Private Service Connect Global Access 的重要注意事项：**
1. 使用 Global Access 的各个区域必须属于同一个 VPC。
1. 必须在 PSC 级别显式启用 Global Access（参见下方截图）。
1. 确保你的防火墙设置不会阻止来自其他区域对 PSC 的访问。
1. 注意，你可能会产生 GCP 跨区域数据传输费用。

目前不支持跨区域连接。服务提供方与服务使用方必须位于同一区域。不过，你可以通过在 Private Service Connect（PSC）级别启用 [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)，从同一 VPC 中的其他区域进行连接。

**请完成以下步骤以启用 GCP PSC：**
1. 获取用于 Private Service Connect 的 GCP service attachment。
1. 创建服务端点。
1. 将“Endpoint ID”添加到 ClickHouse Cloud 服务。
1. 将“Endpoint ID”添加到 ClickHouse 服务允许列表。

## 注意 \{#attention\}
ClickHouse 会尝试对您的服务进行分组，以便在同一 GCP 区域内复用同一个已发布的 [PSC 端点](https://cloud.google.com/vpc/docs/private-service-connect)。但是，这种分组并不能得到保证，尤其是在您将服务分散到多个 ClickHouse 组织时。
如果您已经在 ClickHouse 组织中为其他服务配置了 PSC，得益于这种分组，通常可以跳过大部分步骤，直接进入最后一步：[将“Endpoint ID”添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)。

可以在[这里](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)找到 Terraform 示例。

## 开始之前 \{#before-you-get-started\}

:::note
下面提供的代码示例演示如何在 ClickHouse Cloud 服务中设置 Private Service Connect。在以下示例中，我们将使用：

* GCP 区域：`us-central1`
* GCP 项目（客户 GCP 项目）：`my-gcp-project`
* 客户 GCP 项目中的 GCP 私有 IP 地址：`10.128.0.2`
* 客户 GCP 项目中的 GCP VPC：`default`
  :::

您需要获取有关 ClickHouse Cloud 服务的一些信息。可以通过 ClickHouse Cloud 控制台或 ClickHouse API 来完成此操作。如果计划使用 ClickHouse API，请在继续之前先设置以下环境变量：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

你可以[创建新的 ClickHouse Cloud API 密钥](/cloud/manage/openapi)，或者使用现有的密钥。

通过按区域、云服务提供商和服务名称进行筛选来获取你的 ClickHouse `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

* 你可以在 ClickHouse 控制台中获取你的组织 ID（Organization -&gt; Organization Details）。
* 你可以[创建一个新密钥](/cloud/manage/openapi)或使用现有密钥。
  :::

## 获取用于 Private Service Connect 的 GCP 服务附件和 DNS 名称 \{#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect\}

### 选项 1：ClickHouse Cloud 控制台 \{#option-1-clickhouse-cloud-console\}

在 ClickHouse Cloud 控制台中，打开你希望通过 Private Service Connect 连接的服务，然后打开 **Settings** 菜单。点击 **Set up private endpoint** 按钮。记录下 **Service name**（`endpointServiceId`）和 **DNS name**（`privateDnsHostname`）。你将在接下来的步骤中使用它们。

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### 选项 2：API \{#option-2-api\}

:::note
你需要在该区域中至少部署一个实例，才能执行此步骤。
:::

获取用于 Private Service Connect 的 GCP 服务附件和 DNS 名称：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

请记录下 `endpointServiceId` 和 `privateDnsHostname`，在接下来的步骤中你将会用到它们。

## 创建服务端点 \{#create-service-endpoint\}

:::important
本节介绍通过 GCP PSC（Private Service Connect）配置 ClickHouse 的特定细节。文中给出的 GCP 相关步骤仅作为参考，用于指引你去哪里进行配置，但这些步骤可能会随 GCP 的变更而调整，且恕不另行通知。请根据你的具体使用场景自行评估并配置 GCP。

请注意，ClickHouse 不负责配置所需的 GCP PSC 端点和 DNS 记录。

如在执行 GCP 配置相关任务时遇到任何问题，请直接联系 GCP 支持。
:::

在本节中，我们将创建一个服务端点。

### 添加一个私有服务连接 \{#adding-a-private-service-connection\}

首先，我们将创建一个 Private Service Connection（私有服务连接）。

#### 选项 1：使用 Google Cloud 控制台 \{#option-1-using-google-cloud-console\}

在 Google Cloud 控制台中，导航到 **Network services -&gt; Private Service Connect**。

<Image img={gcp_psc_open} size="lg" alt="在 Google Cloud 控制台中打开 Private Service Connect" border />

点击 **Connect Endpoint** 按钮，打开 Private Service Connect 创建对话框。

* **Target**：选择 **Published service**
* **Target service**：使用在[获取用于 Private Service Connect 的 GCP service attachment](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中获取的 `endpointServiceId`<sup>API</sup> 或 `Service name`<sup>console</sup>。
* **Endpoint name**：为 PSC 的 **Endpoint name** 设置一个名称。
* **Network/Subnetwork/IP address**：选择你希望用于该连接的网络。你需要为 Private Service Connect 端点创建一个新的 IP 地址或使用现有 IP 地址。在示例中，我们预先创建了名称为 **your-ip-address**、IP 地址为 `10.128.0.2` 的地址。
* 若希望从任意区域都可以访问该端点，可以勾选 **Enable global access** 复选框。

<Image img={gcp_psc_enable_global_access} size="md" alt="为 Private Service Connect 启用 Global Access" border />

要创建 PSC Endpoint，请点击 **ADD ENDPOINT** 按钮。

连接获批后，**Status** 列会从 **Pending** 变为 **Accepted**。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="复制 PSC Connection ID" border />

复制 ***PSC Connection ID***，我们将在后续步骤中将其作为 ***Endpoint ID*** 使用。

#### 选项 2：使用 Terraform \{#option-2-using-terraform\}

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
使用在[获取用于 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中获得的 `endpointServiceId`<sup>API</sup> 或 `Service name`<sup>console</sup>
:::

## 为端点设置私有 DNS 名称 \{#set-private-dns-name-for-endpoint\}

:::note
配置 DNS 有多种方式。请根据您的具体使用场景来设置 DNS。
:::

您需要将在[获取用于 Private Service Connect 的 GCP 服务附件和 DNS 名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中得到的 DNS 名称指向 GCP Private Service Connect 端点的 IP 地址。这样可以确保您的 VPC/网络中的服务和组件能够正确解析该地址。

## 将 Endpoint ID 添加到 ClickHouse Cloud 组织 \{#add-endpoint-id-to-clickhouse-cloud-organization\}

### 选项 1：ClickHouse Cloud 控制台 \{#option-1-clickhouse-cloud-console-1\}

要向组织添加 endpoint，请继续执行[将 “Endpoint ID” 添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)步骤。通过 ClickHouse Cloud 控制台将 `PSC Connection ID` 添加到服务允许列表时，会自动将其添加到组织中。

要移除 endpoint，打开 **Organization details → Private Endpoints**，然后点击删除按钮以移除该 endpoint。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="从 ClickHouse Cloud 中移除 Private Endpoint" border />

### 选项 2：API \{#option-2-api-1\}

在运行任何命令之前，先设置以下环境变量：

将下面的 `ENDPOINT_ID` 替换为在[添加 Private Service Connection](#adding-a-private-service-connection)步骤中 **Endpoint ID** 的值。

要添加 endpoint，运行：

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

若要移除某个 endpoint，请运行：

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

为组织添加或移除专用终结点：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## 将 &quot;Endpoint ID&quot; 添加到 ClickHouse 服务允许列表 \{#add-endpoint-id-to-services-allow-list\}

您需要为每个需要通过 Private Service Connect 访问的实例，将一个 Endpoint ID 添加到其允许列表中。

### 选项 1：通过 ClickHouse Cloud 控制台 \{#option-1-clickhouse-cloud-console-2\}

在 ClickHouse Cloud 控制台中，打开您希望通过 Private Service Connect 进行连接的服务，然后导航到 **Settings**。输入在[添加 Private Service Connect 连接](#adding-a-private-service-connection)步骤中获取的 `Endpoint ID`，然后点击 **Create endpoint**。

:::note
如果您希望允许来自已有 Private Service Connect 连接的访问，请使用“现有 endpoint”下拉菜单中的选项。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints Filter" border />

### 选项 2：API \{#option-2-api-2\}

在运行任何命令之前，先设置以下环境变量：

将下面的 **ENDPOINT&#95;ID** 替换为在[添加 Private Service Connect 连接](#adding-a-private-service-connection)步骤中获取的 **Endpoint ID** 值。

对每个需要通过 Private Service Connect 访问的服务执行该命令。

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

删除：

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

## 使用 Private Service Connect 访问实例 \{#accessing-instance-using-private-service-connect\}

每个启用了 Private Link 的服务都有一个公共端点和私有端点。要通过 Private Link 进行连接，您需要使用私有端点，该端点对应于在[获取用于 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)中获得的 `privateDnsHostname`。

### 获取私有 DNS 主机名 \{#getting-private-dns-hostname\}

#### 选项 1：ClickHouse Cloud 控制台 \{#option-1-clickhouse-cloud-console-3\}

在 ClickHouse Cloud 控制台中，进入 **Settings**。单击 **Set up private endpoint** 按钮。在打开的侧边面板中，复制 **DNS Name**。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="私有端点 DNS 名称" border />

#### 选项 2：API \{#option-2-api-3\}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

在此示例中，对主机名 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` 的连接会被路由到 Private Service Connect。与此同时，`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` 的连接则会通过互联网进行路由。

## 故障排查 \{#troubleshooting\}

### 测试 DNS 设置 \{#test-dns-setup\}

DNS&#95;NAME - 使用 [获取用于 Private Service Connect 的 GCP 服务附件和 DNS 名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤中的 `privateDnsHostname` 值

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### 对端重置连接（Connection reset by peer） \{#connection-reset-by-peer\}

* 最常见的原因是 Endpoint ID 没有添加到服务允许列表中。请重新检查 [*将 endpoint ID 添加到服务允许列表* 步骤](#add-endpoint-id-to-services-allow-list)。

### 测试连通性 \{#test-connectivity\}

如果通过 PSC 链接连接时遇到问题，请使用 `openssl` 检查连通性。确保 Private Service Connect endpoint 的状态为 `Accepted`：

OpenSSL 应该能够建立连接（在输出中看到 CONNECTED）。`errno=104` 是预期的。

DNS&#95;NAME - 使用在[获取用于 Private Service Connect 的 GCP service attachment 和 DNS 名称](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中获得的 `privateDnsHostname`。

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

### 检查端点过滤规则 \{#checking-endpoint-filters\}

#### REST API \{#rest-api\}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### 连接到远程数据库 \{#connecting-to-a-remote-database\}

假设你想在 ClickHouse Cloud 中使用 [MySQL](/sql-reference/table-functions/mysql) 或 [PostgreSQL](/sql-reference/table-functions/postgresql) 表函数，并连接到托管在 GCP 上的数据库。GCP PSC 不能用于以安全方式建立此类连接。PSC 是单向连接，它允许内部网络或 GCP VPC 安全地连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 反向连接到你的内部网络。

根据 [GCP Private Service Connect 文档](https://cloud.google.com/vpc/docs/private-service-connect)：

> 面向服务的设计：服务提供方通过负载均衡器发布服务，该负载均衡器向服务使用方的 VPC 网络暴露单个 IP 地址。访问服务提供方服务的使用方流量是单向的，并且只能访问该服务的 IP 地址，而不能访问整个已对等的 VPC 网络。

要实现这一点，请配置 GCP VPC 防火墙规则，允许从 ClickHouse Cloud 访问你的内部/私有数据库服务。请查看 [ClickHouse Cloud 各区域的默认出站 IP 地址](/manage/data-sources/cloud-endpoints-api)，以及[可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。

## 更多信息 \{#more-information\}

如需了解更多详细信息，请参阅 [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)。
