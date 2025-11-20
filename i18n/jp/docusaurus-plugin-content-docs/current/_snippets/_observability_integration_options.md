import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';



## 統合の例 {#examples}

外部統合により、組織は確立された監視ワークフローを維持し、使い慣れたツールに関する既存のチームの専門知識を活用し、現在のプロセスを中断したり大規模な再トレーニング投資を必要とすることなく、ClickHouseの監視をより広範なインフラストラクチャの可観測性に統合できます。
チームは既存のアラートルールとエスカレーション手順をClickHouseメトリクスに適用でき、統合された可観測性プラットフォーム内でデータベースのパフォーマンスをアプリケーションおよびインフラストラクチャの健全性と相関付けることができます。このアプローチは現在の監視セットアップのROIを最大化し、統合されたダッシュボードと使い慣れたツールインターフェースを通じて、より迅速なトラブルシューティングを可能にします。

### Grafana Cloud監視 {#grafana}

Grafanaは、直接プラグイン統合とPrometheusベースのアプローチの両方を通じてClickHouse監視を提供します。Prometheusエンドポイント統合は、監視と本番ワークロードの運用上の分離を維持しながら、既存のGrafana Cloudインフラストラクチャ内での可視化を可能にします。設定ガイダンスについては、[GrafanaのClickHouseドキュメント](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/)を参照してください。

### Datadog監視 {#datadog}

Datadogは、サービスのアイドリング動作を考慮しながら適切なクラウドサービス監視を提供する専用API統合を開発中です。それまでの間、チームはClickHouse PrometheusエンドポイントによるOpenMetrics統合アプローチを使用して、運用上の分離とコスト効率の高い監視を実現できます。設定ガイダンスについては、[DatadogのPrometheusおよびOpenMetrics統合ドキュメント](https://docs.datadoghq.com/integrations/openmetrics/)を参照してください。

### ClickStack {#clickstack}

ClickStackは、ClickHouseが推奨する深いシステム分析とデバッグのための可観測性ソリューションであり、ClickHouseをストレージエンジンとして使用してログ、メトリクス、トレースのための統合プラットフォームを提供します。このアプローチは、ClickStackのUIであるHyperDXに依存し、ClickHouseインスタンス内のシステムテーブルに直接接続します。
HyperDXには、Selects、Inserts、Infrastructureのタブを備えたClickHouseに特化したダッシュボードが付属しています。チームはLuceneまたはSQL構文を使用してシステムテーブルとログを検索し、Chart Explorerを介してカスタム可視化を作成して詳細なシステム分析を行うこともできます。
このアプローチは、リアルタイムの本番アラートではなく、複雑な問題のデバッグ、パフォーマンス分析、深いシステムの内部調査に最適です。

:::note
このアプローチは、HyperDXがシステムテーブルに直接クエリを実行するため、アイドル状態のサービスを起動することに注意してください。
:::
