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

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、您的本地系统和 ClickHouse Cloud 之间建立安全连接，而无需将流量暴露给公共互联网。本文档概述了使用 AWS PrivateLink 连接到 ClickHouse Cloud 的步骤。

要通过 AWS PrivateLink 地址限制对您的 ClickHouse Cloud 服务的访问，请遵循 ClickHouse Cloud [IP 访问列表](/cloud/security/setting-ip-filters) 中的说明。

:::note
ClickHouse Cloud 目前在测试阶段支持 [跨区域 PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)。
:::


**请完成以下步骤以启用 AWS PrivateLink**：
1. 获取 Endpoint "Service name"。
1. 创建 AWS Endpoint。
1. 将 "Endpoint ID" 添加到 ClickHouse Cloud 组织。
1. 将 "Endpoint ID" 添加到 ClickHouse 服务允许列表。


可以在 [这里](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) 找到 Terraform 示例。


## 注意 {#attention}
ClickHouse 尝试将您的服务分组，以便在 AWS 区域内重用同一发布的 [服务端点](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)。然而，这种分组并不保证，特别是当您将服务分散在多个 ClickHouse 组织中时。
如果您已经为 ClickHouse 组织中的其他服务配置了 PrivateLink，由于该分组，您通常可以跳过大部分步骤，并直接进行最后一步：[将 ClickHouse "Endpoint ID" 添加到 ClickHouse 服务允许列表](#add-endpoint-id-to-services-allow-list)。


## 先决条件 {#prerequisites}

在您开始之前，您需要：

1. 您的 AWS 账户。
1. 拥有必要权限的 [ClickHouse API 密钥](/cloud/manage/openapi)，以创建和管理 ClickHouse 端的私有端点。

## 步骤 {#steps}

遵循以下步骤通过 AWS PrivateLink 连接您的 ClickHouse Cloud 服务。

### 获取 Endpoint "Service name"  {#obtain-endpoint-service-info}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您想通过 PrivateLink 连接的服务，然后导航到 **Settings** 菜单。

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

记下 `Service name` 和 `DNS name`，然后 [移步到下一步](#create-aws-endpoint)。

#### 选项 2：API {#option-2-api}

首先，在运行任何命令之前，设置以下环境变量：

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

通过根据区域、提供者和服务名称进行过滤，获取 ClickHouse 的 `INSTANCE_ID`：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取作为您 PrivateLink 配置的 `endpointServiceId` 和 `privateDnsHostname`：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

该命令应返回如下信息：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

记下 `endpointServiceId` 和 `privateDnsHostname`，然后 [移步到下一步](#create-aws-endpoint)。

### 创建 AWS Endpoint {#create-aws-endpoint}

:::important
本节涵盖了通过 AWS PrivateLink 配置 ClickHouse 的具体细节。AWS 相关步骤作为参考提供，以指导您查找相关信息，但这些步骤可能会随时间而变化而不通知。请根据您的具体用例考虑 AWS 配置。

请注意，ClickHouse 不负责配置所需的 AWS VPC 端点、安全组规则或 DNS 记录。

如果您之前在设置 PrivateLink 时启用了 "私有 DNS 名称"，并且在通过 PrivateLink 配置新服务时遇到困难，请联系 ClickHouse 支持。有关 AWS 配置任务的任何其他问题，请直接联系 AWS 支持。
:::

#### 选项 1：AWS 控制台 {#option-1-aws-console}

打开 AWS 控制台，然后转到 **VPC** → **Endpoints** → **Create endpoints**。

选择 **Endpoint services that use NLBs and GWLBs**，然后在 **Service Name** 字段中使用您从 [获取 Endpoint "Service name"](#obtain-endpoint-service-info) 步骤获得的 `Service name`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup>。点击 **Verify service**：

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>

如果您想通过 PrivateLink 建立跨区域连接，请启用 "Cross region endpoint" 复选框，并指定服务区域。服务区域是 ClickHouse 实例运行的区域。

如果您收到 "Service name could not be verified." 错误，请联系客户支持请求将新区域添加到支持区域列表中。

接下来，选择您的 VPC 和子网：

<Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />

作为可选步骤，分配安全组/标签：

:::note
确保安全组允许端口 `443`、`8443`、`9440`、`3306` 的访问。
:::

创建 VPC Endpoint 后，记下 `Endpoint ID` 值；在后续步骤中您将需要此值。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### 选项 2：AWS CloudFormation {#option-2-aws-cloudformation}

接下来，您需要使用从 [获取 Endpoint "Service name"](#obtain-endpoint-service-info) 步骤获得的 `Service name`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup> 来创建 VPC Endpoint。
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

在创建 VPC Endpoint 后，记下 `Endpoint ID` 值；在后续步骤中您将需要此值。

#### 选项 3：Terraform {#option-3-terraform}

下面的 `service_name` 是您从 [获取 Endpoint "Service name"](#obtain-endpoint-service-info) 步骤获得的 `Service name`<sup>console</sup> 或 `endpointServiceId`<sup>API</sup>。

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

在创建 VPC Endpoint 后，记下 `Endpoint ID` 值；在后续步骤中您将需要此值。

#### 为 Endpoint 设置私有 DNS 名称 {#set-private-dns-name-for-endpoint}

:::note
配置 DNS 的方式有多种。请根据您的具体用例设置 DNS。
:::

您需要将从 [获取 Endpoint "Service name"](#obtain-endpoint-service-info) 步骤获取的 "DNS name" 指向 AWS Endpoint 网络接口。这确保您 VPC/网络中的服务/组件能够正确解析它。

### 将 "Endpoint ID" 添加到 ClickHouse 服务允许列表 {#add-endpoint-id-to-services-allow-list}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

要添加，请导航到 ClickHouse Cloud 控制台，打开您希望通过 PrivateLink 连接的服务，然后导航到 **Settings**。单击 **Set up private endpoint** 以打开私有端点设置。输入从 [创建 AWS Endpoint](#create-aws-endpoint) 步骤获得的 `Endpoint ID`。点击 "Create endpoint"。

:::note
如果您想允许现有 PrivateLink 连接的访问，请使用现有端点下拉菜单。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

要删除，请导航到 ClickHouse Cloud 控制台，找到服务，然后导航到服务的 **Settings**，找到您希望删除的端点。从端点列表中将其移除。

#### 选项 2：API {#option-2-api-2}

您需要将 Endpoint ID 添加到每个应通过 PrivateLink 可用的实例的允许列表中。

使用从 [创建 AWS Endpoint](#create-aws-endpoint) 步骤获得的数据设置 `ENDPOINT_ID` 环境变量。

在运行任何命令之前，设置以下环境变量：

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

每个启用 Private Link 的服务都有公共和私有端点。为了使用 Private Link 连接，您需要使用一个私有端点，该端点将是从 [获取 Endpoint "Service name"](#obtain-endpoint-service-info) 获得的 `privateDnsHostname`<sup>API</sup> 或 `DNS Name`<sup>console</sup>。

#### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

##### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航到 **Settings**。点击 **Set up private endpoint** 按钮。在打开的弹出窗口中，复制 **DNS Name**。

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

##### 选项 2：API {#option-2-api-3}

在运行任何命令之前，设置以下环境变量：

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

您可以从 [步骤](#option-2-api) 获取 `INSTANCE_ID`。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

这将输出如下内容：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

在此示例中，连接通过 `privateDnsHostname` 主机名的值将被路由到 PrivateLink，但通过 `endpointServiceId` 主机名的连接将通过互联网路由。

## 故障排除 {#troubleshooting}

### 在一个区域内的多个 PrivateLink {#multiple-privatelinks-in-one-region}

在大多数情况下，您只需要为每个 VPC 创建一个端点服务。该端点可以将请求从 VPC 路由到多个 ClickHouse Cloud 服务。
请参阅 [这里](#attention)

### 连接到私有端点超时 {#connection-to-private-endpoint-timed-out}

- 请将安全组附加到 VPC Endpoint。
- 请验证附加到端点的安全组上的 `inbound` 规则，并允许 ClickHouse 端口的访问。
- 请验证附加到用于连接测试的虚拟机的安全组上的 `outbound` 规则，并允许访问 ClickHouse 端口。

### 私有主机名：未找到主机地址 {#private-hostname-not-found-address-of-host}

- 请检查您的 DNS 配置

### 连接被对等方重置 {#connection-reset-by-peer}

- 最有可能的原因是 Endpoint ID 未添加到服务允许列表，请访问 [步骤](#add-endpoint-id-to-services-allow-list)

### 检查端点过滤器 {#checking-endpoint-filters}

在运行任何命令之前，设置以下环境变量：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

您可以从 [步骤](#option-2-api) 获取 `INSTANCE_ID`。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### 连接到远程数据库 {#connecting-to-a-remote-database}

假设您正在尝试在 ClickHouse Cloud 中使用 [MySQL](../../sql-reference/table-functions/mysql.md) 或 [PostgreSQL](../../sql-reference/table-functions/postgresql.md) 表函数，并连接到托管在 Amazon Web Services (AWS) VPC 中的数据库。AWS PrivateLink 不能用于安全地启用此连接。PrivateLink 是单向的、单向的连接。它允许您的内部网络或 Amazon VPC 安全连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [AWS PrivateLink 文档](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)：

> 当您有一个客户端/服务器设置时，请使用 AWS PrivateLink，在这种情况下，您希望允许一个或多个消费者 VPC 单向访问服务提供者 VPC 中的特定服务或一组实例。只有消费者 VPC 中的客户端可以发起与服务提供者 VPC 中服务的连接。

为此，请配置您的 AWS 安全组以允许 ClickHouse Cloud 连接到您的内部/私有数据库服务。查看 [ClickHouse Cloud 区域的默认出口 IP 地址](/manage/security/cloud-endpoints-api)，以及 [可用的静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。
