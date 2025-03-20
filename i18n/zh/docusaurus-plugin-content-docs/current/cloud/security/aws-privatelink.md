---
title: 'AWS PrivateLink'
description: '本文件描述了如何使用 AWS PrivateLink 连接到 ClickHouse Cloud。'
slug: /manage/security/aws-privatelink
---

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

您可以使用 [AWS PrivateLink](https://aws.amazon.com/privatelink/) 在 VPC、AWS 服务、您的本地系统与 ClickHouse Cloud 之间提供连接，而无需让您的流量跨越互联网。本文件描述了如何使用 AWS PrivateLink 连接到 ClickHouse Cloud。 要禁用来自除 AWS PrivateLink 地址以外的地址对您的 ClickHouse Cloud 服务的访问，请使用 ClickHouse Cloud [IP 访问列表](/cloud/security/setting-ip-filters)。

:::note
ClickHouse Cloud 当前不支持 [跨区域 PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)。但是，您可以 [通过 VPC 对等连接连接到 PrivateLink](https://aws.amazon.com/about-aws/whats-new/2019/03/aws-privatelink-now-supports-access-over-vpc-peering/)。有关更多信息和配置指南，请参考 AWS 文档。
:::


请完成以下步骤以启用 AWS Private Link：
1. 获取端点服务名称。
2. 创建服务端点。
3. 将端点 ID 添加到 ClickHouse Cloud 组织。
4. 将端点 ID 添加到服务允许列表。


在这里找到完整的 Terraform 示例以供参考 [here](https://github.com/ClickHouse/terraform-provider-clickhouse/blob/main/examples/resources/clickhouse_private_endpoint_registration/resource.tf)。

## 先决条件 {#prerequisites}

在开始之前，您需要：

1. 一个 AWS 账户。
2. 一个具有创建和管理私有链接所需权限的 API 密钥。

## 步骤 {#steps}

按照以下步骤将您的 ClickHouse Cloud 连接到 AWS PrivateLink。

### 获取端点服务名称 {#obtain-endpoint-service-name}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后打开 **设置** 菜单。单击 **设置私有端点** 按钮。复制用于设置 Private Link 的 **服务名称**。

<img src={aws_private_link_pecreate} alt="私有端点" />

#### 选项 2：API {#option-2-api}

首先，在运行任何命令之前，设置以下环境变量：

```shell
REGION=<您的区域代码，使用 AWS 格式>
PROVIDER=aws
KEY_ID=<您的密钥 ID>
KEY_SECRET=<您的密钥秘密>
ORG_ID=<您的 ClickHouse 组织 ID>
SERVICE_NAME=<您的 ClickHouse 服务名称>
```

通过根据区域、提供商和服务名称进行筛选，获取所需的实例 ID：

```shell
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

获取您的 Private Link 配置的 AWS 服务名称：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

此命令应返回类似如下内容：

```result
{
    ...
    "endpointServiceId": "com.amazonaws.vpce.yy-XXXX-N.vpce-svc-xxxxxxxxxxxx",
    ...
}
```

记下 `endpointServiceId` 并 [继续到步骤 2](#create-a-service-endpoint)。

### 创建服务端点 {#create-a-service-endpoint}

接下来，您需要使用上一步中的 `endpointServiceId` 创建服务端点。

#### 选项 1：AWS 控制台 {#option-1-aws-console}

打开 AWS 控制台，转到 **VPC** → **端点** → **创建端点**。

选择 **其他端点服务**，并使用您从上一步获得的 `endpointServiceId`。完成后，单击 **验证服务**：

<img src={aws_private_link_endpoint_settings} alt="AWS PrivateLink 端点设置" />

接下来，选择您的 VPC 和子网：

<img src={aws_private_link_select_vpc} alt="选择 VPC 和子网" />

作为可选步骤，分配安全组/标签：

:::note 端口
确保安全组允许端口 `8443` 和 `9440`。
:::

创建 VPC 端点后，记下 `端点 ID` 值；您将在后续步骤中使用到它。

<img src={aws_private_link_vpc_endpoint_id} alt="VPC 端点 ID" />

#### 选项 2：AWS CloudFormation {#option-2-aws-cloudformation}

确保使用正确的子网 ID、安全组和 VPC ID。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <使用 '获取 AWS 服务名称以进行私有链接' 步骤中的 endpointServiceId>
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

#### 选项 3：Terraform {#option-3-terraform}

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<使用 '获取 AWS 服务名称以进行私有链接' 步骤中的 endpointServiceId>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
}
```

#### 修改端点的私有 DNS 名称 {#modify-private-dns-name-for-endpoint}

此步骤将 `<区域代码>.vpce.aws.clickhouse.cloud` 配置注入到 AWS VPC 中。

:::note DNS 解析器
如果您使用自己的 DNS 解析器，创建 `<区域代码>.vpce.aws.clickhouse.cloud` DNS 区域，并将通配符记录 `*.<区域代码>.vpce.aws.clickhouse.cloud` 指向端点 ID IP 地址。
:::

#### 选项 1：AWS 控制台 {#option-1-aws-console-1}

导航至 **VPC 端点**，右键点击 VPC 端点，然后选择 **修改私有 DNS 名称**：

<img src={aws_private_link_endpoints_menu} alt="AWS PrivateLink 端点菜单" />

在打开的页面上，选择 **启用私有 DNS 名称**：

<img src={aws_private_link_modify_dnsname} alt="修改 DNS 名称" />

#### 选项 2：AWS CloudFormation {#option-2-aws-cloudformation-1}

更新 `CloudFormation` 模板并将 `PrivateDnsEnabled` 设置为 `true`：

```json
PrivateDnsEnabled: true
```

应用更改。

#### 选项 3：Terraform {#option-3-terraform-1}

- 更改 Terraform 代码中的 `aws_vpc_endpoint` 资源，并将 `private_dns_enabled` 设置为 `true`：

```json
private_dns_enabled = true
```

应用更改。

### 将端点 ID 添加到 ClickHouse Cloud 组织 {#add-endpoint-id-to-clickhouse-cloud-organization}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-1}

要将端点添加到组织，请继续执行 [将端点 ID 添加到服务允许列表](#add-endpoint-id-to-services-allow-list) 步骤。通过 ClickHouse Cloud 控制台将 `端点 ID` 添加到服务允许列表将自动将其添加到组织。

要删除端点，请打开 **组织详情 -> 私有端点**，单击删除按钮以移除端点。

<img src={pe_remove_private_endpoint} alt="删除私有端点" />

#### 选项 2：API {#option-2-api-1}

在运行任何命令之前，设置以下环境变量：

```bash
PROVIDER=aws
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<请设置 ClickHouse 组织 ID>
ENDPOINT_ID=<上一步中的端点 ID>
REGION=<区域代码，请使用 AWS 格式>
```

使用上一步的数据设置 `VPC_ENDPOINT` 环境变量。

要添加端点，请运行：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "description": "一个 AWS 私有端点",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} \
-d @pl_config_org.json
```

要删除端点，请运行：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} \
-d @pl_config_org.json
```

### 将端点 ID 添加到服务允许列表 {#add-endpoint-id-to-services-allow-list}

#### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-2}

在 ClickHouse Cloud 控制台中，打开您希望通过 PrivateLink 连接的服务，然后导航至 **设置**。输入从 [上一步](#create-a-service-endpoint) 获得的 `端点 ID`。

:::note
如果您希望从现有的 PrivateLink 连接中允许访问，请使用现有的端点下拉菜单。
:::

<img src={aws_private_link_pe_filters} alt="私有端点过滤器" />

### 选项 2：API {#option-2-api-2}

您需要将端点 ID 添加到每个应该可以通过 PrivateLink 访问的实例的允许列表中。

在运行任何命令之前，设置以下环境变量：

```bash
PROVIDER=aws
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<请设置 ClickHouse 组织 ID>
ENDPOINT_ID=<上一步中的端点 ID>
INSTANCE_ID=<实例 ID>
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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
-d @pl_config.json | jq
```

要从允许列表中移除端点 ID：

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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
-d @pl_config.json | jq
```

### 使用 PrivateLink 访问实例 {#accessing-an-instance-using-privatelink}

每个配置有 Private Link 过滤器的实例都有一个公共和私有端点。要使用 PrivateLink 连接到您的服务，您需要使用私有端点 `privateDnsHostname`。

:::note
私有 DNS 主机名仅在您的 AWS VPC 中可用。请勿尝试从本地机器解析 DNS 主机。
:::

#### 获取私有 DNS 主机名 {#getting-private-dns-hostname}

##### 选项 1：ClickHouse Cloud 控制台 {#option-1-clickhouse-cloud-console-3}

在 ClickHouse Cloud 控制台中，导航至 **设置**。单击 **设置私有端点** 按钮。在弹出的菜单中，复制 **DNS 名称**。

<img src={aws_private_link_ped_nsname} alt="私有端点 DNS 名称" />

##### 选项 2：API {#option-2-api-3}

在运行任何命令之前，设置以下环境变量：

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<请设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

这应该输出类似如下内容：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud"
}
```

在此示例中，连接到 `xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud` 主机名将被路由到 PrivateLink，但 `xxxxxxx.yy-xxxx-N.aws.clickhouse.cloud` 将通过互联网路由。

## 故障排除 {#troubleshooting}

### 一个区域内多个 PrivateLinks {#multiple-privatelinks-in-one-region}

在大多数情况下，您只需要为每个 VPC 创建一个端点服务。该端点可以将请求从 VPC 路由到多个 ClickHouse Cloud 服务。

### 连接到私有端点超时 {#connection-to-private-endpoint-timed-out}

- 请将安全组附加到 VPC 端点。
- 请验证附加到端点的安全组上的 `入境` 规则并允许 ClickHouse 端口。
- 请验证用于连接测试的 VM 上附加安全组的 `出境` 规则，并允许连接到 ClickHouse 端口。

### 私有主机名：未找到主机地址 {#private-hostname-not-found-address-of-host}

- 请检查是否启用了“私有 DNS 名称”选项，访问 [步骤](#modify-private-dns-name-for-endpoint) 以获取详细信息

### 连接被对等方重置 {#connection-reset-by-peer}

- 很可能是端点 ID 未被添加到服务允许列表中，请访问 [步骤](#add-endpoint-id-to-services-allow-list)

### 检查端点过滤器 {#checking-endpoint-filters}

在运行任何命令之前，设置以下环境变量：

```bash
KEY_ID=<密钥 ID>
KEY_SECRET=<密钥秘密>
ORG_ID=<请设置 ClickHouse 组织 ID>
INSTANCE_ID=<实例 ID>
```

```shell
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X GET -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | \
jq .result.privateEndpointIds
```

### 连接到远程数据库 {#connecting-to-a-remote-database}

假设您正在尝试在 ClickHouse Cloud 中使用 [MySQL](../../sql-reference/table-functions/mysql.md) 或 [PostgreSQL](../../sql-reference/table-functions/postgresql.md) 表函数，并连接到托管在 Amazon Web Services (AWS) VPC 中的数据库。 AWS PrivateLink 不能用于安全地启用这一连接。PrivateLink 是单向的、单向的连接。它允许您的内部网络或 Amazon VPC 安全地连接到 ClickHouse Cloud，但不允许 ClickHouse Cloud 连接到您的内部网络。

根据 [AWS PrivateLink 文档](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)：

> 当您有一个客户端/服务器设置时，如果您希望允许一个或多个消费者 VPC 单向访问服务提供者 VPC 中的特定服务或一组实例，请使用 AWS PrivateLink。只有消费者 VPC 中的客户端可以发起到服务提供者 VPC 中服务的连接。

要做到这一点，请配置您的 AWS 安全组以允许 ClickHouse Cloud 连接到您的内部/私有数据库服务。检查 [ClickHouse Cloud 区域的默认出境 IP 地址](/manage/security/cloud-endpoints-api) 以及 [可用静态 IP 地址](https://api.clickhouse.cloud/static-ips.json)。
