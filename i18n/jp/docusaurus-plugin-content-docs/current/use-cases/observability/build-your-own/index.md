---
slug: /use-cases/observability/build-your-own
title: '独自のオブザーバビリティスタックを構築する'
pagination_prev: null
pagination_next: null
description: '独自のオブザーバビリティスタックを構築するためのランディングページ'
doc_type: 'landing-page'
keywords: ['observability', 'custom stack', 'build your own', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

このガイドでは、ClickHouse を基盤としたカスタムのオブザーバビリティスタックの構築方法を解説します。ログ、メトリクス、トレース向けのオブザーバビリティソリューションを、実践的な例とベストプラクティスを通じてどのように設計・実装・最適化するかを学びます。

| ページ                                                        | 説明                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ClickHouse を用いて独自のオブザーバビリティソリューションを構築したいユーザーを対象としており、特にログとトレースに焦点を当てています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | なぜログとトレース向けに独自のスキーマを作成することを推奨しているのか、その理由と実践的なベストプラクティスについて学びます。                                                  |
| [Managing data](/observability/managing-data)          | オブザーバビリティ用途での ClickHouse のデプロイでは、大規模なデータセットを扱うことが避けられず、その管理が必要となります。ClickHouse にはデータ管理を支援する機能が用意されています。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | OpenTelemetry を使用して、ClickHouse と連携しながらログとトレースを収集・エクスポートする方法を説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana など、ClickHouse 向けのオブザーバビリティ可視化ツールの使い方を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse と連携してログおよびトレースを扱えるようにフォークされた OpenTelemetry デモアプリケーションを紹介します。                                           |