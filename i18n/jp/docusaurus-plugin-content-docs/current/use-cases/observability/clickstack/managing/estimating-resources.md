---
slug: /use-cases/observability/clickstack/estimating-resources
title: 'リソースの見積もり'
sidebar_label: 'リソースの見積もり'
pagination_prev: null
pagination_next: null
description: 'Managed ClickStack デプロイメント向けのリソース見積もりのガイド'
doc_type: 'guide'
keywords: ['ClickStack', 'リソース', 'サイジング', 'コンピュート', '本番', '容量計画']
---

import ResourceEstimation from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/managing/_snippets/_resource_estimation.md';

<ResourceEstimation />

## オブザーバビリティワークロードの分離 \{#isolating-workloads\}

すでにリアルタイムのアプリケーション分析など、他のワークロードをサポートしている**既存の ClickHouse Cloud サービス**に ClickStack を追加する場合は、オブザーバビリティのトラフィックを分離することを強く推奨します。

[**Managed Warehouses**](/cloud/reference/warehouses) を使用して、ClickStack 専用の**子サービス**を作成します。これにより、次のことが可能になります。

* 既存のアプリケーションから、取り込みとクエリの負荷を分離する
* オブザーバビリティワークロードを個別にスケールする
* オブザーバビリティのクエリが本番環境の分析に影響するのを防ぐ
* 必要に応じて、サービス間で同じ基盤データセットを共有する

この方法により、オブザーバビリティデータの増加に応じて ClickStack を個別にスケールできる一方で、既存のワークロードへの影響を避けられます。

より大規模なデプロイメントやカスタムのサイジングに関するガイダンスが必要な場合は、より正確な見積もりについてサポートまでお問い合わせください。