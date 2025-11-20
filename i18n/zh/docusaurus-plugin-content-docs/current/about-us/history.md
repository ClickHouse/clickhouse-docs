---
slug: /about-us/history
sidebar_label: 'ClickHouse 历史'
sidebar_position: 40
description: 'ClickHouse 的开发历程'
keywords: ['history','development','Metrica']
title: 'ClickHouse 历史'
doc_type: 'reference'
---



# ClickHouse 历史 {#clickhouse-history}

ClickHouse 最初是为 [Yandex.Metrica](https://metrica.yandex.com/)（[全球第二大网络分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all)）开发的,并一直作为其核心组件。数据库中拥有超过 13 万亿条记录,每日处理超过 200 亿个事件,ClickHouse 能够直接从非聚合数据即时生成自定义报表。本文简要介绍了 ClickHouse 早期开发阶段的目标。

Yandex.Metrica 基于点击和会话即时构建自定义报表,支持用户定义任意细分维度。这通常需要构建复杂的聚合计算,例如独立用户数,而用于构建报表的新数据会实时到达。

截至 2014 年 4 月,Yandex.Metrica 每日跟踪约 120 亿个事件(页面浏览和点击)。所有这些事件都需要存储,以便构建自定义报表。单个查询可能需要在几百毫秒内扫描数百万行数据,或在几秒内扫描数亿行数据。


## 在 Yandex.Metrica 和其他 Yandex 服务中的应用 {#usage-in-yandex-metrica-and-other-yandex-services}

ClickHouse 在 Yandex.Metrica 中服务于多种用途。
其主要任务是使用非聚合数据实时构建报表。它使用一个由 374 台服务器组成的集群,数据库中存储超过 20.3 万亿行数据。压缩数据的容量约为 2 PB,不包括重复数据和副本。未压缩数据(TSV 格式)的容量约为 17 PB。

ClickHouse 还在以下流程中发挥关键作用:

- 存储 Yandex.Metrica 的 Session Replay 数据。
- 处理中间数据。
- 使用 Analytics 构建全局报表。
- 运行查询以调试 Yandex.Metrica 引擎。
- 分析 API 和用户界面的日志。

目前,在 Yandex 的其他服务和部门中有数十个 ClickHouse 部署实例:搜索垂直领域、电子商务、广告、业务分析、移动开发、个人服务等。


## 聚合数据与非聚合数据 {#aggregated-and-non-aggregated-data}

有一种普遍的观点认为,为了有效地计算统计信息,必须对数据进行聚合,因为这样可以减少数据量。

然而,数据聚合存在许多局限性:

- 您必须预先定义所需报表的列表。
- 用户无法创建自定义报表。
- 当对大量不同的键进行聚合时,数据量几乎没有减少,因此聚合毫无意义。
- 对于大量报表,存在过多的聚合变体(组合爆炸)。
- 当聚合高基数的键(例如 URL)时,数据量减少不多(不到两倍)。
- 因此,聚合后的数据量可能不减反增。
- 用户不会查看我们为他们生成的所有报表。这些计算中有很大一部分毫无用处。
- 对于各种聚合操作,数据的逻辑完整性可能会被破坏。

如果我们不进行任何聚合,而是直接使用非聚合数据,这可能会减少计算量。

然而,通过聚合,大部分工作可以离线完成,相对从容。相比之下,在线计算需要尽可能快地完成,因为用户正在等待结果。

Yandex.Metrica 拥有一个名为 Metrage 的专用数据聚合系统,用于大多数报表。
从 2009 年开始,Yandex.Metrica 还使用了一个名为 OLAPServer 的专用 OLAP 数据库来处理非聚合数据,该数据库之前用于报表构建器。
OLAPServer 在处理非聚合数据方面表现良好,但它存在许多限制,无法按需用于所有报表。这些限制包括缺乏对数据类型的支持(仅支持数字),以及无法实时增量更新数据(只能通过每天重写数据来完成)。OLAPServer 不是数据库管理系统(DBMS),而是一个专用数据库(DB)。

ClickHouse 的最初目标是消除 OLAPServer 的局限性,并解决所有报表处理非聚合数据的问题,但多年来,它已发展成为一个通用数据库管理系统,适用于广泛的分析任务。
