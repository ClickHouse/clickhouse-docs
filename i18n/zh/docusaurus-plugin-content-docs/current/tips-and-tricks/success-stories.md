---
'sidebar_position': 1
'slug': '/community-wisdom/creative-use-cases'
'sidebar_label': '成功案例'
'doc_type': 'guide'
'keywords':
- 'clickhouse creative use cases'
- 'clickhouse success stories'
- 'unconventional database uses'
- 'clickhouse rate limiting'
- 'analytics database applications'
- 'clickhouse mobile analytics'
- 'customer-facing analytics'
- 'database innovation'
- 'clickhouse real-time applications'
- 'alternative database solutions'
- 'breaking database conventions'
- 'production success stories'
'title': '课程 - 创意应用案例'
'description': '寻找解决最常见的 ClickHouse 问题的方案，包括慢查询、内存错误、连接问题和配置问题。'
---


# 成功案例 {#breaking-the-rules}

*本指南是从社区聚会上获得的一系列发现的一部分。欲获取更多现实世界的解决方案和见解，你可以 [按特定问题浏览](./community-wisdom.md)。*
*需要在生产环境中调试问题的提示？查看 [调试见解](./debugging-insights.md) 社区指南。*

这些故事展示了公司如何通过使用 ClickHouse 达到成功，甚至有些案例挑战了传统数据库类别，证明有时候“错误”的工具恰恰就是正确的解决方案。

## ClickHouse 作为限流器 {#clickhouse-rate-limiter}

当 Craigslist 需要添加一层顶级限流以保护用户时，他们面临着每个工程团队都会遇到的相同决定 - 遵循传统智慧，使用 Redis，还是探索其他选择。Brad Lhotsky，Craigslist 的一名员工，知道 Redis 是标准选择 - 几乎所有的限流教程和在线示例都出于良好原因而使用 Redis。它在限流操作中有丰富的原语，建立了良好的模式，并有着经过验证的成功记录。但 Craigslist 与 Redis 的经验并没有匹配教科书的例子。*"我们与 Redis 的经验并不像你在电影中看到的那样......我们遇到了许多奇怪的维护问题，例如在 Redis 集群中重启节点后，前端会出现一些延迟尖峰。"* 对于一个重视维护简单性的团队来说，这些操作上的麻烦正在成为一个真正的问题。

因此，当 Brad 被问到限流需求时，他采取了不同的方式：*"我问我的老板，‘你对这个主意怎么看？我可以尝试用 ClickHouse 来解决吗？’"* 这个想法虽然不寻常 - 使用分析数据库来解决通常由缓存层问题解决的事情 - 但它满足了他们的核心需求：故障开放、不产生延迟惩罚，并且对小团队来说维护安全。该解决方案利用了他们现有的基础架构，访问日志已经通过 Kafka 流入 ClickHouse。通过直接分析访问日志数据中的请求模式，他们可以将限流规则注入到现有的 ACL API 中，而无需维护一个单独的 Redis 集群。虽然这种方法的延迟略高于 Redis，*“这在某种程度上是通过提前实例化该数据集来作弊”，*但查询仍在 100 毫秒以内完成。

**关键结果：**
- 相较于 Redis 基础设施，显著改善
- 内置的 TTL 进行自动清理，消除了维护开销
- SQL 灵活性使得复杂的限流规则超越简单计数器
- 利用现有数据管道，而不需要单独的基础设施

## ClickHouse 用于客户分析 {#customer-analytics}

当 ServiceNow 需要升级他们的移动分析平台时，他们面临一个简单的问题：*"我们为什么要替换一个有效的系统？"* ServiceNow 的 Amir Vaza 知道他们现有的系统是可靠的，但客户的需求正在超出其承载能力。*"更换一个现有可靠模型的动机实际上来自产品领域，"* Amir 解释道。ServiceNow 将移动分析作为他们针对网页、移动和聊天机器人的解决方案的一部分提供，但客户希望拥有超越预聚合数据的分析灵活性。

他们之前的系统使用了大约 30 个不同的表，这些表根据固定维度（应用程序、应用程序版本和平台）对预聚合数据进行分段。对于客户可以发送的自定义属性（键值对），他们为每个组创建了单独的计数器。虽然这种方法在快速仪表板性能上表现出色，但却有一个主要限制。*"虽然这对快速的价值细分很有帮助，但我提到的限制导致了大量分析上下文的丧失，"* Amir 指出。客户无法进行复杂的客户旅程分析或提出诸如“以搜索词 'research RSA token' 开始的会话有多少个”的问题，然后分析这些用户接下来做了什么。预聚合结构破坏了多步骤分析所需的顺序上下文，每个新的分析维度都需要工程工作进行预聚合和存储。

因此，当局限性变得明显时，ServiceNow 转向了 ClickHouse，完全消除了这些预计算约束。他们不再提前计算每个变量，而是将元数据分解为数据点，并将所有内容直接插入 ClickHouse。他们使用了 ClickHouse 的异步插入队列，Amir 称其为*"真正令人惊叹的，"*以高效地处理数据摄取。这样，客户现在可以创建自己的分段，以任何维度自由切片数据，并进行以前无法实现的复杂客户旅程分析。

**关键结果：**
- 在没有预计算的情况下，跨任何维度进行动态分段
- 复杂的客户旅程分析变得可能
- 客户可以创建自己的分段并自由切片数据  
- 新分析需求不再有工程瓶颈

## 视频来源 {#video-sources}

- **[打破规则 - 用 ClickHouse 构建限流器](https://www.youtube.com/watch?v=wRwqrbUjRe4)** - Brad Lhotsky (Craigslist)
- **[ClickHouse 作为 ServiceNow 的分析解决方案](https://www.youtube.com/watch?v=b4Pmpx3iRK4)** - Amir Vaza (ServiceNow)

*这些故事展示了质疑传统数据库智慧如何能引领突破性解决方案，重新定义分析数据库的可能性。*
