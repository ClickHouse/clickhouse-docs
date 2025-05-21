---
title: '新しいプランへの移行'
slug: /cloud/manage/jan-2025-faq/plan-migrations
keywords: ['移行', '新しいティア', '価格設定', 'コスト', '見積もり']
description: '新しいプラン、ティア、価格設定への移行、コストを決定し見積もる方法'
---

## 新しいプランの選定 {#choosing-new-plans}

### 新しく設立された組織は古い（レガシー）プランでサービスを開始できますか？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

いいえ、新しく作成された組織は発表後に古いプランを利用することはできません。

### ユーザーは新しい価格プランにセルフサービスで移行できますか？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

はい、以下にセルフサービス移行に関するガイドがあります：

| 現在のプラン | 新しいプラン                 | セルフサービスによる移行                                                                                                                           |
|--------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| Development  | Basic                    | 組織内のすべてのサービスが Development をサポートしている場合はサポートされます                                                                          |
| Development  | Scale (2 レプリカ以上)      | :white_check_mark:                                                                                                                                     |
| Development  | Enterprise (2 レプリカ以上) | :white_check_mark:                                                                                                                                          |
| Production   | Scale (3 レプリカ以上)      | :white_check_mark:                                                                                                                                          |
| Production   | Enterprise (3 レプリカ以上) | :white_check_mark:                                                                                                                                       |
| Dedicated   | [サポートに連絡](https://clickhouse.com/support/program) |

### 開発およびプロダクションサービスを試用しているユーザーの体験はどうなりますか？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

ユーザーは試用期間中にアップグレードを行い、試用クレジットを使用して新しいサービスティアとその機能を評価し続けることができます。ただし、同じ開発およびプロダクションサービスを引き続き使用することを選択する場合、それを行いPAYGにアップグレードすることができます。ただし、2025年7月23日までに移行する必要があります。

### ユーザーは自分のティアをアップグレードできますか？つまり、Basic → Scale、Scale → Enterprise などですか？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

はい、ユーザーはセルフサービスでアップグレードでき、価格はアップグレード後のティア選択を反映します。

### ユーザーは高コストのティアから低コストのティアに移行できますか？例えば、Enterprise → Scale、Scale → Basic、Enterprise → Basicのセルフサービスなどですか？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

いいえ、ティアのダウングレードは許可されていません。

### 組織内にDevelopmentサービスのみを持つユーザーはBasicティアに移行できますか？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

はい、これは許可されます。ユーザーは過去の使用に基づいて推奨を受け、Basic `1x8GiB` または `1x12GiB` を選択できます。

### 同じ組織にDevelopment及びProductionサービスがあるユーザーはBasicティアに移行できますか？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

いいえ、ユーザーが同じ組織にDevelopmentおよびProductionサービスの両方を持っている場合、セルフサービスで移行できるのはScaleまたはEnterpriseティアのみです。Basicに移行したい場合は、すべての既存のProductionサービスを削除する必要があります。

### 新しいティアに関して、スケーリング動作に変更はありますか？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

私たちは計算レプリカのための新しい垂直スケーリングメカニズム「Make Before Break」（MBB）を導入しています。このアプローチでは、古いレプリカを削除する前に新しいサイズの1つ以上のレプリカを追加することで、スケーリング操作中の容量の損失を防ぎます。既存のレプリカの削除と新しいレプリカの追加の間のギャップを排除することにより、MBBはよりシームレスで中断の少ないスケーリングプロセスを作成します。これは、リソースの高い利用率が追加の容量のニーズを引き起こすスケールアップシナリオに特に有益です。なぜなら、レプリカを早期に削除することはリソースの制約を悪化させるだけだからです。

この変更の一環として、歴史的なシステムテーブルデータは、スケーリングイベントの一部として最大で30日間保持されます。さらに、AWSまたはGCP上のサービスに対しては2024年12月19日より古いシステムテーブルデータ、およびAzure上のサービスに対しては2025年1月14日より古いデータは新しい組織ティアへの移行の一部として保持されません。

## コストの見積もり {#estimating-costs}

### ユーザーは移行中に、どのティアが自分のニーズに最適かをどのようにガイドされますか？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

コンソールは、サービスを持っている場合、過去の使用に基づいて各サービスの推奨オプションを提示します。新しいユーザーは、詳細にリストされた機能を確認し、自分のニーズに最適なティアを決定できます。

### ユーザーは新しい価格で「ウェアハウス」のサイズをどのように見積もりますか？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

ワークロードのサイズとティアの選択に基づいてコストを見積もるのを助ける [Pricing](https://clickhouse.com/pricing) ページの価格計算機を参照してください。

## 移行の実施 {#undertaking-the-migration}

### 移行を実施するためのサービスバージョンの前提条件は何ですか？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

あなたのサービスはバージョン24.8以上であり、既にSharedMergeTreeに移行されている必要があります。

### 現在のDevelopmentおよびProductionサービスのユーザーの移行体験はどうなりますか？ ユーザーはサービスが利用できない時間を計画する必要がありますか？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

DevelopmentおよびProductionサービスの新しい価格ティアへの移行は、サーバーの再起動をトリガーする可能性があります。Dedicatedサービスを移行するには、[サポート](https://clickhouse.com/support/program) に連絡してください。

### ユーザーは移行後にどのようなアクションを取る必要がありますか？ {#what-other-actions-should-a-user-take-after-the-migration}

APIアクセスパターンが異なるものになります。

新しいサービスを作成するために私たちのOpenAPIを使用するユーザーは、サービス作成の`POST`リクエスト内で`tier`フィールドを削除する必要があります。

`tier`フィールドはサービスオブジェクトから削除され、私たちはもはやサービスティアを持っていません。  
これは、`POST`、`GET`、および`PATCH`サービスリクエストによって返されるオブジェクトに影響を与えます。したがって、これらのAPIを使用するコードは、これらの変更を処理するために調整が必要になる場合があります。

各サービスが作成されるレプリカ数は、ScaleおよびEnterpriseティアではデフォルトで3となり、Basicティアではデフォルトで1となります。  
ScaleおよびEnterpriseティアでは、サービス作成リクエストで`numReplicas`フィールドを渡すことにより、レプリカ数を調整することが可能です。  
`numReplicas`フィールドの値は、ウェアハウス内の最初のサービスに対して2から20の間でなければなりません。既存のウェアハウス内で作成されたサービスは、レプリカ数を1にすることができます。

### 既存のTerraformプロバイダーを自動化に使用している場合、ユーザーはどのような変更を行う必要がありますか？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

組織が新しいプランの1つに移行された場合、ユーザーは弊社のTerraformプロバイダーのバージョン2.0.0以上を使用する必要があります。

新しいTerraformプロバイダーは、サービスの`tier`属性の変更を処理するために必要です。

移行後は`tier`フィールドは受け付けられず、それへの参照は削除する必要があります。

ユーザーは、サービスリソースのプロパティとして`num_replicas`フィールドを指定することもできます。

各サービスが作成されるレプリカ数は、ScaleおよびEnterpriseティアではデフォルトで3となり、Basicティアではデフォルトで1となります。  
ScaleおよびEnterpriseティアでは、サービス作成リクエストで`numReplicas`フィールドを渡すことにより、レプリカ数を調整することが可能です。  
`num_replicas`フィールドの値は、ウェアハウス内の最初のサービスに対して2から20の間でなければなりません。既存のウェアハウス内で作成されたサービスは、レプリカ数を1にすることができます。

### データベースアクセスに何か変更が必要ですか？ {#will-users-have-to-make-any-changes-to-the-database-access}

いいえ、データベースのユーザー名/パスワードは以前と同じように機能します。

### プライベートネットワーキング機能を再構成する必要がありますか？ {#will-users-have-to-reconfigure-private-networking-features}

いいえ、ユーザーはProductionサービスをScaleまたはEnterpriseに移行した後も、既存のプライベートネットワーキング（Private Link、PSCなど）構成を使用できます。
