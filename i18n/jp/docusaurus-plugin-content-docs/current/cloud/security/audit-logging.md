---
sidebar_label: '監査ログ'
slug: '/cloud/security/audit-logging'
title: 'Audit Logging'
description: 'このページはClickHouse Cloudでの監査ログについて説明しています。ClickHouse Cloudの組織に対する変更を記録する監査ログへのアクセス方法と解釈方法について説明しています。'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

In ClickHouse Cloud, あなたの組織の詳細に移動します。

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>

左メニューから **Audit** タブを選択すると、あなたの ClickHouse Cloud 組織で行われた変更を確認できます。変更を行ったのは誰で、いつ発生したのかも含まれています。

**Activity** ページには、あなたの組織に関するイベントが記録されたテーブルが表示されます。デフォルトでは、このリストは逆年代順（最新のイベントが上部）にソートされています。カラムヘッダーをクリックしてテーブルの順序を変更できます。テーブルの各アイテムには以下のフィールドが含まれます：

- **Activity:** イベントを説明するテキストスニペット
- **User:** イベントを開始したユーザー
- **IP Address:** 該当する場合、このフィールドにはイベントを開始したユーザーのIPアドレスが表示されます
- **Time:** イベントのタイムスタンプ

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>

提供された検索バーを使用すると、サービス名やIPアドレスなどのいくつかの基準に基づいてイベントを特定できます。この情報は、配布や外部ツールでの分析のためにCSV形式でエクスポートすることも可能です。

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud Activity CSV export" border />
</div>

## ログに記録されたイベントのリスト {#list-of-events-logged}

組織のためにキャプチャされたさまざまなタイプのイベントは、**Service**、**Organization**、**User** の3つのカテゴリにグループ化されています。ログに記録されたイベントのリストには以下が含まれます：

### Service {#service}

- サービスが作成されました
- サービスが削除されました
- サービスが停止しました
- サービスが開始されました
- サービス名が変更されました
- サービスのIPアクセスリストが変更されました
- サービスのパスワードがリセットされました

### Organization {#organization}

- 組織が作成されました
- 組織が削除されました
- 組織名が変更されました

### User {#user}

- ユーザーの役割が変更されました
- ユーザーが組織から削除されました
- ユーザーが組織に招待されました
- ユーザーが組織に参加しました
- ユーザーの招待が削除されました
- ユーザーが組織を離れました

## 監査イベントのためのAPI {#api-for-audit-events}

ユーザーは ClickHouse Cloud API `activity` エンドポイントを使用して、監査イベントのエクスポートを取得できます。詳細は [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger) を参照してください。
