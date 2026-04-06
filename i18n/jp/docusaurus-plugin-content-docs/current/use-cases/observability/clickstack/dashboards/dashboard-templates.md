---
slug: /use-cases/observability/clickstack/dashboards/dashboard-templates
title: 'ダッシュボードテンプレート'
sidebar_label: 'ダッシュボードテンプレート'
pagination_prev: null
pagination_next: null
description: 'ClickStack で事前構築済みのダッシュボードテンプレートをインポートする'
doc_type: 'guide'
keywords: ['ClickStack', 'ダッシュボード', 'テンプレート', 'インポート', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import browse_dashboard_template from '@site/static/images/use-cases/observability/browse-dashboard-template.png';
import dashboard_template_gallery from '@site/static/images/use-cases/observability/dashboard-template-gallery.png';
import import_dashboard_template from '@site/static/images/use-cases/observability/import-dashboard-template.png';

ClickStack には、一般的なインフラストラクチャおよびアプリケーションのメトリクスをすぐに可視化できる、あらかじめ用意されたダッシュボードテンプレートのライブラリが含まれています。

## 利用可能なテンプレートを参照する \{#browsing-templates\}

組み込みのテンプレートライブラリを参照するには、**ダッシュボード** に移動し、**ダッシュボードテンプレートを参照** をクリックします。

<Image img={browse_dashboard_template} alt="ダッシュボードテンプレートを参照ボタン" size="lg" />

テンプレートギャラリーが開き、テンプレートがカテゴリ別に表示されます。対象のテンプレートのインポートフローを開始するには、**インポート** をクリックします。

<Image img={dashboard_template_gallery} alt="ダッシュボードテンプレートギャラリー" size="lg" />

## テンプレートのインポート \{#importing-a-template\}

テンプレートをインポートするには、ダッシュボード内の各可視化に対してデータソースを設定する必要があります。各可視化のドロップダウンからデータソースを選択し、`Finish Import` をクリックします。

<Image img={import_dashboard_template} alt="ダッシュボードテンプレートのインポート" size="lg" />

## 事前構築されたテンプレート \{#pre-built-templates\}

### OTel ランタイムメトリクス \{#otel-runtime-metrics\}

組み込みの OTel ランタイムメトリクス テンプレートは、[OpenTelemetry ランタイムメトリクス](https://opentelemetry.io/docs/specs/semconv/runtime/) で計装されたアプリケーション向けに設計されています。

| Template                    | Description                                           |
| --------------------------- | ----------------------------------------------------- |
| **.NET Runtime Metrics**    | .NET アプリケーションの GC コレクション、ヒープサイズ、スレッドプール使用率、アセンブリ数     |
| **Go Runtime Metrics**      | Go アプリケーションの goroutine 数、GC 一時停止時間、ヒープ使用量、メモリ統計       |
| **JVM Runtime Metrics**     | JVM ベースのアプリケーションのヒープメモリと非ヒープメモリ、GC 継続時間、スレッド数、クラス読み込み |
| **Node.js Runtime Metrics** | Node.js アプリケーションのイベントループ遅延、ヒープ使用量、CPU 使用率、V8 メモリ      |

注意:

* 各テンプレートには、サービスの [`telemetry.sdk.language`](https://opentelemetry.io/docs/specs/semconv/registry/attributes/telemetry/#telemetry-sdk-language) リソース属性がダッシュボードのランタイムと一致する場合に適用される[カスタムフィルター](./#custom-filters)が設定されています。
  * ClickHouse のメトリクステーブル schema をカスタマイズしている環境では、正しい Service Name カラムと Resource Attributes カラムをクエリするために、このフィルターの調整が必要になることがあります。
  * 高トラフィック環境では、`ResourceAttributes['telemetry.sdk.language']` カラムを[マテリアライズ](../managing/performance_tuning.md#materialize-frequently-queried-attributes)することで、フィルターの読み込み時間を短縮できます。
* テンプレートは公開時点で最新の OTel Semantic Conventions を参照しており、OTel Spec の更新に合わせて定期的に更新されます。古い OTel SDKs で計装されたサービスでは、古いメトリクス名を参照するように可視化を[編集](./#dashboards-editing-visualizations)する必要がある場合があります。