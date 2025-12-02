---
slug: /use-cases/observability/clickstack/dashboards
title: 'ClickStack を用いた可視化とダッシュボード'
sidebar_label: 'ダッシュボード'
pagination_prev: null
pagination_next: null
description: 'ClickStack を用いた可視化とダッシュボード'
doc_type: 'guide'
keywords: ['clickstack', 'dashboards', 'visualization', 'monitoring', 'observability']
---

import Image from '@theme/IdealImage';
import visualization_1 from '@site/static/images/use-cases/observability/hyperdx-visualization-1.png';
import visualization_2 from '@site/static/images/use-cases/observability/hyperdx-visualization-2.png';
import visualization_3 from '@site/static/images/use-cases/observability/hyperdx-visualization-3.png';
import dashboard_1 from '@site/static/images/use-cases/observability/hyperdx-dashboard-1.png';
import dashboard_2 from '@site/static/images/use-cases/observability/hyperdx-dashboard-2.png';
import dashboard_3 from '@site/static/images/use-cases/observability/hyperdx-dashboard-3.png';
import dashboard_4 from '@site/static/images/use-cases/observability/hyperdx-dashboard-4.png';
import dashboard_5 from '@site/static/images/use-cases/observability/hyperdx-dashboard-5.png';
import dashboard_filter from '@site/static/images/use-cases/observability/hyperdx-dashboard-filter.png';
import dashboard_save from '@site/static/images/use-cases/observability/hyperdx-dashboard-save.png';
import dashboard_search from '@site/static/images/use-cases/observability/hyperdx-dashboard-search.png';
import dashboard_edit from '@site/static/images/use-cases/observability/hyperdx-dashboard-edit.png';
import dashboard_clickhouse from '@site/static/images/use-cases/observability/hyperdx-dashboard-clickhouse.png';
import dashboard_services from '@site/static/images/use-cases/observability/hyperdx-dashboard-services.png';
import dashboard_kubernetes from '@site/static/images/use-cases/observability/hyperdx-dashboard-kubernetes.png';
import Tagging from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_clickstack_tagging.mdx';

ClickStack はイベントの可視化をサポートしており、HyperDX に組み込みのチャート機能を備えています。これらのチャートはダッシュボードに追加し、他のユーザーと共有できます。

可視化は、トレース、メトリクス、ログ、または任意のユーザー定義のワイドイベントスキーマに基づいて作成できます。


## 可視化の作成 {#creating-visualizations}

HyperDX の **Chart Explorer** インターフェイスを使用すると、メトリクス、トレース、ログを時間経過とともに可視化でき、データ分析用の簡易な可視化をすばやく作成できます。このインターフェイスは、ダッシュボード作成時にも再利用されます。以下のセクションでは、Chart Explorer を使用して可視化を作成する手順を説明します。

各可視化は、まず **データソース** を選択し、その後に **メトリクス** を指定し、必要に応じて **フィルター式** と **GROUP BY** フィールドを設定するところから始まります。概念的には、HyperDX における可視化は、内部的には SQL の `GROUP BY` クエリとして表現されます。ユーザーは、選択したディメンションに対して集計するメトリクスを定義します。

たとえば、サービス名ごとのエラー数（`count()`）をグラフ化することができます。

