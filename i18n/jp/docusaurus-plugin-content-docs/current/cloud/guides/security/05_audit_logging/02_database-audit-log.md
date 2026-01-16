---
sidebar_label: 'データベース監査ログ'
slug: /cloud/security/audit-logging/database-audit-log
title: 'データベース監査ログ'
description: 'このページでは、データベース監査ログを確認する方法について説明します'
doc_type: 'guide'
keywords: ['監査ログ', 'データベースログ', 'コンプライアンス', 'セキュリティ', '監視']
---

# データベース監査ログ \\{#database-audit-log\\}

ClickHouse では、デフォルトでデータベース監査ログが有効になっています。このページでは、セキュリティに関連するログに焦点を当てます。システムによって記録されるデータの詳細については、[system tables](/operations/system-tables/overview) のドキュメントを参照してください。

:::tip ログ保持
情報は system テーブルに直接記録され、デフォルトでは最大 30 日間保持されます。この期間は、システム内でのマージ頻度の影響を受けて長くなったり短くなったりします。お客様は、ログをより長期間保存したり、長期保管のためにセキュリティ情報・イベント管理 (SIEM) システムへエクスポートしたりするために、追加の対策を講じることができます。詳細は後述します。
:::

## セキュリティ関連のログ \{#security-relevant-logs\}

ClickHouse は、主にセッションログとクエリログに、データベースにおけるセキュリティ関連イベントを記録します。

[system.session&#95;log](/operations/system-tables/session_log) には、成功および失敗したログイン試行と、その認証試行が行われた場所が記録されます。この情報は、ClickHouse インスタンスに対するクレデンシャルスタッフィングやブルートフォース攻撃を特定するために利用できます。

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

[system.query&#95;log](/operations/system-tables/query_log) は、ClickHouse インスタンスで実行されたクエリのアクティビティを記録します。この情報は、攻撃者がどのようなクエリを実行したかを特定するのに役立ちます。

&quot;compromised&#95;account&quot; というユーザーのアクティビティを検索するためのサンプルクエリ

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


## サービス内でのログデータの保持 \\{#reatining-log-data-within-services\\}

より長期間の保持やログの耐久性が求められる場合は、materialized view を使用することでこれらの要件を満たせます。materialized view の概要、その利点、および実装方法の詳細については、[materialized views](/materialized-views) に関する動画およびドキュメントを参照してください。

## ログのエクスポート \\{#exporting-logs\\}

システムログは、SIEM システムと互換性のあるさまざまな形式で、任意のストレージ先に書き込みまたはエクスポートできます。詳細については、[テーブル関数](/sql-reference/table-functions)のドキュメントを参照してください。最も一般的な方法は次のとおりです。

- [S3 に書き込む](/sql-reference/table-functions/s3)
- [GCS に書き込む](/sql-reference/table-functions/gcs)
- [Azure Blob Storage に書き込む](/sql-reference/table-functions/azureBlobStorage)