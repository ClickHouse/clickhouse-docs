---
slug: /use-cases/observability/build-your-own
title: '独自のオブザーバビリティスタックを構築する'
pagination_prev: null
pagination_next: null
description: '独自のオブザーバビリティスタックを構築するためのランディングページ'
doc_type: 'landing-page'
keywords: ['オブザーバビリティ', 'カスタムスタック', '独自構築', 'ログ', 'トレース', 'メトリクス', 'OpenTelemetry']
---

このガイドでは、ClickHouse を基盤としてカスタムのオブザーバビリティスタックを構築する方法を解説します。ログ、メトリクス、トレース向けのオブザーバビリティソリューションをどのように設計・実装・最適化するかを、実践的な例とベストプラクティスとともに学びます。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ClickHouse を使って独自のオブザーバビリティソリューションを構築しようとしているユーザー向けに作成されており、特にログとトレースにフォーカスしています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | ログとトレース向けに独自のスキーマを作成することが推奨される理由と、その際のベストプラクティスを学びます。                                                  |
| [Managing data](/observability/managing-data)          | オブザーバビリティ用途の ClickHouse のデプロイメントでは、必然的に大規模なデータセットを扱うことになり、その管理が必要になります。ClickHouse はデータ管理を支援するさまざまな機能を提供します。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | OpenTelemetry を ClickHouse と組み合わせて使用し、ログとトレースを収集・エクスポートする方法について説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana を含む、ClickHouse 用のオブザーバビリティ向け可視化ツールの使い方を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse と連携してログとトレースを扱えるようにフォークされた OpenTelemetry Demo Application を探索します。                                           |