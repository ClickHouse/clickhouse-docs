---
title: '通知'
slug: /cloud/notifications
description: 'ClickHouse Cloud サービスの通知'
keywords: ['cloud', 'notifications']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud は、お使いのサービスまたは組織に関連する重要なイベントについて通知を送信します。通知がどのように送信され、設定されるかを理解するために、いくつかの概念を押さえておく必要があります。

1. **Notification category**: 請求関連通知、サービス関連通知などの通知のグループを指します。各カテゴリには複数の通知が含まれ、それぞれについて配信方法を設定できます。
2. **Notification severity**: 通知の重要度は、その重要性に応じて `info`、`warning`、`critical` のいずれかになります。これは変更できません。
3. **Notification channel**: Channel は、UI、メール、Slack など、通知を受け取る手段を指します。これは、ほとんどの通知で設定可能です。


## 通知の受信 {#receiving-notifications}

通知は様々なチャネルを通じて受信できます。現在、ClickHouse Cloudはメール、ClickHouse Cloud UI、Slackを通じた通知の受信をサポートしています。左上のメニューにあるベルアイコンをクリックすると、現在の通知を表示するフライアウトが開きます。フライアウトの下部にある**View All**ボタンをクリックすると、すべての通知のアクティビティログを表示するページに移動します。

<Image
  img={notifications_1}
  size='md'
  alt='ClickHouse Cloud通知フライアウト'
  border
/>

<Image
  img={notifications_2}
  size='md'
  alt='ClickHouse Cloud通知アクティビティログ'
  border
/>


## 通知のカスタマイズ {#customizing-notifications}

各通知について、受信方法をカスタマイズできます。設定画面には、通知フライアウトまたは通知アクティビティログの2番目のタブからアクセスできます。

Cloudユーザーは、Cloud UI経由で配信される通知をカスタマイズでき、これらのカスタマイズは個々のユーザーごとに反映されます。Cloudユーザーは自分のメールアドレスに配信される通知もカスタマイズできますが、カスタムメールアドレスやSlackチャンネルに配信される通知をカスタマイズできるのは、管理者権限を持つユーザーのみです。

特定の通知の配信を設定するには、鉛筆アイコンをクリックして通知配信チャンネルを変更します。

<Image
  img={notifications_3}
  size='md'
  alt='ClickHouse Cloud通知設定画面'
  border
/>

<Image
  img={notifications_4}
  size='md'
  alt='ClickHouse Cloud通知配信設定'
  border
/>

:::note
**Payment failed**などの特定の**必須**通知は設定できません。
:::


## サポートされる通知 {#supported-notifications}

現在、課金関連の通知（支払い失敗、使用量が一定の閾値を超過した場合など）およびスケーリングイベント関連の通知（スケーリング完了、スケーリングのブロックなど）を送信しています。
