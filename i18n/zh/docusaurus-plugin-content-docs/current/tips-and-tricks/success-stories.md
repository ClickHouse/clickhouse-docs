---
sidebar_position: 1
slug: /community-wisdom/creative-use-cases
sidebar_label: '成功案例'
doc_type: 'guide'
keywords: [
  'clickhouse creative use cases',
  'clickhouse success stories',
  'unconventional database uses',
  'clickhouse rate limiting',
  'analytics database applications',
  'clickhouse mobile analytics',
  'customer-facing analytics',
  'database innovation',
  'clickhouse real-time applications',
  'alternative database solutions',
  'breaking database conventions',
  'production success stories'
]
title: '实践经验 - 创新使用场景'
description: '查找最常见 ClickHouse 问题的解决方案，包括查询变慢、内存错误、连接问题以及配置问题。'
---



# 成功案例 {#breaking-the-rules}

_本指南是从社区交流活动中收集的实践经验汇总的一部分。如需了解更多实际解决方案和见解,可以[按具体问题浏览](./community-wisdom.md)。_
_需要生产环境问题调试技巧?请查看[调试见解](./debugging-insights.md)社区指南。_

这些案例展示了企业如何通过使用 ClickHouse 在其业务场景中取得成功,其中一些甚至突破了传统数据库的分类界限,证明了有时看似"不合适"的工具恰恰成为了最佳解决方案。


## ClickHouse 作为速率限制器 {#clickhouse-rate-limiter}

当 Craigslist 需要添加一级速率限制来保护其用户时,他们面临着每个工程团队都会遇到的同样抉择——遵循传统做法使用 Redis,还是探索不同的方案。在 Craigslist 工作的 Brad Lhotsky 知道 Redis 是标准选择——几乎所有在线的速率限制教程和示例都使用 Redis 是有充分理由的。它具有丰富的速率限制操作原语、成熟的模式和经过验证的可靠性。但 Craigslist 使用 Redis 的实际经验并不符合教科书式的示例。_"我们使用 Redis 的经验不像你在电影中看到的那样……我们遇到了很多奇怪的维护问题,当我们重启 Redis 集群中的一个节点时,某些延迟峰值会冲击到前端。"_ 对于一个重视维护简便性的小团队来说,这些运维难题正在成为一个真正的问题。

因此,当 Brad 接到速率限制需求时,他采取了不同的方法:_"我问我的老板,'你觉得这个想法怎么样?也许我可以用 ClickHouse 试试?'"_ 这个想法并不常规——将分析型数据库用于通常属于缓存层的问题——但它满足了他们的核心需求:故障时开放访问、不产生延迟损失,并且对小团队来说维护安全。该解决方案利用了他们现有的基础设施,其中访问日志已经通过 Kafka 流入 ClickHouse。他们可以直接从访问日志数据中分析请求模式,并将速率限制规则注入到现有的 ACL API 中,而无需维护单独的 Redis 集群。这种方法意味着延迟略高于 Redis,Redis _"通过预先实例化数据集有点取巧"_ 而不是执行实时聚合查询,但查询仍然在 100 毫秒内完成。

**关键成果:**

- 相比 Redis 基础设施有显著改进
- 内置 TTL 自动清理功能消除了维护开销
- SQL 灵活性支持超越简单计数器的复杂速率限制规则
- 利用现有数据管道,无需单独的基础设施


## ClickHouse 用于客户分析 {#customer-analytics}

当 ServiceNow 需要升级其移动分析平台时,他们面临一个简单的问题:_"我们为什么要替换一个运行良好的系统?"_ ServiceNow 的 Amir Vaza 知道他们现有的系统是可靠的,但客户需求的增长已经超出了系统的承载能力。_"替换现有可靠模型的动机实际上来自产品层面,"_ Amir 解释道。ServiceNow 将移动分析作为其 Web、移动端和聊天机器人解决方案的一部分提供,但客户希望获得超越预聚合数据的分析灵活性。

他们之前的系统使用了大约 30 个不同的表,其中包含按固定维度分段的预聚合数据:应用程序、应用版本和平台。对于自定义属性——客户可以发送的键值对——他们为每个组创建了单独的计数器。这种方法提供了快速的仪表板性能,但存在一个重大限制。_"虽然这对于快速值分解很有用,但我提到的限制导致了大量分析上下文的丢失,"_ Amir 指出。客户无法执行复杂的客户旅程分析,也无法提出诸如"有多少会话以搜索词 'research RSA token' 开始"之类的问题,然后分析这些用户接下来做了什么。预聚合结构破坏了多步骤分析所需的顺序上下文,而且每增加一个新的分析维度都需要工程团队进行预聚合和存储工作。

因此,当这些限制变得明显时,ServiceNow 迁移到 ClickHouse 并完全消除了这些预计算约束。他们没有预先计算每个变量,而是将元数据分解为数据点,并将所有内容直接插入 ClickHouse。他们使用了 ClickHouse 的异步插入队列,Amir 称其 _"真的很棒,"_ 来高效地处理数据摄取。这种方法意味着客户现在可以创建自己的细分,在任何维度上自由切分数据,并执行以前无法实现的复杂客户旅程分析。

**关键成果:**

- 无需预计算即可跨任何维度进行动态细分
- 实现了复杂的客户旅程分析
- 客户可以创建自己的细分并自由切分数据
- 新的分析需求不再受工程瓶颈限制


## 视频资源 {#video-sources}

- **[打破常规 - 使用 ClickHouse 构建速率限制器](https://www.youtube.com/watch?v=wRwqrbUjRe4)** - Brad Lhotsky (Craigslist)
- **[ClickHouse 作为 ServiceNow 的分析解决方案](https://www.youtube.com/watch?v=b4Pmpx3iRK4)** - Amir Vaza (ServiceNow)

_这些案例展示了如何通过质疑传统数据库理念,实现突破性的解决方案,重新定义分析型数据库的可能性。_
