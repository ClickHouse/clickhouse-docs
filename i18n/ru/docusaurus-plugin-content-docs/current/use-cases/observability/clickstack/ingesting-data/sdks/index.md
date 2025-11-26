---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'Языковые SDK для ClickStack — ClickHouse Observability Stack'
title: 'Языковые SDK'
doc_type: 'guide'
keywords: ['ClickStack SDKs', 'языковые SDK ClickStack', 'OpenTelemetry SDKs ClickStack', 'SDK инструментирования приложений
', 'SDK для сбора телеметрии']
---

Данные, как правило, отправляются в ClickStack через **коллектор OpenTelemetry (OTel)** — либо напрямую из языковых SDK, либо через промежуточный коллектор OpenTelemetry, работающий как агент, например для сбора метрик инфраструктуры и логов.

Языковые SDK отвечают за сбор телеметрии внутри вашего приложения — в первую очередь **трейсов** и **логов** — и экспорт этих данных в коллектор OpenTelemetry через OTLP-эндпоинт, который обрабатывает ингестию в ClickHouse.

В браузерной среде SDK также могут отвечать за сбор **данных сессий**, включая события интерфейса, клики и навигацию, что позволяет воспроизводить пользовательские сессии. 



## Как это работает {#how-it-works}

1. Ваше приложение использует ClickStack SDK (например, для Node.js, Python, Go). Эти SDK построены на базе OpenTelemetry SDK и дополнены дополнительными возможностями и более удобным использованием.
2. SDK собирает и экспортирует трейсы и логи через OTLP (HTTP или gRPC).
3. Коллектор OpenTelemetry принимает телеметрию и записывает её в ClickHouse через настроенные экспортеры.



## Поддерживаемые языки {#supported-languages}

:::note Совместимость с OpenTelemetry
Хотя ClickStack предлагает собственные SDKS для различных языков с расширенной телеметрией и дополнительными возможностями, вы также можете без проблем использовать имеющиеся SDKS OpenTelemetry.
:::

<br/>

| Язык | Описание | Ссылка |
|----------|-------------|------|
| AWS Lambda | Настройте сбор телеметрии для функций AWS Lambda | [Документация](/use-cases/observability/clickstack/sdks/aws_lambda) |
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



## Защита с помощью ключа API

Чтобы отправлять данные в ClickStack через OTel collector, в используемых SDK необходимо указать ключ API для приёма данных. Это можно сделать либо с помощью функции `init` в SDK, либо через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<ВАШ_КЛЮЧ_API_ПРИЁМА>'
```

Этот API-ключ генерируется приложением HyperDX и доступен в интерфейсе приложения в разделе `Team Settings → API Keys`.

Для большинства [языковых SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии, которые поддерживают OpenTelemetry, достаточно задать переменную среды `OTEL_EXPORTER_OTLP_ENDPOINT` в приложении или указать её при инициализации SDK:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Интеграция с Kubernetes {#kubernetes-integration}

Все SDKs поддерживают автоматическую корреляцию с метаданными Kubernetes (имя пода, пространство имён и т. д.) при работе в среде Kubernetes. Это позволяет вам:

- Просматривать метрики Kubernetes для подов и узлов, связанных с вашими сервисами
- Коррелировать журналы приложений и трейсы с инфраструктурными метриками
- Отслеживать использование ресурсов и производительность во всём Kubernetes‑кластере

Чтобы включить эту функцию, настройте коллектор OpenTelemetry на пересылку тегов ресурсов в поды. Подробные инструкции по настройке смотрите в [руководстве по интеграции с Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods).
