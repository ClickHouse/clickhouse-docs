---
sidebar_label: '概览'
slug: /cloud/manage/billing/overview
title: '定价'
description: 'ClickHouse Cloud 定价概览页面'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'pricing', 'billing', 'cloud costs', 'compute pricing']
---

有关定价信息，请参阅 [ClickHouse Cloud 定价](https://clickhouse.com/pricing#pricing-calculator) 页面。
ClickHouse Cloud 会根据计算、存储、[数据传输](/cloud/manage/network-data-transfer)（通过互联网和跨区域的出口流量）以及 [ClickPipes](/integrations/clickpipes) 的使用情况进行计费。
若要了解哪些因素会影响您的账单，以及如何管理您的支出，请继续阅读。

## Amazon Web Services (AWS) 示例 \\{#amazon-web-services-aws-example\\}

:::note
- 价格基于 AWS us-east-1 区域的收费标准。
- 在[此处](/cloud/manage/network-data-transfer)查看适用的数据传输和 ClickPipes 收费。
:::

### 基础版：每月起价 \$66.52 \\{#basic-from-6652-per-month\\}

最适合：数据量较小、无严格可靠性保证的部门级使用场景。

**Basic 等级服务**

- 1 个副本 x 8 GiB 内存，2 vCPU
- 500 GB 压缩数据
- 500 GB 数据备份
- 10 GB 公网出口数据传输
- 5 GB 跨区域数据传输

本示例的费用明细：

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
    <td>公网出口数据传输</td>
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
    <td>合计</td>
    <td>\$66.52</td>
    <td>\$106.44</td>
    <td>\$186.27</td>
  </tr>
</tbody>
</table>

### Scale（常驻、自动伸缩）：每月起价 \$499.38 \\{#scale-always-on-auto-scaling-from-49938-per-month\\}

最适合：需要强化 SLA（2 个及以上副本服务）、具备可伸缩性和高级安全性的工作负载。

**Scale 等级服务**

- 工作负载约 100% 时间处于活跃状态
- 可配置自动伸缩上限以防止费用失控
- 100 GB 公网出口数据传输
- 10 GB 跨区域数据传输

本示例的费用明细：

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
    <td>2 个副本 x 8 GiB 内存，2 vCPU<br></br>\$436.95</td>
    <td>2 个副本 x 16 GiB 内存，4 vCPU<br></br>\$873.89</td>
    <td>3 个副本 x 16 GiB 内存，4 vCPU<br></br>\$1,310.84</td>
  </tr>
  <tr>
    <td>存储</td>
    <td>1 TB 数据 + 1 份备份<br></br>\$50.60</td>
    <td>2 TB 数据 + 1 份备份<br></br>\$101.20</td>
    <td>3 TB 数据 + 1 份备份<br></br>\$151.80</td>
  </tr>
  <tr>
    <td>公网出口数据传输</td>
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
    <td>合计</td>
    <td>\$499.38</td>
    <td>\$986.92</td>
    <td>\$1,474.47</td>
  </tr>
</tbody>
</table>

### 企业版：起始价格因情况而异 \\{#enterprise-starting-prices-vary\\}

最适用于：大规模、关键任务型部署，且对安全性和合规性有严格要求的场景

**企业级服务**

- 工作负载在约 100% 的时间内处于活跃状态
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
    <td>计算资源</td>
    <td>2 个副本 × 32 GiB RAM，8 vCPU<br></br>\$2,285.60</td>
    <td>2 个副本 × 64 GiB RAM，16 vCPU<br></br>\$4,571.19</td>
    <td>2 个副本 × 120 GiB RAM，30 vCPU<br></br>\$8,570.99</td>
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

## 常见问题 \\{#faqs\\}

### 什么是 ClickHouse Credit（CHC）？ \\{#what-is-chc\\}

ClickHouse Credit 是针对客户使用 ClickHouse Cloud 的一单位额度，等同于一（1）美元，并按 ClickHouse 届时发布的有效价目表进行折算。

:::note
如果您通过 Stripe 支付账单，那么在您的 Stripe 发票上会看到 1 CHC 等于 0.01 美元。这是为了在 Stripe 上实现精确计费，因为 Stripe 无法针对我们标准 SKU（1 CHC = 1 美元）按非整数数量进行计费。
:::

### 在哪里可以找到旧版定价信息？ \\{#find-legacy-pricing\\}

旧版定价信息可以在[这里](https://clickhouse.com/pricing?legacy=true)找到。

### 计算资源是如何计量的？ \\{#how-is-compute-metered\\}

ClickHouse Cloud 以每分钟为单位计量计算资源，粒度为每 8GB 内存。 
计算费用会根据服务等级、区域和云服务提供商而变化。

### 磁盘存储是如何计算的？ \\{#how-is-storage-on-disk-calculated\\}

ClickHouse Cloud 使用云对象存储，并根据存储在 ClickHouse 表中的数据压缩后大小来计量用量。
存储费用在各服务等级之间相同，但会根据区域和云服务提供商而变化。 

### 备份是否计入总存储？ \\{#do-backups-count-toward-total-storage\\}

存储和备份都会计入存储费用，并单独计费。
所有服务默认保留一个备份，保留时间为一天。
需要额外备份的用户可以在 Cloud 控制台的“设置”标签页中配置额外的[备份](/cloud/manage/backups/overview)。

### 我该如何估算压缩比？ \{#how-do-i-estimate-compression\}

压缩率会因数据集而异。
压缩率变化的程度取决于数据本身的可压缩性（高基数字段和低基数字段的数量），
以及用户如何设计 schema（例如是否使用可选的 codec）。
对于常见的分析型数据，压缩率通常可达到约 10 倍，但也可能显著低于或高于该数值。
请参考[优化文档](/optimize/asynchronous-inserts)获取指导，并参阅这篇 [Uber 博客](https://www.uber.com/blog/logging/)了解一个详细的日志记录用例示例。
唯一能够准确得知的方法，是将您的数据集摄取到 ClickHouse 中，并比较原始数据集大小与存储在 ClickHouse 中的数据大小。

您可以使用如下查询：

```sql title="Estimating compression"
SELECT formatReadableSize(total_bytes) 
FROM system.tables 
WHERE name = <your table name>
```


### 如果我有自管理部署，ClickHouse 提供哪些工具来预估在云端运行服务的成本？ \\{#what-tools-does-clickhouse-offer-to-estimate-the-cost-of-running-a-service-in-the-cloud-if-i-have-a-self-managed-deployment\\}

ClickHouse 查询日志会记录[关键指标](/operations/system-tables/query_log)，可用于估算在 ClickHouse Cloud 中运行工作负载的成本。
关于从自管理环境迁移到 ClickHouse Cloud 的详细信息，请参阅[迁移文档](/cloud/migration/clickhouse-to-cloud)，如有进一步问题，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support)。

### ClickHouse Cloud 提供哪些计费选项？ \\{#what-billing-options-are-available-for-clickhouse-cloud\\}

ClickHouse Cloud 支持以下计费选项：

- 自助月度计费（以美元计价，通过信用卡支付）。
- 直销年度 / 多年期（通过预付 "ClickHouse Credits"，以美元计价，并可使用其他付款方式）。
- 通过 AWS、GCP 和 Azure 市场（按需付费（PAYG），或通过市场与 ClickHouse Cloud 签订合约）。

:::note
用于 PAYG 的 ClickHouse Cloud credits 按每 \$0.01 为单位开具发票，使我们能够根据客户的实际使用量按部分 ClickHouse credits 计费。这不同于承诺支出型 ClickHouse credits，后者需以每 \$1 为单位预付购买。
:::

### 我可以删除我的信用卡吗？ \\{#can-i-delete-my-credit-card\\}

您无法在计费 UI 中移除信用卡，但可以随时更新。这有助于确保您的组织始终具有有效的付款方式。如果您需要移除信用卡，请联系 [ClickHouse Cloud 支持](https://console.clickhouse.cloud/support) 获取帮助。

### 计费周期有多长？ \\{#how-long-is-the-billing-cycle\\}

计费采用月度周期，开始日期为创建 ClickHouse Cloud 组织的日期。

### 如果我已经有一个有效的按需付费（PAYG）云市场订阅，然后又签署了承诺合同，我的承诺额度会先被消耗吗？ \\{#committed-credits-consumed-first-with-active-payg-subscription\\}

会。用量将按以下付款方式的顺序进行结算：
- 承诺（预付）额度
- 云市场订阅（PAYG）
- 信用卡

### ClickHouse Cloud 为 Scale 和 Enterprise 服务提供了哪些成本管理控制？ \\{#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-scale-and-enterprise-services\\}

- Trial 和 Annual Commit 客户在其消耗量达到特定阈值时会自动收到电子邮件通知：`50%`、`75%` 和 `90%`。这使你能够主动管理用量。
- ClickHouse Cloud 允许用户通过 [Advanced scaling control](/manage/scaling) 为计算资源设置最大自动扩缩容上限，而计算资源是分析型工作负载中的主要成本因素。
- [Advanced scaling control](/manage/scaling) 允许你设置内存上限，并可选择控制在空闲期间是否暂停/闲置。

### ClickHouse Cloud 为 Basic 服务提供了哪些成本管理控制？ \\{#what-controls-does-clickhouse-cloud-offer-to-manage-costs-for-basic-services\\}

- [Advanced scaling control](/manage/scaling) 允许你控制在空闲期间的暂停/闲置行为。Basic 服务不支持调整内存分配。
- 请注意，默认设置会在一段时间无活动后暂停服务。

### 如果我有多个服务，我会按服务分别收到发票，还是会收到一张合并发票？ \\{#if-i-have-multiple-services-do-i-get-an-invoice-per-service-or-a-consolidated-invoice\\}

在给定的计费周期内，会为某个组织下的所有服务生成一张合并发票。

### 如果我在试用期和试用额度到期之前添加信用卡并完成升级，我会被收费吗？ \\{#if-i-add-my-credit-card-and-upgrade-before-my-trial-period-and-credits-expire-will-i-be-charged\\}

当用户在 30 天试用期结束前从试用转为付费，但仍有剩余试用额度时，
我们会在最初的 30 天试用期内继续从试用额度中扣减，之后才开始向信用卡收费。

### 我如何跟踪自己的支出？ \\{#how-can-i-keep-track-of-my-spending\\}

ClickHouse Cloud 控制台提供 “Usage” 用量视图，用于按服务详细展示使用情况。该按用量维度组织的明细有助于你了解每个计量单元对应的成本。

### 我如何获取自己订阅 ClickHouse Cloud 服务的发票？ \\{#how-do-i-access-my-invoice-for-my-subscription-to-the-clickhouse-cloud-service\\}

对于使用信用卡的直接订阅：

要查看发票，请在 ClickHouse Cloud UI 左侧导航栏中选择你的组织，然后进入 “Billing”。你的所有发票都会列在 “Invoices” 部分下。

对于通过云市场的订阅：

所有云市场订阅的计费和开票均由相应云市场完成。你可以直接通过对应云服务商的云市场查看发票。

### 为什么 Usage 对账单上的日期与我的云市场发票不匹配？ \\{#why-do-the-dates-on-the-usage-statements-not-match-my-marketplace-invoice\\}

AWS Marketplace 计费遵循日历月周期。
例如，对于 2024-12-01 至 2025-01-01 之间的用量，
会在 2025-01-03 至 2025-01-05 之间生成发票。

ClickHouse Cloud 用量对账单遵循不同的计费周期，其用量自注册之日起按 30 天为周期进行计量和报告。

如果这两个日期不一致，用量和发票日期就会不同。由于用量对账单会按服务逐日跟踪使用情况，用户可以依靠这些对账单查看成本明细拆分。

### 预付额度的使用是否有任何限制？ \\{#are-there-any-restrictions-around-the-usage-of-prepaid-credits\\}

ClickHouse Cloud 预付额度（无论是直接通过 ClickHouse 购买，还是通过云服务商的云市场获得）
只能在合同约定的期限内使用。
这意味着它们可以在合同生效日或未来日期使用，但不能用于任何之前的计费周期。
任何预付额度未覆盖的超额部分必须通过信用卡支付或云市场的月度计费来结算。

### ClickHouse Cloud 的定价，在通过云服务商云市场付款与直接向 ClickHouse 支付之间是否有所不同？ \\{#is-there-a-difference-in-clickhouse-cloud-pricing-whether-paying-through-the-cloud-provider-marketplace-or-directly-to-clickhouse\\}

通过云市场计费和直接在 ClickHouse 注册之间，在定价上没有任何差异。
在这两种情况下，你对 ClickHouse Cloud 的使用量都会以 ClickHouse Cloud Credits（CHC）为单位进行计量，并据此计费。

通过 marketplace 计费和直接向 ClickHouse 注册在价格上没有差异。  
在这两种情况下，您对 ClickHouse Cloud 的使用量都会以 ClickHouse Cloud Credits (CHCs) 为单位进行计量和跟踪，  
计量方式相同，并据此计费。

### 计算-计算分离如何计费？ \\{#how-is-compute-compute-separation-billed\\}

在现有服务之外再创建一个服务时，  
您可以选择这个新服务是否与现有服务共享同一份数据。  
如果选择共享，这两个服务就形成一个[仓库](/cloud/reference/warehouses)。  
仓库中只存储一份数据，可供多个计算服务访问。

由于数据只存储一份，即使多个服务访问该数据，您也只需为这一份数据付费。  
计算费用按常规定价 —— 计算-计算分离 / 仓库本身不收取额外费用。  
通过在此部署中利用共享存储，用户可以在存储和备份两方面降低成本。

在某些情况下，计算-计算分离可以为您节省大量 ClickHouse Credits。  
下面是一个很好的示例：

1. 您有 24/7 运行的 ETL 作业，将数据摄取到服务中。这些 ETL 作业对内存需求不高，因此可以运行在较小的实例上，比如 32 GiB RAM。

2. 同一团队中的一位数据科学家有临时（ad hoc）报表需求，他表示需要运行一条查询，该查询需要大量内存 —— 236 GiB，但对高可用性没有要求，如果第一次运行失败，他可以等待并重新运行查询。

在这个示例中，您作为数据库管理员，可以执行以下操作：

1. 创建一个具有两个副本的小型服务，每个副本 16 GiB —— 这将满足 ETL 作业需求并提供高可用性。

2. 对于这位数据科学家，您可以在同一仓库中创建第二个服务，仅包含一个 236 GiB 的副本。您可以为该服务启用空闲（idling），这样当数据科学家未使用该服务时，您无需为其付费。

在 **Scale Tier** 上，此示例的（每月）成本估算如下：
- 父服务每天运行 24 小时：2 个副本 x 每个副本 16 GiB 4 vCPU
- 子服务：1 个副本 x 每个副本 236 GiB 59 vCPU
- 3 TB 压缩数据 + 1 份备份
- 100 GB 公网出口数据传输
- 50 GB 跨区域数据传输

<table class="nowrap-header"><thead>
  <tr>
    <th></th>
    <th><span>子服务</span><br/><span>每天运行 1 小时</span></th>
    <th><span>子服务</span><br/><span>每天运行 2 小时</span></th>
    <th><span>子服务</span><br/><span>每天运行 4 小时</span></th>
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
    <td>公网出口数据传输</td>
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

如果不使用仓库，您就必须为该数据科学家查询所需的全部内存付费。  
然而，将两个服务组合到同一仓库并让其中一个处于空闲状态，有助于您节省成本。

## ClickPipes 定价 \\{#clickpipes-pricing\\}

有关 ClickPipes 计费的更多信息，请参阅专门的[“ClickPipes 计费”章节](/cloud/reference/billing/clickpipes)。