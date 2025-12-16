---
title: 'デモアプリケーション'
description: 'オブザーバビリティ向けデモアプリケーション'
slug: /observability/demo-application
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
doc_type: 'guide'
---

OpenTelemetry プロジェクトには[デモアプリケーション](https://opentelemetry.io/docs/demo/)が提供されています。ClickHouse をログおよびトレースのデータソースとして利用する、このアプリケーションの継続的にメンテナンスされているフォーク版は[こちら](https://github.com/ClickHouse/opentelemetry-demo)にあります。[公式ドキュメントのデモ手順](https://opentelemetry.io/docs/demo/docker-deployment/)に従うことで、このデモを Docker でデプロイできます。[既存のコンポーネント](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)に加えて、ログおよびトレースのストレージとして使用される ClickHouse インスタンスもデプロイされます。