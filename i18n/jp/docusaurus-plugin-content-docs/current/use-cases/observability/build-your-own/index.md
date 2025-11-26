---
slug: /use-cases/observability/build-your-own
title: '独自のオブザーバビリティスタックを構築する'
pagination_prev: null
pagination_next: null
description: '独自のオブザーバビリティスタックを構築するためのランディングページ'
doc_type: 'landing-page'
keywords: ['オブザーバビリティ', 'カスタムスタック', '独自構築', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

このガイドでは、ClickHouse を基盤として独自のオブザーバビリティスタックを構築する方法について解説します。ログ、メトリクス、トレース向けのオブザーバビリティソリューションを、実用的な例とベストプラクティスを通じて、どのように設計・実装・最適化するかを学びます。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ログとトレースに焦点を当てて、ClickHouse を用いて独自のオブザーバビリティソリューションを構築したいユーザー向けに作成されています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | なぜログとトレース向けに独自のスキーマを作成することが推奨されるのか、その理由とあわせて、スキーマ設計のベストプラクティスを学びます。                                                  |
| [Managing data](/observability/managing-data)          | オブザーバビリティ用途の ClickHouse デプロイメントでは、避けられず大規模なデータセットを扱うことになり、それらを管理する必要があります。ClickHouse はデータ管理を支援する機能を提供します。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | ClickHouse と組み合わせて OpenTelemetry を用い、ログとトレースを収集・エクスポートする方法を説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana を含む、ClickHouse 向けのオブザーバビリティ可視化ツールの使用方法を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse でログとトレースを扱えるようにフォークされた OpenTelemetry Demo Application を利用して、動作を検証します。                                           |