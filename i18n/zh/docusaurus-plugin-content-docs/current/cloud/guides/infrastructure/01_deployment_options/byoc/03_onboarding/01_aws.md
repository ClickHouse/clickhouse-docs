---
title: '适用于 AWS 的 BYOC 入门'
slug: /cloud/reference/byoc/onboarding/aws
sidebar_label: 'AWS'
keywords: ['BYOC', '云', '自有云环境', 'AWS']
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


## 接入流程 {#onboarding-process}

客户可以通过联系[我们](https://clickhouse.com/cloud/bring-your-own-cloud)来发起接入流程。客户需要准备一个专用的 AWS 账号，并确认将要使用的 Region。目前，我们仅允许用户在 ClickHouse Cloud 支持的 Region 中启动 BYOC 服务。

### 准备 AWS 账号 {#prepare-an-aws-account}

建议客户为托管 ClickHouse BYOC 部署准备一个专用的 AWS 账号，以确保更好的隔离性。不过，也可以使用共享账号和已有的 VPC。详细信息请参见下文的 *Setup BYOC Infrastructure*。

准备好该账号以及初始组织管理员的邮箱地址后，您可以联系 ClickHouse 支持团队。

### 初始化 BYOC 设置 {#initialize-byoc-setup}

初始 BYOC 设置可以通过 CloudFormation 模板或 Terraform 模块来完成。这两种方式都会创建相同的 IAM 角色，使来自 ClickHouse Cloud 的 BYOC 控制器能够管理您的基础设施。注意，运行 ClickHouse 所需的 S3、VPC 和计算资源不包含在此初始设置中。

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

<!-- TODO: 在自助接入流程上线后，为其余接入步骤添加截图。 -->


### 设置 BYOC 基础设施 {#setup-byoc-infrastructure}

在创建 CloudFormation 堆栈之后，系统会提示您在云控制台中设置基础设施，包括 S3、VPC 和 EKS 集群。某些配置必须在此阶段确定，因为之后无法更改。具体包括：

* **您想使用的区域**：您可以在我们为 ClickHouse Cloud 提供的任一[公共区域](/cloud/reference/supported-regions)中进行选择。
* **BYOC 的 VPC CIDR 范围**：默认情况下，我们为 BYOC VPC CIDR 范围使用 `10.0.0.0/16`。如果您计划与另一个账号使用 VPC 对等连接，请确保 CIDR 范围不重叠。为 BYOC 分配合适的 CIDR 范围，最小大小为 `/22`，以容纳必要的工作负载。
* **BYOC VPC 的可用区**：如果您计划使用 VPC 对等连接，使源账号与 BYOC 账号之间的可用区保持一致，可以帮助降低跨可用区流量成本。在 AWS 中，可用区后缀（`a, b, c`）在不同账号中可能对应不同的物理可用区 ID。详情请参阅 [AWS 指南](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)。

#### 客户托管 VPC {#customer-managed-vpc}

默认情况下，ClickHouse Cloud 会为您的 BYOC 部署预配一个专用 VPC，以实现更好的隔离。不过，您也可以使用账号中已有的 VPC。这需要特定配置，并且必须通过 ClickHouse Support 配合完成。

**配置您现有的 VPC**

1. 为该 VPC 添加标签 `clickhouse-byoc="true"`。
2. 至少在 3 个不同的可用区中分配 3 个私有子网供 ClickHouse Cloud 使用。
3. 确保每个子网的 CIDR 范围至少为 `/23`（例如 10.0.0.0/23），以为 ClickHouse 部署提供足够的 IP 地址。
4. 为每个子网添加标签 `kubernetes.io/role/internal-elb=1` 和 `clickhouse-byoc="true"`，以启用正确的负载均衡器配置。

<br />

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC 子网" background="black" />

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC 子网标签" background="black" />

<br />

4. 配置 S3 网关终端节点（S3 Gateway Endpoint）\
   如果您的 VPC 尚未配置 S3 网关终端节点，您需要创建一个，以在 VPC 与 Amazon S3 之间启用安全、私有的通信。通过该终端节点，您的 ClickHouse 服务可以在不经过公共互联网的情况下访问 S3。请参考下方截图中的示例配置。

<br />

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 终端节点" background='black'/>

<br />

**联系 ClickHouse 支持团队**  
请创建一个支持工单，并提供以下信息：

* 您的 AWS 账号 ID
* 您希望部署服务的 AWS Region
* 您的 VPC ID
* 您为 ClickHouse 分配的私有子网 ID
* 这些子网所在的可用区

### 可选：设置 VPC Peering {#optional-setup-vpc-peering}

要为 ClickHouse BYOC 创建或删除 VPC peering，请按照以下步骤操作：

#### 步骤 1：为 ClickHouse BYOC 启用私有负载均衡器 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}

联系 ClickHouse 支持团队以启用 Private Load Balancer。

#### 步骤 2 创建 peering 连接 {#step-2-create-a-peering-connection}

1. 在 ClickHouse BYOC 账号中，进入 VPC Dashboard。
2. 选择 Peering Connections。
3. 点击 Create Peering Connection。
4. 将 VPC Requester 设置为 ClickHouse VPC ID。
5. 将 VPC Accepter 设置为目标 VPC ID。（如适用，选择另一个账号）
6. 点击 Create Peering Connection。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC 创建 Peering 连接" border />

<br />

#### 步骤 3 接受 peering 连接请求 {#step-3-accept-the-peering-connection-request}

在对端账号中，进入 (VPC -> Peering connections -> Actions -> Accept request) 页面，客户可以在此批准该 VPC peering 请求。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC 接受 Peering 连接" border />

<br />

#### 步骤 4 为 ClickHouse VPC 路由表添加目标 {#step-4-add-destination-to-clickhouse-vpc-route-tables}

在 ClickHouse BYOC 账号中：
1. 在 VPC Dashboard 中选择 Route Tables。
2. 搜索 ClickHouse VPC ID，编辑附加到私有子网的每个路由表。
3. 在 Routes 选项卡下点击 Edit 按钮。
4. 点击 Add another route。
5. 在 Destination 中输入目标 VPC 的 CIDR 范围。
6. 在 Target 中选择 “Peering Connection” 以及对应 peering 连接的 ID。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC 添加路由表" border />

<br />

#### 步骤 5 为目标 VPC 路由表添加目标 {#step-5-add-destination-to-the-target-vpc-route-tables}

在对端 AWS 账号中：
1. 在 VPC Dashboard 中选择 Route Tables。
2. 搜索目标 VPC ID。
3. 在 Routes 选项卡下点击 Edit 按钮。
4. 点击 Add another route。
5. 在 Destination 中输入 ClickHouse VPC 的 CIDR 范围。
6. 在 Target 中选择 “Peering Connection” 以及对应 peering 连接的 ID。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC 添加路由表" border />

<br />

#### 步骤 6：编辑安全组以允许对等 VPC 访问 {#step-6-edit-security-group-to-allow-peered-vpc-access}

在 ClickHouse BYOC 账号中，您需要更新 Security Group 设置，以允许来自对等 VPC 的流量。请联系 ClickHouse 支持团队，请求添加包含对等 VPC CIDR 范围的入站规则。

---

现在应该可以从对等 VPC 访问 ClickHouse 服务。

为了通过私有网络访问 ClickHouse，会为用户的对等 VPC 预配一个私有负载均衡器和私有终端节点，以提供安全连接。私有终端节点遵循公共终端节点的格式，并带有 `-private` 后缀。例如：

- **公共终端节点**：`h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **私有终端节点**：`h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选：在验证 peering 正常工作之后，您可以请求为 ClickHouse BYOC 删除公共负载均衡器。

## 升级流程 {#upgrade-process}

我们会定期升级软件，包括 ClickHouse 数据库版本、ClickHouse Operator、EKS 以及其他组件。

尽管我们致力于实现无缝升级（例如滚动升级和重启），但某些操作（如 ClickHouse 版本变更和 EKS 节点升级）可能会对服务产生影响。客户可以指定维护窗口（例如每周二太平洋时间凌晨 1:00），以确保此类升级仅在预定时间内执行。

:::note
维护窗口不适用于安全补丁和漏洞修复。这类升级将作为周期外升级进行处理，并通过及时沟通协调合适的时间，从而将对运行的影响降至最低。
:::

## CloudFormation IAM 角色 {#cloudformation-iam-roles}

### Bootstrap IAM 角色 {#bootstrap-iam-role}

Bootstrap IAM 角色具有以下权限：

- **EC2 和 VPC 操作**：用于创建和配置 VPC 以及 EKS 集群。
- **S3 操作（例如 `s3:CreateBucket`）**：用于创建 ClickHouse BYOC 存储使用的 bucket。
- **`route53:*` 权限**：供 external DNS 在 Route 53 中配置记录时使用。
- **IAM 操作（例如 `iam:CreatePolicy`）**：用于控制器创建额外角色（详细信息见下一节）。
- **EKS 操作**：仅限名称以 `clickhouse-cloud` 前缀开头的资源。

### 控制器创建的其他 IAM 角色 {#additional-iam-roles-created-by-the-controller}

除了通过 CloudFormation 创建的 `ClickHouseManagementRole` 之外，控制器还会创建多个其他角色。

这些角色由在客户 EKS 集群中运行的应用程序来获取并使用（assume）：

- **State Exporter Role（状态导出角色）**
  - ClickHouse 组件，用于向 ClickHouse Cloud 上报服务健康信息。
  - 需要有向 ClickHouse Cloud 拥有的 SQS 队列写入的权限。
- **Load-Balancer Controller（负载均衡控制器）**
  - 标准 AWS 负载均衡控制器。
  - 用于管理 ClickHouse 服务卷的 EBS CSI Controller。
- **External-DNS**
  - 将 DNS 配置同步到 Route 53。
- **Cert-Manager**
  - 为 BYOC 服务域名签发 TLS 证书。
- **Cluster Autoscaler**
  - 按需调整节点组大小。

**K8s-control-plane** 和 **k8s-worker** 角色由 AWS EKS 服务来获取并使用（assume）。

最后，**`data-plane-mgmt`** 允许一个 ClickHouse Cloud 控制平面组件对所需的自定义资源（例如 `ClickHouseCluster` 和 Istio Virtual Service/Gateway）进行协调（reconcile）。

## 网络边界 {#network-boundaries}

本节介绍往返于客户 BYOC VPC 的不同网络流量：

- **入站（Inbound）**：进入客户 BYOC VPC 的流量。
- **出站（Outbound）**：源自客户 BYOC VPC 并发送到外部目标的流量。
- **公网（Public）**：可从公共互联网访问的网络端点。
- **私网（Private）**：只能通过私有连接（例如 VPC Peering、VPC Private Link 或 Tailscale）访问的网络端点。

**Istio 入口部署在 AWS NLB 后方，用于接收 ClickHouse 客户端流量。**

*入站，公网（可配置为私网）*

Istio 入口网关终止 TLS 连接。由 CertManager 使用 Let's Encrypt 签发的证书作为 secret 存储在 EKS 集群中。由于 Istio 与 ClickHouse 位于同一 VPC，它们之间的流量[由 AWS 加密](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)。

默认情况下，入口通过 IP 允许列表过滤对公网开放。客户可以通过配置 VPC Peering 将其改为私网并禁用公网连接。我们强烈建议配置 [IP 过滤器](/cloud/security/setting-ip-filters) 来限制访问。

### 访问故障排查 {#troubleshooting-access}

*入站，公网（可配置为私网）*

ClickHouse Cloud 工程师需要通过 Tailscale 获取故障排查访问权限。他们在 BYOC 部署中通过基于证书的 Just-in-time 认证方式获得访问。

### 计费采集器 {#billing-scraper}

*出站，私网*

计费采集器从 ClickHouse 收集计费数据并将其发送到 ClickHouse Cloud 拥有的 S3 bucket。

它作为 sidecar 与 ClickHouse server 容器一起运行，定期采集 CPU 和内存指标。同一区域内的请求通过 VPC 网关服务端点进行路由。

### 告警 {#alerts}

*出站，公网*

AlertManager 被配置为在客户的 ClickHouse 集群状态异常时向 ClickHouse Cloud 发送告警。

指标和日志存储在客户的 BYOC VPC 内。日志当前本地存储在 EBS 中。在后续更新中，它们将被存储在 LogHouse 中，这是一个运行在 BYOC VPC 内的 ClickHouse 服务。指标使用 Prometheus 和 Thanos 技术栈，并在 BYOC VPC 内本地存储。

### 服务状态 {#service-state}

*出站*

State Exporter 向 ClickHouse Cloud 拥有的 SQS 队列发送 ClickHouse 服务状态信息。