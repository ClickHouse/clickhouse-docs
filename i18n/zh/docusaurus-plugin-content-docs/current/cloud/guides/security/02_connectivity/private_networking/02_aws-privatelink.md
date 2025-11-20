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


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

你可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在不将流量暴露到公共互联网的情况下，在 VPC、AWS 服务、本地系统与 ClickHouse Cloud 之间建立安全连接。本文档说明了使用 AWS PrivateLink 连接到 ClickHouse Cloud 的具体步骤。

若希望只允许通过 AWS PrivateLink 地址访问你的 ClickHouse Cloud 服务，请按照 ClickHouse Cloud 文档中 [IP Access Lists](/cloud/security/setting-ip-filters) 的说明进行配置。

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
费用说明：AWS 会就跨区域数据传输收取费用，定价请见[此处](https://aws.amazon.com/privatelink/pricing/)。
:::

**请完成以下步骤以启用 AWS PrivateLink**：
1. 获取 Endpoint 的“Service name”。
1. 创建 AWS Endpoint。
1. 将“Endpoint ID”添加到 ClickHouse Cloud 组织。
1. 将“Endpoint ID”添加到 ClickHouse 服务允许列表。

可在[此处](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)找到 Terraform 示例。



## 重要注意事项 {#considerations}

ClickHouse 会尝试对您的服务进行分组,以便在 AWS 区域内重用相同的已发布[服务端点](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)。但是,这种分组并不保证,特别是当您将服务分散在多个 ClickHouse 组织中时。
如果您已经为 ClickHouse 组织中的其他服务配置了 PrivateLink,由于这种分组机制,您通常可以跳过大部分步骤,直接进入最后一步:将 ClickHouse "端点 ID" 添加到 ClickHouse 服务允许列表中。


## 此流程的前提条件 {#prerequisites}

在开始之前，您需要准备：

1. 您的 AWS 账户。
1. 具有在 ClickHouse 端创建和管理私有端点所需权限的 [ClickHouse API 密钥](/cloud/manage/openapi)。


## 步骤 {#steps}

按照以下步骤通过 AWS PrivateLink 连接您的 ClickHouse Cloud 服务。

### 获取端点"服务名称" {#obtain-endpoint-service-info}

#### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中,打开您想要通过 PrivateLink 连接的服务,然后导航到 **Settings** 菜单。

<Image
  img={aws_private_link_pecreate}
  size='md'
  alt='私有端点'
  border
/>

记下 `Service name` 和 `DNS name`,然后[继续下一步](#create-aws-endpoint)。

#### 选项 2:API {#option-2-api}

首先,在运行任何命令之前设置以下环境变量:

```shell
REGION=<您的区域代码,使用 AWS 格式,例如:us-west-2>
PROVIDER=aws
KEY_ID=<您的 ClickHouse 密钥 ID>
KEY_SECRET=<您的 ClickHouse 密钥密文>
ORG_ID=<您的 ClickHouse 组织 ID>
SERVICE_NAME=<您的 ClickHouse 服务名称>
```

通过按区域、提供商和服务名称筛选来获取您的 ClickHouse `INSTANCE_ID`:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取用于 PrivateLink 配置的 `endpointServiceId` 和 `privateDnsHostname`:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

此命令应返回类似以下内容:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

记下 `endpointServiceId` 和 `privateDnsHostname`,然后[继续下一步](#create-aws-endpoint)。

### 创建 AWS 端点 {#create-aws-endpoint}

:::important
本节介绍通过 AWS PrivateLink 配置 ClickHouse 的特定细节。AWS 相关步骤仅作为参考指导您查找相关内容,但这些步骤可能会随时间变化而不另行通知。请根据您的具体使用场景考虑 AWS 配置。

请注意,ClickHouse 不负责配置所需的 AWS VPC 端点、安全组规则或 DNS 记录。

如果您之前在设置 PrivateLink 时启用了"私有 DNS 名称",并且在通过 PrivateLink 配置新服务时遇到困难,请联系 ClickHouse 支持。对于与 AWS 配置任务相关的任何其他问题,请直接联系 AWS Support。
:::

#### 选项 1:AWS 控制台 {#option-1-aws-console}

打开 AWS 控制台并转到 **VPC** → **Endpoints** → **Create endpoints**。

选择 **Endpoint services that use NLBs and GWLBs**,并在 **Service Name** 字段中使用您从[获取端点"服务名称"](#obtain-endpoint-service-info)步骤中获得的 `Service name`<sup>控制台</sup>或 `endpointServiceId`<sup>API</sup>。点击 **Verify service**:

<Image
  img={aws_private_link_endpoint_settings}
  size='md'
  alt='AWS PrivateLink 端点设置'
  border
/>

如果您想通过 PrivateLink 建立跨区域连接,请启用"Cross region endpoint"复选框并指定服务区域。服务区域是 ClickHouse 实例运行的位置。

如果您收到"Service name could not be verified."错误,请联系客户支持以请求将新区域添加到支持的区域列表中。

接下来,选择您的 VPC 和子网:

<Image
  img={aws_private_link_select_vpc}
  size='md'
  alt='选择 VPC 和子网'
  border
/>

作为可选步骤,分配安全组/标签:

:::note
确保在安全组中允许端口 `443`、`8443`、`9440`、`3306`。
:::

创建 VPC 端点后,记下 `Endpoint ID` 值;您将在后续步骤中需要它。

<Image
  img={aws_private_link_vpc_endpoint_id}
  size='md'
  alt='VPC 端点 ID'
  border
/>

#### 选项 2:AWS CloudFormation {#option-2-aws-cloudformation}


接下来,您需要使用从[获取端点"Service name"](#obtain-endpoint-service-info)步骤中获得的 `Service name`<sup>控制台</sup> 或 `endpointServiceId`<sup>API</sup> 来创建 VPC 端点。
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

创建 VPC 端点后,请记录 `Endpoint ID` 值;您将在后续步骤中用到它。

#### 选项 3:Terraform {#option-3-terraform}

下面的 `service_name` 是您从[获取端点"Service name"](#obtain-endpoint-service-info)步骤中获得的 `Service name`<sup>控制台</sup> 或 `endpointServiceId`<sup>API</sup>

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
  service_region      = "(可选)如果指定,VPC 端点将连接到所提供区域中的服务。为多区域 PrivateLink 连接定义此参数。"
}
```

创建 VPC 端点后,请记录 `Endpoint ID` 值;您将在后续步骤中用到它。

#### 为端点设置私有 DNS 名称 {#set-private-dns-name-for-endpoint}

:::note
配置 DNS 有多种方式。请根据您的具体使用场景设置 DNS。
:::

您需要将从[获取端点"Service name"](#obtain-endpoint-service-info)步骤中获取的"DNS name"指向 AWS 端点网络接口。这可确保您的 VPC/网络中的服务/组件能够正确解析它。

### 将"Endpoint ID"添加到 ClickHouse 服务允许列表 {#add-endpoint-id-to-services-allow-list}

#### 选项 1:ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

要添加端点,请导航到 ClickHouse Cloud 控制台,打开您想要通过 PrivateLink 连接的服务,然后导航到**设置**。点击**设置私有端点**以打开私有端点设置。输入从[创建 AWS 端点](#create-aws-endpoint)步骤中获得的 `Endpoint ID`。点击"创建端点"。

:::note
如果您想允许从现有 PrivateLink 连接访问,请使用现有端点下拉菜单。
:::

<Image
  img={aws_private_link_pe_filters}
  size='md'
  alt='私有端点筛选器'
  border
/>

要删除端点,请导航到 ClickHouse Cloud 控制台,找到该服务,然后导航到该服务的**设置**,找到您想要删除的端点,将其从端点列表中删除。

#### 选项 2:API {#option-2-api-2}

您需要为每个应通过 PrivateLink 访问的实例将端点 ID 添加到允许列表。

使用[创建 AWS 端点](#create-aws-endpoint)步骤中的数据设置 `ENDPOINT_ID` 环境变量。

在运行任何命令之前设置以下环境变量:

```bash
REGION=<使用 AWS 格式的区域代码,例如:us-west-2>
PROVIDER=aws
KEY_ID=<您的 ClickHouse 密钥 ID>
KEY_SECRET=<您的 ClickHouse 密钥密文>
ORG_ID=<您的 ClickHouse 组织 ID>
SERVICE_NAME=<您的 ClickHouse 服务名称>
```

要将端点 ID 添加到允许列表:

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


从允许列表中删除端点 ID：

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

每个启用了 Private Link 的服务都有一个公共端点和一个私有端点。要使用 Private Link 进行连接,需要使用私有端点,该端点为从[获取端点"服务名称"](#obtain-endpoint-service-info)中获取的 `privateDnsHostname`<sup>API</sup> 或 `DNS Name`<sup>控制台</sup>。

#### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

##### 方式 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中,导航至 **Settings**。点击 **Set up private endpoint** 按钮。在打开的浮窗中,复制 **DNS Name**。

<Image
  img={aws_private_link_ped_nsname}
  size='md'
  alt='私有端点 DNS 名称'
  border
/>

##### 方式 2：API {#option-2-api-3}

在运行任何命令之前,请设置以下环境变量：

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

您可以从[步骤](#option-2-api)中获取 `INSTANCE_ID`。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

输出结果应类似于：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

在此示例中,通过 `privateDnsHostname` 主机名的连接将路由到 PrivateLink,而通过 `endpointServiceId` 主机名的连接将通过互联网路由。


## 故障排除 {#troubleshooting}

### 一个区域中的多个 PrivateLink {#multiple-privatelinks-in-one-region}

在大多数情况下,每个 VPC 只需创建一个端点服务。该端点可以将来自 VPC 的请求路由到多个 ClickHouse Cloud 服务。
请参阅[此处](#considerations)

### 连接私有端点超时 {#connection-to-private-endpoint-timed-out}

- 请将安全组附加到 VPC 端点。
- 请验证附加到端点的安全组的 `inbound` 规则,并允许 ClickHouse 端口。
- 请验证附加到用于连接测试的虚拟机的安全组的 `outbound` 规则,并允许连接到 ClickHouse 端口。

### 私有主机名:未找到主机地址 {#private-hostname-not-found-address-of-host}

- 请检查您的 DNS 配置

### 连接被对端重置 {#connection-reset-by-peer}

- 很可能端点 ID 未添加到服务允许列表,请访问[此步骤](#add-endpoint-id-to-services-allow-list)

### 检查端点过滤器 {#checking-endpoint-filters}

在运行任何命令之前,请设置以下环境变量:

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥密文>
ORG_ID=<请设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

您可以从[此步骤](#option-2-api)中获取 `INSTANCE_ID`。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### 连接到远程数据库 {#connecting-to-a-remote-database}

假设您尝试在 ClickHouse Cloud 中使用 [MySQL](/sql-reference/table-functions/mysql) 或 [PostgreSQL](/sql-reference/table-functions/postgresql) 表函数,并连接到托管在 Amazon Web Services (AWS) VPC 中的数据库。AWS PrivateLink 无法用于安全地建立此连接。PrivateLink 是单向连接。它允许您的内部网络或 Amazon VPC 安全地连接到 ClickHouse Cloud,但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [AWS PrivateLink 文档](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html):

> 当您有客户端/服务器设置,希望允许一个或多个消费者 VPC 单向访问服务提供商 VPC 中的特定服务或实例集时,请使用 AWS PrivateLink。只有消费者 VPC 中的客户端可以发起到服务提供商 VPC 中服务的连接。

为此,请配置您的 AWS 安全组以允许从 ClickHouse Cloud 到您的内部/私有数据库服务的连接。请查看 [ClickHouse Cloud 区域的默认出口 IP 地址](/manage/data-sources/cloud-endpoints-api)以及[可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。
