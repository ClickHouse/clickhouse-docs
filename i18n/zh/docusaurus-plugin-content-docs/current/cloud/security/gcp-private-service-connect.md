---
title: 'GCP 私有服务连接'
description: '本文档描述了如何使用 Google Cloud Platform (GCP) 私有服务连接 (PSC) 连接到 ClickHouse Cloud，以及如何使用 ClickHouse Cloud IP 访问列表禁用从 GCP PSC 地址以外的地址访问您的 ClickHouse Cloud 服务。'
sidebar_label: 'GCP 私有服务连接'
slug: /manage/security/gcp-private-service-connect
---

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

## 私有服务连接 {#private-service-connect}

私有服务连接 (PSC) 是 Google Cloud 的网络功能，允许消费者在其虚拟私有云 (VPC) 网络内部私密地访问托管服务。同样，它允许托管服务的生产者在自己的独立 VPC 网络中托管这些服务，并为其消费者提供私有连接。

服务生产者通过创建私有服务连接服务将其应用发布给消费者。服务消费者直接通过这些私有服务连接类型访问这些私有服务连接服务。

<img src={gcp_psc_overview} alt="私有服务连接概述" />

:::important
默认情况下，即使 PSC 连接已获批准并建立，ClickHouse 服务也不可通过私有服务连接访问；您需要通过完成下面的 [步骤](#add-endpoint-id-to-services-allow-list) 显式将 PSC ID 添加到实例级的允许列表中。
:::

:::note
GCP 私有服务连接仅可在 ClickHouse Cloud 生产服务上启用。
:::

不支持跨区域连接。生产者和消费者区域必须相同。然而，您可以通过在私有服务连接 (PSC) 级别启用 [全球访问](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) 从 VPC 内的其他区域进行连接。

:::note
使用私有服务连接全球访问的重要考虑事项：
1. 使用全球访问的区域必须属于同一个 VPC。
2. 全球访问必须在 PSC 级别显式启用（请参阅下面的截图）。
3. 确保您的防火墙设置不会阻止来自其他区域的 PSC 访问。
4. 请注意，您可能会产生 GCP 区域间数据传输费用。

该过程分为四个步骤：

1. 获取 GCP 服务附加组件以进行私有服务连接。
1. 创建服务端点。
1. 将端点 ID 添加到 ClickHouse Cloud 组织中。
1. 将端点 ID 添加到服务的允许列表中。

:::note
在下面的示例中，我们将使用：
 - GCP 区域: `us-central1`
 - GCP 项目（客户 GCP 项目）: `my-gcp-project`
 - 客户 GCP 项目中的 GCP 私有 IP 地址: `10.128.0.2`
 - 客户 GCP 项目中的 GCP VPC: `default`

下面提供代码示例，以展示如何在 ClickHouse Cloud 服务中设置私有服务连接。
:::

## 开始之前 {#before-you-get-started}

您需要检索有关您的 ClickHouse Cloud 服务的信息。您可以通过 ClickHouse Cloud 控制台或 ClickHouse API 完成此操作。如果您打算使用 ClickHouse API，请在继续之前设置以下环境变量：

```bash
export REGION=us-central1
export PROVIDER=gcp
export KEY_ID=<Key ID>
export KEY_SECRET=<Key secret>
export ORG_ID=<ClickHouse organization ID>
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1)
```
:::note
 - 您可以从 ClickHouse 控制台（组织 -> 组织详情）中检索到您的组织 ID。
 - 您可以 [创建新密钥](/cloud/manage/openapi) 或使用现有密钥。
:::

## 获取 GCP 服务附加组件和私有服务连接的 DNS 名称 {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### 选项 1: ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您希望通过私有服务连接连接的服务，然后打开 **设置** 菜单。单击 **设置私有端点** 按钮。记下 **服务名称** (`endpointServiceId`) 和 **DNS 名称** (`privateDnsHostname`)。您将在接下来的步骤中使用它们。

<img src={gcp_privatelink_pe_create} alt="私有端点" />

### 选项 2: API {#option-2-api}

:::note
您需要在该区域部署至少一个实例才能执行此步骤。
:::

获取 GCP 服务附加组件和私有服务连接的 DNS 名称：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xb164akwxw.us-central1.p.gcp.clickhouse.cloud"
}
```

记下 `endpointServiceId` 和 `privateDnsHostname`。您将在接下来的步骤中使用它们。

## 创建服务端点 {#create-service-endpoint}

在本节中，我们将创建一个服务端点。

### 添加私有服务连接 {#adding-a-private-service-connection}

首先，我们将创建一个私有服务连接。

#### 选项 1: 使用 Google Cloud 控制台 {#option-1-using-google-cloud-console}

在 Google Cloud 控制台中，导航到 **网络服务 -> 私有服务连接**。

<img src={gcp_psc_open} alt="在 Google Cloud 控制台中打开私有服务连接" />

通过单击 **连接端点** 按钮打开私有服务连接创建对话框。

- **目标**: 使用 **已发布服务**
- **目标服务**: 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `endpointServiceId`。
- **端点名称**: 为 PSC **端点名称** 设置一个名称。
- **网络/子网络/IP 地址**: 选择要用于连接的网络。您需要为私有服务连接端点创建一个 IP 地址或使用现有的。在我们的示例中，我们预先创建了一个名为 **your-ip-address** 的地址，并分配了 IP 地址 `10.128.0.2`。
- 为使端点可从任何区域访问，您可以启用 **启用全球访问** 复选框。

<img src={gcp_psc_enable_global_access} alt="为私有服务连接启用全球访问" />

要创建 PSC 端点，请使用 **添加端点** 按钮。

**状态** 列将在连接获批准后从 **待处理** 更改为 **已接受**。

<img src={gcp_psc_copy_connection_id} alt="复制 PSC 连接 ID" />

复制 ***PSC 连接 ID***，我们将在接下来的步骤中将其用作 ***端点 ID***。

#### 选项 2: 使用 Terraform {#option-2-using-terraform}

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
  # 服务附加组件
  target = "https://www.googleapis.com/compute/v1/$TARGET" # 见下面的说明
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "将 GCP PSC 连接 ID 添加到服务允许列表中。"
}
```

