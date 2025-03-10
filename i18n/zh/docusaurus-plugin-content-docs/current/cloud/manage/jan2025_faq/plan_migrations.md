---
title: '迁移到新计划'
slug: /cloud/manage/jan-2025-faq/plan-migrations
keywords: ['迁移', '新层级', '定价', '成本', '估算']
description: '迁移到新计划、层级、定价，如何决定和估算成本'
---

## 选择新计划 {#choosing-new-plans}

### 新成立的组织可以在旧（遗留）计划上启动服务吗？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

不可以，新创建的组织在公告后将无法访问旧计划。

### 用户可以自行迁移到新的定价计划吗？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

可以，以下是自行迁移的指导：

| 当前计划     | 新计划                     | 自助迁移                                                                                             |
|--------------|----------------------------|-----------------------------------------------------------------------------------------------------|
| 开发         | 基础                       | 如果组织中的所有服务都支持开发，则支持迁移                                                           |
| 开发         | 扩展（2 个副本及以上）     | :white_check_mark:                                                                                   |
| 开发         | 企业（2 个副本及以上）     | :white_check_mark:                                                                                   |
| 生产         | 扩展（3 个副本及以上）     | :white_check_mark:                                                                                   |
| 生产         | 企业（3 个副本及以上）     | :white_check_mark:                                                                                   |
| 专用         | 联系 [support](https://clickhouse.com/support/program) |

### 在试用开发和生产服务期间，用户的体验将如何？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

用户可以在试用期间进行升级，并继续使用试用积分评估新的服务层级及其支持的功能。然而，如果他们选择继续使用相同的开发和生产服务，他们可以继续使用并升级到按需付费（PAYG）。他们仍然需要在 2025 年 7 月 23 日之前进行迁移。

### 用户可以升级他们的层级吗，例如 基础 → 扩展，扩展 → 企业 等？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

可以，用户可以自助升级，定价将在升级后反映所选层级。

### 用户可以从更高的层级迁移到更低成本的层级吗，例如 企业 → 扩展，扩展 → 基础，企业 → 基础 自助？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

不可以，我们不允许降级层级。

### 只有开发服务的用户可以迁移到基础层级吗？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

可以，这将被允许。用户将根据他们过去的使用情况获得推荐，可以选择基础 `1x8GiB` 或 `1x12GiB`。

### 同一组织中拥有开发和生产服务的用户可以迁移到基础层级吗？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

不可以，如果用户在同一组织中同时拥有开发和生产服务，他们只能自助迁移到扩展或企业层级。如果他们想迁移到基础层级，他们应删除所有现有的生产服务。

### 在新的层级中关于扩展行为有什么变化吗？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

我们引入了一种新的垂直扩展机制，称为“先建立后拆除”（Make Before Break，MBB）。这种方法会在移除旧副本之前添加一个或多个新的大小的副本，防止在扩展操作过程中任何容量的损失。通过消除移除现有副本和添加新副本之间的间隙，MBB创造了一个更无缝和不那么干扰的扩展过程。它在需要额外容量的扩展场景中特别有利，因为过早删除副本只会加剧资源约束。

请注意，作为此更改的一部分，历史系统表数据将在扩展事件中最多保留 30 天。此外，对于 AWS 或 GCP 上的服务，2024 年 12 月 19 日之前的任何系统表数据将不会保留，Azure 上的服务则为 2025 年 1 月 14 日之前的数据将不会保留，作为迁移到新的组织层级的一部分。

## 估算成本 {#estimating-costs}

### 在迁移过程中，用户将如何被指导，了解哪个层级最适合他们的需求？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

如果您有服务，控制台会根据历史使用情况提示您每个服务的推荐选项。新用户可以详细查看列出的能力和功能，并决定哪个层级最适合他们的需求。

### 用户如何在新定价中确定和估算“仓库”的成本？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

请参考 [Pricing](https://clickhouse.com/pricing) 页面上的定价计算器，这将帮助估算基于您的工作负载大小和层级选择的成本。

## 进行迁移 {#undertaking-the-migration}

### 进行迁移的服务版本先决条件是什么？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

您的服务必须是 24.8 版本或更高，并已迁移到 SharedMergeTree。

### 当前开发和生产服务的用户的迁移体验如何？用户需要规划服务不可用的维护窗口吗？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

将开发和生产服务迁移到新的定价层级可能会触发服务器重启。要迁移专用服务，请联系 [support](https://clickhouse.com/support/program)。

### 用户在迁移后应采取哪些其他措施？ {#what-other-actions-should-a-user-take-after-the-migration}

API 访问模式将会有所不同。

使用我们的 OpenAPI 创建新服务的用户将被要求在服务创建 `POST` 请求中移除 `tier` 字段。

由于我们不再有服务层级，`tier` 字段已从服务对象中删除。  
这将影响 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此，任何使用这些 API 的代码可能需要进行调整以处理这些更改。

每个服务创建时，副本的数量默认为扩展和企业层级的 3，而基础层级的默认为 1。  
对于扩展和企业层级，可以通过在服务创建请求中传递 `numReplicas` 字段来进行调整。  
`numReplicas` 字段的值必须在 2 到 20 之间，对于一个仓库中的第一个服务。  
在现有仓库中创建的服务可以至少拥有 1 个副本。

### 如果使用现有的 Terraform 提供程序进行自动化，用户应该进行哪些更改？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

一旦组织迁移到其中一个新计划，用户将需要使用我们的 Terraform 提供程序版本 2.0.0 或更高版本。

新的 Terraform 提供程序是为了处理服务的 `tier` 属性的更改。

迁移后，不再接受 `tier` 字段，应删除对其的引用。

用户还可以将 `num_replicas` 字段指定为服务资源的一个属性。

每个服务创建时，副本的数量默认为扩展和企业层级的 3，而基础层级的默认为 1。  
对于扩展和企业层级，可以通过在服务创建请求中传递 `numReplicas` 字段来进行调整。  
`num_replicas` 字段的值必须在 2 到 20 之间，对于一个仓库中的第一个服务。  
在现有仓库中创建的服务可以至少拥有 1 个副本。

### 用户需要对数据库访问进行任何更改吗？ {#will-users-have-to-make-any-changes-to-the-database-access}

不需要，数据库用户名/密码的工作方式与之前相同。

### 用户需要重新配置私有网络功能吗？ {#will-users-have-to-reconfigure-private-networking-features}

不需要，用户在将生产服务迁移到扩展或企业后，可以使用其现有的私有网络（私有链接、PSC 等）配置。
