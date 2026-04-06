---
slug: /use-cases/observability/clickstack/service-maps
title: '服务地图'
sidebar_label: '服务地图'
pagination_prev: null
pagination_next: null
description: '借助 ClickStack 服务地图，将服务依赖关系和请求流可视化。'
doc_type: 'guide'
keywords: ['ClickStack', '服务地图', '拓扑', '追踪', '依赖', '分布式追踪', '可观测性', '请求图']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import service_map_overview from '@site/static/images/clickstack/service-maps/service-map-overview.png';
import service_map_demo from '@site/static/images/clickstack/service-maps/service-map-demo.mp4';
import source_selector from '@site/static/images/clickstack/service-maps/source-selector.png';
import sampling from '@site/static/images/clickstack/service-maps/sampling.png';
import date_selector from '@site/static/images/clickstack/service-maps/date-selector.png';

<BetaBadge />

服务地图用于直观展示各个服务之间的交互关系。ClickStack 通过在同一条追踪中匹配客户端 span (出站请求) 与服务器 span (入站请求) 来构建该图，从而还原服务之间的请求路径。

在左侧导航面板中点击 **Service Map**，即可打开完整图谱。开始使用 OpenTelemetry [摄取追踪数据](/use-cases/observability/clickstack/ingesting-data) 后，服务便会显示出来。

<Image img={service_map_overview} alt="显示服务节点及其之间请求流向的服务地图" size="lg" />

## 探索服务地图 \{#exploring-the-service-map\}

每个节点代表一个服务，由资源属性 `service.name` 标识。边 (虚线) 表示服务之间的连接：当一个服务中的客户端 span 与另一个服务中的服务器 span 相匹配时，这两个服务就会连接起来。节点大小反映相对流量，红色节点表示在所选时间范围内存在错误的服务。

地图上方的工具栏可用于筛选和调整视图。

**来源选择器** — 将地图筛选为特定的追踪来源 (例如“ClickPy Traces”) 。

<Image img={source_selector} alt="服务地图工具栏中高亮显示的来源选择器" size="lg" />

**采样滑块** — 调整采样率，以平衡性能和准确性。在高流量集群上，较低的采样率加载速度更快。

<Image img={sampling} alt="服务地图工具栏中高亮显示的采样滑块" size="lg" />

**时间范围选择器** — 设置用于构建地图的追踪数据时间窗口。

<Image img={date_selector} alt="服务地图工具栏中高亮显示的时间范围选择器" size="lg" />

使用地图左下角的 **+/-** 按钮，或滚动鼠标滚轮进行缩放。

## 追踪级服务地图 \{#trace-level-service-maps\}

查看单个追踪时，聚焦的服务地图会显示该请求在各个服务之间的流转路径。这样，您无需离开追踪瀑布图，即可查看单个请求的拓扑。

<video src={service_map_demo} autoPlay loop muted playsInline width="100%" />