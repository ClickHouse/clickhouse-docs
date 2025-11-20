---
sidebar_label: '概览'
slug: /cloud/manage/billing/overview
title: '定价'
description: 'ClickHouse Cloud 定价概览页面'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'pricing', 'billing', 'cloud costs', 'compute pricing']
---

如需了解定价信息，请参阅 [ClickHouse Cloud 定价](https://clickhouse.com/pricing#pricing-calculator) 页面。
ClickHouse Cloud 会根据计算资源、存储、[数据传输](/cloud/manage/network-data-transfer)（包括通过互联网的出口流量和跨区域流量）以及 [ClickPipes](/integrations/clickpipes) 的使用量进行计费。  
要了解哪些因素会影响您的账单，以及如何更好地管理您的支出，请继续阅读。



## Amazon Web Services (AWS) 示例 {#amazon-web-services-aws-example}

:::note

- 价格基于 AWS us-east-1 区域定价。
- 在[此处](/cloud/manage/network-data-transfer)查看适用的数据传输和 ClickPipes 费用。
  :::

### Basic:每月起价 $66.52 {#basic-from-6652-per-month}

最适合:数据量较小且无严格可靠性保证要求的部门级使用场景。

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

### Scale(始终在线,自动扩缩容):每月起价 $499.38 {#scale-always-on-auto-scaling-from-49938-per-month}

最适合:需要增强 SLA(2 个或更多副本服务)、可扩展性和高级安全性的工作负载。

**Scale 层级服务**

- 工作负载活跃时间约 100%
- 可配置自动扩缩容上限以防止费用失控
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

### Enterprise:起始价格因情况而异 {#enterprise-starting-prices-vary}

最适合:具有严格安全性和合规性需求的大规模关键任务部署




**企业级服务层**
- 工作负载约有 100% 的时间处于活跃状态
- 1 TB 公网下行数据传输
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
    <td>2 × 120 GiB 内存，30 vCPU<br></br>\$8,570.99</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>5 TB + 1 份备份<br></br>\$253.00</td>
    <td>10 TB + 1 份备份<br></br>\$506.00</td>
    <td>20 TB + 1 份备份<br></br>\$1,012.00</td>
  </tr>
  <tr>
    <td>公网下行数据传输</td>
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



## 常见问题解答 {#faqs}

### 什么是 ClickHouse Credit（CHC）？ {#what-is-chc}

ClickHouse Credit 是用于抵扣客户 ClickHouse Cloud 使用费用的计费单位，每 1 个等同于 1 美元，并根据 ClickHouse 当时公布的价格表进行结算。

:::note
如果您通过 Stripe 支付账单，那么在 Stripe 发票上会看到 1 CHC 等于 \$0.01 美元。由于 Stripe 无法对我们标准规格（1 CHC = \$1 美元）的非整数数量进行计费，因此采用这种方式以在 Stripe 上实现精确计费。
:::

### 在哪里可以找到旧版定价？ {#find-legacy-pricing}

旧版定价信息可以在[此处](https://clickhouse.com/pricing?legacy=true)查看。

### 计算资源如何计量？ {#how-is-compute-metered}

ClickHouse Cloud 按分钟计量计算资源，以 8G 内存为增量单位。
计算成本会因服务层级、区域和云服务提供商的不同而有所差异。

### 磁盘存储如何计费？ {#how-is-storage-on-disk-calculated}

ClickHouse Cloud 使用云对象存储，根据存储在 ClickHouse 表中的数据压缩后大小来计量用量。
各个服务层级的存储成本相同，但会因区域和云服务提供商的不同而变化。

### 备份是否计入总存储？ {#do-backups-count-toward-total-storage}

数据存储和备份都会计入存储成本，并分别计费。
所有服务默认保留 1 个备份，保留时间为 1 天。
如需更多备份，用户可以在 Cloud 控制台的“设置”页签中配置额外的[备份](/cloud/manage/backups/overview)。

### 如何估算压缩比？ {#how-do-i-estimate-compression}

不同数据集之间的压缩比会有所差异。
差异幅度取决于数据本身的可压缩程度（高基数字段与低基数字段的数量），
以及用户如何设计表结构（例如是否使用可选的编解码器）。
对于常见的分析型数据，压缩比通常可以达到 10 倍量级，但也可能明显低于或高于该水平。
有关指导，请参见[优化文档](/optimize/asynchronous-inserts)，以及这篇 [Uber 博客](https://www.uber.com/blog/logging/)，其中包含一个详细的日志用例示例。
准确了解压缩比的唯一可行方法，是将您的数据集导入 ClickHouse，然后比较原始数据集大小与 ClickHouse 中的存储大小。

您可以使用以下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes)
FROM system.tables
WHERE name = <your table name>
```

### 如果我有自管部署，ClickHouse 提供哪些工具来估算在云上运行服务的成本？ {#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment}

ClickHouse 查询日志会采集一组可用于估算在 ClickHouse Cloud 上运行工作负载成本的[关键指标](/operations/system-tables/query_log)。
关于从自管部署迁移到 ClickHouse Cloud 的详细信息，请参阅[迁移文档](/cloud/migration/clickhouse-to-cloud)；如有其他问题，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 提供哪些计费选项？ {#what-billing-options-are-available-for-clickhouse-cloud}

ClickHouse Cloud 支持以下计费选项：

- 自助按月计费（以美元计价，通过信用卡支付）。
- 直销年度 / 多年期（通过预付的 “ClickHouse Credits”，以美元计价，并提供其他支付方式）。
- 通过 AWS、GCP 和 Azure 市场（按需付费（PAYG），或通过云市场与 ClickHouse Cloud 签订合约承诺消费）。

:::note
用于 PAYG 的 ClickHouse Cloud credits 以 \$0.01 为单位开具发票，使我们能够根据客户的实际用量，对部分 ClickHouse credits 进行计费。这与预承诺支出场景中的 ClickHouse credits 不同，后者需要以整 \$1 为单位预先购买。
:::

### 我可以删除我的信用卡吗？ {#can-i-delete-my-credit-card}

您无法在计费界面中移除信用卡，但可以随时更新信用卡信息。这有助于确保您的组织始终有一个有效的支付方式。如需移除信用卡，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)获取帮助。

### 计费周期有多长？ {#how-long-is-the-billing-cycle}

计费采用按月计费周期，起始日期为创建 ClickHouse Cloud 组织的日期。


### 如果我已有激活状态的按需付费（PAYG）云市场订阅，然后再签订承诺合同时，我的承诺额度会优先被消耗吗？ {#committed-credits-consumed-first-with-active-payg-subscription}

会。使用量将按以下支付方式的顺序依次扣减：

- 承诺（预付）额度
- 云市场订阅（PAYG）
- 信用卡

### ClickHouse Cloud 为 Scale 和 Enterprise 服务提供了哪些成本管控能力？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services}

- 当试用和年度承诺客户的使用量达到特定阈值（`50%`、`75%` 和 `90%`）时，会自动通过电子邮件通知，从而帮助用户主动管理自己的用量。
- ClickHouse Cloud 允许用户通过 [高级伸缩控制](/manage/scaling) 为计算资源设置最大自动伸缩上限，而计算通常是分析型工作负载中的主要成本因素。
- [高级伸缩控制](/manage/scaling) 允许你设置内存上限，并可配置在空闲期间服务暂停/保留闲置的行为。

### ClickHouse Cloud 为 Basic 服务提供了哪些成本管控能力？ {#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services}

- [高级伸缩控制](/manage/scaling) 允许你控制服务在空闲期间的暂停/保留闲置行为。Basic 服务不支持调整内存分配。
- 请注意，默认设置会在一段时间无活动后暂停服务。

### 如果我有多个服务，是每个服务分别开具账单，还是提供汇总账单？ {#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice}

在每个计费周期内，会为某个组织下的所有服务生成一张汇总账单。

### 如果我在试用期和试用额度到期前添加了信用卡并完成升级，会被收费吗？ {#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged}

当用户在 30 天试用期结束前从试用版转换为付费版，但仍有剩余试用额度时， 在最初的 30 天试用期内，我们会继续优先消耗试用额度，之后才会从信用卡扣费。

### 我如何跟踪自己的支出情况？ {#how-can-i-keep-track-of-my-spending}

ClickHouse Cloud 控制台提供“使用情况”视图，可按服务展示详细用量。该按使用维度划分的明细有助于你理解每个计量单元对应的成本。

### 我如何获取自己订阅 ClickHouse Cloud 服务的账单？ {#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service}

对于使用信用卡的直接订阅：

要查看你的账单，请在 ClickHouse Cloud 界面左侧导航栏中选择你的组织，然后进入“Billing”。你的所有账单都会列在“Invoices”部分。

对于通过云市场购买的订阅：

所有云市场订阅均由相应云市场负责计费和开具账单。你可以直接在对应云服务商的市场中查看账单。

### 为什么使用情况报表上的日期与我的云市场账单日期不匹配？ {#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice}

AWS Marketplace 的计费遵循自然月周期。  
例如，对于 2024-12-01 至 2025-01-01 之间的使用量， 会在 2025-01-03 到 2025-01-05 期间生成账单。

ClickHouse Cloud 的使用情况报表遵循不同的计费周期：从注册之日起按 30 天为一个周期进行计量和汇总。

如果这两个起止日期不同，则使用情况报表和账单上的日期就会不一致。由于使用情况报表会按服务按天跟踪使用量，用户可以依赖该报表查看成本明细。

### 预付额度的使用是否存在任何限制？ {#are-there-any-restrictions-around-the-usage-of-prepaid-credits}

ClickHouse Cloud 的预付额度（无论是通过 ClickHouse 直接购买，还是通过云服务商市场购买） 只能在合同约定的期限内使用。 这意味着它们可以自生效日或之后的日期开始使用，但不能用于此前的任何期间。 任何超出预付额度的部分，必须通过信用卡支付或云市场的月度计费来结算。

### ClickHouse Cloud 的定价在通过云服务商市场支付与直接向 ClickHouse 支付之间是否存在差异？ {#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse}


通过市场计费和直接注册 ClickHouse 在定价上没有区别。
无论哪种情况,您对 ClickHouse Cloud 的使用都以 ClickHouse Cloud Credits (CHCs) 进行跟踪,
计量方式相同并据此计费。

### 计算-计算分离如何计费? {#how-is-compute-compute-separation-billed}

在现有服务之外创建服务时,
您可以选择新服务是否应与现有服务共享相同的数据。
如果是,这两个服务现在将形成一个 [warehouse](/cloud/reference/warehouses)。
一个 warehouse 中存储着数据,多个计算服务可以访问这些数据。

由于数据仅存储一次,您只需为一份数据副本付费,尽管有多个服务在访问它。
您照常为计算付费——计算-计算分离 / warehouse 不收取额外费用。
通过在此部署中利用共享存储,用户可以在存储和备份方面节省成本。

在某些情况下,计算-计算分离可以为您节省大量 ClickHouse Credits。
以下设置是一个很好的例子:

1. 您有全天候运行的 ETL 作业,将数据摄取到服务中。这些 ETL 作业不需要大量内存,因此可以在小型实例上运行,例如具有 32 GiB RAM 的实例。

2. 同一团队中的数据科学家有临时报告需求,表示他们需要运行一个需要大量内存的查询 - 236 GiB,但不需要高可用性,如果首次运行失败可以等待并重新运行查询。

在此示例中,作为数据库管理员,您可以执行以下操作:

1. 创建一个小型服务,包含两个副本,每个 16 GiB - 这将满足 ETL 作业并提供高可用性。

2. 对于数据科学家,您可以在同一 warehouse 中创建第二个服务,仅包含一个 236 GiB 的副本。您可以为此服务启用空闲功能,这样当数据科学家不使用时,您无需为此服务付费。

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

如果没有 warehouse,您将不得不为数据科学家查询所需的内存量付费。
然而,在 warehouse 中组合两个服务并将其中一个设置为空闲状态可以帮助您节省资金。


## ClickPipes 定价 {#clickpipes-pricing}

有关 ClickPipes 计费信息,请参阅["ClickPipes 计费"部分](/cloud/reference/billing/clickpipes)。
