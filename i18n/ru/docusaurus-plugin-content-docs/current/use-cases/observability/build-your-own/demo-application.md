---
title: 'Демонстрационное приложение'
description: 'Демонстрационное приложение для наблюдаемости'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

Проект OpenTelemetry включает [демонстрационное приложение](https://opentelemetry.io/docs/demo/). Поддерживаемый форк этого приложения с ClickHouse в качестве источника данных для логов и трейсов доступен [здесь](https://github.com/ClickHouse/opentelemetry-demo). Для развертывания этого демо с помощью Docker можно следовать [официальной инструкции по развертыванию демо](https://opentelemetry.io/docs/demo/docker-deployment/). В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) будет развернут экземпляр ClickHouse для хранения логов и трейсов.