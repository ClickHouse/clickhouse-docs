---
slug: /use-cases/observability/clickstack/migration/elastic
title: 'Elastic から ClickStack への移行'
pagination_prev: null
pagination_next: null
description: 'Elastic から ClickHouse Observability Stack への移行向けランディングページ'
show_related_blogs: true
keywords: ['Elasticsearch']
doc_type: 'landing-page'
---

このガイドでは、Elastic Stack から ClickStack への移行に向けた包括的なアプローチを解説します。オブザーバビリティ系ワークロードにおける ClickHouse の強みを活かしつつ、リスクを最小化するための並行稼働戦略に焦点を当てます。 

| Section | Description |
|---------|-------------|
| [Introduction](/use-cases/observability/clickstack/migration/elastic/intro) | 移行プロセスの概要と主要な検討事項 |
| [Concepts](/use-cases/observability/clickstack/migration/elastic/concepts) | Elastic と ClickStack における同等の概念の整理 |
| [Types](/use-cases/observability/clickstack/migration/elastic/types) | Elasticsearch の型を ClickHouse における対応する型へマッピング |
| [Search](/use-cases/observability/clickstack/migration/elastic/search) | 検索機能とクエリ構文の比較 |
| [Migrating Data](/use-cases/observability/clickstack/migration/elastic/migrating-data) | データ移行と並行稼働のための戦略 |
| [Migrating Agents](/use-cases/observability/clickstack/migration/elastic/migrating-agents) | Elastic エージェントから OpenTelemetry への移行 |
| [Migrating SDKs](/use-cases/observability/clickstack/migration/elastic/migrating-sdks) | Elastic APM エージェントを OpenTelemetry SDK の利用へ置き換え |