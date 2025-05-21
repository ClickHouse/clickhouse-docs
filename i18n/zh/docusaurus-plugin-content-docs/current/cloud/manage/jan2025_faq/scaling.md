---
'title': 'Scaling'
'slug': '/cloud/manage/jan-2025-faq/scaling'
'keywords':
- 'new pricing'
- 'faq'
- 'scaling'
'description': 'Scaling behavior in new pricing tiers'
---



ClickHouse Cloud 允许在两个方向上进行扩展 - 垂直（增加副本大小）和水平（添加更多副本）。

## 每一层将提供哪些扩展选项？ {#what-scaling-options-will-be-available-for-each-tier}

每一层的扩展行为如下：

* **基本**: 基本层仅支持单副本服务。这些服务旨在固定大小，不允许进行垂直或水平扩展。用户可以升级到 Scale 或 Enterprise 层以扩展他们的服务。
* **Scale**: Scale 层支持单副本和多副本服务。多副本服务将允许扩展。
    * 服务可以在扩展到多副本设置后，垂直扩展到 CSP/区域支持的最大副本大小；仅 2 个以上副本可以进行垂直扩展。
    * 将提供手动水平扩展。
* **Enterprise**: Enterprise 层支持单副本和多副本服务，将允许多副本服务进行扩展
    * 服务可以垂直扩展到 CSP/区域支持的最大副本大小。
        * 标准配置（1:4 CPU 对内存比例）将支持垂直自动扩展。
        * 自定义配置（`highMemory` 和 `highCPU`）可以通过支持票据进行垂直扩展。
    * 将提供手动水平扩展。

:::note
服务的水平扩展最多支持 20 个副本。如果需要额外的副本，请联系支持团队。
:::

## 用户可以在他们的服务中扩展吗？ {#can-users-scale-in-their-service}

扩展仅限于 2 个以上的副本。一旦扩展到更大的规模，用户将不被允许缩减到单个副本，因为这可能会导致不稳定和潜在的数据丢失。

## 新层级的扩展行为是否有变化？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

我们正在引入一种新垂直扩展机制，称为“先创建后拆除”（Make Before Break，MBB）。这种方法在移除旧副本之前添加新的更大副本，防止在扩展操作期间损失任何容量。通过消除移除现有副本和添加新副本之间的间隙，MBB 使扩展过程更加无缝且干扰更小。这在扩展场景中特别有利，其中高资源利用率触发了额外容量的需求，因为过早移除副本只会加剧资源限制。

请注意，作为此更改的一部分，在扩展事件中，历史系统表的数据将保留最长 30 天。此外，任何在 AWS 或 GCP 上的服务中超过 2024 年 12 月 19 日的系统表数据，以及在 Azure 上的服务中超过 2025 年 1 月 14 日的系统表数据，将不会在迁移到新组织层期间保留。
