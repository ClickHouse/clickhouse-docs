---
title: 'システムテーブルをクエリする'
slug: /cloud/monitoring/system-tables
description: 'システムテーブルを直接クエリして ClickHouse Cloud をモニタリング'
keywords: ['cloud', 'モニタリング', 'システムテーブル', 'query_log', 'clusterAllReplicas', 'オブザーバビリティダッシュボード']
sidebar_label: 'System tables'
sidebar_position: 5
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';

# ClickHouse の system データベースをクエリする \{#querying-clickhouses-system-database\}

すべての ClickHouse インスタンスには、次の情報を含む一連の[システムテーブル](/operations/system-tables/overview)が `system` データベースに用意されています。

* サーバーの状態、プロセス、および環境。
* サーバーの内部プロセス。
* ClickHouse バイナリのビルド時に使用されたオプション。

これらのテーブルを直接クエリすると、特に詳細な内部調査やデバッグを行う際に、ClickHouse デプロイメントのモニタリングに役立ちます。

## ClickHouse Cloud コンソールを使用する \{#using-cloud-console\}

ClickHouse Cloud コンソールには、システムテーブルのクエリに使用できる [SQL コンソール](/cloud/get-started/sql-console) と [ダッシュボードツール](/cloud/manage/dashboards) が用意されています。たとえば、以下のクエリでは、過去 2 時間に新しいパーツがいくつ、またどのくらいの頻度で作成されたかを確認できます。

```sql
SELECT
    count() AS new_parts,
    toStartOfMinute(event_time) AS modification_time_m,
    table,
    sum(rows) AS total_written_rows,
    formatReadableSize(sum(size_in_bytes)) AS total_bytes_on_disk
FROM clusterAllReplicas(default, system.part_log)
WHERE (event_type = 'NewPart') AND (event_time > (now() - toIntervalHour(2)))
GROUP BY
    modification_time_m,
    table
ORDER BY
    modification_time_m ASC,
    table DESC
```

:::tip[その他のクエリ例]
追加のモニタリングクエリについては、以下のリソースを参照してください。

* [トラブルシューティングに役立つクエリ](/knowledgebase/useful-queries-for-troubleshooting)
* [insert クエリのモニタリングとトラブルシューティング](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
* [select クエリのモニタリングとトラブルシューティング](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)

これらのクエリを使用して、Cloud コンソールに[カスタムダッシュボードを作成](https://clickhouse.com/blog/essential-monitoring-queries-creating-a-dashboard-in-clickHouse-cloud)することもできます。
:::


## 組み込みの高度なオブザーバビリティダッシュボード \{#built-in-advanced-observability-dashboard\}

ClickHouse には組み込みの高度なオブザーバビリティダッシュボード機能があり、`system.dashboards` に含まれる Cloud Overview metrics を表示するために `$HOST:$PORT/dashboard` からアクセスできます（ユーザー名とパスワードが必要です）。

<Image img={NativeAdvancedDashboard} size="lg" alt="Native advanced observability dashboard" border/>

:::note
このダッシュボードでは ClickHouse インスタンスへの直接認証が必要であり、追加の認証なしで Cloud コンソール UI からアクセスできる [Cloud Console Advanced Dashboard](/cloud/monitoring/cloud-console#advanced-dashboard) とは別のものです。
:::

利用可能なビジュアライゼーションと、それらをトラブルシューティングに活用する方法の詳細については、[高度なダッシュボードのドキュメント](/cloud/manage/monitor/advanced-dashboard) を参照してください。

## ノードやバージョンをまたいだクエリ \{#querying-across-nodes\}

クラスタ全体を包括的に把握するには、`clusterAllReplicas` 関数を `merge` 関数と組み合わせて使用します。`clusterAllReplicas` 関数を使用すると、&quot;default&quot; クラスタ内のすべてのレプリカにまたがってシステムテーブルをクエリでき、ノード固有のデータを単一の結果に集約できます。`merge` 関数と組み合わせることで、クラスタ内の特定のテーブルに対応するすべてのシステムデータを対象にできます。

たとえば、直近 1 時間で、すべてのレプリカにまたがって最も長時間実行されている上位 5 件のクエリを見つけるには:

```sql
SELECT
    type,
    event_time,
    query_duration_ms,
    query,
    read_rows,
    tables
FROM clusterAllReplicas(default, system.query_log)
WHERE event_time >= (now() - toIntervalMinute(60)) AND type = 'QueryFinish'
ORDER BY query_duration_ms DESC
LIMIT 5
FORMAT VERTICAL
```

このアプローチは、クラスタ全体にわたる運用のモニタリングとデバッグにおいて特に有用であり、ユーザーが ClickHouse Cloud のデプロイ環境の健全性とパフォーマンスを効果的に分析できるようにします。

詳細については、[ノードをまたいだクエリ](/operations/system-tables/overview#querying-across-nodes)を参照してください。


## システム上の考慮事項 \{#system-considerations\}

:::warning
システムテーブルに直接クエリを実行すると、本番サービスにクエリ負荷がかかるほか、ClickHouse Cloud インスタンスがアイドル状態に移行できなくなり（コストに影響する可能性があります）、モニタリングの可用性が本番システムの健全性に依存することになります。本番システムに障害が発生した場合、モニタリングも影響を受ける可能性があります。
:::

運用上の分離を保ちながら本番環境をリアルタイムでモニタリングするには、[Prometheus-compatible metrics endpoint](/integrations/prometheus) または [Cloud Console dashboards](/cloud/monitoring/cloud-console) の使用を検討してください。これらはいずれも事前にスクレイプされた metrics を使用し、基盤となるサービスに対してクエリを発行しません。

## 関連ページ \{#related\}

- [System tables reference](/operations/system-tables/overview) — 利用可能なすべてのシステムテーブルの完全なリファレンス
- [Cloud Console monitoring](/cloud/monitoring/cloud-console) — セットアップ不要で、サービスのパフォーマンスに影響しないダッシュボード
- [Prometheus endpoint](/integrations/prometheus) — metrics を外部のモニタリングツールにエクスポート
- [Advanced dashboard](/cloud/manage/monitor/advanced-dashboard) — ダッシュボードのビジュアライゼーションに関する詳細なリファレンス