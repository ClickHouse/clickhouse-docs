---
slug: /use-cases/observability/clickstack/faq
title: 'ClickStack FAQ'
sidebar_label: 'FAQ'
pagination_prev: null
pagination_next: null
description: 'ClickStack のアラート、ダッシュボード、ドリルダウン、およびメトリクス探索に関するよくある質問。'
doc_type: 'guide'
keywords: ['ClickStack', 'FAQ', 'alerting', 'dashboards', 'drill-downs', 'metrics discovery']
---

このページでは、ClickStack のアラート機能、ダッシュボードとドリルダウン機能、メトリクス探索機能などに関するよくある質問に回答します。

## アラート機能 \{#alerting\}

<details>
<summary><strong>ClickStack はどのような種類のアラートをサポートしていますか？</strong></summary>

ClickStack は次の 2 種類のアラートをサポートしています。

- [Search alerts](/use-cases/observability/clickstack/alerts#search-alerts) — 一致するログまたはトレース結果の数が、一定時間内でしきい値を超える／下回ると通知をトリガーします。
- [Dashboard chart alerts](/use-cases/observability/clickstack/alerts#dashboard-alerts) — ダッシュボードタイル上にプロットされたメトリクスが定義済みのしきい値を超える／下回ったときに通知をトリガーします。

どちらのアラートタイプも静的なしきい値条件を使用します。詳細は [Alerts](/use-cases/observability/clickstack/alerts) を参照してください。

</details>

<details>
<summary><strong>比率、p95/p99、複数メトリクスの式など、複雑なメトリクス条件でアラートを設定できますか？</strong></summary>

2 つのメトリクスの比率や p95、p99 の値は、[chart builder](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) UI を使ってダッシュボードタイル上にプロットできます。そのタイルに対して、しきい値ベースのアラートを作成できます。

ただし、ClickStack は現在次の機能をサポートしていません。

- メトリクス向けのカスタム SQL クエリに基づくアラート。
- 複数の条件または複数メトリクスを 1 つのアラートにまとめたアラートルール。
- 動的または異常検知ベースのアラート条件（異常検知は対応予定です）。

複雑なメトリクスに対してアラートする必要がある場合は、まずダッシュボードチャートとして可視化を作成し、そのチャートにしきい値アラートを紐付ける方法を推奨します。

</details>

<details>
<summary><strong>アラート用途に materialized views を使えますか？</strong></summary>

materialized views は、該当するアラートに対しては ClickStack により自動的に利用されます。ただし、materialized views は現在、OpenTelemetry メトリクスのデータソースではサポートされていません。メトリクスについては、ClickStack はデフォルトの [ClickHouse OpenTelemetry metrics schema](/use-cases/observability/clickstack/ingesting-data/schemas) と組み合わせた場合に最も良く機能します。materialized views の詳細については、[Materialized views](/use-cases/observability/clickstack/materialized_views) を参照してください。

</details>

## ダッシュボードとドリルダウン \{#dashboards-and-drill-downs\}

<details>
<summary><strong>ClickStack はパラメーター化されたダッシュボードやダッシュボード変数をサポートしていますか？</strong></summary>

ClickStack は、ClickHouse からクエリされたデータで値が自動的に設定される、ダッシュボード上のカスタムドロップダウンフィルターをサポートしています。これらのフィルターにより、ダッシュボード上のすべてのタイルを特定の値（例: サービス名、環境、ホスト）に動的にスコープできます。

ClickStack は現在、Grafana のテンプレート変数のような再利用可能なダッシュボード変数はサポートしていません。ClickStack はデータソースとして ClickHouse のみを利用するため、変数の抽象化レイヤーを必要とせずに、ドリルダウンやフィルタリング機能をネイティブに提供できます。

ダッシュボードの作成やフィルターの適用の詳細については、[Dashboards](/use-cases/observability/clickstack/dashboards) を参照してください。

</details>

<details>
<summary><strong>どのようなドリルダウン機能が利用できますか？</strong></summary>

ClickStack は次のドリルダウンワークフローをサポートしています。

- [ダッシュボードレベルのフィルタリング](/use-cases/observability/clickstack/dashboards#filter-dashboards) — ダッシュボードレベルで適用された Lucene または SQL フィルターと時間範囲の調整は、すべてのタイルに伝播します。
- カスタムダッシュボードフィルター — カスタムダッシュボードでは、データから取得した値で自動的に設定される明示的なフィルターコントロールを利用でき、ユーザーはクエリを手動で記述することなく、すべてのタイルのスコープを絞り込むことができます。
- クリックしてイベントを表示 — ダッシュボードタイル内のデータをクリックし、**View Events** を選択すると、関連するログおよびトレースデータ用のフィルターが適用された状態で [Search](/use-cases/observability/clickstack/search) ページに遷移します。
- [事前構築されたダッシュボードのドリルダウン](/use-cases/observability/clickstack/dashboards#presets) — [Services](/use-cases/observability/clickstack/dashboards#services-dashboard)、[ClickHouse](/use-cases/observability/clickstack/dashboards#clickhouse-dashboard)、[Kubernetes](/use-cases/observability/clickstack/dashboards#kubernetes-dashboard) ダッシュボードには、タブ間でのよりリッチな組み込みドリルダウンナビゲーションが含まれています。

1 つのカスタムダッシュボードから別のカスタムダッシュボードへ（ダッシュボード → ダッシュボード → 詳細ビュー）といった多段階のドリルダウンは、現在サポートされていません。

:::note
**View Events** ドリルダウンは、ログおよびトレースデータと組み合わせた場合に最も効果的です。メトリクスデータは [Search](/use-cases/observability/clickstack/search) ページ上で表示できないため、メトリクスタイルからドリルダウンすると、代わりに選択した時間枠付近のログへのリンクが作成されます。
:::

</details>

## メトリクスのディスカバリー \{#metrics-discovery\}

<details>
<summary><strong>メトリクスを閲覧・検索するための UI はありますか？</strong></summary>

![Metric Attribute Explorer](/images/clickstack/faq/metrics-explorer.png)

メトリクス名は、[チャートビルダー](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) 内のメトリクス名ドロップダウンから確認できます。メトリクスを選択すると、Metric Attribute Explorer パネルにそのメトリクスの説明、単位、利用可能な属性とそれぞれの値が表示されます。これにより、属性をブラウズし、そのままパネルからフィルターや group-by フィールドとして追加できます。

現在、ログ検索の UI に相当する専用のメトリクス検索ページはありません。メトリクスのディスカバリーを改善することは、現在進行中の開発テーマです。

</details>

<details>
<summary><strong>メトリクスのディスカバリーは、長期的にも SQL ベースのアプローチを想定していますか？</strong></summary>

いいえ。現時点でも SQL クエリを使ってメトリクスを探索することは可能ですが、これは長期的に意図しているアプローチではありません。メトリクスのディスカバリーを改善するツールは、現在積極的に開発されています。

</details>

## さらなる参考資料 \{#further-reading\}

- [Alerts](/use-cases/observability/clickstack/alerts) — 検索アラート、ダッシュボードチャートアラート、Webhook 連携。
- [Dashboards](/use-cases/observability/clickstack/dashboards) — 可視化の作成、ダッシュボードの構築、フィルターの適用。
- [Search](/use-cases/observability/clickstack/search) — Lucene および SQL 構文を用いたログとトレースのクエリ実行。
- [Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) — ログ、トレース、メトリクス向けの OpenTelemetry データスキーマ。
- [Architecture](/use-cases/observability/clickstack/architecture) — ClickStack コンポーネントとその構成・連携。