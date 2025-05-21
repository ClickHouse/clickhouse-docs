---
title: '通知'
slug: /cloud/notifications
description: 'あなたの ClickHouse Cloud サービスの通知'
keywords: ['cloud', 'notifications']
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud は、サービスまたは組織に関連する重要なイベントについての通知を送信します。通知がどのように送信され、設定されるかを理解するために、いくつかの概念を念頭に置く必要があります。

1. **通知カテゴリー**: 請求通知、サービス関連通知などの通知のグループを指します。各カテゴリー内には、配送モードを設定できる複数の通知があります。
2. **通知の重大度**: 通知の重要度に応じて、`info`、`warning`、または `critical` のいずれかになります。これは設定可能ではありません。
3. **通知チャネル**: チャネルは、UI、メール、Slack など、通知を受信するモードを指します。これはほとんどの通知について設定可能です。

## 通知の受信 {#receiving-notifications}

通知はさまざまなチャネルを介して受信できます。現在、ClickHouse Cloud では、メール、ClickHouse Cloud UI、および Slack を通じて通知を受信することをサポートしています。左上のメニューにあるベルアイコンをクリックすると、現在の通知を表示するフライアウトが開きます。フライアウトの下部にある**すべて表示**ボタンをクリックすると、すべての通知のアクティビティログを表示するページに移動します。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud の通知フライアウト" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud の通知アクティビティログ" border/>

## 通知のカスタマイズ {#customizing-notifications}

各通知について、どのように通知を受信するかをカスタマイズできます。通知フライアウトや通知アクティビティログの2番目のタブから設定画面にアクセスできます。

Cloud ユーザーは、Cloud UI を介して配信される通知をカスタマイズでき、これらのカスタマイズは各ユーザーに反映されます。Cloud ユーザーは、自分のメールに配信される通知もカスタマイズできますが、カスタムメールに配信される通知や Slack チャネルに配信される通知をカスタマイズできるのは、管理者権限を持つユーザーのみです。

特定の通知の配信を設定するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud の通知設定画面" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud の通知配信設定" border/>

:::note
**必須** の通知、例えば **支払い失敗** などは設定できません。
:::

## サポートされている通知 {#supported-notifications}

現在、請求に関連する通知（支払い失敗、使用量が特定の閾値を超えた場合など）や、スケーリングイベントに関連する通知（スケーリングが完了、スケーリングがブロックされた場合など）を送信しています。
