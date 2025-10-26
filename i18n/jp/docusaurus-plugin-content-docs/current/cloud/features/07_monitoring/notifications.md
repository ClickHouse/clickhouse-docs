---
'title': '通知'
'slug': '/cloud/notifications'
'description': 'あなたの ClickHouse Cloud サービスの通知'
'keywords':
- 'cloud'
- 'notifications'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloudは、サービスまたは組織に関連する重要なイベントに関する通知を送信します。通知がどのように送信され、設定されるかを理解するために、いくつかの概念を念頭に置く必要があります：

1. **通知カテゴリ**: 請求通知、サービス関連の通知など、通知のグループを指します。各カテゴリ内には、配信モードが設定できる複数の通知があります。
2. **通知の重要度**: 通知の重要度は、通知がどれほど重要であるかに応じて、`info`、`warning`、または`critical`となります。これは設定可能ではありません。
3. **通知チャネル**: チャネルは、UI、メール、Slackなど、通知が受信されるモードを指します。ほとんどの通知に対して設定可能です。

## 通知の受信 {#receiving-notifications}

通知はさまざまなチャネルを介して受信できます。現在、ClickHouse Cloudはメール、ClickHouse Cloud UI、Slackを通じて通知の受信をサポートしています。左上のメニューにあるベルアイコンをクリックすると、現在の通知が表示されるフライアウトが開きます。フライアウトの一番下にある**すべて表示**ボタンをクリックすると、すべての通知のアクティビティログを表示するページに移動します。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud notifications flyout" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud notifications activity log" border/>

## 通知のカスタマイズ {#customizing-notifications}

各通知について、受信方法をカスタマイズできます。通知のフライアウトまたは通知のアクティビティログの2番目のタブから設定画面にアクセスできます。

CloudユーザーはCloud UIを通じて配信される通知をカスタマイズでき、これらのカスタマイズは各ユーザー個別に反映されます。Cloudユーザーは自身のメールに配信される通知もカスタマイズできますが、カスタムメールに配信される通知やSlackチャネルに配信される通知をカスタマイズできるのは、管理者権限を持つユーザーのみです。

特定の通知の配信を設定するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
**Payment failed**のような特定の**必須**通知は設定できません。
:::

## サポートされている通知 {#supported-notifications}

現在、請求に関連する通知（支払い失敗、使用量がしきい値を超えたなど）や、スケーリングイベントに関連する通知（スケーリング完了、スケーリングブロックなど）を送信しています。
