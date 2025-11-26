---
slug: /use-cases/observability/clickstack/alerts
title: 'ClickStack での検索'
sidebar_label: 'アラート'
pagination_prev: null
pagination_next: null
description: 'ClickStack によるアラート'
doc_type: 'guide'
keywords: ['ClickStack', 'オブザーバビリティ', 'アラート', '検索アラート', '通知', 'しきい値', 'Slack', 'Email', 'PagerDuty', 'エラー監視', 'パフォーマンス監視', 'ユーザーイベント']
---

import Image from '@theme/IdealImage';
import search_alert from '@site/static/images/use-cases/observability/search_alert.png';
import edit_chart_alert from '@site/static/images/use-cases/observability/edit_chart_alert.png';
import add_chart_alert from '@site/static/images/use-cases/observability/add_chart_alert.png';
import create_chart_alert from '@site/static/images/use-cases/observability/create_chart_alert.png';
import alerts_search_view from '@site/static/images/use-cases/observability/alerts_search_view.png';
import add_new_webhook from '@site/static/images/use-cases/observability/add_new_webhook.png';
import add_webhook_dialog from '@site/static/images/use-cases/observability/add_webhook_dialog.png';
import manage_alerts from '@site/static/images/use-cases/observability/manage_alerts.png';
import alerts_view from '@site/static/images/use-cases/observability/alerts_view.png';
import multiple_search_alerts from '@site/static/images/use-cases/observability/multiple_search_alerts.png';
import remove_chart_alert from '@site/static/images/use-cases/observability/remove_chart_alert.png';


## ClickStack におけるアラート機能 {#alerting-in-clickstack}

ClickStack にはアラート機能が組み込まれており、チームはログ、メトリクス、トレースにわたってリアルタイムに問題を検知し、対応できます。

アラートは HyperDX のインターフェース上で直接作成でき、Slack や PagerDuty などの一般的な通知システムと連携します。

アラート機能は ClickStack 内のデータ全体に対してシームレスに機能し、システムの健全性の追跡、パフォーマンス劣化の検知、重要なビジネスイベントの監視に役立ちます。



## アラートの種類 {#types-of-alerts}

ClickStack は、アラートを作成するための **検索アラート** と **ダッシュボードチャートアラート** という 2 つの補完的な方法をサポートしています。アラートが作成されると、そのアラートは検索またはチャートのいずれかに紐づきます。

### 1. 検索アラート {#search-alerts}

検索アラートを使用すると、保存済み検索の結果に基づいて通知をトリガーできます。これにより、特定のイベントやパターンが想定よりも多く（または少なく）発生したときに検知できます。

定義された時間ウィンドウ内で条件に一致する結果の件数が、指定したしきい値を上回るか下回ったときにアラートがトリガーされます。

検索アラートを作成するには:

<VerticalStepper headerLevel="h4">

検索に対してアラートを作成するには、その検索が保存されている必要があります。ユーザーは、既存の保存済み検索に対してアラートを作成するか、アラート作成プロセス中に検索を保存できます。以下の例では、検索はまだ保存されていないものとします。

#### アラート作成ダイアログを開く {#open-dialog}

まず、[検索](/use-cases/observability/clickstack/search) を実行し、`Search` ページ右上の `Alerts` ボタンをクリックします。

<Image img={alerts_search_view} alt="検索アラートビュー" size="lg"/>

#### アラートを作成する {#create-the-alert}

アラート作成パネルから、次の操作が可能です:

