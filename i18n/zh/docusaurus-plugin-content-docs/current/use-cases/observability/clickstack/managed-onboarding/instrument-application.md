---
slug: /use-cases/observability/clickstack/instrument-application
title: '为应用程序添加插桩'
description: '使用 OpenTelemetry 为 Node.js 应用程序添加插桩，并将其日志、指标和链路追踪发送到托管 ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'instrumentation', 'opentelemetry', 'managed', 'observability', 'sdk', 'nodejs']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import InstrumentApplication from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

本指南介绍如何使用 OpenTelemetry 为一个小型 Node.js 应用进行插桩，并将其日志、指标和链路追踪发送到托管 ClickStack。后端无需修改应用源代码即可完成插桩。

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) 是一个 Node.js 应用，用于查询托管在 ClickHouse 公开演示环境中的 HackerNews 数据集。每个图表、表和搜索框背后都对应一条真实的 ClickHouse 查询，因此每次交互都会生成一条 trace，其主 span 就是后端发往 ClickHouse 的 HTTPS 调用。

本指南假设你已经完成了[设置 OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)，并且已有一个正在运行的 ClickStack collector，且你运行此应用的机器可以访问到它。**请确保你已记录其 OTLP 端点**以及你在部署时设置的 `OTLP_AUTH_TOKEN`。

## 前置条件 \{#prerequisites\}

* 此机器可访问的 ClickStack collector。如果你还未部署，请先参照[设置你的 OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)。
* 该 collector 的 OTLP 端点，以及你为其设置的 `OTLP_AUTH_TOKEN`。
* Node 18+ 和 npm。

<InstrumentApplication />

## 延伸阅读 \{#further-reading\}

* [监控 Kubernetes](/use-cases/observability/clickstack/monitoring-kubernetes)：从集群中收集日志、基础设施指标和 Kubernetes 事件。
* [监控 AWS CloudWatch 日志](/use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs)：通过 OpenTelemetry CloudWatch receiver 转发 CloudWatch 日志。
* [会话回放](/use-cases/observability/clickstack/session-replay)：功能概览、SDK 选项和隐私控制。
* [生产环境部署](/use-cases/observability/clickstack/production)：了解进入生产环境时的相关建议。