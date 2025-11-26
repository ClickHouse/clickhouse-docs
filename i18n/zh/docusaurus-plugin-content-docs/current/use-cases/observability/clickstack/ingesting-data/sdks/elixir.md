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

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 链路追踪</td>
    </tr>
  </tbody>
</table>

_🚧 OpenTelemetry 指标和链路追踪支持即将推出！_

## 快速入门 {#getting-started}

### 安装 ClickStack Logger 后端包

可以通过在 `mix.exs` 中将 `hyperdx` 添加到依赖列表来安装该包：

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```


### 配置 Logger

在你的 `config.exs` 文件中添加以下配置：

```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```


### 配置环境变量

接下来，你需要在 shell 中配置以下环境变量，以将遥测数据发送到 ClickStack：

```shell
export HYPERDX_API_KEY='<您的摄取API密钥>' \
OTEL_SERVICE_NAME='<您的应用或服务名称>'
```

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，其值可以是任何你想要的名称。*
