---
title: 'Демонстрационное приложение'
description: 'Демонстрационное приложение для мониторинга'
slug: /observability/demo-application
keywords: ['мониторинг', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
---

Проект Open Telemetry включает в себя [демонстрационное приложение](https://opentelemetry.io/docs/demo/). Поддерживаемый форк этого приложения с ClickHouse в качестве источника данных для логов и трейсов можно найти [здесь](https://github.com/ClickHouse/opentelemetry-demo). [Официальные инструкции по демонстрации](https://opentelemetry.io/docs/demo/docker-deployment/) можно использовать для развертывания этой демонстрации с помощью docker. В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) будет развернута и использована инстанция ClickHouse для хранения логов и трейсов.
