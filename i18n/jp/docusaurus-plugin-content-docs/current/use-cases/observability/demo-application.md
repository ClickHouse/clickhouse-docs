---
title: デモアプリケーション
description: 可観測性のためのデモアプリケーション
slug: /observability/demo-application
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---

Open Telemetryプロジェクトには[デモアプリケーション](https://opentelemetry.io/docs/demo/)が含まれています。このアプリケーションのメンテナンスされているフォークは、ログおよびトレースのデータソースとしてClickHouseを使用しているものが[こちら](https://github.com/ClickHouse/opentelemetry-demo)にあります。[公式デモ手順](https://opentelemetry.io/docs/demo/docker-deployment/)に従って、このデモをDockerでデプロイすることができます。[既存のコンポーネント](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)に加えて、ClickHouseのインスタンスがデプロイされ、ログおよびトレースのストレージとして使用されます。
