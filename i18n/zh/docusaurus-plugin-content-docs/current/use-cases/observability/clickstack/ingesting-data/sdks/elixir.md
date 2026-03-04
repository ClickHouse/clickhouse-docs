---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: '适用于 ClickStack 的 Elixir SDK - ClickHouse 可观测性栈'
title: 'Elixir'
doc_type: 'guide'
keywords: ['Elixir ClickStack SDK', 'Elixir observability', 'HyperDX Elixir', 'Elixir logging SDK', 'ClickStack Elixir integration']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 链路追踪</td>
    </tr>
  </tbody>
</table>

*🚧 OpenTelemetry 指标和链路追踪支持即将推出！*

## 快速入门 \{#getting-started\}

### 安装 ClickStack Logger 后端包 \{#install-hyperdx-logger-backend-package\}

可以通过在 `mix.exs` 中将 `hyperdx` 添加到依赖列表来安装该包：

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### 配置 Logger \{#configure-logger\}

在你的 `config.exs` 文件中添加以下配置：

```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 配置环境变量 \{#configure-environment-variables\}

接下来，你需要在 shell 中配置以下环境变量，以通过 OpenTelemetry collector 将遥测数据发送到 ClickStack：

<Tabs groupId="service-type">
  <TabItem value="clickstack-managed" label="托管 ClickStack" default>
    ```shell
    OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
    ```
  </TabItem>

  <TabItem value="clickstack-oss" label="ClickStack 开源版">
    ```shell
    export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
    OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
    ```
  </TabItem>
</Tabs>

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，其值可以是任何你想要的名称。*