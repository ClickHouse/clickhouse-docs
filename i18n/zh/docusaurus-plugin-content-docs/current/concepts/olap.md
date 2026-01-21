---
sidebar_position: 2
sidebar_label: '什么是 OLAP？'
description: 'OLAP 是联机分析处理（Online Analytical Processing）的缩写。它是一个广义术语，可以从两个角度来理解：技术角度和业务角度。'
title: '什么是 OLAP？'
slug: /concepts/olap
keywords: ['OLAP']
doc_type: 'reference'
---

# 什么是 OLAP？ \{#what-is-olap\}

[OLAP](https://en.wikipedia.org/wiki/Online_analytical_processing) 是 Online Analytical Processing（联机分析处理）的缩写。这个术语范围很广，可以从两个角度来理解：技术角度和业务角度。在最高层面上，你可以简单地将这个短语反向理解：

**Processing（处理）** — 对源数据进行处理……

**Analytical（分析）** — ……以生成分析报告和洞察……

**Online（联机）** — ……并以实时方式完成。

## 从业务视角看 OLAP \{#olap-from-the-business-perspective\}

近些年，业务人员开始逐渐认识到数据的价值。那些在没有数据依据的情况下盲目决策的公司，往往难以跟上竞争对手的步伐。成功企业的数据驱动做法迫使它们收集所有哪怕只是可能对业务决策有一点帮助的数据，并要求它们具备能够及时分析这些数据的机制。OLAP 数据库管理系统（DBMS）正是为此而生。

从业务角度看，OLAP 允许企业持续进行运营活动的规划、分析和报告，从而最大化效率、降低成本，并最终赢得市场份额。其部署既可以在企业自建系统中完成，也可以外包给 SaaS 提供商，例如 web/移动分析服务、CRM 服务等。OLAP 是许多 BI（商业智能）应用背后的核心技术。

ClickHouse 是一种 OLAP 数据库管理系统，经常被用作此类 SaaS 解决方案的后端来分析特定领域的数据。然而，一些企业仍然不愿将自己的数据分享给第三方服务商，因此自建数据仓库同样是一个可行的选项。

## 从技术视角看 OLAP \{#olap-from-the-technical-perspective\}

所有数据库管理系统大致可以分为两类：OLAP（联机**分析**处理，Online **Analytical** Processing）和 OLTP（联机**事务**处理，Online **Transactional** Processing）。前者专注于构建报表，每个报表基于海量历史数据，但生成频率较低；后者通常处理连续不断的事务流，不断地修改数据的当前状态。

在实践中，OLAP 和 OLTP 并不是非此即彼的二元类别，而更像是一个光谱。大多数实际系统通常侧重其中一种，但如果也需要处理另一种类型的负载，则会提供一些解决方案或变通方式。这种情况往往迫使企业运行多个彼此集成的存储系统。这本身未必是大问题，但系统越多，运维成本越高，因此近年来的趋势是采用 HTAP（**混合事务/分析处理，Hybrid Transactional/Analytical Processing**），由单一数据库管理系统同时高效处理两种类型的负载。

即使一个 DBMS 最初是作为纯 OLAP 或纯 OLTP 系统设计的，为了保持竞争力，也不得不朝 HTAP 方向演进。ClickHouse 也不例外。最初，它被设计为一个[尽可能快的 OLAP 系统](/concepts/why-clickhouse-is-so-fast)，目前仍然不具备完备的事务支持，但已经增加了一致读/写以及用于更新/删除数据的变更（mutations）等功能。

OLAP 和 OLTP 系统之间的根本性权衡仍然存在：

- 为了高效构建分析报表，能够按列单独读取数据至关重要，因此大多数 OLAP 数据库都是[列式](https://clickhouse.com/engineering-resources/what-is-columnar-database)的；
- 而按列存储会使针对行的操作（例如追加或就地修改）的成本随列数成比例增长（如果系统试图「以防万一」收集事件的所有细节，那么列数可能会非常大）。因此，大多数 OLTP 系统按行组织存储数据。
