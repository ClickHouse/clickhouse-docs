---
sidebar_label: 'コンソール監査ログ'
slug: /cloud/security/audit-logging/console-audit-log
title: 'コンソール監査ログ'
description: 'このページでは、ユーザーがクラウド監査ログを参照する方法について説明します'
doc_type: 'guide'
keywords: ['audit log']
---

import Image from '@theme/IdealImage';
import activity_log_1 from '@site/static/images/cloud/security/activity_log1.png';
import activity_log_2 from '@site/static/images/cloud/security/activity_log2.png';
import activity_log_3 from '@site/static/images/cloud/security/activity_log3.png';


# コンソール監査ログ {#console-audit-log}

ユーザーのコンソール操作は監査ログに記録されます。この監査ログは、AdminまたはDeveloperの組織ロールを持つユーザーが確認でき、ロギングシステムとの統合も可能です。コンソール監査ログに含まれる具体的なイベントは、


## ユーザーインターフェースからコンソールログにアクセスする {#console-audit-log-ui}

<VerticalStepper>


## 組織を選択 {#select-org}

ClickHouse Cloudで、組織の詳細ページに移動します。

<Image
  img={activity_log_1}
  size='md'
  alt='ClickHouse Cloudアクティビティタブ'
  border
/>

<br />


## 監査の選択 {#select-audit}

左側のメニューから**監査**タブを選択すると、ClickHouse Cloud組織に加えられた変更内容を確認できます。変更を行ったユーザーと発生日時も含まれます。

**アクティビティ**ページには、組織に関して記録されたイベントのリストを含むテーブルが表示されます。デフォルトでは、このリストは新しい順(最新のイベントが上部)にソートされています。列ヘッダーをクリックすることで、テーブルの並び順を変更できます。テーブルの各項目には、以下のフィールドが含まれます:

- **アクティビティ:** イベントを説明するテキスト
- **ユーザー:** イベントを開始したユーザー
- **IPアドレス:** 該当する場合、このフィールドにはイベントを開始したユーザーのIPアドレスが表示されます
- **時刻:** イベントのタイムスタンプ

<Image
  img={activity_log_2}
  size='md'
  alt='ClickHouse Cloudアクティビティテーブル'
  border
/>

<br />


## 検索バーを使用する {#use-search-bar}

検索バーを使用して、サービス名やIPアドレスなどの条件に基づいてイベントを絞り込むことができます。また、この情報をCSV形式でエクスポートして、配布や外部ツールでの分析に利用することもできます。

</VerticalStepper>

<div class='eighty-percent'>
  <Image
    img={activity_log_3}
    size='lg'
    alt='ClickHouse Cloud アクティビティのCSVエクスポート'
    border
  />
</div>


## API経由でコンソール監査ログにアクセスする {#console-audit-log-api}

ClickHouse Cloud APIの`activity`エンドポイントを使用することで、監査イベントのエクスポートを取得できます。詳細については、[APIリファレンス](https://clickhouse.com/docs/cloud/manage/api/swagger)を参照してください。


## ログ統合 {#log-integrations}

ユーザーは、APIを使用して任意のロギングプラットフォームと統合できます。以下は、すぐに使用できるコネクタです：

- [ClickHouse Cloud Audit add-on for Splunk](/integrations/audit-splunk)
