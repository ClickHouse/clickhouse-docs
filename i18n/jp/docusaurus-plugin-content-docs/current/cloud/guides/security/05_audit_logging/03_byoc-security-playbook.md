---
sidebar_label: 'BYOC セキュリティプレイブック'
slug: /cloud/security/audit-logging/byoc-security-playbook
title: 'BYOC セキュリティプレイブック'
description: 'このページでは、お客様が潜在的なセキュリティインシデントを特定するために利用できる手法を説明します'
doc_type: 'guide'
keywords: ['byoc', 'セキュリティ', 'プレイブック', 'ベストプラクティス', 'コンプライアンス']
---



# BYOC セキュリティプレイブック {#byoc-security-playbook}

ClickHouse は Trust Center (https://trust.clickhouse.com) からダウンロード可能なセキュリティ共有責任モデルに基づいて、Bring Your Own Cloud (BYOC) を運用しています。以下の情報は、潜在的なセキュリティイベントを識別する方法の例として、BYOC のお客様向けに提供されています。お客様は、自身のセキュリティプログラムの観点からこの情報を検討し、追加の検知やアラートが有用かどうかを判断してください。



## ClickHouse の認証情報が漏洩した可能性がある場合 {#compromised-clickhouse-credentials}

認証情報を悪用した攻撃を検出するためのクエリや、悪意のあるアクティビティを調査するためのクエリについては、[database audit log](/cloud/security/audit-logging/database-audit-log) のドキュメントを参照してください。



## アプリケーション層に対するサービス拒否攻撃 {#application-layer-dos-attack}

サービス拒否（DoS）攻撃を実行する方法にはさまざまなものがあります。攻撃が特定のペイロードによって ClickHouse インスタンスをクラッシュさせることを目的としている場合は、システムを稼働状態に復旧するか、システムを再起動したうえでアクセスを制限し、制御を取り戻してください。攻撃に関する詳細情報を取得するには、次のクエリを使用して [system.crash&#95;log](/operations/system-tables/crash_log) を確認します。

```sql
SELECT * 
FROM clusterAllReplicas('default',system.crash_log)
```


## 侵害された、ClickHouse によって作成された AWS ロール {#compromised-clickhouse-created-aws-roles}

ClickHouse は、システム機能を有効にするためにあらかじめ作成されたロールを使用します。このセクションでは、お客様が CloudTrail を有効にした AWS を利用しており、CloudTrail ログにアクセスできることを前提としています。

インシデントがロールの侵害によるものである可能性がある場合は、ClickHouse の IAM ロールおよびアクションに関連する CloudTrail と CloudWatch 内のアクティビティを確認してください。IAM ロールの一覧については、セットアップの一部として提供される [CloudFormation](/cloud/reference/byoc/onboarding/aws#cloudformation-iam-roles) スタックまたは Terraform モジュールを参照してください。



## EKS クラスターへの不正アクセス {#unauthorized-access-eks-cluster}

ClickHouse BYOC は EKS 上で動作します。このセクションでは、AWS で CloudTrail と CloudWatch を使用しており、ログへアクセスできることを前提とします。

インシデントが侵害された EKS クラスターに起因している可能性がある場合は、以下のクエリを EKS の CloudWatch ログに対して実行し、特定の脅威を洗い出します。

ユーザー名ごとの Kubernetes API コール数を一覧表示する

```sql
fields user.username
| stats count(*) as count by user.username
```

ユーザーが ClickHouse エンジニアかどうかを判定する

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter user.username like /clickhouse.com/
| limit 10000
```

Kubernetes の Secret にアクセスしているユーザーを確認し、サービスロールを除外する

```sql
fields @timestamp,user.extra.sessionName.0, requestURI, verb,userAgent, @message, @logStream, @log
| sort @timestamp desc
| filter requestURI like /secret/
| filter verb="get"
| filter ispresent(user.extra.sessionName.0)
| filter user.username not like /ClickHouseManagementRole/
| filter user.username not like /data-plane-mgmt/
```
