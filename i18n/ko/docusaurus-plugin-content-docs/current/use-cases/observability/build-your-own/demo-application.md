---
'title': '데모 애플리케이션'
'description': '관측 가능성을 위한 데모 애플리케이션'
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

The OpenTelemetry project includes a [demo application](https://opentelemetry.io/docs/demo/). A maintained fork of this application with ClickHouse as a data source for logs and traces can be found [here](https://github.com/ClickHouse/opentelemetry-demo). The [official demo instructions](https://opentelemetry.io/docs/demo/docker-deployment/) can be followed to deploy this demo with docker. In addition to the [existing components](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/), an instance of ClickHouse will be deployed and used for the storage of logs and traces.
