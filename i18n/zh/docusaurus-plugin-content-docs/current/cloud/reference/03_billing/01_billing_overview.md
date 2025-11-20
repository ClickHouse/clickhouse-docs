---
sidebar_label: '概览'
slug: /cloud/manage/billing/overview
title: '定价'
description: 'ClickHouse Cloud 定价概览页面'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'pricing', 'billing', 'cloud costs', 'compute pricing']
---

有关定价信息，请参阅 [ClickHouse Cloud 定价](https://clickhouse.com/pricing#pricing-calculator) 页面。
ClickHouse Cloud 会根据计算资源、存储、[数据传输](/cloud/manage/network-data-transfer)（通过互联网的出口流量以及跨区域流量）以及 [ClickPipes](/integrations/clickpipes) 的使用量进行计费。
若要了解哪些因素会影响您的账单，以及如何管理您的支出，请继续阅读。



## Amazon Web Services (AWS) 示例 {#amazon-web-services-aws-example}

:::note

- 价格基于 AWS us-east-1 区域定价。
- 查看适用的数据传输和 ClickPipes 费用,请访问[此处](/cloud/manage/network-data-transfer)。
  :::

### Basic:每月 $66.52 起 {#basic-from-6652-per-month}

最适合:数据量较小、无严格可靠性保证要求的部门级应用场景。

**Basic 层级服务**

- 1 个副本 x 8 GiB RAM,2 vCPU
- 500 GB 压缩数据
- 500 GB 数据备份
- 10 GB 公网出站数据传输
- 5 GB 跨区域数据传输

此示例的定价明细:

<table>
  <thead>
    <tr>
      <th></th>
      <th>每天活跃 6 小时</th>
      <th>每天活跃 12 小时</th>
      <th>每天活跃 24 小时</th>
    </tr>
  </thead>
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
      <td>公网出站数据传输</td>
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

### Scale(始终在线,自动扩展):每月 $499.38 起 {#scale-always-on-auto-scaling-from-49938-per-month}

最适合:需要增强 SLA(2 个或更多副本服务)、可扩展性和高级安全性的工作负载。

**Scale 层级服务**

- 工作负载活跃时间约 100%
- 可配置自动扩展上限以防止费用失控
- 100 GB 公网出站数据传输
- 10 GB 跨区域数据传输

此示例的定价明细:

<table>
  <thead>
    <tr>
      <th></th>
      <th>示例 1</th>
      <th>示例 2</th>
      <th>示例 3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>计算</td>
      <td>
        2 个副本 x 8 GiB RAM,2 vCPU<br></br>\$436.95
      </td>
      <td>
        2 个副本 x 16 GiB RAM,4 vCPU<br></br>\$873.89
      </td>
      <td>
        3 个副本 x 16 GiB RAM,4 vCPU<br></br>\$1,310.84
      </td>
    </tr>
    <tr>
      <td>存储</td>
      <td>
        1 TB 数据 + 1 份备份<br></br>\$50.60
      </td>
      <td>
        2 TB 数据 + 1 份备份<br></br>\$101.20
      </td>
      <td>
        3 TB 数据 + 1 份备份<br></br>\$151.80
      </td>
    </tr>
    <tr>
      <td>公网出站数据传输</td>
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

### Enterprise:起始价格因需求而异 {#enterprise-starting-prices-vary}

最适合:具有严格安全性和合规性要求的大规模关键任务部署




**企业级服务层**
- 工作负载活跃时间接近 100%
- 1 TB 公网出口数据传输
- 500 GB 跨区域数据传输

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
    <td>2 个副本 × 32 GiB 内存，8 vCPU<br></br>\$2,285.60</td>
    <td>2 个副本 × 64 GiB 内存，16 vCPU<br></br>\$4,571.19</td>
    <td>2 个副本 × 120 GiB 内存，30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>5 TB + 1 份备份<br></br>\$253.00</td>
    <td>10 TB + 1 份备份<br></br>\$506.00</td>
    <td>20 TB + 1 份备份<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>公网出口数据传输</td>
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
    <td>合计</td>
    <td>\$2,669.40</td>
    <td>\$5,207.99</td>
    <td>\$9,713.79</td>
  </tr>
</tbody>
</table>



## 常见问题 {#faqs}

### 什么是 ClickHouse Credit (CHC)? {#what-is-chc}

ClickHouse Credit 是客户使用 ClickHouse Cloud 的信用额度单位,等值于一 (1) 美元,将根据 ClickHouse 当前公布的价格表进行应用。

:::note
如果您通过 Stripe 计费,您将在 Stripe 发票上看到 1 CHC 等于 \$0.01 USD。这是为了在 Stripe 上实现准确计费,因为 Stripe 无法对我们的标准 SKU(1 CHC = \$1 USD)按小数数量计费。
:::

### 在哪里可以找到旧版定价? {#find-legacy-pricing}

旧版定价信息可以在[这里](https://clickhouse.com/pricing?legacy=true)找到。

### 计算资源如何计量? {#how-is-compute-metered}

ClickHouse Cloud 按分钟计量计算资源,以 8G RAM 为增量单位。
计算成本因服务层级、区域和云服务提供商而异。

### 磁盘存储如何计算? {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储,使用量按存储在 ClickHouse 表中的数据压缩后大小计量。
存储成本在各服务层级中相同,但因区域和云服务提供商而异。

### 备份是否计入总存储量? {#do-backups-count-toward-total-storage}

存储和备份计入存储成本并单独计费。
所有服务默认保留一个备份,保留期为一天。
需要额外备份的用户可以在 Cloud 控制台的设置选项卡下配置额外的[备份](/cloud/manage/backups/overview)。

### 如何估算压缩率? {#how-do-i-estimate-compression}

压缩率因数据集而异。
变化程度取决于数据本身的可压缩性(高基数字段与低基数字段的数量),
以及用户如何设置模式(例如是否使用可选编解码器)。
对于常见类型的分析数据,压缩率通常可以达到 10 倍左右,但也可能显著更低或更高。
请参阅[优化文档](/optimize/asynchronous-inserts)获取指导,以及这篇 [Uber 博客](https://www.uber.com/blog/logging/)了解详细的日志用例示例。
准确了解压缩率的唯一实用方法是将您的数据集导入 ClickHouse,然后比较数据集原始大小与存储在 ClickHouse 中的大小。

您可以使用以下查询:

```sql title="估算压缩率"
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = <your table name>
```

### 如果我有自管理部署,ClickHouse 提供哪些工具来估算在云中运行服务的成本? {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志捕获了[关键指标](/operations/system-tables/query_log),可用于估算在 ClickHouse Cloud 中运行工作负载的成本。
有关从自管理迁移到 ClickHouse Cloud 的详细信息,请参阅[迁移文档](/cloud/migration/clickhouse-to-cloud),如有其他问题,请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 提供哪些计费选项? {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项:

- 自助服务月付(以美元计价,通过信用卡支付)。
- 直销年付/多年付(通过预付"ClickHouse Credits",以美元计价,提供额外支付选项)。
- 通过 AWS、GCP 和 Azure 市场(按需付费 (PAYG) 或通过市场与 ClickHouse Cloud 签订合同)。

:::note
PAYG 的 ClickHouse Cloud 信用额度以 \$0.01 为单位开具发票,使我们能够根据客户的使用情况收取部分 ClickHouse 信用额度费用。这与承诺消费的 ClickHouse 信用额度不同,后者以完整的 \$1 为单位预先购买。
:::

### 我可以删除我的信用卡吗? {#can-i-delete-my-credit-card}

您无法在计费界面中删除信用卡,但可以随时更新。这有助于确保您的组织始终拥有有效的支付方式。如果您需要删除信用卡,请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)寻求帮助。

### 计费周期有多长? {#how-long-is-the-billing-cycle}

计费遵循月度计费周期,起始日期为创建 ClickHouse Cloud 组织的日期。


### 如果我有一个有效的 PAYG 市场订阅,然后签署了承诺合同,我的承诺额度会优先消耗吗? {#committed-credits-consumed-first-with-active-payg-subscription}

是的。使用量按以下支付方式顺序消耗:

- 承诺(预付)额度
- 市场订阅 (PAYG)
- 信用卡

### ClickHouse Cloud 为 Scale 和 Enterprise 服务提供哪些成本管理控制? {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 试用和年度承诺客户在消耗达到特定阈值时会自动收到电子邮件通知:`50%`、`75%` 和 `90%`。这使用户能够主动管理其使用量。
- ClickHouse Cloud 允许用户通过[高级扩展控制](/manage/scaling)设置计算资源的最大自动扩展限制,这是分析工作负载的重要成本因素。
- [高级扩展控制](/manage/scaling)允许您设置内存限制,并可选择控制非活动期间的暂停/空闲行为。

### ClickHouse Cloud 为 Basic 服务提供哪些成本管理控制? {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级扩展控制](/manage/scaling)允许您控制非活动期间的暂停/空闲行为。Basic 服务不支持调整内存分配。
- 请注意,默认设置会在一段时间不活动后暂停服务。

### 如果我有多个服务,我会收到每个服务的发票还是合并发票? {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

在一个计费周期内,会为给定组织中的所有服务生成一张合并发票。

### 如果我在试用期和额度到期之前添加信用卡并升级,我会被收费吗? {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天试用期结束前从试用转为付费,但试用额度仍有剩余时,我们会在最初的 30 天试用期内继续使用试用额度,然后再向信用卡收费。

### 我如何跟踪我的支出? {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供使用量显示,详细列出每个服务的使用情况。此细分按使用维度组织,帮助您了解与每个计量单位相关的成本。

### 我如何访问 ClickHouse Cloud 服务订阅的发票? {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

对于使用信用卡的直接订阅:

要查看您的发票,请在 ClickHouse Cloud UI 的左侧导航栏中选择您的组织,然后转到"计费"。您的所有发票将列在"发票"部分下。

对于通过云市场的订阅:

所有市场订阅均由市场进行计费和开具发票。您可以直接通过相应的云提供商市场查看您的发票。

### 为什么使用量报表上的日期与我的市场发票不匹配? {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplace 计费遵循日历月周期。
例如,对于 2024 年 12 月 1 日至 2025 年 1 月 1 日之间的使用量,
发票会在 2025 年 1 月 3 日至 5 日之间生成

ClickHouse Cloud 使用量报表遵循不同的计费周期,使用量从注册之日起按 30 天进行计量和报告。

如果这些日期不同,使用量和发票日期将会有所不同。由于使用量报表按天跟踪给定服务的使用情况,用户可以依靠报表查看成本明细。

### 预付额度的使用是否有任何限制? {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 预付额度(无论是直接通过 ClickHouse 还是通过云提供商的市场)
只能在合同条款范围内使用。
这意味着它们可以在接受日期或未来日期应用,而不能用于任何之前的期间。
预付额度未涵盖的任何超额部分必须通过信用卡支付或市场月度计费来支付。

### 通过云提供商市场支付与直接向 ClickHouse 支付,ClickHouse Cloud 定价是否有差异? {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}


通过市场计费与直接注册 ClickHouse 在定价上没有区别。
无论哪种情况,您对 ClickHouse Cloud 的使用都以 ClickHouse Cloud Credits (CHCs) 进行跟踪,
计量方式相同并据此计费。

### 计算-计算分离如何计费? {#how-is-compute-compute-separation-billed}

在现有服务之外创建服务时,
您可以选择新服务是否应与现有服务共享相同的数据。
如果是,这两个服务现在将形成一个[仓库](/cloud/reference/warehouses)。
仓库中存储数据,多个计算服务可以访问这些数据。

由于数据仅存储一次,您只需为一份数据副本付费,尽管有多个服务在访问它。
您照常为计算付费——计算-计算分离/仓库不收取额外费用。
通过在此部署中利用共享存储,用户可以在存储和备份方面节省成本。

在某些情况下,计算-计算分离可以为您节省大量 ClickHouse Credits。
以下设置是一个很好的例子:

1. 您有全天候运行的 ETL 作业,将数据摄取到服务中。这些 ETL 作业不需要大量内存,因此可以在小型实例上运行,例如具有 32 GiB RAM 的实例。

2. 同一团队中的数据科学家有临时报告需求,表示他们需要运行一个需要大量内存的查询 - 236 GiB,但不需要高可用性,如果首次运行失败可以等待并重新运行查询。

在此示例中,作为数据库管理员,您可以执行以下操作:

1. 创建一个小型服务,包含两个副本,每个 16 GiB - 这将满足 ETL 作业并提供高可用性。

2. 对于数据科学家,您可以在同一仓库中创建第二个服务,仅包含一个 236 GiB 的副本。您可以为此服务启用空闲功能,这样当数据科学家不使用时,您无需为此服务付费。

此示例在 **Scale Tier** 上的成本估算(每月):

- 父服务全天 24 小时活动:2 个副本 x 每个副本 16 GiB 4 vCPU
- 子服务:1 个副本 x 每个副本 236 GiB 59 vCPU
- 3 TB 压缩数据 + 1 个备份
- 100 GB 公共互联网出站数据传输
- 50 GB 跨区域数据传输

<table class='nowrap-header'>
  <thead>
    <tr>
      <th></th>
      <th>
        <span>子服务</span>
        <br />
        <span>每天活动 1 小时</span>
      </th>
      <th>
        <span>子服务</span>
        <br />
        <span>每天活动 2 小时</span>
      </th>
      <th>
        <span>子服务</span>
        <br />
        <span>每天活动 4 小时</span>
      </th>
    </tr>
  </thead>
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
      <td>公共互联网出站数据传输</td>
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

如果没有仓库,您将不得不为数据科学家查询所需的内存量付费。
然而,在仓库中组合两个服务并将其中一个设置为空闲状态可以帮助您节省资金。


## ClickPipes 定价 {#clickpipes-pricing}

有关 ClickPipes 计费的信息,请参阅专门的["ClickPipes 计费"部分](/cloud/reference/billing/clickpipes)。
