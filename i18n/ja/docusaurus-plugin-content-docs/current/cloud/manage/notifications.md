---
title: お知らせ
slug: /cloud/notifications
description: ClickHouse Cloudサービスのお知らせ
keywords: [cloud, notifications]
---

ClickHouse Cloudは、サービスまたは組織に関連する重要なイベントについての通知を送信します。通知がどのように送信され、設定されるかを理解するために、いくつかの概念を把握しておくことが重要です。

1. **通知カテゴリ**: 請求通知やサービス関連通知など、通知のグループを指します。各カテゴリ内には、配信モードを設定できる複数の通知があります。
2. **通知の重要度**: 通知の重要度は、通知の重要性に応じて `info`、`warning`、または `critical` になります。これは設定できません。
3. **通知チャネル**: チャネルは、UI、メール、Slackなど、通知を受け取るモードを指します。ほとんどの通知については設定可能です。

## 通知の受信 {#receiving-notifications}

通知はさまざまなチャネルを通じて受信できます。現時点で、ClickHouse CloudはメールとClickHouse Cloud UIを通じて通知を受け取ることをサポートしています。左上メニューのベルアイコンをクリックすると、現在の通知を表示するフライアウトが開きます。フライアウトの一番下にある **すべて表示** ボタンをクリックすると、すべての通知のアクティビティログを表示するページに移動します。

<br />

<img src={require('./images/notifications-1.png').default}    
  class="image"
  alt="バックアップ設定の構成"
  style={{width: '600px'}} />

<br />

<img src={require('./images/notifications-2.png').default}    
  class="image"
  alt="バックアップ設定の構成"
  style={{width: '600px'}} />

## 通知のカスタマイズ {#customizing-notifications}

各通知について、通知を受信する方法をカスタマイズできます。通知フライアウトまたは通知アクティビティログの2番目のタブから設定画面にアクセスできます。

特定の通知の配信を設定するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。  

<br />

<img src={require('./images/notifications-3.png').default}    
  class="image"
  alt="バックアップ設定の構成"
  style={{width: '600px'}} />

<br />

<img src={require('./images/notifications-4.png').default}    
  class="image"
  alt="バックアップ設定の構成"
  style={{width: '600px'}} />

<br />

:::note
**支払い失敗**など、特定の**必須**通知は設定できません。
:::

## サポートされている通知 {#supported-notifications}

現在、請求に関連する通知（支払い失敗、使用量が所定の閾値を超えた場合など）やスケーリングイベントに関連する通知（スケーリング完了、スケーリングがブロックされた場合など）を送信しています。将来的には、バックアップ、ClickPipes、その他の関連カテゴリに関する通知を追加する予定です。
