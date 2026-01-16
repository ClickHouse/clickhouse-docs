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

ClickHouse Cloud は、ご利用のサービスまたは組織に関連する重大なイベントについて通知を送信します。通知がどのように送信され、構成されるかを理解するために、いくつか押さえておくべき概念があります:

1. **通知カテゴリ**: 請求通知、サービス関連通知などの通知グループを指します。各カテゴリには複数の通知があり、それぞれについて配信方法を設定できます。
2. **通知の重大度**: 通知の重大度は、その重要度に応じて `info`、`warning`、`critical` のいずれかになります。これは変更できません。
3. **通知チャネル**: チャネルとは、UI、メール、Slack など、通知を受け取る方法を指します。これは、ほとんどの通知で設定可能です。


## 通知の受信 \\{#receiving-notifications\\}

通知はさまざまなチャネルから受信できます。現時点では、ClickHouse Cloud はメール、ClickHouse Cloud UI、Slack を通じた通知の受信をサポートしています。左上のメニューにあるベルのアイコンをクリックすると、現在の通知を表示するフライアウトパネルが開きます。フライアウトパネルの下部にある **View All** ボタンをクリックすると、すべての通知のアクティビティログを表示するページに移動します。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud の通知フライアウト" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud の通知アクティビティログ" border/>

## 通知のカスタマイズ \\{#customizing-notifications\\}

各通知ごとに、その通知をどのように受信するかをカスタマイズできます。通知フライアウトメニュー、または通知アクティビティログの 2 番目のタブから設定画面にアクセスできます。

Cloud UI 経由で配信される通知をカスタマイズでき、これらのカスタマイズはユーザーごとに反映されます。自分宛てのメールで受信する通知もカスタマイズできますが、カスタムメールアドレス宛てや Slack チャンネル宛てに配信される通知をカスタマイズできるのは、管理者権限を持つユーザーのみです。

特定の通知の配信方法を設定するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud の通知設定画面" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud の通知配信設定" border/>

:::note
**Payment failed** のような、特定の **必須** 通知は設定を変更できません。
:::

## サポートされている通知 \\{#supported-notifications\\}

現在、請求関連の通知（支払いの失敗、利用量が所定の閾値を超過した場合など）に加えて、スケーリングイベントに関する通知（スケーリング完了、スケーリングがブロックされた場合など）を送信しています。