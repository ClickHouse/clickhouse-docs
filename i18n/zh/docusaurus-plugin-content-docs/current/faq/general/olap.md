---
slug: /faq/general/olap
title: '什么是 OLAP？'
toc_hidden: true
toc_priority: 100
description: '联机分析处理（OLAP）简介'
keywords: ['OLAP']
doc_type: 'reference'
---



# 什么是 OLAP？ {#what-is-olap}

[OLAP](https://en.wikipedia.org/wiki/Online_analytical_processing) 是 Online Analytical Processing（在线分析处理）的缩写。这是一个广义术语,可以从技术和业务两个角度来理解。但从最高层面来看,我们可以反向理解这几个词:

处理(Processing)
: 对源数据进行处理...

分析(Analytical)
: ...生成分析报告和洞察...

在线(Online)
: ...实时完成。


## 从业务角度看 OLAP {#olap-from-the-business-perspective}

近年来,企业管理者开始认识到数据的价值。盲目决策的公司往往难以在竞争中保持领先。成功企业采用数据驱动的方法,促使它们收集所有可能对业务决策有用的数据,并需要及时分析这些数据的机制。这正是 OLAP 数据库管理系统(DBMS)发挥作用的地方。

从业务角度来看,OLAP 使企业能够持续规划、分析和报告运营活动,从而最大化效率、降低成本,并最终扩大市场份额。这可以通过内部系统实现,也可以外包给 SaaS 提供商,如网络/移动分析服务、CRM 服务等。OLAP 是许多商业智能(BI,Business Intelligence)应用程序的底层技术。

ClickHouse 是一个 OLAP 数据库管理系统,经常被用作这些 SaaS 解决方案的后端,用于分析特定领域的数据。然而,一些企业仍然不愿意与第三方提供商共享数据,因此内部数据仓库方案也是可行的选择。


## 从技术角度看 OLAP {#olap-from-the-technical-perspective}

所有数据库管理系统可以分为两类:OLAP(在线**分析**处理)和 OLTP(在线**事务**处理)。前者专注于构建报表,每个报表基于大量历史数据,但执行频率较低。而后者通常处理连续的事务流,不断修改数据的当前状态。

在实践中,OLAP 和 OLTP 并非严格的分类,更像是一个连续谱。大多数实际系统通常专注于其中一种,但如果也需要处理相反类型的工作负载,则会提供一些解决方案或变通方法。这种情况往往迫使企业运行多个集成的存储系统,虽然这可能不算什么大问题,但系统越多,维护成本就越高。因此,近年来的趋势是 HTAP(**混合事务/分析处理**),即由单个数据库管理系统同样出色地处理两种类型的工作负载。

即使数据库管理系统最初是纯 OLAP 或纯 OLTP,它们也不得不朝着 HTAP 方向发展以保持竞争力。ClickHouse 也不例外,最初它被设计为[尽可能快的 OLAP 系统](../../concepts/why-clickhouse-is-so-fast.mdx),目前仍然不具备完整的事务支持,但必须添加一些功能,如一致性读写以及用于更新/删除数据的变更操作。

OLAP 和 OLTP 系统之间的基本权衡依然存在:

- 为了高效构建分析报表,能够单独读取列至关重要,因此大多数 OLAP 数据库都采用[列式存储](../../faq/general/columnar-database.md),
- 而单独存储列会增加行操作的成本,如追加或就地修改,成本与列数成正比(如果系统试图收集事件的所有细节以备不时之需,列数可能会非常庞大)。因此,大多数 OLTP 系统采用行式存储数据。
