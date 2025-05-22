---
'slug': '/about-us/history'
'sidebar_label': 'ClickHouse历史'
'sidebar_position': 40
'description': 'ClickHouse开发的历史'
'keywords':
- 'history'
- 'development'
- 'Metrica'
'title': 'ClickHouse历史'
---


# ClickHouse 历史 {#clickhouse-history}

ClickHouse 最初是为 [Yandex.Metrica](https://metrica.yandex.com/) 开发的，[这是世界第二大网络分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all)，并且仍然是其核心组成部分。数据库中拥有超过 13 万亿条记录，每天有超过 200 亿事件，ClickHouse 允许直接从非聚合数据中生成自定义报告。本文简要介绍了 ClickHouse 在其早期阶段开发中的目标。

Yandex.Metrica 根据点击量和会话实时构建自定义报告，用户可以定义任意的细分。这样做通常需要构建复杂的聚合，例如唯一用户的数量，并且生成报告所需的新数据实时到达。

截至 2014 年 4 月，Yandex.Metrica 每天跟踪约 120 亿事件（页面浏览和点击）。所有这些事件都需要存储，以便构建自定义报告。一条查询可能需要在几百毫秒内扫描数百万行，或在短短几秒内扫描数亿行。

## 在 Yandex.Metrica 和其他 Yandex 服务中的使用 {#usage-in-yandex-metrica-and-other-yandex-services}

ClickHouse 在 Yandex.Metrica 中承担多种任务。
其主要任务是使用非聚合数据在线生成报告。它使用一个由 374 台服务器组成的集群，存储超过 20.3 万亿行数据。压缩数据的体积约为 2 PB，不包括重复和副本。未压缩数据的体积（以 TSV 格式）约为 17 PB。

ClickHouse 在以下过程中也扮演着关键角色：

- 为 Yandex.Metrica 的会话回放存储数据。
- 处理中间数据。
- 通过分析构建全球报告。
- 运行查询以调试 Yandex.Metrica 引擎。
- 分析来自 API 和用户界面的日志。

目前，ClickHouse 在 Yandex 的其他服务和部门中有多个安装：搜索垂直、电子商务、广告、商业分析、移动开发、个人服务等。

## 聚合数据和非聚合数据 {#aggregated-and-non-aggregated-data}

有一种普遍的看法，认为为了有效计算统计信息，必须对数据进行聚合，因为这会减少数据量。

然而，数据聚合有许多限制：

- 您必须有一个预定义的所需报告列表。
- 用户无法制作自定义报告。
- 当对大量独特的键进行聚合时，数据量几乎没有减少，因此聚合是无用的。
- 对于大量报告，有太多的聚合变体（组合爆炸）。
- 聚合高基数的键时（例如 URL），数据量减少不多（减少不到两倍）。
- 基于这个原因，聚合后数据量可能会增长而不是缩小。
- 用户并不查看我们为他们生成的所有报告。大部分计算都是无用的。
- 对于各种聚合，数据的逻辑完整性可能会被破坏。

如果我们不聚合任何内容，而是使用非聚合数据，这可能会减少计算量。

然而，使用聚合时，工作中的大部分内容在离线中完成，相对宁静。而在线计算需要尽可能快地进行，因为用户在等待结果。

Yandex.Metrica 具有一个专门的聚合数据系统，称为 Metrage，主要用于大多数报告。
自 2009 年起，Yandex.Metrica 还使用了一种专门的 OLAP 数据库来处理非聚合数据，称为 OLAPServer，之前用于报告生成器。
OLAPServer 在处理非聚合数据时表现良好，但有许多限制，无法按预期用于所有报告。这些限制包括对数据类型的支持不足（仅限数字），以及实时增量更新数据的能力（只能通过每天重写数据实现）。OLAPServer 不是一个 DBMS，而是一个专用数据库。

ClickHouse 的初始目标是消除 OLAPServer 的限制，并解决所有报告处理非聚合数据的问题，但随着时间的推移，它已成长为一个适用于广泛分析任务的通用数据库管理系统。
