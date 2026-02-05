---
slug: /use-cases/observability/clickstack/materialized_views
title: 'ClickStack - Materialized Views'
sidebar_label: 'Materialized Views'
description: 'materialized view を使用した ClickStack のパフォーマンスチューニング'
doc_type: 'guide'
keywords: ['clickstack', 'オブザーバビリティ', 'materialized views', 'パフォーマンス', '最適化', '可視化', '集約']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import edit_source from '@site/static/images/clickstack/materialized_views/edit_source.png';
import add_view from '@site/static/images/clickstack/materialized_views/add_view.png';
import select_metrics from '@site/static/images/clickstack/materialized_views/select_metrics.png';
import select_time_granularity from '@site/static/images/clickstack/materialized_views/select_time_granularity.png';
import select_min_time from '@site/static/images/clickstack/materialized_views/select_min_time.png';
import save_source from '@site/static/images/clickstack/materialized_views/save_source.png';
import generated_sql from '@site/static/images/clickstack/materialized_views/generated_sql.png';
import accelerated_visual from '@site/static/images/clickstack/materialized_views/accelerated_visual.png';

<BetaBadge />


## はじめに \{#introduction\}

ClickStack は、集約処理が重いクエリ（時間経過に伴う 1 分あたりの平均リクエスト時間の計算など）に依存する可視化を高速化するために、[インクリメンタルmaterialized view (IMV)](/materialized-view/incremental-materialized-view) を活用できます。この機能によりクエリ性能が大幅に向上し、特に 1 日あたり 10 TB 以上規模の大規模なデプロイメントで高い効果を発揮しつつ、1 日あたり PB オーダーまでスケールさせることが可能になります。インクリメンタルmaterialized view は現在ベータ版であり、慎重に利用する必要があります。

:::note
アラートも materialized view の恩恵を受けることができ、自動的にそれらを利用します。
これにより、多数のアラートを実行する際の計算コストを削減できます。特に、アラートは一般的に非常に高頻度で実行されるため、その効果は大きくなります。
実行時間を短縮することは、応答性とリソース消費の両面で有益です。
:::

## インクリメンタルmaterialized viewとは \{#what-are-incremental-materialized-views\}

インクリメンタルmaterialized viewを使用すると、計算コストをクエリ実行時から挿入時にシフトできるため、`SELECT` クエリを大幅に高速化できます。

Postgres などのトランザクションデータベースとは異なり、ClickHouse の materialized view は保存されたスナップショットではありません。代わりに、ソーステーブルにデータブロックが挿入されるたびにクエリを実行するトリガーとして動作します。このクエリの出力は、別のターゲットテーブルに書き込まれます。追加データが挿入されると、新しい部分的な結果がターゲットテーブルに追記されてマージされます。マージ後の結果は、元の全データセットに対して集計を実行した場合と同等になります。

materialized view を使用する主な目的は、ターゲットテーブルに書き込まれるデータが、集計やフィルタリング、変換の結果を表している点にあります。ClickStack では、これらは集計専用に使用されます。これらの結果は通常、生の入力データよりもはるかに小さく、多くの場合、部分的な集計状態を表します。事前集計済みのターゲットテーブルに対するクエリの容易さと相まって、生データに対してクエリ時に同じ計算を行う場合と比べて、クエリレイテンシを大幅に削減できます。

ClickHouse の materialized view は、ソーステーブルにデータが流入するのに合わせて継続的に更新され、常に最新の索引に近い挙動を示します。これは、多くの他のデータベースとは異なります。多くのデータベースでは、materialized view は定期的にリフレッシュが必要な静的スナップショットであり、ClickHouse の [リフレッシャブルmaterialized view](/materialized-view/refreshable-materialized-view) に近い動作です。

<Image img={materializedViewDiagram} size="md" alt="Materialized view の模式図"/>

インクリメンタルmaterialized view は、新しいデータが到着したときに view の変更分だけを計算し、計算を挿入時にオフロードします。ClickHouse はインジェスト向けに高度に最適化されているため、各挿入ブロックごとに view を維持するための追加コストは、クエリ実行時に得られる節約と比較して小さくなります。集計計算のコストは読み取りのたびに繰り返し支払うのではなく、挿入全体にわたって償却されます。そのため、事前集計済みの結果に対してクエリする方が再計算するよりもはるかに低コストとなり、運用コストの削減と、ペタバイトスケールにおいても下流の可視化に対するほぼリアルタイムなパフォーマンスを実現できます。

このモデルは、更新のたびに view 全体を再計算するシステムや、スケジュールされたリフレッシュに依存するシステムとは根本的に異なります。materialized view の動作や作成方法の詳細な説明については、上記のガイドを参照してください。

各 materialized view は挿入時のオーバーヘッドを追加で発生させるため、選択的に使用する必要があります。

:::tip
最も一般的なダッシュボードや可視化のためにのみ view を作成してください。
この機能がベータ版の間は、使用する view の数を 20 未満に制限してください。
このしきい値は将来のリリースで引き上げられる予定です。
:::

:::note
1 つの materialized view で、異なるグルーピングに対する複数のメトリクスを計算できます。例えば、1 分バケットごとのサービス名単位で、最小値・最大値・p95 レイテンシを計算することが可能です。これにより、1 つの view で単一の可視化ではなく多くの可視化を支えられます。したがって、メトリクスを共有 view に集約することは、各 view の価値を最大化し、ダッシュボードやワークフロー全体で再利用されるようにするうえで重要です。
:::

先に進む前に、ClickHouse における materialized view について、さらに深く理解しておくことを推奨します。
詳細については、[インクリメンタルmaterialized view](/materialized-view/incremental-materialized-view) のガイドを参照してください。

## 高速化対象の可視化の選定 \{#selecting-visualizatons-for-acceleration\}

materialized view を作成する前に、どの可視化を高速化したいのか、そしてどのワークフローがユーザーにとって最も重要なのかを把握しておくことが重要です。

