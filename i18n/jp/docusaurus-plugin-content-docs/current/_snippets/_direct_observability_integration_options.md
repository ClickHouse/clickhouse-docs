import Image from "@theme/IdealImage"
import AdvancedDashboard from "@site/static/images/cloud/manage/monitoring/advanced_dashboard.png"
import NativeAdvancedDashboard from "@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png"

### Grafanaプラグインの直接統合 {#direct-grafana}

Grafana用のClickHouseデータソースプラグインを使用すると、システムテーブルを介してClickHouseから直接データを可視化および探索できます。このアプローチは、パフォーマンス監視や詳細なシステム分析用のカスタムダッシュボード作成に適しています。
プラグインのインストールと設定の詳細については、ClickHouseの[データソースプラグイン](/integrations/grafana)を参照してください。事前構築されたダッシュボードとアラートルールを含むPrometheus-Grafanaミックスインを使用した完全な監視セットアップについては、[新しいPrometheus-Grafanaミックスインを使用したClickHouseの監視](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in)を参照してください。

### Datadogの直接統合 {#direct-datadog}

Datadogは、システムテーブルに直接クエリを実行するエージェント用のClickhouse Monitoringプラグインを提供しています。この統合により、clusterAllReplicas機能を通じてクラスタを認識した包括的なデータベース監視が可能になります。
:::note
この統合は、コスト最適化のためのアイドル動作との非互換性およびクラウドプロキシレイヤーの運用上の制限により、ClickHouse Cloudデプロイメントには推奨されません。
:::

### システムテーブルの直接使用 {#system-tables}

ユーザーは、ClickHouseのシステムテーブル、特に`system.query_log`に接続して直接クエリを実行することで、詳細なクエリパフォーマンス分析を実行できます。SQLコンソールまたはclickhouse clientを使用することで、チームは低速なクエリの特定、リソース使用状況の分析、組織全体の使用パターンの追跡が可能になります。

**クエリパフォーマンス分析**

ユーザーは、システムテーブルのクエリログを使用してクエリパフォーマンス分析を実行できます。

**クエリ例**: すべてのクラスタレプリカにわたって実行時間が長い上位5つのクエリを検索:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type='QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```
