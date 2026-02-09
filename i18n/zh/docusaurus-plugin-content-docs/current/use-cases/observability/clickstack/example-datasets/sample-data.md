---
slug: /use-cases/observability/clickstack/getting-started/sample-data
title: '示例日志、链路追踪和指标'
sidebar_position: 0
pagination_prev: null
pagination_next: null
description: '开始使用 ClickStack，并使用包含日志、会话、链路追踪和指标的示例数据集'
doc_type: 'guide'
toc_max_heading_level: 2
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
import select_service from '@site/static/images/clickstack/select_service.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# ClickStack - 示例日志、追踪和指标 \{#clickstack-sample-dataset\}

本指南通过一个示例数据集演示 ClickStack 开源版和托管版的使用方式。

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="托管版 ClickStack" default>
    <VerticalStepper headerLevel="h3">
      以下指南假设您已完成[托管 ClickStack 入门指南](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)并已[记录连接凭据](/use-cases/observability/clickstack/getting-started/managed#next-steps)。

      ### 选择您的服务

      从 ClickHouse Cloud 主登录页面选择托管 ClickStack 服务。

      <Image img={select_service} alt="选择服务" size="lg" />

      ### 导航到 ClickStack UI (HyperDX)

      从左侧菜单中选择 `ClickStack`,导航至 ClickStack UI,系统将自动完成身份验证。

      <Image img={hyperdx} alt="ClickStack 用户界面" size="lg" />

      ### 下载示例数据

      为了在 UI 中填充示例数据,请下载以下文件:

      [示例数据](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      此文件包含来自我们公开的 [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo) 的示例日志、指标和追踪数据——这是一个包含微服务的简单电子商务应用。将此文件复制到您选择的目录中。

      ### 加载示例数据

      要加载此数据,只需将其发送到已部署的 OpenTelemetry (OTel) 收集器的 HTTP 端点。

      运行以下命令将数据发送到 OTel collector:

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

      这模拟了 OTLP 日志、跟踪和指标数据源向 OTel collector 发送数据。在生产环境中,这些数据源可能是各种语言的客户端,甚至是其他 OTel collector。

      返回到 `Search` 视图,您应该会看到数据已开始加载(如果数据未显示,请将时间范围调整为 `最近 1 小时`):

      <Image img={hyperdx_10} alt="HyperDX 搜索" size="lg" />

      数据加载需要几分钟时间。请等待加载完成后再进行后续步骤。

      ### 探索会话

      假设我们收到用户在支付商品时遇到问题的报告。我们可以使用 HyperDX 的会话回放功能来查看他们的使用体验。

      从左侧菜单中选择 `Client Sessions`。

      <Image img={hyperdx_11} alt="会话" size="lg" />

      此视图用于查看电子商务商店的前端会话。在用户结账并尝试完成购买之前,会话保持匿名状态。

      注意:部分包含电子邮件的会话存在关联错误,这可能证实了交易失败的相关报告。

      选择一个包含失败记录和关联电子邮件的追踪。在后续视图中,我们可以重放用户的会话并查看其问题。点击播放按钮以观看会话。

      <Image img={hyperdx_12} alt="会话回放" size="lg" />

      回放显示用户浏览网站并将商品添加到购物车。您可以直接跳转到会话后续部分,查看他们尝试完成支付的过程。

      :::tip
      时间线上的所有错误均以红色标注。
      :::

      用户无法下单,且未显示明显错误。向下滚动至左侧面板底部,该面板包含来自用户浏览器的网络和控制台事件。您会注意到在调用 `/api/checkout` 时抛出了 500 错误。

      <Image img={hyperdx_13} alt="会话中的错误" size="lg" />

      选择此 `500` 错误。`Overview` 和 `Column Values` 均未指出问题的来源,仅表明该错误是意外的,并导致了 `Internal Error`。

      ### 探索追踪

      导航至 `Trace` 选项卡以查看完整的分布式跟踪。

      <Image img={hyperdx_14} alt="会话跟踪" size="lg" />

      向下滚动追踪信息以查看错误的来源 - `checkout` 服务 span。选择 `Payment` 服务 span。

      <Image img={hyperdx_15} alt="Span" size="lg" />

      选择 `Column Values` 选项卡并向下滚动。可以看到该问题与缓存已满相关。

      <Image img={hyperdx_16} alt="列值" size="lg" />

      向上滚动并返回追踪视图,可以看到日志已与 span 关联,这得益于我们之前的配置。这些日志提供了更多上下文。

      <Image img={hyperdx_17} alt="关联日志" size="lg" />

      我们已确定支付服务中的缓存已被填满,导致支付无法完成。

      ### 浏览日志

      如需了解更多详细信息,可以返回到 `Search`:

      从数据源中选择 `Logs`,并对 `payment` 服务应用筛选条件。

      <Image img={hyperdx_18} alt="日志" size="lg" />

      可以看到,虽然该问题是最近才出现的,但受影响的支付数量较多。此外,与 Visa 支付相关的缓存似乎正在引发问题。

      ### 图表指标

      虽然代码中明显引入了错误,但我们可以使用指标来确认缓存大小。导航至 `Chart Explorer` 视图。

      选择 `Metrics` 作为数据源。在图表构建器中配置绘制 `visa_validation_cache.size (Gauge)` 的 `Maximum` 值,然后点击播放按钮。可以清楚地看到,缓存在达到最大容量之前持续增长,达到上限后开始产生错误。

      <Image img={hyperdx_19} alt="指标" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 开源版">
    以下示例假设您已按照[一体化镜像的说明](/use-cases/observability/clickstack/getting-started/oss)启动开源 ClickStack,并已连接到[本地 ClickHouse 实例](/use-cases/observability/clickstack/getting-started/oss#complete-connection-credentials)。

    <VerticalStepper headerLevel="h3">
      ### 导航到 ClickStack UI (HyperDX)

      访问 [http://localhost:8080](http://localhost:8080) 以访问 ClickStack UI。

      <Image img={hyperdx} alt="ClickStack 用户界面" size="lg" />

      ### 复制摄取 API key

      导航至 [`Team Settings`](http://localhost:8080/team) 并从 `API Keys` 部分复制 `Ingestion API Key`。此 API key 可确保通过 OpenTelemetry collector 进行的数据摄取安全可靠。

      <Image img={copy_api_key} alt="复制 API 密钥" size="lg" />

      ### 下载示例数据

      为了在 UI 中填充示例数据,请下载以下文件:

      [示例数据](https://storage.googleapis.com/hyperdx/sample.tar.gz)

      ```shell
      # curl
      curl -O https://storage.googleapis.com/hyperdx/sample.tar.gz
      # or
      # wget https://storage.googleapis.com/hyperdx/sample.tar.gz
      ```

      此文件包含来自我们公开的 [OpenTelemetry demo](https://github.com/ClickHouse/opentelemetry-demo) 的示例日志、指标和追踪数据——这是一个包含微服务的简单电子商务应用。将此文件复制到您选择的目录中。

      ### 加载示例数据

      要加载此数据,只需将其发送到已部署的 OpenTelemetry (OTel) 收集器的 HTTP 端点。

      首先,导出上面复制的 API 密钥。

      ```shell
      # export API key
      export CLICKSTACK_API_KEY=<YOUR_INGESTION_API_KEY>
      ```

      运行以下命令将数据发送到 OTel collector:

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

      这模拟了 OTLP 日志、跟踪和指标数据源向 OTel collector 发送数据。在生产环境中,这些数据源可能是各种语言的客户端,甚至是其他 OTel collector。

      返回到 `Search` 视图,您应该会看到数据已开始加载(如果数据未显示,请将时间范围调整为 `最近 1 小时`):

      <Image img={hyperdx_10} alt="HyperDX 搜索界面" size="lg" />

      数据加载需要几分钟时间。请等待加载完成后再进行后续步骤。

      ### 探索会话

      假设我们收到用户在支付商品时遇到问题的报告。我们可以使用 HyperDX 的会话回放功能来查看他们的使用体验。

      从左侧菜单选择 [`Client Sessions`](http://localhost:8080/sessions?from=1747312320000\&to=1747312920000\&sessionSource=l1324572572)。

      <Image img={hyperdx_11} alt="会话" size="lg" />

      此视图用于查看电子商务商店的前端会话。在用户结账并尝试完成购买之前,会话保持匿名状态。

      注意:部分包含电子邮件的会话存在关联错误,这可能证实了交易失败的相关报告。

      选择一个包含失败记录和关联电子邮件的追踪。在后续视图中,我们可以重放用户的会话并查看其问题。点击播放按钮以观看会话。

      <Image img={hyperdx_12} alt="会话回放" size="lg" />

      回放显示用户浏览网站并将商品添加到购物车。您可以直接跳转到会话后续部分,查看他们尝试完成支付的过程。

      :::tip
      时间线上的所有错误均以红色标注。
      :::

      用户无法下单,且未显示明显错误。向下滚动至左侧面板底部,该面板包含来自用户浏览器的网络和控制台事件。您会注意到在调用 `/api/checkout` 时抛出了 500 错误。

      <Image img={hyperdx_13} alt="会话错误" size="lg" />

      选择此 `500` 错误。`Overview` 和 `Column Values` 均未指出问题的来源,仅表明该错误是意外的,并导致了 `Internal Error`。

      ### 探索追踪

      导航至 `Trace` 选项卡以查看完整的分布式跟踪。

      <Image img={hyperdx_14} alt="会话跟踪" size="lg" />

      向下滚动追踪信息以查看错误的来源 - `checkout` 服务 span。选择 `Payment` 服务 span。

      <Image img={hyperdx_15} alt="Span" size="lg" />

      选择 `Column Values` 选项卡并向下滚动。可以看到该问题与缓存已满相关。

      <Image img={hyperdx_16} alt="列值" size="lg" />

      向上滚动并返回追踪视图,可以看到日志已与 span 关联,这得益于我们之前的配置。这些日志提供了更多上下文。

      <Image img={hyperdx_17} alt="关联日志" size="lg" />

      我们已确定支付服务中的缓存已被填满,导致支付无法完成。

      ### 浏览日志

      如需了解更多详细信息,我们可以返回 [`Search` 视图](http://localhost:8080/search):

      从数据源中选择 `Logs`,并对 `payment` 服务应用筛选条件。

      <Image img={hyperdx_18} alt="日志" size="lg" />

      可以看到,虽然该问题是最近才出现的,但受影响的支付数量较多。此外,与 Visa 支付相关的缓存似乎正在引发问题。

      ### 图表指标

      虽然代码中明显引入了错误,但我们可以使用指标来确认缓存大小。导航至 `Chart Explorer` 视图。

      选择 `Metrics` 作为数据源。在图表构建器中配置绘制 `visa_validation_cache.size (Gauge)` 的 `Maximum` 值,然后点击播放按钮。可以清楚地看到,缓存在达到最大容量之前持续增长,达到上限后开始产生错误。

      <Image img={hyperdx_19} alt="指标" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>