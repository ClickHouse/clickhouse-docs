---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: '示例日志、追踪和指标'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 和含有日志、会话、追踪与指标的示例数据集快速入门'
doc_type: 'guide'
keywords: ['clickstack', '示例数据', '样本数据集', '日志', '可观测性']
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_5 from '@site/static/images/use-cases/observability/hyperdx-5.png';
import hyperdx_6 from '@site/static/images/use-cases/observability/hyperdx-6.png';
import hyperdx_7 from '@site/static/images/use-cases/observability/hyperdx-7.png';
import hyperdx_8 from '@site/static/images/use-cases/observability/hyperdx-8.png';
import hyperdx_9 from '@site/static/images/use-cases/observability/hyperdx-9.png';
import hyperdx_10 from '@site/static/images/use-cases/observability/hyperdx-10.png';
import hyperdx_11 from '@site/static/images/use-cases/observability/hyperdx-11.png';
import hyperdx_12 from '@site/static/images/use-cases/observability/hyperdx-12.png';
import hyperdx_13 from '@site/static/images/use-cases/observability/hyperdx-13.png';
import hyperdx_14 from '@site/static/images/use-cases/observability/hyperdx-14.png';
import hyperdx_15 from '@site/static/images/use-cases/observability/hyperdx-15.png';
import hyperdx_16 from '@site/static/images/use-cases/observability/hyperdx-16.png';
import hyperdx_17 from '@site/static/images/use-cases/observability/hyperdx-17.png';
import hyperdx_18 from '@site/static/images/use-cases/observability/hyperdx-18.png';
import hyperdx_19 from '@site/static/images/use-cases/observability/hyperdx-19.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';


# ClickStack - 日志、追踪和指标示例 {#clickstack-sample-dataset}

