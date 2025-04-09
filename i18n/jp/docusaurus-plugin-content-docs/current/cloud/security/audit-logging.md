---
sidebar_label: 監査ログ
slug: /cloud/security/audit-logging
title: 監査ログ
---

import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

ClickHouse Cloud で、あなたの組織の詳細に移動します。

<img src={activity_log_1} alt="ClickHouse Cloud アクティビティタブ" class="image" style={{width: '30%'}}/>

<br/>

左メニューで **監査** タブを選択すると、あなたの ClickHouse Cloud 組織に対して行われた変更、誰が変更を行い、いつ発生したかを確認できます。

**アクティビティ** ページでは、あなたの組織に関するイベントがログされた一覧を含むテーブルが表示されます。デフォルトでは、このリストは逆時系列順（最新のイベントが上部）でソートされています。カラムヘッダーをクリックすることでテーブルの順序を変更できます。テーブルの各項目には以下のフィールドが含まれています：

- **アクティビティ:** イベントを説明するテキストスニペット
- **ユーザー:** イベントを発起したユーザー
- **IP アドレス:** 該当する場合、このフィールドにはイベントを発起したユーザーの IP アドレスが表示されます
- **時間:** イベントのタイムスタンプ

<img src={activity_log_2} alt="ClickHouse Cloud アクティビティテーブル" />

<br/>

提供された検索バーを使用して、サービス名や IP アドレスなどの基準に基づいてイベントを特定できます。また、この情報を CSV 形式でエクスポートし、外部ツールでの配布や分析に使用することも可能です。

<div class="eighty-percent">
    <img src={activity_log_3} alt="ClickHouse Cloud アクティビティ CSV エクスポート" />
</div>

## ログされたイベントのリスト {#list-of-events-logged}

組織のためにキャプチャされた異なるタイプのイベントは、**サービス**、**組織**、および **ユーザー** の 3 つのカテゴリにグループ化されています。ログされたイベントのリストには以下が含まれます：

### サービス {#service}

- サービスが作成されました
- サービスが削除されました
- サービスが停止しました
- サービスが開始されました
- サービス名が変更されました
- サービスの IP アクセスリストが変更されました
- サービスのパスワードがリセットされました

### 組織 {#organization}

- 組織が作成されました
- 組織が削除されました
- 組織名が変更されました

### ユーザー {#user}

- ユーザーの役割が変更されました
- ユーザーが組織から削除されました
- ユーザーが組織に招待されました
- ユーザーが組織に参加しました
- ユーザーの招待が削除されました
- ユーザーが組織を退会しました

## 監査イベントのための API {#api-for-audit-events}

ユーザーは ClickHouse Cloud API の `activity` エンドポイントを使用して監査イベントのエクスポートを取得できます。詳細については [こちら](/cloud/manage/api/organizations-api-reference#list-of-organization-activities) をご覧ください。
