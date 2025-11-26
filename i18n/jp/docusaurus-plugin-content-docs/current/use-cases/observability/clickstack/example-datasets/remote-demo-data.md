---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: 'リモートデモ用データセット'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: 'ClickStack とリモートデモ用データセットの使用を開始する'
doc_type: 'guide'
keywords: ['clickstack', 'サンプルデータ', 'サンプルデータセット', 'ログ', 'オブザーバビリティ']
---

import Image from '@theme/IdealImage';
import demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/demo_connection.png';
import edit_demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_connection.png';
import edit_demo_source from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_source.png';
import step_2 from '@site/static/images/use-cases/observability/hyperdx-demo/step_2.png';
import step_3 from '@site/static/images/use-cases/observability/hyperdx-demo/step_3.png';
import step_4 from '@site/static/images/use-cases/observability/hyperdx-demo/step_4.png';
import step_5 from '@site/static/images/use-cases/observability/hyperdx-demo/step_5.png';
import step_6 from '@site/static/images/use-cases/observability/hyperdx-demo/step_6.png';
import step_7 from '@site/static/images/use-cases/observability/hyperdx-demo/step_7.png';
import step_8 from '@site/static/images/use-cases/observability/hyperdx-demo/step_8.png';
import step_9 from '@site/static/images/use-cases/observability/hyperdx-demo/step_9.png';
import step_10 from '@site/static/images/use-cases/observability/hyperdx-demo/step_10.png';
import step_11 from '@site/static/images/use-cases/observability/hyperdx-demo/step_11.png';
import step_12 from '@site/static/images/use-cases/observability/hyperdx-demo/step_12.png';
import step_13 from '@site/static/images/use-cases/observability/hyperdx-demo/step_13.png';
import step_14 from '@site/static/images/use-cases/observability/hyperdx-demo/step_14.png';
import step_15 from '@site/static/images/use-cases/observability/hyperdx-demo/step_15.png';
import step_16 from '@site/static/images/use-cases/observability/hyperdx-demo/step_16.png';
import step_17 from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import step_18 from '@site/static/images/use-cases/observability/hyperdx-demo/step_18.png';
import step_19 from '@site/static/images/use-cases/observability/hyperdx-demo/step_19.png';
import step_20 from '@site/static/images/use-cases/observability/hyperdx-demo/step_20.png';
import step_21 from '@site/static/images/use-cases/observability/hyperdx-demo/step_21.png';
import step_22 from '@site/static/images/use-cases/observability/hyperdx-demo/step_22.png';
import step_23 from '@site/static/images/use-cases/observability/hyperdx-demo/step_23.png';
import step_24 from '@site/static/images/use-cases/observability/hyperdx-demo/step_24.png';
import demo_sources from '@site/static/images/use-cases/observability/hyperdx-demo//demo_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import DemoArchitecture from '@site/docs/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';

**本ガイドは、[all-in-one イメージ用の手順](/use-cases/observability/clickstack/getting-started) または [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only) の手順に従って ClickStack をデプロイし、初回ユーザー作成を完了していることを前提としています。別の方法として、ローカル環境でのセットアップをすべて省略し、このデータセットを使用している ClickStack のホスト型デモ環境 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) に接続することもできます。**

