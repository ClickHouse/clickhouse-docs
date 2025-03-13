---
title: 新しいプランへの移行
slug: /cloud/manage/jan-2025-faq/plan-migrations
keywords: [移行, 新しいティア, 価格, コスト, 見積もり]
description: 新しいプラン、ティア、価格への移行、決定とコスト見積もり方法
---

## 新しいプランの選択 {#choosing-new-plans}

### 新たに設立された組織は旧（レガシー）プランでサービスを開始できますか？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

いいえ、新しく作成された組織は発表後、旧プランにアクセスできません。

### ユーザーは新しい価格プランにセルフサービスで移行できますか？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

はい、以下にセルフサービス移行のガイダンスを示します：

| 現行プラン      | 新プラン                   | セルフサービス移行                                                                                                                        |
|----------------|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| Development     | Basic                      | 組織内の全サービスがDevelopmentをサポートしている場合はサポートされます                                                                               |
| Development     | Scale (2レプリカ以上)     | :white_check_mark:                                                                                                                              |
| Development     | Enterprise (2レプリカ以上) | :white_check_mark:                                                                                                                              |
| Production      | Scale (3レプリカ以上)     | :white_check_mark:                                                                                                                              |
| Production      | Enterprise (3レプリカ以上) | :white_check_mark:                                                                                                                                   |
| Dedicated       | [サポートに連絡](https://clickhouse.com/support/program) |

### 開発およびプロダクションサービスを試用しているユーザーの体験はどうなりますか？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

ユーザーは試用中にアップグレードし、新しいサービスティアおよびその機能を評価するために試用クレジットを使用し続けることができます。ただし、同じDevelopmentおよびProductionサービスを引き続き使用したい場合は、PAYGにアップグレードすることができます。2025年7月23日以前に移行する必要があります。

### ユーザーはティアをアップグレードできますか？例：Basic → Scale, Scale → Enterpriseなど。 {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

はい、ユーザーはセルフサービスでアップグレードでき、アップグレード後の価格はティアの選択を反映します。

### ユーザーは高コストティアから低コストティアに移行できますか？例：Enterprise → Scale, Scale → Basic, Enterprise → Basicセルフサービス。 {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

いいえ、ティアのダウングレードは許可されていません。

### 組織内にDevelopmentサービスのみを持つユーザーはBasicティアに移行できますか？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

はい、これは許可されます。ユーザーは過去の使用に基づいた推奨を受け、Basic `1x8GiB` または `1x12GiB` を選択できます。

### 同一組織内でDevelopmentおよびProductionサービスを持つユーザーはBasicティアに移行できますか？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

いいえ、ユーザーが同一組織にDevelopmentおよびProductionサービスの両方を持つ場合、セルフサービスでScaleまたはEnterpriseティアにのみ移行できます。Basicに移行したい場合は、既存のProductionサービスをすべて削除する必要があります。

### 新しいティアに関連するスケーリング動作に変更はありますか？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

コンピュートレプリカ用の新しい垂直スケーリングメカニズム「Make Before Break」（MBB）を導入しています。このアプローチでは、古いレプリカを削除する前に、新しいサイズの1つ以上のレプリカを追加し、スケーリング操作中の容量の損失を防ぎます。既存のレプリカを削除し新しいレプリカを追加する間のギャップを排除することで、よりシームレスで妨げの少ないスケーリングプロセスを実現します。特にリソース使用率が高く追加容量が必要なスケールアップシナリオにおいて有益です。なぜなら、早期にレプリカを削除するとリソース制約が悪化するのみだからです。

この変更の一環として、歴史的なシステムテーブルデータは、スケーリングイベントの一部として最大30日間保持されます。また、2024年12月19日以前のAWSまたはGCPのサービスに関するシステムテーブルデータおよび2025年1月14日以前のAzureのサービスに関するデータは、新しい組織ティアへの移行の一環として保持されません。

## コストの見積もり {#estimating-costs}

### 移行中にユーザーはどのように案内され、自分のニーズに最適なティアを理解しますか？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

コンソールは、サービスがある場合、過去の使用に基づいた推奨オプションを提供します。新しいユーザーは、詳細にリストされた機能と特徴を確認し、自分のニーズに最適なティアを決定できます。

### ユーザーは新しい価格で「倉庫」のサイズをどう見積もりますか？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

[価格](https://clickhouse.com/pricing)ページの価格計算ツールを参照してください。これにより、ワークロードのサイズとティアの選択に基づいてコストを見積もることができます。

## 移行を実施する {#undertaking-the-migration}

### 移行を実施するためのサービスバージョンの前提条件は何ですか？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

サービスはバージョン24.8以上である必要があり、すでにSharedMergeTreeに移行されている必要があります。

### 現行のDevelopmentおよびProductionサービスのユーザーにとっての移行体験はどうですか？ ユーザーはサービスが利用できないメンテナンスウィンドウを計画する必要がありますか？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

DevelopmentおよびProductionサービスを新しい価格ティアに移行する際には、サーバーの再起動が必要になる場合があります。Dedicatedサービスを移行するには、[サポートに連絡](https://clickhouse.com/support/program)してください。

### 移行後にユーザーが行うべき他のアクションは何ですか？ {#what-other-actions-should-a-user-take-after-the-migration}

APIアクセスパターンは異なります。

新しいサービスを作成するためにOpenAPIを使用するユーザーは、サービス作成の`POST`リクエストにおいて`tier`フィールドを削除する必要があります。

サービスオブジェクトから`tier`フィールドは削除され、もはやサービスティアは存在しません。  
これにより、`POST`、`GET`、`PATCH`サービスリクエストで返されるオブジェクトにも影響があります。したがって、これらのAPIを利用するコードは、これらの変更に対応できるように調整が必要です。

各サービスが作成されるレプリカの数は、ScaleおよびEnterpriseティアではデフォルトで3に設定され、Basicティアではデフォルトで1に設定されます。  
ScaleおよびEnterpriseティアでは、サービス作成リクエストで`numReplicas`フィールドを指定することで調整することが可能です。  
`numReplicas`フィールドの値は、倉庫内の最初のサービスに対して2から20の間である必要があります。既存の倉庫で作成されるサービスは、レプリカの数が1まで低くすることができます。

### 自動化のために既存のTerraformプロバイダーを使用している場合、ユーザーはどのような変更を行う必要がありますか？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

組織が新しいプランの1つに移行すると、ユーザーは当社のTerraformプロバイダーのバージョン2.0.0以上を使用する必要があります。

新しいTerraformプロバイダーは、サービスの`tier`属性の変更を扱うために必要です。

移行後は、`tier`フィールドはもはや受け入れられず、それに対する参照は削除する必要があります。

ユーザーは、サービスリソースのプロパティとして`num_replicas`フィールドを指定できるようになります。

各サービスが作成されるレプリカの数は、ScaleおよびEnterpriseティアではデフォルトで3に設定され、Basicティアではデフォルトで1に設定されます。  
ScaleおよびEnterpriseティアでは、サービス作成リクエストで`numReplicas`フィールドを指定することで調整することが可能です。  
`num_replicas`フィールドの値は、倉庫内の最初のサービスに対して2から20の間である必要があります。既存の倉庫で作成されるサービスは、レプリカの数が1まで低くすることができます。

### ユーザーはデータベースアクセスに変更を加える必要がありますか？ {#will-users-have-to-make-any-changes-to-the-database-access}

いいえ、データベースのユーザー名/パスワードは以前と同様に機能します。

### ユーザーはプライベートネットワーク機能を再構成する必要がありますか？ {#will-users-have-to-reconfigure-private-networking-features}

いいえ、ユーザーはProductionサービスをScaleまたはEnterpriseに移行した後、既存のプライベートネットワーキング（Private Link, PSCなど）設定を使用できます。
