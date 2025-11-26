---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: 'リモートデモデータセット'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: 'ClickStack とリモートデモデータセットの利用を開始する'
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

**以下のガイドでは、[all-in-one イメージ用の手順](/use-cases/observability/clickstack/getting-started) または [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only) の手順に従って ClickStack をデプロイし、初回ユーザー作成を完了していることを前提としています。あるいは、ローカルでのセットアップをすべて省略し、このデータセットを使用している ClickStack ホスト済みデモ環境 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) に接続することもできます。**

このガイドで使用するサンプルデータセットは、パブリックな ClickHouse Playground である [sql.clickhouse.com](https://sql.clickhpouse.com) 上にホストされており、ローカルの ClickStack デプロイメントから接続できます。

:::warning ClickHouse Cloud 上の HyperDX ではサポートされません
HyperDX が ClickHouse Cloud 上でホストされている場合、リモートデータベースはサポートされません。そのため、このデータセットもサポート対象外です。
:::


これは、公式 OpenTelemetry (OTel) デモの ClickHouse バージョンから取得した、およそ 40 時間分のデータを含みます。データは毎晩リプレイされ、その際タイムスタンプが現在の時間帯に合わせて調整されるため、ユーザーは HyperDX の統合されたログ、トレース、メトリクスを使用してシステムの挙動を観察・分析できます。

:::note データの変動
このデータセットは毎日深夜からリプレイされるため、デモを確認するタイミングによって、可視化の内容が多少異なる場合があります。
:::

## デモシナリオ {#demo-scenario}

このデモでは、望遠鏡および関連アクセサリを販売する eコマースサイトで発生したインシデントを調査します。

カスタマーサポートチームから、ユーザーがチェックアウト時に支払いを完了できない問題が発生しているとの報告がありました。この問題は調査のため、Site Reliability Engineering (SRE) チームにエスカレーションされています。

SRE チームは HyperDX を使用してログ、トレース、メトリクスを分析し、問題を診断・解決します。そのうえで、セッションデータを確認し、導き出した結論が実際のユーザー行動と一致しているかどうかを検証します。

## OpenTelemetry デモ {#otel-demo}

このデモでは、公式 OpenTelemetry デモの [ClickStack がメンテナンスしているフォーク](https://github.com/ClickHouse/opentelemetry-demo) を使用します。

<DemoArchitecture/>

## デモの手順 {#demo-steps}

**このデモでは、[ClickStack SDKs](/use-cases/observability/clickstack/sdks) を用いてサービスをインストルメントし、Kubernetes 上にデプロイしています。さらに、そのサービスからメトリクスとログも収集しています。**

<VerticalStepper headerLevel="h3">
  ### デモサーバーへの接続

  :::note ローカル専用モード
  ローカルモードでのデプロイ時に`Connect to Demo Server`をクリックした場合、この手順はスキップできます。このモードを使用する場合、ソースには`Demo_`というプレフィックスが付与されます（例：`Demo_Logs`）
  :::

  `Team Settings`に移動し、`Local Connection`の`Edit`をクリックします:

  <Image img={edit_connection} alt="接続の編集" size="lg" />

  接続名を `Demo` に変更し、デモサーバーの接続情報を以下のように入力してください：

  * `接続名`: `Demo`
  * `Host`: `https://sql-clickhouse.clickhouse.com`
  * `ユーザー名`: `otel_demo`
  * `Password`: 空欄のままにします

  <Image img={edit_demo_connection} alt="デモ接続を編集" size="lg" />

  ### ソースを変更する

  :::note ローカル専用モード
  ローカルモードでのデプロイ時に`Connect to Demo Server`をクリックした場合、この手順はスキップできます。このモードを使用する場合、ソースには`Demo_`というプレフィックスが付与されます（例：`Demo_Logs`）
  :::

  `Sources`まで上にスクロールし、各ソース（`Logs`、`Traces`、`Metrics`、`Sessions`）を変更して`otel_v2`データベースを使用するように設定してください。

  <Image img={edit_demo_source} alt="デモ用ソースを編集" size="lg" />

  :::note
  各ソースにデータベースの完全なリストが表示されるようにするには、ページの再読み込みが必要になる場合があります。
  :::

  ### 時間範囲を調整する

  右上の時間選択ツールを使用して、過去`1日`のすべてのデータを表示するように時間範囲を調整します。

  <Image img={step_2} alt="ステップ 2" size="lg" />

  概要バーチャートのエラー数にわずかな差異が確認でき、連続する複数のバーで赤色の表示がわずかに増加しています。

  :::note
  バーの位置は、データセットをクエリするタイミングによって異なります。
  :::

  ### エラーでフィルタリング

  エラーの発生を強調表示するには、`SeverityText` フィルタを使用して `error` を選択し、エラーレベルのエントリのみを表示します。

  エラーがより明確になります：

  <Image img={step_3} alt="手順 3" size="lg" />

  ### エラーパターンを特定する

  HyperDXのクラスタリング機能を使用すると、エラーを自動的に識別し、意味のあるパターンにグループ化できます。これにより、大量のログやトレースを扱う際の分析作業が効率化されます。使用するには、左パネルの`Analysis Mode`メニューから`Event Patterns`を選択してください。

  エラークラスターは、`Failed to place order`という名前付きパターンを含む、決済失敗に関連する問題を示しています。追加のクラスターは、カード決済の問題やキャッシュ容量の不足も示しています。

  <Image img={step_4} alt="手順 4" size="lg" />

  これらのエラークラスターは異なるサービスに起因している可能性があります。

  ### エラーパターンを調査する

  ユーザーが支払いを完了できないという報告された問題に相関する、最も明白なエラークラスターをクリックします：`Failed to place order`。

  これにより、`frontend` サービスに関連付けられたこのエラーの全発生箇所が一覧表示されます:

  <Image img={step_5} alt="手順 5" size="lg" />

  結果として表示されたエラーのいずれかを選択します。ログのメタデータが詳細に表示されます。`Overview`と`Column Values`の両方をスクロールすると、キャッシュに起因するcharging cardsの問題が示唆されます:

  `カードへの請求に失敗しました: カードに請求できませんでした: rpc error: code = Unknown desc = Visa cache full: cannot add new item.`

  <Image img={step_6} alt="手順 6" size="lg" />

  ### インフラストラクチャを確認する

  キャッシュ関連のエラーを特定しました。これが決済失敗の原因となっている可能性が高いです。マイクロサービスアーキテクチャ内のどこでこの問題が発生しているかを特定する必要があります。

  キャッシュの問題を踏まえると、基盤インフラストラクチャを調査することが妥当です。関連するポッドにメモリの問題がある可能性があります。ClickStackでは、ログとメトリクスが統合され、コンテキスト内で表示されるため、根本原因を迅速に特定できます。

  `Infrastructure`タブを選択して、`frontend`サービスの基盤となるポッドに関連するメトリクスを表示し、期間を`1d`に拡大します:

  <Image img={step_7} alt="ステップ 7" size="lg" />

  この問題はインフラストラクチャに関連していないと考えられます。エラー発生前後の期間において、メトリクスに顕著な変化は確認されていません。インフラストラクチャタブを閉じます。

  ### トレースを調査する

  ClickStackでは、トレースはログとメトリクスの両方と自動的に相関付けられます。選択したログにリンクされているトレースを調査して、対象のサービスを特定しましょう。

  `Trace` を選択して、関連するトレースを可視化します。続く画面を下にスクロールすると、HyperDX がマイクロサービス全体の分散トレースを可視化し、各サービスのスパンを接続している様子を確認できます。決済処理には、チェックアウトや通貨換算を実行するマイクロサービスなど、複数のマイクロサービスが関与していることが明確に分かります。

  <Image img={step_8} alt="手順 8" size="lg" />

  ビューの下部までスクロールすると、`payment`サービスがエラーの原因であり、それが呼び出しチェーンを遡って伝播していることが確認できます。

  <Image img={step_9} alt="手順 9" size="lg" />

  ### トレースの検索

  決済サービスのキャッシュ問題により、ユーザーが購入を完了できないことが確認されました。このサービスのトレースをより詳細に調査して、根本原因についてさらに詳しく確認します。

  `Search`を選択してメイン検索ビューに切り替えます。`Traces`のデータソースに切り替え、`Results table`ビューを選択します。**時間範囲が過去1日間のままであることを確認してください。**

  <Image img={step_10} alt="ステップ 10" size="lg" />

  このビューには過去1日間のすべてのトレースが表示されます。問題の原因が決済サービスにあることが判明しているため、`ServiceName`に`payment`フィルタを適用します。

  <Image img={step_11} alt="手順 11" size="lg" />

  `Event Patterns`を選択してトレースにイベントクラスタリングを適用することで、`payment`サービスのキャッシュ問題を即座に確認できます。

  <Image img={step_12} alt="手順 12" size="lg" />

  ### トレースのインフラストラクチャを調査する

  `Results table`をクリックして結果ビューに切り替えます。`StatusCode`フィルターで`Error`値を指定してエラーをフィルタリングします。

  <Image img={step_13} alt="手順 13" size="lg" />

  `Error: Visa cache full: cannot add new item.` エラーを選択し、`Infrastructure` タブに切り替えて、時間範囲を `1d` に拡大します。

  <Image img={step_14} alt="手順 14" size="lg" />

  トレースとメトリクスを相関させることで、`payment`サービスのメモリとCPU使用率が増加した後、`0`に急降下したことが確認できます(これはポッドの再起動によるものと考えられます)。これは、キャッシュの問題がリソース問題を引き起こしたことを示唆しています。この影響により、決済完了時間に影響が出たと予想されます。

  ### より迅速な問題解決のためのイベント差分

  Event Deltasは、パフォーマンスやエラー率の変化を特定のデータサブセットに関連付けることで異常を検出し、根本原因の迅速な特定を可能にします。

  `payment` サービスにキャッシュの問題があり、リソース消費量の増加を引き起こしていることは把握していますが、根本原因は完全には特定されていません。

  結果テーブルビューに戻り、エラーを含む期間を選択してデータを絞り込みます。可能であれば、エラー発生時刻の数時間前から数時間後までを選択してください（問題が継続している可能性があるため）:

  <Image img={step_15} alt="手順 15" size="lg" />

  エラーフィルターを削除し、左側の`Analysis Mode`メニューから`Event Deltas`を選択します。

  <Image img={step_16} alt="手順 16" size="lg" />

  上部パネルにはタイミングの分布が表示され、色はイベント密度（スパン数）を示します。主要な集中範囲から外れたイベントのサブセットは、通常、調査対象として注目すべきものです。

  期間が`200ms`を超えるイベントを選択し、`Filter by selection`フィルターを適用すると、分析対象を低速なイベントに絞り込むことができます:

  <Image img={step_17} alt="手順 17" size="lg" />

  データのサブセットに対して分析を実行した結果、ほとんどのパフォーマンススパイクが `visa` トランザクションに関連していることが確認できます。

  ### チャートによるコンテキストの詳細確認

  ClickStackでは、ログ、トレース、メトリクスから任意の数値をグラフ化して、より詳細なコンテキストを取得できます。

  以下を設定しました：

  * 問題は決済サービス側にあります
  * キャッシュがいっぱいです
  * これによりリソースの消費量が増加しました
  * この問題により、Visaカードでの支払いが完了しなくなる、あるいは完了までに非常に長い時間がかかる状態になっていました。

  <br />

  左側のメニューから`Chart Explorer`を選択します。チャートタイプ別に決済完了までの所要時間をグラフ化するには、以下の値を設定してください：

  * `データソース`: `トレース`
  * `メトリクス`: `最大`
  * `SQL カラム`: `Duration`
  * `Where`: `ServiceName: payment`
  * `期間`: `過去 1 日`

  <br />

  `▶️` をクリックすると、支払い処理のパフォーマンスが時間経過とともにどのように劣化したかが表示されます。

  <Image img={step_18} alt="手順 18" size="lg" />

  `Group By`を`SpanAttributes['app.payment.card_type']`に設定すると（オートコンプリートには`card`と入力するだけで表示されます）、Mastercardと比較してVisaトランザクションでサービスのパフォーマンスがどのように低下したかを確認できます：

  <Image img={step_19} alt="手順 19" size="lg" />

  エラーが発生すると、レスポンスは`0s`で返されることに注意してください。

  ### メトリクスをより詳細に探索する

  最後に、キャッシュサイズをメトリックとしてプロットし、時系列での挙動を確認することで、より詳細なコンテキストを把握できます。

  以下の値を設定してください：

  * `データソース`: `メトリクス`
  * `メトリクス`: `最大`
  * `SQL Column`: `visa_validation_cache.size (gauge)`（`cache` と入力すると自動補完されます）
  * `Where`: `ServiceName: payment`
  * `グループ化`: `<空>`

  キャッシュサイズが4～5時間かけて増加し（おそらくソフトウェアのデプロイメント後）、最大サイズ`100,000`に到達したことが確認できます。`Sample Matched Events`から、エラーがキャッシュのこの上限到達と相関付けられており、その後サイズが`0`として記録され、レスポンスも`0s`で返されていることがわかります。

  <Image img={step_20} alt="手順20" size="lg" />

  要約すると、ログ、トレース、メトリクスを順に調査した結果、以下の結論に至りました:

  * 問題は決済サービス側にあります
  * サービスの挙動が変化し、おそらくデプロイメントが原因で、4〜5時間かけてvisaキャッシュが緩やかに増加し、最大で `100,000` に達しました。
  * キャッシュのサイズが大きくなるにつれてリソース消費が増加しました。これは、おそらく実装が不十分だったことが原因です。
  * キャッシュが大きくなるにつれて、Visa決済の処理性能が低下しました
  * キャッシュが最大サイズに達すると、支払いを拒否し、自身のサイズを `0` と報告しました。

  ### セッションの使用

  セッション機能により、ユーザー体験を再生し、エラーがユーザーの視点からどのように発生したかを視覚的に確認できます。根本原因の診断には通常使用されませんが、カスタマーサポートに報告された問題の確認に有用であり、詳細な調査の起点として活用できます。

  HyperDXでは、セッションがトレースとログに紐付けられており、根本原因の全体像を把握できます。

  たとえば、サポートチームが支払いの問題に遭遇したユーザーのメールアドレス `Braulio.Roberts23@hotmail.com` を提供した場合、ログやトレースを直接検索するよりも、そのユーザーのセッションから始める方が効果的であることが多いです。

  左側のメニューから`Client Sessions`タブに移動し、データソースが`Sessions`に設定されていること、および期間が`Last 1 day`に設定されていることを確認します:

  <Image img={step_21} alt="手順 21" size="lg" />

  `SpanAttributes.userEmail: Braulio` を検索して顧客のセッションを特定します。セッションを選択すると、左側に当該顧客のセッションに関連するブラウザイベントとスパンが表示され、右側にユーザーのブラウザ操作が再現されます:

  <Image img={step_22} alt="手順 22" size="lg" />

  ### セッションの再生

  ▶️ボタンを押すことでセッションを再生できます。`Highlighted`と`All Events`を切り替えることで、スパンの粒度レベルを調整できます。前者では主要なイベントとエラーがハイライト表示されます。

  スパンの最下部までスクロールすると、`/api/checkout` に関連付けられた `500` エラーを確認できます。この特定のスパンの ▶️ ボタンを選択すると、リプレイがセッション内のこの時点に移動し、顧客の体験を確認することができます。支払い処理はエラーメッセージが表示されることなく、単に動作していないことがわかります。

  <Image img={step_23} alt="手順 23" size="lg" />

  スパンを選択すると、内部エラーが原因であることを確認できます。`Trace`タブをクリックして接続されたスパンをスクロールすることで、顧客が実際にキャッシュ問題の影響を受けていたことを確認できます。

  <Image img={step_24} alt="手順 24" size="lg" />
</VerticalStepper>

このデモでは、実際に発生した e コマースアプリでの決済失敗インシデントを題材に、ClickStack が統合されたログ、トレース、メトリクス、セッションリプレイを通じてどのように根本原因の特定を支援するかを順を追って解説します。特定の機能をさらに深く理解するには、[その他の入門ガイド](/use-cases/observability/clickstack/sample-datasets)も参照してください。