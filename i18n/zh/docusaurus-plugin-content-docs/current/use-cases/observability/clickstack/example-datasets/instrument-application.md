---
slug: /use-cases/observability/clickstack/example-datasets/instrument-app
title: '使用托管 ClickStack 对应用进行插桩'
sidebar_label: 'HackerNews Analyzer 演示'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: '使用 OpenTelemetry 对 Node.js 应用进行插桩，并将日志、指标和链路追踪发送到托管 ClickStack 的指南'
doc_type: 'guide'
keywords: ['clickstack', '插桩', 'OpenTelemetry', '托管 ClickStack', '可观测性']
---

import InstrumentApplication from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

本指南介绍如何使用 OpenTelemetry 为一个简单的 Node.js 应用添加插桩，并将其日志、指标和链路追踪发送到[托管 ClickStack](/use-cases/observability/clickstack/getting-started/managed)。后端的插桩无需对应用程序源代码做任何改动。

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) 是一个小型 Node.js 应用，用于查询托管在公共 ClickHouse 演示实例中的 HackerNews 数据集。每个图表、表和搜索框背后都对应一条真实的 ClickHouse 查询，因此每次交互都会生成一个 trace，其主 span 是后端向 ClickHouse 发起的 HTTPS 调用。

## 前置条件 \{#prerequisites\}

* 有一个可用且可访问的 OTel collector，并将数据摄取到您的托管 ClickStack 服务中。您需要它的 OTLP 端点和摄取令牌。
* Node 18+ 和 npm。

<InstrumentApplication />

## 了解更多 \{#learn-more\}

* [会话回放](/use-cases/observability/clickstack/session-replay)：功能概述、SDK 选项和隐私控制。
* [会话回放演示](/use-cases/observability/clickstack/example-datasets/session-replay-demo)：一个基于本地 ClickStack 实例的完整演示。
* [ClickStack 入门](/use-cases/observability/clickstack/getting-started)：部署 ClickStack 并摄取第一批数据。
* [所有示例数据集](/use-cases/observability/clickstack/sample-datasets)：其他示例数据集和相关指南。