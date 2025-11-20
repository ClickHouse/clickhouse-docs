---
slug: /faq/operations/production
title: '生产环境应使用哪个 ClickHouse 版本？'
toc_hidden: true
toc_priority: 10
description: '本页面就生产环境应使用哪个 ClickHouse 版本提供指导'
doc_type: 'guide'
keywords: ['production', 'deployment', 'versions', 'best practices', 'upgrade strategy']
---



# 生产环境应该使用哪个 ClickHouse 版本? {#which-clickhouse-version-to-use-in-production}

首先,让我们讨论一下为什么会有这个问题。主要有两个原因:

1.  ClickHouse 的开发迭代速度很快,通常每年会发布 10 个以上的稳定版本。这使得可选择的版本范围很广,做出选择并不容易。
2.  一些用户不想花时间研究哪个版本最适合自己的使用场景,而是希望直接参考他人的建议。

第二个原因更为根本,因此我们将从这个原因开始讨论,然后再回到如何选择合适的 ClickHouse 版本。


## 你们推荐使用哪个 ClickHouse 版本？{#which-clickhouse-version-do-you-recommend}

你可能很想聘请顾问或相信一些知名专家，以此来摆脱对生产环境的责任。你安装了别人推荐的某个特定 ClickHouse 版本；如果出了问题——那不是你的错，而是别人的。这种思路是一个很大的陷阱。没有任何外部人士会比你更了解你公司生产环境中实际发生的情况。

那么，应该如何正确选择要升级到的 ClickHouse 版本？或者，如何选择你的第一个 ClickHouse 版本？首先，你需要投入精力搭建一个**足够逼真的预生产环境**。在理想情况下，它可以是一个与生产完全一致的影子副本，但这通常成本很高。

下面是一些关键要点，可以在成本不太高的情况下，让预生产环境具备足够的真实度：

- 预生产环境需要运行一套尽可能贴近生产环境的查询：
  - 不要只放一份静态数据然后只读。
  - 不要只做写入、只做数据复制而不生成一些典型报表。
  - 不要每次都清空环境，而不去按流程执行模式（schema）变更。
- 使用真实生产环境中的部分数据和查询。尽量选择具有代表性且能让 `SELECT` 查询返回合理结果的数据样本。如果数据敏感且内部策略不允许其离开生产环境，可以对数据进行脱敏或混淆。
- 确保预生产环境同样纳入你的监控和告警系统，就像生产环境一样。
- 如果生产环境跨多个数据中心或地区，预生产环境也应尽量采用相同的部署拓扑。
- 如果生产环境使用了复制、分布式表、级联物化视图等复杂特性，务必在预生产环境中进行类似配置。
- 需要在以下两种方案之间做权衡：预生产环境使用与生产大致相同数量但规格更小的服务器或虚拟机，或者使用数量少得多但规格与生产相同的机器。前一种方式更有可能暴露额外的网络相关问题，而后一种方式更易于管理。

第二个需要投入的方向是**自动化测试基础设施**。不要以为某类查询曾经成功执行过一次，就会永远没问题。使用对 ClickHouse 进行 mock 的单元测试当然没问题，但同时要确保你的产品具备一套合理的自动化测试，这些测试要针对真实的 ClickHouse 运行，并验证所有重要用例仍然按预期工作。

更进一步，你可以将这些自动化测试贡献给 [ClickHouse 的开源测试基础设施](https://github.com/ClickHouse/ClickHouse/tree/master/tests)，这些测试在 ClickHouse 的日常开发中会被持续执行。学习[如何运行它](../../development/tests.md)，以及如何将你的测试适配到这一框架，确实需要额外的时间和精力，但这会带来回报：当某个 ClickHouse 版本宣布为稳定版时，它已经针对你的用例完成测试，而不是每次在事后报问题、再等待 bug 修复、回溯移植并发布。一些公司甚至把向所使用的基础设施贡献这类测试，作为内部政策（在 Google，这被称为 [Beyonce's Rule](https://www.oreilly.com/library/view/software-engineering-at/9781492082781/ch01.html#policies_that_scale_well)）。

当你已经具备预生产环境和测试基础设施之后，选择合适的版本就变得相对直观了：

1.  定期在新的 ClickHouse 版本上运行你的自动化测试。即使是标记为 `testing` 的 ClickHouse 版本也可以这样做，但不建议在这些版本上继续执行后续步骤。
2.  将通过测试的 ClickHouse 版本部署到预生产环境中，并检查所有流程是否按预期运行。
3.  将你发现的任何问题反馈到 [ClickHouse GitHub Issues](https://github.com/ClickHouse/ClickHouse/issues)。
4.  如果没有发现重大问题，就可以开始将该 ClickHouse 版本部署到生产环境中。投入精力构建渐进式发布自动化流程，实现类似[金丝雀发布](https://martinfowler.com/bliki/CanaryRelease.html)或[蓝绿部署](https://martinfowler.com/bliki/BlueGreenDeployment.html)的策略，可以进一步降低生产环境中出现问题的风险。

你可能已经注意到，上述方法本身并不特定于 ClickHouse——只要足够重视生产环境，人们都会对自己依赖的任何基础设施采取类似做法。


## 如何选择 ClickHouse 版本? {#how-to-choose-between-clickhouse-releases}

如果您查看 ClickHouse 软件包仓库的内容,会看到两种类型的软件包:

1.  `stable`(稳定版)
2.  `lts`(长期支持版)

以下是关于如何选择的一些指导:

- `stable` 是我们默认推荐的软件包类型。它们大约每月发布一次(因此能够及时提供新功能),并且最新的三个稳定版本都会得到诊断和错误修复回溯方面的支持。
- `lts` 每年发布两次,并在初始发布后提供一年的支持。在以下情况下,您可能更倾向于选择 `lts` 而不是 `stable`:
  - 您的公司有内部政策,不允许频繁升级或使用非 LTS 软件。
  - 您在一些次要产品中使用 ClickHouse,这些产品不需要复杂的 ClickHouse 功能,或者没有足够的资源来保持其更新。

许多最初认为应该选择 `lts` 的团队,最终还是会切换到 `stable`,因为某些对其产品很重要的新功能只在稳定版中提供。

:::tip  
升级 ClickHouse 时还需要记住一点:我们始终关注版本之间的兼容性,但有时保持完全兼容并不合理,一些细节可能会发生变化。因此,请确保在升级前查看[更新日志](/whats-new/changelog/index.md),以了解是否有关于向后不兼容更改的说明。
:::
