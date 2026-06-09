---
slug: /use-cases/observability/clickstack/instrument-application
title: 'Managed ClickStack を使って 5 分でアプリケーションにインストルメンテーションを追加する'
description: 'OpenTelemetry を使用して Node.js アプリケーションにインストルメンテーションを追加し、その ログ、メトリクス、トレース を Managed ClickStack に送信します'
doc_type: 'guide'
keywords: ['clickstack', 'instrumentation', 'opentelemetry', 'managed', 'observability', 'sdk', 'nodejs']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import InstrumentApplication from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

このガイドでは、小規模な Node.js アプリケーションを OpenTelemetry でインストルメントし、そのログ、メトリクス、トレースを Managed ClickStack に送信する方法を説明します。バックエンドは、アプリケーションのソースコードを変更することなくインストルメントされます。

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) は、公開中の ClickHouse デモでホストされている HackerNews データセットにクエリを実行する Node.js アプリです。すべてのチャート、テーブル、検索ボックスは実際の ClickHouse クエリを基盤としているため、あらゆる操作でトレースが生成され、そのメインの span はバックエンドから ClickHouse への HTTPS 呼び出しになります。

このガイドでは、[OpenTelemetry Collector のセットアップ](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) を完了しており、このアプリケーションを実行するマシンから到達可能な ClickStack collector が稼働していることを前提としています。**その OTLPエンドポイント** と、デプロイ時に設定した `OTLP_AUTH_TOKEN` を必ず控えておいてください。

## 前提条件 \{#prerequisites\}

* このマシンからアクセス可能な ClickStack collector。まだデプロイしていない場合は、まず [OpenTelemetry Collector のセットアップ](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector) を参照してください。
* その collector の OTLPエンドポイントと、collector に設定した `OTLP_AUTH_TOKEN`。
* Node 18+ と npm。

<InstrumentApplication />

## 参考資料 \{#further-reading\}

* [Kubernetes の監視](/use-cases/observability/clickstack/monitoring-kubernetes): クラスターからログ、インフラのメトリクス、Kubernetes イベントを収集します。
* [AWS CloudWatch logs の監視](/use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs): OpenTelemetry の CloudWatch receiver を介して CloudWatch logs を転送します。
* [Session Replay](/use-cases/observability/clickstack/session-replay): 機能概要、SDK オプション、プライバシー制御。
* [Going to production](/use-cases/observability/clickstack/production): 本番環境に移行する際の推奨事項。