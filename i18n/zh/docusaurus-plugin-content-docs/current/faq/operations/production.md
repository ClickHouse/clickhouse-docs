---
'slug': '/faq/operations/production'
'title': '在生产中使用哪个 ClickHouse 版本？'
'toc_hidden': true
'toc_priority': 10
'description': '该页面提供关于在生产中使用哪个 ClickHouse 版本的指导'
'doc_type': 'guide'
---


# Which ClickHouse version to use in production? {#which-clickhouse-version-to-use-in-production}

首先，让我们讨论一下人们为什么会问这个问题。主要有两个关键原因：

1.  ClickHouse 的开发速度非常快，通常每年会有超过 10 个稳定版本发布。这使得可选择的版本范围非常广泛，而选择并不简单。
2.  有些用户希望避免花时间查明哪个版本最适合他们的使用场景，只想遵循别人的建议。

第二个原因更为根本，因此我们先从这一点开始，然后再讨论如何浏览不同的 ClickHouse 版本。

## Which ClickHouse version do you recommend? {#which-clickhouse-version-do-you-recommend}

雇佣顾问或信任一些知名专家来摆脱对您的生产环境的责任是很有诱惑的。您安装某个特定的 ClickHouse 版本，这个版本是别人推荐的；如果出现了问题 - 那不是您的错，是别人的。这种推理是一个大的陷阱。没有外部人士比您更清楚您公司生产环境中发生了什么。

那么，您如何正确选择要升级到的 ClickHouse 版本呢？或者，您如何选择第一个 ClickHouse 版本呢？首先，您需要投入时间设置一个 **真实的预生产环境**。理想情况下，它可以是一个完全相同的影子副本，但通常成本较高。

以下是一些关键点，以在预生产环境中以较低的成本获得合理的保真度：

- 预生产环境需要运行与您打算在生产中运行的查询尽可能接近的查询集：
  - 不要让它只读取一些冻结的数据。
  - 不要让它只写入数据而不构建一些典型的报告。
  - 不要清除它，而是应用模式迁移。
- 使用真实生产数据和查询的样本。尝试选择一个仍然具有代表性的样本，并使 `SELECT` 查询返回合理的结果。如果您的数据敏感且内部政策不允许它离开生产环境，请使用混淆处理。
- 确保预生产环境的监控和警报软件与生产环境一样得到覆盖。
- 如果您的生产环境跨越多个数据中心或区域，请确保预生产环境也这样设置。
- 如果您的生产使用复杂的特性，如复制、分布式表和级联物化视图，请确保它们在预生产中也这样配置。
- 在预生产中使用与生产中大致相同数量的服务器或虚拟机（VM），但大小较小，或者数量较少但大小相同之间存在权衡。第一种选择可能会捕获额外的网络相关问题，而后者则更易于管理。

第二个投资领域是 **自动化测试基础设施**。不要假设如果某种查询成功执行过一次，它将永远继续这样做。虽然可以有一些单元测试，其中 ClickHouse 被模拟，但确保您的产品有一套合理的自动化测试，这些测试针对真实的 ClickHouse 运行，并检查所有重要的用例是否仍按预期工作。

进一步的步骤是为 [ClickHouse 的开源测试基础设施](https://github.com/ClickHouse/ClickHouse/tree/master/tests) 贡献这些自动化测试，这在其日常开发中不断使用。学习 [如何运行它](../../development/tests.md)，然后如何将您的测试适应这个框架，确实会花费一些额外的时间和精力，但这将通过确保 ClickHouse 发布时已进行测试而得到回报，而不是反复浪费时间在问题报告后，等待 Bug 修复去实施、回溯和发布。有些公司甚至将此类测试贡献作为其内部政策的要求（称为 [Beyonce's Rule](https://www.oreilly.com/library/view/software-engineering-at/9781492082781/ch01.html#policies_that_scale_well) 在 Google 中）。

当您准备好预生产环境和测试基础设施后，选择最佳版本就简单了：

1.  定期针对新的 ClickHouse 版本运行自动化测试。您甚至可以对标记为 `testing` 的 ClickHouse 版本进行测试，但不建议继续推进后续步骤。
2.  部署通过测试的 ClickHouse 版本到预生产，并检查所有过程是否按预期运行。
3.  报告您发现的任何问题到 [ClickHouse GitHub Issues](https://github.com/ClickHouse/ClickHouse/issues)。
4.  如果没有重大问题，开始将 ClickHouse 版本部署到生产环境应该是安全的。投资于逐步发布自动化，实施类似于 [canary releases](https://martinfowler.com/bliki/CanaryRelease.html) 或 [green-blue deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html) 的方法，可以进一步减少生产中出现问题的风险。

正如您可能注意到的，上述方法没有特别针对 ClickHouse - 如果人们认真对待他们的生产环境，他们对任何基础设施都会这样做。

## How to choose between ClickHouse releases? {#how-to-choose-between-clickhouse-releases}

如果您查看 ClickHouse 包存储库的内容，您会看到两种类型的软件包：

1.  `stable`
2.  `lts`（长期支持）

以下是如何选择这两者之间的一些指导：

- `stable` 是我们默认推荐的软件包类型。这些包大约每月发布一次（因此提供合理延迟的新功能），并且最新的三个稳定版本在诊断和回溯 Bug 修复方面受到支持。
- `lts` 每年发布两次，并在初始发布后支持一年。您在以下情况下可能更喜欢它们而不是 `stable`：
  - 您的公司有一些内部政策，不允许频繁升级或使用非 LTS 软件。
  - 您在某些次要产品中使用 ClickHouse，这些产品既不需要任何复杂的 ClickHouse 特性，也没有足够的资源进行更新。

许多最初认为 `lts` 是最佳选择的团队最终仍然会因某些对其产品重要的最近功能而转换回 `stable`。

:::tip    
在升级 ClickHouse 时还有一件事需要记住：我们始终关注各版本之间的兼容性，但有时保持兼容性是不合理的，一些小细节可能会发生变化。因此，在升级之前，请确保检查 [changelog](/whats-new/changelog/index.md)，以查看是否有关于向后不兼容更改的说明。
:::
