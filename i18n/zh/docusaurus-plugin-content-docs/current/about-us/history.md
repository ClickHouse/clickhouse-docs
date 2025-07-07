---
'slug': '/about-us/history'
'sidebar_label': 'ClickHouse 历史'
'sidebar_position': 40
'description': 'ClickHouse 开发的历史'
'keywords':
- 'history'
- 'development'
- 'Metrica'
'title': 'ClickHouse 历史'
---


# ClickHouse 历史 {#clickhouse-history}

ClickHouse 最初是为了支持 [Yandex.Metrica](https://metrica.yandex.com/)， [全球第二大网络分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all) 而开发的，并且仍然是其核心组件。随着数据库中记录超过 13 万亿条，且每天超过 200 亿个事件，ClickHouse 允许直接从非聚合数据中动态生成自定义报告。本文简要介绍了 ClickHouse 在其早期开发阶段的目标。

Yandex.Metrica 根据用户定义的任意细分实时生成自定义报告，基于点击和会话。这经常需要构建复杂的聚合，例如独立用户的数量，而生成报告所需的新数据也实时到达。

截至 2014 年 4 月，Yandex.Metrica 每天跟踪约 120 亿个事件（页面浏览和点击）。所有这些事件需要存储，以便生成自定义报告。单个查询可能需要在几百毫秒内扫描数百万行，或在短短几秒钟内扫描数亿行。

## 在 Yandex.Metrica 和其他 Yandex 服务中的使用 {#usage-in-yandex-metrica-and-other-yandex-services}

ClickHouse 在 Yandex.Metrica 中具有多重用途。
其主要任务是使用非聚合数据在线生成报告。它使用一个由 374 台服务器组成的集群，存储超过 20.3 万亿行数据。压缩数据的体积约为 2 PB，不包括重复和副本。未压缩数据的体积（以 TSV 格式）大约为 17 PB。

ClickHouse 还在以下过程中发挥了关键作用：

- 存储来自 Yandex.Metrica 的会话重放数据。
- 处理中间数据。
- 使用分析构建全球报告。
- 执行调试 Yandex.Metrica 引擎的查询。
- 分析来自 API 和用户界面的日志。

如今，其他 Yandex 服务和部门中有数十个 ClickHouse 实例：搜索垂直领域、电子商务、广告、商业分析、移动开发、个人服务等。

## 聚合和非聚合数据 {#aggregated-and-non-aggregated-data}

有一种广泛的看法，即为了有效计算统计数据，必须进行数据聚合，因为这会减少数据量。

然而，数据聚合伴随着许多限制：

- 必须有预定义的所需报告列表。
- 用户无法生成自定义报告。
- 当在大量不同键上聚合时，数据量几乎没有减少，因此聚合没有意义。
- 对于大量报告，存在过多的聚合变体（组合爆炸）。
- 当聚合高基数的键（例如 URL）时，数据量减少得不多（不足两倍）。
- 因此，聚合后的数据量可能会增长而不是减小。
- 用户并不会查看我们为他们生成的所有报告。大部分计算是无用的。
- 对于各种聚合，数据的逻辑完整性可能会受到损害。

如果我们不聚合任何内容，而是使用非聚合数据，这可能会减少计算量。

然而，聚合的话，工作的一部分被转移到离线完成，相对平静。相反，在线计算需要尽可能快地计算，因为用户在等待结果。

Yandex.Metrica 有一个专门的聚合数据系统，叫做 Metrage，使用它生成大多数报告。
自 2009 年起，Yandex.Metrica 还使用一个专门的 OLAP 数据库，用于非聚合数据，叫做 OLAPServer，该数据库以前用于报告生成器。
OLAPServer 在处理非聚合数据时表现良好，但有许多限制，无法如所愿用于所有报告。这些限制包括不支持数据类型（仅限数字），以及无法实时增量更新数据（只能通过每日重写数据来完成）。OLAPServer 不是一个数据库管理系统，而是一个专门的数据库。

ClickHouse 的初始目标是消除 OLAPServer 的限制，解决所有报告处理非聚合数据的问题，但随着时间的推移，它已经成长为一个通用数据库管理系统，适合广泛的分析任务。
