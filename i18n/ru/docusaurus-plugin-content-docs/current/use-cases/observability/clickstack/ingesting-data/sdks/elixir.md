---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Elixir SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Elixir'
doc_type: 'guide'
keywords: ['Elixir ClickStack SDK', 'Elixir observability', 'HyperDX Elixir', 'Elixir logging SDK', 'ClickStack Elixir integration']
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
_🚧 Поддержка метрик и трейсов через OpenTelemetry появится в ближайшее время!_



## Начало работы {#getting-started}

### Установка пакета бэкенда логгера ClickStack {#install-hyperdx-logger-backend-package}

Пакет можно установить, добавив `hyperdx` в список зависимостей в файле `mix.exs`:

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### Настройка логгера {#configure-logger}

Добавьте следующее в файл `config.exs`:


```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### Настройка переменных окружения {#configure-environment-variables}

После этого необходимо настроить следующие переменные окружения в вашей
оболочке для отправки телеметрии в ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_Переменная окружения `OTEL_SERVICE_NAME` используется для идентификации вашего сервиса
в приложении HyperDX. Вы можете указать любое имя._
