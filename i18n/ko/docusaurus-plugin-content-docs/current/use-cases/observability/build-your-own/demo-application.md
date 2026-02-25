---
title: '데모 애플리케이션'
description: '관측성을 위한 데모 애플리케이션'
slug: /observability/demo-application
keywords: ['관측성', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry 프로젝트에는 [데모 애플리케이션](https://opentelemetry.io/docs/demo/)이 포함되어 있습니다. ClickHouse를 로그와 트레이스의 데이터 소스로 사용하는, 이 애플리케이션의 유지·관리되는 포크는 [여기](https://github.com/ClickHouse/opentelemetry-demo)에서 확인할 수 있습니다. [공식 데모 문서](https://opentelemetry.io/docs/demo/docker-deployment/)를 따르면 Docker를 사용해 이 데모를 배포할 수 있습니다. [기존 컴포넌트](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/) 외에 ClickHouse 인스턴스가 함께 배포되며, 로그와 트레이스를 저장하는 데 사용됩니다.