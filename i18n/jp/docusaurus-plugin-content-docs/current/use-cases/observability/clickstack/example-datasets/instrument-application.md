---
slug: /use-cases/observability/clickstack/example-datasets/instrument-app
title: 'Managed ClickStack を使用してアプリケーションをインストルメントする'
sidebar_label: 'HackerNews Analyzer デモ'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: 'Node.js アプリケーションを OpenTelemetry でインストルメントし、ログ、メトリクス、トレースを Managed ClickStack に送信するためのガイド'
doc_type: 'guide'
keywords: ['clickstack', 'インストルメンテーション', 'opentelemetry', 'managed clickstack', 'オブザーバビリティ']
---

import InstrumentApplication from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_instrument_application.md';

このガイドでは、OpenTelemetry を使用してシンプルな Node.js アプリケーションをインストルメントし、そのログ、メトリクス、トレースを [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) に送信する方法を説明します。バックエンドは、アプリケーションのソースコードを変更することなくインストルメントされています。

[HackerNews Analyzer](https://github.com/ClickHouse/hn-news-analyzer) は、公開されている ClickHouse のデモインスタンスでホストされている HackerNews データセットをクエリする小規模な Node.js アプリです。すべてのチャート、テーブル、検索ボックスは実際の ClickHouse クエリによって支えられているため、あらゆる操作でトレースが生成され、そのメインのスパンはバックエンドから ClickHouse への HTTPS 呼び出しになります。

## 前提条件 \{#prerequisites\}

* 利用可能で、到達可能な OTel collector があり、それが Managed ClickStack サービスにデータを取り込んでいること。OTLP エンドポイントとインジェストトークンが必要です。
* Node 18+ と npm。

<InstrumentApplication />

## 詳しく見る \{#learn-more\}

* [Session Replay](/use-cases/observability/clickstack/session-replay): 機能概要、SDK のオプション、プライバシー制御。
* [Session Replay Demo](/use-cases/observability/clickstack/example-datasets/session-replay-demo): ローカルの ClickStack インスタンスを使用する自己完結型のデモ。
* [ClickStack Getting Started](/use-cases/observability/clickstack/getting-started): ClickStack をデプロイし、最初のデータを取り込みます。
* [All Sample Datasets](/use-cases/observability/clickstack/sample-datasets): その他のサンプルデータセットとガイド。