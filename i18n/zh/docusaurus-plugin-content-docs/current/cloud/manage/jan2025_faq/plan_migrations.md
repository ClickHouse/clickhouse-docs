---
'title': '迁移到新计划'
'slug': '/cloud/manage/jan-2025-faq/plan-migrations'
'keywords':
- 'migration'
- 'new tiers'
- 'pricing'
- 'cost'
- 'estimation'
'description': '迁移到新计划、层级、定价，如何决定和估算成本'
---

## 选择新计划 {#choosing-new-plans}

### 新组织可以在旧的（遗留）计划上启动服务吗？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

不，创建的新组织在公告后将无法访问旧计划。

### 用户可以自行迁移到新的定价计划吗？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

是的，以下是关于自行迁移的指导：

| 当前计划   | 新计划                  | 自行迁移                                                                                                      |
|------------|-------------------------|----------------------------------------------------------------------------------------------------------------|
| Development | Basic                   | 如果组织中的所有服务支持 Development 则支持                                                                              |
| Development | Scale (2 replicas+)     | :white_check_mark:                                                                                                  |
| Development | Enterprise (2 replicas+) | :white_check_mark:                                                                                                  |
| Production  | Scale (3 replicas+)     | :white_check_mark:                                                                                                  |
| Production  | Enterprise (3 replicas+) | :white_check_mark:                                                                                                 |
| Dedicated   | 联系 [support](https://clickhouse.com/support/program) |

### 在试用运行 Development 和 Production 服务期间，用户的体验将是什么样的？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

用户可以在试用期间升级，并继续使用试用积分评估新的服务层级及其支持的功能。但是，如果他们选择继续使用相同的 Development 和 Production 服务，他们可以这样做并升级到 PAYG。仍需在 2025 年 7 月 23 日之前迁移。

### 用户可以升级他们的层级吗，即 Basic → Scale, Scale → Enterprise 等？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

是的，用户可以自行升级，定价将在升级后反映所选层级。

### 用户可以从较高的成本层级移动到较低的成本层级吗，例如 Enterprise → Scale, Scale → Basic, Enterprise → Basic 自行服务？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

不，我们不允许降级层级。

### 只有组织中的 Development 服务的用户可以迁移到 Basic 层级吗？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

是的，这是被允许的。用户将根据他们过去的使用情况获得推荐，并可以选择 Basic `1x8GiB` 或 `1x12GiB`。

### 在同一组织中有 Development 和 Production 服务的用户可以迁移到 Basic 层级吗？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

不，如果用户在同一组织中同时拥有 Development 和 Production 服务，他们只能自行迁移到 Scale 或 Enterprise 层级。如果他们想迁移到 Basic，必须删除所有现有的 Production 服务。

### 新层级在扩展行为方面有任何变化吗？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

我们引入了一种新的垂直扩展机制用于计算副本，我们称之为“先建后拆”（Make Before Break, MBB）。这种方法在移除旧副本之前添加一个或多个新大小的副本，防止在扩展操作期间任何容量损失。通过消除移除现有副本和添加新副本之间的间隙，MBB 使得扩展过程更加无缝且不具破坏性。它在规模扩展场景中特别有益，因为高资源利用率会触发对额外容量的需求，提早移除副本只会加剧资源限制。

请注意，作为此更改的一部分，历史系统表数据将在最多 30 天内保留，以支持扩展事件。此外，对于 AWS 或 GCP 上的服务，12 月 19 日 2024 年之前的任何系统表数据，将不会在迁移到新组织层级时保留，而对于 Azure 上的服务，这一日期为 2025 年 1 月 14 日。

## 估算成本 {#estimating-costs}

### 用户在迁移过程中如何获得指导，以了解最适合他们需求的层级？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

如果您有服务，控制台将根据历史使用情况提示您每个服务的推荐选项。新用户可以详细查看列出的能力和功能，并决定最适合他们需求的层级。

### 用户如何在新定价中估算“仓库”的大小和成本？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

请参考 [定价](https://clickhouse.com/pricing) 页上的定价计算器，它将帮助根据您的工作负载大小和层级选择估算成本。


## 进行迁移 {#undertaking-the-migration}

### 进行迁移的服务版本先决条件是什么？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

您的服务必须在 24.8 版本或更高版本，并已迁移到 SharedMergeTree。

### 当前的 Development 和 Production 服务的用户迁移体验是什么？用户是否需要计划服务不可用的维护窗口？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

Development 和 Production 服务迁移到新定价层级可能会触发服务器重启。要迁移 Dedicated 服务，请联系 [support](https://clickhouse.com/support/program)。

### 用户在迁移后应采取哪些其他行动？ {#what-other-actions-should-a-user-take-after-the-migration}

API 访问模式将有所不同。

使用我们 OpenAPI 创建新服务的用户将需要在服务创建的 `POST` 请求中删除 `tier` 字段。

由于我们不再有服务层级，因此 `tier` 字段已从服务对象中删除。  
这将影响由 `POST`、`GET` 和 `PATCH` 服务请求返回的对象。因此，任何使用这些 API 的代码可能需要调整以处理这些更改。

每个服务默认创建的副本数量对于 Scale 和 Enterprise 层级默认为 3，而 Basic 层级默认为 1。
对于 Scale 和 Enterprise 层级，您可以通过在服务创建请求中传递 `numReplicas` 字段来进行调整。
`numReplicas` 字段的值必须在 2 到 20 之间，适用于仓库中的第一个服务。创建在现有仓库中的服务可以将副本数低至 1。

### 如果使用现有的 Terraform 提供者进行自动化，用户应进行哪些更改？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

一旦组织迁移到新计划之一，用户将被要求使用我们 Terraform 提供者版本 2.0.0 或更高版本。

新的 Terraform 提供者是因为 `tier` 属性在服务中的变更所必需的。

迁移后，不再接受 `tier` 字段，应删除对其的引用。

用户还可以将 `num_replicas` 字段作为服务资源的属性进行指定。

每个服务默认创建的副本数量对于 Scale 和 Enterprise 层级默认为 3，而 Basic 层级默认为 1。
对于 Scale 和 Enterprise 层级，您可以通过在服务创建请求中传递 `numReplicas` 字段来进行调整。
`num_replicas` 字段的值必须在 2 到 20 之间，适用于仓库中的第一个服务。创建在现有仓库中的服务可以将副本数低至 1。

### 用户需要对数据库访问进行任何更改吗？ {#will-users-have-to-make-any-changes-to-the-database-access}

不，数据库用户名/密码的工作方式与以前相同。

### 用户需要重新配置私有网络功能吗？ {#will-users-have-to-reconfigure-private-networking-features}

不，用户在将其 Production 服务迁移到 Scale 或 Enterprise 后，可以使用现有的私有网络（Private Link、PSC 等）配置。
