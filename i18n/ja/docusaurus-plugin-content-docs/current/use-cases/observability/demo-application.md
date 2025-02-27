---
title: デモアプリケーション
description: 可観測性のためのデモアプリケーション
slug: /observability/demo-application
keywords: [可観測性, ログ, トレース, メトリクス, OpenTelemetry, Grafana, OTel]
---

Open Telemetryプロジェクトには、[デモアプリケーション](https://opentelemetry.io/docs/demo/)が含まれています。このアプリケーションのメンテナンスされたフォークが、ログとトレースのデータソースとしてClickHouseを利用する形で、[こちら](https://github.com/ClickHouse/opentelemetry-demo)で見つけることができます。[公式のデモ手順](https://opentelemetry.io/docs/demo/docker-deployment/)に従って、dockerを使用してこのデモをデプロイできます。さらに、[既存のコンポーネント](https://opentelemetry.io/docs/demo/collector-data-flow-dashboard/)に加えて、ClickHouseのインスタンスが展開され、ログとトレースの保存に使用されます。
