---
'sidebar_label': '概况'
'slug': '/cloud/manage/billing/overview'
'title': '定价'
'description': 'ClickHouse 云定价概览页面'
---

For pricing information, see the [ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator) page.  
ClickHouse Cloud bills based on the usage of compute, storage, [data transfer](/cloud/manage/network-data-transfer) (egress over the internet and cross-region), and [ClickPipes](/integrations/clickpipes).  
To understand what can affect your bill, and ways that you can manage your spend, keep reading.

## Amazon Web Services (AWS) 示例 {#amazon-web-services-aws-example}

:::note
- 价格反映 AWS us-east-1 的定价。
- 探索适用的数据传输和 ClickPipes 收费 [这里](jan2025_faq/dimensions.md)。
:::

### 基础：每月从 $66.52 开始 {#basic-from-6652-per-month}

最佳适用：部门用例，数据量较小，且没有严格的可靠性保证。

**基础服务层**
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

### 规模（始终在线，自动扩展）：每月从 $499.38 开始 {#scale-always-on-auto-scaling-from-49938-per-month}

最佳适用：需要增强的服务级别协议（2 个以上副本服务）、可扩展性和高级安全性的工作负载。

**规模服务层**
- 活跃工作负载 ~100% 时间
- 自动扩展最大可配置，以防止账单失控
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
    <td>1TB 数据 + 1 备份<br></br>\$50.60</td>
    <td>2TB 数据 + 1 备份<br></br>\$101.20</td>
    <td>3TB 数据 + 1 备份<br></br>\$151.80</td>
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

最佳适用：大型、任务关键型部署，具有严格的安全和合规需求。

**企业服务层**
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
    <td>5TB + 1 备份<br></br>\$253.00</td>
    <td>10TB + 1 备份<br></br>\$506.00</td>
    <td>20TB + 1 备份<br></br>\$1,012.00</td>
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

ClickHouse Cloud 按每分钟计量计算，以 8G RAM 为增量。  
计算成本会因服务层、区域和云服务提供商而异。

### 磁盘上的存储是如何计算的？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，使用量按存储在 ClickHouse 表中的压缩数据大小计量。  
存储成本在不同服务层之间是相同的，但因区域和云服务提供商而异。

### 备份算入总存储吗？ {#do-backups-count-toward-total-storage}

存储和备份计入存储成本并单独计费。  
所有服务默认提供一个备份，保留一天。  
需要额外备份的用户可以在 Cloud Console 的设置选项卡下配置额外的 [备份](backups/overview.md)。

### 我如何估算压缩率？ {#how-do-i-estimate-compression}

