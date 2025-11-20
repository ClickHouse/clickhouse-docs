---
slug: /use-cases/observability/build-your-own
title: '独自のオブザーバビリティスタックを構築する'
pagination_prev: null
pagination_next: null
description: '独自のオブザーバビリティスタックを構築するためのランディングページ'
doc_type: 'landing-page'
keywords: ['observability', 'custom stack', 'build your own', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

このガイドでは、ClickHouse を基盤としてカスタムのオブザーバビリティスタックを構築する方法を紹介します。ログ、メトリクス、トレース向けのオブザーバビリティソリューションを、実践的な例とベストプラクティスを通じて、どのように設計・実装・最適化するかを学べます。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ClickHouse を用いて、特にログとトレースに焦点を当てた独自のオブザーバビリティソリューションを構築したいユーザー向けに作成されています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | ログとトレース用に独自のスキーマを作成することを推奨する理由と、その際のベストプラクティスについて学びます。                                                  |
| [Managing data](/observability/managing-data)          | オブザーバビリティ用途の ClickHouse デプロイでは、必然的に大規模なデータセットを扱うことになり、その管理が必要になります。ClickHouse にはデータ管理を支援する機能が備わっています。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | ClickHouse と OpenTelemetry を組み合わせて、ログとトレースを収集およびエクスポートする方法を説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana など、ClickHouse 向けのオブザーバビリティ可視化ツールの使い方を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse と連携してログとトレースを扱えるようにフォークされた OpenTelemetry デモアプリケーションを確認します。                                           |