ClickStack において、materialized view は**集計処理が重い可視化を高速化する**ために設計されています。これは、時間を軸に 1 つ以上のメトリクスを計算するクエリを指します。例としては、**1 分あたりの平均リクエスト時間**、**サービスごとのリクエスト数**、**時間経過に伴うエラー率**などがあります。materialized view は時系列の可視化に利用することを目的としているため、必ず集計処理と時間ベースのグルーピングの両方を含んでいる必要があります。

一般的には、次の点が推奨されます。

### 影響度の高い可視化の特定 \{#identify-high-impact-visualizations\}

アクセラレーションの候補として最適なものは、通常次のいずれかのカテゴリに該当します。

- 頻繁に更新され、常時表示されているダッシュボードの可視化（壁面ディスプレイに表示される高レベルなモニタリングダッシュボードなど）。
- ランブックで使用される診断ワークフロー内の可視化で、特定のチャートがインシデント対応中に繰り返し参照され、結果をすばやく返す必要があるもの。
- コアな HyperDX 体験を構成するもの。例:
  * 検索ページ上のヒストグラムビュー。
  * APM、Services、Kubernetes ビューなど、プリセットダッシュボードで使用される可視化。

これらの可視化は、ユーザーや時間範囲をまたいで繰り返し実行されることが多く、計算処理をクエリ実行時からデータ挿入時へとシフトする対象として理想的です。

### 挿入時コストに対するメリットのバランスを取る \{#balance-benefit-against-insert-time-cost\}

materialized view は挿入時に追加の処理を発生させるため、選択的かつ慎重に作成する必要があります。すべての可視化が事前集計の恩恵を受けるわけではなく、ほとんど使われないチャートを高速化しても、オーバーヘッドに見合わないことが多くあります。materialized view の総数は、最大でも 20 個程度を上限の目安としてください。

