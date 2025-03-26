---
title: 'Демо-приложение'
description: 'Демо-приложение для наблюдаемости'
slug: /observability/demo-application
keywords: ['наблюдаемость', 'логи', 'трейсы', 'метрики', 'OpenTelemetry', 'Grafana', 'OTel']
---

Проект Open Telemetry включает в себя [демо-приложение](https://opentelemetry.io/docs/demo/). Поддерживаемый форк этого приложения с ClickHouse в качестве источника данных для логов и трейсов можно найти [здесь](https://github.com/ClickHouse/opentelemetry-demo). Следуйте [официальным инструкциям по демо](https://opentelemetry.io/docs/demo/docker-deployment/), чтобы развернуть это демо с использованием docker. В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/), будет развернута и использована инстанция ClickHouse для хранения логов и трейсов.
