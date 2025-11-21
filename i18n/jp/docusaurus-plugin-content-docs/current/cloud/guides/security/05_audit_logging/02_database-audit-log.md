---
sidebar_label: 'データベース監査ログ'
slug: /cloud/security/audit-logging/database-audit-log
title: 'データベース監査ログ'
description: 'このページでは、データベース監査ログの確認方法について説明します'
doc_type: 'guide'
keywords: ['監査ログ', 'データベースログ', 'コンプライアンス', 'セキュリティ', '監視']
---



# データベース監査ログ {#database-audit-log}

ClickHouseはデフォルトでデータベース監査ログを提供します。このページではセキュリティ関連のログに焦点を当てています。システムによって記録されるデータの詳細については、[システムテーブル](/operations/system-tables/overview)のドキュメントを参照してください。

:::tip ログの保持期間
情報はシステムテーブルに直接記録され、デフォルトで最大30日間保持されます。この期間は、システム内のマージの頻度によって長くなることも短くなることもあります。より長期間ログを保存する場合や、セキュリティ情報およびイベント管理(SIEM)システムにログをエクスポートして長期保存する場合は、追加の対策を講じることができます。詳細は以下を参照してください。
:::


## セキュリティ関連ログ {#security-relevant-logs}

ClickHouseは、セキュリティ関連のデータベースイベントを主にセッションログとクエリログに記録します。

[system.session_log](/operations/system-tables/session_log)は、ログイン試行の成功と失敗、および認証試行の場所を記録します。この情報を使用して、ClickHouseインスタンスに対するクレデンシャルスタッフィング攻撃やブルートフォース攻撃を特定できます。

ログイン失敗を表示するサンプルクエリ

```sql
select event_time
    ,type
    ,user
    ,auth_type
    ,client_address
FROM clusterAllReplicas('default',system.session_log)
WHERE type='LoginFailure'
LIMIT 100
```

[system.query_log](/operations/system-tables/query_log)は、ClickHouseインスタンスで実行されたクエリアクティビティをキャプチャします。この情報は、脅威アクターが実行したクエリを特定するのに役立ちます。

「compromised_account」ユーザーのアクティビティを検索するサンプルクエリ

```sql
SELECT event_time
    ,address
    ,initial_user
    ,initial_address
    ,forwarded_for
    ,query
FROM clusterAllReplicas('default', system.query_log)
WHERE user=’compromised_account’
```


## サービス内でのログデータの保持 {#reatining-log-data-within-services}

より長期間の保持やログの耐久性が必要な場合は、マテリアライズドビューを使用してこれらの目的を達成できます。マテリアライズドビューの概要、利点、実装方法の詳細については、[マテリアライズドビュー](/materialized-views)の動画とドキュメントを参照してください。


## ログのエクスポート {#exporting-logs}

システムログは、SIEMシステムと互換性のある様々な形式を使用して、ストレージに書き込みまたはエクスポートできます。詳細については、[テーブル関数](/sql-reference/table-functions)のドキュメントを参照してください。最も一般的な方法は次のとおりです。

- [S3への書き込み](/sql-reference/table-functions/s3)
- [GCSへの書き込み](/sql-reference/table-functions/gcs)
- [Azure Blob Storageへの書き込み](/sql-reference/table-functions/azureBlobStorage)
