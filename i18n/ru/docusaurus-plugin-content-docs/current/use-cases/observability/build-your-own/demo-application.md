---
'title': 'Демо приложение'
'description': 'Демо приложение для мониторинга'
'slug': '/observability/demo-application'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'doc_type': 'guide'
---

Проект OpenTelemetry включает в себя [демо-приложение](https://opentelemetry.io/docs/demo/). Поддерживаемый форк этого приложения с ClickHouse в качестве источника данных для логов и трассировок можно найти [здесь](https://github.com/ClickHouse/opentelemetry-demo). Можно следовать [официальным инструкциям по демо](https://opentelemetry.io/docs/demo/docker-deployment/), чтобы развернуть этот демо-проект с помощью docker. В дополнение к [существующим компонентам](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/), будет развернуто и использовано экземпляр ClickHouse для хранения логов и трассировок.
