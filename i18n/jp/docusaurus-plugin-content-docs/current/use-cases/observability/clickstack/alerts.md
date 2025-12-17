---
slug: /use-cases/observability/clickstack/alerts
title: 'ClickStack を使った検索'
sidebar_label: 'アラート'
pagination_prev: null
pagination_next: null
description: 'ClickStack によるアラート'
doc_type: 'guide'
keywords: ['ClickStack', '可観測性', 'アラート', '検索アラート', '通知', 'しきい値', 'Slack', 'メール', 'PagerDuty', 'エラー監視', 'パフォーマンス監視', 'ユーザーイベント']
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


## ClickStack におけるアラート {#alerting-in-clickstack}

ClickStack にはアラート機能が組み込まれており、ログ・メトリクス・トレースを横断してリアルタイムに問題を検出し、対応できるようになります。

アラートは HyperDX のインターフェースから直接作成でき、Slack や PagerDuty などの一般的な通知サービスと連携します。

アラート機能は ClickStack のあらゆるデータとシームレスに連携し、システムの健全性の把握、パフォーマンス劣化の検知、重要なビジネスイベントの監視を支援します。

## アラートの種類 {#types-of-alerts}

ClickStack では、アラートを作成するための 2 つの補完的な方法として、**検索アラート** と **ダッシュボードチャートアラート** をサポートしています。アラートを作成すると、そのアラートは対応する検索またはチャートに関連付けられます。

### 1. 検索アラート {#search-alerts}

検索アラートを使用すると、保存済み検索の結果に基づいて通知をトリガーできます。これにより、特定のイベントやパターンが予想以上（または予想以下）の頻度で発生していることを検出できます。

定義された時間ウィンドウ内で一致する結果の件数が、指定したしきい値を超えるか下回ったときにアラートがトリガーされます。

検索アラートを作成するには:

<VerticalStepper headerLevel="h4">

検索に対してアラートを作成するには、その検索が保存されている必要があります。既存の保存済み検索に対してアラートを作成することも、アラート作成プロセスの中で検索を保存することもできます。以下の例では、検索がまだ保存されていないものとします。

#### アラート作成ダイアログを開く {#open-dialog}

まず、[search](/use-cases/observability/clickstack/search) を実行し、`Search` ページ右上の `Alerts` ボタンをクリックします。

<Image img={alerts_search_view} alt="アラート検索ビュー" size="lg"/>

#### アラートを作成する {#create-the-alert}

アラート作成パネルから、次の操作を行えます:

