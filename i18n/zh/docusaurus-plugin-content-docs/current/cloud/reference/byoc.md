---
title: BYOC (自带云) for AWS
slug: /cloud/reference/byoc
sidebar_label: BYOC (自带云)
keywords: [BYOC, cloud, 自带云]
description: 在您自己的云基础设施上部署 ClickHouse
---

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


## 概述 {#overview}

BYOC (自带云) 允许您在自己的云基础设施上部署 ClickHouse Cloud。如果您有特定的要求或约束，使您无法使用 ClickHouse Cloud 托管服务，那么这非常有用。

**如果您想获得访问权限，请 [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。** 有关更多信息，请参阅我们的 [服务条款](https://clickhouse.com/legal/agreements/terms-of-service)。

BYOC 当前仅支持 AWS，GCP 和 Microsoft Azure 正在开发中。

:::note 
BYOC 专为大规模部署而设计，需要客户签署承诺合同。
:::

## 术语表 {#glossary}

- **ClickHouse VPC:** 由 ClickHouse Cloud 拥有的 VPC。
- **客户 BYOC VPC:** 由客户云账户拥有的 VPC，由 ClickHouse Cloud 提供并管理，专门用于 ClickHouse Cloud BYOC 部署。
- **客户 VPC:** 由客户云账户拥有的其他 VPC，用于需要连接到客户 BYOC VPC 的应用程序。

## 架构 {#architecture}

指标和日志存储在客户的 BYOC VPC 内。日志当前存储在 EBS 的本地。在未来的更新中，日志将存储在 LogHouse 中，这是一个位于客户 BYOC VPC 中的 ClickHouse 服务。指标通过存储在客户 BYOC VPC 中的 Prometheus 和 Thanos 堆栈来实现。

<br />

<img src={byoc1}
    alt='BYOC 架构'
    class='image'
    style={{width: '800px'}}
/>

<br />

## 入驻流程 {#onboarding-process}

客户可以通过联系 [我们](https://clickhouse.com/cloud/bring-your-own-cloud) 来启动入驻流程。客户需要有一个专用的 AWS 账户并知道他们将使用的区域。目前，我们仅允许用户在我们支持的 ClickHouse Cloud 区域中启动 BYOC 服务。

### 准备一个专用的 AWS 账户 {#prepare-a-dedicated-aws-account}

客户必须准备一个专用的 AWS 账户来托管 ClickHouse BYOC 部署，以确保更好的隔离。通过这个账户和初始组织管理员电子邮件，您可以联系 ClickHouse 支持。

### 应用 CloudFormation 模板 {#apply-cloudformation-template}

BYOC 设置是通过 [CloudFormation stack](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) 初始化的，该 stack 仅创建一个角色，允许 ClickHouse Cloud 的 BYOC 控制器管理基础设施。用于运行 ClickHouse 的 S3、VPC 和计算资源不包括在此 stack 中。

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### 设置 BYOC 基础设施 {#setup-byoc-infrastructure}

创建 CloudFormation stack 后，系统将提示您从云控制台设置基础设施，包括 S3、VPC 和 EKS 集群。在此阶段必须确定某些配置，因为后续不能更改。具体如下：

- **您想使用的区域**，可以选择我们为 ClickHouse Cloud 提供的任何 [公共区域](/cloud/reference/supported-regions)。
- **BYOC 的 VPC CIDR 范围**：默认为 BYOC VPC CIDR 范围使用 `10.0.0.0/16`。如果您计划与其他账户使用 VPC 对等连接，请确保 CIDR 范围不重叠。为 BYOC 配置适当的 CIDR 范围，最小大小为 `/22`，以适应必要的工作负载。
- **BYOC VPC 的可用区**：如果您计划使用 VPC 对等连接，确保源账户和 BYOC 账户之间的可用区对齐可以帮助减少跨可用区流量费用。在 AWS 中，可用区后缀 (`a、b、c`) 可能在不同账户中代表不同的物理区域 ID。有关详细信息，请参阅 [AWS 指南](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)。

### 可选：设置 VPC 对等连接 {#optional-setup-vpc-peering}

要为 ClickHouse BYOC 创建或删除 VPC 对等连接，请按照以下步骤操作：

#### 第 1 步：启用 ClickHouse BYOC 的私有负载均衡器 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
联系 ClickHouse 支持以启用私有负载均衡器。

#### 第 2 步：创建对等连接 {#step-2-create-a-peering-connection}
1. 在 ClickHouse BYOC 账户中，导航到 VPC 控制台。
2. 选择对等连接。
3. 点击创建对等连接。
4. 将 VPC 请求者设置为 ClickHouse VPC ID。
5. 将 VPC 接受者设置为目标 VPC ID。（如适用选择其他账户）
6. 点击创建对等连接。

<br />

<img src={byoc_vpcpeering}
    alt='BYOC 创建对等连接'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 第 3 步：接受对等连接请求 {#step-3-accept-the-peering-connection-request}
转到对等账户，在（VPC -> 对等连接 -> 操作 -> 接受请求）页面，客户可以批准此 VPC 对等请求。

<br />

<img src={byoc_vpcpeering2}
    alt='BYOC 接受对等连接'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 第 4 步：将目标添加到 ClickHouse VPC 路由表 {#step-4-add-destination-to-clickhouse-vpc-route-tables}
在 ClickHouse BYOC 账户中，
1. 在 VPC 控制台中选择路由表。
2. 搜索 ClickHouse VPC ID。编辑每个附加到私有子网的路由表。
3. 点击路由选项卡下的编辑按钮。
4. 点击添加另一路由。
5. 输入目标 VPC 的 CIDR 范围作为目的地。
6. 选择 “对等连接” 和对等连接的 ID 作为目标。

<br />

<img src={byoc_vpcpeering3}
    alt='BYOC 添加路由表'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 第 5 步：将目标添加到目标 VPC 路由表 {#step-5-add-destination-to-the-target-vpc-route-tables}
在对等 AWS 账户中，
1. 在 VPC 控制台中选择路由表。
2. 搜索目标 VPC ID。
3. 点击路由选项卡下的编辑按钮。
4. 点击添加另一路由。
5. 输入 ClickHouse VPC 的 CIDR 范围作为目的地。
6. 选择 “对等连接” 和对等连接的 ID 作为目标。

<br />

<img src={byoc_vpcpeering4}
    alt='BYOC 添加路由表'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 第 6 步：编辑安全组以允许对等 VPC 访问 {#step-6-edit-security-group-to-allow-peered-vpc-access}
在 ClickHouse BYOC 账户中，
1. 在 ClickHouse BYOC 账户中，导航到 EC2，找到名为 infra-xx-xxx-ingress-private 的私有负载均衡器。

<br />

<img src={byoc_plb}
    alt='BYOC 私有负载均衡器'
    class='image'
    style={{width: '800px'}}
/>

<br />

2. 在详细信息页面的安全选项卡下，找到相关的安全组，其命名模式类似于 `k8s-istioing-istioing-xxxxxxxxx`。

<br />

<img src={byoc_security}
    alt='BYOC 私有负载均衡器安全组'
    class='image'
    style={{width: '800px'}}
/>

<br />

3. 编辑该安全组的入站规则，并添加对等 VPC CIDR 范围（或根据需要指定所需的 CIDR 范围）。

<br />

<img src={byoc_inbound}
    alt='BYOC 安全组入站规则'
    class='image'
    style={{width: '800px'}}
/>

<br />

ClickHouse 服务现在应该可以从对等 VPC 访问。

要私下访问 ClickHouse，将为用户的对等 VPC 提供私有负载均衡器和端点以确保安全连接。私有端点遵循公共端点格式，并带有 `-private` 后缀。例如：
- **公共端点**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **私有端点**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选，在验证对等连接有效后，您可以请求移除 ClickHouse BYOC 的公共负载均衡器。

## 升级流程 {#upgrade-process}

我们定期升级软件，包括 ClickHouse 数据库版本升级、ClickHouse 操作员、EKS 及其他组件。

虽然我们旨在实现无缝升级（例如，滚动升级和重启），但某些升级（如 ClickHouse 版本更改和 EKS 节点升级）可能会影响服务。客户可以指定维护时间窗口（例如，每周二上午 1:00 PDT），确保这样的升级仅在计划时间内进行。

:::note
维护窗口不适用于安全性和漏洞修复。这些如果需要将作为非周期性升级处理，并及时沟通协调合适的时间以最大限度减少运营影响。
:::

## CloudFormation IAM 角色 {#cloudformation-iam-roles}

### 启动 IAM 角色 {#bootstrap-iam-role}

启动 IAM 角色具有以下权限：

- **EC2 和 VPC 操作**：设置 VPC 和 EKS 集群所需。
- **S3 操作 (例如 `s3:CreateBucket`)**：创建 ClickHouse BYOC 存储桶所需。
- **`route53:*` 权限**：为外部 DNS 配置 Route 53 中的记录所需。
- **IAM 操作 (例如 `iam:CreatePolicy`)**：容许控制器创建附加角色（详情见下节）。
- **EKS 操作**：限于名称以 `clickhouse-cloud` 前缀开头的资源。

### 控制器创建的附加 IAM 角色 {#additional-iam-roles-created-by-the-controller}

除了通过 CloudFormation 创建的 `ClickHouseManagementRole`，控制器还将创建几个附加角色。

这些角色将由客户的 EKS 集群中运行的应用程序假定：
- **状态导出者角色**
  - ClickHouse 组件，将服务健康信息报告给 ClickHouse Cloud。
  - 需要有权写入 ClickHouse Cloud 所拥有的 SQS 队列。
- **负载均衡器控制器**
  - 标准 AWS 负载均衡器控制器。
  - EBS CSI 控制器，用于管理 ClickHouse 服务的卷。
- **外部 DNS**
  - 将 DNS 配置传播到 Route 53。
- **证书管理器**
  - 为 BYOC 服务域配置 TLS 证书。
- **集群自动缩放器**
  - 根据需要调整节点组大小。

**K8s-control-plane** 和 **k8s-worker** 角色用于被 AWS EKS 服务假定。

最后，**`data-plane-mgmt`** 允许 ClickHouse Cloud 控制平面组件调和所需的自定义资源，如 `ClickHouseCluster` 和 Istio 虚拟服务/网关。

## 网络边界 {#network-boundaries}

本节涵盖客户 BYOC VPC 的不同网络流量：

- **入站**：进入客户 BYOC VPC 的流量。
- **出站**：从客户 BYOC VPC 发起并发送到外部目的地的流量。
- **公共**：可从公共互联网访问的网络端点。
- **私有**：仅通过私有连接可访问的网络端点，如 VPC 对等、VPC 私有链接或 Tailscale。

**Istio 入口通过 AWS NLB 部署，以接受 ClickHouse 客户端流量。**

*入站，公共（可以是私有）*

Istio 入口网关终止 TLS。由 CertManager 使用 Let's Encrypt 提供的证书存储为 EKS 集群中的密钥。Istio 和 ClickHouse 之间的流量通过 [AWS 加密](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)，因为它们位于同一 VPC 中。

默认情况下，入口是公开可访问的，并具有 IP 允许列表过滤。客户可以配置 VPC 对等连接以使其变为私有并禁用公共连接。我们强烈建议设置 [IP 过滤器](/cloud/security/setting-ip-filters) 来限制访问。

### 访问故障排除 {#troubleshooting-access}

*入站，公共（可以是私有）*

ClickHouse Cloud 工程师需要通过 Tailscale 获取故障排除访问权限。他们会获得按需证书的临时认证，以用于 BYOC 部署。

### 计费收集器 {#billing-scraper}

*出站，私有*

计费收集器从 ClickHouse 收集计费数据并将其发送到 ClickHouse Cloud 所拥有的 S3 存储桶。

它作为 ClickHouse 服务器容器的侧车运行，定期抓取 CPU 和内存指标。同一区域内的请求通过 VPC 网关服务端点路由。

### 警报 {#alerts}

*出站，公共*

当客户的 ClickHouse 集群出现异常时，AlertManager 被配置为向 ClickHouse Cloud 发送警报。

指标和日志存储在客户的 BYOC VPC 内。日志当前存储在 EBS 的本地。在未来的更新中，它们将存储在 LogHouse，此服务位于 BYOC VPC 内。指标使用存储在 BYOC VPC 中的 Prometheus 和 Thanos 堆栈。

### 服务状态 {#service-state}

*出站*

状态导出者将 ClickHouse 服务状态信息发送到 ClickHouse Cloud 所拥有的 SQS 中。

## 特征 {#features}

### 支持的特性 {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud 和 BYOC 使用相同的二进制文件和配置。因此 BYOC 中支持 ClickHouse 核心的所有特性，例如 SharedMergeTree。
- **用于管理服务状态的控制台访问**：
  - 支持启动、停止和终止等操作。
  - 查看服务及其状态。
- **备份与恢复**。
- **手动垂直和水平扩展**。
- **闲置**。
- **仓库**：计算-计算分离。
- **通过 Tailscale 实现零信任网络**。
- **监控**：
  - 云控制台包含内置健康仪表盘以监控服务健康。
  - Prometheus 抓取用于Prometheus、Grafana 和 Datadog 的集中监控。有关设置说明，请参见 [Prometheus 文档](/integrations/prometheus)。
- **VPC 对等连接**。
- **集成**：请查看 [此页面](/integrations) 的完整列表。
- **安全 S3**。
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**。

### 计划中的功能（当前不支持） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 或 CMEK（客户管理的加密密钥）。
- ClickPipes 用于数据摄取。
- 自动伸缩。
- MySQL 接口。

## 常见问题 {#faq}

### 计算 {#compute}

#### 我可以在此单个 EKS 集群中创建多个服务吗？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

可以。基础设施只需为每个 AWS 账户和区域组合配置一次。

### 您支持哪些区域的 BYOC？ {#which-regions-do-you-support-for-byoc}

BYOC 支持与 ClickHouse Cloud 相同的一组 [区域](/cloud/reference/supported-regions#aws-regions )。

#### 是否会有一些资源开销？运行 ClickHouse 实例以外的服务需要什么资源？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

除 Clickhouse 实例（ClickHouse 服务器和 ClickHouse Keeper）外，我们还运行 `clickhouse-operator`、`aws-cluster-autoscaler`、Istio 等服务和我们的监控堆栈。

目前，我们在专用节点组中有 3 个 m5.xlarge 节点（每个可用区一个）来运行这些工作负载。

### 网络与安全 {#network-and-security}

#### 安装完成后，我们可以撤销安装过程中设置的权限吗？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

目前不可能。

#### 您是否考虑了未来的一些安全措施，以便 ClickHouse 工程师访问客户基础设施进行故障排除？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

是的。实现一种客户控制的机制，让客户可以批准工程师访问集群的功能在我们的路线图上。目前，工程师必须通过我们的内部升级程序获得集群的按需访问权限。此过程会被我们的安全团队记录并审计。

#### 创建的 VPC IP 范围的大小是多少？ {#what-is-the-size-of-the-vpc-ip-range-created}

默认情况下，我们为 BYOC VPC 使用 `10.0.0.0/16`。我们建议至少保留 /22 的范围，以备将来扩展，但是如果您希望限制大小，可以使用 /23 如果您很可能会限制在 30 个服务 pod 的情况下。

#### 我可以决定维护频率吗？ {#can-i-decide-maintenance-frequency}

请联系支持以安排维护窗口。请期待至少每周一次的更新计划。

## 可观察性 {#observability}

### 内置监控工具 {#built-in-monitoring-tools}

#### 可观察性仪表板 {#observability-dashboard}

ClickHouse Cloud 包含一个高级可观察性仪表板，显示内存使用率、查询速率和 I/O 等指标。这可以在 ClickHouse Cloud 网络控制台界面的 **监控** 部分访问。

<br />

<img src={byoc3}
    alt='可观察性仪表板'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### 高级仪表板 {#advanced-dashboard}

您可以使用 `system.metrics`、`system.events` 和 `system.asynchronous_metrics` 等系统表中的指标来自定义仪表板，以详细监控服务器性能和资源使用情况。

<br />

<img src={byoc4}
    alt='高级仪表板'
    class='image'
    style={{width: '800px'}}
/>

<br />

#### Prometheus 集成 {#prometheus-integration}

ClickHouse Cloud 提供一个 Prometheus 端点，您可以使用它抓取监控指标。这允许与 Grafana 和 Datadog 等工具集成进行可视化。

**通过 https 端点 /metrics_all 的示例请求**

```bash
curl --user <username>:<password> https://i6ro4qarho.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud:8443/metrics_all
```

**示例响应**

```bash

# HELP ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes 存储在系统数据库的 `s3disk` 磁盘上的字节数

# TYPE ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes gauge
ClickHouse_CustomMetric_StorageSystemTablesS3DiskBytes{hostname="c-jet-ax-16-server-43d5baj-0"} 62660929

# HELP ClickHouse_CustomMetric_NumberOfBrokenDetachedParts 破损的分离部分数量

# TYPE ClickHouse_CustomMetric_NumberOfBrokenDetachedParts gauge
ClickHouse_CustomMetric_NumberOfBrokenDetachedParts{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_LostPartCount 最旧突变的年龄（以秒为单位）

# TYPE ClickHouse_CustomMetric_LostPartCount gauge
ClickHouse_CustomMetric_LostPartCount{hostname="c-jet-ax-16-server-43d5baj-0"} 0

# HELP ClickHouse_CustomMetric_NumberOfWarnings 服务器发出的警告数量。它通常指示可能的错误配置

# TYPE ClickHouse_CustomMetric_NumberOfWarnings gauge
ClickHouse_CustomMetric_NumberOfWarnings{hostname="c-jet-ax-16-server-43d5baj-0"} 2

# HELP ClickHouseErrorMetric_FILE_DOESNT_EXIST FILE_DOESNT_EXIST

# TYPE ClickHouseErrorMetric_FILE_DOESNT_EXIST counter
ClickHouseErrorMetric_FILE_DOESNT_EXIST{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 1

# HELP ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE UNKNOWN_ACCESS_TYPE

# TYPE ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE counter
ClickHouseErrorMetric_UNKNOWN_ACCESS_TYPE{hostname="c-jet-ax-16-server-43d5baj-0",table="system.errors"} 8

# HELP ClickHouse_CustomMetric_TotalNumberOfErrors 自上次重启以来服务器上的错误总数

# TYPE ClickHouse_CustomMetric_TotalNumberOfErrors gauge
ClickHouse_CustomMetric_TotalNumberOfErrors{hostname="c-jet-ax-16-server-43d5baj-0"} 9
```

**身份验证**

可以使用 ClickHouse 的用户名和密码进行身份验证。我们建议创建一个具有最低权限的专用用户用于抓取指标。至少，`system.custom_metrics` 表上的 `READ` 权限在所有副本上都是必需的。例如：

```sql
GRANT REMOTE ON *.* TO scraping_user
GRANT SELECT ON system.custom_metrics TO scraping_user
```

**配置 Prometheus**

下面展示了一个示例配置。`targets` 端点与访问 ClickHouse 服务时使用的端点相同。

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

请参见 [这篇博文](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) 和 [ClickHouse 的 Prometheus 设置文档](/integrations/prometheus)。
