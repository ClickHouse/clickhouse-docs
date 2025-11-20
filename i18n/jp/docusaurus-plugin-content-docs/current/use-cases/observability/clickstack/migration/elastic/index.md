---
slug: /use-cases/observability/clickstack/migration/elastic
title: 'Elastic から ClickStack への移行'
pagination_prev: null
pagination_next: null
description: 'Elastic から ClickHouse Observability Stack への移行用ランディングページ'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

このガイドでは、Elastic Stack から ClickStack へ移行するための包括的な手順を説明します。リスクを最小限に抑えつつ、オブザーバビリティ系ワークロードにおける ClickHouse の強みを活かすための並行運用戦略に焦点を当てています。

| Section | Description |
|---------|-------------|
| [Introduction](/use-cases/observability/clickstack/migration/elastic/intro) | 移行プロセスの概要と主要な検討事項 |
| [Concepts](/use-cases/observability/clickstack/migration/elastic/concepts) | Elastic と ClickStack 間の対応する概念の理解 |
| [Types](/use-cases/observability/clickstack/migration/elastic/types) | Elasticsearch の型を ClickHouse の対応する型へマッピング |
| [Search](/use-cases/observability/clickstack/migration/elastic/search) | 検索機能とクエリ構文の比較 |
| [Migrating Data](/use-cases/observability/clickstack/migration/elastic/migrating-data) | データ移行と並行運用のための戦略 |
| [Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | Elastic エージェントから OpenTelemetry への移行 |
| [Migrating SDKs](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | Elastic APM エージェントを OpenTelemetry SDK に置き換え |