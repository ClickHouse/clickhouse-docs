---
'title': 'AWS PrivateLink'
'description': '本文档描述了如何使用 AWS PrivateLink 连接到 ClickHouse Cloud。'
'slug': '/manage/security/aws-privatelink'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import aws_private_link_pecreate from '@site/static/images/cloud/security/aws-privatelink-pe-create.png';
import aws_private_link_endpoint_settings from '@site/static/images/cloud/security/aws-privatelink-endpoint-settings.png';
import aws_private_link_select_vpc from '@site/static/images/cloud/security/aws-privatelink-select-vpc-and-subnets.png';
import aws_private_link_vpc_endpoint_id from '@site/static/images/cloud/security/aws-privatelink-vpc-endpoint-id.png';
import aws_private_link_endpoints_menu from '@site/static/images/cloud/security/aws-privatelink-endpoints-menu.png';
import aws_private_link_modify_dnsname from '@site/static/images/cloud/security/aws-privatelink-modify-dns-name.png';
import pe_remove_private_endpoint from '@site/static/images/cloud/security/pe-remove-private-endpoint.png';
import aws_private_link_pe_filters from '@site/static/images/cloud/security/aws-privatelink-pe-filters.png';
import aws_private_link_ped_nsname from '@site/static/images/cloud/security/aws-privatelink-pe-dns-name.png';


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、您的本地系统和 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露于公共互联网。本文档概述了使用 AWS PrivateLink 连接到 ClickHouse Cloud 的步骤。

要仅通过 AWS PrivateLink 地址限制对 ClickHouse Cloud 服务的访问，请按照 ClickHouse Cloud [IP 访问列表](/cloud/security/setting-ip-filters) 中提供的说明操作。

:::note
ClickHouse Cloud 目前支持 [跨区域 PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) 的测试版。
:::


**请完成以下操作以启用 AWS PrivateLink**：
1. 获取端点“服务名称”。
1. 创建 AWS 端点。
1. 将“端点 ID”添加到 ClickHouse Cloud 组织。
1. 将“端点 ID”添加到 ClickHouse 服务允许列表。


可以在 [这里](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) 找到 Terraform 示例。


## 注意 {#attention}
ClickHouse 尝试将您的服务分组，以在 AWS 区域内重用相同的发布 [服务端点](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)。但是，这种分组并不总是保证，特别是当您将服务分散到多个 ClickHouse 组织时。
如果您已经为 ClickHouse 组织中的其他服务配置了 PrivateLink，通常可以跳过大部分步骤，因为可以直接进入最后一步：[将 ClickHouse“端点 ID”添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)。


## 前提条件 {#prerequisites}

在开始之前，您需要：

1. 您的 AWS 账户。
1. 具有必要权限以在 ClickHouse 端创建和管理私有端点的 [ClickHouse API 密钥](/cloud/manage/openapi)。

## 步骤 {#steps}

按照以下步骤通过 AWS PrivateLink 连接您的 ClickHouse Cloud 服务。

### 获取端点“服务名称” {#obtain-endpoint-service-info}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您想要通过 PrivateLink 连接的服务，然后导航到 **设置** 菜单。

<Image img={aws_private_link_pecreate} size="md" alt="私有端点" border />

