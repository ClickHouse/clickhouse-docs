---
'title': 'AWS 的 BYOC (Bring Your Own Cloud)'
'slug': '/cloud/reference/byoc'
'sidebar_label': 'BYOC (Bring Your Own Cloud)'
'keywords':
- 'BYOC'
- 'cloud'
- 'bring your own cloud'
'description': '在您自己的云基础设施上部署 ClickHouse'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';
import byoc4 from '@site/static/images/cloud/reference/byoc-4.png';
import byoc3 from '@site/static/images/cloud/reference/byoc-3.png';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_plb from '@site/static/images/cloud/reference/byoc-plb.png';
import byoc_security from '@site/static/images/cloud/reference/byoc-securitygroup.png';
import byoc_inbound from '@site/static/images/cloud/reference/byoc-inbound-rule.png';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'

## 概述 {#overview}

BYOC (自带云) 允许您在自己的云基础设施上部署 ClickHouse Cloud。如果您有特定要求或限制，无法使用 ClickHouse Cloud 托管服务，这将非常有用。

**如果您希望获得访问权限，请 [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。** 有关更多信息，请参阅我们的 [服务条款](https://clickhouse.com/legal/agreements/terms-of-service)。

目前，BYOC 仅支持 AWS。您可以在 [这里](https://clickhouse.com/cloud/bring-your-own-cloud) 加入 GCP 和 Azure 的等待名单。

:::note 
BYOC 专为大规模部署设计，并要求客户签署保留合同。
:::

## 术语表 {#glossary}

- **ClickHouse VPC：** 由 ClickHouse Cloud 拥有的 VPC。
- **客户 BYOC VPC：** 由客户的云账户拥有的 VPC，由 ClickHouse Cloud 提供和管理，专用于 ClickHouse Cloud BYOC 部署。
- **客户 VPC：** 其他由客户云账户拥有的 VPC，用于需要连接到客户 BYOC VPC 的应用程序。

## 架构 {#architecture}

指标和日志存储在客户的 BYOC VPC 内。日志目前存储在本地 EBS 中。在未来的更新中，日志将存储在 LogHouse 中，这是一个 ClickHouse 服务，位于客户的 BYOC VPC 中。指标通过存储在客户 BYOC VPC 中的 Prometheus 和 Thanos 堆栈实现。

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />

## 上线流程 {#onboarding-process}

客户可以通过联系 [我们](https://clickhouse.com/cloud/bring-your-own-cloud) 来启动上线流程。客户需要有一个专用的 AWS 账户并了解他们将使用的区域。目前，我们仅允许用户在我们支持的 ClickHouse Cloud 区域内启动 BYOC 服务。

### 准备 AWS 账户 {#prepare-an-aws-account}

我们建议客户准备一个专用的 AWS 账户，以托管 ClickHouse BYOC 部署，以确保更好的隔离。然而，使用共享账户和现有 VPC 也是可以的。有关详细信息，请参阅下面的 *设置 BYOC 基础设施*。

拥有此账户和初始组织管理员电子邮件后，您可以联系 ClickHouse 支持。

### 初始化 BYOC 设置 {#initialize-byoc-setup}

初始 BYOC 设置可以使用 CloudFormation 模板或 Terraform 模块进行。两种方法都创建相同的 IAM 角色，使来自 ClickHouse Cloud 的 BYOC 控制器能够管理您的基础设施。请注意，运行 ClickHouse 所需的 S3、VPC 和计算资源不包括在此初始设置中。

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

创建 CloudFormation 栈后，系统会提示您从云控制台设置基础设施，包括 S3、VPC 和 EKS 集群。在此阶段必须确定某些配置，因为之后无法更改。具体包括：

- **您要使用的区域**，您可以选择我们为 ClickHouse Cloud 提供的任何 [公共区域](/cloud/reference/supported-regions)。
- **BYOC 的 VPC CIDR 范围**：默认情况下，我们使用 `10.0.0.0/16` 作为 BYOC VPC CIDR 范围。如果您打算与另一个账户进行 VPC 对等互联，请确保 CIDR 范围不重叠。为 BYOC 分配适当的 CIDR 范围，最小大小为 `/22` 以容纳必需的工作负载。
- **BYOC VPC 的可用区**：如果您打算使用 VPC 对等互联，源账户和 BYOC 账户之间的可用区对齐可以帮助降低跨 AZ 流量费用。在 AWS 中，可用区后缀（`a, b, c`）可能表示不同账户中的不同物理区域 ID。有关详细信息，请参阅 [AWS 指南](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)。

#### 客户管理的 VPC {#customer-managed-vpc}
默认情况下，ClickHouse Cloud 将为您的 BYOC 部署提供一个专用 VPC，以确保更好的隔离。然而，您也可以在您的账户中使用现有 VPC。这需要特定配置，并且必须通过 ClickHouse 支持协调。

**配置您的现有 VPC**
1. 为 ClickHouse Cloud 使用的至少 3 个不同可用区分配 3 个私有子网。
2. 确保每个子网的最小 CIDR 范围为 `/23`（例如，10.0.0.0/23），以为 ClickHouse 部署提供足够的 IP 地址。
3. 在每个子网上添加标签 `kubernetes.io/role/internal-elb=1` 以启用正确的负载均衡器配置。

<br />

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC Subnet" background='black'/>

<br />

<br />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC Subnet Tags" background='black'/>

<br />

4. 配置 S3 网关端点
如果您的 VPC 尚未配置 S3 网关端点，则需要创建一个，以实现 VPC 和 Amazon S3 之间的安全私密通信。此端点允许您的 ClickHouse 服务访问 S3，而无需经过公共互联网。请参考下面的屏幕截图，了解示例配置。

<br />

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpint" background='black'/>

<br />

**联系 ClickHouse 支持**  
创建支持票据，提供以下信息：

* 您的 AWS 账户 ID
* 您希望部署服务的 AWS 区域
* 您的 VPC ID
* 您为 ClickHouse 分配的私有子网 ID
* 这些子网所在的可用区

### 可选：设置 VPC 对等互联 {#optional-setup-vpc-peering}

要为 ClickHouse BYOC 创建或删除 VPC 对等互联，请按照以下步骤操作：

#### 第 1 步：为 ClickHouse BYOC 启用私有负载均衡器 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
联系 ClickHouse 支持以启用私有负载均衡器。

#### 第 2 步：创建对等连接 {#step-2-create-a-peering-connection}
1. 导航到 ClickHouse BYOC 账户中的 VPC 控制台。
2. 选择 Peering Connections。
3. 点击 Create Peering Connection。
4. 将 VPC Requester 设置为 ClickHouse VPC ID。
5. 将 VPC Accepter 设置为目标 VPC ID。（如适用，请选择其他账户）
6. 点击 Create Peering Connection。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Create Peering Connection" border />

<br />

#### 第 3 步：接受对等连接请求 {#step-3-accept-the-peering-connection-request}
转到对等账户，在 (VPC -> Peering connections -> Actions -> Accept request) 页面，客户可以批准此 VPC 对等请求。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Accept Peering Connection" border />

<br />

#### 第 4 步：将目标添加到 ClickHouse VPC 路由表 {#step-4-add-destination-to-clickhouse-vpc-route-tables}
在 ClickHouse BYOC 账户中，
1. 在 VPC 控制台中选择 Route Tables。
2. 搜索 ClickHouse VPC ID。编辑附加到私有子网的每个路由表。
3. 点击 Routes 标签下的 Edit 按钮。
4. 点击 Add another route。
5. 输入目标 VPC 的 CIDR 范围作为 Destination。
6. 选择 “Peering Connection” 和对等连接的 ID 作为 Target。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC Add route table" border />

<br />

#### 第 5 步：将目标添加到目标 VPC 路由表 {#step-5-add-destination-to-the-target-vpc-route-tables}
在对等 AWS 账户中，
1. 在 VPC 控制台中选择 Route Tables。
2. 搜索目标 VPC ID。
3. 点击 Routes 标签下的 Edit 按钮。
4. 点击 Add another route。
5. 输入 ClickHouse VPC 的 CIDR 范围作为 Destination。
6. 选择 “Peering Connection” 和对等连接的 ID 作为 Target。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC Add route table" border />

<br />

#### 第 6 步：编辑安全组以允许对等 VPC 访问 {#step-6-edit-security-group-to-allow-peered-vpc-access}
在 ClickHouse BYOC 账户中，您需要更新安全组设置以允许来自对等 VPC 的流量。请联系 ClickHouse 支持请求添加包括对等 VPC 的 CIDR 范围的入站规则。

---
现在 ClickHouse 服务应该可以从对等 VPC 访问。

为了私密访问 ClickHouse，为用户的对等 VPC 提供了私有负载均衡器和端点。私有端点遵循公共端点格式，并带有 `-private` 后缀。例如：
- **公共端点**： `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **私有端点**： `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选，在验证对等互联正常后，您可以请求移除 ClickHouse BYOC 的公共负载均衡器。

## 升级流程 {#upgrade-process}

我们定期升级软件，包括 ClickHouse 数据库版本升级、ClickHouse Operator、EKS 和其他组件。

尽管我们旨在实现无缝升级（例如，滚动升级和重启），但某些升级（如 ClickHouse 版本变化和 EKS 节点升级）可能会影响服务。客户可以指定维护窗口（例如，每周二凌晨 1:00 PDT），确保此类升级仅在计划时间内进行。

:::note
维护窗口不适用于安全性和漏洞修复。这些作为周期外升级处理，并及时沟通以协调合适的时间，尽量减少运营影响。
:::

## CloudFormation IAM 角色 {#cloudformation-iam-roles}

### 启动 IAM 角色 {#bootstrap-iam-role}

启动 IAM 角色具有以下权限：

- **EC2 和 VPC 操作**：设置 VPC 和 EKS 集群所需。
- **S3 操作（例如，`s3:CreateBucket`）**：创建 ClickHouse BYOC 存储桶所需。
- **`route53:*` 权限**：外部 DNS 配置 Route 53 中的记录所需。
- **IAM 操作（例如，`iam:CreatePolicy`）**：控制器创建其他角色所需（详细信息请参阅下一节）。
- **EKS 操作**：仅限于名称以 `clickhouse-cloud` 前缀开头的资源。

### 控制器创建的其他 IAM 角色 {#additional-iam-roles-created-by-the-controller}

除了通过 CloudFormation 创建的 `ClickHouseManagementRole`，控制器还将创建若干其他角色。

这些角色由运行在客户 EKS 集群中的应用程序承担：
- **状态导出角色**
  - ClickHouse 组件，向 ClickHouse Cloud 报告服务健康信息。
  - 需要写入 ClickHouse Cloud 拥有的 SQS 队列的权限。
- **负载均衡器控制器**
  - 标准 AWS 负载均衡器控制器。
  - EBS CSI 控制器用于管理 ClickHouse 服务的卷。
- **外部 DNS**
  - 将 DNS 配置传播到 Route 53。
- **证书管理器**
  - 为 BYOC 服务域名提供 TLS 证书。
- **集群自动缩放器**
  - 根据需要调整节点组大小。

**K8s-control-plane** 和 **k8s-worker** 角色旨在由 AWS EKS 服务承担。

最后，**`data-plane-mgmt`** 允许 ClickHouse Cloud 控制平面组件协调必需的自定义资源，如 `ClickHouseCluster` 和 Istio 虚拟服务/网关。

## 网络边界 {#network-boundaries}

本节涵盖进出客户 BYOC VPC 的不同网络流量：

- **入站**：进入客户 BYOC VPC 的流量。
- **出站**：源自客户 BYOC VPC 并发送到外部目的地的流量。
- **公共**：可从公共互联网访问的网络端点。
- **私有**：仅通过私有连接（例如 VPC 对等、VPC 私有链接或 Tailscale）访问的网络端点。

**Istio ingress 部署在 AWS NLB 后面，以接收 ClickHouse 客户端流量。**

*入站、公共（可以是私有）*

Istio ingress 网关终止 TLS。由 CertManager 使用 Let's Encrypt 提供的证书存储为 EKS 集群内的秘密。Istio 和 ClickHouse 之间的流量由 AWS [加密](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)，因为他们位于同一个 VPC 中。

默认情况下，入口是公开访问的，并带有 IP 允许列表过滤。客户可以配置 VPC 对等以使其成为私有，并禁用公共连接。我们强烈建议设置 [IP 过滤器](/cloud/security/setting-ip-filters) 以限制访问。

### 访问故障排除 {#troubleshooting-access}

*入站、公共（可以是私有）*

ClickHouse Cloud 工程师需要通过 Tailscale 进行故障排除访问。他们以适时证书为基础的身份验证来授权 BYOC 部署。

### 计费抓取器 {#billing-scraper}

*出站、私有*

计费抓取器从 ClickHouse 收集计费数据并将其发送到 ClickHouse Cloud 拥有的 S3 存储桶。

它作为 ClickHouse 服务器容器的侧车运行，定期抓取 CPU 和内存指标。同一区域内的请求通过 VPC 网关服务端点进行路由。

### 警报 {#alerts}

*出站、公共*

当客户的 ClickHouse 集群不健康时，AlertManager 被配置为向 ClickHouse Cloud 发送警报。

指标和日志存储在客户的 BYOC VPC 内。日志目前存储在本地 EBS 中。在未来的更新中，它们将被存储在 LogHouse 中，这是位于 BYOC VPC 内的 ClickHouse 服务。指标使用 Prometheus 和 Thanos 堆栈，本地存储在 BYOC VPC 中。

### 服务状态 {#service-state}

*出站*

状态导出器将 ClickHouse 服务状态信息发送到 ClickHouse Cloud 拥有的 SQS。

## 功能 {#features}

### 支持的功能 {#supported-features}

- **SharedMergeTree**：ClickHouse Cloud 和 BYOC 使用相同的二进制文件和配置。因此，ClickHouse 核心中的所有功能在 BYOC 中都得到支持，例如 SharedMergeTree。
- **管理服务状态的控制台访问**：
  - 支持启动、停止和终止等操作。
  - 查看服务和状态。
- **备份和恢复。**
- **手动垂直和水平扩展。**
- **空闲。**
- **仓库**：计算-计算分离。
- **通过 Tailscale 实现零信任网络。**
- **监控**：
  - 云控制台包括内置健康仪表板以监控服务健康。
  - Prometheus 抓取，用于与 Prometheus、Grafana 和 Datadog 进行集中监控。有关设置说明，请参见 [Prometheus 文档](/integrations/prometheus)。
- **VPC 对等。**
- **集成**：完整列表请见 [此页面](/integrations)。
- **安全 S3。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 计划功能（当前不支持） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 也称为 CMEK（客户管理的加密密钥）
- ClickPipes 进行摄取
- 自动缩放
- MySQL 接口

## 常见问题 {#faq}

### 计算 {#compute}

#### 我可以在这个单一的 EKS 集群中创建多个服务吗？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

可以。每个 AWS 账户和区域组合所需的基础设施只需要准备一次。

### 您支持哪个地区的 BYOC？ {#which-regions-do-you-support-for-byoc}

BYOC 支持与 ClickHouse Cloud 相同的一组 [区域](/cloud/reference/supported-regions#aws-regions)。

#### 会有一些资源开销吗？运行 ClickHouse 实例以外的服务需要什么资源？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

除了 ClickHouse 实例（ClickHouse 服务器和 ClickHouse Keeper）外，我们还运行 `clickhouse-operator`、`aws-cluster-autoscaler`、Istio 等服务以及我们的监控堆栈。

目前我们在专用节点组中有 3 个 m5.xlarge 节点（每个 AZ 一个）来运行这些工作负载。

### 网络和安全 {#network-and-security}

#### 完成设置后，我们能否撤销在安装期间设置的权限？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

目前不可能。

#### 您是否考虑了一些未来的安全控制措施，以便 ClickHouse 工程师可以访问客户基础设施进行故障排除？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

是的。实施客户控制机制，让客户批准工程师对集群的访问已经在我们的路线图上。目前，工程师必须通过内部升级流程来获得及时访问集群的权限。这是由我们的安全团队记录和审核的。

#### 创建的 VPC IP 范围的大小是多少？ {#what-is-the-size-of-the-vpc-ip-range-created}

默认情况下，我们对 BYOC VPC 使用 `10.0.0.0/16`。我们建议至少保留 /22 进行潜在的未来扩展，但如果您希望限制大小，如果您可能仅限于 30 个服务器 pods，可以使用 /23。

#### 我可以决定维护频率吗？ {#can-i-decide-maintenance-frequency}

请联系支持以安排维护窗口。请期待至少每周更新计划。

## 可观察性 {#observability}

### 内置监控工具 {#built-in-monitoring-tools}
ClickHouse BYOC 提供几种方法以适应不同的用例。

#### 可观察性仪表板 {#observability-dashboard}

ClickHouse Cloud 包含一个先进的可观察性仪表板，显示内存使用情况、查询速率和 I/O 等指标。您可以在 ClickHouse Cloud 网页控制台的 **监控** 部分访问。

<br />

<Image img={byoc3} size="lg" alt="Observability dashboard" border />

<br />

#### 高级仪表板 {#advanced-dashboard}

您可以使用来自系统表的指标，如 `system.metrics`、`system.events` 和 `system.asynchronous_metrics` 等，自定义仪表板以详细监控服务器性能和资源利用率。

<br />

<Image img={byoc4} size="lg" alt="Advanced dashboard" border />

<br />

#### 访问 BYOC Prometheus 堆栈 {#prometheus-access}
ClickHouse BYOC 在您的 Kubernetes 集群上部署了 Prometheus 堆栈。您可以从中访问和抓取指标，并将其与您自己的监控堆栈集成。

联系 ClickHouse 支持以启用私有负载均衡器并请求 URL。请注意，该 URL 仅通过私有网络访问，并不支持身份验证。

**示例 URL**
```bash
https://prometheus-internal.<subdomain>.<region>.aws.clickhouse-byoc.com/query
```

#### Prometheus 集成 {#prometheus-integration}

**弃用：** 请改用上述部分中的 Prometheus 堆栈集成。除了 ClickHouse 服务器指标外，它还提供更多指标，包括 K8S 指标和其他服务的指标。

ClickHouse Cloud 提供一个 Prometheus 端点，您可以用来抓取监控指标。这允许与 Grafana 和 Datadog 等工具集成以实现可视化。

**通过 HTTPS 端点 /metrics_all 的示例请求**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**示例响应**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes The amount of bytes stored on disk `s3disk` in system database

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts The number of broken detached parts

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount The age of the oldest mutation (in seconds)

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings The number of warnings issued by the server. It usually indicates about possible misconfiguration

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors The total number of errors on server since the last restart

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**身份验证**

可以使用 ClickHouse 用户名和密码对身份进行验证。我们建议创建具有最低权限的专用用户以抓取指标。至少需要在所有副本的 `system.custom_metrics` 表上具有 `READ` 权限。例如：

```sql
GRANT REMOTE ON *.* TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_custom_metrics_tables TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_database_replicated_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_failed_mutations TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_group TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_shared_catalog_recovery_time TO scrapping_user;
GRANT SELECT ON system._custom_metrics_dictionary_table_read_only_duration_seconds TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_error_metrics TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_histograms TO scrapping_user;
GRANT SELECT ON system._custom_metrics_view_metrics_and_events TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.asynchronous_metrics TO scrapping_user;
GRANT SELECT ON system.custom_metrics TO scrapping_user;
GRANT SELECT(name, value) ON system.errors TO scrapping_user;
GRANT SELECT(description, event, value) ON system.events TO scrapping_user;
GRANT SELECT(description, labels, metric, value) ON system.histogram_metrics TO scrapping_user;
GRANT SELECT(description, metric, value) ON system.metrics TO scrapping_user;
```

**配置 Prometheus**

下面是示例配置。`targets` 端点与访问 ClickHouse 服务使用的端点相同。

```bash
global:
 scrape_interval: 15s

scrape_configs:
 - job_name: "prometheus"
   static_configs:
   - targets: ["localhost:9090"]
 - job_name: "clickhouse"
   static_configs:
     - targets: ["<subdomain1>.<subdomain2>.aws.byoc.clickhouse.cloud:8443"]
   scheme: https
   metrics_path: "/metrics_all"
   basic_auth:
     username: <KEY_ID>
     password: <KEY_SECRET>
   honor_labels: true
```

请参见 [这篇博客文章](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) 和 [ClickHouse 的 Prometheus 设置文档](/integrations/prometheus)。

### 正常运行时间 SLA {#uptime-sla}

#### ClickHouse 为 BYOC 提供正常运行时间 SLA 吗？ {#uptime-sla-for-byoc}

不提供，因为数据平面托管在客户的云环境中，服务可用性取决于 ClickHouse 无法控制的资源。因此，ClickHouse 不为 BYOC 部署提供正式的正常运行时间 SLA。如果您有其他问题，请联系 support@clickhouse.com。
