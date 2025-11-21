---
slug: /use-cases/observability/clickstack/alerts
title: 'ClickStack を使った検索'
sidebar_label: 'アラート'
pagination_prev: null
pagination_next: null
description: 'ClickStack によるアラート'
doc_type: 'guide'
keywords: ['ClickStack', '観測性', 'アラート', '検索アラート', '通知', 'しきい値', 'Slack', 'メール', 'PagerDuty', 'エラー監視', 'パフォーマンス監視', 'ユーザーイベント']
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


## ClickStackにおけるアラート機能 {#alerting-in-clickstack}

ClickStackには、ログ、メトリクス、トレース全体でリアルタイムに問題を検出し対応できるアラート機能が組み込まれています。

アラートはHyperDXインターフェース内で直接作成でき、SlackやPagerDutyなどの主要な通知システムと統合できます。

アラート機能はClickStackデータ全体でシームレスに動作し、システムの健全性の追跡、パフォーマンス低下の検出、重要なビジネスイベントの監視を支援します。


## アラートの種類 {#types-of-alerts}

ClickStackは、アラートを作成するための2つの補完的な方法をサポートしています：**検索アラート**と**ダッシュボードチャートアラート**です。アラートが作成されると、検索またはチャートのいずれかに紐付けられます。

### 1. 検索アラート {#search-alerts}

検索アラートを使用すると、保存された検索の結果に基づいて通知をトリガーできます。特定のイベントやパターンが予想よりも頻繁に（または少なく）発生した場合を検出するのに役立ちます。

アラートは、定義された時間枠内で一致する結果の数が指定されたしきい値を超えるか、下回った場合にトリガーされます。

検索アラートを作成するには：

<VerticalStepper headerLevel="h4">

検索に対してアラートを作成するには、検索を保存する必要があります。ユーザーは既存の保存された検索に対してアラートを作成するか、アラート作成プロセス中に検索を保存することができます。以下の例では、検索が保存されていないことを前提としています。

#### アラート作成ダイアログを開く {#open-dialog}

まず[検索](/use-cases/observability/clickstack/search)を入力し、`Search`ページの右上隅にある`Alerts`ボタンをクリックします。

<Image img={alerts_search_view} alt='Alerts search view' size='lg' />

#### アラートを作成する {#create-the-alert}

アラート作成パネルから、次のことができます：

