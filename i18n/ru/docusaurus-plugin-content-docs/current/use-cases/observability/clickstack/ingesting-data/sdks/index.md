---
slug: /use-cases/observability/clickstack/sdks
pagination_prev: null
pagination_next: null
description: 'SDK для языков программирования для ClickStack — стека наблюдаемости ClickHouse'
title: 'SDK для языков программирования'
doc_type: 'guide'
keywords: ['SDK ClickStack', 'языковые SDK ClickStack', 'SDK OpenTelemetry ClickStack', 'SDK инструментирования приложений
', 'SDK для сбора телеметрии']
---

Данные обычно отправляются в ClickStack через **коллектор OpenTelemetry (OTel)** — либо напрямую из SDK для языков программирования, либо через промежуточный коллектор OpenTelemetry, работающий как агент, например для сбора инфраструктурных метрик и логов.

SDK для языков программирования отвечают за сбор телеметрии из вашего приложения — в первую очередь **трейсов** и **логов** — и экспорт этих данных в коллектор OpenTelemetry через endpoint OTLP, который обрабатывает приём данных в ClickHouse.

В браузерных средах SDK также могут отвечать за сбор **данных сессии**, включая события пользовательского интерфейса (UI), клики и навигацию, что позволяет воспроизводить пользовательские сессии. 



## Как это работает {#how-it-works}

1. Ваше приложение использует SDK ClickStack (например, Node.js, Python, Go). Эти SDK основаны на SDK OpenTelemetry с дополнительными возможностями и улучшениями удобства использования.
2. SDK собирает и экспортирует трассировки и логи через OTLP (HTTP или gRPC).
3. Коллектор OpenTelemetry получает телеметрию и записывает её в ClickHouse через настроенные экспортеры.


## Поддерживаемые языки {#supported-languages}

:::note Совместимость с OpenTelemetry
Хотя ClickStack предлагает собственные SDK для различных языков с расширенными возможностями телеметрии и дополнительными функциями, вы также можете использовать имеющиеся SDK OpenTelemetry без каких-либо проблем.
:::

<br />

| Язык         | Описание                                        | Ссылка                                                                  |
| ------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
| AWS Lambda   | Инструментирование функций AWS Lambda           | [Документация](/use-cases/observability/clickstack/sdks/aws_lambda)    |
| Browser      | JavaScript SDK для браузерных приложений        | [Документация](/use-cases/observability/clickstack/sdks/browser)       |
| Elixir       | Приложения на Elixir                            | [Документация](/use-cases/observability/clickstack/sdks/elixir)        |
| Go           | Приложения и микросервисы на Go                 | [Документация](/use-cases/observability/clickstack/sdks/golang)        |
| Java         | Приложения на Java                              | [Документация](/use-cases/observability/clickstack/sdks/java)          |
| NestJS       | Приложения на NestJS                            | [Документация](/use-cases/observability/clickstack/sdks/nestjs)        |
| Next.js      | Приложения на Next.js                           | [Документация](/use-cases/observability/clickstack/sdks/nextjs)        |
| Node.js      | Среда выполнения JavaScript для серверных приложений | [Документация](/use-cases/observability/clickstack/sdks/nodejs)        |
| Deno         | Приложения на Deno                              | [Документация](/use-cases/observability/clickstack/sdks/deno)          |
| Python       | Приложения и веб-сервисы на Python              | [Документация](/use-cases/observability/clickstack/sdks/python)        |
| React Native | Мобильные приложения на React Native            | [Документация](/use-cases/observability/clickstack/sdks/react-native)  |
| Ruby         | Приложения и веб-сервисы на Ruby on Rails       | [Документация](/use-cases/observability/clickstack/sdks/ruby-on-rails) |


## Защита с помощью API-ключа {#securing-api-key}

Для отправки данных в ClickStack через коллектор OTel необходимо указать API-ключ для приёма данных в SDK. Это можно сделать с помощью функции `init` в SDK или через переменную окружения `OTEL_EXPORTER_OTLP_HEADERS`:

```shell
OTEL_EXPORTER_OTLP_HEADERS='authorization=<YOUR_INGESTION_API_KEY>'
```

Этот API-ключ генерируется приложением HyperDX и доступен в разделе `Team Settings → API Keys`.

Для большинства [SDK](/use-cases/observability/clickstack/sdks) и библиотек телеметрии с поддержкой OpenTelemetry достаточно установить переменную окружения `OTEL_EXPORTER_OTLP_ENDPOINT` в приложении или указать её при инициализации SDK:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```


## Интеграция с Kubernetes {#kubernetes-integration}

Все SDK поддерживают автоматическую корреляцию с метаданными Kubernetes (имя пода, пространство имён и т. д.) при работе в среде Kubernetes. Это позволяет:

- Просматривать метрики Kubernetes для подов и узлов, связанных с вашими сервисами
- Сопоставлять логи и трассировки приложений с метриками инфраструктуры
- Отслеживать использование ресурсов и производительность в кластере Kubernetes

Чтобы включить эту функцию, настройте коллектор OpenTelemetry на пересылку тегов ресурсов в поды. Подробные инструкции по настройке см. в [руководстве по интеграции с Kubernetes](/use-cases/observability/clickstack/integrations/kubernetes#forwarding-resouce-tags-to-pods).
