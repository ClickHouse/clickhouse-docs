---
'slug': '/use-cases/observability/clickstack/sdks/elixir'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'Elixir SDK 用于 ClickStack - ClickHouse 可观察性堆栈'
'title': 'Elixir'
'doc_type': 'guide'
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
_🚧 OpenTelemetry 指标和跟踪仪表 instrumentation 即将推出！_

## 入门 {#getting-started}

### 安装 ClickStack 日志后端包 {#install-hyperdx-logger-backend-package}

可以通过将 `hyperdx` 添加到 `mix.exs` 中的依赖列表来安装该包：

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### 配置日志记录器 {#configure-logger}

在 `config.exs` 文件中添加以下内容：

```elixir

# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### 配置环境变量 {#configure-environment-variables}

之后，您需要在 shell 中配置以下环境变量，以将遥测数据发送到 ClickStack：

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中识别您的服务，您可以使用任意名称。_
