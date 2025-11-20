---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: 'リモートデモデータセット'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: 'ClickStack とリモートデモデータセットの使いはじめ'
doc_type: 'guide'
keywords: ['clickstack', 'example data', 'sample dataset', 'logs', 'observability']
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

**このガイドは、[all-in-one イメージ用の手順](/use-cases/observability/clickstack/getting-started)または [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only) に従って ClickStack をデプロイし、初期ユーザーの作成を完了していることを前提としています。別の方法として、ローカル環境でのセットアップをすべて省略し、本ガイドで使用するデータセットを利用している ClickStack ホスト型デモ環境である [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) に接続することもできます。**

このガイドでは、パブリックな ClickHouse playground である [sql.clickhouse.com](https://sql.clickhpouse.com) 上にホストされているサンプルデータセットを使用します。これはローカルの ClickStack デプロイメントから接続できます。

:::warning ClickHouse Cloud 上の HyperDX ではサポートされません
ClickHouse Cloud 上で HyperDX をホストしている場合、リモートデータベースはサポートされません。そのため、このデータセットは利用できません。
:::


これは、公式 OpenTelemetry (OTel) デモの ClickHouse 版から取得された、約 40 時間分のデータを含んでいます。データは毎晩、タイムスタンプが現在の時間帯に合うよう調整されたうえでリプレイされるため、ユーザーは HyperDX に統合されたログ、トレース、メトリクスを使ってシステムの挙動を分析できます。

:::note データの変動
このデータセットは毎日深夜からリプレイされるため、デモを確認するタイミングによって、可視化結果が多少異なる場合があります。
:::



## デモシナリオ {#demo-scenario}

このデモでは、望遠鏡および関連アクセサリーを販売するEコマースWebサイトで発生したインシデントを調査します。

カスタマーサポートチームから、ユーザーがチェックアウト時に決済を完了できない問題が報告されました。この問題は、調査のためにサイト信頼性エンジニアリング(SRE)チームにエスカレーションされています。

SREチームはHyperDXを使用して、ログ、トレース、メトリクスを分析し、問題を診断して解決します。その後、セッションデータを確認して、導き出した結論が実際のユーザー行動と一致しているかを検証します。


## Open Telemetry デモ {#otel-demo}

このデモでは、公式OpenTelemetryデモの[ClickStack管理フォーク](https://github.com/ClickHouse/opentelemetry-demo)を使用しています。

<DemoArchitecture />


## デモ手順 {#demo-steps}

**このデモでは[ClickStack SDK](/use-cases/observability/clickstack/sdks)を使用してインストルメンテーションを行い、Kubernetesにサービスをデプロイしています。メトリクスとログもそこから収集されています。**

<VerticalStepper headerLevel="h3">

### デモサーバーへの接続 {#connect-to-the-demo-server}

:::note ローカル専用モード
ローカルモードでデプロイする際に`Connect to Demo Server`をクリックした場合、この手順はスキップできます。このモードを使用する場合、ソースには`Demo_`というプレフィックスが付きます（例：`Demo_Logs`）
:::

`Team Settings`に移動し、`Local Connection`の`Edit`をクリックします：

<Image img={edit_connection} alt='接続の編集' size='lg' />

接続名を`Demo`に変更し、デモサーバーの以下の接続情報を入力してフォームを完成させます：

- `Connection Name`: `Demo`
- `Host`: `https://sql-clickhouse.clickhouse.com`
- `Username`: `otel_demo`
- `Password`: 空のままにする

<Image img={edit_demo_connection} alt='デモ接続の編集' size='lg' />

### ソースの変更 {#modify-sources}

:::note ローカル専用モード
ローカルモードでデプロイする際に`Connect to Demo Server`をクリックした場合、この手順はスキップできます。このモードを使用する場合、ソースには`Demo_`というプレフィックスが付きます（例：`Demo_Logs`）
:::

`Sources`までスクロールし、各ソース（`Logs`、`Traces`、`Metrics`、`Sessions`）を`otel_v2`データベースを使用するように変更します。

<Image img={edit_demo_source} alt='デモソースの編集' size='lg' />

:::note
各ソースでデータベースの完全なリストが表示されるように、ページのリロードが必要な場合があります。
:::

### 時間範囲の調整 {#adjust-the-timeframe}

右上のタイムピッカーを使用して、過去`1 day`のすべてのデータを表示するように時間を調整します。

<Image img={step_2} alt='手順2' size='lg' />

概要バーチャートのエラー数にわずかな違いが見られ、連続するいくつかのバーで赤色がわずかに増加している可能性があります。

:::note
バーの位置は、データセットをクエリするタイミングによって異なります。
:::

### エラーへのフィルタリング {#filter-to-errors}

エラーの発生を強調表示するには、`SeverityText`フィルターを使用し、`error`を選択してエラーレベルのエントリのみを表示します。

エラーがより明確になります：

<Image img={step_3} alt='手順3' size='lg' />

### エラーパターンの特定 {#identify-error-patterns}

HyperDXのクラスタリング機能を使用すると、エラーを自動的に識別し、意味のあるパターンにグループ化できます。これにより、大量のログとトレースを扱う際の分析が加速されます。この機能を使用するには、左パネルの`Analysis Mode`メニューから`Event Patterns`を選択します。

エラークラスターは、`Failed to place order`という名前のパターンを含む、支払い失敗に関連する問題を明らかにします。追加のクラスターは、カード決済の問題やキャッシュが満杯であることも示しています。

<Image img={step_4} alt='手順4' size='lg' />

これらのエラークラスターは、異なるサービスから発生している可能性が高いことに注意してください。

### エラーパターンの調査 {#explore-error-pattern}

ユーザーが支払いを完了できないという報告された問題と相関する最も明白なエラークラスター`Failed to place order`をクリックします。

これにより、`frontend`サービスに関連するこのエラーのすべての発生がリストで表示されます：

<Image img={step_5} alt='手順5' size='lg' />

結果として表示されたエラーのいずれかを選択します。ログのメタデータが詳細に表示されます。`Overview`と`Column Values`の両方をスクロールすると、キャッシュに起因するカード決済の問題が示唆されます：

`failed to charge card: could not charge the card: rpc error: code = Unknown desc = Visa cache full: cannot add new item.`

<Image img={step_6} alt='手順6' size='lg' />

### インフラストラクチャの調査 {#explore-the-infrastructure}

支払い失敗の原因となっている可能性が高いキャッシュ関連のエラーを特定しました。次に、マイクロサービスアーキテクチャのどこでこの問題が発生しているかを特定する必要があります。

キャッシュの問題を考慮すると、基盤となるインフラストラクチャを調査することが理にかなっています。関連するポッドにメモリの問題がある可能性はないでしょうか？ClickStackでは、ログとメトリクスが統合されてコンテキスト内に表示されるため、根本原因を迅速に発見しやすくなります。

`Infrastructure`タブを選択して`frontend`サービスの基盤となるポッドに関連するメトリクスを表示し、時間範囲を`1d`に広げます：

<Image img={step_7} alt='手順7' size='lg' />


この問題はインフラストラクチャに関連しているようには見えません。エラーの前後を通じて、顕著に変化したメトリクスはありません。インフラストラクチャタブを閉じます。

### トレースの調査 {#explore-a-trace}

ClickStackでは、トレースはログとメトリクスの両方と自動的に関連付けられます。選択したログにリンクされているトレースを調査して、原因となっているサービスを特定しましょう。

`Trace`を選択して、関連するトレースを可視化します。その後のビューをスクロールダウンすると、HyperDXがマイクロサービス全体の分散トレースを可視化し、各サービスのスパンを接続している様子が確認できます。決済には明らかに複数のマイクロサービスが関与しており、チェックアウトや通貨換算を実行するサービスも含まれています。

<Image img={step_8} alt='Step 8' size='lg' />

ビューの下部までスクロールすると、`payment`サービスがエラーを引き起こしており、それが呼び出しチェーンを遡って伝播していることがわかります。

<Image img={step_9} alt='Step 9' size='lg' />

### トレースの検索 {#searching-traces}

ユーザーが決済サービスのキャッシュ問題により購入を完了できないことが判明しました。このサービスのトレースをより詳細に調査して、根本原因についてさらに詳しく調べましょう。

`Search`を選択してメイン検索ビューに切り替えます。データソースを`Traces`に切り替え、`Results table`ビューを選択します。**期間が引き続き過去1日間であることを確認してください。**

<Image img={step_10} alt='Step 10' size='lg' />

このビューには過去1日間のすべてのトレースが表示されます。問題が決済サービスに起因することがわかっているため、`ServiceName`に`payment`フィルターを適用します。

<Image img={step_11} alt='Step 11' size='lg' />

`Event Patterns`を選択してトレースにイベントクラスタリングを適用すると、`payment`サービスのキャッシュ問題がすぐに確認できます。

<Image img={step_12} alt='Step 12' size='lg' />

### トレースのインフラストラクチャの調査 {#explore-infrastructure-for-a-trace}

`Results table`をクリックして結果ビューに切り替えます。`StatusCode`フィルターと`Error`値を使用してエラーにフィルタリングします。

<Image img={step_13} alt='Step 13' size='lg' />

`Error: Visa cache full: cannot add new item.`エラーを選択し、`Infrastructure`タブに切り替えて、期間を`1d`に拡大します。

<Image img={step_14} alt='Step 14' size='lg' />

トレースとメトリクスを関連付けることで、`payment`サービスでメモリとCPUが増加し、その後`0`に低下した（これはポッドの再起動によるものと考えられます）ことがわかります。これは、キャッシュ問題がリソース問題を引き起こしたことを示唆しています。これが決済完了時間に影響を与えたと予想されます。

### より迅速な解決のためのイベントデルタ {#event-deltas-for-faster-resolution}

イベントデルタは、パフォーマンスやエラー率の変化を特定のデータサブセットに帰属させることで異常を浮き彫りにし、根本原因を迅速に特定しやすくします。

`payment`サービスにキャッシュ問題があり、リソース消費の増加を引き起こしていることはわかっていますが、根本原因を完全には特定できていません。

結果テーブルビューに戻り、エラーを含む期間を選択してデータを制限します。可能であれば、エラーの左側数時間とその後も選択してください（問題がまだ発生している可能性があります）。

<Image img={step_15} alt='Step 15' size='lg' />

エラーフィルターを削除し、左側の`Analysis Mode`メニューから`Event Deltas`を選択します。

<Image img={step_16} alt='Step 16' size='lg' />

上部パネルにはタイミングの分布が表示され、色はイベント密度（スパン数）を示しています。主要な集中領域外のイベントのサブセットは、通常調査する価値があるものです。

期間が`200ms`を超えるイベントを選択し、`Filter by selection`フィルターを適用すると、分析を遅いイベントに限定できます。

<Image img={step_17} alt='Step 17' size='lg' />

データのサブセットに対して分析を実行すると、ほとんどのパフォーマンススパイクが`visa`トランザクションに関連していることがわかります。

### より多くのコンテキストのためのチャートの使用 {#using-charts-for-more-context}

ClickStackでは、より多くのコンテキストを得るために、ログ、トレース、またはメトリクスから任意の数値をチャート化できます。

以下のことが判明しました。

- 問題は決済サービスにある
- キャッシュが満杯である
- これによりリソース消費が増加した
- この問題によりvisaの決済が完了できなくなった、または少なくとも完了に長時間かかるようになった

<br />

左側のメニューから`Chart Explorer`を選択します。チャートタイプ別に決済完了にかかる時間をチャート化するために、以下の値を入力します。


- `Data Source`: `Traces`
- `Metric`: `Maximum`
- `SQL Column`: `Duration`
- `Where`: `ServiceName: payment`
- `Timespan`: `Last 1 day`

<br />

`▶️`をクリックすると、支払い処理のパフォーマンスが時間の経過とともにどのように低下したかが表示されます。

<Image img={step_18} alt='Step 18' size='lg' />

`Group By`を`SpanAttributes['app.payment.card_type']`に設定すると(オートコンプリートのために`card`と入力するだけです)、Mastercardと比較してVisaトランザクションのサービスパフォーマンスがどのように低下したかを確認できます:

<Image img={step_19} alt='Step 19' size='lg' />

エラーが発生すると、レスポンスが`0s`で返されることに注意してください。

### より詳細なコンテキストのためのメトリクスの調査 {#exploring-metrics-for-more-context}

最後に、キャッシュサイズをメトリクスとしてプロットし、時間の経過に伴う動作を確認することで、より多くのコンテキストを得ましょう。

以下の値を入力してください:

- `Data Source`: `Metrics`
- `Metric`: `Maximum`
- `SQL Column`: `visa_validation_cache.size (gauge)` (just type `cache` for autocomplete)
- `Where`: `ServiceName: payment`
- `Group By`: `<empty>`

キャッシュサイズが4〜5時間の期間(おそらくソフトウェアデプロイメント後)にわたって増加し、最大サイズの`100,000`に達したことが確認できます。`Sample Matched Events`から、エラーがキャッシュがこの制限に達したことと相関しており、その後サイズが`0`として記録され、レスポンスも`0s`で返されていることがわかります。

<Image img={step_20} alt='Step 20' size='lg' />

要約すると、ログ、トレース、そして最後にメトリクスを調査することで、以下の結論に達しました:

- 問題は支払いサービスに存在する
- デプロイメントによる可能性が高いサービス動作の変更により、Visaキャッシュが4〜5時間の期間にわたってゆっくりと増加し、最大サイズの`100,000`に達した
- キャッシュのサイズが増加するにつれてリソース消費が増加した - おそらく不適切な実装が原因
- キャッシュが増加するにつれて、Visa決済のパフォーマンスが低下した
- 最大サイズに達すると、キャッシュは決済を拒否し、サイズを`0`として報告した

### セッションの使用 {#using-sessions}

セッションを使用すると、ユーザー体験を再生でき、ユーザーの視点からエラーがどのように発生したかを視覚的に確認できます。通常は根本原因の診断には使用されませんが、カスタマーサポートに報告された問題を確認するのに有用であり、より深い調査の出発点として機能します。

HyperDXでは、セッションはトレースとログにリンクされており、根本原因の完全なビューを提供します。

たとえば、サポートチームが支払い問題に遭遇したユーザーのメールアドレス`Braulio.Roberts23@hotmail.com`を提供した場合、ログやトレースを直接検索するよりも、そのユーザーのセッションから始める方が効果的です。

左側のメニューから`Client Sessions`タブに移動し、データソースが`Sessions`に設定され、期間が`Last 1 day`に設定されていることを確認してください:

<Image img={step_21} alt='Step 21' size='lg' />

`SpanAttributes.userEmail: Braulio`を検索して、顧客のセッションを見つけます。セッションを選択すると、左側に顧客のセッションのブラウザイベントと関連するスパンが表示され、右側にユーザーのブラウザ体験が再レンダリングされます:

<Image img={step_22} alt='Step 22' size='lg' />

### セッションの再生 {#replaying-sessions}

セッションは▶️ボタンを押すことで再生できます。`Highlighted`と`All Events`を切り替えることで、スパンの粒度を変更でき、前者は主要なイベントとエラーをハイライト表示します。

スパンの下部までスクロールすると、`/api/checkout`に関連する`500`エラーが表示されます。この特定のスパンの▶️ボタンを選択すると、再生がセッションのこの時点に移動し、顧客の体験を確認できます - 決済は単に機能せず、エラーも表示されていないようです。

<Image img={step_23} alt='Step 23' size='lg' />

スパンを選択すると、これが内部エラーによって引き起こされたことを確認できます。`Trace`タブをクリックして接続されたスパンをスクロールすることで、顧客が実際にキャッシュ問題の被害者であったことを確認できます。

<Image img={step_24} alt='Step 24' size='lg' />

</VerticalStepper>

このデモでは、eコマースアプリでの決済失敗に関する実際のインシデントを取り上げ、ClickStackが統合されたログ、トレース、メトリクス、セッション再生を通じて根本原因をどのように明らかにするかを示しています - 特定の機能をより深く理解するには、[他の入門ガイド](/use-cases/observability/clickstack/sample-datasets)をご覧ください。
