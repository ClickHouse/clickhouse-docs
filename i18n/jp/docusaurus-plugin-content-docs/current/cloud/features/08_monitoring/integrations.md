---
title: 'コミュニティおよびパートナーとの統合'
slug: /cloud/monitoring/integrations
description: 'サードパーティのモニタリング統合と ClickHouse Cloud の Billing & Usage API'
keywords: ['クラウド', 'モニタリング', 'datadog', 'grafana', 'コミュニティ', 'billing', 'usage api']
sidebar_label: '統合'
sidebar_position: 6
doc_type: 'guide'
---

import CommunityMonitoring from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';

# コミュニティおよびパートナーとの統合 \{#community-and-partner-integrations\}

## Datadog との直接統合 \{#direct-datadog\}

Datadog は、システムテーブルを直接クエリする Agent 向けの ClickHouse Monitoring プラグインを提供しています。この統合では、`clusterAllReplicas` 機能によるクラスタ認識を通じて、データベースを包括的に監視できます。

:::warning[ClickHouse Cloud では非推奨]
システムテーブルをクエリする Datadog Agent の直接統合は、コスト最適化のためのアイドル動作との非互換性と、クラウドプロキシレイヤーの運用上の制限により、ClickHouse Cloud デプロイでは推奨されません。
:::

代わりに、Datadog の [Agent](https://docs.datadoghq.com/agent/?tab=Linux) と [OpenMetrics integration](https://docs.datadoghq.com/integrations/openmetrics/) を使用して、ClickHouse Cloud の Prometheus エンドポイントからメトリクスを収集してください。このアプローチはサービスのアイドル動作を尊重し、監視ワークロードと本番ワークロードの運用上の分離を維持します。設定のガイダンスについては、[Datadog の Prometheus および OpenMetrics 統合のドキュメント](https://docs.datadoghq.com/integrations/openmetrics/) を参照してください。

Prometheus エンドポイントのセットアップの詳細については、[Prometheus integration page](/integrations/prometheus#integrating-with-datadog) を参照してください。

<CommunityMonitoring/>

## Billing and Usage API \{#billing-usage-api\}

Billing &amp; Usage API を使用すると、Cloud 組織の請求情報および使用状況のレコードにプログラムからアクセスできます。これは、カスタムのコストモニタリングダッシュボードを構築したり、請求データを既存の財務レポートワークフローに統合したりする場合に役立ちます。

API リファレンス全体については、[Billing API ドキュメント](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Billing) を参照してください。