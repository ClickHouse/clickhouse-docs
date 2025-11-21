---
title: 'Демо-приложение'
description: 'Демо-приложение для наблюдаемости'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

Проект OpenTelemetry включает [демо-приложение](https://opentelemetry.io/docs/demo/). Поддерживаемый форк этого приложения с ClickHouse в качестве источника данных для логов и трассировок доступен [здесь](https://github.com/ClickHouse/opentelemetry-demo). Для развертывания этого приложения с помощью Docker можно воспользоваться [официальной инструкцией по развертыванию демо](https://opentelemetry.io/docs/demo/docker-deployment/). В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) будет развернут экземпляр ClickHouse, который будет использоваться для хранения логов и трассировок.