- アラートに関連付けられた保存された検索に名前を割り当てます。
- しきい値を設定し、指定された期間内に何回到達する必要があるかを指定します。しきい値は上限または下限としても使用できます。ここでの期間は、アラートがトリガーされる頻度も決定します。
- `grouped by`値を指定します。これにより、検索を集約の対象にすることができます（例：`ServiceName`）。これにより、同じ検索から複数のアラートをトリガーできます。
- 通知のためのWebhook送信先を選択します。このビューから直接新しいWebhookを追加できます。詳細については、[Webhookの追加](#add-webhook)を参照してください。

保存する前に、ClickStackはしきい値条件を視覚化するため、期待どおりに動作することを確認できます。

<Image img={search_alert} alt='Search alerts' size='lg' />

</VerticalStepper>

検索には複数のアラートを追加できることに注意してください。上記のプロセスを繰り返すと、ユーザーはアラート編集ダイアログの上部にタブとして現在のアラートが表示され、各アラートには番号が割り当てられます。

<Image img={multiple_search_alerts} alt='Multiple alerts' size='md' />

### 2. ダッシュボードチャートアラート {#dashboard-alerts}

ダッシュボードアラートは、アラート機能をチャートに拡張します。

保存されたダッシュボードから直接チャートベースのアラートを作成できます。これは、完全なSQL集約とClickHouse関数による高度な計算によって実現されています。

メトリックが定義されたしきい値を超えると、アラートが自動的にトリガーされ、KPI、レイテンシ、またはその他の主要なメトリックを経時的に監視できます。

:::note
ダッシュボード上の可視化に対してアラートを作成するには、ダッシュボードを保存する必要があります。
:::

ダッシュボードアラートを追加するには：

<VerticalStepper headerLevel="h4">

アラートは、チャート作成プロセス中、ダッシュボードにチャートを追加するとき、または既存のチャートに追加することができます。以下の例では、チャートがすでにダッシュボードに存在することを前提としています。

#### チャート編集ダイアログを開く {#open-chart-dialog}

チャートの設定メニューを開き、アラートボタンを選択します。これにより、チャート編集ダイアログが表示されます。

<Image img={edit_chart_alert} alt='Edit chart alert' size='lg' />

#### アラートを追加する {#add-chart-alert}

**Add Alert**を選択します。

<Image img={add_chart_alert} alt='Add alert to chart' size='lg' />

#### アラート条件を定義する {#define-alert-conditions}

条件（`>=`、`<`）、しきい値、期間、およびWebhookを定義します。ここでの期間は、アラートがトリガーされる頻度も決定します。

<Image img={create_chart_alert} alt='Create alert for chart' size='lg' />

このビューから直接新しいWebhookを追加できます。詳細については、[Webhookの追加](#add-webhook)を参照してください。

</VerticalStepper>


## Webhookの追加 {#add-webhook}

アラート作成時に、ユーザーは既存のWebhookを使用するか、新規作成することができます。作成したWebhookは、他のアラートでも再利用できます。

Webhookは、SlackやPagerDutyなどのさまざまなサービスタイプや汎用ターゲットに対して作成できます。

例えば、以下のチャートに対するアラート作成を考えます。Webhookを指定する前に、ユーザーは`Add New Webhook`を選択できます。

<Image img={add_new_webhook} alt='新しいWebhookを追加' size='lg' />

これによりWebhook作成ダイアログが開き、新しいWebhookを作成できます:

<Image img={add_webhook_dialog} alt='Webhook作成' size='md' />

Webhook名は必須ですが、説明は任意です。その他の必須設定項目は、サービスタイプによって異なります。

ClickStack Open SourceとClickStack Cloudでは、利用可能なサービスタイプが異なることに注意してください。[サービスタイプ統合](#integrations)を参照してください。

### サービスタイプ統合 {#integrations}

ClickStackアラートは、以下のサービスタイプとすぐに統合できます:

- **Slack**: WebhookまたはAPIを介してチャンネルに直接通知を送信します。
- **PagerDuty**: PagerDuty APIを介してオンコールチームにインシデントをルーティングします。
- **Webhook**: 汎用Webhookを介してアラートを任意のカスタムシステムまたはワークフローに接続します。

:::note ClickHouse Cloudのみの統合
Slack APIおよびPagerDuty統合は、ClickHouse Cloudでのみサポートされています。
:::

サービスタイプに応じて、ユーザーは異なる詳細情報を提供する必要があります。具体的には:

**Slack (Webhook URL)**

- Webhook URL。例: `https://hooks.slack.com/services/<unique_path>`。詳細については[Slackドキュメント](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)を参照してください。

**Slack (API)**

- Slackボットトークン。詳細については[Slackドキュメント](https://docs.slack.dev/authentication/tokens/#bot/)を参照してください。

**PagerDuty API**

- PagerDuty統合キー。詳細については[PagerDutyドキュメント](https://support.pagerduty.com/main/docs/api-access-keys)を参照してください。

**汎用**

- Webhook URL
- Webhookヘッダー(任意)
- Webhookボディ(任意)。ボディは現在、テンプレート変数`{{title}}`、`{{body}}`、`{{link}}`をサポートしています。


## アラートの管理 {#managing-alerts}

アラートは、HyperDXの左側にあるアラートパネルから一元管理できます。

<Image img={manage_alerts} alt='アラートの管理' size='lg' />

このビューから、ClickStackで作成され、現在実行中のすべてのアラートを確認できます。

<Image img={alerts_view} alt='アラートビュー' size='lg' />

このビューには、アラート評価履歴も表示されます。アラートは定期的な時間間隔(アラート作成時に設定された期間/継続時間で定義)で評価されます。各評価時に、HyperDXはデータをクエリして、アラート条件が満たされているかどうかを確認します:

- **赤いバー**: この評価中に閾値条件が満たされ、アラートが発火しました(通知が送信されました)
- **緑のバー**: アラートは評価されましたが、閾値条件は満たされませんでした(通知は送信されませんでした)

各評価は独立しています。アラートはその時間枠のデータを確認し、その時点で条件が真である場合にのみ発火します。

上記の例では、最初のアラートはすべての評価で発火しており、継続的な問題を示しています。2番目のアラートは解決された問題を示しています。最初に2回発火し(赤いバー)、その後の評価では閾値条件が満たされなくなりました(緑のバー)。

アラートをクリックすると、そのアラートが関連付けられているチャートまたは検索に移動します。

### アラートの削除 {#deleting-alerts}

アラートを削除するには、関連する検索またはチャートの編集ダイアログを開き、**Remove Alert**を選択します。
以下の例では、`Remove Alert`ボタンをクリックすると、チャートからアラートが削除されます。

<Image img={remove_chart_alert} alt='チャートアラートの削除' size='lg' />


## 一般的なアラートシナリオ {#common-alert-scenarios}

HyperDXで使用できる一般的なアラートシナリオをいくつか紹介します：

**エラー：** デフォルトの`All Error Events`および`HTTP Status >= 400`の保存済み検索に対してアラートを設定し、エラーが過剰に発生した際に通知を受け取ることを推奨します。

**低速な操作：** 低速な操作の検索（例：`duration:>5000`）を設定し、低速な操作が多数発生している場合にアラートを設定できます。

**ユーザーイベント：** 新規ユーザーの登録や重要なユーザーアクションが実行された際に、顧客対応チームに通知するアラートを設定することもできます。
