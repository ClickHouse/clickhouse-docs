---
'title': '迁移到新计划'
'slug': '/cloud/manage/jan-2025-faq/plan-migrations'
'keywords':
- 'migration'
- 'new tiers'
- 'pricing'
- 'cost'
- 'estimation'
'description': '迁移到新计划、层级、定价，如何决策和估算成本'
---

## 选择新计划 {#choosing-new-plans}

### 新组织可以在旧的（遗留）计划上启动服务吗？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

不可以，新创建的组织在公告后将无法访问旧计划。

### 用户可以自助迁移到新的定价计划吗？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

可以，以下是有关自助迁移的指导：

| 当前计划      | 新计划                   | 自助迁移                                                                                                                                                |
|---------------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| 开发          | 基础                     | 如果组织中所有服务都支持开发，则支持迁移                                                                                                                  |
| 开发          | 扩展（2个副本+）         | :white_check_mark:                                                                                                                                         |
| 开发          | 企业（2个副本+）         | :white_check_mark:                                                                                                                                          |
| 生产          | 扩展（3个副本+）         | :white_check_mark:                                                                                                                                          |
| 生产          | 企业（3个副本+）         | :white_check_mark:                                                                                                                                           |
| 专用          | 联系 [支持](https://clickhouse.com/support/program) |

### 在试用运行开发和生产服务的用户的体验将会如何？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

用户可以在试用期间升级，并继续使用试用积分来评估新的服务层级及其支持的功能。不过，如果他们选择继续使用相同的开发和生产服务，可以继续使用并升级到按需付费。但他们仍然需要在2025年7月23日之前完成迁移。

### 用户可以升级其层级吗，即基础 → 扩展，扩展 → 企业等？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

可以，用户可以自助升级，升级后定价将反映所选层级。

### 用户可以从较高的成本层级迁移到较低的层级吗，例如，企业 → 扩展，扩展 → 基础，企业 → 基础自助？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

不可以，我们不允许降级层级。

### 组织中仅有开发服务的用户可以迁移到基础层级吗？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

可以，这将被允许。根据他们过往的使用情况，将向用户提供建议，他们可以选择基础 `1x8GiB` 或 `1x12GiB`。

### 在同一组织中拥有开发和生产服务的用户可以迁移到基础层级吗？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

不可以，如果用户在同一组织中同时拥有开发和生产服务，他们只能自助迁移到扩展或企业层级。如果想迁移到基础层级，必须删除所有现有的生产服务。

### 新层级与扩展行为有关的任何变化吗？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

我们正在为计算副本引入一种新的垂直扩展机制，称为“先建立后移除”（MBB）。这种方法在移除旧副本之前添加一个或多个新大小的副本，从而防止在扩展操作期间丢失任何容量。通过消除删除现有副本和添加新副本之间的间隙，MBB 创建了一个更无缝且扰动较小的扩展过程。这在扩展场景中尤为有利，在此情况下，高资源利用率会触发额外容量的需求，因为过早移除副本只会加剧资源限制。

请注意，作为此更改的一部分，历史系统表数据将保留最多30天，作为扩展事件的一部分。此外，2024年12月19日之前的AWS或GCP服务的系统表数据，以及2025年1月14日之前的Azure服务的系统表数据，将不会作为迁移到新组织层级的一部分被保留。

## 估算成本 {#estimating-costs}

### 用户在迁移过程中将如何获得指导，了解哪个层级最适合他们的需求？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

如果您有服务，控制台将根据历史使用情况提示每个服务的推荐选项。新用户可以详细查看列出的能力和功能，并决定最适合其需求的层级。

### 用户如何确定和估算新定价中“数据仓库”的成本？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

请参考 [定价](https://clickhouse.com/pricing) 页面上的定价计算器，它将帮助根据工作负载的大小和层级选择来估算成本。

## 进行迁移 {#undertaking-the-migration}

### 进行迁移的服务版本前提条件是什么？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

您的服务必须在版本24.8或更高版本，并已迁移到SharedMergeTree。

### 当前开发和生产服务的用户的迁移体验是什么？用户是否需要计划维护窗口，使服务不可用？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

将开发和生产服务迁移到新的定价层级可能会触发服务器重启。要迁移专用服务，请联系 [支持](https://clickhouse.com/support/program)。

### 用户在迁移后应采取什么其他措施？ {#what-other-actions-should-a-user-take-after-the-migration}

API 访问模式将有所不同。

使用我们的OpenAPI创建新服务的用户必须在服务创建 `POST` 请求中删除 `tier` 字段。

由于我们不再有服务层级，`tier` 字段已从服务对象中移除。  
这将影响 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此，任何使用这些API的代码可能需要进行调整以处理这些更改。

每个服务创建时默认的副本数对于扩展和企业层级为3，而对于基础层级为1。对于扩展和企业层级，可以通过在服务创建请求中传递 `numReplicas` 字段进行调整。  
`numReplicas` 字段的值必须在一个仓库中的第一个服务为2到20之间。创建在现有仓库中的服务可以有至少1个副本。

### 如果用户使用现有的Terraform提供者进行自动化，应该进行哪些更改？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

一旦一个组织迁移到新的计划之一，用户将需要使用我们的Terraform提供者版本2.0.0或更高版本。

新的Terraform提供者是必需的，以处理服务的 `tier` 属性中的更改。

迁移后，`tier` 字段不再被接受，应该删除对此的引用。

用户还可以将 `num_replicas` 字段作为服务资源的属性进行指定。

每个服务创建时默认的副本数对于扩展和企业层级为3，而对于基础层级为1。对于扩展和企业层级，可以通过在服务创建请求中传递 `numReplicas` 字段进行调整。  
`num_replicas` 字段的值必须在一个仓库中的第一个服务为2到20之间。创建在现有仓库中的服务可以有至少1个副本。

### 用户是否需要对数据库访问进行任何更改？ {#will-users-have-to-make-any-changes-to-the-database-access}

不需要，数据库用户名/密码将与之前一样工作。

### 用户是否需要重新配置私有网络功能？ {#will-users-have-to-reconfigure-private-networking-features}

不需要，用户可以在将其生产服务迁移到扩展或企业后，使用现有的私有网络（Private Link、PSC等）配置。
