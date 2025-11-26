---
slug: /faq/general/olap
title: '什么是 OLAP？'
toc_hidden: true
toc_priority: 100
description: '关于联机分析处理（OLAP）的介绍'
keywords: ['OLAP']
doc_type: 'reference'
---



# 什么是 OLAP？ {#what-is-olap}

[OLAP](https://en.wikipedia.org/wiki/Online_analytical_processing) 是 Online Analytical Processing（联机分析处理）的缩写。它是一个广泛的术语，可以从技术和业务两个角度来理解。但在更宏观的层面上，你也可以把这个短语倒过来读：

Processing
:   对一些源数据进行处理……

Analytical
:   ……以生成分析报表和洞察……

Online
:   ……并以实时方式完成这一切。



## 从商业视角看 OLAP {#olap-from-the-business-perspective}

近些年，业务人员开始意识到数据的价值。那些在缺乏数据支撑下盲目决策的公司，往往难以跟上竞争对手的步伐。成功企业的数据驱动方法推动它们收集所有可能对业务决策有潜在价值的数据，并需要相应机制对这些数据进行及时分析。OLAP 数据库管理系统（DBMS）正是在这一点上发挥作用。

从商业角度来看，OLAP 使企业能够持续地规划、分析和报告运营活动，从而最大化效率、降低成本，并最终抢占市场份额。这既可以通过自建系统实现，也可以外包给 SaaS 提供商，例如 Web/移动分析服务、CRM 服务等。OLAP 是许多 BI（Business Intelligence，商业智能）应用背后的核心技术。

ClickHouse 是一种 OLAP 数据库管理系统，常被用作这些 SaaS 解决方案的后端，用于分析特定领域的数据。然而，仍有一些企业不愿将其数据共享给第三方服务商，此时自建数据仓库的方案同样可行。



## 从技术角度看 OLAP {#olap-from-the-technical-perspective}

所有数据库管理系统大致可以分为两类：OLAP（联机**分析**处理，Online **Analytical** Processing）和 OLTP（联机**事务**处理，Online **Transactional** Processing）。前者侧重于生成报表，每个报表都基于海量历史数据，但生成频率相对较低；而后者通常要处理持续不断的事务流，并不断修改数据的当前状态。

在实践中，OLAP 和 OLTP 并不是截然分明的类别，更像是一个连续体。大多数实际系统通常侧重于其中一类，但如果也需要处理另一类负载，则会提供某些解决方案或变通办法。这种情况往往迫使企业同时运行多个彼此集成的存储系统。本身这可能问题不大，但系统越多，运维成本就越高。因此，近几年的趋势是 HTAP（**混合事务/分析处理**，Hybrid Transactional/Analytical Processing），即由单一数据库管理系统同时高效处理这两类负载。

即便一个 DBMS 起初是纯 OLAP 或纯 OLTP，为了跟上竞争，也被迫朝 HTAP 方向演进。ClickHouse 也不例外，它最初被设计为[尽可能快的 OLAP 系统](../../concepts/why-clickhouse-is-so-fast.mdx)，目前仍然没有完备的事务支持，但仍不得不增加一致性读写以及用于更新/删除数据的变更操作（mutations）等功能。

OLAP 和 OLTP 系统之间的基本权衡依然存在：

- 为了高效生成分析报表，能够按列单独读取至关重要，因此大多数 OLAP 数据库是[列式](../../faq/general/columnar-database.md)的，
- 然而，按列单独存储会提高基于行的操作（如追加或就地修改）的成本，并且成本与列的数量成正比（如果系统试图“以防万一”地收集某个事件的所有细节，那么列的数量可能非常巨大）。因此，大多数 OLTP 系统按行组织存储数据。
