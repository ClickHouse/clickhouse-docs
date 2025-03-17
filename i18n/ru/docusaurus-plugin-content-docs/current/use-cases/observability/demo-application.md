---
title: Демо-приложение
description: Демо-приложение для наблюдаемости
slug: /observability/demo-application
keywords: [наблюдаемость, логи, трассировки, метрики, OpenTelemetry, Grafana, OTel]
---

Проект Open Telemetry включает в себя [демо-приложение](https://opentelemetry.io/docs/demo/). Поддерживаемая версия этого приложения с ClickHouse в качестве источника данных для логов и трассировок доступна [здесь](https://github.com/ClickHouse/opentelemetry-demo). Официальные [инструкции по демо](https://opentelemetry.io/docs/demo/docker-deployment/) можно использовать для развертывания этого демо с помощью Docker. В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) будет развернута и использована экземпляр ClickHouse для хранения логов и трассировок.
