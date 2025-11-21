---
title: 'デモアプリケーション'
description: 'オブザーバビリティ向けデモアプリケーション'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry プロジェクトには [デモアプリケーション](https://opentelemetry.io/docs/demo/) が用意されています。ClickHouse をログやトレースのデータソースとして使用する、このアプリケーションの継続的にメンテナンスされているフォークは[こちら](https://github.com/ClickHouse/opentelemetry-demo)にあります。[公式のデモ手順](https://opentelemetry.io/docs/demo/docker-deployment/)に従って、このデモを Docker でデプロイできます。[既存のコンポーネント](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)に加えて、ClickHouse のインスタンスもデプロイされ、ログとトレースの保存に使用されます。