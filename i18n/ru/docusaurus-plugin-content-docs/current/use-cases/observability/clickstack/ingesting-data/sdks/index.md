---
'slug': '/use-cases/observability/clickstack/sdks'
'pagination_prev': null
'pagination_next': null
'description': 'Языковые SDK для ClickStack - Стек наблюдаемости ClickHouse'
'title': 'Языковые SDK'
'doc_type': 'guide'
---
Данные, как правило, отправляются в ClickStack через **коллектор OpenTelemetry (OTel)**, либо непосредственно из языковых SDK, либо через промежуточный коллектор OpenTelemetry, действующий как агенты, например, собирая инфраструктурные метрики и логи.

Языковые SDK отвечают за сбор телеметрии из вашего приложения - в первую очередь **трасс** и **логов** - и экспорт этих данных в коллектор OpenTelemetry через конечную точку OTLP, которая обрабатывает прием в ClickHouse.

В средах на основе браузера SDK также могут отвечать за сбор **данных сеанса**, включая события пользовательского интерфейса, клики и навигацию, что позволяет воспроизводить сеансы пользователей.

## Как это работает {#how-it-works}

1. Ваше приложение использует ClickStack SDK (например, Node.js, Python, Go). Эти SDK основаны на SDK OpenTelemetry с дополнительными функциями и улучшениями удобства использования.
2. SDK собирает и экспортирует трассы и логи через OTLP (HTTP или gRPC).
3. Коллектор OpenTelemetry получает телеметрию и записывает ее в ClickHouse через настроенные экспортеры.

## Поддерживаемые языки {#supported-languages}

:::note Совместимость с OpenTelemetry
Хотя ClickStack предлагает свои собственные языковые SDK с улучшенной телеметрией и функциями, вы также можете беспрепятственно использовать их существующие SDK OpenTelemetry.
:::

<br/>

| Язык        | Описание                                           | Ссылка |
|-------------|---------------------------------------------------|--------|
| AWS Lambda  | Инструментируйте ваши функции AWS Lambda         | [Документация](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Браузер     | JavaScript SDK для приложений на основе браузера  | [Документация](/use-cases/observability/clickstack/sdks/browser) |
| Elixir      | Приложения на Elixir                              | [Документация](/use-cases/observability/clickstack/sdks/elixir) |
| Go          | Приложения и микросервисы на Go                  | [Документация](/use-cases/observability/clickstack/sdks/golang) |
| Java        | Приложения на Java                                | [Документация](/use-cases/observability/clickstack/sdks/java) |
| NestJS      | Приложения на NestJS                              | [Документация](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js     | Приложения на Next.js                             | [Документация](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js     | JavaScript среда выполнения для серверных приложений | [Документация](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno        | Приложения на Deno                                | [Документация](/use-cases/observability/clickstack/sdks/deno) |
| Python      | Приложения и веб-сервисы на Python               | [Документация](/use-cases/observability/clickstack/sdks/python) |
| React Native | Мобильные приложения на React Native             | [Документация](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby        | Приложения на Ruby on Rails и веб-сервисы        | [Документация](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## Защита с помощью ключа API {#securing-api-key}

Чтобы отправить данные в ClickStack через коллектор OTel, SDK необходимо указать ключ API для приема. Это можно сделать, используя функцию `init` в SDK или переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Этот ключ API генерируется приложением HyperDX и доступен через приложение в `Настройки команды → Ключи API`.

Для большинства [языковых SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, которые поддерживают OpenTelemetry, вы можете просто установить переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в вашем приложении или указать ее во время инициализации SDK:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Интеграция с Kubernetes {#kubernetes-integration}

Все SDK поддерживают автоматическую корреляцию с метаданными Kubernetes (имя пода, пространство имен и т. д.) при работе в среде Kubernetes. Это позволяет вам:

- Просматривать метрики Kubernetes для подов и узлов, связанных с вашими сервисами
- Коррелировать логи и трассы приложений с метриками инфраструктуры
- Отслеживать использование ресурсов и производительность в вашем кластере Kubernetes

Чтобы активировать эту функцию, настройте коллектор OpenTelemetry на пересылку тегов ресурсов подам. Смотрите [руководство по интеграции с Kubernetes](/use-cases/observability/clickstack/ingesting-data/kubernetes#forwarding-resouce-tags-to-pods) для получения подробных инструкций по настройке.