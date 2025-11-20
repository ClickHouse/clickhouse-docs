---
title: 'Демонстрационное приложение'
description: 'Демонстрационное приложение для наблюдаемости'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

Проект OpenTelemetry включает [демонстрационное приложение](https://opentelemetry.io/docs/demo/). Поддерживаемый форк этого приложения с ClickHouse в качестве источника данных для логов и трассировок доступен [здесь](https://github.com/ClickHouse/opentelemetry-demo). Для развёртывания этого демо в Docker можно использовать [официальные инструкции по развёртыванию демо](https://opentelemetry.io/docs/demo/docker-deployment/). В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) будет развёрнут экземпляр ClickHouse, который будет использоваться для хранения логов и трассировок.