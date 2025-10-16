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
'doc_type': 'reference'
---


# ClickHouse 历史 {#clickhouse-history}

ClickHouse 最初是为 [Yandex.Metrica](https://metrica.yandex.com/) 开发的， [这是全球第二大网络分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all)，并且仍然是其核心组件。数据库中有超过 13 万亿条记录，日均超过 200 亿个事件，ClickHouse 允许直接从未聚合数据中动态生成自定义报告。本文简要介绍了 ClickHouse 在早期开发阶段的目标。

Yandex.Metrica 基于点击和会话实时生成自定义报告，用户可以定义任意的细分。在这样做时，通常需要构建复杂的聚合，例如独立用户的数量，并且构建报告所需的新数据实时到达。

截至 2014 年 4 月，Yandex.Metrica 每日跟踪约 120 亿个事件（页面浏览和点击）。所有这些事件都需要存储，以便构建自定义报告。一个查询可能需要在几百毫秒内扫描数百万行，或在几秒钟内扫描数亿行。

## 在 Yandex.Metrica 和其他 Yandex 服务中的使用 {#usage-in-yandex-metrica-and-other-yandex-services}

ClickHouse 在 Yandex.Metrica 中有多种用途。其主要任务是使用未聚合数据在线生成报告。它使用 374 台服务器的集群，数据库中存储超过 20.3 万亿行。压缩数据的体积约为 2 PB，不包括重复数据和副本。未压缩数据的体积（以 TSV 格式）约为 17 PB。

ClickHouse 在以下过程中也发挥了关键作用：

- 存储来自 Yandex.Metrica 的会话回放数据。
- 处理中间数据。
- 与 Analytics 一起构建全球报告。
- 运行查询以调试 Yandex.Metrica 引擎。
- 分析来自 API 和用户界面的日志。

如今，其他 Yandex 服务和部门中有多达数十个 ClickHouse 安装：搜索垂直, 电子商务, 广告, 商业分析, 移动开发, 个人服务等。

## 聚合和未聚合数据 {#aggregated-and-non-aggregated-data}

有一种广泛的观点认为，为有效计算统计数据，必须聚合数据，因为这可以减少数据量。

然而，数据聚合存在许多限制：

- 必须有预定义的所需报告列表。
- 用户不能制作自定义报告。
- 当在大量独特键上进行聚合时，数据量几乎不会减少，因此聚合是无用的。
- 对于大量报告，有太多聚合变体（组合爆炸）。
- 当聚合高基数键（如 URL）时，数据量不会减少太多（不到两倍）。
- 因此，聚合后的数据量可能会增长而不是缩小。
- 用户并不查看我们为他们生成的所有报告。大量的计算都是无用的。
- 由于不同的聚合方式，数据的逻辑完整性可能会受到损害。

如果我们不进行任何聚合，而只使用未聚合数据，这可能会减少计算量。

然而，聚合让大量工作离线完成，并相对从容。相比之下，在线计算需要尽快计算，因为用户在等待结果。

Yandex.Metrica 有一个专门的聚合数据系统，称为 Metrage，用于大多数报告。自 2009 年起，Yandex.Metrica 也使用了一个专门的 OLAP 数据库用于未聚合数据，名为 OLAPServer，之前它用于报告生成器。OLAPServer 对未聚合数据处理良好，但有许多限制，无法如预期那样用于所有报告。这些限制包括对数据类型的支持不足（仅支持数字），以及无法实时增量更新数据（只能通过每天重写数据完成）。OLAPServer 不是一个数据库管理系统，而是一个专门的数据库。

ClickHouse 的初衷是消除 OLAPServer 的限制，并解决在所有报告中处理未聚合数据的问题，但随着时间的推移，它已经发展成为一个适用于广泛分析任务的通用数据库管理系统。
