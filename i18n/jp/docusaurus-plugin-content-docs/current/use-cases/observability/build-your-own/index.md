---
slug: /use-cases/observability/build-your-own
title: '独自のオブザーバビリティスタックを構築する'
pagination_prev: null
pagination_next: null
description: '独自のオブザーバビリティスタックを構築するためのランディングページ'
doc_type: 'landing-page'
keywords: ['observability', 'custom stack', 'build your own', 'logs', 'traces', 'metrics', 'OpenTelemetry']
---

このガイドでは、ClickHouse を基盤として独自のオブザーバビリティスタックを構築する方法を紹介します。ログ・メトリクス・トレース向けのオブザーバビリティソリューションを、設計・実装・最適化する方法を、実践的な例とベストプラクティスとともに学ぶことができます。

| Page                                                        | Description                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](/use-cases/observability/introduction)            | このガイドは、ClickHouse を用いて独自のオブザーバビリティソリューションを構築したいユーザーを対象としており、特にログとトレースに焦点を当てています。                                             |
| [Schema design](/use-cases/observability/schema-design)          | ログおよびトレース向けに独自のスキーマの作成を推奨する理由と、その際に役立つベストプラクティスについて学びます。                                                  |
| [Managing data](/observability/managing-data)          | オブザーバビリティ用途での ClickHouse デプロイメントでは、必然的に大規模なデータセットを扱うことになり、その管理が必要です。ClickHouse にはデータ管理を支援するための機能が用意されています。           |
| [Integrating OpenTelemetry](/observability/integrating-opentelemetry) | OpenTelemetry を ClickHouse と組み合わせて使用し、ログおよびトレースを収集・エクスポートする方法を説明します。                                                           |
| [Using Visualization Tools](/observability/grafana)    | HyperDX や Grafana など、ClickHouse 向けのオブザーバビリティ可視化ツールの使い方を学びます。                                       |
| [Demo Application](/observability/demo-application)    | ClickHouse と連携してログおよびトレースを扱えるようにフォークされた OpenTelemetry デモアプリケーションを体験できます。                                           |