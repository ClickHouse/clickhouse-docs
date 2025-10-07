---
'slug': '/use-cases/observability/clickstack/getting-started/remote-demo-data'
'title': 'リモートデモデータセット'
'sidebar_position': 2
'pagination_prev': null
'pagination_next': null
'description': 'ClickStackとリモートデモデータセットの使い始め'
'doc_type': 'guide'
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
import DemoArchitecture from '@site/i18n/jp/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';

**このガイドは、[オールインワンイメージの指示](/use-cases/observability/clickstack/getting-started)または[ローカルモードのみ](/use-cases/observability/clickstack/deployment/local-mode-only)を使用して ClickStack をデプロイし、初期ユーザー作成を完了したことを前提としています。あるいは、ユーザーはすべてのローカルセットアップをスキップし、私たちの ClickStack ホスティングデモ [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com) に接続することができます。このデモはこのデータセットを使用しています。**

このガイドでは、公開 ClickHouse プレイグラウンドにホストされているサンプルデータセットを使用しています。これは、ローカルの ClickStack デプロイメントから接続できます。

:::warning HyperDXはClickHouse Cloudでサポートされていません
ClickHouse Cloud にホストされている HyperDX の場合、リモートデータベースはサポートされていません。したがって、このデータセットはサポートされていません。
:::

このデータは、公式の OpenTelemetry（OTel）デモの ClickHouse バージョンからキャプチャされた約 40 時間のデータを含んでいます。データは毎晩再生され、タイムスタンプは現在の時間ウィンドウに調整されており、ユーザーは HyperDX の統合ログ、トレース、メトリクスを使用してシステムの動作を探ることができます。

:::note データの変動
データセットは毎日午前0時から再生されるため、デモを探索するタイミングによっては、正確な視覚化が異なる場合があります。
:::

## デモシナリオ {#demo-scenario}

このデモでは、望遠鏡と関連アクセサリーを販売する e コマースウェブサイトに関するインシデントを調査します。

カスタマーサポートチームは、ユーザーがチェックアウト時に支払いを完了できない問題を報告しています。この問題は、調査のためにサイト信頼性エンジニアリング（SRE）チームにエスカレーションされました。

SRE チームは、HyperDX を使用してログ、トレース、メトリクスを分析し、問題を診断して解決します。次に、セッションデータをレビューして、彼らの結論が実際のユーザー行動と一致しているかどうかを確認します。

## OpenTelemetry デモ {#otel-demo}

