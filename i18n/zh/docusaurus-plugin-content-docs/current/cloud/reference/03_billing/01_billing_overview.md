---
'sidebar_label': '概述'
'slug': '/cloud/manage/billing/overview'
'title': '定价'
'description': 'ClickHouse Cloud 定价的概述页面'
'doc_type': 'reference'
---

根据使用情况获取定价信息，请查看 [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) 页面。
ClickHouse Cloud 以计算、存储、[数据传输](/cloud/manage/network-data-transfer)（互联网和跨区域的出口）以及 [ClickPipes](/integrations/clickpipes) 的使用情况进行计费。
要了解哪些因素可能会影响您的账单，以及如何管理您的支出，请继续阅读。

## 亚马逊网络服务 (AWS) 示例 {#amazon-web-services-aws-example}

:::note
- 价格反映 AWS us-east-1 的定价。
- 在 [这里](/cloud/manage/network-data-transfer) 查看适用的数据传输和 ClickPipes 收费。
:::

### 基本：每月从 $66.52 起 {#basic-from-6652-per-month}

最佳选择：适用于没有严格可靠性保证的小型数据量的部门用例。

**基本层服务**
- 1 个副本 x 8 GiB RAM，2 vCPU
- 500 GB 的压缩数据
- 500 GB 的数据备份
- 10 GB 的公共互联网出口数据传输
- 5 GB 的跨区域数据传输

此示例的定价细分：

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

### 扩展（始终在线，自适应扩展）：每月从 $499.38 起 {#scale-always-on-auto-scaling-from-49938-per-month}

最佳选择：需要增强的服务级别协议（2 个以上副本服务）、可扩展性和高级安全性的工作负载。

**扩展层服务**
- 活跃工作负载 ~100% 时间
- 自适应扩展最大配置以防止账单失控
- 100 GB 的公共互联网出口数据传输
- 10 GB 的跨区域数据传输

此示例的定价细分：

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
    <td>1 TB 数据 + 1 备份<br></br>\$50.60</td>
    <td>2 TB 数据 + 1 备份<br></br>\$101.20</td>
    <td>3 TB 数据 + 1 备份<br></br>\$151.80</td>
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

### 企业：起始价格各异 {#enterprise-starting-prices-vary}

最佳选择：大规模、关键任务部署，具有严格的安全和合规需求。

**企业层服务**
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
    <td>2 x 120 GiB RAM，30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>5 TB + 1 备份<br></br>\$253.00</td>
    <td>10 TB + 1 备份<br></br>\$506.00</td>
    <td>20 TB + 1 备份<br></br>\$1,012.00</td>
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

### 什么是 ClickHouse Credit (CHC)？ {#what-is-chc}

ClickHouse Credit 是一个信贷单位，用于客户在 ClickHouse Cloud 的使用，等于一（1）美元，将根据 ClickHouse 当时的已发布价格表进行结算。

### 我在哪里可以找到旧版定价？ {#find-legacy-pricing}

