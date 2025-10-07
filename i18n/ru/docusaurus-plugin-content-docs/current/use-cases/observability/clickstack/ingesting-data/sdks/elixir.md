---
'slug': '/use-cases/observability/clickstack/sdks/elixir'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 1
'description': 'Elixir SDK для ClickStack - Стек мониторинга ClickHouse'
'title': 'Elixir'
'doc_type': 'guide'
---

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Логи</td>
      <td className="pe-2">✖️ Метрики</td>
      <td className="pe-2">✖️ Трейсы</td>
    </tr>
  </tbody>
</table>
_🚧 Инструментация метрик и трейсов OpenTelemetry скоро будет доступна!_

## Начало работы {#getting-started}

### Установите пакет бэкенда логирования ClickStack {#install-hyperdx-logger-backend-package}

Пакет можно установить, добавив `hyperdx` в ваш список зависимостей в 
`mix.exs`:

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### Настройте логгер {#configure-logger}

Добавьте следующее в ваш файл `config.exs`:

```elixir

# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### Настройте переменные окружения {#configure-environment-variables}

После этого вам нужно будет настроить следующие переменные окружения в вашем 
shell для отправки телеметрии в ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса 
в приложении HyperDX, она может иметь любое имя, которое вы хотите._
