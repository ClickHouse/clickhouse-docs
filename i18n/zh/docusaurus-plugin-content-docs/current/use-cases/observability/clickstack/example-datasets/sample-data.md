---
'slug': '/use-cases/observability/clickstack/getting-started/sample-data'
'title': '示例日志、跟踪和指标'
'sidebar_position': 0
'pagination_prev': null
'pagination_next': null
'description': '开始使用 ClickStack 和一个包含日志、会话、跟踪和指标的示例数据集'
'doc_type': 'guide'
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

以下示例假设您已按照 [一体化镜像的说明](/use-cases/observability/clickstack/getting-started) 启动 ClickStack，并连接到 [本地 ClickHouse 实例](/use-cases/observability/clickstack/getting-started#complete-connection-credentials) 或 [ClickHouse Cloud 实例](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。 

:::note HyperDX 在 ClickHouse Cloud
此示例数据集也可以与 ClickHouse Cloud 中的 HyperDX 一起使用，仅需对流程进行稍微调整。如使用 ClickHouse Cloud 中的 HyperDX，用户需要本地运行 Open Telemetry 收集器，如 [此部署模型的入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud) 中所述。
:::

<VerticalStepper>

## 导航至 HyperDX UI {#navigate-to-the-hyperdx-ui}

如果在本地部署，请访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX UI。如果在 ClickHouse Cloud 中使用 HyperDX，请从左侧菜单中选择您的服务和 `HyperDX`。

<Image img={hyperdx} alt="HyperDX UI" size="lg"/>

## 复制摄取 API 密钥 {#copy-ingestion-api-key}

:::note HyperDX 在 ClickHouse Cloud
如果在 ClickHouse Cloud 中使用 HyperDX，此步骤并不是必需的，因为目前不支持摄取密钥。
:::

导航至 [`Team Settings`](http://localhost:8080/team)，从 `API Keys` 部分复制 `Ingestion API Key`。此 API 密钥确保通过 OpenTelemetry 收集器的数据摄取是安全的。

<Image img={copy_api_key} alt="Copy API key" size="lg"/>

## 下载示例数据 {#download-sample-data}

为了用示例数据填充 UI，请下载以下文件：

[示例数据](https://storage.googleapis.com/hyperdx/sample.tar.gz)

```shell

# curl
curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz

# or

# wget https://storage.googleapis.com/hyperdx/sample.tar.gz
```

此文件包含我们的公共 [OpenTelemetry 演示](https://github.com/ClickHouse/opentelemetry-demo) 中的示例日志、指标和跟踪 - 一个简单的微服务电子商务商店。将此文件复制到您选择的目录中。

## 加载示例数据 {#load-sample-data}

要加载此数据，我们只需将其发送到已部署的 OpenTelemetry (OTel) 收集器的 HTTP 端点。

首先，导出上面复制的 API 密钥。

:::note HyperDX 在 ClickHouse Cloud
如果在 ClickHouse Cloud 中使用 HyperDX，此步骤并不是必需的，因为目前不支持摄取密钥。
:::

```shell

# export API key
export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
```

运行以下命令将数据发送至 OTel 收集器：

```shell
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

这模拟了 OTLP 日志、跟踪和指标源向 OTel 收集器发送数据。在生产环境中，这些源可以是语言客户端，甚至是其他 OTel 收集器。

返回到 `Search` 视图，您应该看到数据已开始加载（如果数据未呈现，请将时间范围调整为 `Last 1 hour`）：

<Image img={hyperdx_10} alt="HyperDX search" size="lg"/>

数据加载将需要几分钟。请等待加载完成后再进行下一步。

## 探索会话 {#explore-sessions}

假设我们收到报告，用户在支付商品时遇到问题。我们可以使用 HyperDX 的会话重放功能查看他们的体验。

从左侧菜单选择 [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000&to=1747312920000&sessionSource=l1324572572)。

<Image img={hyperdx_11} alt="Sessions" size="lg"/>

此视图允许我们查看电子商务商店的前端会话。会话在用户结账并尝试完成购买之前保持匿名。

请注意，一些带有电子邮件的会话有相关错误，可能确认了未完成交易的报告。

选择一个失败的跟踪和关联的电子邮件。随后视图允许我们重放用户的会话并审查他们的问题。按播放键观看会话。

<Image img={hyperdx_12} alt="Session replay" size="lg"/>

重放展示了用户浏览网站并将商品添加到购物车的过程。请随意跳到会话稍后的部分，他们尝试完成付款。

:::tip
任何错误在时间线上都以红色注释。
:::

用户无法下订单，没有明显的错误。向下滚动左侧面板，其中包含用户浏览器的网络和控制台事件。您会发现，在进行 `/api/checkout` 调用时抛出了一个 500 错误。

<Image img={hyperdx_13} alt="Error in session" size="lg"/>

选择此 `500` 错误。`Overview` 和 `Column Values` 皆未表明问题的根源，仅说明该错误是意外的，导致出现 `Internal Error`。

## 探索跟踪 {#explore-traces}

导航到 `Trace` 标签以查看完整的分布式跟踪。

<Image img={hyperdx_14} alt="Session trace" size="lg"/>

向下滚动跟踪以查看错误的来源 - `checkout` 服务范围。选择 `Payment` 服务范围。

<Image img={hyperdx_15} alt="Span" size="lg"/>

选择 `Column Values` 标签并向下滚动。我们可以看到问题与缓存已满有关。

<Image img={hyperdx_16} alt="Column values" size="lg"/>

向上滚动并返回到跟踪，我们可以看到日志与范围相关联，这要归功于我们之前的配置。这些日志提供了进一步的上下文。

<Image img={hyperdx_17} alt="Correlated log" size="lg"/>

我们已经确定在支付服务中缓存溢出，阻止了支付完成。

## 探索日志 {#explore-logs}

为了获得更多细节，我们可以返回到 [`Search` 视图](http://localhost:8080/search)：

从来源中选择 `Logs`，并对 `payment` 服务应用过滤器。

<Image img={hyperdx_18} alt="Logs" size="lg"/>

我们可以看到尽管问题很新，但受影响的支付数量却很高。此外，似乎与 Visa 支付相关的缓存出现了问题。

## 图表指标 {#chart-metrics}

虽然代码中显然引入了错误，但我们可以使用指标来确认缓存大小。导航到 `Chart Explorer` 视图。

选择 `Metrics` 作为数据源。完成图表构建器以绘制 `visa_validation_cache.size (Gauge)` 的 `Maximum`，然后按播放按钮。在达到最大大小之后，错误明显产生了。

<Image img={hyperdx_19} alt="Metrics" size="lg"/>

</VerticalStepper>