本ガイドでは、パブリックな ClickHouse Playground でホストされているサンプルデータセット [sql.clickhouse.com](https://sql.clickhpouse.com) を使用します。これはローカルの ClickStack デプロイメントから接続できます。

:::warning ClickHouse Cloud 上の HyperDX では利用できません
HyperDX が ClickHouse Cloud 上でホストされている場合、リモートデータベースはサポートされません。したがって、このデータセットは利用できません。
:::


これは、公式 OpenTelemetry (OTel) デモの ClickHouse 版から取得された、約 40 時間分のデータを含んでいます。データは毎晩、タイムスタンプが現在の時間帯に合うよう調整されたうえでリプレイされるため、ユーザーは HyperDX の統合されたログ、トレース、メトリクスを使ってシステムの挙動を分析できます。

:::note データの変動について
このデータセットは毎日深夜からリプレイされるため、デモを確認するタイミングによって可視化結果が多少異なる場合があります。
:::



## デモシナリオ {#demo-scenario}

このデモでは、天体望遠鏡および関連アクセサリを販売する eコマースサイトで発生したインシデントを調査します。

カスタマーサポートチームから、ユーザーがチェックアウト時に支払いを完了できない問題が発生しているとの報告がありました。この問題は、調査のため Site Reliability Engineering (SRE) チームにエスカレーションされています。

SRE チームは HyperDX を使用してログ、トレース、メトリクスを分析し、問題を診断・解決したうえで、セッションデータを確認し、自分たちの結論が実際のユーザー行動と一致しているかを検証します。



## OpenTelemetry デモ {#otel-demo}

このデモでは、公式の OpenTelemetry デモの [ClickStack がメンテナンスしているフォーク版](https://github.com/ClickHouse/opentelemetry-demo) を使用します。

<DemoArchitecture/>



## デモ手順 {#demo-steps}

**このデモでは[ClickStack SDK](/use-cases/observability/clickstack/sdks)を使用してインストルメンテーションを行い、Kubernetes上にサービスをデプロイしてメトリクスとログを収集しています。**

<VerticalStepper headerLevel="h3">

### デモサーバーへの接続 {#connect-to-the-demo-server}

:::note ローカル専用モード
ローカルモードでデプロイする際に`Connect to Demo Server`をクリックした場合、この手順はスキップできます。このモードを使用する場合、ソース名には`Demo_`というプレフィックスが付きます（例：`Demo_Logs`）
:::

`Team Settings`に移動し、`Local Connection`の`Edit`をクリックします：

<Image img={edit_connection} alt='接続の編集' size='lg' />

接続名を`Demo`に変更し、以下のデモサーバーの接続情報をフォームに入力します：

- `Connection Name`: `Demo`
- `Host`: `https://sql-clickhouse.clickhouse.com`
- `Username`: `otel_demo`
- `Password`: 空欄のまま

<Image img={edit_demo_connection} alt='デモ接続の編集' size='lg' />

### ソースの変更 {#modify-sources}

:::note ローカル専用モード
ローカルモードでデプロイする際に`Connect to Demo Server`をクリックした場合、この手順はスキップできます。このモードを使用する場合、ソース名には`Demo_`というプレフィックスが付きます（例：`Demo_Logs`）
:::

`Sources`までスクロールし、各ソース（`Logs`、`Traces`、`Metrics`、`Sessions`）を`otel_v2`データベースを使用するように変更します。

<Image img={edit_demo_source} alt='デモソースの編集' size='lg' />

:::note
各ソースでデータベースの完全なリストが表示されるよう、ページの再読み込みが必要な場合があります。
:::

### 時間範囲の調整 {#adjust-the-timeframe}

右上のタイムピッカーを使用して、過去`1 day`のすべてのデータを表示するように時間を調整します。

<Image img={step_2} alt='手順2' size='lg' />

概要バーチャートのエラー数にわずかな差異が見られ、連続するいくつかのバーで赤色部分がわずかに増加している可能性があります。

:::note
バーの位置は、データセットをクエリするタイミングによって異なります。
:::

### エラーへのフィルタリング {#filter-to-errors}

エラーの発生を強調表示するには、`SeverityText`フィルターを使用し、`error`を選択してエラーレベルのエントリのみを表示します。

エラーがより明確に表示されます：

<Image img={step_3} alt='手順3' size='lg' />

### エラーパターンの特定 {#identify-error-patterns}

HyperDXのクラスタリング機能を使用すると、エラーを自動的に識別し、意味のあるパターンにグループ化できます。これにより、大量のログとトレースを扱う際の分析が加速されます。この機能を使用するには、左パネルの`Analysis Mode`メニューから`Event Patterns`を選択します。

エラークラスターは、`Failed to place order`という名前のパターンを含む、支払い失敗に関連する問題を明らかにします。追加のクラスターは、カード決済の問題やキャッシュの容量不足も示しています。

<Image img={step_4} alt='手順4' size='lg' />

これらのエラークラスターは、異なるサービスから発生している可能性があることに注意してください。

### エラーパターンの調査 {#explore-error-pattern}

ユーザーが支払いを完了できないという報告された問題と相関する、最も明白なエラークラスター`Failed to place order`をクリックします。

これにより、`frontend`サービスに関連するこのエラーのすべての発生がリスト表示されます：

<Image img={step_5} alt='手順5' size='lg' />

表示されたエラーのいずれかを選択します。ログのメタデータが詳細に表示されます。`Overview`と`Column Values`の両方をスクロールすると、キャッシュに起因するカード決済の問題が示唆されます：

`failed to charge card: could not charge the card: rpc error: code = Unknown desc = Visa cache full: cannot add new item.`

<Image img={step_6} alt='手順6' size='lg' />

### インフラストラクチャの調査 {#explore-the-infrastructure}

支払い失敗の原因となっている可能性が高いキャッシュ関連のエラーを特定しました。次に、マイクロサービスアーキテクチャのどこでこの問題が発生しているかを特定する必要があります。

キャッシュの問題を考慮すると、基盤となるインフラストラクチャを調査することが理にかなっています。関連するポッドにメモリの問題がある可能性があります。ClickStackでは、ログとメトリクスが統合されコンテキスト内で表示されるため、根本原因を迅速に特定できます。

`Infrastructure`タブを選択して、`frontend`サービスの基盤となるポッドに関連するメトリクスを表示し、期間を`1d`に拡大します：

<Image img={step_7} alt='手順7' size='lg' />


問題はインフラストラクチャには関連していないようです。エラーの前後を含め、この期間でメトリクスに顕著な変化は見られません。インフラストラクチャタブを閉じます。

### トレースを探索する {#explore-a-trace}

ClickStack では、トレースはログおよびメトリクスの両方と自動的に相関付けられます。選択したログにリンクされたトレースを探索し、原因となっているサービスを特定します。

関連するトレースを可視化するために `Trace` を選択します。表示をスクロールダウンしていくと、HyperDX がマイクロサービス全体にわたる分散トレースを可視化し、各サービス内のスパンを接続していることが分かります。支払い処理には、チェックアウト処理や通貨換算を行うものを含む、複数のマイクロサービスが明確に関与しています。

<Image img={step_8} alt="Step 8" size="lg"/>

ビューの最下部までスクロールすると、`payment` サービスがエラーを引き起こし、それが呼び出しチェーンを遡って伝播していることが分かります。 

<Image img={step_9} alt="Step 9" size="lg"/>

### トレースを検索する {#searching-traces} 

支払いサービスのキャッシュの問題が原因で、ユーザーが購入を完了できていないことが分かりました。根本原因についてさらに理解するため、このサービスのトレースをより詳細に探索します。

`Search` を選択してメインの検索ビューに切り替えます。データソースを `Traces` に切り替え、`Results table` ビューを選択します。**対象期間が直近 1 日のままであることを確認してください。**

<Image img={step_10} alt="Step 10" size="lg"/>

このビューには、直近 1 日のすべてのトレースが表示されます。問題が支払いサービスに起因していることは分かっているので、`ServiceName` に `payment` フィルターを適用します。

<Image img={step_11} alt="Step 11" size="lg"/>

`Event Patterns` を選択してトレースにイベントクラスタリングを適用すると、`payment` サービスで発生しているキャッシュの問題をすぐに確認できます。

<Image img={step_12} alt="Step 12" size="lg"/>

### トレースに対するインフラストラクチャの探索 {#explore-infrastructure-for-a-trace}

`Results table` をクリックして結果ビューに切り替えます。`StatusCode` フィルターで値として `Error` を指定し、エラーに絞り込みます。 

<Image img={step_13} alt="Step 13" size="lg"/>

`Error: Visa cache full: cannot add new item.` エラーの 1 つを選択し、`Infrastructure` タブに切り替えて、対象期間を `1d` に広げます。

<Image img={step_14} alt="Step 14" size="lg"/>

トレースをメトリクスと相関付けることで、`payment` サービスでメモリと CPU が増加した後、`0` にまで低下していることが分かります（これはポッドの再起動に起因すると考えられます）。これは、キャッシュの問題がリソースの問題を引き起こしたことを示唆しています。支払い完了時間にも影響していると考えられます。

### 迅速な解決のための Event Deltas {#event-deltas-for-faster-resolution} 

Event Deltas は、パフォーマンスやエラー率の変化を特定のデータサブセットに帰属させることで異常を表面化し、根本原因を素早く特定しやすくします。 

`payment` サービスにキャッシュの問題があり、その結果としてリソース消費が増加していることは分かっていますが、根本原因を完全には特定できていません。

結果テーブルビューに戻り、エラーを含む時間帯を選択してデータを絞り込みます。可能であれば、エラーの数時間前と数時間後の時間帯も含めて選択してください（問題はまだ発生している可能性があります）:

<Image img={step_15} alt="Step 15" size="lg"/>

エラーフィルターを削除し、左側の `Analysis Mode` メニューから `Event Deltas` を選択します。

<Image img={step_16} alt="Step 16" size="lg"/>

上部のパネルにはタイミングの分布が表示され、色はイベント密度（スパン数）を示します。主な集中領域から外れたイベントのサブセットが、一般的に調査対象として有望なものになります。

`200ms` を超える継続時間のイベントを選択し、`Filter by selection` フィルターを適用すると、分析対象を遅いイベントに限定できます:

<Image img={step_17} alt="Step 17" size="lg"/>

データのサブセットに対して分析を実行すると、ほとんどのパフォーマンススパイクが `visa` トランザクションに関連していることが分かります。

### さらなるコンテキストのためのチャートの活用 {#using-charts-for-more-context}

ClickStack では、より豊富なコンテキストを得るために、ログ・トレース・メトリクスの任意の数値をチャート化できます。 

ここまでで、次の点が分かっています:

- 問題は payment サービスに存在する
- キャッシュが満杯になっている
- その結果、リソース消費が増加した
- この問題により、Visa の支払いが完了しなくなっている、あるいは少なくとも完了までに非常に長い時間がかかっている

<br/>

左側のメニューから `Chart Explorer` を選択します。次の値を設定して、チャートタイプごとに支払い完了までに要した時間をチャート化します。



- `Data Source`: `Traces`
- `Metric`: `Maximum`
- `SQL Column`: `Duration`
- `Where`: `ServiceName: payment`
- `Timespan`: `Last 1 day`

<br />

`▶️`をクリックすると、支払い処理のパフォーマンスが時間経過とともにどのように低下したかが表示されます。

<Image img={step_18} alt='ステップ18' size='lg' />

`Group By`を`SpanAttributes['app.payment.card_type']`に設定すると（オートコンプリートのために`card`と入力するだけ）、Mastercardと比較してVisaトランザクションのサービスパフォーマンスがどのように低下したかを確認できます。

<Image img={step_19} alt='ステップ19' size='lg' />

エラーが発生すると、レスポンスが`0s`で返されることに注意してください。

### メトリクスを探索してより多くのコンテキストを取得 {#exploring-metrics-for-more-context}

最後に、キャッシュサイズをメトリクスとしてプロットし、時間経過に伴う動作を確認することで、より多くのコンテキストを取得しましょう。

以下の値を入力してください。

- `Data Source`: `Metrics`
- `Metric`: `Maximum`
- `SQL Column`: `visa_validation_cache.size (gauge)` (just type `cache` for autocomplete)
- `Where`: `ServiceName: payment`
- `Group By`: `<empty>`

キャッシュサイズが4～5時間の期間（おそらくソフトウェアデプロイメント後）にわたって増加し、最大サイズの`100,000`に達したことが確認できます。`Sample Matched Events`から、エラーがキャッシュがこの上限に達したことと相関付けられており、その後キャッシュサイズが`0`として記録され、レスポンスも`0s`で返されていることがわかります。

<Image img={step_20} alt='ステップ20' size='lg' />

要約すると、ログ、トレース、そして最後にメトリクスを探索することで、以下の結論に達しました。

- 問題は支払いサービスに存在する
- デプロイメントに起因すると思われるサービス動作の変更により、Visaキャッシュが4～5時間の期間にわたって緩やかに増加し、最大サイズの`100,000`に達した
- これにより、キャッシュサイズの増大に伴ってリソース消費が増加した - おそらく不適切な実装が原因
- キャッシュが増大するにつれて、Visa支払いのパフォーマンスが低下した
- 最大サイズに達すると、キャッシュは支払いを拒否し、自身のサイズを`0`として報告した

### セッションの使用 {#using-sessions}

セッションを使用すると、ユーザー体験を再生でき、ユーザーの視点からエラーがどのように発生したかを視覚的に確認できます。通常は根本原因の診断には使用されませんが、カスタマーサポートに報告された問題を確認する際に有用であり、より深い調査の出発点として機能します。

HyperDXでは、セッションがトレースとログにリンクされており、根本原因の完全なビューを提供します。

たとえば、サポートチームが支払い問題に遭遇したユーザーのメールアドレス`Braulio.Roberts23@hotmail.com`を提供した場合、ログやトレースを直接検索するよりも、そのユーザーのセッションから始める方が効果的であることが多いです。

左側のメニューから`Client Sessions`タブに移動し、データソースが`Sessions`に設定され、期間が`Last 1 day`に設定されていることを確認してください。

<Image img={step_21} alt='ステップ21' size='lg' />

`SpanAttributes.userEmail: Braulio`を検索して、顧客のセッションを見つけます。セッションを選択すると、左側に顧客のセッションのブラウザイベントと関連するスパンが表示され、右側にユーザーのブラウザ体験が再レンダリングされます。

<Image img={step_22} alt='ステップ22' size='lg' />

### セッションの再生 {#replaying-sessions}

セッションは▶️ボタンを押すことで再生できます。`Highlighted`と`All Events`を切り替えることで、スパンの粒度を変更でき、前者は主要なイベントとエラーを強調表示します。

スパンの下部までスクロールすると、`/api/checkout`に関連する`500`エラーが表示されます。この特定のスパンの▶️ボタンを選択すると、再生がセッションのこの時点に移動し、顧客の体験を確認できます - 支払いはエラーが表示されることなく、単に機能していないように見えます。

<Image img={step_23} alt='ステップ23' size='lg' />

スパンを選択すると、これが内部エラーによって引き起こされたことを確認できます。`Trace`タブをクリックして接続されたスパンをスクロールすることで、顧客が実際にキャッシュ問題の被害者であったことを確認できます。

<Image img={step_24} alt='ステップ24' size='lg' />

</VerticalStepper>

このデモでは、eコマースアプリにおける支払い失敗に関する実際のインシデントを取り上げ、ClickStackが統合されたログ、トレース、メトリクス、セッション再生を通じて根本原因を明らかにする方法を示しています - 特定の機能をより深く理解するには、[その他の入門ガイド](/use-cases/observability/clickstack/sample-datasets)をご覧ください。
