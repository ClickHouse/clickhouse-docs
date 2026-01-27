import Image from '@theme/IdealImage';
import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

### Grafana プラグインによる直接統合 \{#direct-grafana\}

Grafana 向け ClickHouse データソースプラグインを使用すると、ClickHouse のシステムテーブルを利用して、ClickHouse から直接データを可視化および探索できます。このアプローチは、パフォーマンスの監視や、詳細なシステム分析のためのカスタムダッシュボードの作成に適しています。
プラグインのインストールおよび設定の詳細については、ClickHouse の [data source plugin](/integrations/grafana) を参照してください。あらかじめ作成されたダッシュボードとアラートルールを備えた Prometheus-Grafana ミックスインを用いた完全な監視セットアップについては、[Monitor ClickHouse with the new Prometheus-Grafana mix-in](https://clickhouse.com/blog/monitor-with-new-prometheus-grafana-mix-in) を参照してください。

### Datadog との直接統合 \{#direct-datadog\}

Datadog は、エージェント向けに ClickHouse Monitoring プラグインを提供しており、システムテーブルに直接クエリを実行します。この統合により、clusterAllReplicas 機能を通じてクラスタを意識した包括的なデータベース監視が可能になります。
:::note
この統合は、コスト最適化を目的としたアイドル時の動作との非互換性およびクラウドプロキシレイヤーの運用上の制約により、ClickHouse Cloud のデプロイメントでは推奨されません。
:::

### システムテーブルを直接利用する \{#system-tables\}

特に `system.query_log` などの ClickHouse システムテーブルに接続して直接クエリを実行することで、クエリパフォーマンスの詳細な分析を行うことができます。SQL コンソールまたは clickhouse client を使用することで、チームは低速クエリを特定し、リソース使用状況を分析し、組織全体にわたる利用パターンを追跡できます。

**クエリパフォーマンス分析**

システムテーブルのクエリログを使用してクエリパフォーマンス分析を実行できます。

**クエリ例**: すべてのクラスタレプリカにまたがる実行時間の長いクエリ上位 5 件を抽出します:

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