- アラートに紐づく保存済み検索に名前を付けます。
- しきい値を設定し、指定した期間内にそのしきい値に何回到達した場合にアラートを発報するかを指定します。しきい値は上限または下限としても使用できます。ここで指定する期間は、アラートがどのくらいの頻度でトリガーされるかも決定します。
- `grouped by` の値を指定します。これにより、`ServiceName` のような項目で検索結果を集約でき、同じ検索から複数のアラートをトリガーできるようになります。
- 通知の送信先となる webhook を選択します。このビューから新しい webhook を直接追加することもできます。詳細は [Adding a webhook](#add-webhook) を参照してください。

保存前に、ClickStack はしきい値条件を可視化するため、期待どおりに動作するかを確認できます。

<Image img={search_alert} alt="検索アラート" size="lg"/>

</VerticalStepper>

1 つの検索に対して複数のアラートを追加できる点に注意してください。上記のプロセスを繰り返すと、既存のアラートがアラート編集ダイアログ上部のタブとして表示され、それぞれのアラートには番号が割り当てられます。

<Image img={multiple_search_alerts} alt="複数のアラート" size="md"/>

### 2. ダッシュボードチャートアラート {#dashboard-alerts}

ダッシュボードアラートは、チャートに対するアラート機能を拡張します。

保存済みダッシュボード上のチャートから直接、チャートベースのアラートを作成できます。これは完全な SQL 集約と、高度な計算のための ClickHouse 関数によって動作します。

メトリクスが定義されたしきい値を超えたときに自動的にアラートがトリガーされ、KPI、レイテンシー、その他の主要なメトリクスを経時的に監視できます。

:::note
ダッシュボード上の可視化に対してアラートを作成するには、そのダッシュボードが保存されている必要があります。
:::

ダッシュボードアラートを追加するには:

<VerticalStepper headerLevel="h4">

チャート作成プロセス中、ダッシュボードにチャートを追加するとき、または既存チャートに対してアラートを作成できます。以下の例では、チャートはすでにダッシュボード上に存在しているものとします。

#### チャート編集ダイアログを開く {#open-chart-dialog}

チャートの設定メニューを開き、アラートボタンを選択します。これによりチャート編集ダイアログが表示されます。

<Image img={edit_chart_alert} alt="チャートアラートの編集" size="lg"/>

#### アラートを追加する {#add-chart-alert}

**Add Alert** を選択します。

<Image img={add_chart_alert} alt="チャートにアラートを追加" size="lg"/>

#### アラート条件を定義する {#define-alert-conditions}

条件（`>=`、`<`）、しきい値、期間、および webhook を定義します。ここで指定する期間は、アラートがどのくらいの頻度でトリガーされるかも決定します。

<Image img={create_chart_alert} alt="チャート用アラートの作成" size="lg"/>

このビューから新しい webhook を直接追加することもできます。詳細は [Adding a webhook](#add-webhook) を参照してください。

</VerticalStepper>



## Webhook の追加 {#add-webhook}

アラートの作成時、ユーザーは既存の webhook を使用するか、新規に作成するかを選択できます。一度作成された webhook は、他のアラートでも再利用できます。

webhook は、Slack や PagerDuty などのさまざまなサービス種別に対して、また汎用的なターゲットに対して作成できます。

例として、以下のチャートに対してアラートを作成する場合を考えます。webhook を指定する前に、ユーザーは `Add New Webhook` を選択できます。

<Image img={add_new_webhook} alt="新しい webhook を追加" size="lg"/>

これにより webhook 作成ダイアログが開き、ユーザーは新しい webhook を作成できます:

<Image img={add_webhook_dialog} alt="Webhook 作成" size="md"/>

webhook 名は必須であり、説明は任意です。その他に必須となる設定項目は、サービス種別によって異なります。

ClickStack Open Source と ClickStack Cloud では、利用可能なサービス種別が異なる点に注意してください。詳細は [サービス種別ごとの連携](#integrations) を参照してください。

### サービス種別ごとの連携 {#integrations}

ClickStack のアラートは、次のサービス種別と標準で統合されています:

- **Slack**: webhook または API を通じて、通知をチャンネルに直接送信します。
- **PagerDuty**: PagerDuty API を使用して、当番チーム向けのインシデントをルーティングします。
- **Webhook**: 汎用 webhook を利用して、任意のカスタムシステムやワークフローにアラートを接続します。

:::note ClickHouse Cloud 限定の連携
Slack API および PagerDuty 連携は ClickHouse Cloud でのみサポートされます。
:::

サービス種別に応じて、ユーザーが入力する必要がある内容は異なります。具体的には次のとおりです:

**Slack (Webhook URL)**

- Webhook URL。例: `https://hooks.slack.com/services/<unique_path>`。詳細は [Slack のドキュメント](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) を参照してください。

**Slack (API)**

- Slack ボットトークン。詳細は [Slack のドキュメント](https://docs.slack.dev/authentication/tokens/#bot/) を参照してください。

**PagerDuty API**

- PagerDuty のインテグレーションキー。詳細は [PagerDuty のドキュメント](https://support.pagerduty.com/main/docs/api-access-keys) を参照してください。

**Generic**

- Webhook URL
- Webhook ヘッダー (任意)
- Webhook ボディ (任意)。ボディでは現在、テンプレート変数 `{{title}}`、`{{body}}`、`{{link}}` がサポートされています。



## アラートの管理 {#managing-alerts}

アラートは、HyperDX の左側に表示されるアラートパネルから一元的に管理できます。

<Image img={manage_alerts} alt="アラートの管理" size="lg"/>

このビューでは、ClickStack で作成され、現在実行中のすべてのアラートを確認できます。

<Image img={alerts_view} alt="アラートビュー" size="lg"/>

このビューには、アラートの評価履歴も表示されます。アラートは、（アラート作成時に設定した期間/継続時間によって定義される）一定間隔で繰り返し評価されます。各評価のたびに、HyperDX がデータをクエリして、アラート条件が満たされているかどうかを確認します。

- **赤いバー**: この評価時にしきい値条件が満たされ、アラートが発火した（通知が送信された）ことを示します
- **緑のバー**: アラートは評価されたものの、しきい値条件が満たされなかった（通知は送信されなかった）ことを示します

各評価は独立しており、アラートはその時間範囲のデータをチェックし、その時点で条件が真の場合にのみ発火します。

上記の例では、1 つ目のアラートはすべての評価で発火しており、持続的な問題が存在することを示しています。2 つ目のアラートは解消済みの問題を示しており、最初に 2 回発火した後（赤いバー）、その後の評価ではしきい値条件が満たされなくなっています（緑のバー）。

アラートをクリックすると、そのアラートが紐づいているチャートまたは検索に移動します。

### アラートの削除 {#deleting-alerts}

アラートを削除するには、関連する検索またはチャートの編集ダイアログを開き、**Remove Alert** を選択します。
次の例では、`Remove Alert` ボタンを押すとチャートからアラートが削除されます。

<Image img={remove_chart_alert} alt="チャートのアラートを削除" size="lg"/>



## 一般的なアラートシナリオ {#common-alert-scenarios}

HyperDX を使って設定できる一般的なアラートシナリオをいくつか紹介します。

**エラー:** デフォルトの `All Error Events` と `HTTP Status >= 400` の保存済み検索に対してアラートを設定し、エラーが過剰に発生したときに通知を受け取ることを推奨します。

**遅い処理:** 遅延している処理（例: `duration:>5000`）を検出する検索を作成し、遅い処理が多すぎる場合にアラートを出すように設定できます。

**ユーザーイベント:** 新規ユーザー登録や重要なユーザーアクションが実行されたときに通知されるよう、顧客対応チーム向けのアラートを設定することもできます。
