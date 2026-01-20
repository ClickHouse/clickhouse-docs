---
sidebar_label: 'コンソール監査ログ'
slug: /cloud/security/audit-logging/console-audit-log
title: 'コンソール監査ログ'
description: 'このページでは、クラウド監査ログの確認方法について説明します'
doc_type: 'guide'
keywords: ['監査ログ']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# コンソール監査ログ \{#console-audit-log\}

コンソール上での操作は監査ログに記録されます。Admin または Developer の組織ロールを持つユーザーは、監査ログを確認したり、ログ収集システムと連携したりできます。

## ユーザーインターフェースからコンソール監査ログにアクセスする \{#console-audit-log-ui\}

<VerticalStepper>

## 組織を選択する \{#select-org\}

ClickHouse Cloud で、組織の詳細ページを表示します。 

<Image img={activity_log_1} size="md" alt="ClickHouse Cloud アクティビティタブ" border />

<br/>

## 監査を選択する \{#select-audit\}

左側のメニューで **Audit** タブを選択すると、ClickHouse Cloud の組織に対してどのような変更が行われたか（誰がいつ変更を行ったかを含む）を確認できます。

**Activity** ページには、組織に関して記録されたイベントの一覧を含むテーブルが表示されます。デフォルトでは、この一覧は時系列の逆順（最新のイベントが一番上）でソートされています。テーブルの列ヘッダーをクリックすることで、並び順を変更できます。テーブルの各項目には、次のフィールドが含まれます。

- **Activity:** イベントの内容を説明するテキスト
- **User:** イベントを発生させたユーザー
- **IP Address:** 該当する場合、イベントを発生させたユーザーの IP アドレス
- **Time:** イベントのタイムスタンプ

<Image img={activity_log_2} size="md" alt="ClickHouse Cloud アクティビティテーブル" border />

<br/>

## 検索バーを使用する \{#use-search-bar\}

検索バーを使用して、サービス名や IP アドレスなどの条件に基づいてイベントを絞り込むことができます。また、この情報を CSV 形式でエクスポートして、外部ツールでの配布や分析に利用することもできます。

</VerticalStepper>

<div class="eighty-percent">
    <Image img={activity_log_3} size="lg" alt="ClickHouse Cloud アクティビティ CSV エクスポート" border />
</div>

## API 経由でコンソール監査ログにアクセスする \{#console-audit-log-api\}

ClickHouse Cloud API の `activity` エンドポイントを使用して、監査イベントのエクスポートを取得できます。詳細は [API リファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger) を参照してください。

## ログ連携 \{#log-integrations\}

API を使用して、任意のログプラットフォームと連携できます。以下のプラットフォーム向けには、標準で利用可能なコネクタが用意されています。
- [ClickHouse Cloud Audit add-on for Splunk](/integrations/audit-splunk)