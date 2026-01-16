---
title: 'AWS PrivateLink'
description: '本文档介绍如何通过 AWS PrivateLink 连接 ClickHouse Cloud。'
slug: /manage/security/aws-privatelink
keywords: ['PrivateLink']
doc_type: 'guide'
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

# AWS PrivateLink \\{#aws-privatelink\\}

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在不将流量暴露到公共 Internet 的情况下，在 VPC、AWS 服务、本地系统与 ClickHouse Cloud 之间建立安全连接。本文档概述了使用 AWS PrivateLink 连接到 ClickHouse Cloud 的步骤。

要将对 ClickHouse Cloud 服务的访问限制为仅能通过 AWS PrivateLink 地址进行，请按照 ClickHouse Cloud 提供的 [IP Access Lists](/cloud/security/setting-ip-filters) 指南进行配置。

:::note
ClickHouse Cloud 在以下区域支持 [跨区域 PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)：
- sa-east-1
- il-central-1
- me-central-1
- me-south-1
- eu-central-2
- eu-north-1
- eu-south-2
- eu-west-3
- eu-south-1
- eu-west-2
- eu-west-1
- eu-central-1
- ca-west-1
- ca-central-1
- ap-northeast-1
- ap-southeast-2
- ap-southeast-1
- ap-northeast-2
- ap-northeast-3
- ap-south-1
- ap-southeast-4
- ap-southeast-3
- ap-south-2
- ap-east-1
- af-south-1
- us-west-2
- us-west-1
- us-east-2
- us-east-1
费用说明：AWS 会就跨区域数据传输向用户收费，定价请参见[此处](https://aws.amazon.com/privatelink/pricing/)。
:::

**请完成以下步骤以启用 AWS PrivateLink**：
1. 获取 Endpoint 的 "Service name"。
1. 创建 AWS Endpoint。
1. 将 "Endpoint ID" 添加到 ClickHouse Cloud 组织。
1. 将 "Endpoint ID" 添加到 ClickHouse 服务允许列表。

您可以在[此处](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)找到 Terraform 示例。

## 重要注意事项 \\{#considerations\\}
ClickHouse 会尝试对您的服务进行分组，以便在同一 AWS 区域内复用同一个已发布的[服务端点](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)。但是，并不能保证一定会完成这种分组，尤其是在您将服务分散在多个 ClickHouse 组织中的情况下。

如果您已经在 ClickHouse 组织中为其他服务配置了 PrivateLink，那么通常可以跳过大部分步骤，直接进行最后一步：将 ClickHouse “Endpoint ID” 添加到 ClickHouse 服务允许列表中。

## 本流程的前提条件 \\{#prerequisites\\}

在开始之前，需要准备：

1. AWS 账户。
1. 具有在 ClickHouse 端创建和管理私有端点所需权限的 [ClickHouse API key](/cloud/manage/openapi)。

## 步骤 \\{#steps\\}

按照以下步骤，通过 AWS PrivateLink 连接您的 ClickHouse Cloud 服务。

### 获取端点的 “Service name” \\{#obtain-endpoint-service-info\\}

#### 选项 1：ClickHouse Cloud 控制台 \\{#option-1-clickhouse-cloud-console\\}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后进入 **Settings** 菜单。

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

记下 `Service name` 和 `DNS name`，然后[继续下一步](#create-aws-endpoint)。

#### 选项 2：API \\{#option-2-api\\}

在运行任何命令之前，先设置以下环境变量：

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

通过按区域、服务提供商和服务名称筛选来获取 ClickHouse `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取用于 PrivateLink 配置的 `endpointServiceId` 和 `privateDnsHostname`：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

此命令应返回类似如下的输出：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

记下 `endpointServiceId` 和 `privateDnsHostname`，然后[继续下一步](#create-aws-endpoint)。

### 创建 AWS endpoint \\{#create-aws-endpoint\\}

:::important
本节介绍通过 AWS PrivateLink 配置 ClickHouse 的特定细节。这里提供的 AWS 相关步骤仅作为参考，用于指引您到相应位置进行配置，但这些步骤可能会随 AWS 云服务提供商的变更而在未通知的情况下发生变化。请根据您的具体使用场景规划 AWS 配置。

请注意，ClickHouse 不负责为您配置所需的 AWS VPC endpoint、安全组规则或 DNS 记录。

如果您在设置 PrivateLink 时曾启用 “private DNS names”，并且现在在通过 PrivateLink 配置新服务时遇到问题，请联系 ClickHouse 支持。对于任何其他与 AWS 配置任务相关的问题，请直接联系 AWS Support。
:::

#### 选项 1：AWS 控制台 \\{#option-1-aws-console\\}

打开 AWS 控制台并前往 **VPC** → **Endpoints** → **Create endpoints**。

选择 **Endpoint services that use NLBs and GWLBs**，并在 **Service Name** 字段中使用您在 [Obtain Endpoint &quot;Service name&quot;](#obtain-endpoint-service-info) 步骤中获取的 `Service name`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup>。单击 **Verify service**：

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint 设置" border />

如果您希望通过 PrivateLink 建立跨区域连接，请启用 “Cross region endpoint” 复选框并指定服务区域。服务区域是 ClickHouse 实例运行所在的区域。

如果您收到 “Service name could not be verified.” 错误，请联系客户支持，申请将新区域添加到受支持区域列表。

接下来，选择您的 VPC 和子网：

<Image img={aws_private_link_select_vpc} size="md" alt="选择 VPC 和子网" border />

可选步骤：分配 Security groups/Tags：

:::note
确保在 security group 中放通端口 `443`、`8443`、`9440`、`3306`。
:::

创建 VPC Endpoint 后，记下 `Endpoint ID` 的值；您将在后续步骤中用到它。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border />

#### 选项 2：AWS CloudFormation \\{#option-2-aws-cloudformation\\}

接下来，需要使用在[获取 Endpoint &quot;Service name&quot;](#obtain-endpoint-service-info) 步骤中获得的 `Service name`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup> 来创建 VPC Endpoint。
请确保使用正确的子网 ID、安全组和 VPC ID。

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

创建 VPC Endpoint 后，记下 `Endpoint ID` 的值；你将在后续步骤中用到它。

#### 选项 3：Terraform \\{#option-3-terraform\\}

下面的 `service_name` 指的是你在[获取 Endpoint “Service name”](#obtain-endpoint-service-info) 步骤中获得的 `Service name`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup>

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

在创建 VPC Endpoint 之后，请记下 `Endpoint ID` 的值；后续步骤中会用到。

#### 为 Endpoint 设置私有 DNS 名称 \\{#set-private-dns-name-for-endpoint\\}

:::note
配置 DNS 有多种方式。请根据你的具体使用场景来设置 DNS。
:::

你需要将在[获取 Endpoint &quot;Service name&quot;](#obtain-endpoint-service-info) 步骤中获得的 &quot;DNS name&quot; 指向 AWS Endpoint 的网络接口。这样可以确保 VPC/网络中的服务/组件能够正确解析它。

### 将 &quot;Endpoint ID&quot; 添加到 ClickHouse 服务允许列表 \\{#add-endpoint-id-to-services-allow-list\\}

#### 选项 1：通过 ClickHouse Cloud 控制台 \\{#option-1-clickhouse-cloud-console-2\\}

要添加，请进入 ClickHouse Cloud 控制台，打开你希望通过 PrivateLink 连接的服务，然后进入 **Settings**。点击 **Set up private endpoint** 打开私有 endpoint 设置。输入在 [Create AWS Endpoint](#create-aws-endpoint) 步骤中获取的 `Endpoint ID`，然后点击 &quot;Create endpoint&quot;。

:::note
如果你希望允许来自现有 PrivateLink 连接的访问，请使用“现有 endpoint”下拉菜单。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border />

要移除，请进入 ClickHouse Cloud 控制台，找到对应服务，然后进入该服务的 **Settings**，找到你想要移除的 endpoint，将其从 endpoint 列表中删除。

#### 选项 2：通过 API \\{#option-2-api-2\\}

你需要将 Endpoint ID 添加到每个应通过 PrivateLink 访问的实例的允许列表中。

使用 [Create AWS Endpoint](#create-aws-endpoint) 步骤中的数据设置 `ENDPOINT_ID` 环境变量。

在运行任何命令之前，先设置以下环境变量：

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

若要将 endpoint ID 添加到允许列表：

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

要从允许列表中移除某个端点 ID：

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

### 使用 PrivateLink 访问实例 \\{#accessing-an-instance-using-privatelink\\}

每个启用了 Private Link 的服务都有一个公共端点和一个私有端点。要通过 Private Link 进行连接，需要使用私有端点，该端点对应从 [Obtain Endpoint &quot;Service name&quot;](#obtain-endpoint-service-info) 获取的 `privateDnsHostname`<sup>API</sup> 或 `DNS Name`<sup>console</sup>。

#### 获取私有 DNS 主机名 \\{#getting-private-dns-hostname\\}

##### 选项 1：ClickHouse Cloud 控制台 \\{#option-1-clickhouse-cloud-console-3\\}

在 ClickHouse Cloud 控制台中，进入 **Settings**。点击 **Set up private endpoint** 按钮。在弹出的侧边面板中，复制 **DNS Name**。

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS 名称" border />

##### 选项 2：API \\{#option-2-api-3\\}

在运行任何命令之前，先设置以下环境变量：

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

可在[步骤](#option-2-api)中获取 `INSTANCE_ID`。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

这将输出类似如下的结果：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

在此示例中，使用 `privateDnsHostname` 主机名发起的连接将通过 PrivateLink 路由，而使用 `endpointServiceId` 主机名发起的连接将通过 Internet 路由。

## 故障排查 \\{#troubleshooting\\}

### 在同一区域中使用多个 PrivateLink \\{#multiple-privatelinks-in-one-region\\}

在大多数情况下，你只需要为每个 VPC 创建一个终端节点服务（endpoint service）。该终端节点可以将来自该 VPC 的请求路由到多个 ClickHouse Cloud 服务。\
请参见[此处](#considerations)

### 连接到私有终端节点超时 \\{#connection-to-private-endpoint-timed-out\\}

* 请将安全组（security group）关联到 VPC Endpoint。
* 请检查关联到该 Endpoint 的安全组中的 `inbound` 规则，并放通 ClickHouse 使用的端口。
* 请检查用于连通性测试的 VM 所关联安全组中的 `outbound` 规则，并放通到 ClickHouse 端口的连接。

### 私有主机名：未找到主机地址 \\{#private-hostname-not-found-address-of-host\\}

* 请检查你的 DNS 配置

### 连接被对端重置（Connection reset by peer） \\{#connection-reset-by-peer\\}

* 很可能是 Endpoint ID 尚未添加到服务允许列表（allow list），请访问此[步骤](#add-endpoint-id-to-services-allow-list)

### 检查 endpoint 过滤条件 \\{#checking-endpoint-filters\\}

在运行任何命令之前，请先设置以下环境变量：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

你可以在[此步骤](#option-2-api)中获取 `INSTANCE_ID`。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### 连接到远程数据库 \\{#connecting-to-a-remote-database\\}

假设你尝试在 ClickHouse Cloud 中使用 [MySQL](/sql-reference/table-functions/mysql) 或 [PostgreSQL](/sql-reference/table-functions/postgresql) 表函数，并连接到托管在 Amazon Web Services (AWS) VPC 中的数据库。AWS PrivateLink 无法用于在保证安全的前提下建立此连接。PrivateLink 是一种单向连接。它允许你的内部网络或 Amazon VPC 安全地连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 连接到你的内部网络。

根据 [AWS PrivateLink 文档](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)所述：

> 当你采用客户端/服务器架构，并希望允许一个或多个服务使用方 VPC 对服务提供方 VPC 中的特定服务或一组实例进行单向访问时，请使用 AWS PrivateLink。只有服务使用方 VPC 中的客户端可以向服务提供方 VPC 中的服务发起连接。

要实现这一点，请配置你的 AWS Security Groups，允许从 ClickHouse Cloud 到你的内部/私有数据库服务的连接。查看 [ClickHouse Cloud 各区域的默认出站 IP 地址](/manage/data-sources/cloud-endpoints-api)，以及 [可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。
