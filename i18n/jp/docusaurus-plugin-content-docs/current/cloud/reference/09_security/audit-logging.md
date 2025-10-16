---
'sidebar_label': '監査ログ'
'slug': '/cloud/security/audit-logging'
'title': '監査ログ'
'description': 'このページでは、ClickHouse Cloudにおける監査ログについて説明します。監査ログにアクセスし、それを解釈する方法について解説し、ClickHouse
  Cloud組織に対する変更を記録します。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

In ClickHouse Cloud, あなたの組織の詳細に移動します。

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud activity tab" border />

<br/>

左側のメニューで **Audit** タブを選択すると、あなたの ClickHouse Cloud 組織に対して行われた変更、その変更を行った人、そして変更が発生した日時を見ることができます。

**Activity** ページには、あなたの組織に関するイベントのログのリストが含まれたテーブルが表示されます。デフォルトでは、このリストは逆時系列順（最新のイベントが最上部）で並べ替えられています。カラムのヘッダーをクリックすることでテーブルの順序を変更できます。テーブルの各項目には以下のフィールドが含まれています：

- **Activity:** イベントを記述するテキストスニペット
- **User:** イベントを開始したユーザー
- **IP Address:** 該当する場合、このフィールドにはイベントを開始したユーザーのIPアドレスが表示されます
- **Time:** イベントのタイムスタンプ

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud Activity Table" border />

<br/>

提供された検索バーを使用して、サービス名やIPアドレスなどの基準に基づいてイベントを絞り込むことができます。この情報は、配布または外部ツールでの分析のためにCSV形式でエクスポートすることもできます。

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud Activity CSV export" border />
</div>

## ログに記録されたイベントのリスト {#list-of-events-logged}

組織のためにキャプチャされた異なるタイプのイベントは、**Service**、**Organization**、および **User** の 3 つのカテゴリにグループ化されています。ログに記録されたイベントのリストは以下の通りです：

### Service {#service}

- サービス作成
- サービス削除
- サービス停止
- サービス開始
- サービス名変更
- サービスIPアクセスリスト変更
- サービスパスワードリセット

### Organization {#organization}

- 組織作成
- 組織削除
- 組織名変更

### User {#user}

- ユーザー役割変更
- ユーザーが組織から削除
- ユーザーが組織に招待
- ユーザーが組織に参加
- ユーザーの招待が削除
- ユーザーが組織を退会

## 監査イベントのためのAPI {#api-for-audit-events}

ユーザーは ClickHouse Cloud API `activity` エンドポイントを使用して監査イベントのエクスポートを取得できます。さらに詳しい情報は [API reference](https://clickhouse.com/docs/cloud/manage/api/swagger) で確認できます。
