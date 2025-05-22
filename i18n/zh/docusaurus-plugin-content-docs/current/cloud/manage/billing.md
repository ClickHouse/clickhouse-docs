---
'sidebar_label': '概述'
'slug': '/cloud/manage/billing/overview'
'title': '定价'
'description': 'ClickHouse Cloud 定价的概述页面'
---

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.  
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/integrations/clickpipes).  
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) 示例 {#amazon-web-services-aws-example}

:::note
- 价格反映 AWS us-east-1 的定价。
- 在 [这里](jan2025_faq/dimensions.md) 探索相关的数据传输和 ClickPipes 费用。
:::

### 基本: 每月 $66.52 起 {#basic-from-6652-per-month}

最佳用于：数据量较小且没有严格可靠性保证的部门用例。

**基本服务级别**
- 1 个副本 x 8 GiB RAM，2 vCPU
- 500 GB 的压缩数据
- 500 GB 的数据备份
- 10 GB 的公共互联网出口数据传输
- 5 GB 的跨区域数据传输

此示例的价格明细：

<table><thead>
  <tr>
    <th></th>
    <th>每天活跃 6 小时</th>
    <th>每天活跃 12 小时</th>
    <th>每天活跃 24 小时</th>
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

### 扩展（始终在线，自动缩放）：每月 $499.38 起 {#scale-always-on-auto-scaling-from-49938-per-month}

最佳用于：需要增强 SLA（2 个或多个副本服务）、可扩展性和高级安全性的工作负载。

**扩展服务级别**
- 活跃工作负载 ~100% 时间
- 自动缩放最大可配置以防止费用失控
- 100 GB 的公共互联网出口数据传输
- 10 GB 的跨区域数据传输

此示例的价格明细：

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
    <td>2 个副本 x 8 GiB RAM，2 vCPU<br></br>\$436.95</td>
    <td>2 个副本 x 16 GiB RAM，4 vCPU<br></br>\$873.89</td>
    <td>3 个副本 x 16 GiB RAM，4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>1TB 的数据 + 1 个备份<br></br>\$50.60</td>
    <td>2TB 的数据 + 1 个备份<br></br>\$101.20</td>
    <td>3TB 的数据 + 1 个备份<br></br>\$151.80</td>
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

### 企业：起始价格有所不同 {#enterprise-starting-prices-vary}

最佳用于：需要严格安全和合规要求的大规模、关键任务部署

**企业服务级别**
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
    <td>2 个副本 x 32 GiB RAM，8 vCPU<br></br>\$2,285.60</td>
    <td>2 个副本 x 64 GiB RAM，16 vCPU<br></br>\$4,571.19</td>
    <td>2 个 x 120 GiB RAM，30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>5TB + 1 个备份<br></br>\$253.00</td>
    <td>10TB + 1 个备份<br></br>\$506.00</td>
    <td>20TB + 1 个备份<br></br>\$1,012.00</td>
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

ClickHouse Cloud 根据每分钟计量计算，以 8G RAM 为增量。  
计算成本因服务级别、区域和云服务提供商而异。

### 磁盘上的存储是如何计算的？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，使用量按存储在 ClickHouse 表中的压缩数据大小计量。  
存储成本在不同服务级别之间是相同的，并且因区域和云服务提供商而异。

### 备份是否算入总存储？ {#do-backups-count-toward-total-storage}

存储和备份计算在存储成本中，分别计费。  
所有服务默认保留一个备份，保留一天。  
需要额外备份的用户可以通过配置额外的 [备份](backups/overview.md) 在 Cloud Console 的设置选项卡下进行操作。

### 我如何估算压缩率？ {#how-do-i-estimate-compression}

压缩率因数据集而异。  
这取决于数据本身的可压缩性（高基数与低基数字段的数量），  
以及用户如何设置模式（例如使用可选编解码器与否）。  
对于常见类型的分析数据，压缩率可能达到 10 倍，但也可能显著低于或高于这个值。  
有关指导，请参见 [优化文档](/optimize/asynchronous-inserts) 和此 [Uber 博客](https://www.uber.com/blog/logging/) 的详细日志使用案例示例。  
确切知道的唯一实用方法是将数据集导入 ClickHouse，并比较数据集的大小与存储在 ClickHouse 中的大小。

您可以使用以下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### 如果我有一个自管理的部署，ClickHouse 提供了什么工具来估算在云中运行服务的成本？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获了 [关键指标](/operations/system-tables/query_log)，可用于估算在 ClickHouse Cloud 中运行工作负载的成本。  
有关从自管理转移到 ClickHouse Cloud 的详细信息，请参阅 [迁移文档](/cloud/migration/clickhouse-to-cloud)，如有进一步问题，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 提供了哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助服务每月（以美元结算，通过信用卡支付）。
- 直接销售年费/多年度（通过预付费的“ClickHouse 信用”，以美元结算，提供附加支付选项）。
- 通过 AWS、GCP 和 Azure 市场（按需付费（PAYG）或通过市场与 ClickHouse Cloud 签署合同）。

### 计费周期是多长？ {#how-long-is-the-billing-cycle}

计费遵循月度计费周期，开始日期跟踪为 ClickHouse Cloud 组织创建的日期。

### ClickHouse Cloud 提供了哪些控件来管理扩展和企业服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户将在消费达到某些阈值时自动收到电子邮件通知：`50%`、`75%` 和 `90%`。这使用户能够主动管理其使用情况。
- ClickHouse Cloud 允许用户通过 [高级缩放控制](/manage/scaling) 设置计算的最大自动缩放限制，这是分析工作负载的一个重要费用因素。
- [高级缩放控制](/manage/scaling) 使您能够设置内存限制，并可以控制在不活动期间的暂停/闲置行为。

### ClickHouse Cloud 提供了哪些控件来管理基本服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级缩放控制](/manage/scaling) 使您能够控制在不活动期间的暂停/闲置行为。基础服务不支持调整内存分配。
- 请注意，默认设置是在一段不活动时间后暂停服务。

### 如果我有多个服务，我会收到每个服务的发票还是合并发票？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

在指定的账单周期内，为给定组织生成合并发票。

### 如果我在试用期和信用耗尽之前添加信用卡并升级，会收取费用吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天的试用期结束前从试用版转换为付费版时，仍有试用信用剩余，我们会在初始 30 天的试用期间继续从试用信用中扣款，然后再向信用卡收费。

### 我如何跟踪我的支出？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供了用量显示，详细列出每个服务的使用量。此明细按使用维度组织，帮助您了解与每个计量单位相关的费用。

### 如何访问我在 ClickHouse Cloud 服务上的市场订阅的发票？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

所有市场订阅的账单和发票将由市场生成。您可以直接通过相应的云服务提供商市场查看您的发票。

### 为什么使用声明上的日期与我的市场发票不匹配？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplace 计费遵循日历月周期。  
例如，针对 2024 年 12 月 1 日至 2025 年 1 月 1 日之间的使用，将在 2025 年 1 月 3 日至 1 月 5 日之间生成发票。

ClickHouse Cloud 的使用声明遵循不同的计费周期，其中使用量按日计量，报告时间为从注册日开始的 30 天。

如果这些日期不同，则使用和发票日期将不同。由于使用声明按天跟踪给定服务的使用情况，用户可以依赖声明查看费用明细。

### 关于预付信用的使用有什么限制吗？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 的预付信用（无论是直接通过 ClickHouse 还是通过云提供商的市场）仅可在合同条款内使用。  
这意味着它们可以在接受日期或未来日期使用，但不能用于任何之前的时期。  
任何未被预付信用覆盖的超额费用必须通过信用卡支付或市场月度计费来覆盖。

### 在通过云提供商市场支付或直接向 ClickHouse 支付时，ClickHouse Cloud 的定价是否有所不同？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场消耗和直接注册 ClickHouse 之间的定价没有差别。无论哪种情况，您在 ClickHouse Cloud 的使用量都是以 ClickHouse Cloud 信用 (CHCs) 为单位进行跟踪，这些信用的计量方式是相同的并相应计费。

### 计算-计算分离是如何计费的？ {#how-is-compute-compute-separation-billed}

创建服务时，您可以选择是否让此新服务与现有服务共享相同的数据。如果选择是，则这两项服务现在构成一个 [仓库](../reference/warehouses.md)。  
仓库内存储的数据可以被多个计算服务访问。

由于数据只存储一次，因此您只需为一份数据付费，尽管有多个服务在访问它。  
您照常支付计算费用——计算-计算分离/仓库没有额外费用。通过利用此部署中的共享存储，用户能够节省存储和备份的成本。

在某些情况下，计算-计算分离可以为您节省相当数量的 ClickHouse 信用。  
以下设置是一个很好的示例：

1. 您有 ETL 作业 24/7 地运行并向服务注入数据。这些 ETL 作业不需要大量内存，因此它们可以在一个小实例上运行，例如，32 GiB 的 RAM。

2. 同一个团队的一个数据科学家有临时报告需求，表示他们需要运行一个耗费大量内存 - 236 GiB 的查询，但不需要高可用性，如果第一次运行失败可以等待并重新运行查询。

在此示例中，作为数据库管理员，您可以执行以下操作：

1. 创建一个小服务，包含两个 16 GiB 的副本 - 这将满足 ETL 作业并提供高可用性。

2. 对于数据科学家，您可以在同一个仓库中创建第二个服务，仅用一个副本提供 236 GiB。您可以为该服务启用闲置，这样当数据科学家不使用它时，您就无须为该服务付费。

此示例的 **扩展级别** 成本估算（每月）：
- 父服务全天候活跃：每个副本 2 个副本 x 16 GiB 4 vCPU
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

如果没有仓库，您必须为数据工程师进行查询所需的内存付费。  
然而，将两个服务组合在一个仓库中并让其中一个空闲可以帮助您节省资金。

## ClickPipes 价格 {#clickpipes-pricing}

### ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成：

- **计算**：每单位每小时的价格  
  计算代表运行 ClickPipes 副本 POD 的成本，无论它们是否主动进行数据摄取。  
  对所有 ClickPipes 类型适用。
- **摄取数据**：每 GB 计价  
  摄取数据费率适用于所有流媒体 ClickPipes  
  （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs）  
  针对通过副本 POD 转移的数据。摄取数据大小（GB）根据从源接收的字节（未压缩或压缩）收费。

### ClickPipes 副本是什么？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源摄取数据  
这些基础设施独立于 ClickHouse Cloud 服务运行和扩展。  
因此，它使用专用计算副本。

### 副本的默认数量和大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认为 1 个副本，提供 2 GiB 的 RAM 和 0.5 vCPU。  
这相当于 **0.25** ClickHouse 计算单位（1 单位 = 8 GiB RAM，2 vCPUs）。

### ClickPipes 的公共价格是多少？ {#what-are-the-clickpipes-public-prices}

- 计算：每小时 \$0.20（每个副本每小时 \$0.05）
- 摄取数据：每 GB \$0.04

### 在一个示例中是如何表现的？ {#how-does-it-look-in-an-illustrative-example}

以下示例假设使用单个副本，除非明确说明。

<table><thead>
  <tr>
    <th></th>
    <th>24 小时 100 GB</th>
    <th>24 小时 1 TB</th>
    <th>24 小时 10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>流媒体 ClickPipe</td>
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
实际数据传输由基础 ClickHouse 服务假定_