このデモは、公式の OpenTelemetry デモの [ClickStack が管理するフォーク](https://github.com/ClickHouse/opentelemetry-demo) を使用しています。

<DemoArchitecture/>

## デモステップ {#demo-steps}

**私たちは、このデモに [ClickStack SDKs](/use-cases/observability/clickstack/sdks) を装備しており、Kubernetes にサービスをデプロイし、メトリクスやログも収集しています。**

<VerticalStepper headerLevel="h3">

### デモサーバーに接続する {#connect-to-the-demo-server}

:::note ローカル専用モード
ローカルモードでデプロイする際に `デモサーバーに接続` をクリックした場合、このステップはスキップできます。このモードを使用している場合、ソースは `Demo_` でプレフィックスされます（例： `Demo_Logs`）。
:::

`チーム設定` に移動し、 `ローカル接続` の `編集` をクリックします：

<Image img={edit_connection} alt="接続の編集" size="lg"/>

接続名を `Demo` に変更し、デモサーバーの以下の接続詳細を使用して subsequent フォームを完成させます：

- `接続名`: `Demo`
- `ホスト`: `https://sql-clickhouse.clickhouse.com`
- `ユーザー名`: `otel_demo`
- `パスワード`: 空白のままにします

<Image img={edit_demo_connection} alt="デモ接続の編集" size="lg"/>

### ソースを変更する {#modify-sources}

:::note ローカル専用モード
ローカルモードでデプロイする際に `デモサーバーに接続` をクリックした場合、このステップはスキップできます。このモードを使用している場合、ソースは `Demo_` でプレフィックスされます（例： `Demo_Logs`）。
:::

`ソース` にスクロールし、 `Logs`、 `Traces`、 `Metrics`、および `Sessions` の各ソースを変更して `otel_v2` データベースを使用するようにします。

<Image img={edit_demo_source} alt="デモソースの編集" size="lg"/>

:::note
各ソースに全データベースのリストが表示されるように、ページをリロードする必要がある場合があります。
:::

### 時間枠を調整する {#adjust-the-timeframe}

右上の時間ピッカーを使用して、前の `1日前` のデータをすべて表示するように時間を調整します。

<Image img={step_2} alt="ステップ 2" size="lg"/>

概要のバー チャートのエラー数に小さな差が見られるかもしれませんが、数本の連続バーで赤がわずかに増加しています。

:::note
バーの位置は、データセットをクエリするタイミングによって異なります。
:::

### エラーをフィルタリングする {#filter-to-errors}

エラーの発生を強調表示するために、`SeverityText` フィルタを使用し、 `error` を選択してエラー レベルのエントリのみを表示します。

エラーはより明確になるでしょう：

<Image img={step_3} alt="ステップ 3" size="lg"/>

### エラーパターンを特定する {#identify-error-patterns}

HyperDX のクラスタリング機能を使用すると、エラーを自動的に特定し、有意義なパターンにグループ化できます。これにより、大量のログやトレースを扱う際のユーザー分析が加速されます。使用するには、左パネルの `分析モード` メニューから `イベントパターン` を選択します。

エラー クラスターは、 `注文を完了できませんでした` という名前のパターンを含む失敗した支払いに関連する問題を明らかにします。追加のクラスターは、カードの課金やキャッシュが満杯であることを示しています。

<Image img={step_4} alt="ステップ 4" size="lg"/>

これらのエラー クラスターは、おそらく異なるサービスから発生していることに注意してください。

### エラーパターンを探る {#explore-error-pattern}

ユーザーが支払いを完了できないという報告された問題と相関する最も明白なエラー クラスター `注文を完了できませんでした` をクリックします。

これにより、`frontend` サービスに関連するこのエラーのすべての発生のリストが表示されます：

<Image img={step_5} alt="ステップ 5" size="lg"/>

結果として得られたエラーのいずれかを選択します。ログメタデータが詳細に表示されます。 `概要` と `カラム値` の両方をスクロールすると、キャッシュが原因でカードの課金に問題が発生していることを示唆しています：

`カードを課金できませんでした: カードを課金できませんでした: rpc エラー: コード = 不明な説明 = Visa キャッシュがいっぱいです: 新しいアイテムを追加できません。`

<Image img={step_6} alt="ステップ 6" size="lg"/>

### インフラを探る {#explore-the-infrastructure}

私たちは、支払いの失敗を引き起こしている可能性のあるキャッシュ関連のエラーを特定しました。この問題が私たちのマイクロサービスアーキテクチャのどこから発生しているのかを特定する必要があります。

キャッシュの問題を考えると、関連するポッドにメモリの問題がある可能性があるため、基盤となるインフラを調査するのが理にかなっています。ClickStackでは、ログとメトリクスが統合され、文脈の中で表示されるため、根本原因を迅速に発見しやすくなります。

`インフラ` タブを選択して、 `frontend` サービスの基盤となるポッドに関連するメトリクスを表示し、時間範囲を `1d` に広げます：

<Image img={step_7} alt="ステップ 7" size="lg"/>

問題はインフラに関連しているようではありません-時間の経過に伴いメトリクスは顕著に変化していません：エラーの前後いずれも。インフラタブを閉じます。

### トレースを探る {#explore-a-trace}

ClickStack では、トレースもログやメトリクスと自動的に相関付けられます。私たちの選択したログにリンクされたトレースを探査して、担当するサービスを特定しましょう。

`トレース` を選択して、関連するトレースを視覚化します。下にスクロールすると、HyperDX がマイクロサービス全体で分散トレースを視覚化できる様子がわかります。各サービスのスパンを接続しています。支払いは、チェックアウトと通貨変換を行う複数のマイクロサービスを含むことが明確です。

<Image img={step_8} alt="ステップ 8" size="lg"/>

ビューの下部にスクロールすると、`payment` サービスがエラーを引き起こしており、それが呼び出しチェーンを遡って伝播していることがわかります。

<Image img={step_9} alt="ステップ 9" size="lg"/>

### トレースを検索する {#searching-traces} 

ユーザーが支払いの完了に失敗しているのは、支払いサービスのキャッシュ問題によることが分かりました。このサービスのトレースを詳細に探り、根本原因についてさらに学んでみましょう。

`検索` を選択してメイン 検索ビューに切り替えます。 `トレース` のデータソースを切り替え、 `結果テーブル` ビューを選択します。**時間範囲が過去1日のものであることを確認します。**

<Image img={step_10} alt="ステップ 10" size="lg"/>

このビューには、過去1日のすべてのトレースが表示されます。問題が支払いサービスに起因することがわかっているため、`ServiceName` に `payment` フィルタを適用します。

<Image img={step_11} alt="ステップ 11" size="lg"/>

トレースにイベントクラスタリングを適用して `イベントパターン` を選択すると、`payment` サービスのキャッシュの問題がすぐにわかります。

<Image img={step_12} alt="ステップ 12" size="lg"/>

### トレースのインフラを探る {#explore-infrastructure-for-a-trace}

`結果テーブル` をクリックして結果ビューに切り替え、 `StatusCode` フィルタと `Error` 値を使用してエラーをフィルタリングします。

<Image img={step_13} alt="ステップ 13" size="lg"/>

`Error: Visa cache full: cannot add new item.` というエラーを選択し、 `インフラ` タブに切り替え、時間範囲を `1d` に広げます。

<Image img={step_14} alt="ステップ 14" size="lg"/>

トレースとメトリクスを相関させることで、`payment` サービスと共にメモリと CPU が増加し、その後 `0` に崩壊することが見て取れます（これをポッド再起動に起因できます） - キャッシュの問題がリソースの問題を引き起こしたことを示しています。これにより、支払いの完了時間に影響を与えたと予想できます。

### より迅速な解決のためのイベントデルト {#event-deltas-for-faster-resolution} 

イベントデルトは、具体的なデータのサブセットに変化を帰属させることによって異常を浮き彫りにし、パフォーマンスやエラー率の変化を捉えやすくします。

私たちは、`payment` サービスにキャッシュの問題があり、リソース消費の増加を招いていることがわかっていますが、根本原因を完全に特定できていません。

結果テーブルビューに戻り、エラーを含む時間範囲を選択してデータを制限します。できれば、エラーの左側と右側で数時間を選択します（問題はまだ発生している可能性があります）：

<Image img={step_15} alt="ステップ 15" size="lg"/>

エラーフィルタを削除し、左側の `分析モード` メニューから `イベントデルト` を選択します。

<Image img={step_16} alt="ステップ 16" size="lg"/>

上部パネルには、タイミングの分布が表示され、色はイベントの密度（スパンの数）を示します。主要な集中から外れたイベントのサブセットは、通常調査に値するものです。

`200ms` 以上の継続時間を持つイベントを選択し、 `選択によるフィルタ` を適用すると、分析を遅いイベントに制限できます：

<Image img={step_17} alt="ステップ 17" size="lg"/>

データのサブセット分析を行うと、ほとんどのパフォーマンススパイクは `visa` 取引に関連していることがわかります。

### より多くのコンテキストのためのチャートの使用 {#using-charts-for-more-context}

ClickStack では、ログ、トレース、またはメトリクスから任意の数値をチャート化し、より大きなコンテキストを提供することができます。

私たちは以下のことを確認しました：

- 問題は支払いサービスにあります。
- キャッシュが満杯です。
- リソース消費の増加を引き起こしました。
- この問題により、Visa の支払いが完了しませんでした - あるいは、少なくとも完了までに時間がかかるようになりました。

<br/>

左側のメニューから `チャートエクスプローラー` を選択します。支払いの完了にかかる時間をチャート化するために、以下の値を入力します：

- `データソース`: `トレース`
- `メトリクス`: `最大`
- `SQL カラム`: `Duration`
- `条件`: `ServiceName: payment`
- `時間枠`: `最終1日`

<br/>

`▶️` をクリックすると、時間の経過による支払いのパフォーマンスがどのように劣化したかが表示されます。

<Image img={step_18} alt="ステップ 18" size="lg"/>

`Group By` を `SpanAttributes['app.payment.card_type']` に設定すると（自動補完のために `card` と入力するだけです）、Visa トランザクションに対するサービスのパフォーマンスが Mastercard に対してどのように劣化したかがわかります：

<Image img={step_19} alt="ステップ 19" size="lg"/>

エラーが発生すると、応答が `0s` で戻されることに注意してください。

### メトリクスのより多くのコンテキストを探る {#exploring-metrics-for-more-context}

最後に、キャッシュサイズをメトリクスとしてプロットして、時間の経過とともにどのように変化したかを確認し、コンテキストを提供します。

以下の値を入力します：

- `データソース`: `メトリクス`
- `メトリクス`: `最大`
- `SQL カラム`: `visa_validation_cache.size (gauge)`（自動補完のために `cache` と入力するだけです）
- `条件`: `ServiceName: payment`
- `Group By`: `<空白>`

キャッシュサイズが 4～5 時間の期間で増加し（おそらくソフトウェアのデプロイメント後）、最大サイズが `100,000` に達する様子がわかります。`Sample Matched Events` から、エラーがこの制限に達したキャッシュと相関していることがわかります。その後、サイズが `0` で記録され、応答も `0s` で返されています。

<Image img={step_20} alt="ステップ 20" size="lg"/>

要約すると、ログ、トレース、そして最後にメトリクスを探ることで、以下の結論に達しました：

- 問題は支払いサービスに存在します。
- サービスの動作の変化は、デプロイにより、4～5 時間の間にキャッシュが徐々に増加する結果となり、最大サイズは `100,000` に達しました。
- キャッシュサイズの増加により、リソース消費が増加し、これはおそらく実装の問題によるものです。
- キャッシュのサイズが増えるにつれ、Visa 支払いのパフォーマンスが劣化しました。
- 最大サイズに達すると、キャッシュは支払いを拒否し、自己報告サイズは `0` となります。

### セッションの使用 {#using-sessions} 

セッションは、エラーがユーザーの視点からどのように発生したかを視覚的に再生することを可能にします。通常、根本原因を診断するために使用されることはありませんが、カスタマーサポートに報告された問題を確認するためには貴重であり、より深い調査の出発点ともなります。

HyperDX では、セッションがトレースとログにリンクされており、根本原因の完全なビューを提供します。

たとえば、サポートチームが支払いの問題に遭遇したユーザーのメールアドレス `Braulio.Roberts23@hotmail.com` を提供した場合、ログやトレースを直接検索するよりも、そのユーザーのセッションから始める方が効果的です。

左側のメニューから `クライアント セッション` タブに移動し、データソースが `セッション` に設定されていて、時間範囲が `最終1日` に設定されていることを確認します：

<Image img={step_21} alt="ステップ 21" size="lg"/>

`SpanAttributes.userEmail: Braulio` を検索して、顧客のセッションを見つけます。セッションを選択すると、顧客のセッションに対するブラウザのイベントと関連するスパンが左側に表示され、ユーザーのブラウザ体験が右側に再表示されます：

<Image img={step_22} alt="ステップ 22" size="lg"/>

### セッションを再生する {#replaying-sessions} 

▶️ ボタンを押すことでセッションを再生できます。 `ハイライト` と `すべてのイベント` の間を切り替えることで、スパンの粒度を変えることができ、前者は重要なイベントとエラーを強調表示します。

スパンの下部にスクロールすると、 `/api/checkout` に関連する `500` エラーが見られます。この特定のスパンの ▶️ ボタンを選択すると、セッションのこのポイントに移動し、顧客の体験を確認できます - 支払いがただ機能しないようで、エラーも表示されません。

<Image img={step_23} alt="ステップ 23" size="lg"/>

このスパンを選択することで、これが内部エラーによって引き起こされたことを確認できます。 `トレース` タブをクリックして接続されたスパンをスクロールすると、顧客がキャッシュ問題の犠牲者であったことを確認できます。

<Image img={step_24} alt="ステップ 24" size="lg"/>

</VerticalStepper>

このデモでは、e コマースアプリでの支払い失敗に関する実際のインシデントを通じて、ClickStack が統合ログ、トレース、メトリクス、およびセッション再生を通じて根本原因を解明するのにどのように役立つかを示しています - 特定の機能を深く掘り下げるために、私たちの [他の始めにガイド](/use-cases/observability/clickstack/sample-datasets) を探索してください。
