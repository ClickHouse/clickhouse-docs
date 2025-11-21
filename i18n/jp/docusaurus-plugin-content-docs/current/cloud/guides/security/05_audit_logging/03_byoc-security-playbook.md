---
sidebar_label: 'BYOC セキュリティ プレイブック'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'BYOC セキュリティ プレイブック'
description: 'このページでは、顧客が潜在的なセキュリティインシデントを特定するために利用できる方法を説明します'
doc_type: 'guide'
keywords: ['byoc', 'security', 'playbook', 'best practices', 'compliance']
---



# BYOCセキュリティプレイブック {#byoc-security-playbook}

ClickHouseは、セキュリティ共同責任モデルに基づいてBring Your Own Cloud(BYOC)を運用しています。このモデルの詳細は、Trust Center(https://trust.clickhouse.com)からダウンロードできます。以下の情報は、潜在的なセキュリティイベントを特定する方法の例として、BYOCをご利用のお客様に提供されています。お客様は、追加の検知やアラートが有用かどうかを判断するために、自社のセキュリティプログラムの観点からこの情報をご検討ください。


## 侵害された可能性のあるClickHouse認証情報 {#compromised-clickhouse-credentials}

認証情報ベースの攻撃の検出や悪意のある活動の調査に使用するクエリについては、[データベース監査ログ](/cloud/security/audit-logging/database-audit-log)のドキュメントを参照してください。


## アプリケーション層のサービス拒否攻撃 {#application-layer-dos-attack}

サービス拒否（DoS）攻撃を実行する方法は様々です。特定のペイロードによってClickHouseインスタンスをクラッシュさせることを目的とした攻撃の場合は、システムを実行可能な状態に復旧するか、システムを再起動してアクセスを制限し、制御を回復してください。攻撃に関する詳細情報を取得するには、以下のクエリを使用して[system.crash_log](/operations/system-tables/crash_log)を確認してください。

```sql
SELECT *
FROM clusterAllReplicas('default',system.crash_log)
```


## ClickHouseが作成したAWSロールの侵害 {#compromised-clickhouse-created-aws-roles}

ClickHouseはシステム機能を有効化するために事前作成されたロールを使用します。本セクションでは、お客様がCloudTrailを有効化したAWSを使用しており、CloudTrailログへのアクセス権限を持つことを前提としています。

インシデントがロールの侵害に起因する可能性がある場合は、ClickHouse IAMロールおよびアクションに関連するCloudTrailとCloudWatchのアクティビティを確認してください。IAMロールの一覧については、セットアップ時に提供される[CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles)スタックまたはTerraformモジュールを参照してください。


## EKSクラスタへの不正アクセス {#unauthorized-access-eks-cluster}

ClickHouse BYOCはEKS内で実行されます。本セクションでは、お客様がAWSでCloudTrailとCloudWatchを使用しており、ログにアクセス可能であることを前提としています。

インシデントが侵害されたEKSクラスタに起因する可能性がある場合は、EKS CloudWatchログ内で以下のクエリを使用して特定の脅威を特定してください。

ユーザー名別のKubernetes API呼び出し数を一覧表示

```sql
fields user.username
| stats count(*) as count by user.username
```

ユーザーがClickHouseエンジニアであるかを識別

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Kubernetesシークレットにアクセスしているユーザーを確認し、サービスロールを除外

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