压缩率会因数据集而异。  
这取决于数据本身的可压缩性（高基数与低基数字段的数量），  
以及用户如何设置模式（例如，是否使用可选编解码器）。  
对于常见的分析数据类型，压缩率可能达到 10 倍，但也可能显著低于或高于此值。  
请参阅[优化文档](/optimize/asynchronous-inserts)以获取指导，还可以查看这个 [Uber 博客](https://www.uber.com/blog/logging/) 以获取详细的日志使用案例示例。  
唯一的切实可行的方法是将您的数据集导入 ClickHouse，并比较数据集的大小和存储在 ClickHouse 中的大小。

您可以使用以下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### 如果我有一个自管理的部署，ClickHouse 提供哪些工具来估算在云中运行服务的成本？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获 [关键指标](/operations/system-tables/query_log)，可用于估算在 ClickHouse Cloud 中运行工作负载的成本。  
有关从自管理迁移到 ClickHouse Cloud 的详细信息，请参阅 [迁移文档](/cloud/migration/clickhouse-to-cloud)，如有进一步问题，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 有哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助式按月计费（以美元，通过信用卡）。
- 直接销售年费 / 多年费（通过预付的 "ClickHouse Credits"，以美元，附带其他付款选项）。
- 通过 AWS、GCP 和 Azure 市场（按需支付（PAYG）或通过市场与 ClickHouse Cloud 签订合同）。

### 计费周期是多长？ {#how-long-is-the-billing-cycle}

计费遵循每月计费周期，起始日期记录为 ClickHouse Cloud 组织创建的日期。

### ClickHouse Cloud 提供哪些控制功能来管理规模和企业服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户在其消费达到某些阈值时会通过电子邮件自动通知：`50%`、`75%` 和 `90%`。这使得用户能够主动管理他们的使用。
- ClickHouse Cloud 允许用户通过[高级扩展控制](/manage/scaling)设置计算的最大自动扩展限制，这是分析工作负载的重要成本因素。
- [高级扩展控制](/manage/scaling) 允许您设置内存限制，您还可以控制在非活动期间的暂停/待命行为。

### ClickHouse Cloud 提供哪些控制功能来管理基础服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级扩展控制](/manage/scaling) 允许您控制在非活动期间的暂停/待命行为。基础服务不支持调整内存分配。
- 请注意，默认设置在非活动一段时间后暂停服务。

### 如果我有多个服务，是每个服务单独开具发票，还是合并开具发票？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

在给定的账单周期内，为所有服务生成合并发票。

### 如果我添加我的信用卡并在我的试用期和积分到期之前升级，我会被收费吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天的试用期结束之前将试用转换为付费，但仍保留试用积分时，  
我们会在初始 30 天试用期内继续使用试用积分，然后再收费信用卡。

### 我如何跟踪我的开支？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供用量显示，详细列出每项服务的用量。这种细分按使用维度组织，帮助您了解与每个计量单位相关的成本。

### 我如何访问我的 ClickHouse Cloud 服务市场订阅的发票？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

所有市场订阅将在市场上计费和开票。您可以通过相应的云提供商市场直接查看您的发票。

### 为什么用量声明上的日期与我的市场发票不匹配？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS 市场计费遵循日历月周期。  
例如，对于 2024 年 12 月 1 日至 2025 年 1 月 1 日之间的用量，  
发票将在 2025 年 1 月 3 日至 5 日之间生成。

ClickHouse Cloud 的用量声明遵循不同的计费周期，其中的用量是通过从注册的那一天开始计量和报告 30 天。

如果这些日期不同，则用量和发票日期将不同。由于用量声明跟踪给定服务的每日使用情况，用户可以依赖声明查看成本细分。

### 预付积分的使用是否有任何限制？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 预付积分（无论是通过 ClickHouse 直接提供，还是通过云提供商市场）  
只能在合同的条款内使用。这意味着它们可以在接受日期或未来日期应用，而不能用于任何先前的期间。  
任何未被预付积分覆盖的超支必须通过信用卡支付或市场的每月计费来解决。

### 通过云提供商市场支付或直接向 ClickHouse 支付，ClickHouse Cloud 价格是否有差异？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场计费与直接注册 ClickHouse 之间的定价没有差异。  
在任何情况下，您使用 ClickHouse Cloud 的情况都以 ClickHouse Cloud Credits (CHCs) 为基础进行追踪，  
计量方式相同，按相应的方法计费。

### 计算-计算分离是如何计费的？ {#how-is-compute-compute-separation-billed}

在创建服务时，如果与现有服务共享相同数据，您可以选择此新服务是否共享。  
如果是，这两个服务现在形成一个 [仓库](../reference/warehouses.md)。  
一个仓库的数据会被存储在其中，多个计算服务访问此数据。

由于数据只存储一次，即使多个服务访问它，您只需为一份数据付款。  
您按常规支付计算费用——对于计算-计算分离/仓库没有额外费用。  
通过在此部署中利用共享存储，用户在存储和备份方面受益于成本节约。

在某些情况下，计算-计算分离可以为您节省大量 ClickHouse Credits。  
一个好的示例是以下设置：

1. 您有 ETL 作业在 24/7 运行，并将数据导入服务。这些 ETL 作业不需要大量内存，因此可以在例如 32 GiB RAM 的小实例上运行。

2. 同一团队的数据科学家有临时报告需求，表示需要运行需要大量内存的查询 - 236 GiB，但不需要高可用性，如果第一次运行失败，可以等待并重新运行查询。

在此示例中，作为数据库管理员，您可以执行以下操作：

1. 创建一个小型服务，具有两个 16 GiB 的副本 - 这将满足 ETL 作业并提供高可用性。

2. 对于数据科学家，您可以在同一仓库中创建第二个服务，仅使用一个 236 GiB 的副本。您可以为此服务启用待机功能，因此当数据科学家不使用该服务时，您不会为此服务付费。

此示例在 **规模层** 的费用估算（每月）：
- 父服务每日活跃 24 小时：2 个副本 x 16 GiB 4 vCPU 每个副本
- 子服务：1 个副本 x 236 GiB 59 vCPU 每个副本
- 3 TB 的压缩数据 + 1 备份
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

如果没有仓库，您必须支付数据工程师需要的内存量来完成其查询。  
但是，以仓库结合两个服务并让其中一个待机可以帮助您节省资金。

## ClickPipes 定价 {#clickpipes-pricing}

### ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成

- **计算**：每单位每小时的价格  
  计算代表了运行 ClickPipes 副本 Pod 的成本，无论它们是否主动摄取数据。  
  它适用于所有 ClickPipes 类型。
- **摄取的数据**：每 GB 的定价  
  摄取的数据率适用于所有流式 ClickPipes  
  (Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs)  
  针对通过副本 Pod 转移的数据。摄取的数据大小（GB）是基于从源接收到的字节（未压缩或压缩）进行收费。

### ClickPipes 副本是什么？ {#what-are-clickpipes-replicas}

ClickPipes 通过独立于 ClickHouse Cloud 服务的专用基础设施从远程数据源摄取数据。  
因此，它使用专用的计算副本。

### 副本的默认数量及其大小是什么？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认提供 1 个副本，配备 2 GiB 的 RAM 和 0.5 vCPU。  
这对应于 **0.25** ClickHouse 计算单位（1 单位 = 8 GiB RAM，2 vCPU）。

### ClickPipes 的公共价格是什么？ {#what-are-the-clickpipes-public-prices}

- 计算：\$0.20 每单位每小时（\$0.05 每个副本每小时）
- 摄取的数据：\$0.04 每 GB

### 在示例中它是怎样的？ {#how-does-it-look-in-an-illustrative-example}

以下示例假设为单个副本，除非明确提及。

<table><thead>
  <tr>
    <th></th>
    <th>24 小时内 100 GB</th>
    <th>24 小时内 1 TB</th>
    <th>24 小时内 10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>流式 ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>4 个副本：<br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
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
有效数据传输由基础 ClickHouse 服务假定_
