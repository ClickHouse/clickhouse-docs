---
'sidebar_label': '概述'
'slug': '/cloud/manage/billing/overview'
'title': '定价'
'description': 'ClickHouse云定价概述页面'
---



对于定价信息，请参见[ClickHouse Cloud Pricing](https://clickhouse.com/pricing#pricing-calculator)页面。  
ClickHouse Cloud 根据计算、存储、[数据传输](/cloud/manage/network-data-transfer)（互联网上的外部流量和跨区域）和[ClickPipes](/integrations/clickpipes)的使用情况进行计费。  
要了解哪些因素可能会影响您的账单，以及您可以管理支出的方式，请继续阅读。

## 亚马逊网络服务(AWS)示例 {#amazon-web-services-aws-example}

:::note
- 价格反映AWS us-east-1的定价。
- 在[这里](jan2025_faq/dimensions.md)查看适用的数据传输和ClickPipes费用。
:::

### 基础：每月从$66.52起 {#basic-from-6652-per-month}

最佳适用场景：具有较小数据量且没有严格可靠性保证的部门用例。

**基础层服务**
- 1个副本 x 8 GiB RAM, 2 vCPU
- 500 GB的压缩数据
- 500 GB的数据备份
- 10 GB的公共互联网外部流量数据传输
- 5 GB的跨区域数据传输

此示例的定价细分：

<table><thead>
  <tr>
    <th></th>
    <th>每天活跃6小时</th>
    <th>每天活跃12小时</th>
    <th>每天活跃24小时</th>
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
    <td>公共互联网外部流量数据传输</td>
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

### 可扩展（始终在线，自动缩放）：每月从$499.38起 {#scale-always-on-auto-scaling-from-49938-per-month}

最佳适用场景：需要增强SLA（2个以上副本服务）、可扩展性和高级安全性的工作负载。

**可扩展层服务**
- 活跃工作负载约100%的时间
- 最大可配置自动缩放以防止账单失控
- 100 GB的公共互联网外部流量数据传输
- 10 GB的跨区域数据传输

此示例的定价细分：

<table><thead>
  <tr>
    <th></th>
    <th>示例1</th>
    <th>示例2</th>
    <th>示例3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>计算</td>
    <td>2个副本 x 8 GiB RAM, 2 vCPU<br></br>\$436.95</td>
    <td>2个副本 x 16 GiB RAM, 4 vCPU<br></br>\$873.89</td>
    <td>3个副本 x 16 GiB RAM, 4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>1TB的数据 + 1个备份<br></br>\$50.60</td>
    <td>2TB的数据 + 1个备份<br></br>\$101.20</td>
    <td>3TB的数据 + 1个备份<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>公共互联网外部流量数据传输</td>
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

### 企业：起始价格各不相同 {#enterprise-starting-prices-vary}

最佳适用场景：大规模、关键任务的部署，具有严格的安全性和合规性需求

**企业层服务**
- 活跃工作负载约100%的时间
- 1 TB的公共互联网外部流量数据传输
- 500 GB的跨区域数据传输

<table><thead>
  <tr>
    <th></th>
    <th>示例1</th>
    <th>示例2</th>
    <th>示例3</th>
  </tr></thead>
<tbody>
  <tr>
    <td>计算</td>
    <td>2个副本 x 32 GiB RAM, 8 vCPU<br></br>\$2,285.60</td>
    <td>2个副本 x 64 GiB RAM, 16 vCPU<br></br>\$4,571.19</td>
    <td>2个 x 120 GiB RAM, 30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>5TB + 1个备份<br></br>\$253.00</td>
    <td>10TB + 1个备份<br></br>\$506.00</td>
    <td>20TB + 1个备份<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>公共互联网外部流量数据传输</td>
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

ClickHouse Cloud 在每分钟的基础上按8G RAM的增量计量计算。  
计算成本将根据层、区域和云服务提供商的不同而有所不同。

### 磁盘上的存储是如何计算的？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，使用量是根据存储在ClickHouse表中的压缩数据大小来计量的。  
存储成本在各层中是相同的，并且因区域和云服务提供商的不同而有所不同。

### 备份是否算入总存储中？ {#do-backups-count-toward-total-storage}

存储和备份计入存储费用，并单独计费。  
所有服务将默认为一个备份，保留一天。  
需要额外备份的用户可以通过在Cloud Console的设置选项卡下配置额外的[备份](backups/overview.md)来实现。

### 如何估计压缩率？ {#how-do-i-estimate-compression}

压缩率因数据集而异。  
它取决于数据本身的可压缩性（高基数和低基数字段的数量），  
以及用户如何设置模式（例如，是否使用可选编解码器）。  
对于常见类型的分析数据，其压缩比例可能达到10倍，但也可能远低于或高于此。  
有关指导，请参阅[优化文档](/optimize/asynchronous-inserts)以及这篇[Uber博客](https://www.uber.com/blog/logging/)的详细日志使用案例。  
确切的压缩率最好通过将数据集导入ClickHouse并比较数据集的大小与存储在ClickHouse中的大小来确定。

您可以使用以下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### 如果我有自管理部署，ClickHouse 提供什么工具来估算在云中运行服务的成本？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获了可用于估算在 ClickHouse Cloud 运行工作负载成本的[关键指标](/operations/system-tables/query_log)。  
有关从自管理迁移到ClickHouse Cloud的详细信息，请参考[迁移文档](/cloud/migration/clickhouse-to-cloud)，并若有进一步问题，请联系[ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 提供哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助服务按月计费（以美元，借记卡支付）。
- 直接销售年费/多年（通过预付的“ClickHouse积分”，以美元，带有附加付款选项）。
- 通过 AWS、GCP 和 Azure 市场（按需付费(PAYG)或通过市场与ClickHouse Cloud签订合约）。

### 计费周期是多长？ {#how-long-is-the-billing-cycle}

计费采用月度计费周期，并以ClickHouse Cloud组织创建的日期为起始日期。

### ClickHouse Cloud 提供哪些控制措施来管理可扩展和企业服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户将在消费达到某些阈值时自动通过电子邮件进行通知：`50%`、`75%` 和 `90%`。这使用户能够主动管理其使用情况。
- ClickHouse Cloud 允许用户通过[高级缩放控制](/manage/scaling)设置最大自动缩放限制，这是分析工作负载的重要成本因素。
- [高级缩放控制](/manage/scaling)让您设置内存限制，并提供在不活动期间控制暂停/空闲行为的选项。

### ClickHouse Cloud 提供哪些控制措施来管理基础服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级缩放控制](/manage/scaling)让您控制不活动期间的暂停/空闲行为。基础服务不支持调整内存分配。
- 请注意，默认设置在一段时间不活动后会暂停服务。

### 如果我有多个服务，会收到每个服务的发票还是合并发票？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

将为给定组织在计费周期内的所有服务生成合并发票。

### 如果在试用期和积分到期之前添加信用卡并升级，我会被收费吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在30天试用期结束之前从试用转为付费且仍有试用积分时，我们将在最初的30天试用期内继续消耗试用积分，然后再向信用卡收费。

### 我如何跟踪我的支出？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供详细展示每项服务用量的使用情况显示。此细分按使用维度组织，有助于您了解与每个计量单位相关的费用。

### 如何访问我在 ClickHouse Cloud 服务的市场订阅的发票？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

所有市场订阅将由市场负责计费和开具发票。您可以通过相应的云提供商市场直接查看您的发票。

### 为什么使用声明上的日期与我的市场发票不匹配？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS 市场计费遵循日历月周期。  
例如，对于2024年12月1日到2025年1月1日之间的使用情况，  
将在2025年1月3日至5日之间生成发票。

ClickHouse Cloud 使用声明遵循不同的计费周期，在签署的当天开始计量和报告30天的使用情况。

如果这些日期不同，使用和发票日期将有所不同。由于使用声明按天跟踪给定服务的使用，用户可以依赖声明查看费用的细分。

### 使用预付积分是否存在任何限制？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 的预付积分（无论是通过 ClickHouse 直接获取，还是通过云提供商的市场）  
只能在合同条款内使用。  
这意味着它们可以在接受日期或未来日期使用，而不能用于任何之前的时间段。  
超出预付积分的部分必须通过信用卡支付或市场的月度计费来处理。

### 在通过云提供商市场付款或直接向 ClickHouse 付款时，ClickHouse Cloud 的定价是否有所不同？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

市场计费和直接注册ClickHouse之间定价无差异。  
在这两种情况下，您对ClickHouse Cloud的使用情况是以 ClickHouse Cloud 积分（CHCs）计量的，  
并按照相同的方式计费。

### 计算-计算分隔的计费方式是怎样的？ {#how-is-compute-compute-separation-billed}

在创建新的服务时，用户可以选择该新服务是否与现有的服务共享相同的数据。  
如果是，这两个服务现在形成一个[仓库](../reference/warehouses.md)。  
仓库中存储了数据，有多个计算服务访问这些数据。

由于数据仅存储一次，因此您只需为一份数据支付费用，尽管有多个服务在访问它。  
计算费用照常支付 — 不会对计算-计算分隔/仓库收取额外费用。  
通过在此部署中利用共享存储，用户在存储和备份方面享受了成本节省。

计算-计算分隔在某些情况下可以为您节省大量 ClickHouse 积分。  
一个好的示例是以下设置：

1. 您有ETL作业在24小时不断运行并将数据摄取到服务中。这些ETL作业不需要很多内存，因此可以在小实例上运行，例如32 GiB的RAM。

2. 同一团队的数据科学家有临时报告需求，表示需要运行需要大内存的查询 - 236 GiB，但是不需要高可用性，如果第一次运行失败，可以等待并重新运行查询。

在这个示例中，作为数据库管理员，您可以执行以下操作：

1. 创建一个有两个副本16 GiB的小服务 - 这将满足ETL作业并提供高可用性。

2. 对于数据科学家，您可以在同一仓库中创建一个副本为236 GiB的第二服务。您可以为此服务启用空闲状态，以便在数据科学家没有使用时不支付此服务的费用。

对于**可扩展层**的此示例的费用估算（每月）：
- 父服务全天候活跃：2个副本 x 16 GiB 4 vCPU 每个副本
- 子服务：1个副本 x 236 GiB 59 vCPU 每个副本
- 3 TB的压缩数据 + 1个备份
- 100 GB的公共互联网外部流量数据传输
- 50 GB的跨区域数据传输

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子服务</span><br/><span>每天活跃1小时</span></th>
    <th><span>子服务</span><br/><span>每天活跃2小时</span></th>
    <th><span>子服务</span><br/><span>每天活跃4小时</span></th>
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
    <td>公共互联网外部流量数据传输</td>
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

如果没有仓库，您将不得不为数据工程师对其查询所需的内存支付费用。  
然而，将两个服务结合在一个仓库中并让其中一个处于空闲状态，可以帮助您节省开支。

## ClickPipes定价 {#clickpipes-pricing}

### ClickPipes的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成

- **计算**：每小时每个单位的价格  
   计算代表运行ClickPipes副本Pod的成本，无论它们是否主动摄取数据。  
   适用于所有类型的ClickPipes。
- **摄取的数据**：按GB计价  
   摄取数据费率适用于所有流式ClickPipes  
   （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs），  
   用于通过副本Pods传输的数据。摄取的数据大小（GB）根据从源接收的字节（未压缩或压缩）收费。

### ClickPipes副本是什么？ {#what-are-clickpipes-replicas}

ClickPipes通过独立于ClickHouse Cloud服务的专用基础设施从远程数据源摄取数据。  
因此，它使用专用的计算副本。

### 副本的默认数量及其大小是多少？ {#what-is-the-default-number-of-replicas-and-their-size}

每个ClickPipe默认提供1个副本，配备2 GiB的RAM和0.5 vCPU。  
这对应于**0.25**个ClickHouse计算单位（1个单位 = 8 GiB RAM，2 vCPUs）。

### ClickPipes的公共价格是多少？ {#what-are-the-clickpipes-public-prices}

- 计算：每单位每小时\$0.20（每个副本每小时 \$0.05）
- 摄取的数据：每GB \$0.04

### 通过一个示例，它的费用是怎样的？ {#how-does-it-look-in-an-illustrative-example}

以下示例假设单个副本，除非特别说明。

<table><thead>
  <tr>
    <th></th>
    <th>24小时内100 GB</th>
    <th>24小时内1 TB</th>
    <th>24小时内10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>流式ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>有4个副本：<br></br>(0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>对象存储ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _仅为ClickPipes计算用于编排，  
有效的数据传输由底层ClickHouse服务承担_
