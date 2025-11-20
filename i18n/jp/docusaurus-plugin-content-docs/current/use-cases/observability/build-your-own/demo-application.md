---
title: 'デモアプリケーション'
description: 'オブザーバビリティ向けデモアプリケーション'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry プロジェクトには[デモアプリケーション](https://opentelemetry.io/docs/demo/)が含まれています。ClickHouse をログとトレースのデータソースとして利用する、このアプリケーションのメンテナンスされているフォークは[こちら](https://github.com/ClickHouse/opentelemetry-demo)から入手できます。[公式のデモ手順](https://opentelemetry.io/docs/demo/docker-deployment/)に従うことで、このデモを Docker を使ってデプロイできます。[既存のコンポーネント](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)に加えて、ClickHouse のインスタンスがデプロイされ、ログとトレースのストレージとして使用されます。