---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: '示例日志、跟踪和指标'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: 'ClickStack 入门：使用包含日志、会话、跟踪和指标的示例数据集'
doc_type: 'guide'
keywords: ['clickstack', '示例数据', '示例数据集', '日志', '可观测性']
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


# ClickStack - 示例日志、追踪和指标 {#clickstack-sample-dataset}

以下示例假设您已按照[一体化镜像的说明](/use-cases/observability/clickstack/getting-started)启动 ClickStack,并已连接到[本地 ClickHouse 实例](/use-cases/observability/clickstack/getting-started#complete-connection-credentials)或 [ClickHouse Cloud 实例](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

:::note ClickHouse Cloud 中的 HyperDX
此示例数据集也可与 ClickHouse Cloud 中的 HyperDX 配合使用,仅需对流程进行少量调整。如果在 ClickHouse Cloud 中使用 HyperDX,用户需要在本地运行 OpenTelemetry 收集器,具体说明请参见[此部署模式的入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)。
:::

<VerticalStepper>


## 访问 HyperDX 界面 {#navigate-to-the-hyperdx-ui}

如果是本地部署,请访问 [http://localhost:8080](http://localhost:8080) 来访问 HyperDX 界面。如果在 ClickHouse Cloud 中使用 HyperDX,请从左侧菜单中选择您的服务和 `HyperDX`。

<Image img={hyperdx} alt='HyperDX 界面' size='lg' />


## 复制数据摄取 API 密钥 {#copy-ingestion-api-key}

:::note ClickHouse Cloud 中的 HyperDX
如果在 ClickHouse Cloud 中使用 HyperDX,则无需执行此步骤,因为目前不支持摄取密钥。
:::

导航至 [`Team Settings`](http://localhost:8080/team),从 `API Keys` 部分复制 `Ingestion API Key`。此 API 密钥可确保通过 OpenTelemetry 采集器进行的数据摄取安全可靠。

<Image img={copy_api_key} alt='复制 API 密钥' size='lg' />


## 下载示例数据 {#download-sample-data}

要在界面中加载示例数据,请下载以下文件:

[示例数据](https://storage.googleapis.com/hyperdx/sample.tar.gz)


```shell
# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
# 或
# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

此文件包含来自我们公共 [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo) 的示例日志、指标和追踪数据——一个采用微服务架构的简单电商商店。将此文件复制到你选择的任意目录中。


## 加载示例数据 {#load-sample-data}

要加载此数据,只需将其发送到已部署的 OpenTelemetry (OTel) 收集器的 HTTP 端点即可。

首先,导出上面复制的 API 密钥。

:::note ClickHouse Cloud 中的 HyperDX
如果在 ClickHouse Cloud 中使用 HyperDX,则无需执行此步骤,因为目前尚不支持摄取密钥。
:::


```shell
# 导出 API 密钥
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

运行以下命令，将数据发送到 OTel 收集器：

```shell
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "正在加载 ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    printf '%s\n' "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

这将模拟 OTLP 日志、追踪和指标数据源向 OTel 收集器发送数据。在生产环境中，这些数据源可能是各种语言的客户端，甚至是其他 OTel 收集器。

返回到 `Search` 视图后，你应该能看到数据已经开始加载（如果没有显示数据，请将时间范围调整为 `Last 1 hour`）：

<Image img={hyperdx_10} alt="HyperDX search" size="lg" />

数据加载需要几分钟时间。在继续下一步之前，请等待加载完成。


## 探索会话 {#explore-sessions}

假设我们收到用户在支付商品时遇到问题的报告。我们可以使用 HyperDX 的会话回放功能来查看他们的体验。

从左侧菜单中选择 [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)。

<Image img={hyperdx_11} alt='会话' size='lg' />

此视图允许我们查看电子商务商店的前端会话。在用户结账并尝试完成购买之前,会话保持匿名状态。

请注意,一些带有电子邮件的会话存在关联错误,这可能证实了交易失败的报告。

选择一个带有失败状态和关联电子邮件的跟踪记录。后续视图允许我们回放用户的会话并查看他们遇到的问题。点击播放按钮观看会话。

<Image img={hyperdx_12} alt='会话回放' size='lg' />

回放显示用户浏览网站并将商品添加到购物车。您可以直接跳到会话后面用户尝试完成支付的部分。

:::tip
任何错误都会在时间轴上用红色标注。
:::

用户无法下订单,且没有明显的错误提示。滚动到左侧面板底部,其中包含来自用户浏览器的网络和控制台事件。您会注意到在调用 `/api/checkout` 时抛出了 500 错误。

<Image img={hyperdx_13} alt='会话中的错误' size='lg' />

选择此 `500` 错误。`Overview` 和 `Column Values` 都没有指出问题的来源,只是表明该错误是意外的,导致了 `Internal Error`。


## 探索追踪 {#explore-traces}

导航到 `Trace` 选项卡以查看完整的分布式追踪。

<Image img={hyperdx_14} alt='会话追踪' size='lg' />

向下滚动追踪以查看错误的来源 - `checkout` 服务 span。选择 `Payment` 服务 span。

<Image img={hyperdx_15} alt='Span' size='lg' />

选择 `Column Values` 选项卡并向下滚动。可以看到该问题与缓存已满有关。

<Image img={hyperdx_16} alt='列值' size='lg' />

向上滚动并返回到追踪,可以看到日志与 span 相关联,这得益于我们之前的配置。这些日志提供了进一步的上下文信息。

<Image img={hyperdx_17} alt='关联日志' size='lg' />

我们已经确定支付服务中的缓存正在被填满,导致支付无法完成。


## 探索日志 {#explore-logs}

要查看更多详细信息,可以返回到 [`Search` 视图](http://localhost:8080/search):

从数据源中选择 `Logs`,并对 `payment` 服务应用过滤器。

<Image img={hyperdx_18} alt='日志' size='lg' />

可以看到,虽然该问题是最近才出现的,但受影响的支付数量较多。此外,与 Visa 支付相关的缓存似乎是导致问题的原因。


## 图表指标 {#chart-metrics}

虽然代码中明显引入了错误,但我们可以使用指标来确认缓存大小。导航到 `Chart Explorer` 视图。

选择 `Metrics` 作为数据源。完成图表构建器以绘制 `visa_validation_cache.size (Gauge)` 的 `Maximum` 值,然后按播放按钮。缓存在达到最大值之前明显持续增长,之后开始生成错误。

<Image img={hyperdx_19} alt='指标' size='lg' />

</VerticalStepper>
