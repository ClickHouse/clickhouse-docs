---
slug: /use-cases/observability/clickstack/dashboards/dashboard-templates
title: '仪表板模板'
sidebar_label: '仪表板模板'
pagination_prev: null
pagination_next: null
description: '在 ClickStack 中导入预置的仪表板模板'
doc_type: 'guide'
keywords: ['clickstack', '仪表板', '模板', '导入', '可观测性']
---

import Image from '@theme/IdealImage';
import browse_dashboard_template from '@site/static/images/use-cases/observability/browse-dashboard-template.png';
import dashboard_template_gallery from '@site/static/images/use-cases/observability/dashboard-template-gallery.png';
import import_dashboard_template from '@site/static/images/use-cases/observability/import-dashboard-template.png';

ClickStack 包含一个预置的仪表板模板库，可让您立即查看常见的基础设施和应用指标。

## 浏览可用模板 \{#browsing-templates\}

要浏览内置模板库，请前往 **仪表板**，然后点击 **浏览仪表板模板**。

<Image img={browse_dashboard_template} alt="浏览仪表板模板按钮" size="lg" />

这会打开模板库，模板按类别分类。点击 **导入**，开始导入该模板。

<Image img={dashboard_template_gallery} alt="仪表板模板库" size="lg" />

## 导入模板 \{#importing-a-template\}

要导入模板，必须为仪表板中的每个可视化项设置数据源。请在每个可视化项的下拉菜单中选择一个数据源，然后点击 `Finish Import`。

<Image img={import_dashboard_template} alt="仪表板模板导入" size="lg" />

## 预置模板 \{#pre-built-templates\}

### OTel 运行时指标 \{#otel-runtime-metrics\}

内置的 OTel 运行时指标模板专为接入了 [OpenTelemetry 运行时指标](https://opentelemetry.io/docs/specs/semconv/runtime/) 的应用设计。

| 模板                          | 说明                                       |
| --------------------------- | ---------------------------------------- |
| **.NET Runtime Metrics**    | .NET 应用的 GC 次数、堆大小、线程池使用情况和程序集数量         |
| **Go Runtime Metrics**      | Go 应用的 goroutine 数量、GC 暂停时间、堆使用情况和内存统计信息 |
| **JVM Runtime Metrics**     | 基于 JVM 的应用的堆内存与非堆内存、GC 持续时间、线程数和类加载情况    |
| **Node.js Runtime Metrics** | Node.js 应用的事件循环延迟、堆使用情况、CPU 利用率和 V8 内存   |

说明：

* 每个模板都配置了一个[自定义筛选器](./#custom-filters)，用于筛选其 [`telemetry.sdk.language`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/telemetry/#telemetry-sdk-language) 资源属性与仪表板对应运行时一致的服务。
  * 如果环境使用了自定义的 ClickHouse 指标表 schema，可能需要调整此筛选器，以查询正确的 Service Name 和 Resource Attributes 列。
  * 对于高流量环境，可通过将 `ResourceAttributes['telemetry.sdk.language']` 列[物化](../managing/performance_tuning.md#materialize-frequently-queried-attributes)来缩短筛选器加载时间。
* 模板在发布时引用的是最新的 OTel Semantic Conventions，并会随着 OTel Spec 的更新定期同步更新。对于使用较旧 OTel SDKs 接入的服务，可能需要[编辑](./#dashboards-editing-visualizations)可视化内容，以引用较旧的指标名称。