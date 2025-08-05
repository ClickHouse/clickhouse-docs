---
title: 'Notifications'
slug: '/cloud/notifications'
description: 'ClickHouse Cloud サービス用の通知'
keywords:
- 'cloud'
- 'notifications'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud は、サービスや組織に関連する重要なイベントについての通知を送信します。通知がどのように送信され、構成されるかを理解するために、いくつかの概念を把握しておく必要があります。

1. **通知のカテゴリ**: 課金通知やサービス関連の通知など、通知のグループを指します。各カテゴリ内には、配信モードを設定できる複数の通知があります。
2. **通知の重要度**: 通知の重要度は、通知がどれほど重要であるかに応じて `info`、`warning`、または `critical` のいずれかとなります。これは構成できません。
3. **通知のチャネル**: チャネルは、通知が受信される方法を指します。たとえば、UI、メール、Slack などです。ほとんどの通知はこれを構成可能です。

## 通知の受信 {#receiving-notifications}

通知はさまざまなチャネルを介して受信できます。現時点では、ClickHouse Cloud はメール、ClickHouse Cloud UI、Slack を通じて通知を受信することをサポートしています。左上のメニューのベルアイコンをクリックすると、現在の通知が表示され、フライアウトが開きます。フライアウトの下部にある **すべて表示** ボタンをクリックすると、すべての通知のアクティビティログを表示するページに移動します。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud notifications flyout" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud notifications activity log" border/>

## 通知のカスタマイズ {#customizing-notifications}

各通知について、通知の受け取り方法をカスタマイズできます。通知のフライアウトまたは通知アクティビティログの2番目のタブから設定画面にアクセスできます。

Cloud ユーザーは、Cloud UI を介して配信される通知をカスタマイズでき、これらのカスタマイズは各ユーザーに反映されます。Cloud ユーザーは、自分のメールに配信される通知もカスタマイズできますが、カスタムメールに配信される通知や Slack チャンネルに送信される通知をカスタマイズできるのは、管理者権限を持つユーザーのみです。

特定の通知の配信を構成するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
**支払い失敗**などの特定の **必須** 通知は構成不可です。
:::

## サポートされている通知 {#supported-notifications}

現在、課金に関連する通知（支払い失敗、使用量が閾値を超えた等）やスケーリングイベントに関連する通知（スケーリング完了、スケーリングブロック等）を送信しています。
