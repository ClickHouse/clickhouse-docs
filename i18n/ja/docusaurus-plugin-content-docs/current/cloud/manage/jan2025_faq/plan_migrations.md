---
title: 新しいプランへの移行
slug: /cloud/manage/jan-2025-faq/plan-migrations
keywords: [移行, 新しいティア, 価格, コスト, 見積もり]
description: 新しいプランへの移行、ティア、価格、決定方法とコスト見積もり
---

## 新しいプランの選択 {#choosing-new-plans}

### 新たに組織を設立した場合、古い（レガシー）プランでサービスを開始できますか？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

いいえ、新たに設立された組織は発表後、古いプランにアクセスすることはできません。

### ユーザーは新しい価格プランにセルフサービスで移行できますか？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

はい、セルフサービス移行に関するガイダンスは以下をご覧ください:

| 現在のプラン | 新しいプラン                 | セルフサービス移行                                                                                                                           |
|--------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Development  | Basic                    | 組織内の全サービスがDevelopmentをサポートしている場合、対応します                                                                          |
| Development  | Scale (2レプリカ以上)      | :white_check_mark:                                                                                                                                     |
| Development  | Enterprise (2レプリカ以上) | :white_check_mark:                                                                                                                                          |
| Production   | Scale (3レプリカ以上)      | :white_check_mark:                                                                                                                                          |
| Production   | Enterprise (3レプリカ以上) | :white_check_mark:                                                                                                                                       |
| Dedicated   | [サポートに連絡](https://clickhouse.com/support/program) |

### 開発およびプロダクションサービスのトライアルを実行しているユーザーの体験はどうなりますか？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

ユーザーはトライアル中にアップグレードし、新しいサービスティアとそのサポート機能を評価するためのトライアルクレジットを引き続き使用できます。ただし、同じDevelopmentおよびProductionサービスを継続して使用することを選択した場合も、PAYGにアップグレードすることができます。それでも、2025年7月23日までに移行する必要があります。

### ユーザーはティアをアップグレードできますか？例えばBasic → Scale、Scale → Enterpriseなどですか？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

はい、ユーザーはセルフサービスでアップグレードでき、価格はアップグレード後のティア選択を反映します。

### ユーザーは高コストのティアから低コストのティアに移動できますか？例えばEnterprise → Scale、Scale → Basic、Enterprise → Basicのセルフサービスなどですか？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

いいえ、ティアのダウングレードは許可されていません。

### 組織内にDevelopmentサービスのみがあるユーザーはBasicティアに移行できますか？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

はい、これは許可されます。ユーザーには過去の使用に基づく推奨がされ、Basic `1x8GiB`または`1x12GiB`を選択できます。

### 同じ組織内にDevelopmentとProductionサービスを持つユーザーはBasicティアに移動できますか？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

いいえ、ユーザーが同じ組織内にDevelopmentとProductionサービスの両方を持つ場合、セルフサービスで移動できるのはScaleまたはEnterpriseティアのみです。Basicに移行したい場合は、すべての既存のProductionサービスを削除する必要があります。

### 新しいティアに関連してスケーリング動作に変更はありますか？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

コンピュートレプリカのために新しい垂直スケーリングメカニズム「Make Before Break」（MBB）を導入します。このアプローチでは、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加し、スケーリング操作中の容量の損失を防ぎます。既存のレプリカの削除と新しいレプリカの追加の間のギャップをなくすことで、よりシームレスで中断の少ないスケーリングプロセスを実現します。特にリソース利用率が高く、追加のキャパシティが必要なスケールアップシナリオにおいて非常に有益です。なぜなら、レプリカを早く取り除くとリソースの制約がさらに悪化するからです。

この変更の一環として、歴史的なシステムテーブルデータはスケーリングイベントの一部として最大30日間保持されます。また、AWSやGCPのサービス用に2024年12月19日より前のシステムテーブルデータ、およびAzureのサービス用に2025年1月14日より前のデータは、新しい組織ティアへの移行の一部として保持されません。

## コストの見積もり {#estimating-costs}

### ユーザーは移行中にどのようにガイドされ、自分のニーズに最適なティアを理解することができますか？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

コンソールは、サービスがある場合、過去の使用に基づいて各サービスの推奨オプションを提示します。新しいユーザーは、詳細に記載された機能や特徴を確認し、自分のニーズに最も適したティアを決定できます。

### ユーザーは新しい価格で「倉庫」のサイズとコストをどのように見積もりますか？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

[価格](https://clickhouse.com/pricing) ページの価格計算機を参照してください。これにより、作業負荷のサイズとティア選択に基づいてコストを見積もることができます。

## 移行の実施 {#undertaking-the-migration}

### 移行を実施する際のサービスバージョンの前提条件は何ですか？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

サービスはバージョン24.8以降である必要があり、すでにSharedMergeTreeに移行されている必要があります。

### 現在のDevelopmentおよびProductionサービスのユーザーの移行体験はどうなりますか？ユーザーはサービスが利用できないメンテナンスウィンドウを計画する必要がありますか？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

DevelopmentおよびProductionサービスを新しい価格ティアに移行することでサーバーの再起動がトリガーされる場合があります。専用サービスに移行するには、[サポートに連絡](https://clickhouse.com/support/program)してください。

### 移行後にユーザーが取るべき他のアクションは何ですか？ {#what-other-actions-should-a-user-take-after-the-migration}

APIアクセスパターンが異なります。

新しいサービスを作成するために当社のOpenAPIを利用するユーザーは、サービス作成`POST`リクエストから`tier`フィールドを削除する必要があります。

`tier`フィールドはサービスオブジェクトから削除されました。もうサービスティアがないからです。  
これは、`POST`、`GET`、および`PATCH`サービスリクエストによって返されるオブジェクトに影響を与えます。したがって、これらのAPIを消費するコードは、これらの変更を処理するために調整が必要になる場合があります。

各サービスは、ScaleおよびEnterpriseティアではデフォルトで3のレプリカが作成され、Basicティアではデフォルトで1のレプリカが作成されます。  
ScaleおよびEnterpriseティアの場合、サービス作成リクエストの`numReplicas`フィールドを渡すことで調整可能です。  
`numReplicas`フィールドの値は、倉庫内の最初のサービスに対して2から20の間でなければなりません。既存の倉庫で作成されたサービスは、1のレプリカを持つことも可能です。

### 既存のTerraformプロバイダーを自動化に使用している場合、ユーザーはどのような変更をする必要がありますか？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

組織が新しいプランのいずれかに移行された場合、ユーザーは当社のTerraformプロバイダーのバージョン2.0.0以上を使用する必要があります。

新しいTerraformプロバイダーは、サービスの`tier`属性の変更を処理するために必要です。

移行後、`tier`フィールドは受け入れられず、参照を削除する必要があります。

ユーザーは、サービスリソースのプロパティとして`num_replicas`フィールドを指定できるようになります。

各サービスは、ScaleおよびEnterpriseティアではデフォルトで3のレプリカが作成され、Basicティアではデフォルトで1のレプリカが作成されます。  
ScaleおよびEnterpriseティアの場合、サービス作成リクエストの`numReplicas`フィールドを渡すことで調整可能です。  
`num_replicas`フィールドの値は、倉庫内の最初のサービスに対して2から20の間でなければなりません。既存の倉庫で作成されたサービスは、1のレプリカを持つことも可能です。

### ユーザーはデータベースアクセスに変更を加える必要がありますか？ {#will-users-have-to-make-any-changes-to-the-database-access}

いいえ、データベースのユーザー名/パスワードは以前と同様に動作します。

### ユーザーはプライベートネットワーキング機能を再構成する必要がありますか？ {#will-users-have-to-reconfigure-private-networking-features}

いいえ、ユーザーはProductionサービスをScaleまたはEnterpriseに移動した後、既存のプライベートネットワーキング（Private Link、PSCなど）構成を使用できます。