以下示例假定您已按照[一体化镜像的说明](/use-cases/observability/clickstack/getting-started)启动 ClickStack,并已连接到[本地 ClickHouse 实例](/use-cases/observability/clickstack/getting-started#complete-connection-credentials)或 [ClickHouse Cloud 实例](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

:::note ClickHouse Cloud 中的 HyperDX
此示例数据集也可与 ClickHouse Cloud 中的 HyperDX 配合使用,仅需对流程进行少量调整(如下文所述)。如果在 ClickHouse Cloud 中使用 HyperDX,用户需要在本地运行 OpenTelemetry 收集器,具体说明请参阅[此部署模型的入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)。
:::

<VerticalStepper>


## 进入 HyperDX UI {#navigate-to-the-hyperdx-ui}

本地部署时，请访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。若在 ClickHouse Cloud 中使用 HyperDX，请在左侧菜单中选择对应服务并点击 `HyperDX`。

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>



## 复制摄取 API key {#copy-ingestion-api-key}

:::note ClickHouse Cloud 中的 HyperDX
如果在 ClickHouse Cloud 中使用 HyperDX，则不需要此步骤，因为当前尚不支持摄取 API key。
:::

导航到 [`Team Settings`](http://localhost:8080/team)，并从 `API Keys` 部分复制 `Ingestion API Key`。该 API key 可确保通过 OpenTelemetry collector 摄取的数据是安全的。

<Image img={copy_api_key} alt="复制 API key" size="lg"/>



## 下载示例数据 {#download-sample-data}

为了在 UI 中展示示例数据，请下载以下文件：

[示例数据](https://storage.googleapis.com/hyperdx/sample.tar.gz)



```shell
# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# 或
# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

此文件包含我们公开的 [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo)（一个由微服务构成的简单电商商店）中的示例日志、指标和追踪数据。将此文件复制到任意你选择的目录中。


## 加载示例数据 {#load-sample-data}

要加载这些数据，我们只需将其发送到已部署的 OpenTelemetry (OTel) 采集器的 HTTP 端点。

首先，导出你在上面复制的 API 密钥。

:::note ClickHouse Cloud 中的 HyperDX
如果使用的是 ClickHouse Cloud 中的 HyperDX，则不需要此步骤，因为其中目前尚不支持摄取密钥。
:::



```shell
# 导出 API 密钥
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

运行以下命令，将数据发送到 OTel collector：

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

这将模拟 OTLP 日志、追踪和指标数据源向 OTel collector 发送数据。在生产环境中，这些数据源可能是各类语言的客户端，甚至是其他 OTel collector。

返回到 `Search` 视图，你应该会看到数据已经开始加载（如果数据没有显示，请将时间范围调整为 `Last 1 hour`）：

<Image img={hyperdx_10} alt="HyperDX 搜索" size="lg" />

数据加载需要几分钟时间。请等待加载完成后再继续下一步操作。


## 浏览会话 {#explore-sessions}

假设我们收到报告称用户在为商品付款时遇到问题。我们可以使用 HyperDX 的会话回放功能查看他们的实际体验。 

在左侧菜单中选择 [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)。

<Image img={hyperdx_11} alt="会话" size="lg"/>

此视图允许我们查看电商商城的前端会话。在用户结账并尝试完成购买之前，会话会保持匿名状态。

请注意，一些带有邮箱的会话关联了错误，可能印证了交易失败的报告。

选择一个失败且关联了邮箱的 trace。接下来的视图允许我们回放该用户的会话并审查他们遇到的问题。点击播放以观看会话。

<Image img={hyperdx_12} alt="会话回放" size="lg"/>

回放会显示用户浏览站点并将商品加入购物车的过程。你可以直接跳到会话后半段，在他们尝试完成支付的时间点查看。

:::tip
任何错误都会以红色标注在时间轴上。 
:::

用户未能成功下单，而且没有明显错误提示。在左侧面板中向下滚动至底部，该面板包含来自用户浏览器的网络与控制台事件。你会注意到在发起 `/api/checkout` 调用时抛出了一个 500 错误。 

<Image img={hyperdx_13} alt="会话中的错误" size="lg"/>

选择这个 `500` 错误。`Overview` 和 `Column Values` 中都没有指明问题的根源，只能看到该错误是意外发生的，并导致了 `Internal Error`。



## 浏览 traces {#explore-traces}

导航到 `Trace` 选项卡以查看完整的分布式 trace。 

<Image img={hyperdx_14} alt="Session trace" size="lg"/>

向下滚动该 trace，找到错误的来源——`checkout` 服务的 span。选择 `Payment` 服务的 span。 

<Image img={hyperdx_15} alt="Span" size="lg"/>

选择 `Column Values` 选项卡并向下滚动。我们可以看到问题与缓存已满有关。

<Image img={hyperdx_16} alt="Column values" size="lg"/>

向上滚动回到该 trace，我们可以看到日志已根据之前的配置与该 span 关联，从而提供了更多上下文信息。

<Image img={hyperdx_17} alt="Correlated log" size="lg"/>

我们已经确认，在 payment 服务中有一个缓存被填满，导致支付无法完成。 



## 查看日志 {#explore-logs}

要了解更多详情，我们可以回到 [`Search` 视图](http://localhost:8080/search)：

在来源中选择 `Logs`，并对 `payment` 服务添加筛选条件。

<Image img={hyperdx_18} alt="Logs" size="lg"/>

我们可以看到，虽然问题是最近才出现的，但受影响的支付笔数很多。此外，与 Visa 支付相关的缓存似乎正在导致问题。



## 图表指标 {#chart-metrics}

虽然代码中明显引入了错误,我们可以使用指标来确认缓存大小。导航至 `Chart Explorer` 视图。

选择 `Metrics` 作为数据源。完成图表构建器配置,绘制 `visa_validation_cache.size (Gauge)` 的 `Maximum` 值,然后点击播放按钮。可以看到缓存在达到最大值之前持续增长,达到上限后开始产生错误。

<Image img={hyperdx_19} alt='指标' size='lg' />

</VerticalStepper>
