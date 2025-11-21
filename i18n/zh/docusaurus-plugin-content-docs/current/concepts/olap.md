---
sidebar_position: 2
sidebar_label: '什么是 OLAP？'
description: 'OLAP 是 Online Analytical Processing（联机分析处理）的缩写。它是一个广义术语，可以从技术和业务两个角度来理解。'
title: '什么是 OLAP？'
slug: /concepts/olap
keywords: ['OLAP']
doc_type: 'reference'
---



# 什么是 OLAP？

[OLAP](https://en.wikipedia.org/wiki/Online_analytical_processing) 是 Online Analytical Processing（联机分析处理）的缩写。它是一个可以从技术和业务两个视角来理解的广义术语。从最高层面来看，你可以把这几个词倒过来理解：

**Processing（处理）** — 对源数据进行处理……

**Analytical（分析）** — ……以生成分析报表和洞察结果……

**Online（联机）** — ……并以实时方式完成。



## 从业务角度看 OLAP {#olap-from-the-business-perspective}

近年来,企业管理者开始认识到数据的价值。盲目决策的公司往往难以在竞争中保持领先。成功企业采用的数据驱动方法要求它们收集所有可能对业务决策有用的数据,并需要具备及时分析这些数据的能力。OLAP 数据库管理系统(DBMS)正是为此而生。

从业务角度来看,OLAP 使企业能够持续规划、分析和报告运营活动,从而最大化效率、降低成本,并最终赢得市场份额。这可以通过内部系统实现,也可以外包给 SaaS 提供商,如网络/移动分析服务、CRM 服务等。OLAP 是许多商业智能(BI)应用程序的核心技术。

ClickHouse 是一个 OLAP 数据库管理系统,经常被用作这些 SaaS 解决方案的后端,用于分析特定领域的数据。然而,一些企业仍然不愿意与第三方提供商共享数据,因此自建数据仓库方案同样可行。


## 从技术角度看 OLAP {#olap-from-the-technical-perspective}

所有数据库管理系统可以分为两类:OLAP(在线**分析**处理)和 OLTP(在线**事务**处理)。前者专注于构建报表,每个报表基于大量历史数据,但执行频率较低。后者通常处理连续的事务流,不断修改数据的当前状态。

在实践中,OLAP 和 OLTP 并非二元分类,而更像是一个连续谱。大多数实际系统通常专注于其中一种,但如果也需要处理相反类型的工作负载,则会提供一些解决方案或变通方法。这种情况往往迫使企业运营多个集成的存储系统。这可能不算什么大问题,但拥有更多系统会增加维护成本,因此近年来的趋势是转向 HTAP(**混合事务/分析处理**),即由单个数据库管理系统同样出色地处理两种类型的工作负载。

即使数据库管理系统最初是纯 OLAP 或纯 OLTP,也不得不朝着 HTAP 方向发展以保持竞争力。ClickHouse 也不例外。最初,它被设计为[尽可能快的 OLAP 系统](/concepts/why-clickhouse-is-so-fast),目前仍不具备完整的事务支持,但已添加了一些功能,如一致性读写以及用于更新/删除数据的变更操作。

OLAP 和 OLTP 系统之间的根本权衡依然存在:

- 为了高效构建分析报表,能够单独读取列至关重要,因此大多数 OLAP 数据库都采用[列式存储](https://clickhouse.com/engineering-resources/what-is-columnar-database);
- 而单独存储列会增加行操作的成本,如追加或就地修改,成本与列数成正比(如果系统试图收集事件的所有细节以备不时之需,列数可能会非常庞大)。因此,大多数 OLTP 系统采用行式存储数据。
