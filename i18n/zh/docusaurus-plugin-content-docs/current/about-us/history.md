---
slug: /about-us/history
sidebar_label: 'ClickHouse 历史'
sidebar_position: 40
description: 'ClickHouse 的发展历程'
keywords: ['历史','开发','Metrica']
title: 'ClickHouse 历史'
doc_type: 'reference'
---

# ClickHouse 历史 \\{#clickhouse-history\\}

ClickHouse 最初是为支撑 [Yandex.Metrica](https://metrica.yandex.com/)、[全球第二大 Web 分析平台](http://w3techs.com/technologies/overview/traffic_analysis/all) 而开发的，并且至今仍是其核心组件。数据库中包含超过 13 万亿条记录，每天新增超过 200 亿个事件，ClickHouse 允许直接基于未聚合数据即时生成自定义报表。本文将简要介绍 ClickHouse 在早期开发阶段的目标。

Yandex.Metrica 会基于点击和会话按需生成自定义报表，用户可以定义任意细分条件。要做到这一点，通常需要构建复杂的聚合（例如计算唯一用户数），而用于生成报表的新数据会实时写入。

截至 2014 年 4 月，Yandex.Metrica 每天跟踪大约 120 亿个事件（页面浏览和点击）。为了构建自定义报表，所有这些事件都需要被存储。单个查询可能需要在几百毫秒内扫描数百万行，或者在几秒内扫描数亿行数据。

## 在 Yandex.Metrica 和其他 Yandex 服务中的使用 \\{#usage-in-yandex-metrica-and-other-yandex-services\\}

ClickHouse 在 Yandex.Metrica 中被用于多个场景。
其主要任务是使用未聚合的数据，以在线方式构建报表。它使用一个由 374 台服务器组成的集群，在数据库中存储了超过 20.3 万亿行数据。压缩后的数据量约为 2 PB，不包括重复和副本。未压缩的数据量（TSV 格式）大约为 17 PB。

ClickHouse 还在以下流程中发挥关键作用：

- 存储来自 Yandex.Metrica 的 Session Replay 数据。
- 处理中间数据。
- 使用 Analytics 构建全局报表。
- 运行查询以调试 Yandex.Metrica 引擎。
- 分析来自 API 和用户界面的日志。

目前，在其他 Yandex 服务和部门中也部署了数十个 ClickHouse 集群：搜索垂直业务、电子商务、广告、商业分析、移动开发、个人服务等。

## 聚合和非聚合数据 \\{#aggregated-and-non-aggregated-data\\}

有一种广泛流传的观点认为，要高效地进行统计计算，必须对数据进行聚合，因为这可以减少数据量。

然而，数据聚合也带来了诸多限制：

- 必须事先定义好所需报表的清单。
- 用户无法制作自定义报表。
- 当对大量不同取值的键进行聚合时，数据量几乎没有减少，因此聚合几乎没有意义。
- 对于数量众多的报表，聚合方式会非常多（组合爆炸）。
- 当对高基数键（例如 URL）进行聚合时，数据量减少得并不多（不足两倍）。
- 因此，启用聚合后，数据量甚至有可能不减反增。
- 用户并不会查看我们为他们生成的所有报表，其中很大一部分计算是无用的。
- 在不同的聚合方式下，数据的逻辑完整性可能会被破坏。

如果我们完全不做聚合，而是直接处理非聚合数据，在某些情况下可以减少计算量。

但是，在启用聚合时，大量工作可以被转移到离线阶段并相对从容地完成。相比之下，在线计算需要尽可能快地完成，因为用户正在等待结果。

Yandex.Metrica 有一个用于数据聚合的专用系统，称为 Metrage，大部分报表都曾基于它实现。
从 2009 年开始，Yandex.Metrica 还使用了一个用于非聚合数据的专用 OLAP 数据库，称为 OLAPServer，此前主要用于报表构建器。
OLAPServer 在处理非聚合数据方面表现良好，但存在许多限制，无法按预期用于所有报表。这些限制包括：不支持多种数据类型（仅支持数字），以及无法对数据进行实时增量更新（只能通过每日重写数据来完成）。OLAPServer 不是一个 DBMS，而是一个专用数据库。

ClickHouse 的初始目标是消除 OLAPServer 的这些限制，并解决在所有报表中处理非聚合数据的问题，但经过多年的发展，它已经成长为一个通用的数据库管理系统，适用于广泛的分析型任务。