:::note
本番環境へ移行する前に、materialized view によって追加されるリソースオーバーヘッド、特に CPU 使用率、ディスク I/O、[マージ処理のアクティビティ](/docs/tips-and-tricks/too-many-parts) を必ず検証してください。各 materialized view は挿入時の処理を増やし、追加のパーツを生成するため、マージ処理が追いつき、パーツ数が安定していることを確認することが重要です。これは、オープンソース版 ClickHouse の [system テーブル](/operations/system-tables/tables) や [組み込みのオブザーバビリティダッシュボード](/operations/monitoring#built-in-advanced-observability-dashboard)、または ClickHouse Cloud の組み込みメトリクスおよび [監視ダッシュボード](/cloud/manage/monitor/advanced-dashboard) を通じて監視できます。過剰なパーツ数の診断と軽減については、[Too many parts](/knowledgebase/exception-too-many-parts) を参照してください。
:::

重要な可視化を特定できたら、次のステップは統合です。

### 共有ビューへの可視化の集約 \{#consolidate-visualizations-into-shared-views\}

ClickStack のすべての materialized view は、[`toStartOfMinute`](/sql-reference/functions/date-time-functions#toStartOfMinute) などの関数を使って、時間間隔ごとにデータをグループ化する必要があります。ただし、多くの可視化では、サービス名、スパン名、ステータスコードなど、追加のグルーピングキーも共通して利用します。複数の可視化が同じグルーピング次元を使用する場合、それらは 1 つの materialized view でまとめて処理できることがよくあります。

例えば（トレースの場合）:

* 時間経過に伴うサービス名ごとの平均処理時間 - `SELECT avg(Duration), toStartOfMinute(Timestamp) as time, ServiceName FROM otel_traces GROUP BY ServiceName, time`
* 時間経過に伴うサービス名ごとのリクエスト数 - `SELECT count() count, toStartOfMinute(Timestamp) as time, ServiceName FROM otel_traces GROUP BY ServiceName, time`
* 時間経過に伴うステータスコードごとの平均処理時間 - `SELECT avg(Duration), toStartOfMinute(Timestamp) as time, StatusCode FROM otel_traces GROUP BY StatusCode, time`
* 時間経過に伴うステータスコードごとのリクエスト数 - `SELECT count() count, toStartOfMinute(Timestamp) as time, StatusCode FROM otel_traces GROUP BY StatusCode, time`

それぞれのクエリやチャートごとに個別の materialized view を作成するのではなく、サービス名とステータスコードで集約する単一のビューにまとめることができます。この単一のビューで count、平均処理時間、最大処理時間に加えてパーセンタイルなど、複数のメトリクスを計算し、それらを複数の可視化で再利用できます。上記を組み合わせたクエリ例を次に示します。

```sql
SELECT avg(Duration), max(Duration), count(), quantiles(0.95,0.99)(Duration), toStartOfMinute(Timestamp) as time, ServiceName, StatusCode
FROM otel_traces
GROUP BY time, ServiceName, StatusCode
```

このようにビュ―を集約することで、挿入時のオーバーヘッドを削減し、materialized view の総数を抑え、パーツ数に関する問題を軽減し、運用上のメンテナンスを簡素化できます。

この段階では、**高速化したい可視化（ビジュアライゼーション）が発行するクエリに焦点を当てて**ください。次のセクションでは、複数の集約クエリを 1 つの materialized view に統合する例を示します。


## materialized view の作成 \{#creating-a-materialized-view\}

高速化したい可視化、または可視化のセットを特定したら、次のステップは、その背後にあるクエリを特定することです。実務的には、可視化の設定を確認し、生成された SQL を確認して、使用されている集計メトリクスや適用されている関数に特に注意を払うことを意味します。

<Image img={generated_sql} size="lg" alt="Generated SQL"/>

:::note
あるコンポーネントに対して HyperDX 内にデバッグパネルがない場合、ユーザーはブラウザコンソールを確認できます。そこにはすべてのクエリがログとして出力されます。
:::

必要なクエリを整理したら、ClickHouse の [**aggregate state functions**](/sql-reference/data-types/aggregatefunction) に慣れておく必要があります。materialized view は、クエリ時ではなく挿入時に計算を行うために、これらの関数に依存しています。最終的な集計値を保存するのではなく、materialized view は **中間の集約状態** を計算して保存し、その後クエリ時にマージおよび最終化します。これらは通常、元のテーブルよりもはるかに小さいサイズになります。これらの状態には専用のデータ型があり、ターゲットテーブルのスキーマ内で明示的に表現する必要があります。

参考として、ClickHouse のドキュメントでは aggregate state functions の詳細な概要と例、そしてそれらを保存するために使用されるテーブルエンジン `AggregatingMergeTree` について説明しています:

- [Aggregate functions and states](/sql-reference/aggregate-functions)
- [AggregatingMergeTree engine](/engines/table-engines/mergetree-family/aggregatingmergetree)

以下の動画で、AggregatingMergeTree と Aggregate functions の使用例を確認できます。

<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="ClickHouse における集約状態" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

先に進む前に、これらの概念に慣れておくことを**強く推奨**します。

### materialized view の例 \{#example-materialized-view\}

次のクエリでは、サービス名とステータスコードでグループ化し、1分ごとに平均 duration、最大 duration、イベント数、およびパーセンタイルを計算します。

```sql
SELECT
    toStartOfMinute(Timestamp),
    ServiceName,
    StatusCode,
    count() AS count,
    avg(Duration),
    max(Duration),
    quantiles(0.95, 0.99)(Duration)
FROM otel_traces
GROUP BY
    time,
    ServiceName,
    StatusCode
```

このクエリの実行を高速化するために、対応する集約状態を保持するターゲットテーブル `otel_traces_1m` を作成します。

```sql
CREATE TABLE otel_traces_1m
(
    `Timestamp` DateTime,
    `ServiceName` LowCardinality(String),
    `StatusCode` LowCardinality(String),
    `count` SimpleAggregateFunction(sum, UInt64),
    `avg__Duration` AggregateFunction(avg, UInt64),
    `max__Duration` SimpleAggregateFunction(max, Int64),
    `quantiles__Duration` AggregateFunction(quantiles(0.95, 0.99), Int64)
)
ENGINE = AggregatingMergeTree
ORDER BY (Timestamp, ServiceName, StatusCode);
```

materialized view `otel_traces_1m_mv` の定義では、新しいデータが挿入されるたびに、これらの状態を計算して書き込みます。

```sql
CREATE MATERIALIZED VIEW otel_traces_1m_mv TO otel_traces_1m
AS
SELECT
    toStartOfMinute(Timestamp) AS Timestamp,
    ServiceName,
    StatusCode,
    count() AS count,
    avgState(Duration) AS avg__Duration,
    maxSimpleState(Duration) AS max__Duration,
    quantilesState(0.95, 0.99)(Duration) AS quantiles__Duration
FROM otel_v2.otel_traces
GROUP BY
    Timestamp,
    ServiceName,
    StatusCode;
```

この materialized view は 2 つの要素で構成されています:

1. 中間結果を保存するために使用されるスキーマと集約状態の型を定義するターゲットテーブル。これらの状態がバックグラウンドで正しくマージされるようにするには、[AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) エンジンが必要です。
2. materialized view のクエリは、INSERT 時に自動的に実行されます。元のクエリと比較すると、最終的な集約関数の代わりに `avgState` や `quantilesState` などの state 関数を使用します。

その結果、各サービス名およびステータスコードごとの 1 分単位の集約状態を保存するコンパクトなテーブルが得られます。サイズは時間とカーディナリティに応じて予測可能に増加し、バックグラウンドマージ後には、生データに対して元の集約クエリを実行した場合と同じ結果を表します。このテーブルに対するクエリは、元の traces ソーステーブルから直接集約する場合と比べて大幅に低コストであり、大規模環境でも高速かつ一貫した可視化パフォーマンスを実現できます。


## ClickStack における materialized view の活用 \{#materialized-view-usage-in-clickstack\}

ClickHouse で materialized view を作成したら、可視化、ダッシュボード、アラートで自動的に利用できるようにするために、ClickStack に登録する必要があります。

### materialized view を利用できるように登録する \{#registering-a-view\}

materialized view は、その view が元になった **元のソーステーブル** に対応する HyperDX の **source** に対して登録する必要があります。

<VerticalStepper headerLevel="h4">

#### source を編集する \{#edit-the-source\}

HyperDX で該当する **source** に移動し、**Edit configuration** ダイアログを開きます。materialized view 用のセクションまでスクロールします。

<Image img={edit_source} size="lg" alt="ソースを編集"/>

#### materialized view を追加する \{#add-the-materialized-view\}

**Add materialized view** を選択し、その materialized view の基盤となるデータベースと対象テーブルを選択します。

<Image img={add_view} size="lg" alt="ソースを編集"/>

#### メトリクスを選択する \{#select-metrics\}

通常、タイムスタンプ、ディメンション、およびメトリクスのカラムは自動的に推論されます。そうならない場合は手動で指定します。

メトリクスについては、次の対応付けを行う必要があります:
- 元のカラム名（例: `Duration`）を
- materialized view 内の対応する集計カラム（例: `avg__Duration`）に対応付けます

ディメンションについては、その view の GROUP BY 句に含まれるタイムスタンプ以外のすべてのカラムを指定します。

<Image img={select_metrics} size="lg" alt="メトリクスを選択"/>

#### 時間粒度を選択する \{#select-time-granularity\}

materialized view の **time granularity** を選択します（例: 1 分）。

<Image img={select_time_granularity} size="lg" alt="時間粒度を選択"/>

#### 最小日付を選択する \{#specify-the-minimum-date\}

materialized view にデータが含まれている最小日付を指定します。これは view で利用可能な最も早いタイムスタンプを表し、インジェストが継続的に行われていると仮定すると、通常は view が作成された時刻になります。

:::note
materialized view は作成時に**自動でバックフィルされない**ため、作成後に挿入されたデータから生成された行のみが含まれます。
materialized view をバックフィルするための完全なガイドは ["Backfilling Data."](/data-modeling/backfilling#scenario-2-adding-materialized-views-to-existing-tables) にあります。
:::

<Image img={select_min_time} size="lg" alt="最小時刻を選択"/>

正確な開始時刻が不明な場合は、対象テーブルから最小タイムスタンプを取得するクエリを実行して特定できます。例:

```sql
SELECT min(Timestamp) FROM otel_traces_1m
```

#### source を保存する \{#save-the-source\}

source の設定を保存します。

<Image img={save_source} size="lg" alt="ソースを保存"/>

</VerticalStepper>

materialized view が一度登録されると、ダッシュボード、可視化、またはアラートを変更することなく、クエリが条件を満たす場合には常に ClickStack によって自動的に使用されます。ClickStack は各クエリを実行時に評価し、適用可能な materialized view があるかどうかを判定します。

### ダッシュボードおよび可視化でのアクセラレーションの検証 \{#verifying-acceleration-in-dashboards-and-visualizations\}

インクリメンタルmaterialized view には、**view が作成された後に挿入された**データのみが含まれる点に注意してください。自動で過去データがバックフィルされることはなく、そのおかげで軽量で維持コストが低くなります。このため、ユーザーは view を登録する際に、その view が有効となる時間範囲を明示的に指定する必要があります。

:::note
ClickStack は、その最小タイムスタンプがクエリの時間範囲の開始時刻以下である場合にのみ materialized view を使用し、view に必要なデータがすべて含まれていることを保証します。クエリは内部的には時間ベースのサブクエリに分割されますが、materialized view はクエリ全体に対してまとめて適用されるか、まったく適用されないかのどちらかです。将来的な改善により、対象となるサブクエリに対して選択的に view を使用できるようになる可能性があります。
:::

ClickStack は、materialized view が使用されているかどうかを確認するための、明確な視覚的インジケーターを提供します。

1. **最適化ステータスを確認する** ダッシュボードまたは可視化を表示する際に、稲妻アイコンまたは `Accelerated` アイコンを探してください。

- **緑の稲妻アイコン** は、そのクエリが materialized view によってアクセラレーションされていることを示します。
- **オレンジの稲妻アイコン** は、そのクエリがソーステーブルに対して実行されていることを示します。

<Image img={accelerated_visual} size="lg" alt="Accelerated Visualization"/>

2. **最適化の詳細を確認する** 稲妻アイコンをクリックすると、次の内容を表示する詳細パネルが開きます。

- **Active materialized view**: クエリ用に選択された view と、その推定行数。
- **Skipped materialized views**: 適合するものの選択されなかった view と、それぞれの推定スキャンサイズ。
- **Incompatible materialized views**: 使用できなかった view と、その具体的な理由。

3. **一般的な非互換の理由を把握する** 次のような場合、materialized view は使用されないことがあります。

- **クエリの時間範囲** の開始時刻が、その view の最小タイムスタンプより前である。
- **可視化の粒度** が、その view の粒度の整数倍になっていない。
- クエリで要求されている **集約関数** が、その view に含まれていない。
- クエリで `count(if(...))` のような **カスタム count 式** を使用しており、その集約状態を view から導出できない。

これらのインジケーターにより、可視化がアクセラレーションされているかどうかの確認、特定の view が選択された理由の理解、および view を利用できなかった理由の診断が容易になります。

### 可視化で materialized view がどのように選択されるか \{#how-views-are-selected\}

可視化が実行されるとき、ClickStack にはベーステーブルに加えて、複数の materialized view を含む複数の候補が存在する場合があります。最適なパフォーマンスを確保するために、ClickStack は ClickHouse の [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) メカニズムを使用して、最も効率的なオプションを自動的に評価・選択します。

選択プロセスは、以下の明確に定義された手順に従います。

1. **互換性の検証**  
   まず ClickStack は、次の点を確認することで、materialized view がクエリに対して適用可能かどうかを判定します。
   - **時間範囲のカバー**: クエリの時間範囲が、materialized view の持つデータ範囲内に完全に収まっている必要があります。
   - **粒度**: 可視化で使用される時間バケットは、その view の粒度と同じか、またはそれより粗い必要があります。
   - **集計**: 要求されているメトリクスが view に存在し、その集計状態から計算可能である必要があります。

2. **クエリの変換**  
   互換性がある view に対して、ClickStack はクエリを書き換えて materialized view のテーブルを参照するようにします。
   - 集約関数は、対応する materialized view 用のカラムにマッピングされます。
   - 集約状態に対して `-Merge` コンビネータが適用されます。
   - 時間バケットは、その view の粒度に合わせて調整されます。

3. **最適な候補の選択**  
   互換性のある materialized view が複数存在する場合、ClickStack は各候補に対して [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) クエリを実行し、推定されるスキャン行数と granule 数を比較します。推定スキャンコストが最も低い view が選択されます。

4. **スムーズなフォールバック**  
   互換性のある materialized view が存在しない場合、ClickStack は自動的にソーステーブルへのクエリ実行にフォールバックします。

このアプローチにより、スキャンされるデータ量を一貫して最小化するとともに、可視化定義を変更することなく、予測可能で低レイテンシなパフォーマンスを実現できます。

必要なすべてのディメンションが view に含まれている限り、可視化にフィルター、検索制約、または時間バケットが含まれていても、materialized view は引き続き候補となります。これにより、可視化定義を変更することなく、ダッシュボード、ヒストグラム、フィルタされたチャートを view によって高速化できます。

#### materialized view の選択例 \{#example-of-choosing-materialized-view\}

同じ trace ソースに対して作成された 2 つの materialized view を考えます。

* `otel_traces_1m` — 分単位、`ServiceName`、`StatusCode` でグループ化
* `otel_traces_1m_v2` — 分単位、`ServiceName`、`StatusCode`、`SpanName` でグループ化

2 番目の view は追加のグルーピングキーを含むため、より多くの行を生成し、より多くのデータをスキャンします。

可視化で **時間経過に伴うサービスごとの平均 duration** が要求された場合、どちらの view も技術的には利用可能です。ClickStack は各候補に対して [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) クエリを実行し、推定 granule 数を比較します。すなわち、次のようになります:

```sql
EXPLAIN ESTIMATE
SELECT
    toStartOfHour(Timestamp) AS hour,
    ServiceName,
    avgMerge(avg__Duration) AS avg__Duration
FROM otel_v2.otel_traces_1m
GROUP BY
    hour,
    ServiceName
ORDER BY hour DESC

┌─database─┬─table──────────┬─parts─┬──rows─┬─marks─┐
│ otel_v2  │ otel_traces_1m │     1 │ 49385 │     6 │
└──────────┴────────────────┴───────┴───────┴───────┘

1 row in set. Elapsed: 0.009 sec.

EXPLAIN ESTIMATE
SELECT
    toStartOfHour(Timestamp) AS hour,
    ServiceName,
    avgMerge(avg__Duration) AS avg__Duration
FROM otel_v2.otel_traces_1m_v2
GROUP BY
    hour,
    ServiceName
ORDER BY hour DESC

┌─database─┬─table─────────────┬─parts─┬───rows─┬─marks─┐
│ otel_v2  │ otel_traces_1m_v2 │     1 │ 212519 │    26 │
└──────────┴───────────────────┴───────┴────────┴───────┘

1 row in set. Elapsed: 0.004 sec.
```

`otel_traces_1m` はより小さく、スキャンするグラニュール数が少ないため、自動的に選択されます。

どちらの materialized view もベーステーブルを直接クエリするより高い性能を発揮しますが、要件を満たす範囲で最も小さいビューを選択することで、パフォーマンスは最大になります。


### アラート \{#alerts\}

アラートクエリは、互換性がある場合には自動的に materialized view を使用します。同じ最適化ロジックが適用されるため、アラートの評価が高速になります。

## materialized view をバックフィルする \{#backfilling-a-materialized-view\}

前述のとおり、インクリメンタルmaterialized view には、**ビューが作成された後に挿入されたデータ**しか含まれず、自動的にバックフィルされることはありません。この設計により、view は軽量で維持コストも低く抑えられますが、その一方で、view の保持する最小タイムスタンプより前のデータを必要とするクエリには利用できません。

多くの場合、これは許容できます。典型的な ClickStack のワークロードは直近24時間など最近のデータに焦点を当てており、新しく作成した view も作成から1日以内には十分に実用的になります。しかし、より長期間にまたがるクエリでは、十分な時間が経過するまで view が有効に使えない状態のままになることがあります。

このような場合、ユーザーは materialized view を履歴データで**バックフィル**することを検討するかもしれません。

バックフィルは**計算コストが高くなる**可能性があります。通常運用では、materialized view はデータ到着時にインクリメンタルに埋められ、計算コストは時間的に均等に分散されます。

バックフィルでは、この作業をはるかに短い期間に圧縮するため、**単位時間あたりの CPU およびメモリ使用量が大幅に増加します。**

データセットのサイズと保持期間によっては、合理的な時間内にバックフィルを完了するために、クラスタを一時的にスケールアップ（垂直スケール）したり、ClickHouse Cloud 上でスケールアウト（水平スケール）したりする必要が生じるかもしれません。

追加リソースをプロビジョニングしない場合、バックフィルはクエリレイテンシやインジェストスループットを含む本番ワークロードに悪影響を与えかねません。**非常に大きなデータセットや長期間の履歴を扱う場合、バックフィルは現実的でない、あるいはまったく不可能である**こともあります。

まとめると、バックフィルはコストと運用リスクに見合わないことが多く、履歴データアクセスの高速化がどうしても必要な例外的なケースに限定して検討されるべきです。バックフィルを実施する場合は、パフォーマンス、コスト、本番環境への影響のバランスを取るため、以下に示す制御されたアプローチに従うことを推奨します。

### バックフィルの方法 \{#backfilling-approaches\}

:::note POPULATE の使用は避ける
[POPULATE](/sql-reference/statements/create/view#materialized-view) コマンドは、取り込みを一時停止した小さなデータセット以外で materialized view をバックフィルする用途には推奨されません。このオペレーターは、POPULATE のハッシュ計算が完了した後に作成された materialized view について、そのソーステーブルに挿入された行が反映されない可能性があります。さらに、この POPULATE はすべてのデータに対して実行されるため、大きなデータセットでは割り込みやメモリ制限の影響を受けやすくなります。
:::

次の集約に対応する materialized view をバックフィルしたいとします。この集約は、サービス名とステータスコードでグループ化された 1 分ごとのメトリクスを計算します。

```sql
SELECT
    toStartOfMinute(Timestamp),
    ServiceName,
    StatusCode,
    count() AS count,
    avg(Duration),
    max(Duration),
    quantiles(0.95, 0.99)(Duration)
FROM otel_traces
GROUP BY
    time,
    ServiceName,
    StatusCode
```

前述のとおり、インクリメンタルmaterialized viewは自動的にはバックフィルされません。新規データに対するインクリメンタルな動作を維持しつつ、履歴データを安全にバックフィルするには、次のプロセスを推奨します。


#### `INSERT INTO SELECT` を用いた直接バックフィル \{#direct-backfill\}

このアプローチは、**小規模なデータセット**や**比較的軽量な集約クエリ**に最適です。この場合、クラスタリソースを使い果たすことなく、バックフィル全体を妥当な時間内に完了できます。通常、バックフィル用クエリが数分、長くても数時間で完了し、一時的な CPU および I/O 使用量の増加が許容できる場合に適しています。より大きなデータセットや高コストな集約処理の場合は、代わりに後述のインクリメンタル方式またはブロックベース方式のバックフィルを検討してください。

<VerticalStepper headerLevel="h5">

##### ビューの現在のカバレッジを確認する \{#determine-current-coverage-of-view\}

バックフィルを行う前に、まず materialized view に既に含まれているデータ範囲を確認します。これは、ターゲットテーブルに存在する最小のタイムスタンプをクエリすることで行います:

```sql
SELECT min(Timestamp)
FROM otel_traces_1m;
```

このタイムスタンプは、そのビューがクエリに応答できる最も古い時点を表します。このタイムスタンプよりも前のデータを ClickStack から要求するクエリは、ベーステーブルにフォールバックします。

##### バックフィルが必要かどうかを判断する \{#decide-whether-backfilling-is-neccessary\}

多くの ClickStack デプロイメントでは、クエリは直近 24 時間などの最新データに焦点を当てます。このようなケースでは、新しく作成したビューは作成後まもなく十分に利用可能となり、バックフィルは不要です。

前のステップで返されたタイムスタンプが、あなたのユースケースにとって十分に古い場合は、バックフィルは不要です。バックフィルは次のような場合にのみ検討してください:

- クエリが長期間の履歴範囲に頻繁にまたがる。
- その範囲全体でのパフォーマンスにとってビューが重要である。
- データセットのサイズと集約コストから見て、バックフィルが実行可能である。

##### 欠損している履歴データをバックフィルする \{#backfill-missing-historical-data\}

バックフィルが必要な場合は、上記で取得した現在の最小タイムスタンプよりも前のタイムスタンプについて、そのタイムスタンプより前のデータのみを読み取るようにビューのクエリを変更し、それを用いて materialized view のターゲットテーブルを埋めます。ターゲットテーブルは AggregatingMergeTree を使用しているため、バックフィルクエリでは**最終値ではなく、集約状態を挿入する必要があります**。

:::warning
このクエリは大量のデータを処理する可能性があり、リソース負荷が高くなり得ます。バックフィルを実行する前に、常に利用可能な CPU、メモリ、および I/O キャパシティを確認してください。有用なテクニックとして、まず `FORMAT Null` を付けてクエリを実行し、実行時間とリソース使用量を見積もる方法があります。

クエリ自体の実行が何時間もかかると想定される場合、このアプローチは**推奨されません**。
:::

以下のクエリでは、ビューに存在する最も古いタイムスタンプよりも古いデータのみに集約を限定するために `WHERE` 句を追加している点に注目してください:

```sql
INSERT INTO otel_traces_1m
SELECT
    toStartOfMinute(Timestamp) AS Timestamp,
    ServiceName,
    StatusCode,
    count() AS count,
    avgState(Duration) AS avg__Duration,
    maxSimpleState(Duration) AS max__Duration,
    quantilesState(0.95, 0.99)(Duration) AS quantiles__Duration
FROM otel_traces
WHERE Timestamp < (
    SELECT min(Timestamp) FROM otel_traces_1m
)
GROUP BY
    Timestamp,
    ServiceName,
    StatusCode;
```
</VerticalStepper>

#### Null テーブルを使ったインクリメンタルなバックフィル \{#incremental-backfill-null-table\}

データセットが大きい場合や、リソース負荷の高い集約クエリの場合、単一の `INSERT INTO SELECT` による直接バックフィルは、実用的でなかったり安全でなかったりすることがあります。こうしたケースでは、**インクリメンタルなバックフィル**手法を推奨します。この方法は、インクリメンタルmaterialized view が通常動作する方式により近く、履歴データ全体を一度に集約するのではなく、扱いやすいブロック単位でデータを処理します。

この方法が適しているのは次のような場合です：

- バックフィル用のクエリをそのまま実行すると何時間もかかってしまう。
- フル集約時のピークメモリ使用量が高すぎる。
- バックフィル中の CPU とメモリ消費を厳密に制御したい。
- 中断されても安全に再開できる、より堅牢なプロセスが必要である。

ポイントは、[**Null テーブル**](/engines/table-engines/special/null) をインジェストバッファとして使用することです。Null テーブル自体はデータを保持しませんが、そこにアタッチされた materialized view は実行されるため、データが流れるにつれて集約状態をインクリメンタルに計算できます。

<VerticalStepper headerLevel="h5">

##### バックフィル用の Null テーブルを作成する \{#create-null-table\}

materialized view の集約に必要なカラムのみを含む軽量な Null テーブルを作成します。これにより I/O とメモリ使用量を最小限に抑えられます。

```sql
CREATE TABLE otel_traces_backfill
(
    Timestamp DateTime64(9),
    ServiceName LowCardinality(String),
    StatusCode LowCardinality(String),
    Duration UInt64
)
ENGINE = Null;
```

##### Null テーブルに materialized view をアタッチする \{#attach-mv-to-null-table\}

次に、Null テーブル上に、プライマリの materialized view と同じ集約テーブルをターゲットとする materialized view を作成します。

```sql
CREATE MATERIALIZED VIEW otel_traces_1m_mv_backfill
TO otel_traces_1m
AS
SELECT
    toStartOfMinute(Timestamp) AS Timestamp,
    ServiceName,
    StatusCode,
    count() AS count,
    avgState(Duration) AS avg__Duration,
    maxSimpleState(Duration) AS max__Duration,
    quantilesState(0.95, 0.99)(Duration) AS quantiles__Duration
FROM otel_traces_backfill
GROUP BY
    Timestamp,
    ServiceName,
    StatusCode;
```

この materialized view は、行が Null テーブルに挿入されるたびにインクリメンタルに実行され、小さなブロック単位で集約状態を生成します。

##### データをインクリメンタルにバックフィルする \{#incremental-backfill\}

最後に、履歴データを Null テーブルに挿入します。materialized view はデータをブロックごとに処理し、生の行を永続化することなく、ターゲットテーブルに集約状態を出力します。

```sql
INSERT INTO otel_traces_backfill
SELECT
    Timestamp,
    ServiceName,
    StatusCode,
    Duration
FROM otel_traces
WHERE Timestamp < (
    SELECT min(Timestamp) FROM otel_traces_1m
);
```

データがインクリメンタルに処理されるため、メモリ使用量は制限され予測可能なままであり、通常のインジェスト動作に近い挙動になります。

:::note
さらなる安全性のために、バックフィル用の materialized view の出力先を一時的なターゲットテーブル（例: `otel_traces_1m_v2`）に向けることを検討してください。バックフィルが正常に完了したら、[パーティションを移動](/sql-reference/statements/alter/partition#move-partition-to-table)してプライマリのターゲットテーブルに統合できます（例: `ALTER TABLE otel_traces_1m_v2 MOVE PARTITION '2026-01-02' TO otel_traces_1m`）。これにより、バックフィルが中断された場合や、リソース制限によって失敗した場合でも容易にリカバリできます。
:::

このプロセスのチューニング（挿入パフォーマンスの向上やリソースの削減と制御）に関する詳細は、「[Backfilling](/data-modeling/backfilling#tuning-performance--resources)」を参照してください。

</VerticalStepper>

## 推奨事項 \{#recommendations\}

以下の推奨事項は、ClickStack における materialized view の設計と運用に関するベストプラクティスをまとめたものです。これらのガイドラインに従うことで、materialized view を効果的かつ予測可能に、コスト効率良く運用できるようになります。

### 粒度の選択と整合性 \{#granularity-selection-and-alignment\}

materialized view は、可視化やアラートの粒度が **view の粒度の正確な倍数** の場合にのみ使用されます。この粒度がどのように決定されるかは、チャートの種類によって異なります。

- **タイムチャート**（x 軸が時間の折れ線グラフまたは棒グラフ）の場合:
  チャートで明示的に指定された粒度は、materialized view の粒度の倍数である必要があります。
  たとえば 10 分粒度のチャートでは、10、5、2、1 分粒度の materialized view は使用できますが、20 分や 3 分粒度の view は使用できません。

- **非タイムチャート**（Number、Table、Summary チャート）の場合:
  実効粒度は `(time range / 80)` から導出され、HyperDX がサポートする最も近い（大きい方向への）粒度に切り上げられます。この導出された粒度も、materialized view の粒度の倍数でなければなりません。

これらのルールにより、次の点に注意してください。

- **10 分粒度の materialized view は作成しないでください**。
  ClickStack はチャートおよびアラート向けに 15 分粒度をサポートしていますが、10 分はサポートしていません。したがって、10 分粒度の materialized view は、一般的な 15 分粒度の可視化やアラートと互換性がありません。
- 多くのチャートやアラート設定ときれいに組み合わせられる **1 分** または **1 時間** 粒度を推奨します。

より大きな粒度（例: 1 時間）は view のサイズが小さくなりストレージのオーバーヘッドも減りますが、より小さな粒度（例: 1 分）はきめ細かい分析の柔軟性を高めます。重要なワークフローを満たせる範囲で、可能な限り小さい粒度を選択してください。

### materialized view の数を制限し、集約する \{#limit-and-consolidate-materialized-views\}

各 materialized view は、挿入時に追加のオーバーヘッドを発生させ、パーツ（part）およびマージ処理への負荷を高めます。
次のガイドラインに従うことを推奨します。

- ソース 1 つあたり **最大でも 20 個までの materialized view**。
- **約 10 個の materialized view** が一般的に最適です。
- 共通のディメンションを共有する場合は、複数の可視化を 1 つの materialized view に集約します。

可能な限り、複数のメトリクスを同じ materialized view で計算し、複数のチャートを同時にサポートするようにします。

### 次元を慎重に選択する \{#choose-dimensions-carefully\}

グルーピングやフィルタリングで一般的に利用される次元だけを含めてください。

- グルーピング用のカラムを 1 つ追加するごとに、ビューのサイズが増加します。
- クエリの柔軟性と、ストレージおよび書き込み時のコストとのバランスを取ってください。
- ビューに存在しないカラムでフィルタすると、ClickStack はソーステーブルにフォールバックします。

:::note ヒント
一般的でほぼ常に有用なベースラインとしては、**サービス名でグルーピングし、件数をカウントするメトリクスを持つ materialized view** が挙げられます。これにより、検索やダッシュボードにおける高速なヒストグラムとサービスレベルの概要表示が可能になります。
:::

### 集約カラムの命名規則 \{#naming-conventions-for-aggregation-columns\}

materialized view の集約カラムは、自動推論を可能にするために厳密な命名規則に従う必要があります:

- パターン: `<aggFn>__<sourceColumn>`
- 例:
  - `avg__Duration`
  - `max__Duration`
  - `count__` は行数カウント用

ClickStack は、この命名規則に依存して、クエリを materialized view のカラムに正しく対応付けます。

### 分位数とスケッチの選択 \{#quantiles-and-sketch-selection\}

分位数関数によって、パフォーマンスとストレージの特性が異なります。

- `quantiles` はディスク上でより大きなスケッチを生成しますが、挿入時の計算コストは低くなります。
- `quantileTDigest` は挿入時の計算コストは高くなりますが、より小さなスケッチを生成し、多くの場合、VIEW クエリが高速になります。

両方の関数に対してスケッチサイズを指定できます（たとえば、挿入時に両方の関数で `quantile(0.5)` を指定）。生成されたスケッチは、後から他の分位数値（例: `quantile(0.95)`）に対してもクエリできます。ワークロードに最適なバランスを見つけるため、実際に試して評価することを推奨します。

### 効果を継続的に検証する \{#validate-effectiveness-continously\}

materialized view が実際にメリットをもたらしているか、常に検証してください。

- UI のアクセラレーションインジケーターで利用状況を確認します。
- materialized view を有効化する前後でクエリパフォーマンスを比較します。
- リソース使用量とマージ動作を監視します。

materialized view は、クエリパターンの変化に応じて定期的な見直しと調整が必要となるパフォーマンス最適化手法として扱うべきです。

### 高度な構成 \{#advanced-configurations\}

より複雑なワークロードに対しては、複数の materialized view を使用して、異なるアクセスパターンに対応できます。例としては次のようなものがあります:

- **高解像度の最新データと粗い粒度の履歴ビュー**
- **概要用のサービスレベルビューと、詳細診断用のエンドポイントレベルビュー**

これらのパターンは、選択的に適用することでパフォーマンスを大幅に向上できますが、まずはより単純な構成で検証したうえで導入するようにしてください。

これらの推奨事項に従うことで、materialized view を ClickStack の実行モデルと整合させつつ、効果的で保守しやすい状態に保つことができます。

## 制限事項 \{#limitations\}

### 非互換となる主な理由 \{#common-incompatibility-reasons\}

次のいずれかの条件に該当する場合、materialized view は利用され**ません**:

- **クエリの時間範囲**
  クエリの時間範囲の開始時刻が、materialized view の保持する最小タイムスタンプよりも前である場合。ビューは自動で過去データをバックフィルしないため、完全にカバーしている時間範囲のクエリにしか利用できません。

- **粒度の不一致**
  可視化における実効粒度は、materialized view の粒度の厳密な倍数である必要があります。具体的には:

  * **時間チャート**（x 軸が時間の折れ線・棒グラフ）の場合、チャートで選択された粒度は view の粒度の倍数でなければなりません。たとえば、10 分チャートは 10、5、2、1 分粒度の materialized view を利用できますが、20 分や 3 分粒度の view は利用できません。
  * **非時間チャート**（数値チャートやテーブルチャート）の場合、実効粒度は `(time range / 80)` で計算され、HyperDX がサポートする最も近い粒度に切り上げられます。この粒度も、view の粒度の倍数である必要があります。

- **未対応の集約関数**
  クエリが、materialized view に存在しない集約を要求している場合。ビュー内で明示的に計算され保存されている集約のみが利用可能です。

- **カスタム count 式**
  `count(if(...))` のような式や、その他の条件付きの count を使うクエリは、標準的な集約状態から導出できないため、materialized view を利用できません。

### 設計および運用上の制約 \{#design-and-operational-constraints\}

- **自動バックフィルなし**
  インクリメンタルmaterialized view には、作成後に挿入されたデータのみが含まれます。履歴データの高速化には明示的なバックフィルが必要であり、大規模なデータセットでは高コストになったり、現実的でなかったりする場合があります。

- **粒度のトレードオフ**
  非常に細かい粒度のビューはストレージ使用量と挿入時のオーバーヘッドを増加させる一方、粗い粒度のビューは柔軟性を低下させます。粒度は、想定されるクエリパターンに合致するよう慎重に選択する必要があります。

- **ディメンション爆発**
  多数のグルーピングディメンションを追加すると、ビューのサイズが大きくなり、効果が低下する可能性があります。ビューには、一般的に使用されるグルーピングおよびフィルタリング用のカラムのみを含めるべきです。

- **ビュー数のスケーラビリティの制限**
  各 materialized view は挿入時のオーバーヘッドを増加させ、マージ処理への負荷を高めます。ビューを作成しすぎると、インジェスト処理やバックグラウンドマージに悪影響を与える可能性があります。

これらの制約を把握しておくことで、materialized view を実際にメリットが得られる箇所にのみ適用し、暗黙的に低速なソーステーブルへのクエリにフォールバックしてしまうような構成を避けることができます。

## トラブルシューティング \{#troubleshooting\}

### materialized view が使用されていない \{#materialied-view-not-being-used\}

**チェック 1: 日付範囲**

- 最適化モーダルを開き、「Date range not supported.」と表示されていないか確認します。
- クエリの日付範囲が、materialized view の最小日付より後になっていることを確認します。
- materialized view がすべての履歴データを保持している場合は、最小日付の指定を削除します。

**チェック 2: 粒度**

- チャートの粒度が MV の粒度の倍数になっていることを確認します。
- チャートを「Auto」に設定するか、互換性のある粒度を手動で選択してみてください。

**チェック 3: 集約**

- チャートで使用している集約が MV に含まれているか確認します。
- 最適化モーダル内の「Available aggregated columns」を確認します。

**チェック 4: ディメンション**

- group by 句のカラムが MV のディメンションカラムに含まれていることを確認します。
- 最適化モーダル内の「Available group/filter columns」を確認します。

### materialized view のクエリが遅い \{#slow-mv-queries\}

**問題 1: materialized view の粒度が細かすぎる**

- 粒度が細かすぎる（例: 1秒）ため、MV の行数が多くなっている。
- 解決策: より粒度の粗い MV を作成する（例: 1分または1時間）。

**問題 2: 次元が多すぎる**

- 多くの次元カラムにより、MV のカーディナリティが高くなっている。
- 解決策: 最もよく使用されるものに次元カラムを絞る。

**問題 3: 行数の多い複数の MV**

- システムが各 MV に対して `EXPLAIN` を実行している。
- 解決策: ほとんど使用されない、または常にスキップされる MV を削除する。

### 設定エラー \{#config-errors\}

**エラー: "少なくとも 1 つの集約カラムが必要です"**

- MV の設定に少なくとも 1 つの集約カラムを追加します。

**エラー: "count 以外の集約にはソースカラムが必要です"**

- どのカラムを集約するかを指定します（`count` の場合のみソースカラムを省略できます）。

**エラー: "粒度の形式が無効です"**

- ドロップダウンから用意された粒度プリセットのいずれかを使用します。
- 形式は有効な SQL の interval 式である必要があります（例: `1 hour` は可、`1 h` は不可）。