- アラートに関連付ける保存済み検索に名前を付けます。
- しきい値を設定し、指定した期間内に何回しきい値に達したらアラートを発生させるかを指定します。しきい値は上限または下限としても使用できます。ここで設定する期間は、アラートがどの程度の頻度でトリガーされるかも決定します。
- `grouped by` の値を指定します。これにより、例えば `ServiceName` のようなキーで検索結果を集約し、同じ検索から複数のアラートをトリガーできるようになります。
- 通知の送信先となる Webhook を選択します。このビューから新しい Webhook を直接追加することもできます。詳細は [Webhook の追加](#add-webhook) を参照してください。

保存する前に、ClickStack はしきい値条件を可視化し、期待どおりに動作するかを確認できるようにします。

<Image img={search_alert} alt="検索アラート" size="lg"/>

</VerticalStepper>

1 つの検索に対して複数のアラートを追加できる点に注意してください。上記の手順を繰り返すと、現在のアラートがアラート編集ダイアログ上部のタブとして表示され、それぞれのアラートには番号が割り当てられます。

<Image img={multiple_search_alerts} alt="複数のアラート" size="md"/>

### 2. ダッシュボード チャートアラート {#dashboard-alerts}

ダッシュボードアラートを使用すると、アラート機能をチャートに拡張できます。

保存済みダッシュボードから、チャートベースのアラートを直接作成できます。高度な計算には、フルな SQL 集計機能および ClickHouse 関数を利用できます。

メトリクスが定義したしきい値を超える（もしくは下回る）と、自動的にアラートがトリガーされ、KPI、レイテンシー、その他の主要なメトリクスを継続的に監視できます。

:::note
ダッシュボード上の可視化に対してアラートを作成するには、そのダッシュボードが保存されている必要があります。
:::

ダッシュボードアラートを追加するには:

<VerticalStepper headerLevel="h4">

アラートは、チャートの作成時、チャートをダッシュボードに追加する際、または既存チャートに対して作成できます。以下の例では、チャートはすでにダッシュボード上に存在しているものとします。

#### チャート編集ダイアログを開く {#open-chart-dialog}

チャートの設定メニューを開き、アラートボタンを選択します。チャート編集ダイアログが表示されます。

<Image img={edit_chart_alert} alt="チャートアラートを編集" size="lg"/>

#### アラートを追加する {#add-chart-alert}

**Add Alert** を選択します。

<Image img={add_chart_alert} alt="チャートにアラートを追加" size="lg"/>

#### アラート条件を定義する {#define-alert-conditions}

条件（`>=`、`<`）、しきい値、期間、webhook を定義します。ここで設定した期間は、アラートがどの頻度でトリガーされるかも決定します。

<Image img={create_chart_alert} alt="チャート用のアラートを作成" size="lg"/>

この画面から新しい webhook を直接追加できます。詳細は [Adding a webhook](#add-webhook) を参照してください。

</VerticalStepper>

## Webhook の追加 {#add-webhook}

アラート作成時には、既存の webhook を使用することも、新しく作成することもできます。いったん作成された webhook は、他のアラートでも再利用できます。

webhook は、Slack や PagerDuty を含むさまざまなサービス種別や、汎用的な送信先向けに作成できます。

例えば、以下のチャートに対するアラートを作成する場合を考えます。webhook を指定する前に、ユーザーは `Add New Webhook` を選択できます。

<Image img={add_new_webhook} alt="新しい webhook を追加" size="lg"/>

これにより webhook 作成ダイアログが開き、ここで新しい webhook を作成できます。

<Image img={add_webhook_dialog} alt="Webhook の作成" size="md"/>

webhook 名は必須であり、説明は任意です。その他に必須となる設定項目は、サービス種別によって異なります。

ClickStack Open Source と ClickStack Cloud では、利用可能なサービス種別が異なる点に注意してください。詳しくは [Service type integrations](#integrations) を参照してください。

### サービス種別ごとの連携 {#integrations}

ClickStack のアラートは、標準で次のサービス種別と連携できます:

- **Slack**: Webhook または API を使用して、チャンネルに直接通知を送信します。
- **PagerDuty**: PagerDuty API を介して、オンコールチーム向けにインシデントをルーティングします。
- **Webhook**: 汎用的な Webhook を介して、任意のカスタムシステムやワークフローにアラートを連携します。

:::note ClickHouse Cloud only integrations
Slack API と PagerDuty の連携は ClickHouse Cloud でのみサポートされています。
:::

サービス種別に応じて、指定する必要のある情報は異なります。具体的には次のとおりです。

**Slack (Webhook URL)**

- Webhook URL。たとえば、`https://hooks.slack.com/services/<unique_path>`。詳細は [Slack のドキュメント](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) を参照してください。

**Slack (API)**

- Slack ボットトークン。詳細は [Slack のドキュメント](https://docs.slack.dev/authentication/tokens/#bot/) を参照してください。

**PagerDuty API**

- PagerDuty インテグレーションキー。詳細は [PagerDuty のドキュメント](https://support.pagerduty.com/main/docs/api-access-keys) を参照してください。

**汎用**

- Webhook URL
- Webhook ヘッダー (任意)
- Webhook ボディ (任意)。現在、ボディではテンプレート変数 `{{title}}`、`{{body}}`、`{{link}}` が利用できます。

## アラートの管理 {#managing-alerts}

アラートは、HyperDX の左側にあるアラートパネルから一元的に管理できます。

<Image img={manage_alerts} alt="アラートの管理" size="lg"/>

このビューでは、ClickStack 内で作成され、現在有効になっているすべてのアラートを確認できます。

<Image img={alerts_view} alt="アラートビュー" size="lg"/>

このビューには、アラートの評価履歴も表示されます。アラートは、アラート作成時に設定した期間/継続時間に基づく一定間隔で評価されます。各評価時に、HyperDX がデータをクエリしてアラート条件が満たされているかを確認します。

- **赤いバー**: この評価の間にしきい値条件が満たされ、アラートが発火した（通知が送信された）ことを示します
- **緑のバー**: アラートは評価されたが、しきい値条件は満たされなかった（通知は送信されなかった）ことを示します

各評価は独立しており、アラートはその時間ウィンドウのデータをチェックし、その時点で条件が真の場合にのみ発火します。

上記の例では、最初のアラートはすべての評価で発火しており、継続的な問題が発生していることを示しています。2つ目のアラートは解消済みの問題を示しており、当初は 2 回発火したものの（赤いバー）、その後の評価ではしきい値条件が満たされなくなっています（緑のバー）。

アラートをクリックすると、そのアラートが紐づいているチャートまたは検索画面に移動します。

### アラートの削除 {#deleting-alerts}

アラートを削除するには、該当する検索またはチャートの編集ダイアログを開き、**Remove Alert** を選択します。
次の例では、`Remove Alert` ボタンをクリックすると、このチャートからアラートが削除されます。

<Image img={remove_chart_alert} alt="チャートのアラートを削除" size="lg"/>

## 一般的なアラートシナリオ {#common-alert-scenarios}

HyperDX で利用できる一般的なアラートシナリオをいくつか紹介します。

**エラー:** 標準の `All Error Events` および `HTTP Status >= 400` の保存済み検索に対してアラートを設定し、エラーが過剰に発生した場合に通知されるようにすることを推奨します。

**低速な処理:** 低速な処理（例: `duration:>5000`）を検出する検索を設定し、低速な処理が多く発生した場合にアラートが出るように構成できます。

**ユーザーイベント:** カスタマーサポートなどの顧客対応チーム向けに、新規ユーザーのサインアップや重要なユーザーアクションが実行されたときに通知されるアラートを設定することもできます。