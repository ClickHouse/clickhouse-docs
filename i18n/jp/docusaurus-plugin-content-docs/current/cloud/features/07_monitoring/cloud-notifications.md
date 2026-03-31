---
title: '通知'
slug: /cloud/notifications
description: 'ClickHouse Cloud サービスの通知'
keywords: ['cloud', '通知', 'アラート', 'サービス通知', '請求通知']
sidebar_label: '通知'
sidebar_position: 3
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

# 通知 \{#notifications\}

ClickHouse Cloud は、サービスまたは組織に関連する重大なイベントについて通知を送信します。通知がどのように送信され、設定されるかを理解するうえで、押さえておくべき概念がいくつかあります。

1. **通知カテゴリ**: 請求通知、サービス関連の通知などの通知グループを指します。各カテゴリには、配信モードを設定できる複数の通知があります。
2. **通知の重大度**: 通知の重大度は、その重要度に応じて `info`、`warning`、または `critical` になります。これは設定できません。
3. **通知チャネル**: チャネルとは、UI、メール、Slack など、通知を受信する手段を指します。これはほとんどの通知で設定可能です。

## 通知の受信 \{#receiving-notifications\}

通知はさまざまなチャネルで受信できます。ClickHouse Cloud は、メール、ClickHouse Cloud UI、Slack での通知受信をサポートしています。現在の通知を確認するには、左上のメニューにあるベルアイコンをクリックします。クリックすると、フライアウトパネルが開きます。フライアウトパネルの下部にある **View All** ボタンをクリックすると、すべての通知のアクティビティログが表示されるページに移動します。

<Image img={notifications_1} size="md" alt="ClickHouse Cloud の通知フライアウトパネル" border />

<Image img={notifications_2} size="md" alt="ClickHouse Cloud の通知アクティビティログ" border />

## 通知のカスタマイズ \{#customizing-notifications\}

各通知では、通知の受信方法をカスタマイズできます。設定画面には、通知のフライアウトパネルまたは通知アクティビティログの2番目のタブからアクセスできます。

Cloud UI 経由で配信される通知はカスタマイズでき、その設定はユーザーごとに反映されます。自分のメールアドレス宛てに配信される通知をカスタマイズすることもできますが、カスタムメールアドレス宛ての通知や Slack チャンネル宛ての通知をカスタマイズできるのは、管理者権限を持つユーザーのみです。

特定の通知の配信方法を設定するには、鉛筆アイコンをクリックして通知の配信チャネルを変更します。

<Image img={notifications_3} size="md" alt="ClickHouse Cloud 通知設定画面" border />

<Image img={notifications_4} size="md" alt="ClickHouse Cloud 通知配信設定" border />

:::note
**Payment failed** などの一部の**必須**通知は設定できません。
:::

## サービス通知 \{#service-notifications\}

ClickHouse は、特定のアラート条件がトリガーされるとサービス通知を送信します。ClickHouse Cloud のサービス通知の詳細は、以下を参照してください。

| 通知タイミング             | 具体的なアラート条件                                                             | デフォルトの通知チャネル        | 解決手順                                                                                                        |
| ------------------- | ---------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| クラスタをスケールアップできない    | 推奨クラスタサイズが vertical scaling の最大上限を超えた場合。推奨クラスタサイズが変更されると、新しい通知が生成されます。 |                     | レプリカごとの autoscaling の最大サイズ上限を引き上げることを検討してください。[scaling](/manage/scaling) を参照してください。                         |
| パーツ過多エラー            | &#39;too many parts&#39; エラーが検出された場合。通知は暦日ごとに 1 回のみトリガーされます。           | 管理者ユーザーにメールが送信されます。 | insert の batching を検討してください。[Exception: Too many parts](/knowledgebase/exception-too-many-parts) を参照してください。 |
| 失敗した mutations      | mutation が 15 分間 failed 状態にある場合。通知は暦日ごとに 1 回のみトリガーされます。                | 管理者ユーザーにメールが送信されます。 | 失敗した mutation を kill してください。[Avoid mutations](/best-practices/avoid-mutations) を参照してください。                   |
| 高いクエリ同時実行数          | クエリの同時実行数がレプリカあたり 1,000 を超えた場合。通知は暦日ごとに 1 回のみトリガーされます。                 | 管理者ユーザーにメールが送信されます。 | レプリカの追加を検討してください。                                                                                           |
| クラスタのスケーリング完了       | クラスタのサイズが変更された場合。                                                      |                     | 該当なし                                                                                                        |
| クラスタをスケールダウンできない    | 推奨クラスタサイズが vertical scaling の最大上限を超えた場合。推奨クラスタサイズが変更されると、新しい通知が生成されます。 |                     | レプリカごとの autoscaling の最小サイズ上限を引き下げることを検討してください。[scaling](/manage/scaling) を参照してください。                         |
| ClickHouse バージョンの変更 | ClickHouse service のバージョン更新が開始されるとき、および完了したとき。                         |                     | 該当なし                                                                                                        |

## ClickPipes の通知 \{#clickpipes-notifications\}

ClickPipe で障害や問題が発生している場合、ClickHouse は ClickPipes の通知を送信します。

## 請求通知 \{#billing-notifications\}

ClickHouse は、支払いに関する問題が発生した場合や、前払いコミットメントの消費量が一定のしきい値に達した場合に、請求通知を送信します。

## サポート対象の通知 \{#supported-notifications\}

現在、請求関連の通知 (支払いの失敗、使用量が一定のしきい値を超えた場合など) に加え、スケーリングイベント関連の通知 (スケーリングの完了、スケーリングがブロックされた場合など) を送信しています。

## 関連ページ \{#related\}

* [Cloud コンソールのモニタリング](/cloud/monitoring/cloud-console) — サービスの健全性、リソース、クエリ パフォーマンス向けの組み込みダッシュボード
* [モニタリングの概要](/cloud/monitoring) — ClickHouse Cloud のすべてのモニタリング方法を比較

:::note
クレジットしきい値通知は現在、コミットメント支出契約のある組織でのみ利用できます。従量課金制 (PAYG) の組織には、これらの通知は送信されません。
:::