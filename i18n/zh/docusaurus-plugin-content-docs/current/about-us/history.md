---
slug: /about-us/history
sidebar_label: ClickHouse 历史
sidebar_position: 40
description: ClickHouse 开发历史
tags: ['history', 'development', 'Metrica']
---


# ClickHouse 历史 {#clickhouse-history}

ClickHouse 最初是为 [Yandex.Metrica](https://metrica.yandex.com/) 开发的，[这是全球第二大网页分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all)，并继续作为其核心组件。数据库中记录超过 13 万亿条，每天处理超过 200 亿次事件，ClickHouse 允许从非聚合数据直接实时生成自定义报告。本文简要介绍了 ClickHouse 在早期开发阶段的目标。

Yandex.Metrica 根据用户定义的任意细分，实时生成基于点击量和会话的定制报告。这通常需要构建复杂的聚合，比如独立用户的数量，而生成报告所需的新数据是实时到达的。

截至 2014 年 4 月，Yandex.Metrica 每天跟踪约 120 亿次事件（页面查看和点击）。所有这些事件都需要存储，以便生成自定义报告。单个查询可能需要在几百毫秒内扫描数百万行，或者在几秒钟内扫描数亿行。

## 在 Yandex.Metrica 和其他 Yandex 服务中的使用 {#usage-in-yandex-metrica-and-other-yandex-services}

ClickHouse 在 Yandex.Metrica 中有多种用途。
其主要任务是在在线模式下使用非聚合数据生成报告。它使用一个由 374 台服务器组成的集群，数据库中存储超过 20.3 万亿行。压缩数据的总量约为 2 PB，未计算重复和副本。未压缩数据的总量（以 TSV 格式）将大约为 17 PB。

ClickHouse 在以下流程中也发挥着关键作用：

- 存储来自 Yandex.Metrica 的会话重放数据。
- 处理中间数据。
- 使用 Analytics 构建全球报告。
- 运行查询以调试 Yandex.Metrica 引擎。
- 分析来自 API 和用户界面的日志。

如今，其他 Yandex 服务和部门中有数十个 ClickHouse 实例：搜索垂直、电子商务、广告、商业分析、移动开发、个人服务等等。

## 聚合和非聚合数据 {#aggregated-and-non-aggregated-data}

普遍认为，要有效计算统计数据，必须对数据进行聚合，因为这会减少数据量。

然而，数据聚合存在许多限制：

- 你必须有预先定义的报告列表。
- 用户无法生成自定义报告。
- 在大数量不同键的聚合中，数据量几乎没有减少，因此聚合是无用的。
- 对于大量报告，有太多聚合变体（组合爆炸）。
- 在高基数的键（例如 URL）的聚合中，数据量减少不多（不足两倍）。
- 因此，数据聚合时体量可能会增长而不是减少。
- 用户并不会查看我们为他们生成的所有报告。这些计算中有很大一部分是无用的。
- 逻辑完整性可能会因各种聚合而受到损害。

如果我们不聚合任何内容并处理非聚合数据，这可能会减少计算量。

然而，进行聚合时，工作很大一部分是在离线中完成的，相对平静。相比之下，在线计算需要尽可能快地计算，因为用户正在等待结果。

Yandex.Metrica 有一个专门的聚合数据的系统，称为 Metrage，它被用于大多数报告。
自 2009 年起，Yandex.Metrica 还使用一个名为 OLAPServer 的专门 OLAP 数据库来处理非聚合数据，该数据库之前用于报告生成器。
OLAPServer 对于非聚合数据工作良好，但存在许多限制，无法按所需方式用于所有报告。这些包括不支持数据类型（仅限数字），以及无法实时增量更新数据（只能通过每天重写数据来完成）。OLAPServer 不是一个数据库管理系统，而是一个专门的数据库。

ClickHouse 的初衷是消除 OLAPServer 的限制，解决所有报告的非聚合数据处理的问题，但随着时间的推移，它已经发展成一个适合广泛分析任务的通用数据库管理系统。
