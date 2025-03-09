---
sidebar_label: '概述'
slug: /cloud/manage/billing/overview
title: '定价'
---

有关定价信息，请参阅 [ClickHouse Cloud 定价](https://clickhouse.com/pricing#pricing-calculator) 页面。 
ClickHouse Cloud 根据计算、存储、[数据传输](/cloud/manage/network-data-transfer)（互联网出口及跨区域）和 [ClickPipes](/integrations/clickpipes) 的使用情况进行计费。 
要了解可能影响您账单的因素以及管理支出的方式，请继续阅读。

## 亚马逊网络服务 (AWS) 示例 {#amazon-web-services-aws-example}

:::note
- 价格反映 AWS us-east-1 的定价。
- 在这里浏览适用的数据传输和 ClickPipes 的费用 [here](jan2025_faq/dimensions.md)。
:::

### 基础：每月起价 $66.52 {#basic-from-6652-per-month}

适合：数据量较小且没有严格可靠性保证的部门使用案例。

**基础级服务**
- 1 个副本 x 8 GiB RAM，2 vCPU
- 500 GB 的压缩数据
- 500 GB 的数据备份
- 10 GB 的公共互联网出口数据传输
- 5 GB 的跨区域数据传输

此示例的定价明细：

<table><thead>
  <tr>
    <th></th>
    <th>每天活动 6 小时</th>
    <th>每天活动 12 小时</th>
    <th>每天活动 24 小时</th>
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

### 扩展（始终在线，自动扩展）：每月起价 $499.38 {#scale-always-on-auto-scaling-from-49938-per-month}

适合：需要增强 SLA（2+ 副本服务）、可扩展性和高级安全性的工作负载。

**扩展级服务**
- 活动工作负载 ~100% 时间
- 自动扩展最大配置以防止账单失控
- 100 GB 的公共互联网出口数据传输
- 10 GB 的跨区域数据传输

此示例的定价明细：

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
    <td>2 副本 x 8 GiB RAM，2 vCPU<br></br>\$436.95</td>
    <td>2 副本 x 16 GiB RAM，4 vCPU<br></br>\$873.89</td>
    <td>3 副本 x 16 GiB RAM，4 vCPU<br></br>\$1,310.84</td>
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

### 企业：起始价格不同 {#enterprise-starting-prices-vary}

适合：需要严格安全和合规需求的大规模、关键任务部署

**企业级服务**
- 活动工作负载 ~100% 时间
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
    <td>2 副本 x 32 GiB RAM，8 vCPU<br></br>\$2,285.60</td>
    <td>2 副本 x 64 GiB RAM，16 vCPU<br></br>\$4,571.19</td>
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

ClickHouse Cloud 以每分钟为单位计量计算，按 8G RAM 的增量计量。 
计算成本将在不同层级、地区和云服务提供商之间有所不同。

### 磁盘上的存储如何计算？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，使用量按存储在 ClickHouse 表中的压缩数据大小计量。 
存储成本在不同层级之间相同，但因地区和云服务提供商而异。

### 备份是否计入总存储？ {#do-backups-count-toward-total-storage}

存储和备份计入存储成本，并单独计费。 
所有服务默认保留一个备份，保存一天。 
需要额外备份的用户可以通过在 Cloud 控制台的设置选项卡下配置额外的 [备份](backups/overview.md)。

### 如何估计压缩？ {#how-do-i-estimate-compression}

压缩会因数据集而异。 
它取决于数据的可压缩性（高基数字段与低基数字段的数量）， 
以及用户如何设置模式（例如，是否使用可选编解码器）。 
对于常见的分析数据类型，压缩比可以达到 10 倍，但也可能显著低于或高于此数。 
有关指导，请参阅 [优化文档](/optimize/asynchronous-inserts) 和这篇 [Uber 博客](https://www.uber.com/blog/logging/) 的详细日志使用案例示例。 
唯一确切了解的方法是将数据集导入 ClickHouse，并比较数据集的大小与存储在 ClickHouse 中的大小。

您可以使用以下查询：

```sql title="估计压缩"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```

### ClickHouse 提供哪些工具来估算在云服务中运行服务的成本，如果我有自管理部署？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获 [关键指标](/operations/system-tables/query_log)，可用于估算在 ClickHouse Cloud 中运行工作负载的成本。 
有关从自管理迁移到 ClickHouse Cloud 的详细信息，请参阅 [迁移文档](/cloud/migration/clickhouse-to-cloud)，如有进一步问题，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 有哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助式月度（以美元，通过信用卡）。
- 直接销售年度/多年度（通过预付费“ClickHouse 信用”为单位，以美元，以及其他支付选项）。
- 通过 AWS、GCP 和 Azure 市场（支付即用（PAYG）或通过市场与 ClickHouse Cloud 签署合同）。

### 计费周期是多长？ {#how-long-is-the-billing-cycle}

计费遵循月度计费周期，开始日期记录为创建 ClickHouse Cloud 组织的日期。

### ClickHouse Cloud 提供哪些控制来管理 Scale 和 Enterprise 服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户在消费达到某些阈值时会自动通过电子邮件通知：`50%`、`75%` 和 `90%`。 这使用户能够主动管理他们的使用情况。
- ClickHouse Cloud 允许用户通过 [高级扩展控制](/manage/scaling) 设置计算的最大自动扩展限制，这是分析工作负载的一个重要成本因素。
- [高级扩展控制](/manage/scaling) 允许您设置内存限制，并可以控制在不活动时的暂停/闲置行为。

### ClickHouse Cloud 提供哪些控制来管理基础服务的成本？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级扩展控制](/manage/scaling) 允许您控制在不活动时的暂停/闲置行为。 不支持调整基础服务的内存分配。
- 请注意，默认设置在一段时间不活动后暂停服务。

### 如果我有多个服务，我会收到每个服务的发票还是合并发票？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

在给定的计费周期内，会为组织中的所有服务生成合并发票。

### 如果我在试用期结束前添加信用卡并升级，我会被收费吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天的试用期结束前将试用转换为付费并且仍有试用信用余额时，我们将在最初的 30 天试用期内继续从试用信用中扣除费用，然后向信用卡收费。

### 如何跟踪我的支出？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供详细的使用情况显示，按服务详细展示使用情况。 该明细按使用维度组织，帮助您了解与每个计量单位相关的成本。

### 如何访问我在 ClickHouse Cloud 服务上的市场订阅发票？ {#how-do-i-access-my-invoice-for-my-marketplace-subscription-to-the-clickhouse-cloud-service}

所有市场订阅将由市场进行计费和开票。 您可以直接通过相关的云服务提供商市场查看您的发票。

### 为什么使用声明上的日期与我的市场发票不匹配？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS 市场计费遵循日历月周期。 
例如，对于 2024 年 12 月 1 日到 2025 年 1 月 1 日之间的使用， 
将在 2025 年 1 月 3 日至 1 月 5 日之间生成发票。

ClickHouse Cloud 使用声明遵循不同的计费周期，使用情况从订阅日开始的 30 天内计量并报告。

如果这些日期不同，使用和发票日期将不同。 由于使用声明按天跟踪特定服务的使用情况，用户可以依赖声明查看成本明细。

### 预付信用的使用是否有限制？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 预付信用（无论是直接通过 ClickHouse，还是通过云服务提供商的市场）只能在合同条款内使用。 
这意味着它们可以在接受日期或未来日期使用，而不能用于任何先前的时期。 
超出预付信用所覆盖的任何费用必须通过信用卡付款或市场月度计费覆盖。

### 通过云服务提供商市场支付与直接支付 ClickHouse 是否存在价格差异？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}

无论是市场计费还是直接与 ClickHouse 签署，没有价格差异。 
无论哪种情况，您对 ClickHouse Cloud 的使用情况都是按 ClickHouse Cloud 信用 (CHCs) 进行跟踪的， 
计量方式相同并据此收费。

### 计算-计算分离是如何计费的？ {#how-is-compute-compute-separation-billed}

在创建新服务时，可以选择此新服务是否应与现有服务共享相同的数据。 
如果是，则这两个服务现在形成一个 [仓库](../reference/warehouses.md)。 
一个仓库中的数据存储只能访问多种计算服务。

由于数据仅存储一次，因此您只需为一份数据付费，尽管多个服务正在访问它。 
计算费用照常计算 —— 计算-计算分离/仓库没有额外费用。
通过在此部署中利用共享存储，用户可在存储和备份方面享受成本节约。

在某些情况下，计算-计算分离可为您节省大量 ClickHouse 信用。 
以下设置是一个很好的例子：

1. 您有 24/7 运行并向服务中注入数据的 ETL 作业。 这些 ETL 作业不需要太多内存，因此它们可以在小型实例上运行，例如 32 GiB 的 RAM。

2. 同一团队中的数据科学家有临时报告的需求，表示他们需要运行一个需要大量内存的查询 - 236 GiB，但是不需要高可用性，并且如果第一次运行失败可以等待并重跑查询。

在这个例子中，作为数据库管理员，您可以做以下事情：

1. 创建一个有两个副本每个 16 GiB 的小型服务 - 这可以满足 ETL 作业并提供高可用性。

2. 对于数据科学家，您可以在同一仓库中创建一个只有 236 GiB 的一个副本的第二个服务。 您可以为这个服务启用闲置，以便在数据科学家不使用时不需要为这个服务付费。

此示例的月度成本估算（在 **扩展级**）：
- 父服务每天活动 24 小时：2 副本 x 16 GiB 4 vCPU 每副本
- 子服务：1 副本 x 236 GiB 59 vCPU 每副本
- 3 TB 的压缩数据 + 1 备份
- 100 GB 的公共互联网出口数据传输
- 50 GB 的跨区域数据传输

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子服务</span><br/><span>每天活动 1 小时</span></th>
    <th><span>子服务</span><br/><span>每天活动 2 小时</span></th>
    <th><span>子服务</span><br/><span>每天活动 4 小时</span></th>
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

如果没有仓库，您将不得不为数据工程师查询所需的内存支付费用。 
然而，将两个服务结合在一个仓库中并使其中一个闲置有助于节省开支。

## ClickPipes 定价 {#clickpipes-pricing}

### ClickPipes 的定价结构是什么样的？ {#what-does-the-clickpipes-pricing-structure-look-like}

它由两个维度组成

- **计算**：每单位每小时的价格
    计算表示运行 ClickPipes 副本 pod 的成本，无论它们是否积极接收数据。 
    它适用于所有 ClickPipes 类型。
- **接收的数据**：按 GB 定价
    接收的数据率适用于所有流式 ClickPipes 
    （Kafka、Confluent、Amazon MSK、Amazon Kinesis、Redpanda、WarpStream、Azure Event Hubs） 
    通过副本 pod 传输的数据。接收的数据大小（GB）按从源接收的字节数计费（无论是压缩还是未压缩）。

### ClickPipes 副本是什么？ {#what-are-clickpipes-replicas}

ClickPipes 通过专用基础设施从远程数据源接收数据 
该基础设施独立于 ClickHouse Cloud 服务运行和扩展。 
因此，它使用专用的计算副本。

### 副本的默认数量及其大小是什么？ {#what-is-the-default-number-of-replicas-and-their-size}

每个 ClickPipe 默认为 1 个副本，配备 2 GiB 的 RAM 和 0.5 vCPU。 
这对应于 **0.25** ClickHouse 计算单位（1 单位 = 8 GiB RAM，2 vCPU）。

### ClickPipes 公共价格是多少？ {#what-are-the-clickpipes-public-prices}

- 计算：每单位每小时 \$0.20（每副本每小时 \$0.05）
- 接收的数据：每 GB \$0.04

### 举个例子说明一下？ {#how-does-it-look-in-an-illustrative-example}

以下示例假设使用单个副本，除非明确提及。

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
    <td>4 个副本： <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
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
有效的数据传输由底层 Clickhouse 服务假定_
