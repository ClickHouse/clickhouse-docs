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

## 概述 {#overview}

BYOC (自带云) 允许您在自己的云基础设施上部署 ClickHouse Cloud。如果您有特定的要求或限制，无法使用 ClickHouse Cloud 管理服务，这将非常有用。

**如果您希望获取访问权限，请 [联系我们](https://clickhouse.com/cloud/bring-your-own-cloud)。** 请参阅我们的 [服务条款](https://clickhouse.com/legal/agreements/terms-of-service) 获取更多信息。

BYOC 目前仅支持 AWS。您可以在此处加入 GCP 和 Azure 的候补名单 [here](https://clickhouse.com/cloud/bring-your-own-cloud)。

:::note 
BYOC 专为大规模部署而设计，要求客户签署承诺合同。
:::

## 词汇表 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloud 所拥有的 VPC。
- **客户 BYOC VPC:** 由客户的云账户拥有的 VPC，由 ClickHouse Cloud 提供和管理，专用于 ClickHouse Cloud BYOC 部署。
- **客户 VPC** 客户云账户拥有的其他 VPC，用于需要连接到客户 BYOC VPC 的应用程序。

## 架构 {#architecture}

指标和日志存储在客户的 BYOC VPC 中。日志当前存储在 EBS 本地。未来的更新中，日志将存储在 LogHouse 中，这是客户 BYOC VPC 中的 ClickHouse 服务。指标通过在客户 BYOC VPC 中本地存储的 Prometheus 和 Thanos 堆栈来实现。

<br />

<Image img={byoc1} size="lg" alt="BYOC 架构" background='black'/>

<br />

## 入驻流程 {#onboarding-process}

客户可以通过联系 [我们](https://clickhouse.com/cloud/bring-your-own-cloud) 来启动入驻流程。客户需要拥有一个专用的 AWS 账户，并了解将要使用的区域。目前，我们仅允许用户在我们支持的 ClickHouse Cloud 区域内启动 BYOC 服务。

### 准备一个专用的 AWS 账户 {#prepare-a-dedicated-aws-account}

客户必须准备一个专用的 AWS 账户来托管 ClickHouse BYOC 部署，以确保更好的隔离。借助此账户及初始组织管理员电子邮件，您可以联系 ClickHouse 支持。

### 应用 CloudFormation 模板 {#apply-cloudformation-template}

BYOC 设置是通过一个 [CloudFormation 堆栈](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) 初始化的，该堆栈仅创建一个角色，允许 ClickHouse Cloud 的 BYOC 控制器管理基础设施。运行 ClickHouse 的 S3、VPC 和计算资源不包含在此堆栈中。

<!-- TODO: Add Screenshot for the rest of onboarding, once self-served onboarding is implemented. -->

### 设置 BYOC 基础设施 {#setup-byoc-infrastructure}

创建 CloudFormation 堆栈后，您将被提示设置基础设施，包括 S3、VPC 和 EKS 集群。某些配置必须在此阶段确定，因为不能在以后更改，具体如下：

- **您想使用的区域**，可以选择我们为 ClickHouse Cloud 提供的任何 [公共区域](/cloud/reference/supported-regions)。
- **BYOC 的 VPC CIDR 范围**: 默认情况下，我们使用 `10.0.0.0/16` 作为 BYOC VPC 的 CIDR 范围。如果您计划与另一个账户使用 VPC 对等连接，请确保 CIDR 范围不重叠。为 BYOC 分配适当的 CIDR 范围，最低大小为 `/22` 以容纳必要的工作负载。
- **BYOC VPC 的可用区域**：如果您计划使用 VPC 对等连接，请确保源账户与 BYOC 账户之间的可用区域一致，从而帮助减少跨 AZ 流量成本。在 AWS 中，可用区域后缀 (`a, b, c`) 可能代表跨账户的不同物理区域 ID。有关详细信息，请参见 [AWS 指南](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)。

### 可选: 设置 VPC 对等连接 {#optional-setup-vpc-peering}

要为 ClickHouse BYOC 创建或删除 VPC 对等连接，请遵循以下步骤：

#### 步骤 1 启用 ClickHouse BYOC 的私有负载均衡器 {#step-1-enable-private-load-balancer-for-clickhouse-byoc}
联系 ClickHouse 支持以启用私有负载均衡器。

#### 步骤 2 创建对等连接 {#step-2-create-a-peering-connection}
1. 在 ClickHouse BYOC 账户中导航到 VPC 控制台。
2. 选择对等连接。
3. 点击创建对等连接。
4. 将 VPC 请求者设置为 ClickHouse VPC ID。
5. 将 VPC 接受者设置为目标 VPC ID。 (如适用，选择另一个账户)
6. 点击创建对等连接。

<br />

<Image img={byoc_vpcpeering} size="lg" alt="BYOC 创建对等连接" border />

<br />

#### 步骤 3 接受对等连接请求 {#step-3-accept-the-peering-connection-request}
前往对等账户，在 (VPC -> 对等连接 -> 操作 -> 接受请求) 页面，客户可以批准此 VPC 对等请求。

<br />

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC 接受对等连接" border />

<br />

#### 步骤 4 将目标添加到 ClickHouse VPC 路由表 {#step-4-add-destination-to-clickhouse-vpc-route-tables}
在 ClickHouse BYOC 账户中，
1. 在 VPC 控制台中选择路由表。
2. 搜索 ClickHouse VPC ID。编辑附加到私有子网的每个路由表。
3. 点击路由选项卡下的编辑按钮。
4. 点击添加另一条路由。
5. 输入目标 VPC 的 CIDR 范围作为目的地。
6. 选择“对等连接”和对等连接的 ID 作为目标。

<br />

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC 添加路由表" border />

<br />

#### 步骤 5 将目标添加到目标 VPC 路由表 {#step-5-add-destination-to-the-target-vpc-route-tables}
在对等 AWS 账户中，
1. 在 VPC 控制台中选择路由表。
2. 搜索目标 VPC ID。
3. 点击路由选项卡下的编辑按钮。
4. 点击添加另一条路由。
5. 输入 ClickHouse VPC 的 CIDR 范围作为目的地。
6. 选择“对等连接”和对等连接的 ID 作为目标。

<br />

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC 添加路由表" border />

<br />

#### 步骤 6 编辑安全组以允许对等 VPC 访问 {#step-6-edit-security-group-to-allow-peered-vpc-access}
在 ClickHouse BYOC 账户中，
1. 在 ClickHouse BYOC 账户中，导航到 EC2 并找到名为 infra-xx-xxx-ingress-private 的私有负载均衡器。

<br />

<Image img={byoc_plb} size="lg" alt="BYOC 私有负载均衡器" border />

<br />

2. 在详细信息页面的安全选项卡下，找到关联的安全组，其命名模式类似于 `k8s-istioing-istioing-xxxxxxxxx`。

<br />

<Image img={byoc_security} size="lg" alt="BYOC 私有负载均衡器安全组" border />

<br />

3. 编辑此安全组的入站规则，添加对等 VPC CIDR 范围 (或根据需要指定所需的 CIDR 范围)。

<br />

<Image img={byoc_inbound} size="lg" alt="BYOC 安全组入站规则" border />

<br />

---
ClickHouse 服务现在应该可以从对等 VPC 访问。

要私下访问 ClickHouse，将为用户的对等 VPC 提供私有负载均衡器和端点，以实现安全连接。私有端点遵循公共端点格式，并带有 `-private` 后缀。例如：
- **公共端点**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **私有端点**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

可选地，在验证对等连接正常工作后，您可以请求撤销 ClickHouse BYOC 的公共负载均衡器。

## 升级流程 {#upgrade-process}

我们定期升级软件，包括 ClickHouse 数据库版本升级、ClickHouse 操作员、EKS 和其他组件。

虽然我们旨在实现无缝升级（例如，滚动升级和重启），但某些升级，如 ClickHouse 版本更改和 EKS 节点升级，可能会影响服务。客户可以指定维护窗口（例如，每周二凌晨 1:00 PDT），以确保这些升级仅在预定时间进行。

:::note
维护窗口不适用于安全和漏洞修复。这些作为非周期性升级处理，并及时沟通协调合适的时间，以尽量减少运营影响。
:::

## CloudFormation IAM 角色 {#cloudformation-iam-roles}

### 启动 IAM 角色 {#bootstrap-iam-role}

启动 IAM 角色具有以下权限：

- **EC2 和 VPC 操作**: 设置 VPC 和 EKS 集群所需。
- **S3 操作 (例如，`s3:CreateBucket`)**: 创建 ClickHouse BYOC 存储用的桶所需。
- **`route53:*` 权限**: 外部 DNS 配置 Route 53 中的记录所需。
- **IAM 操作 (例如，`iam:CreatePolicy`)**: 控制器创建其他角色所需（详细信息见下一部分）。
- **EKS 操作**: 限定为名称以 `clickhouse-cloud` 前缀开头的资源。

### 控制器创建的其他 IAM 角色 {#additional-iam-roles-created-by-the-controller}

除了通过 CloudFormation 创建的 `ClickHouseManagementRole` 之外，控制器还将创建几个额外的角色。

这些角色由在客户 EKS 集群中运行的应用程序承担：
- **状态出口角色**
  - ClickHouse 组件，用于向 ClickHouse Cloud 报告服务健康信息。
  - 需要向 ClickHouse Cloud 所有的 SQS 队列写入权限。
- **负载均衡器控制器**
  - 标准 AWS 负载均衡器控制器。
  - EBS CSI 控制器以管理 ClickHouse 服务的卷。
- **外部 DNS**
  - 将 DNS 配置传播至 Route 53。
- **证书管理器**
  - 为 BYOC 服务域名配置 TLS 证书。
- **集群自动缩放器**
  - 根据需要调整节点组大小。

**K8s-control-plane** 和 **k8s-worker** 角色旨在由 AWS EKS 服务承担。

最后，**`data-plane-mgmt`** 允许 ClickHouse Cloud 控制平面组件调解必要的自定义资源，例如 `ClickHouseCluster` 和 Istio 虚拟服务/网关。

## 网络边界 {#network-boundaries}

本节涵盖客户 BYOC VPC 的不同网络流量：

- **入站**: 进入客户 BYOC VPC 的流量。
- **出站**: 源自客户 BYOC VPC 并发送到外部目的地的流量。
- **公共的**: 可从公共互联网访问的网络端点。
- **私有的**: 仅通过私有连接（如 VPC 对等、VPC 私有链接或 Tailscale）可访问的网络端点。

**Istio 入口在 AWS NLB 后面部署，以接受 ClickHouse 客户端流量。**

*入站，公共（可以是私有的）*

Istio 入口网关终止 TLS。由 CertManager 和 Let's Encrypt 提供的证书作为密钥存储在 EKS 集群中。Istio 和 ClickHouse 之间的流量通过 [AWS 加密](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)，因为它们位于同一 VPC 中。

默认情况下，入口是公共可访问并进行 IP 允许列表过滤。客户可以配置 VPC 对等连接，使其私有并禁用公共连接。我们强烈建议设置 [IP 过滤器](/cloud/security/setting-ip-filters) 来限制访问。

### 访问故障排除 {#troubleshooting-access}

*入站，公共（可以是私有的）*

ClickHouse Cloud 工程师需要通过 Tailscale 进行故障排除访问。为 BYOC 部署提供了基于即时证书的身份验证。

### 计费抓取器 {#billing-scraper}

*出站，私有*

计费抓取器从 ClickHouse 收集计费数据，并将其发送到 ClickHouse Cloud 所属的 S3 桶中。

它作为侧车与 ClickHouse 服务器容器一起运行，定期抓取 CPU 和内存指标。来自同一区域的请求通过 VPC 网关服务端点路由。

### 警报 {#alerts}

*出站，公共*

当客户的 ClickHouse 集群不健康时，AlertManager 被配置为向 ClickHouse Cloud 发送警报。

指标和日志存储在客户的 BYOC VPC 中。日志目前存储在 EBS 本地。未来的更新中，它们将存储在 LogHouse 中，这是 BYOC VPC 中的 ClickHouse 服务。指标使用 Prometheus 和 Thanos 堆栈，存储在 BYOC VPC 中。

### 服务状态 {#service-state}

*出站*

状态出口向 ClickHouse Cloud 所有的 SQS 发送 ClickHouse 服务状态信息。

## 特性 {#features}

### 支持的特性 {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud 和 BYOC 使用相同的二进制文件和配置。因此，BYOC 中支持 ClickHouse 核心的所有特性，如 SharedMergeTree。
- **管理服务状态的控制台访问**:
  - 支持启动、停止和终止等操作。
  - 查看服务和状态。
- **备份和恢复。**
- **手动垂直和水平扩展。**
- **空闲。**
- **仓库**: 计算-计算分离
- **通过 Tailscale 实现零信任网络。**
- **监控**:
  - Cloud 控制台包括内置的健康仪表板，用于监控服务健康。
  - 提供 Prometheus 抓取以进行集中监控，使用 Prometheus、Grafana 和 Datadog。有关设置说明，请参见 [Prometheus 文档](/integrations/prometheus)。
- **VPC 对等连接。**
- **集成**: 完整列表见 [此页面](/integrations)。
- **安全 S3。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 计划中的功能（当前不支持） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) 即 CMEK（客户管理加密密钥）
- ClickPipes 用于数据摄取
- 自动扩展
- MySQL 接口

## 常见问题 {#faq}

### 计算 {#compute}

#### 我能在这个单一的 EKS 集群中创建多个服务吗？ {#can-i-create-multiple-services-in-this-single-eks-cluster}

可以。基础设施只需为每个 AWS 账户和区域组合准备一次。

### 您支持哪些区域的 BYOC？ {#which-regions-do-you-support-for-byoc}

BYOC 支持与 ClickHouse Cloud 相同的一组 [区域](/cloud/reference/supported-regions#aws-regions)。

#### 会有一些资源开销吗？运行 ClickHouse 实例以外的服务需要哪些资源？ {#will-there-be-some-resource-overhead-what-are-the-resources-needed-to-run-services-other-than-clickhouse-instances}

除了 Clickhouse 实例（ClickHouse 服务器和 ClickHouse Keeper）外，我们还运行 `clickhouse-operator`、`aws-cluster-autoscaler`、Istio 等服务及我们的监控堆栈。

目前我们在一个专用节点组中有 3 个 m5.xlarge 节点（每个 AZ 一个），用于运行这些工作负载。

### 网络和安全 {#network-and-security}

#### 安装完成后，我们能否撤销在安装期间设置的权限？ {#can-we-revoke-permissions-set-up-during-installation-after-setup-is-complete}

目前无法做到。

#### 您是否考虑过 ClickHouse 工程师将来对客户基础设施的访问控制以进行故障排除？ {#have-you-considered-some-future-security-controls-for-clickhouse-engineers-to-access-customer-infra-for-troubleshooting}

是的。实施客户控制的机制，允许客户批准工程师访问集群的计划在我们路线图上。此时，工程师必须通过内部升级流程获得即时访问权限。这一过程由我们的安全团队进行日志记录和审计。

#### VPC IP 范围大小是多少？ {#what-is-the-size-of-the-vpc-ip-range-created}

默认情况下，我们为 BYOC VPC 使用 `10.0.0.0/16`。我们建议保留至少 /22 的空间，以便将来扩展，但如果您希望限制大小，使用 /23 也是可行的，如果您可能限制为 30 个服务器 Pod。

#### 我能决定维护频率吗？ {#can-i-decide-maintenance-frequency}

请联系支持以安排维护窗口。请预期每周至少一次的更新安排。

## 可观察性 {#observability}

### 内置监控工具 {#built-in-monitoring-tools}

#### 可观察性仪表板 {#observability-dashboard}

ClickHouse Cloud 包含一个高级可观察性仪表板，显示内存使用、查询速率和 I/O 等指标。可以在 ClickHouse Cloud 网站控制台的 **监控** 部分访问。

<br />

<Image img={byoc3} size="lg" alt="可观察性仪表板" border />

<br />

#### 高级仪表板 {#advanced-dashboard}

您可以使用 `system.metrics`、`system.events` 和 `system.asynchronous_metrics` 等系统表中的指标自定义仪表板，以详细监控服务器性能和资源利用率。

<br />

<Image img={byoc4} size="lg" alt="高级仪表板" border />

<br />

#### Prometheus 集成 {#prometheus-integration}

ClickHouse Cloud 提供 Prometheus 端点，您可以用来抓取指标进行监控。这允许与 Grafana 和 Datadog 等工具进行可视化集成。

**通过 https 端点 /metrics_all 的示例请求**

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

可以使用 ClickHouse 用户名和密码对进行身份验证。我们建议创建一个具有最小权限的专用用户以抓取指标。至少需要在所有副本的 `system.custom_metrics` 表上具有 `READ` 权限。例如：

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

请参阅 [这篇博客文章](https://clickhouse.com/blog/clickhouse-cloud-now-supports-prometheus-monitoring) 和 [ClickHouse 的 Prometheus 设置文档](/integrations/prometheus)。
