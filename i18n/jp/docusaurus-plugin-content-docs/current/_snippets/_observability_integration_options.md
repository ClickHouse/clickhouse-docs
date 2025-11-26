import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';



## 連携例 {#examples}

外部連携を活用することで、組織は既存のモニタリングワークフローを維持しつつ、慣れ親しんだツールに関するチームの専門性を生かし、現在のプロセスを妨げたり大規模な再トレーニング投資を行ったりすることなく、ClickHouse のモニタリングをインフラ全体のオブザーバビリティに統合できます。
チームは既存のアラートルールやエスカレーション手順を ClickHouse のメトリクスに適用しつつ、統合されたオブザーバビリティプラットフォーム上で、アプリケーションおよびインフラのヘルスとデータベースパフォーマンスを関連付けて把握できます。このアプローチにより、現行のモニタリング環境への投資効果を最大化し、統合されたダッシュボードと使い慣れたツールインターフェースを通じて、トラブルシューティングをより迅速に行えるようになります。

### Grafana Cloud によるモニタリング {#grafana}

Grafana は、ネイティブプラグイン連携と Prometheus ベースのアプローチの両方を通じて ClickHouse のモニタリングを提供します。Prometheus エンドポイント連携により、モニタリングワークロードと本番ワークロードの運用上の分離を維持しながら、既存の Grafana Cloud インフラ内での可視化を可能にします。設定方法については [Grafana の ClickHouse ドキュメント](https://grafana.com/docs/grafana-cloud/monitor-infrastructure/integrations/integration-reference/integration-clickhouse/) を参照してください。

### Datadog によるモニタリング {#datadog}
Datadog は、サービスのアイドル状態の挙動を考慮しつつ、適切なクラウドサービスモニタリングを提供する専用の API 連携を開発中です。それまでの間、チームは ClickHouse の Prometheus エンドポイント経由で OpenMetrics 連携アプローチを利用することで、運用上の分離とコスト効率の高いモニタリングを実現できます。設定方法については [Datadog の Prometheus および OpenMetrics 連携ドキュメント](https://docs.datadoghq.com/integrations/openmetrics/) を参照してください。

### ClickStack {#clickstack}

ClickStack は、深いシステム解析とデバッグのために ClickHouse が推奨するオブザーバビリティソリューションであり、ClickHouse をストレージエンジンとして用いながら、ログ、メトリクス、トレースを統合的に扱うプラットフォームを提供します。このアプローチは、ClickStack の UI である HyperDX が ClickHouse インスタンス内の system テーブルに直接接続することに依存しています。
HyperDX には、Select、Insert、および Infrastructure のタブを備えた ClickHouse に特化したダッシュボードが標準で用意されています。チームは Lucene または SQL 構文を使用して system テーブルやログを検索できるほか、Chart Explorer を通じてカスタム可視化を作成し、詳細なシステム解析を行うこともできます。
このアプローチは、リアルタイムの本番アラートというよりも、複雑な問題のデバッグ、パフォーマンス解析、システムの深部に対する詳細な調査に最適です。

:::note
このアプローチでは、HyperDX が system テーブルに直接クエリを発行するため、アイドル状態のサービスが起動される点に注意してください。
:::