记下 `服务名称` 和 `DNS 名称`，然后 [移动到下一步](#create-aws-endpoint)。

#### 选项 2：API {#option-2-api}

首先，在运行任何命令之前设置以下环境变量：

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

通过按区域、提供者和服务名称进行过滤，获取您的 ClickHouse `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取您的 PrivateLink 配置的 `endpointServiceId` 和 `privateDnsHostname`：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

此命令应该返回类似于以下内容：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

记下 `endpointServiceId` 和 `privateDnsHostname`， [移动到下一步](#create-aws-endpoint)。

### 创建 AWS 端点 {#create-aws-endpoint}

:::important
本节介绍通过 AWS PrivateLink 配置 ClickHouse 的特定细节。提供了 AWS 特定步骤以供参考，但这些步骤可能会随着时间而变化，且 AWS 云提供商不会发出通知。请根据您的具体用例考虑 AWS 配置。  

请注意，ClickHouse 并不负责配置所需的 AWS VPC 端点、安全组规则或 DNS 记录。  

如果您在设置 PrivateLink 时以前启用了“私有 DNS 名称”，并且在通过 PrivateLink 配置新服务时遇到困难，请联系 ClickHouse 支持。有关 AWS 配置任务的其他问题，请直接联系 AWS 支持。
:::

#### 选项 1：AWS 控制台 {#option-1-aws-console}

打开 AWS 控制台并转到 **VPC** → **端点** → **创建端点**。

选择 **使用 NLB 和 GWLB 的端点服务**，并在 **服务名称** 字段中使用您从 [获取端点“服务名称” ](#obtain-endpoint-service-info) 步骤中获得的 `服务名称`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup>。单击 **验证服务**：

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink 端点设置" border/>

如果您想通过 PrivateLink 建立跨区域连接，请启用“跨区域端点”复选框，并指定服务区域。服务区域是 ClickHouse 实例运行的地方。

如果出现“无法验证服务名称。”错误，请联系客户支持请求将新区域添加到支持区域列表中。

接下来，选择您的 VPC 和子网：

<Image img={aws_private_link_select_vpc} size="md" alt="选择 VPC 和子网" border />

作为可选步骤，分配安全组/标签：

:::note
确保安全组中开放 `443`、`8443`、`9440`、`3306` 端口。
:::

创建 VPC 端点后，请记下 `端点 ID` 值；您将在后续步骤中需要它。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC 端点 ID" border/>

#### 选项 2：AWS CloudFormation {#option-2-aws-cloudformation}

接下来，您需要使用您从 [获取端点“服务名称” ](#obtain-endpoint-service-info) 步骤中获得的 `服务名称`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup> 创建一个 VPC 端点。
确保使用正确的子网 ID、安全组和 VPC ID。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId), pls see above>
      VpcId: vpc-vpc_id
      SubnetIds:
        - subnet-subnet_id1
        - subnet-subnet_id2
        - subnet-subnet_id3
      SecurityGroupIds:
        - sg-security_group_id1
        - sg-security_group_id2
        - sg-security_group_id3
```

创建 VPC 端点后，请记下 `端点 ID` 值；您将在后续步骤中需要它。

#### 选项 3：Terraform {#option-3-terraform}

以下的 `service_name` 是您从 [获取端点“服务名称” ](#obtain-endpoint-service-info) 步骤中获得的 `服务名称`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup>。

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<pls see comment above>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Optional) If specified, the VPC endpoint will connect to the service in the provided region. Define it for multi-regional PrivateLink connections."
}
```

创建 VPC 端点后，请记下 `端点 ID` 值；您将在后续步骤中需要它。

#### 为端点设置私有 DNS 名称 {#set-private-dns-name-for-endpoint}

:::note
有多种配置 DNS 的方法。请根据您的具体用例设置 DNS。
:::

您需要将从 [获取端点“服务名称” ](#obtain-endpoint-service-info) 步骤中获取的“DNS 名称”指向 AWS 端点网络接口。这确保您 VPC/网络内的服务/组件可以正确解析它。

### 将“端点 ID”添加到 ClickHouse 服务允许列表 {#add-endpoint-id-to-services-allow-list}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

要添加，请导航到 ClickHouse Cloud 控制台，打开您希望通过 PrivateLink 连接的服务，然后导航到 **设置**。单击 **设置私有端点** 以打开私有端点设置。输入从 [创建 AWS 端点](#create-aws-endpoint) 步骤中获得的 `端点 ID`。点击“创建端点”。

:::note
如果您想允许来自现有 PrivateLink 连接的访问，请使用现有端点下拉菜单。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="私有端点过滤器" border/>

要删除，请导航到 ClickHouse Cloud 控制台，找到该服务，然后导航到服务的 **设置**，找到您想要删除的端点。从端点列表中将其删除。

#### 选项 2：API {#option-2-api-2}

您需要将端点 ID 添加到应使用 PrivateLink 访问的每个实例的允许列表中。

使用来自 [创建 AWS 端点](#create-aws-endpoint) 步骤的数据设置 `ENDPOINT_ID` 环境变量。

在运行任何命令之前设置以下环境变量：

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

要将端点 ID 添加到允许列表：

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

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

要从允许列表中删除端点 ID：

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

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

### 使用 PrivateLink 访问实例 {#accessing-an-instance-using-privatelink}

每个启用 Private Link 的服务都有一个公共和私有端点。要通过 Private Link 连接，您需要使用私有端点，该端点将是从 [获取端点“服务名称"](#obtain-endpoint-service-info) 获取的 `privateDnsHostname`<sup>API</sup> 或 `DNS 名称`<sup>console</sup>。

#### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

##### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航到 **设置**。单击 **设置私有端点** 按钮。在打开的飞出菜单中，复制 **DNS 名称**。

<Image img={aws_private_link_ped_nsname} size="md" alt="私有端点 DNS 名称" border />

##### 选项 2：API {#option-2-api-3}

在运行任何命令之前设置以下环境变量：

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

您可以从 [步骤](#option-2-api) 中检索 `INSTANCE_ID`。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

这应该输出类似于：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

在此示例中，通过 `privateDnsHostname` 主机名连接将路由到 PrivateLink，但通过 `endpointServiceId` 主机名的连接将通过互联网路由。

## 故障排除 {#troubleshooting}

### 一个区域内的多个 PrivateLinks {#multiple-privatelinks-in-one-region}

在大多数情况下，您只需为每个 VPC 创建一个单一的端点服务。此端点可以将请求从 VPC 路由到多个 ClickHouse Cloud 服务。
请参见 [这里](#attention)

### 连接到私有端点超时 {#connection-to-private-endpoint-timed-out}

- 请将安全组附加到 VPC 端点。
- 请验证附加到端点的安全组上的 `inbound` 规则，并允许 ClickHouse 端口。
- 请验证用于连通性测试的 VM 上附加的安全组的 `outbound` 规则，并允许对 ClickHouse 端口的连接。

### 私有主机名：未找到主机地址 {#private-hostname-not-found-address-of-host}

- 请检查您的 DNS 配置。

### 连接被对等方重置 {#connection-reset-by-peer}

- 端点 ID 可能未添加到服务允许列表中，请访问 [步骤](#add-endpoint-id-to-services-allow-list)。

### 检查端点过滤器 {#checking-endpoint-filters}

在运行任何命令之前设置以下环境变量：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

您可以从 [步骤](#option-2-api) 中检索 `INSTANCE_ID`。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### 连接到远程数据库 {#connecting-to-a-remote-database}

假设您正在尝试在 ClickHouse Cloud 中使用 [MySQL](../../sql-reference/table-functions/mysql.md) 或 [PostgreSQL](../../sql-reference/table-functions/postgresql.md) 表函数并连接到托管在 Amazon Web Services (AWS) VPC 中的数据库。不能使用 AWS PrivateLink 安全地启用此连接。PrivateLink 是单向的、单向连接。它允许您的内部网络或 Amazon VPC 安全连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [AWS PrivateLink 文档](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)：

> 当您有一个客户端/服务器设置时，想让一个或多个消费者 VPC 对服务提供者 VPC 中的特定服务或一组实例具有单向访问权限时，使用 AWS PrivateLink。只有消费者 VPC 中的客户端可以发起与服务提供者 VPC 中的服务的连接。

为此，配置您的 AWS 安全组以允许 ClickHouse Cloud 连接到您内部/私有数据库服务。查看 [ClickHouse Cloud 区域的默认出站 IP 地址](/manage/security/cloud-endpoints-api)，以及 [可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。
