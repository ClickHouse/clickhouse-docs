---
'slug': '/use-cases/observability/clickstack/getting-started/sample-data'
'title': '示例日志、跟踪和指标'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': null
'description': '开始使用 ClickStack 和一个包含日志、会话、跟踪和指标的示例数据集'
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


# ClickStack - 示例日志、跟踪和指标 {#clickstack-sample-dataset}

以下示例假设您已经使用 [全功能图像的说明](/use-cases/observability/clickstack/getting-started) 启动了 ClickStack，并连接到 [本地 ClickHouse 实例](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) 或 [ClickHouse Cloud 实例](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

<VerticalStepper>

## 导航到 HyperDX UI {#navigate-to-the-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## 复制摄取 API 密钥 {#copy-ingestion-api-key}

导航到 [`团队设置`](http://localhost:8080/team) 并从 `API 密钥` 部分复制 `摄取 API 密钥`。此 API 密钥确保通过 OpenTelemetry 收集器进行数据摄取的安全性。

<Image img={copy_api_key} alt="Copy API key" size="lg"/>

## 下载示例数据 {#download-sample-data}

为了用示例数据填充 UI，请下载以下文件：

[示例数据](https://storage.googleapis.com/hyperdx/sample.tar.gz)

```bash

# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz

# or

# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

此文件包含来自我们公共 [OpenTelemetry 演示](http://example.com) 的示例日志、指标和跟踪——一个简单的微服务电子商务商店。将此文件复制到您选择的目录中。

## 加载示例数据 {#load-sample-data}

要加载这些数据，我们只需将其发送到已部署的 OpenTelemetry (OTel) 收集器的 HTTP 端点。

首先，导出上面复制的 API 密钥。

```bash

# export API key
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

运行以下命令将数据发送到 OTel 收集器：

```bash
for filename in $(tar -tf sample.tar.gz); do
  endpoint="http://localhost:4318/v1/${filename%.json}"
  echo "loading ${filename%.json}"
  tar -xOf sample.tar.gz "$filename" | while read -r line; do
    echo "$line" | curl -s -o /dev/null -X POST "$endpoint" \
    -H "Content-Type: application/json" \
    -H "authorization: ${CLICKSTACK_API_KEY}" \
    --data-binary @-
  done
done
```

这模拟了 OLTP 日志、跟踪和指标源将数据发送到 OTel 收集器。在生产环境中，这些源可能是语言客户端，甚至是其他 OTel 收集器。

返回到 `搜索` 视图，您应该看到数据已经开始加载：

<Image img={hyperdx_10} alt="HyperDX search" size="lg"/>

数据加载将需要几分钟。在继续执行下一步之前，请确保加载已完成。

## 探索会话 {#explore-sessions}

假设我们收到报告，用户在支付商品时遇到问题。我们可以使用 HyperDX 的会话回放功能查看他们的体验。

从左侧菜单中选择 [`客户端会话`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)。

<Image img={hyperdx_11} alt="Sessions" size="lg"/>

此视图允许我们查看电子商务商店的前端会话。在用户结账并尝试完成购买之前，会话保持匿名。

请注意，某些包含电子邮件的会话有一个关联的错误，可能确认了交易失败的报告。

选择一个有故障和相关电子邮件的跟踪。随后的视图允许我们回放用户的会话并查看他们的问题。按播放观看会话。

<Image img={hyperdx_12} alt="Session replay" size="lg"/>

回放显示用户浏览网站、将商品添加到购物车。可以自由跳到会话后期，他们尝试完成支付。

:::tip
任何错误都在时间轴上用红色标记。
:::

用户无法下订单，没有明显的错误。向下滚动到左侧面板的底部，查看用户浏览器中的网络和控制台事件。您会注意到在进行 `/api/checkout` 调用时出现了 500 错误。

<Image img={hyperdx_13} alt="Error in session" size="lg"/>

选择此 `500` 错误。`概览` 和 `列值` 都没有指示问题的来源，除了这个错误是意料之外的，导致了 `内部错误`。

## 探索跟踪 {#explore-traces}

导航到 `跟踪` 标签以查看完整的分布式跟踪。

<Image img={hyperdx_14} alt="Session trace" size="lg"/>

向下滚动跟踪以查看错误的来源——`checkout` 服务跨度。选择 `Payment` 服务跨度。

<Image img={hyperdx_15} alt="Span" size="lg"/>

选择 `列值` 标签并向下滚动。我们可以看到问题与缓存满有关。

<Image img={hyperdx_16} alt="Column values" size="lg"/>

向上滚动并返回到跟踪，我们可以看到日志与跨度有关联，这得益于之前的配置。这些提供了进一步的背景。

<Image img={hyperdx_17} alt="Correlated log" size="lg"/>

我们已确定在支付服务中缓存正在被填满，这阻止了支付的完成。

## 探索日志 {#explore-logs}

有关更多详细信息，我们可以返回到 [`搜索` 视图](http://localhost:8080/search)：

从源中选择 `日志` 并应用到 `payment` 服务的过滤器。

<Image img={hyperdx_18} alt="Logs" size="lg"/>

我们可以看到尽管问题较新，但受影响的支付数量很高。此外，与 visa 支付相关的缓存似乎正在造成问题。

## 图表指标 {#chart-metrics}

尽管代码中显然引入了错误，但我们可以使用指标确认缓存的大小。导航到 `图表浏览器` 视图。

选择 `指标` 作为数据源。完成图表构建器以绘制 `visa_validation_cache.size (Gauge)` 的 `最大值` 并按播放按钮。缓存显然在达到最大大小之前不断增加，之后生成了错误。

<Image img={hyperdx_19} alt="Metrics" size="lg"/>

</VerticalStepper>
