---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'Языковые SDK для ClickStack — стек наблюдаемости ClickHouse'
title: 'Языковые SDK'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'языковые SDK ClickStack', 'OpenTelemetry SDKs ClickStack', 'SDK инструментирования приложений
', 'SDK для сбора телеметрии']
---

Данные, как правило, отправляются в ClickStack через **коллектор OpenTelemetry (OTel)** — либо напрямую из языковых SDK, либо через промежуточный коллектор OpenTelemetry, работающий в роли агента, например собирающего метрики инфраструктуры и логи.

Языковые SDK отвечают за сбор телеметрии из вашего приложения — в первую очередь **трейсов** и **логов** — и экспорт этих данных в коллектор OpenTelemetry через OTLP-эндпоинт, который осуществляет ингестию данных в ClickHouse.

В браузерных окружениях SDK также могут отвечать за сбор **данных сеансов**, включая события пользовательского интерфейса, клики и навигацию, что позволяет воспроизводить пользовательские сеансы. 

## Как это работает \{#how-it-works\}

1. Ваше приложение использует SDK ClickStack (например, для Node.js, Python, Go). Эти SDKs основаны на OpenTelemetry SDKs с дополнительными возможностями и повышенным удобством использования.
2. SDK собирает и экспортирует трассы и логи через OTLP (HTTP или gRPC).
3. Коллектор OpenTelemetry получает телеметрию и записывает её в ClickHouse с помощью настроенных экспортеров.

## Поддерживаемые языки \{#supported-languages\}

:::note Совместимость с OpenTelemetry
Хотя ClickStack предлагает собственные языковые SDK с расширенной телеметрией и дополнительными возможностями, вы также можете бесшовно использовать существующие SDK OpenTelemetry.
:::

<br/>

| Язык | Описание | Ссылка |
|----------|-------------|------|
| AWS Lambda | Настройте инструментирование функций AWS Lambda | [Документация](/use-cases/observability/clickstack/sdks/aws_lambda) |
| Browser | JavaScript SDK для браузерных приложений | [Документация](/use-cases/observability/clickstack/sdks/browser) |
| Elixir | Приложения на Elixir | [Документация](/use-cases/observability/clickstack/sdks/elixir) |
| Go | Приложения и микросервисы на Go | [Документация](/use-cases/observability/clickstack/sdks/golang) |
| Java | Приложения на Java | [Документация](/use-cases/observability/clickstack/sdks/java) |
| NestJS | Приложения на NestJS | [Документация](/use-cases/observability/clickstack/sdks/nestjs) |
| Next.js | Приложения на Next.js | [Документация](/use-cases/observability/clickstack/sdks/nextjs) |
| Node.js | Среда выполнения JavaScript для серверных приложений | [Документация](/use-cases/observability/clickstack/sdks/nodejs) |
| Deno | Приложения на Deno | [Документация](/use-cases/observability/clickstack/sdks/deno) |
| Python | Приложения и веб‑сервисы на Python | [Документация](/use-cases/observability/clickstack/sdks/python) |
| React Native | Мобильные приложения на React Native | [Документация](/use-cases/observability/clickstack/sdks/react-native) |
| Ruby | Приложения и веб‑сервисы на Ruby on Rails | [Документация](/use-cases/observability/clickstack/sdks/ruby-on-rails) |

## Защита с помощью ключа API \{#securing-api-key\}

Для отправки данных в ClickStack через OTel collector SDK должны указывать ключ API для приёма данных (ingestion API key). Его можно задать либо с помощью функции `init` в SDK, либо через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Этот API-ключ генерируется приложением HyperDX и доступен в разделе `Team Settings → API Keys` самого приложения.

Для большинства [языковых SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, поддерживающих OpenTelemetry, вы можете просто задать переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в вашем приложении или указать её при инициализации SDK:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

## Интеграция с Kubernetes \{#kubernetes-integration\}

Все SDKs поддерживают автоматическую корреляцию с метаданными Kubernetes (имя пода, пространство имен и т. д.) при работе в среде Kubernetes. Это позволяет вам:

- Просматривать метрики Kubernetes для подов и узлов, связанных с вашими сервисами
- Коррелировать журналы приложений и трассировки с инфраструктурными метриками
- Отслеживать использование ресурсов и производительность во всем вашем кластере Kubernetes

Чтобы включить эту функцию, настройте коллектор OpenTelemetry так, чтобы он пересылал ресурсные теги в поды. Подробные инструкции по настройке см. в [руководстве по интеграции с Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods).