---
title: 'GCP 私有服务连接'
description: '本文档介绍如何使用 Google Cloud Platform (GCP) Private Service Connect (PSC) 连接到 ClickHouse Cloud，以及如何使用 ClickHouse Cloud IP 访问列表禁止从非 GCP PSC 地址访问你的 ClickHouse Cloud 服务。'
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


# Private Service Connect（私有服务连接）{#private-service-connect}

<ScalePlanFeatureBadge feature='GCP PSC' />

Private Service Connect (PSC) 是 Google Cloud 的一项网络功能,允许消费者在其虚拟私有云 (VPC) 网络内私密访问托管服务。同样,它允许托管服务提供方在其独立的 VPC 网络中托管这些服务,并向消费者提供私有连接。

服务提供方通过创建 Private Service Connect 服务向消费者发布其应用程序。服务消费者通过这些 Private Service Connect 类型之一直接访问这些 Private Service Connect 服务。

<Image
  img={gcp_psc_overview}
  size='lg'
  alt='Private Service Connect 概览'
  border
/>

:::important
默认情况下,即使 PSC 连接已获批准并建立,ClickHouse 服务也无法通过 Private Service 连接访问;您需要通过完成下面的[步骤](#add-endpoint-id-to-services-allow-list)在实例级别显式地将 PSC ID 添加到允许列表中。
:::

**使用 Private Service Connect Global Access 的重要注意事项**:

1. 使用 Global Access 的区域必须属于同一个 VPC。
1. 必须在 PSC 级别显式启用 Global Access(请参阅下面的屏幕截图)。
1. 确保您的防火墙设置不会阻止来自其他区域对 PSC 的访问。
1. 请注意,您可能会产生 GCP 跨区域数据传输费用。

不支持跨区域连接。提供方和消费方区域必须相同。但是,您可以通过在 Private Service Connect (PSC) 级别启用 [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) 从 VPC 内的其他区域进行连接。

**请完成以下步骤以启用 GCP PSC**:

1. 获取用于 Private Service Connect 的 GCP 服务附件。
1. 创建服务端点。
1. 将"端点 ID"添加到 ClickHouse Cloud 服务。
1. 将"端点 ID"添加到 ClickHouse 服务允许列表。


## 注意事项 {#attention}

ClickHouse 会尝试对您的服务进行分组,以便在 GCP 区域内重用相同的已发布 [PSC 端点](https://cloud.google.com/vpc/docs/private-service-connect)。但是,这种分组并不保证,特别是当您将服务分散在多个 ClickHouse 组织中时。
如果您已经为 ClickHouse 组织中的其他服务配置了 PSC,由于该分组机制,您通常可以跳过大部分步骤,直接进入最后一步:[将"端点 ID"添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)。

在[此处](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)查找 Terraform 示例。


## 开始之前 {#before-you-get-started}

:::note
以下代码示例展示了如何在 ClickHouse Cloud 服务中设置 Private Service Connect。在示例中,我们将使用:

- GCP 区域:`us-central1`
- GCP 项目(客户 GCP 项目):`my-gcp-project`
- 客户 GCP 项目中的 GCP 私有 IP 地址:`10.128.0.2`
- 客户 GCP 项目中的 GCP VPC:`default`
  :::

您需要获取 ClickHouse Cloud 服务的相关信息。可以通过 ClickHouse Cloud 控制台或 ClickHouse API 来完成此操作。如果您要使用 ClickHouse API,请在继续之前设置以下环境变量:

```shell
REGION=<使用 GCP 格式的区域代码,例如:us-central1>
PROVIDER=gcp
KEY_ID=<您的 ClickHouse 密钥 ID>
KEY_SECRET=<您的 ClickHouse 密钥密文>
ORG_ID=<您的 ClickHouse 组织 ID>
SERVICE_NAME=<您的 ClickHouse 服务名称>
```

您可以[创建新的 ClickHouse Cloud API 密钥](/cloud/manage/openapi)或使用现有密钥。

通过区域、提供商和服务名称进行筛选,获取您的 ClickHouse `INSTANCE_ID`:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

- 您可以从 ClickHouse 控制台(组织 -> 组织详情)获取组织 ID。
- 您可以[创建新密钥](/cloud/manage/openapi)或使用现有密钥。
  :::


## 获取 Private Service Connect 的 GCP 服务附件和 DNS 名称 {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中,打开您希望通过 Private Service Connect 连接的服务,然后打开 **Settings** 菜单。点击 **Set up private endpoint** 按钮。记下 **Service name**(`endpointServiceId`)和 **DNS name**(`privateDnsHostname`)。您将在后续步骤中使用它们。

<Image
  img={gcp_privatelink_pe_create}
  size='lg'
  alt='私有端点'
  border
/>

### 选项 2:API {#option-2-api}

:::note
您需要在该区域中至少部署一个实例才能执行此步骤。
:::

获取 Private Service Connect 的 GCP 服务附件和 DNS 名称:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

记下 `endpointServiceId` 和 `privateDnsHostname`。您将在后续步骤中使用它们。


## 创建服务端点 {#create-service-endpoint}

:::important
本节介绍通过 GCP PSC(Private Service Connect)配置 ClickHouse 的具体细节。GCP 相关步骤仅供参考,但可能会随时间变化而不另行通知。请根据您的具体使用场景进行 GCP 配置。

请注意,ClickHouse 不负责配置所需的 GCP PSC 端点和 DNS 记录。

对于与 GCP 配置任务相关的任何问题,请直接联系 GCP 支持。
:::

在本节中,我们将创建一个服务端点。

### 添加私有服务连接 {#adding-a-private-service-connection}

首先,我们将创建一个私有服务连接。

#### 选项 1:使用 Google Cloud 控制台 {#option-1-using-google-cloud-console}

在 Google Cloud 控制台中,导航至 **Network services -> Private Service Connect**。

<Image
  img={gcp_psc_open}
  size='lg'
  alt='在 Google Cloud 控制台中打开 Private Service Connect'
  border
/>

点击 **Connect Endpoint** 按钮打开 Private Service Connect 创建对话框。

- **Target**:使用 **Published service**
- **Target service**:使用[获取 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的 `endpointServiceId`<sup>API</sup> 或 `Service name`<sup>console</sup>。
- **Endpoint name**:为 PSC **Endpoint name** 设置名称。
- **Network/Subnetwork/IP address**:选择要用于连接的网络。您需要为 Private Service Connect 端点创建一个 IP 地址或使用现有地址。在我们的示例中,我们预先创建了一个名为 **your-ip-address** 的地址,并分配了 IP 地址 `10.128.0.2`
- 要使端点可从任何区域访问,您可以启用 **Enable global access** 复选框。

<Image
  img={gcp_psc_enable_global_access}
  size='md'
  alt='为 Private Service Connect 启用全局访问'
  border
/>

要创建 PSC 端点,请使用 **ADD ENDPOINT** 按钮。

连接获得批准后,**Status** 列将从 **Pending** 变为 **Accepted**。

<Image
  img={gcp_psc_copy_connection_id}
  size='lg'
  alt='复制 PSC Connection ID'
  border
/>

复制 **_PSC Connection ID_**,我们将在后续步骤中将其用作 **_Endpoint ID_**。

#### 选项 2:使用 Terraform {#option-2-using-terraform}

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
  description = "将 GCP PSC Connection ID 添加到实例级别的允许列表。"
}
```

:::note
使用[获取 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的 `endpointServiceId`<sup>API</sup> 或 `Service name`<sup>console</sup>
:::


## 为端点设置私有 DNS 名称 {#set-private-dns-name-for-endpoint}

:::note
配置 DNS 的方式有多种。请根据您的具体使用场景来设置 DNS。
:::

您需要将从[获取 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中获取的"DNS 名称"指向 GCP Private Service Connect 端点 IP 地址。这样可以确保您 VPC/网络中的服务/组件能够正确解析该名称。


## 将端点 ID 添加到 ClickHouse Cloud 组织 {#add-endpoint-id-to-clickhouse-cloud-organization}

### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到您的组织,请继续执行[将"端点 ID"添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)步骤。使用 ClickHouse Cloud 控制台将 `PSC Connection ID` 添加到服务允许列表时,会自动将其添加到组织中。

要删除端点,请打开 **Organization details -> Private Endpoints** 并单击删除按钮来删除该端点。

<Image
  img={gcp_pe_remove_private_endpoint}
  size='lg'
  alt='从 ClickHouse Cloud 删除私有端点'
  border
/>

### 选项 2:API {#option-2-api-1}

在运行任何命令之前,请设置以下环境变量:

将下面的 `ENDPOINT_ID` 替换为[添加私有服务连接](#adding-a-private-service-connection)步骤中 **Endpoint ID** 的值

要添加端点,请运行:

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

要删除端点,请运行:

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

向组织添加/删除私有端点:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## 将"端点 ID"添加到 ClickHouse 服务允许列表 {#add-endpoint-id-to-services-allow-list}

您需要为每个应通过 Private Service Connect 访问的实例,将端点 ID 添加到允许列表中。

### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中,打开您想要通过 Private Service Connect 连接的服务,然后导航到 **Settings**。输入从[添加 Private Service Connection](#adding-a-private-service-connection)步骤中获取的 `Endpoint ID`。点击 **Create endpoint**。

:::note
如果您想要允许从现有的 Private Service Connect 连接进行访问,请使用现有端点下拉菜单。
:::

<Image
  img={gcp_privatelink_pe_filters}
  size='lg'
  alt='私有端点筛选器'
  border
/>

### 选项 2:API {#option-2-api-2}

在运行任何命令之前,请设置以下环境变量:

将下面的 **ENDPOINT_ID** 替换为从[添加 Private Service Connection](#adding-a-private-service-connection)步骤中获取的 **Endpoint ID** 值

对每个应通过 Private Service Connect 访问的服务执行此操作。

添加:

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

移除:

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

每个启用了 Private Link 的服务都有一个公共端点和一个私有端点。要使用 Private Link 进行连接,您需要使用私有端点,该端点为从[获取用于 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)中获取的 `privateDnsHostname`。

### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

#### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中,导航至 **Settings**。点击 **Set up private endpoint** 按钮。在打开的弹出窗口中,复制 **DNS Name**。

<Image
  img={gcp_privatelink_pe_dns}
  size='lg'
  alt='私有端点 DNS 名称'
  border
/>

#### 选项 2:API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

在此示例中,连接到 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` 主机名的请求将被路由到 Private Service Connect。而 `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` 将通过互联网路由。


## 故障排除 {#troubleshooting}

### 测试 DNS 配置 {#test-dns-setup}

DNS_NAME - 使用[获取 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的 `privateDnsHostname`

```bash
nslookup $DNS_NAME
```

```response
非权威应答:
...
Address: 10.128.0.2
```

### 连接被对端重置 {#connection-reset-by-peer}

- 最可能的原因是端点 ID 未添加到服务允许列表。请重新查看[_将端点 ID 添加到服务允许列表_步骤](#add-endpoint-id-to-services-allow-list)。

### 测试连接 {#test-connectivity}

如果使用 PSC 链接连接时遇到问题,请使用 `openssl` 检查连接。确保 Private Service Connect 端点状态为 `Accepted`:

OpenSSL 应该能够连接(在输出中查看 CONNECTED)。出现 `errno=104` 是正常的。

DNS_NAME - 使用[获取 Private Service Connect 的 GCP 服务附件](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)步骤中的 `privateDnsHostname`

```bash
openssl s_client -connect ${DNS_NAME}:9440
```


```response
# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
无可用的对等证书
---
未发送客户端证书 CA 名称
---
SSL 握手已读取 0 字节并写入 335 字节
验证: OK
---
New, (NONE), Cipher is (NONE)
不支持安全重新协商
压缩: NONE
扩展: NONE
未协商 ALPN
未发送早期数据
验证返回码: 0 (ok)
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

假设您尝试在 ClickHouse Cloud 中使用 [MySQL](/sql-reference/table-functions/mysql) 或 [PostgreSQL](/sql-reference/table-functions/postgresql) 表函数,并连接到托管在 GCP 中的数据库。GCP PSC 无法用于安全地建立此连接。PSC 是单向连接,仅允许您的内部网络或 GCP VPC 安全地连接到 ClickHouse Cloud,但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [GCP Private Service Connect 文档](https://cloud.google.com/vpc/docs/private-service-connect):

> 面向服务的设计:生产者服务通过负载均衡器发布,向消费者 VPC 网络公开单个 IP 地址。访问生产者服务的消费者流量是单向的,只能访问服务 IP 地址,而无法访问整个对等 VPC 网络。

为此,请配置您的 GCP VPC 防火墙规则,以允许从 ClickHouse Cloud 到您的内部/私有数据库服务的连接。请查看 [ClickHouse Cloud 区域的默认出口 IP 地址](/manage/data-sources/cloud-endpoints-api)以及[可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。


## 更多信息 {#more-information}

如需了解更详细的信息,请访问 [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)。