旧版定价信息可以在 [这里](https://clickhouse.com/pricing?legacy=true) 找到。

:::note 
如果您是通过 Stripe 进行计费，您会在您的 Stripe 发票上看到 1 CHC 等于 \$0.01 USD。这是为了使计费在 Stripe 上准确，因为其限制无法以小数计费我们的标准 SKU 1 CHC = \$1 USD。
:::

### 计算如何计量？ {#how-is-compute-metered}

ClickHouse Cloud 根据每分钟和 8G RAM 增量计算计算。 
计算成本将根据层、区域和云服务提供商而有所不同。

### 磁盘存储是如何计算的？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，使用基于存储在 ClickHouse 表中数据的压缩大小进行计量。 
存储成本在各层之间相同，并根据区域和云服务提供商而有所不同。

### 备份算入总存储吗？ {#do-backups-count-toward-total-storage}

存储和备份计入存储成本，并分别计费。 
所有服务默认会保留一天的备份。 
需要额外备份的用户可以通过在 Cloud 控制台的设置标签下配置额外的 [备份](/cloud/manage/backups/overview) 来实现。

### 我如何估计压缩率？ {#how-do-i-estimate-compression}

压缩率因数据集而异。 
变化程度取决于数据本身的可压缩性（高基数与低基数字段的数量）， 
以及用户如何设置模式（例如，是否使用可选编解码器）。 
对于常见类型的分析数据，压缩率可达到 10 倍，但也可能低于或高于此。 
有关指导，请参见 [优化文档](/optimize/asynchronous-inserts) 和这篇 [Uber 博客](https://www.uber.com/blog/logging/) 的详细日志用例示例。 
确切了解的唯一实际方法是将数据集摄取到 ClickHouse 中并将数据集的大小与存储在 ClickHouse 中的大小进行比较。

您可以使用以下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### 如果我有自管理部署，ClickHouse 提供哪些工具来估算在云中运行服务的成本？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获了 [关键指标](/operations/system-tables/query_log)，可用于估算在 ClickHouse Cloud 中运行工作负载的成本。 
有关从自管理迁移到 ClickHouse Cloud 的详细信息，请参阅 [迁移文档](/cloud/migration/clickhouse-to-cloud)，如有进一步问题，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 提供哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助服务每月（以美元，通过信用卡）。
- 直接销售每年/多年的（通过预付的 “ClickHouse Credits”，以美元，附加付款选项）。
- 通过 AWS、GCP 和 Azure 市场（支付即用（PAYG）或与 ClickHouse Cloud 通过市场签订合同）。

:::note
ClickHouse Cloud 的 PAYG 信贷以 \$0.01 单位开具发票，使我们能够根据客户的使用情况对部分 ClickHouse 信贷进行收费。这与预留支出 ClickHouse 信贷不同，预留支出是以整 \$1 单位提前购买的。
:::

### 计费周期多长？ {#how-long-is-the-billing-cycle}

计费遵循每月账单周期，起始日期被记录为创建 ClickHouse Cloud 组织的日期。

### 如果我有一个活跃的 PAYG 市场订阅，然后签署了一份承诺合同，我的承诺信用是否会被优先消费？ {#committed-credits-consumed-first-with-active-payg-subscription}

是的。 使用以下付款方式按以下顺序消费：
- 承诺（预付）信用
- 市场订阅（PAYG）
- 信用卡

### ClickHouse Cloud 提供哪些控制措施来管理扩展和企业服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户在其消费达到特定阈值时会通过电子邮件自动收到通知：`50%`、`75%` 和 `90%`。这使用户能够主动管理其使用情况。
- ClickHouse Cloud 允许用户通过 [高级扩展控制](/manage/scaling) 设置计算的最大自适应扩展限制，这是分析工作负载的一个重大成本因素。
- [高级扩展控制](/manage/scaling) 允许您设置内存限制，并可以控制在不活动期间暂停/空闲的行为。

### ClickHouse Cloud 提供哪些控制措施来管理基本服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级扩展控制](/manage/scaling) 让您控制在不活动期间暂停/空闲的行为。 对于基本服务，不支持调整内存分配。
- 请注意，默认设置在一段时间不活动后会暂停服务。

### 如果我有多个服务，我会收到每个服务的发票还是合并的发票？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

对于给定组织的账单周期，会生成所有服务的合并发票。

### 如果我在试用期和信用到期之前添加信用卡并升级，我会被收费吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天试用期结束之前从试用转为付费，但还有来自试用信用额度的剩余信用时，
在初始 30 天试用期间，我们会继续使用试用信用进行消耗，然后再向信用卡收费。

### 我该如何跟踪我的支出？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供了一个用法显示，详细列出了每项服务的使用情况。 这种细分按使用维度组织，帮助您了解与每个计量单位相关的成本。

### 我如何访问我在 ClickHouse Cloud 服务上的订阅发票？ {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

对于使用信用卡的直接订阅：

要查看您的发票，请在 ClickHouse Cloud UI 的左侧导航栏中选择您的组织，然后转到计费。 所有的发票将列在发票部分。

对于通过云市场的订阅：

所有市场订阅均由市场进行计费和开具发票。 您可以通过相应的云服务提供商市场直接查看您的发票。

### 为什么用法报表上的日期与我的市场发票不匹配？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplace 计费遵循日历月周期。
例如，对于 2024 年 12 月 1 日至 2025 年 1 月 1 日之间的使用，
发票将在 2025 年 1 月 3 日至 1 月 5 日之间生成。

ClickHouse Cloud 使用报表遵循不同的计费周期，在注册日起的 30 天内进行计量 
和报告。

如果这些日期不相同，则用法和发票日期将不同。 由于使用报表按天跟踪特定服务的使用情况，用户可以依赖报表查看费用明细。

### 有关预付信用的使用是否存在任何限制？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 的预付信用（无论是直接通过 ClickHouse，还是通过云服务提供商的市场） 
只能在合同条款内使用。
这意味着它们可以在接受日期或未来日期使用，而不能用于任何之前的期间。 
任何超出预付信用的费用都必须通过信用卡支付或通过市场的每月账单覆盖。

### 通过云服务提供商市场或直接向 ClickHouse 付款是否存在 ClickHouse Cloud 定价的差异？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场计费和直接注册 ClickHouse 的定价之间没有差异。
在这两种情况下，您对 ClickHouse Cloud 的使用情况均以 ClickHouse Cloud Credits (CHCs) 进行跟踪， 
并以相同的方式进行计量并相应计费。

### 计算-计算分离是如何计费的？ {#how-is-compute-compute-separation-billed}

创建新服务时，您可以选择新服务是否与现有服务共享数据。
如果是，这两个服务现在构成一个 [仓库](/cloud/reference/warehouses)。
仓库中存储了数据，并且多个计算服务可以访问这些数据。

由于数据只存储一次，您只需为一份数据支付费用，尽管多个服务正在访问它。 
您支付计算费用就像往常一样 — 计算-计算分离/仓库没有额外费用。
通过利用此部署中的共享存储，用户在存储和备份方面可以节省费用。

在某些情况下，计算-计算分离可以为您节省大量的 ClickHouse Credits。
一个好的例子是以下设置：

1. 您有 24/7 运行的 ETL 作业，并将数据摄取到服务中。 这些 ETL 作业不需要大量内存，因此可以在小实例上运行，例如 32 GiB RAM。

2. 同一个团队的一位数据科学家有临时报告需求，表示他们需要运行一个查询，这需要大量内存 - 236 GiB，但不需要高可用性，并且如果第一次运行失败，可以等待并重新运行查询。

在这个例子中，您作为数据库管理员可以进行以下操作：

1. 创建一个具有两个副本（每个 16 GiB）的较小服务 - 这将满足 ETL 作业并提供高可用性。

2. 对于数据科学家，您可以在同一仓库中创建一个副本为 236 GiB 的第二个服务。 您可以为该服务启用空闲功能，这样在数据科学家不使用的时候就不需要为该服务付费。

此示例的 **扩展层** 费用估算（每月）：
- 父服务全天候在线：2 个副本 x 16 GiB 4 vCPU 每个副本
- 子服务：1 个副本 x 236 GiB 59 vCPU 每个副本
- 3 TB 压缩数据 + 1 备份
- 100 GB 公共互联网出口数据传输
- 50 GB 跨区域数据传输

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

如果没有仓库，您将不得不为数据工程师在其查询中所需的内存付费。
然而，将两个服务组合在一个仓库中并使其中一个闲置，能够帮助您节省资金。

## ClickPipes 定价 {#clickpipes-pricing}

有关 ClickPipes 计费的信息，请参见专门的 [“ClickPipes 计费”部分](/cloud/reference/billing/clickpipes)。
