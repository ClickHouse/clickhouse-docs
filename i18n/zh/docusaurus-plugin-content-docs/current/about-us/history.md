---
'slug': '/about-us/history'
'sidebar_label': 'ClickHouse 历史'
'sidebar_position': 40
'description': 'ClickHouse 开发历史'
'keywords':
- 'history'
- 'development'
- 'Metrica'
'title': 'ClickHouse History'
---




# ClickHouse 历史 {#clickhouse-history}

ClickHouse 最初是为 [Yandex.Metrica](https://metrica.yandex.com/) 开发的，Yandex.Metrica 是 [全球第二大网页分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all)，并继续作为其核心组件。数据库中有超过 13 万亿条记录，每天超过 200 亿事件，ClickHouse 允许直接从非聚合数据中动态生成自定义报告。本文简要介绍了 ClickHouse 在早期开发阶段的目标。

Yandex.Metrica 根据点击和会话实时构建自定义报告，用户可以定义任意的细分。为此，通常需要构建复杂的聚合，例如唯一用户的数量，而用于构建报告的新数据是实时到达的。

截至 2014 年 4 月，Yandex.Metrica 每天跟踪约 120 亿个事件（页面查看和点击）。所有这些事件都需要存储，以便构建自定义报告。一个查询可能需要在几百毫秒内扫描数百万行，或者在几秒钟内扫描数亿行。

## 在 Yandex.Metrica 和其他 Yandex 服务中的使用 {#usage-in-yandex-metrica-and-other-yandex-services}

ClickHouse 在 Yandex.Metrica 中具有多重用途。
其主要任务是使用非聚合数据在线构建报告。它使用一个由 374 个服务器组成的集群，数据库中存储了超过 20.3 万亿行数据。压缩数据的体积约为 2 PB，未计算重复和副本。未压缩数据的体积（以 TSV 格式）约为 17 PB。

ClickHouse 在以下过程中也发挥了关键作用：

- 存储来自 Yandex.Metrica 的会话重放数据。
- 处理中间数据。
- 与 Analytics 一起构建全球报告。
- 运行用于调试 Yandex.Metrica 引擎的查询。
- 分析来自 API 和用户界面的日志。

如今，其他 Yandex 服务和部门中有多个 ClickHouse 安装：搜索垂直、电子商务、广告、商业分析、移动开发、个人服务等。

## 聚合数据与非聚合数据 {#aggregated-and-non-aggregated-data}

普遍认为，为了有效计算统计数据，必须聚合数据，因为这可以减少数据量。

然而，数据聚合有很多局限性：

- 必须有预定义的报告列表。
- 用户无法生成自定义报告。
- 在大量不同键上进行聚合时，数据量几乎没有减少，因此聚合是无用的。
- 对于大量报告，聚合变体太多（组合爆炸）。
- 当聚合高基数的键（如 URL）时，数据量不会大幅减少（减少不到两倍）。
- 因此，聚合后数据量可能会增长而不是减少。
- 用户并不会查看我们为他们生成的所有报告。很多计算都是无用的。
- 各种聚合可能会破坏数据的逻辑完整性。

如果我们不聚合任何东西，并使用非聚合数据，这可能减少计算的体积。

然而，通过聚合，大部分工作是在离线完成，且相对平稳。相比之下，在线计算需要尽可能快地计算，因为用户在等待结果。

Yandex.Metrica 有一个专门的聚合数据系统，称为 Metrage，它用于大多数报告。
自 2009 年起，Yandex.Metrica 还使用了一个名为 OLAPServer 的专用 OLAP 数据库来处理非聚合数据，该数据库以前用于报告生成器。
OLAPServer 对非聚合数据的处理效果很好，但存在许多限制，使其无法按预期用于所有报告。这些限制包括对数据类型（仅支持数字）的不支持，以及无法实时增量更新数据（只能通过每日重写数据来完成）。OLAPServer 不是一个 DBMS，而是一个专用数据库。

ClickHouse 的初始目标是消除 OLAPServer 的限制，并解决所有报告处理非聚合数据的问题，但随着时间的推移，它已发展成一个通用的数据库管理系统，适用于广泛的分析任务。
