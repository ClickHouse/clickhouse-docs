---
title: 通知
slug: /cloud/notifications
description: ClickHouse Cloud サービスの通知
keywords: [cloud, notifications]
---

import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud は、サービスまたは組織に関連する重要なイベントについて通知を送信します。通知がどのように送信され、構成されるかを理解するために覚えておくべきいくつかの概念があります。

1. **通知カテゴリ**: 請求通知やサービス関連通知など、通知のグループを指します。各カテゴリ内には、配信モードを構成できる複数の通知があります。
2. **通知の重大度**: 通知の重大度は、通知の重要性に応じて `info`、`warning`、または `critical` となります。これは構成できません。
3. **通知チャネル**: チャネルは、通知を受信するモードを指し、UI、メール、Slack などがあります。ほとんどの通知に対してこれは構成可能です。

## 通知の受信 {#receiving-notifications}

通知はさまざまなチャネルを介して受信できます。現在、ClickHouse Cloud はメールと ClickHouse Cloud UI を通じて通知を受信することをサポートしています。左上のメニューのベルアイコンをクリックすると、現在の通知を表示するフライアウトが開きます。フライアウトの下部にある **すべて表示** ボタンをクリックすると、すべての通知のアクティビティログを示すページに移動します。

<br />

<img src={notifications_1}
    alt="ClickHouse Cloud 通知フライアウト"
    class="image"
    style={{width: '600px'}}
    />

<br />

<img src={notifications_2}
    alt="ClickHouse Cloud 通知アクティビティログ"
    class="image"
    style={{width: '600px'}}
    />

## 通知のカスタマイズ {#customizing-notifications}

各通知に対して、通知を受信する方法をカスタマイズできます。通知のフライアウトまたは通知アクティビティログの2番目のタブから設定画面にアクセスできます。

特定の通知の配信を構成するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。

<br />

<img src={notifications_3}
    alt="ClickHouse Cloud 通知設定画面"
    class="image"
    style={{width: '600px'}}
    />

<br />

<img src={notifications_4}
    alt="ClickHouse Cloud 通知配信設定"
    class="image"
    style={{width: '600px'}}
    />

<br />

:::note
**支払い失敗**などの特定の**必須**通知は、構成できません。
:::

## サポートされている通知 {#supported-notifications}

現在、請求に関連する通知（支払い失敗、使用量が閾値を超えたなど）やスケーリングイベントに関連する通知（スケーリング完了、スケーリングブロックなど）を送信しています。将来的には、バックアップ、ClickPipes、およびその他の関連カテゴリの通知を追加する予定です。
