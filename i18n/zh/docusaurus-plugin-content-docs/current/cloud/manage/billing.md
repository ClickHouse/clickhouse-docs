---
'sidebar_label': '概述'
'slug': '/cloud/manage/billing/overview'
'title': '定价'
'description': 'ClickHouse Cloud 定价的概述页面'
---

import ClickPipesFAQ from './jan2025_faq/_snippets/_clickpipes_faq.md'

有关定价信息，请参阅 [ClickHouse Cloud 定价](https://clickhouse.com/pricing#pricing-calculator) 页面。  
ClickHouse Cloud 根据计算、存储、[数据传输](/cloud/manage/network-data-transfer)（互联网的出口和跨区域）、和 [ClickPipes](/integrations/clickpipes) 的使用情况进行计费。  
要了解哪些因素可能影响您的账单以及您可以管理支出的方式，请继续阅读。

## 亚马逊网络服务 (AWS) 示例 {#amazon-web-services-aws-example}

:::note
- 价格反映了 AWS us-east-1 的定价。
- 适用的数据传输和 ClickPipes 收费请 [点击这里](jan2025_faq/dimensions.md)。
:::

### 基本：每月起价 $66.52 {#basic-from-6652-per-month}

最佳适用：用于小型数据量的部门用例，无需严格的可靠性保证。

**基本服务**
- 1 个副本 x 8 GiB RAM, 2 vCPU
- 500 GB 的压缩数据
- 500 GB 的数据备份
- 10 GB 的公共互联网出口数据传输
- 5 GB 的跨区域数据传输

本示例的定价细分：

<table><thead>
  <tr>
    <th></th>
    <th>活跃 6 小时/天</th>
    <th>活跃 12 小时/天</th>
    <th>活跃 24 小时/天</th>
  </tr></thead>
<tbody>
  <tr>
    <td>计算</td>
    <td>\$39.91</td>
    <td>\$79.83</td>
    <td>\$159.66</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
    <td>\$25.30</td>
  </tr>
  <tr>
    <td>公共互联网出口数据传输</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
    <td>\$1.15</td>
  </tr>
  <tr>
    <td>跨区域数据传输</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
    <td>\$0.16</td>
  </tr>
  <tr>
    <td>总计</td>
    <td>\$66.52</td>
    <td>\$106.44</td>
    <td>\$186.27</td>
  </tr>
</tbody>
</table>

### 扩展（常开、自动扩展）：每月起价 $499.38 {#scale-always-on-auto-scaling-from-49938-per-month}

最佳适用：需要增强的服务级别协议 (SLA)（2 个以上副本服务）、可扩展性和高级安全性的工作负载。

**扩展服务**
- 活跃工作负载 ~100% 时间
- 自动扩展可防止账单失控的最大可配置限制
- 100 GB 的公共互联网出口数据传输
- 10 GB 的跨区域数据传输

本示例的定价细分：

<table><thead>
  <tr>
    <th></th>
    <th>示例 1</th>
    <th>示例 2</th>
    <th>示例 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>计算</td>
    <td>2 个副本 x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2 个副本 x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3 个副本 x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>1 TB 的数据 + 1 个备份<br></br>\$50.60</td>
    <td>2 TB 的数据 + 1 个备份<br></br>\$101.20</td>
    <td>3 TB 的数据 + 1 个备份<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>公共互联网出口数据传输</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>跨区域数据传输</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
    <td>\$0.31</td>
  </tr>
  <tr>
    <td>总计</td>
    <td>\$499.38</td>
    <td>\$986.92</td>
    <td>\$1,474.47</td>
  </tr>
</tbody>
</table>

### 企业：起始价格多样 {#enterprise-starting-prices-vary}

最佳适用：大型、关键任务的部署，具有严格的安全和合规需求

**企业服务**
- 活跃工作负载 ~100% 时间
- 1 TB 的公共互联网出口数据传输
- 500 GB 的跨区域数据传输

<table><thead>
  <tr>
    <th></th>
    <th>示例 1</th>
    <th>示例 2</th>
    <th>示例 3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>计算</td>
    <td>2 个副本 x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>2 个副本 x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>5 TB + 1 个备份<br></br>\$253.00</td>
    <td>10 TB + 1 个备份<br></br>\$506.00</td>
    <td>20 TB + 1 个备份<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>公共互联网出口数据传输</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
    <td>\$115.20</td>
  </tr>
  <tr>
    <td>跨区域数据传输</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
    <td>\$15.60</td>
  </tr>
  <tr>
    <td>总计</td>
    <td>\$2,669.40</td>
    <td>\$5,207.99</td>
    <td>\$9,713.79</td>
  </tr>
</tbody>
</table>

## 常见问题 {#faqs}

### 计算是如何计量的？ {#how-is-compute-metered}

ClickHouse Cloud 按分钟计量计算，每 8G RAM 递增。  
计算成本将根据服务层、区域和云服务提供商的不同而有所变化。

### 磁盘上的存储是如何计算的？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，且按存储在 ClickHouse 表中的数据压缩大小进行计量。  
存储成本在各个服务层之间是相同的，不同区域和云服务提供商之间可能有所变化。

### 备份计入总存储吗？ {#do-backups-count-toward-total-storage}

存储和备份计入存储成本，并分别计费。  
所有服务默认有一个备份，保留一天。  
需要额外备份的用户可以通过在 Cloud Console 的设置选项卡下配置额外的 [备份](backups/overview.md) 来实现。

### 如何估算压缩？ {#how-do-i-estimate-compression}

压缩可能因数据集而异。  
它的变化程度取决于数据本身的可压缩性（高低基数字段的数量），  
以及用户如何设置模式（例如使用可选编解码器或不使用编解码器）。  
对于常见类型的分析数据，压缩比率可能在 10 倍左右，但也可以显著低于或高于这个比例。  
请参阅 [优化文档](/optimize/asynchronous-inserts) 以获取建议，并查看此 [Uber 博客](https://www.uber.com/blog/logging/) 的详细日志用例示例。  
确切知道唯一的方法是将您的数据集导入 ClickHouse，并比较数据集的大小与存储在 ClickHouse 中的大小。

您可以使用以下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### 如果我有自管理部署，ClickHouse 提供哪些工具来估算在云中运行服务的成本？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获 [关键指标](/operations/system-tables/query_log)，可用于估算在 ClickHouse Cloud 中运行工作负载的成本。  
有关从自管理迁移到 ClickHouse Cloud 的详细信息，请参阅 [迁移文档](/cloud/migration/clickhouse-to-cloud)，并联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support) 以获取进一步的问题。

### ClickHouse Cloud 提供哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助月度计费（以美元计，通过信用卡支付）。
- 直接销售的年度/多年计费（通过预付的 "ClickHouse 额度"，以美元计，还有其他支付选项）。
- 通过 AWS、GCP 和 Azure 市场（可以按使用付费（PAYG）或通过市场与 ClickHouse Cloud 签订合同）。

### 计费周期是多久？ {#how-long-is-the-billing-cycle}

计费按照每月计费周期进行，开始日期被跟踪为 ClickHouse Cloud 组织创建的日期。

### ClickHouse Cloud 提供哪些控制以管理 Scale 和 Enterprise 服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户在消费达到某些阈值（`50%`、`75%` 和 `90%`）时会自动收到电子邮件通知。这使得用户能够主动管理其使用情况。
- ClickHouse Cloud 允许用户通过 [高级 scaling 控制](/manage/scaling) 来设定计算的最大自动扩展限制，这对分析工作负载是一个重要的成本因素。
- [高级 scaling 控制](/manage/scaling) 允许您设置内存限制，以及在不活动期间控制暂停/闲置行为的选项。

### ClickHouse Cloud 提供哪些控制以管理 Basic 服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级 scaling 控制](/manage/scaling) 允许您控制在不活动期间的暂停/闲置行为。对于 Basic 服务，不支持调整内存分配。
- 请注意，默认设置在一段不活动时间后会暂停服务。

### 如果我有多个服务，我是按服务获取发票还是获取合并发票？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

在给定的计费周期内，为所有服务生成合并发票。

### 如果我在试用期和信用额度过期之前添加信用卡并升级，会收取费用吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天的试用期结束之前将试用转换为付费，但仍有剩余额度时，  
我们在初始 30 天的试用期中继续使用试用额度，然后收取信用卡费用。

### 如何跟踪我的支出？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供使用情况显示，详细说明每项服务的使用情况。这个细分按使用维度进行组织，帮助您了解与每个计量单位相关的成本。

### 如何访问我在 ClickHouse Cloud 服务的市场订阅发票？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

所有市场订阅均由市场进行计费和开具发票。您可以直接通过相应的云提供商市场查看发票。

### 使用声明上的日期与我的市场发票不匹配的原因是什么？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS 市场的计费遵循日历月周期。  
例如，对于 2024 年 12 月 1 日到 2025 年 1 月 1 日之间的使用，将在 2025 年 1 月 3 日至 1 月 5 日之间生成发票。

ClickHouse Cloud 的使用声明遵循不同的计费周期，其中使用情况从注册之日起开始按 30 天计量和报告。

如果这些日期不同，使用和发票日期将不相同。由于使用声明按天跟踪给定服务的使用情况，用户可以依赖声明查看成本分解。

### 预付费信用的使用是否有限制？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 预付费信用（无论是直接通过 ClickHouse 还是通过云提供商的市场）  
只能在合同条款中使用。  
这意味着它们可以在接受日期或未来日期使用，而不能用于任何先前的周期。  
任何未被预付费信用覆盖的超额费用必须通过信用卡支付或通过市场的每月计费来支付。

### 通过云提供商市场支付与直接向 ClickHouse 支付，ClickHouse Cloud 定价是否存在差异？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场计费与直接与 ClickHouse 注册之间的定价没有差异。  
在任何情况下，您对 ClickHouse Cloud 的使用都以 ClickHouse Cloud 信用 (CHCs) 为单位进行跟踪，  
这种计量方式相同并据此计费。

### 计算-计算分离的计费方式是什么？ {#how-is-compute-compute-separation-billed}

在创建新服务时，您可以选择此新服务是否应与现有服务共享相同的数据。  
如果是，那么这两个服务现在形成一个 [仓库](../reference/warehouses.md)。  
一个仓库的数据存储在其中，多个计算服务访问这些数据。

由于数据只存储一次，因此您只需支付一份数据的费用，尽管多个服务正在访问它。  
您按正常方式支付计算费用——对于计算-计算分离/仓库没有额外费用。  
通过在此部署中利用共享存储，用户在存储和备份上都受益于成本节省。

在某些情况下，计算-计算分离可以为您节省大量的 ClickHouse 信用。  
以下设置是一个很好的示例：

1. 您有 ETL 作业全天候运行并向服务中提取数据。这些 ETL 作业不需要大量内存，因此可以在小实例上运行，例如 32 GiB 的 RAM。

2. 同一团队中的数据科学家有偶发报告需求，表示他们需要运行一个需要大量内存的查询——236 GiB，但不需要高可用性，如果第一次运行失败可以等待并重新运行查询。

在这个示例中，作为数据库的管理员，您可以执行以下操作：

1. 创建一个具有两个副本的较小服务，各 16 GiB——这将满足 ETL 作业并提供高可用性。

2. 对于数据科学家，您可以在同一仓库中创建第二个服务，仅使用一个副本和 236 GiB。您可以为此服务启用闲置功能，因此在数据科学家不使用时无需为其服务付费。

此示例在 **扩展层** 的每月成本估算：
- 父服务全天候活跃：2 个副本 x 16 GiB 4 vCPU 每个副本  
- 子服务：1 个副本 x 236 GiB 59 vCPU 每个副本  
- 3 TB 的压缩数据 + 1 个备份  
- 100 GB 的公共互联网出口数据传输  
- 50 GB 的跨区域数据传输  

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子服务</span><br/><span>每天活跃 1 小时</span></th>
    <th><span>子服务</span><br/><span>每天活跃 2 小时</span></th>
    <th><span>子服务</span><br/><span>每天活跃 4 小时</span></th>
  </tr></thead>
<tbody>
  <tr>
    <td>计算</td>
    <td>\$1,142.43</td>
    <td>\$1,410.97</td>
    <td>\$1,948.05</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
    <td>\$151.80</td>
  </tr>
  <tr>
    <td>公共互联网出口数据传输</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
    <td>\$11.52</td>
  </tr>
  <tr>
    <td>跨区域数据传输</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
    <td>\$1.56</td>
  </tr>
  <tr>
    <td>总计</td>
    <td>\$1,307.31</td>
    <td>\$1,575.85</td>
    <td>\$2,112.93</td>
  </tr>
</tbody>
</table>

如果没有仓库，您必须支付数据工程师为其查询所需的内存量。  
然而，将两个服务结合在一个仓库内并将其中一个闲置，帮助您节省金钱。

## ClickPipes 定价 {#clickpipes-pricing}

### ClickPipes 用于 Postgres CDC {#clickpipes-for-postgres-cdc}

本节概述了我们在 ClickPipes 中针对 Postgres 变更数据捕获 (CDC) 的定价模型。在设计此模型时，我们的目标是保持定价高度竞争，同时忠于我们的核心愿景：

> 让客户无缝且负担得起地将数据从 Postgres 移动到 ClickHouse 进行实时分析。

该连接器比外部 ETL 工具以及其他数据库平台中类似功能的成本效益高出 **5 倍**。$^*$

:::note
针对使用 Postgres CDC ClickPipes 的所有客户（包括现有和新客户），  
计费将于 **2025年9月1日** 开始计量。到那时为止，使用是免费的。  
客户在 5 月 29 日（GA公告）开始享有 3 个月的窗口期，如果需要，可以审核和优化他们的费用，尽管我们预期大多数客户不需要进行任何更改。
:::

$^*$ _例如，外部 ETL 工具 Airbyte 提供类似的 CDC 能力，收费为 $10/GB（不包括信用）——超过 ClickPipes 中 Postgres CDC 移动 1TB 数据的费用的 20 倍以上。_

#### 定价维度 {#pricing-dimensions}

定价主要包括两个维度：

1. **摄取的数据**：来自 Postgres 的原始未压缩字节，摄取到 ClickHouse 中。
2. **计算**：每项服务预配置的计算单元，管理多个 Postgres CDC ClickPipes，与 ClickHouse Cloud 服务使用的计算单元分开。该额外计算专门用于 Postgres CDC ClickPipes。计算按服务级别计费，而不是按单个管道计费。每个计算单元包括 2 vCPU 和 8 GB 的 RAM。

#### 摄取数据 {#ingested-data}

Postgres CDC 连接器分为两个主要阶段：

- **初始加载/重新同步**：这会捕获 Postgres 表的完整快照，并在管道首次创建或重新同步时发生。
- **持续复制 (CDC)**：数据从 Postgres 到 ClickHouse 的更改的持续复制——如插入、更新、删除和架构更改。

在大多数用例中，持续复制占 ClickPipe 生命周期的 90% 以上。由于初始加载涉及一次性传输大量数据，我们为此阶段提供较低的费率。

| 阶段                                    | 成本         |
|---------------------------------------|--------------|
| **初始加载/重新同步**                    | $0.10 每 GB |
| **持续复制 (CDC)**                     | $0.20 每 GB |

#### 计算 {#compute}

该维度涵盖每项服务专门用于 Postgres ClickPipes 的计算单元。计算在服务内的所有 Postgres 管道中共享。**在创建第一个 Postgres 管道时会分配计算单元，当没有 Postgres CDC 管道时将撤销分配**。分配的计算量取决于您组织的服务层次：

| 层级                           | 成本                                       |
|--------------------------------|-------------------------------------------|
| **基本层**                     | 每项服务 0.5 计算单元 — 每小时 $0.10    |
| **扩展或企业层**               | 每项服务 1 计算单元 — 每小时 $0.20      |

#### 示例 {#example}

假设您的服务处于扩展层，并具有以下设置：

- 2 个 Postgres ClickPipes 正在运行持续复制
- 每个管道每月摄取 500 GB 的数据更改 (CDC)
- 当第一个管道开始工作时，服务将为 Postgres CDC 提供 **1 个计算单元**。

##### 每月成本细分 {#cost-breakdown}

**摄取数据 (CDC)**：

$$ 2 \text{ 个管道} \times 500 \text{ GB} = 1,000 \text{ GB 每月} $$ 

$$ 1,000 \text{ GB} \times \$0.20/\text{GB} = \$200 $$

**计算**：

$$1 \text{ 计算单元} \times \$0.20/\text{hr} \times 730 \text{ 小时（大约一个月）} = \$146$$

:::note
计算在两个管道之间共享
:::

**每月总成本**：

$$\$200 \text{ (摄取)} + \$146 \text{ (计算)} = \$346$$
 
### ClickPipes 用于流和对象存储 {#clickpipes-for-streaming-object-storage}

本节概述了 ClickPipes 用于流和对象存储的定价模型。

#### ClickPipes 定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成：

- **计算**：每个单位的每小时价格  
计算表示运行 ClickPipes 副本 pod 的成本，无论它们是否实际摄取数据。
这适用于所有 ClickPipes 类型。
- **摄取数据**：按 GB 定价  
摄取数据的费率适用于所有流媒体 ClickPipes（Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure 事件中心）通过副本 pod 传输的数据。摄取的数据大小 (GB) 费用根据来自 source 的字节（未压缩或压缩）进行收费。

#### ClickPipes 副本是什么？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源摄取数据，该基础设施独立于 ClickHouse Cloud 服务运行和扩展。  
因此，它使用专用的计算副本。

#### 副本的默认数量及其大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认提供 1 个副本，配备 2 GiB 的 RAM 和 0.5 vCPU。  
这相当于 **0.25** ClickHouse 计算单元（1 单元 = 8 GiB RAM，2 vCPUs）。

#### ClickPipes 的公共价格是什么？ {#what-are-the-clickpipes-public-prices}

- 计算：每单位每小时 \$0.20（每个副本每小时 \$0.05）
- 摄取数据：每 GB \$0.04

#### 在示例中具体表现如何？ {#how-does-it-look-in-an-illustrative-example}

以下示例假设单个副本，除非明确提及。

<table><thead>
  <tr>
    <th></th>
    <th>100 GB 24小时</th>
    <th>1 TB 24小时</th>
    <th>10 TB 24小时</th>
  </tr></thead>
<tbody>
  <tr>
    <td>流式 ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>使用 4 个副本：<br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>对象存储 ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _仅 ClickPipes 计算用于编排，  
有效的数据传输由基础 ClickHouse 服务承担_

## ClickPipes 定价常见问题 {#clickpipes-pricing-faq}

以下是有关 CDC ClickPipes 和流式及基于对象存储 ClickPipes 的常见问题。

### Postgres CDC ClickPipes 的常见问题 {#faq-postgres-cdc-clickpipe}

<details>

<summary>摄取的数据是根据压缩后还是未压缩大小来计量的？</summary>

摄取的数据是按 _未压缩数据_ 计量的，即来自 Postgres 的原始数据——  
无论是在初始加载时还是在 CDC（通过复制槽）。Postgres 默认在传输过程中不会压缩数据，  
而 ClickPipe 处理的是原始未压缩字节。

</details>

<details>

<summary>Postgres CDC 定价何时开始出现在我的账单上？</summary>

Postgres CDC ClickPipes 的定价从 **2025年9月1日** 开始出现在所有客户的每月账单上——  
包括现有和新客户。在此之前，使用是免费的。客户从 **5 月 29 日**（GA公告日期）  
开始享有 **3 个月** 的窗口期，以审查和优化他们的使用情况，尽管我们预期大多数不需要进行任何更改。

</details>

<details>

<summary>如果我暂停管道，会收费吗？</summary>

在管道暂停期间不会产生数据摄取费用，因为没有数据被移动。  
但是，仍然会产生计算费用——根据您组织的层级而定，为 0.5 或 1 个计算单元。  
这是一项固定的服务级费用，适用于该服务内的所有管道。

</details>

<details>

<summary>我如何估算我的定价？</summary>

ClickPipes 的概述页面提供初始加载/重新同步和 CDC 数据量的指标。  
您可以利用这些指标以及 ClickPipes 定价来估算您的 Postgres CDC 成本。

</details>

<details>

<summary>我可以为我的服务中的 Postgres CDC 扩大分配的计算吗？</summary>

默认情况下，计算扩展不可由用户配置。  
提供的资源经过优化，以最佳方式处理大多数客户的工作负载。如果您的用例需要更多或更少的计算，请提交支持票以便我们可以评估您的请求。

</details>

<details>

<summary>定价粒度是什么？</summary>

- **计算**：按小时计费。部分小时按下一个小时四舍五入。
- **摄取数据**：按未压缩数据的千兆字节 (GB) 计量和计费。

</details>

<details>

<summary>我可以使用我的 ClickHouse Cloud 额度用于通过 ClickPipes 的 Postgres CDC 吗？</summary>

可以。 ClickPipes 定价是统一的 ClickHouse Cloud 定价的一部分。您拥有的任何平台信用将自动应用于 ClickPipes 使用。

</details>

<details>

<summary>我在现有的每月 ClickHouse Cloud 支出中应该预计 Postgres CDC ClickPipes 产生多少额外费用？</summary>

费用根据您的用例、数据量和组织层级而异。  
也就是说，大多数现有客户在试用期后，将看到相较于其现有每月 ClickHouse Cloud 支出 **0-15%** 的增加。  
实际费用可能随工作负载的不同而有所变化——一些工作负载涉及大量数据量但处理较少，  
而其他工作负载则需要更多处理但数据量较少。

</details>

### 流式和对象存储 ClickPipes 的常见问题 {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>
