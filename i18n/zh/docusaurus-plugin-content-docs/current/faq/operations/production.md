---
'slug': '/faq/operations/production'
'title': '在生产中使用哪个 ClickHouse 版本？'
'toc_hidden': true
'toc_priority': 10
'description': '本页提供关于在生产中使用哪个 ClickHouse 版本的指导'
---


# Which ClickHouse Version to Use in Production? {#which-clickhouse-version-to-use-in-production}

首先，让我们讨论一下人们为什么会问这个问题。主要有两个原因：

1. ClickHouse 的开发速度非常快，通常每年会有 10 次以上的稳定版本发布。这使得可选择的版本范围广泛，而这并不是一个简单的选择。
2. 一些用户希望避免花费时间去弄清楚哪个版本最适合他们的用例，而只是跟随其他人的建议。

第二个原因更为根本，因此我们将首先讨论这个问题，然后再回到不同 ClickHouse 版本的选择上。

## Which ClickHouse Version Do You Recommend? {#which-clickhouse-version-do-you-recommend}

雇佣顾问或相信一些已知专家以摆脱您对生产环境的责任是非常诱人的。您安装某个别人推荐的特定 ClickHouse 版本；如果出现任何问题——那就不是您的错误，是别人的。这种推理是一个大陷阱。没有外部人士比您更了解您公司的生产环境。

那么，您如何正确选择要升级到哪个 ClickHouse 版本？或者您如何选择第一个 ClickHouse 版本？首先，您需要投资于建立一个**真实的预生产环境**。理想情况下，它应该是一个完全相同的影子副本，但这通常成本很高。

以下是一些关键点，以便在预生产环境中以较低的成本获得合理的准确性：

- 预生产环境需要运行一组与您计划在生产中运行的查询尽可能接近的查询：
    - 不要让它只有只读并带有一些静止数据。
    - 不要让它是只有写入的，仅仅复制数据而没有生成一些典型报告。
    - 不要在不应用模式迁移的情况下将其清空。
- 使用一小部分真实的生产数据和查询。尽量选择一个仍然具有代表性的样本，并使 `SELECT` 查询返回合理的结果。如果您的数据敏感并且内部政策不允许其离开生产环境，可以使用数据混淆技术。
- 确保预生产环境由您的监控和警报软件覆盖，与您的生产环境相同。
- 如果您的生产环境跨多个数据中心或区域，确保您的预生产环境也同样如此。
- 如果您的生产环境使用如复制、分布式表和级联物化视图等复杂功能，请确保在预生产环境中以相似的方式进行配置。
- 在预生产环境中使用与生产环境大致相同数量或规格更小的服务器或虚拟机存在权衡，或者使用较少的但大小相同的服务器或虚拟机。第一种选择可能会捕获额外的网络相关问题，而后者更易于管理。

第二个需要投资的领域是**自动化测试基础设施**。不要假设如果某种查询成功执行一次，它将永远如此。进行一些 ClickHouse 被模拟的单元测试是可以的，但请确保您的产品具有合理的自动化测试集，这些测试必须针对真实的 ClickHouse 运行，以检查所有重要的用例是否按预期工作。

迈出的一步可以是向 [ClickHouse 的开源测试基础设施](https://github.com/ClickHouse/ClickHouse/tree/master/tests) 贡献这些自动化测试，这些测试在日常开发中不断使用。学习[如何运行它](../../development/tests.md)并将您的测试适配到该框架中确实需要一些额外的时间和努力，但这将确保 ClickHouse 发布时已经通过这些测试进行验证，而不是在事后报告问题后反复浪费时间，然后等待缺陷修复的实施、回溯和发布。一些公司甚至将对基础设施的测试贡献作为公司内部政策（称为 [Beyonce's Rule](https://www.oreilly.com/library/view/software-engineering-at/9781492082781/ch01.html#policies_that_scale_well) 在 Google 内部实施）。

当您有了预生产环境和测试基础设施后，选择最佳版本就变得简单了：

1. 定期对新的 ClickHouse 版本运行您的自动化测试。对于被标记为 `testing` 的 ClickHouse 版本也可以这样做，但不建议继续向前推进。
2. 部署通过测试的 ClickHouse 版本到预生产中，并检查所有进程是否按预期运行。
3. 将您发现的问题报告给 [ClickHouse GitHub Issues](https://github.com/ClickHouse/ClickHouse/issues)。
4. 如果没有重大问题，您可以安全地开始将 ClickHouse 版本部署到您的生产环境。投资于逐步发布自动化的系统，该系统实现类似于 [canary releases](https://martinfowler.com/bliki/CanaryRelease.html) 或 [green-blue deployments](https://martinfowler.com/bliki/BlueGreenDeployment.html) 的方法可能会进一步降低生产环境中出现问题的风险。

正如您可能注意到的，上述方法中没有什么特定于 ClickHouse 的内容——如果人们认真对待其生产环境，他们会对任何所依赖的基础设施这样做。

## How to Choose Between ClickHouse Releases? {#how-to-choose-between-clickhouse-releases}

如果您查看 ClickHouse 软件包仓库的内容，您会看到两种类型的软件包：

1. `stable`
2. `lts`（长期支持）

以下是选择这两者之间的一些指导：

- `stable` 是我们默认推荐的软件包类型。它们大约每月发布一次（因此在合理延迟下提供新功能），并且最近三个稳定版本在诊断和回溯错误修复方面受到支持。
- `lts` 每年发布两次，并在初始发布后支持一年。在以下情况下，您可能更倾向于使用它们而非 `stable`：
    - 您的公司有一些内部政策，不允许频繁升级或使用非 LTS 软件。
    - 您在一些次要产品中使用 ClickHouse，这些产品要么不需要复杂的 ClickHouse 功能，要么没有足够的资源以保持其更新。

许多最初认为 `lts` 是最佳选择的团队，最终出于某些对其产品重要的新功能原因，仍然会转向 `stable`。

:::tip    
在升级 ClickHouse 时还有一件事情需要记住：我们始终关注版本之间的兼容性，但有时保留某些细节并不合理，可能会发生变化。因此，请确保在升级之前查看 [changelog](/whats-new/changelog/index.md)，以了解是否有任何关于向后不兼容更改的说明。
:::
