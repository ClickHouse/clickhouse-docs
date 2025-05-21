---
'title': '迁移至新计划'
'slug': '/cloud/manage/jan-2025-faq/plan-migrations'
'keywords':
- 'migration'
- 'new tiers'
- 'pricing'
- 'cost'
- 'estimation'
'description': '迁移至新计划、层级、定价，如何做决策和估算成本'
---



## 选择新计划 {#choosing-new-plans}

### 新组织可以在旧（遗留）计划上启动服务吗？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

不，创建的新组织在公告后将无法访问旧计划。

### 用户可以自助迁移到新的定价计划吗？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

可以，以下是自助迁移的指导：

| 当前计划   | 新计划                  | 自助迁移                                                                                                                             |
|------------|-------------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| 开发       | 基础                    | 如果组织内的所有服务均为开发，则支持                                                                                                 |
| 开发       | 扩展（2 个副本及以上）  | :white_check_mark:                                                                                                                         |
| 开发       | 企业（2 个副本及以上）  | :white_check_mark:                                                                                                                         |
| 生产       | 扩展（3 个副本及以上）  | :white_check_mark:                                                                                                                         |
| 生产       | 企业（3 个副本及以上）  | :white_check_mark:                                                                                                                         |
| 专用       | 联系 [支持](https://clickhouse.com/support/program) |

### 在试用期间，使用开发和生产服务的用户的体验如何？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

用户可以在试用期间升级，并继续使用试用积分评估新服务层及其支持的功能。但是，如果他们选择继续使用相同的开发和生产服务，他们可以这样做并升级到 PAYG。他们仍然必须在 2025 年 7 月 23 日之前迁移。

### 用户可以升级他们的层级吗，即基础 → 扩展，扩展 → 企业，等等？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

可以，用户可以自助升级，定价将在升级后反映层级选择。

### 用户可以从较高成本层级降级到较低成本层级吗，例如，企业 → 扩展，扩展 → 基础，企业 → 基础自助？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

不，我们不允许降级层级。

### 只有开发服务的用户可以迁移到基础层吗？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

可以，这将被允许。用户将根据他们过去的使用情况获得推荐，可以选择基础 `1x8GiB` 或 `1x12GiB`。

### 在同一组织中，既有开发服务又有生产服务的用户可以迁移到基础层吗？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

不，如果用户在同一组织中同时拥有开发和生产服务，他们只能自助迁移到扩展或企业层。如果他们想迁移到基础层，则应删除所有现有的生产服务。

### 新层级是否与扩展行为有关的任何变化？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

我们推出了一种新的垂直扩展机制用于计算副本，我们称之为“先创建后删除”（MBB）。这种方法在移除旧副本之前添加一个或多个新大小的副本，从而在扩展操作期间防止任何容量丢失。通过消除移除现有副本与添加新副本之间的间隔，MBB 创建了一个更无缝且干扰更小的扩展过程。它在扩展场景中特别有利，其中高资源利用率触发了对额外容量的需求，因为过早删除副本只会加剧资源限制。

请注意，作为此更改的部分，历史系统表数据将在扩展事件中保留最长 30 天。此外，2024 年 12 月 19 日之前的服务在 AWS 或 GCP 上的系统表数据，以及 2025 年 1 月 14 日之前的服务在 Azure 上的系统表数据，将不会保留作为迁移到新组织层的部分。

## 估算成本 {#estimating-costs}

### 在迁移过程中，如何指导用户了解最适合其需求的层级？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

如果您拥有服务，控制台会提示您基于历史使用情况的推荐选项。新用户可以详细查看列出的功能和特性，并决定最适合其需求的层级。

### 用户如何在新定价中评估“仓库”的成本？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

请参考 [定价](https://clickhouse.com/pricing) 页上的定价计算器，该计算器将根据您的工作负载大小和层级选择帮助估算成本。

## 进行迁移 {#undertaking-the-migration}

### 进行迁移的服务版本先决条件是什么？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

您的服务必须在版本 24.8 或更高版本，并且已经迁移到 SharedMergeTree。

### 当前开发和生产服务的用户的迁移体验如何？用户需要计划维护窗口以便服务不可用吗？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

将开发和生产服务迁移到新定价层可能会触发服务器重启。要迁移专用服务，请联系 [支持](https://clickhouse.com/support/program)。

### 用户在迁移后应采取哪些其他措施？ {#what-other-actions-should-a-user-take-after-the-migration}

API 访问模式将有所不同。

使用我们 OpenAPI 创建新服务的用户需要在服务创建的 `POST` 请求中删除 `tier` 字段。

由于我们不再有服务层，`tier` 字段已从服务对象中删除。  
这将影响通过 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此，任何使用这些 API 的代码可能需要进行调整以处理这些更改。

每个服务创建的副本数量对于扩展和企业层默认是 3，而对于基础层默认是 1。对于扩展和企业层，可以通过在服务创建请求中传递 `numReplicas` 字段进行调整。  
`numReplicas` 字段的值必须介于 2 和 20 之间，适用于仓库中的第一个服务。在现有仓库中创建的服务可以有最低为 1 的副本数量。

### 如果使用现有的 Terraform 提供程序进行自动化，用户应该进行哪些更改？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

一旦组织迁移到新计划之一，用户将需要使用我们版本为 2.0.0 或更高版本的 Terraform 提供程序。

新的 Terraform 提供程序是处理服务的 `tier` 属性变化所必需的。

在迁移之后，不再接受 `tier` 字段，应删除对其的引用。

用户还可以将 `num_replicas` 字段指定为服务资源的属性。

每个服务创建的副本数量对于扩展和企业层默认是 3，而对于基础层默认是 1。对于扩展和企业层，可以通过在服务创建请求中传递 `numReplicas` 字段进行调整。  
`num_replicas` 字段的值必须介于 2 和 20 之间，适用于仓库中的第一个服务。在现有仓库中创建的服务可以有最低为 1 的副本数量。

### 用户是否需要对数据库访问进行任何更改？ {#will-users-have-to-make-any-changes-to-the-database-access}

不，数据库用户名/密码将与之前相同。

### 用户是否需要重新配置私有网络功能？ {#will-users-have-to-reconfigure-private-networking-features}

不，用户在将其生产服务迁移到扩展或企业后，可以使用现有的私有网络（私有连接、PSC 等）配置。
