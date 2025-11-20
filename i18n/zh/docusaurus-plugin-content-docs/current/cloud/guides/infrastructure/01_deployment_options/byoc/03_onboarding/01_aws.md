---
title: '在 AWS 上使用 BYOC 入门'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '在您自有的云基础设施上部署 ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## 入门流程 {#onboarding-process}

客户可以通过联系[我们](https://clickhouse.com/cloud/bring-your-own-cloud)来启动入门流程。客户需要拥有一个专用的 AWS 账户并明确将要使用的区域。目前,我们仅允许用户在 ClickHouse Cloud 支持的区域中启动 BYOC 服务。

### 准备 AWS 账户 {#prepare-an-aws-account}

建议客户准备一个专用的 AWS 账户来托管 ClickHouse BYOC 部署,以确保更好的隔离性。不过,使用共享账户和现有 VPC 也是可行的。详情请参阅下文的_设置 BYOC 基础设施_。

使用此账户和初始组织管理员电子邮件,您可以联系 ClickHouse 支持团队。

### 初始化 BYOC 设置 {#initialize-byoc-setup}

初始 BYOC 设置可以使用 CloudFormation 模板或 Terraform 模块来执行。两种方法都会创建相同的 IAM 角色,使 ClickHouse Cloud 的 BYOC 控制器能够管理您的基础设施。请注意,运行 ClickHouse 所需的 S3、VPC 和计算资源不包含在此初始设置中。

#### CloudFormation 模板 {#cloudformation-template}

[BYOC CloudFormation 模板](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)

#### Terraform 模块 {#terraform-module}

[BYOC Terraform 模块](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)

```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### 设置 BYOC 基础设施 {#setup-byoc-infrastructure}

创建 CloudFormation 堆栈后,系统将提示您从云控制台设置基础设施,包括 S3、VPC 和 EKS 集群。某些配置必须在此阶段确定,因为它们以后无法更改。具体包括:

- **您要使用的区域**,您可以选择我们为 ClickHouse Cloud 提供的任何[公共区域](/cloud/reference/supported-regions)。
- **BYOC 的 VPC CIDR 范围**:默认情况下,我们使用 `10.0.0.0/16` 作为 BYOC VPC CIDR 范围。如果您计划与另一个账户使用 VPC 对等连接,请确保 CIDR 范围不重叠。为 BYOC 分配合适的 CIDR 范围,最小大小为 `/22`,以容纳必要的工作负载。
- **BYOC VPC 的可用区**:如果您计划使用 VPC 对等连接,在源账户和 BYOC 账户之间对齐可用区可以帮助降低跨可用区流量成本。在 AWS 中,可用区后缀(`a, b, c`)在不同账户之间可能代表不同的物理区域 ID。详情请参阅 [AWS 指南](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)。

#### 客户管理的 VPC {#customer-managed-vpc}

默认情况下,ClickHouse Cloud 将为您的 BYOC 部署配置一个专用 VPC,以实现更好的隔离。不过,您也可以使用账户中的现有 VPC。这需要特定的配置,并且必须通过 ClickHouse 支持团队进行协调。

**配置您的现有 VPC**

1. 在 3 个不同的可用区中至少分配 3 个私有子网供 ClickHouse Cloud 使用。
2. 确保每个子网的最小 CIDR 范围为 `/23`(例如 10.0.0.0/23),以便为 ClickHouse 部署提供足够的 IP 地址。
3. 为每个子网添加标签 `kubernetes.io/role/internal-elb=1`,以启用正确的负载均衡器配置。

<br />

<Image img={byoc_subnet_1} size='lg' alt='BYOC VPC Subnet' background='black' />

<br />

<br />

<Image
  img={byoc_subnet_2}
  size='lg'
  alt='BYOC VPC Subnet Tags'
  background='black'
/>

<br />

4. 配置 S3 网关端点
   如果您的 VPC 尚未配置 S3 网关端点,您需要创建一个,以便在 VPC 和 Amazon S3 之间实现安全的私有通信。此端点允许您的 ClickHouse 服务访问 S3,而无需通过公共互联网。请参考下面的屏幕截图以获取示例配置。

<br />


<Image
  img={byoc_s3_endpoint}
  size='lg'
  alt='BYOC S3 端点'
  background='black'
/>

<br />

**联系 ClickHouse 支持团队**  
创建支持工单并提供以下信息:

- 您的 AWS 账户 ID
- 您希望部署服务的 AWS 区域
- 您的 VPC ID
- 您为 ClickHouse 分配的私有子网 ID
- 这些子网所在的可用区

### 可选:设置 VPC 对等连接 {#optional-setup-vpc-peering}

要为 ClickHouse BYOC 创建或删除 VPC 对等连接,请按照以下步骤操作:

#### 步骤 1:为 ClickHouse BYOC 启用私有负载均衡器 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}

联系 ClickHouse 支持团队以启用私有负载均衡器。

#### 步骤 2:创建对等连接 {#step-2-create-a-peering-connection}

1. 在 ClickHouse BYOC 账户中导航到 VPC 控制面板。
2. 选择对等连接。
3. 点击创建对等连接。
4. 将 VPC 请求方设置为 ClickHouse VPC ID。
5. 将 VPC 接受方设置为目标 VPC ID。(如适用,选择另一个账户)
6. 点击创建对等连接。

<br />

<Image
  img={byoc_vpcpeering}
  size='lg'
  alt='BYOC 创建对等连接'
  border
/>

<br />

#### 步骤 3:接受对等连接请求 {#step-3-accept-the-peering-connection-request}

转到对等账户,在 (VPC -> 对等连接 -> 操作 -> 接受请求) 页面中,您可以批准此 VPC 对等请求。

<br />

<Image
  img={byoc_vpcpeering2}
  size='lg'
  alt='BYOC 接受对等连接'
  border
/>

<br />

#### 步骤 4:向 ClickHouse VPC 路由表添加目标 {#step-4-add-destination-to-clickhouse-vpc-route-tables}

在 ClickHouse BYOC 账户中,

1. 在 VPC 控制面板中选择路由表。
2. 搜索 ClickHouse VPC ID。编辑附加到私有子网的每个路由表。
3. 点击路由选项卡下的编辑按钮。
4. 点击添加另一条路由。
5. 在目标中输入目标 VPC 的 CIDR 范围。
6. 为目标选择"对等连接"和对等连接的 ID。

<br />

<Image img={byoc_vpcpeering3} size='lg' alt='BYOC 添加路由表' border />

<br />

#### 步骤 5:向目标 VPC 路由表添加目标 {#step-5-add-destination-to-the-target-vpc-route-tables}

在对等 AWS 账户中,

1. 在 VPC 控制面板中选择路由表。
2. 搜索目标 VPC ID。
3. 点击路由选项卡下的编辑按钮。
4. 点击添加另一条路由。
5. 在目标中输入 ClickHouse VPC 的 CIDR 范围。
6. 为目标选择"对等连接"和对等连接的 ID。

<br />

<Image img={byoc_vpcpeering4} size='lg' alt='BYOC 添加路由表' border />

<br />

#### 步骤 6:编辑安全组以允许对等 VPC 访问 {#step-6-edit-security-group-to-allow-peered-vpc-access}

在 ClickHouse BYOC 账户中,您需要更新安全组设置以允许来自对等 VPC 的流量。请联系 ClickHouse 支持团队,请求添加包含对等 VPC CIDR 范围的入站规则。

---

现在应该可以从对等 VPC 访问 ClickHouse 服务。

要私密访问 ClickHouse,系统会配置私有负载均衡器和端点,以便从用户的对等 VPC 进行安全连接。私有端点遵循公共端点格式,并带有 `-private` 后缀。例如:

- **公共端点**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **私有端点**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选操作:在验证对等连接正常工作后,您可以请求移除 ClickHouse BYOC 的公共负载均衡器。


## 升级流程 {#upgrade-process}

我们会定期升级软件,包括 ClickHouse 数据库版本、ClickHouse Operator、EKS 及其他组件。

虽然我们致力于实现无缝升级(例如滚动升级和重启),但某些升级(如 ClickHouse 版本变更和 EKS 节点升级)可能会影响服务。客户可以指定维护时间窗口(例如每周二太平洋夏令时间凌晨 1:00),以确保此类升级仅在计划时间内进行。

:::note
维护时间窗口不适用于安全和漏洞修复。这些修复作为周期外升级处理,我们会及时沟通协调合适的时间,以最大限度地减少对运营的影响。
:::


## CloudFormation IAM 角色 {#cloudformation-iam-roles}

### Bootstrap IAM 角色 {#bootstrap-iam-role}

Bootstrap IAM 角色具有以下权限:

- **EC2 和 VPC 操作**:用于设置 VPC 和 EKS 集群。
- **S3 操作(例如 `s3:CreateBucket`)**:用于为 ClickHouse BYOC 存储创建存储桶。
- **`route53:*` 权限**:用于外部 DNS 在 Route 53 中配置记录。
- **IAM 操作(例如 `iam:CreatePolicy`)**:用于控制器创建额外角色(详见下一节)。
- **EKS 操作**:仅限于名称以 `clickhouse-cloud` 前缀开头的资源。

### 控制器创建的额外 IAM 角色 {#additional-iam-roles-created-by-the-controller}

除了通过 CloudFormation 创建的 `ClickHouseManagementRole` 之外,控制器还会创建多个额外角色。

这些角色由客户 EKS 集群内运行的应用程序使用:

- **State Exporter 角色**
  - 向 ClickHouse Cloud 报告服务健康信息的 ClickHouse 组件。
  - 需要向 ClickHouse Cloud 拥有的 SQS 队列写入数据的权限。
- **Load-Balancer Controller**
  - 标准 AWS 负载均衡器控制器。
  - EBS CSI Controller 用于管理 ClickHouse 服务的卷。
- **External-DNS**
  - 将 DNS 配置传播到 Route 53。
- **Cert-Manager**
  - 为 BYOC 服务域配置 TLS 证书。
- **Cluster Autoscaler**
  - 根据需要调整节点组大小。

**K8s-control-plane** 和 **k8s-worker** 角色由 AWS EKS 服务使用。

最后,**`data-plane-mgmt`** 允许 ClickHouse Cloud Control Plane 组件协调必要的自定义资源,例如 `ClickHouseCluster` 和 Istio Virtual Service/Gateway。


## 网络边界 {#network-boundaries}

本节介绍客户 BYOC VPC 的不同网络流量类型：

- **入站**：进入客户 BYOC VPC 的流量。
- **出站**：从客户 BYOC VPC 发起并发送到外部目标的流量。
- **公共**：可从公共互联网访问的网络端点。
- **私有**：仅通过私有连接（如 VPC 对等连接、VPC Private Link 或 Tailscale）访问的网络端点。

**Istio 入口网关部署在 AWS NLB 后面，用于接收 ClickHouse 客户端流量。**

_入站，公共（可配置为私有）_

Istio 入口网关负责终止 TLS 连接。证书由 CertManager 通过 Let's Encrypt 配置，并作为密钥存储在 EKS 集群中。由于 Istio 和 ClickHouse 位于同一 VPC 中，它们之间的流量[由 AWS 加密](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

默认情况下，入口网关可通过 IP 允许列表过滤进行公共访问。客户可以配置 VPC 对等连接将其设为私有并禁用公共连接。我们强烈建议设置 [IP 过滤器](/cloud/security/setting-ip-filters)来限制访问。

### 故障排查访问 {#troubleshooting-access}

_入站，公共（可配置为私有）_

ClickHouse Cloud 工程师需要通过 Tailscale 进行故障排查访问。他们为 BYOC 部署配置了即时基于证书的身份验证。

### 计费数据采集器 {#billing-scraper}

_出站，私有_

计费数据采集器从 ClickHouse 收集计费数据并将其发送到 ClickHouse Cloud 拥有的 S3 存储桶。

它作为 Sidecar 容器与 ClickHouse 服务器容器一起运行，定期采集 CPU 和内存指标。同一区域内的请求通过 VPC 网关服务端点路由。

### 告警 {#alerts}

_出站，公共_

AlertManager 配置为在客户的 ClickHouse 集群不健康时向 ClickHouse Cloud 发送告警。

指标和日志存储在客户的 BYOC VPC 中。日志目前本地存储在 EBS 中。在未来的更新中，它们将存储在 LogHouse 中，这是 BYOC VPC 内的一个 ClickHouse 服务。指标使用 Prometheus 和 Thanos 技术栈，本地存储在 BYOC VPC 中。

### 服务状态 {#service-state}

_出站_

State Exporter 将 ClickHouse 服务状态信息发送到 ClickHouse Cloud 拥有的 SQS 队列。
