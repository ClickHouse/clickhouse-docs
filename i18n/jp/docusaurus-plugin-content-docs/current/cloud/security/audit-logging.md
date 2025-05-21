---
sidebar_label: '監査ログ'
slug: /cloud/security/audit-logging
title: '監査ログ'
description: 'このページでは、ClickHouse Cloud における監査ログについて説明します。監査ログのアクセス方法と解釈方法を説明し、ClickHouse Cloud 組織に対して行われた変更を記録します。'
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';

ClickHouse Cloud で、組織の詳細に移動します。 

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud アクティビティタブ" border />

<br/>

左のメニューから **監査** タブを選択すると、ClickHouse Cloud 組織に対して行われた変更内容（誰が変更を行ったか、その時期など）が表示されます。

**アクティビティ** ページには、組織に関して記録されたイベントのリストを含むテーブルが表示されます。デフォルトでは、このリストは逆時系列順（最も最近のイベントが最上部）にソートされています。カラムヘッダーをクリックすることでテーブルの順序を変更できます。テーブルの各項目には以下のフィールドが含まれています：

- **アクティビティ:** イベントを説明するテキストスニペット
- **ユーザー:** イベントを始めたユーザー
- **IP アドレス:** 該当する場合、このフィールドにはイベントを始めたユーザーの IP アドレスが記載されます
- **時刻:** イベントのタイムスタンプ

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud アクティビティテーブル" border />

<br/>

提供された検索バーを使用して、サービス名や IP アドレスなどのいくつかの基準に基づいてイベントを絞り込むことができます。また、この情報を CSV 形式でエクスポートし、外部ツールでの配布や分析に使用することもできます。

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud アクティビティ CSV エクスポート" border />
</div>

## 記録されたイベントの一覧 {#list-of-events-logged}

組織に対して記録されたさまざまなタイプのイベントは、**サービス**、**組織**、**ユーザー**の 3 つのカテゴリーにグループ化されています。記録されたイベントの一覧には以下が含まれます：

### サービス {#service}

- サービスの作成
- サービスの削除
- サービスの停止
- サービスの開始
- サービス名の変更
- サービス IP アクセスリストの変更
- サービスパスワードのリセット

### 組織 {#organization}

- 組織の作成
- 組織の削除
- 組織名の変更

### ユーザー {#user}

- ユーザー役割の変更
- 組織からのユーザーの削除
- 組織へのユーザーの招待
- ユーザーが組織に参加
- ユーザーの招待が削除
- ユーザーが組織を退会

## 監査イベントのための API {#api-for-audit-events}

ユーザーは ClickHouse Cloud API の `activity` エンドポイントを使用して、監査イベントのエクスポートを取得できます。詳細については、[API リファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger) を参照してください。