:::note
TARGET - 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `endpointServiceId`
:::

## 设置 DNS {#setting-up-dns}

提供了两种选项，使用 Google Cloud 控制台和使用 `gcloud` CLI。

### 选项 1: 使用 Google Cloud 控制台 {#option-1-using-the-google-cloud-console}

- 从 **支持的区域** 创建一个私有 DNS 区域。
- 打开 **网络服务 -> Cloud DNS**。
- 选择 **创建区域**：

<img src={gcp_psc_create_zone} alt="为 PSC 创建 DNS 区域" />

在区域类型对话框中，设置：

- 区域类型: **私有**
- 区域名称: 输入适当的区域名称。
- DNS 名称: 使用 **支持的区域** 表中您所在区域的 **私有 DNS 域** 列。
- 网络: 将 DNS 区域附加到您计划用于通过 PSC 连接到 ClickHouse Cloud 的网络。

<img src={gcp_psc_zone_type} alt="私有 DNS 区域类型选择" />

#### 在私有 DNS 区域中创建 DNS 记录 {#create-dns-record-in-private-dns-zone}

将其指向在 [添加私有服务连接](#adding-a-private-service-connection) 步骤中创建的 IP 地址。

<img src={gcp_psc_dns_record} alt="为 PSC 创建 DNS 记录" />

### 选项 2: 使用 `gcloud` CLI {#option-2-using-the-gcloud-cli}

#### 创建 DNS 区域 {#create-dns-zone}

```bash
gcloud dns \
  --project=my-gcp-project \
  managed-zones create ch-cloud-us-central1 \
  --description="私有 DNS 区域用于 PSC" \
  --dns-name="us-central1.p.gcp.clickhouse.cloud." \
  --visibility="private" \
  --networks="https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
```

#### 创建 DNS 记录 {#create-dns-record}

```bash
gcloud dns \
  --project=my-gcp-project \
  record-sets create $DNS_RECORD \
  --zone="ch-cloud-us-central1" \
  --type="A" \
  --ttl="300" \
  --rrdatas="10.128.0.2"
```
:::note
DNS_RECORD - 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `privateDnsHostname`
:::

### 选项 3: 使用 Terraform {#option-3-using-terraform}

```json
variable "ch_dns_record" {
  type    = string
  default = "$DNS_NAME" # 见下面的说明
}

resource "google_dns_managed_zone" "clickhouse_cloud_private_service_connect" {
  description   = "用于通过私有服务连接访问 ClickHouse Cloud 的私有 DNS 区域"
  dns_name      = "${var.region}.p.gcp.clickhouse.cloud."
  force_destroy = false
  name          = "clickhouse-cloud-private-service-connect-${var.region}"
  visibility    = "private"
}

resource "google_dns_record_set" "psc_dns_record" {
  managed_zone = google_dns_managed_zone.clickhouse_cloud_private_service_connect.name
  name         = "${var.ch_dns_record}"
  type         = "A"
  rrdatas      = [google_compute_address.psc_endpoint_ip.address]
}
```

:::note
DNS_NAME - 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `privateDnsHostname`
:::

## 验证 DNS 设置 {#verify-dns-setup}

DNS_RECORD - 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `privateDnsHostname`

```bash
ping $DNS_RECORD
```

## 将端点 ID 添加到 ClickHouse Cloud 组织 {#add-endpoint-id-to-clickhouse-cloud-organization}

### 选项 1: ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到您的组织，请继续进行 [将端点 ID 添加到服务的允许列表](#add-endpoint-id-to-services-allow-list) 步骤。使用 ClickHouse Cloud 控制台将 `PSC 连接 ID` 添加到服务允许列表会自动将其添加到组织中。

要删除一个端点，请打开 **组织详情 -> 私有端点**，然后单击删除按钮以移除该端点。

<img src={gcp_pe_remove_private_endpoint} alt="从 ClickHouse Cloud 移除私有端点" />

### 选项 2: API {#option-2-api-1}

在运行任何命令之前，请设置这些环境变量：

使用 [添加私有服务连接](#adding-a-private-service-connection) 步骤中的 **端点 ID** 替换下面的 `ENDPOINT_ID`

要添加一个端点，请运行：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "一个 GCP 私有端点",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

要删除一个端点，请运行：

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

添加/删除私有端点到组织：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## 将端点 ID 添加到服务的允许列表 {#add-endpoint-id-to-services-allow-list}

您需要将端点 ID 添加到每个应通过私有服务连接提供的实例的允许列表中。

:::note
此步骤无法对开发服务执行。
:::

### 选项 1: ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中，打开您希望通过私有服务连接连接的服务，然后导航到 **设置**。输入从 [添加私有服务连接](#adding-a-private-service-connection) 步骤中检索到的 `端点 ID`。单击 **创建端点**。

:::note
如果您想允许从现有的私有服务连接访问，请使用现有的端点下拉菜单。
:::

<img src={gcp_privatelink_pe_filters} alt="私有端点过滤器" />

### 选项 2: API {#option-2-api-2}

在运行任何命令之前，请设置这些环境变量：

使用 [添加私有服务连接](#adding-a-private-service-connection) 步骤中的 **端点 ID** 替换下面的 **ENDPOINT_ID**

对每个应通过私有服务连接可用的服务执行。

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
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} -d @pl_config.json | jq
```

## 使用私有服务连接访问实例 {#accessing-instance-using-private-service-connect}

每个配置了私有服务连接过滤器的实例有两个端点：公共和私有。要使用私有服务连接进行连接，您需要使用私有端点，请参见从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `endpointServiceId`

:::note
私有 DNS 主机名仅在您的 GCP VPC 内可用。请勿尝试从位于 GCP VPC 外部的机器上解析该 DNS 主机。
:::

### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

#### 选项 1: ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航到 **设置**。单击 **设置私有端点** 按钮。在打开的弹出窗口中，复制 **DNS 名称**。

<img src={gcp_privatelink_pe_dns} alt="私有端点 DNS 名称" />

#### 选项 2: API {#option-2-api-3}

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

在此示例中，连接到 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` 主机名将路由到私有服务连接。同时，`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` 将通过互联网路由。

## 故障排除 {#troubleshooting}

### 测试 DNS 设置 {#test-dns-setup}

DNS_NAME - 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `privateDnsHostname`

```bash
nslookup $DNS_NAME
```

```response
非权威答复：
...
地址: 10.128.0.2
```

### 连接被对方重置 {#connection-reset-by-peer}

- 很可能，未将端点 ID 添加到服务允许列表中。请重新查看 [_将端点 ID 添加到服务的允许列表_ 步骤](#add-endpoint-id-to-services-allow-list)。

### 测试连接性 {#test-connectivity}

如果您在使用 PSC 链接连接时遇到问题，请使用 `openssl` 检查连接性。确保私有服务连接端点状态为 `已接受`：

OpenSSL 应该能够进行连接（在输出中查看 CONNECTED）。`errno=104` 是预期的。

DNS_NAME - 使用从 [获取 GCP 服务附加组件以进行私有服务连接](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 步骤获得的 `privateDnsHostname`

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
没有对等证书可用
---
未发送客户证书 CA 名称
---
SSL 握手已读取 0 字节并写入 335 字节
验证: OK
---
新（NONE），密码算法为 (NONE)
安全重新协商不支持
压缩：无
扩展：无
没有协商 ALPN
早期数据未发送
验证返回代码: 0 (ok)
```

### 检查端点过滤器 {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### 连接到远程数据库 {#connecting-to-a-remote-database}

假设您正在尝试在 ClickHouse Cloud 中使用 [MySQL](../../sql-reference/table-functions/mysql.md) 或 [PostgreSQL](../../sql-reference/table-functions/postgresql.md) 表函数并连接到您在 GCP 托管的数据库。GCP PSC 不能用于安全地启用此连接。PSC 是单向的、单向连接。它允许您的内部网络或 GCP VPC 安全地连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [GCP 私有服务连接文档](https://cloud.google.com/vpc/docs/private-service-connect):

> 面向服务的设计：生产者服务通过负载均衡器发布，暴露单个 IP 地址给消费者 VPC 网络。访问生产者服务的消费者流量是单向的，只能访问服务 IP 地址，而无法访问整个对等 VPC 网络。

为此，请配置您的 GCP VPC 防火墙规则，允许来自 ClickHouse Cloud 的连接到您的内部/私有数据库服务。查看 [ClickHouse Cloud 区域的默认出口 IP 地址](/manage/security/cloud-endpoints-api)，以及 [可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。

## 更多信息 {#more-information}

有关更详细的信息，请访问 [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services).

