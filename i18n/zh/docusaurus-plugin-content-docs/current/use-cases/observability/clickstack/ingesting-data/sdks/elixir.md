---
'slug': '/use-cases/observability/clickstack/sdks/elixir'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'Elixir SDK 用于 ClickStack - ClickHouse 观察性堆栈'
'title': 'Elixir'
---

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ 日志</td>
      <td className="pe-2">✖️ 指标</td>
      <td className="pe-2">✖️ 跟踪</td>
    </tr>
  </tbody>
</table>
_🚧 OpenTelemetry 指标和跟踪工具即将推出！_

## 开始使用 {#getting-started}

### 安装 ClickStack 日志记录后端包 {#install-hyperdx-logger-backend-package}

通过在 `mix.exs` 中将 `hyperdx` 添加到你的依赖列表，可以安装该包：

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### 配置日志记录器 {#configure-logger}

在你的 `config.exs` 文件中添加以下内容：

```elixir

# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 配置环境变量 {#configure-environment-variables}

随后你需要在你的 shell 中配置以下环境变量，以将遥测数据发送到 ClickStack：

```bash
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中识别你的服务，它可以是你想要的任何名称。_