以下の例では、ガイド「[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data)」で説明している、[sql.clickhouse.com](https://sql.clickhouse.com) で利用可能なリモートデータセットを使用します。**[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) にアクセスすることで、これらの例を再現することもできます。**

<VerticalStepper headerLevel="h3">

### Chart Explorer に移動する {#navigate-chart-explorer}

左側のメニューから `Chart Explorer` を選択します。

<Image img={visualization_1} alt="Chart Explorer" size="lg"/>

### 可視化を作成する {#create-visualization}

次の例では、サービス名ごとに時間経過に沿って平均リクエスト時間をグラフ化します。これには、メトリクス、列（SQL 式でも可）、および集計フィールドを指定する必要があります。

上部メニューから `Line/Bar` の可視化タイプを選択し、その後 `Traces`（または [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合は `Demo Traces`）データセットを選択します。次の値を設定します。

- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

<Image img={visualization_2} alt="Simple visualization" size="lg"/>

SQL の `WHERE` 句または Lucene 構文を使用してイベントをフィルタリングできるほか、イベントを可視化する時間範囲も設定できます。複数系列にも対応しています。

たとえば、フィルター `ServiceName:"frontend"` を追加して、サービス `frontend` でフィルタリングします。さらに `Add Series` をクリックし、エイリアス `Count` を指定して、時間経過におけるイベント数を表す 2つ目の系列を追加します。

<Image img={visualization_3} alt="Simple visualization 2" size="lg"/>

:::note
可視化は、メトリクス、トレース、ログなど、任意のデータソースから作成できます。ClickStack はこれらすべてをワイドイベント（wide event）として扱います。任意の **数値列** を時間経過でグラフ化でき、**文字列**、**日付**、**数値** 列をグルーピングに使用できます。

この統一されたアプローチにより、一貫性があり柔軟なモデルを用いて、さまざまなテレメトリ種別にまたがるダッシュボードを構築できます。
:::

</VerticalStepper>

## ダッシュボードの作成 {#creating-dashboards}

ダッシュボードは、関連する可視化をまとめて扱えるようにし、ユーザーがメトリクスを比較したり、パターンを並べて確認したりして、システム内の潜在的な根本原因を特定できるようにします。これらのダッシュボードは、アドホックな調査にも、継続的なモニタリング用として保存して利用することもできます。

グローバルフィルターはダッシュボード単位で適用でき、そのダッシュボード内のすべての可視化に自動的に伝播します。これにより、チャート間で一貫したドリルダウンが可能になり、サービスやテレメトリ種別をまたいだイベントの相関付けが容易になります。

以下では、ログとトレースのデータソースを使用して 2 つの可視化を持つダッシュボードを作成します。これらの手順は、ガイド「[Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data)」で説明されているように、[play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) 上、もしくはローカルから [sql.clickhouse.com](https://sql.clickhouse.com) 上のデータセットに接続することで再現できます。

<VerticalStepper headerLevel="h3">

### Dashboards 画面に移動する {#navigate-dashboards}

左側のメニューから `Dashboards` を選択します。

<Image img={dashboard_1} alt="ダッシュボードを作成する" size="lg"/>

既定では、ダッシュボードはアドホックな調査を支援するため、一時的なものとして扱われます。 

自前の HyperDX インスタンスを使用している場合は、`Create New Saved Dashboard` をクリックすることで、このダッシュボードを後から保存できるようにできます。読み取り専用環境の [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合、このオプションは利用できません。

### 可視化を作成する – サービスごとの平均リクエスト時間 {#create-a-tile}

`Add New Tile` を選択して、可視化作成パネルを開きます。

上部メニューから可視化タイプとして `Line/Bar` を選択し、続いてデータセットとして `Traces`（もしくは [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合は `Demo Traces`）を選択します。サービス名ごとの時間経過に伴う平均リクエスト時間を表示するチャートを作成するため、以下の値を設定します:

- Chart Name: `Average duration by service`  
- Metric: `Average`  
- Column: `Duration/1000`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Average Time`

`Save` をクリックする前に **再生（play）** ボタンをクリックします。

<Image img={dashboard_2} alt="ダッシュボード可視化の作成" size="lg"/>

可視化のサイズを変更し、ダッシュボードの幅いっぱいに配置します。

<Image img={dashboard_3} alt="ビジュアルを含むダッシュボード" size="lg"/>

### 可視化を作成する – サービスごとの時間経過に伴うイベント数 {#create-a-tile-2}

`Add New Tile` を選択して、可視化作成パネルを開きます。

上部メニューから可視化タイプとして `Line/Bar` を選択し、続いてデータセットとして `Logs`（もしくは [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) を使用している場合は `Demo Logs`）を選択します。サービス名ごとの時間経過に伴うイベント数を表示するチャートを作成するため、以下の値を設定します:

- Chart Name: `Event count by service`  
- Metric: `Count of Events`  
- Where: `<empty>`  
- Group By: `ServiceName`  
- Alias: `Count of events`

`Save` をクリックする前に **再生（play）** ボタンをクリックします。

<Image img={dashboard_4} alt="ダッシュボード可視化 2" size="lg"/>

可視化のサイズを変更し、ダッシュボードの幅いっぱいに配置します。

<Image img={dashboard_5} alt="ビジュアルを含むダッシュボード 2" size="lg"/>

### ダッシュボードをフィルタリングする {#filter-dashboards}

Lucene または SQL フィルターと時間範囲は、ダッシュボードレベルで適用でき、すべての可視化に自動的に伝播します。

<Image img={dashboard_filter} alt="フィルタリングされたダッシュボード" size="lg"/>

例として、ダッシュボードに Lucene フィルター `ServiceName:"frontend"` を適用し、時間範囲を直近 3 時間（Last 3 hours）を対象とするように変更します。これにより、可視化が `frontend` サービスのデータのみを反映していることを確認できます。

ダッシュボードは自動的に保存されます。ダッシュボード名を設定するには、タイトルを選択して編集し、`Save Name` をクリックします。 

<Image img={dashboard_save} alt="ダッシュボードの保存" size="lg"/>

</VerticalStepper>

## ダッシュボード - ビジュアライゼーションの編集 {#dashboards-editing-visualizations}

ビジュアライゼーションを削除、編集、または複製するには、その上にマウスオーバーして表示されるアクションボタンを使用します。

<Image img={dashboard_edit} alt="ダッシュボードの編集" size="lg"/>

## ダッシュボード - 一覧と検索 {#dashboard-listing-search}

ダッシュボードには左側のメニューからアクセスでき、内蔵の検索機能で特定のダッシュボードをすばやく見つけることができます。

<Image img={dashboard_search} alt="ダッシュボード検索" size="sm"/>

## ダッシュボードのタグ付け {#tagging}

<Tagging />

## プリセット {#presets}

HyperDX は、標準のダッシュボード付きでデプロイされます。

### ClickHouse ダッシュボード {#clickhouse-dashboard}

このダッシュボードは、ClickHouse を監視するための可視化を提供します。このダッシュボードに移動するには、左側のメニューからこのダッシュボードを選択します。

<Image img={dashboard_clickhouse} alt="ClickHouse ダッシュボード" size="lg"/>

このダッシュボードでは、**Selects**、**Inserts**、**ClickHouse Infrastructure** の監視をタブで切り替えて表示します。

:::note 必要な system テーブルへのアクセス権
このダッシュボードは、主要なメトリクスを可視化するために ClickHouse の [system テーブル](/operations/system-tables) を参照します。以下の権限が必要です。

`GRANT SHOW COLUMNS, SELECT(CurrentMetric_MemoryTracking, CurrentMetric_S3Requests, ProfileEvent_OSCPUVirtualTimeMicroseconds, ProfileEvent_OSReadChars, ProfileEvent_OSWriteChars, ProfileEvent_S3GetObject, ProfileEvent_S3ListObjects, ProfileEvent_S3PutObject, ProfileEvent_S3UploadPart, event_time) ON system.metric_log`

`GRANT SHOW COLUMNS, SELECT(active, database, partition, rows, table) ON system.parts`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, memory_usage, normalized_query_hash, query, query_duration_ms, query_kind, read_rows, tables, type, written_bytes, written_rows) ON system.query_log`

`GRANT SHOW COLUMNS, SELECT(event_date, event_time, hostname, metric, value) ON system.transposed_metric_log`
:::

### サービスダッシュボード {#services-dashboard}

サービスダッシュボードは、トレースデータに基づいて現在アクティブなサービスを表示します。これには、トレースが収集されており、有効な Traces データソースが構成されている必要があります。

サービス名はトレースデータから自動検出され、HTTP Services、Database、Errors の 3 つのタブに整理された一連の事前構築済みの可視化が提供されます。

可視化は Lucene または SQL の構文を使用してフィルタリングでき、時間範囲を調整して分析対象を絞り込むことができます。

<Image img={dashboard_services} alt="ClickHouse services" size="lg"/>

### Kubernetes ダッシュボード {#kubernetes-dashboard}

このダッシュボードでは、OpenTelemetry を通じて収集された Kubernetes イベントを確認・探索できます。高度なフィルタリング機能を備えており、Kubernetes のポッド、デプロイメント、ノード名、ネームスペース、クラスターでの絞り込みに加えて、フリーテキスト検索も実行できます。

Kubernetes のデータは、容易にナビゲーションできるように「Pods」「Nodes」「Namespaces」の 3 つのタブに整理されています。

<Image img={dashboard_kubernetes} alt="ClickHouse kubernetes" size="lg"/>