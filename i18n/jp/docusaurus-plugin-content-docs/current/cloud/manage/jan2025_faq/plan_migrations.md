---
'title': '新しいプランへの移行'
'slug': '/cloud/manage/jan-2025-faq/plan-migrations'
'keywords':
- 'migration'
- 'new tiers'
- 'pricing'
- 'cost'
- 'estimation'
'description': '新プラン、階層、価格への移行、決定方法とコストの見積もり'
---



## 新しいプランの選択 {#choosing-new-plans}

### 新しく作成された組織は古い（レガシー）プランでサービスを開始できますか？ {#can-new-organizations-launch-services-on-the-old-legacy-plan}

いいえ、新しく作成された組織は発表後に古いプランへのアクセスを持ちません。

### ユーザーは新しい価格プランにセルフサービスで移行できますか？ {#can-users-migrate-to-the-new-pricing-plan-self-serve}

はい、以下にセルフサービス移行のガイダンスがあります：

| 現行プラン      | 新プラン                    | セルフサービス移行                                                                                                                             |
|--------------|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
| 開発          | 基本                     | 組織内のすべてのサービスが開発をサポートしている場合にサポート                                                                                             |
| 開発          | スケール（2レプリカ以上）  | :white_check_mark:                                                                                                                                     |
| 開発          | エンタープライズ（2レプリカ以上） | :white_check_mark:                                                                                                                                          |
| 本番         | スケール（3レプリカ以上）  | :white_check_mark:                                                                                                                                          |
| 本番         | エンタープライズ（3レプリカ以上） | :white_check_mark:                                                                                                                                       |
| 専用         | [サポート](https://clickhouse.com/support/program)にお問い合わせください  |

### 開発および本番サービスを試用中のユーザーはどのような体験をしますか？ {#what-will-the-experience-be-for-users-in-trial-running-development-and-production-services}

ユーザーは試用中にアップグレードし、新しいサービス階層とそれがサポートする機能を評価するために試用クレジットを引き続き使用できます。ただし、同じ開発および本番サービスを引き続き使用することを選択した場合、PAYGにアップグレードできます。2025年7月23日前に移行する必要があります。

### ユーザーは階層をアップグレードできますか？たとえば、基本 → スケール、スケール → エンタープライズなど？ {#can-users-upgrade-their-tiers-ie-basic--scale-scale--enterprise-etc}

はい、ユーザーはセルフサービスでアップグレードでき、アップグレード後の価格は階層の選択を反映します。

### ユーザーは高コスト階層から低コスト階層に移動できますか？たとえば、エンタープライズ → スケール、スケール → 基本、エンタープライズ → 基本のセルフサービスなど？ {#can-users-move-from-a-higher-to-a-lower-cost-tier-eg-enterprise--scale-scale--basic-enterprise--basic-self-serve}

いいえ、階層のダウングレードは許可されていません。

### 組織内に開発サービスのみがあるユーザーは基本階層に移行できますか？ {#can-users-with-only-development-services-in-the-organization-migrate-to-the-basic-tier}

はい、これは許可されます。ユーザーには過去の使用に基づいて推奨が与えられ、基本 `1x8GiB` または `1x12GiB` を選択できます。

### 同じ組織内に開発と本番サービスがあるユーザーは基本階層に移動できますか？ {#can-users-with-a-development-and-production-service-in-the-same-organization-move-to-the-basic-tier}

いいえ、ユーザーが同じ組織に開発と本番サービスの両方を持っている場合、セルフサービスでスケールまたはエンタープライズ階層にのみ移行できます。基本に移行したい場合、すべての既存の本番サービスを削除する必要があります。

### 新しい階層でのスケーリングの動作に関する変更はありますか？ {#are-there-any-changes-related-to-the-scaling-behavior-with-the-new-tiers}

我々は、コンピュートレプリカ用の新しい垂直スケーリングメカニズムを導入します。これを「Make Before Break」（MBB）と呼びます。このアプローチでは、古いレプリカを削除する前に新しいサイズのレプリカを1つ以上追加し、スケーリング操作中に容量の損失を防ぎます。既存のレプリカの削除と新しいレプリカの追加の間のギャップを解消することで、MBBはよりシームレスで中断の少ないスケーリングプロセスを実現します。リソースの高い使用率が追加の容量を必要とするスケールアップシナリオでは、レプリカを前もって削除することはリソース制約を悪化させるだけなので、特に有益です。

この変更の一環として、過去のシステムテーブルデータはスケーリングイベントの一部として最大30日間保持されます。さらに、AWSまたはGCPでのサービスに関しては2024年12月19日以前のシステムテーブルデータ、Azureでのサービスに関しては2025年1月14日以前のデータは新しい組織階層への移行の一部として保持されません。

## コストの推定 {#estimating-costs}

### ユーザーは移行中にどのようにガイドされ、自分のニーズに最適な階層を理解しますか？ {#how-will-users-be-guided-during-migration-understanding-what-tier-best-fits-their-needs}

コンソールは、サービスがある場合に過去の使用に基づいて各サービスの推奨オプションを提示します。新しいユーザーは、詳細に記載された機能と機能を確認し、自分のニーズに最適な階層を決定できます。

### ユーザーは新しい価格で「ウェアハウス」をどのようにサイズ設定し、コストを推定しますか？ {#how-do-users-size-and-estimate-the-cost-of-warehouses-in-the-new-pricing}

[ Pricing](https://clickhouse.com/pricing) ページにある価格計算機を参照してください。これにより、ワークロードのサイズと階層選択に基づいてコストを推定できます。

## 移行の実施 {#undertaking-the-migration}

### 移行を実施するためのサービスバージョンの前提条件は何ですか？ {#what-are-service-version-pre-requisites-to-undertaking-the-migration}

サービスはバージョン24.8以降であり、SharedMergeTreeに移行されている必要があります。

### 現行の開発および本番サービスのユーザーの移行体験はどのようなものですか？ユーザーはサービスが利用できないメンテナンスウィンドウを計画する必要がありますか？ {#what-is-the-migration-experience-for-users-of-the-current-development-and-production-services-do-users-need-to-plan-for-a-maintenance-window-where-the-service-is-unavailable}

開発および本番サービスを新しい価格階層に移行する際、サーバーの再起動がトリガーされる可能性があります。専用サービスを移行するには、[サポート](https://clickhouse.com/support/program)にお問い合わせください。

### 移行後、ユーザーが取るべき他のアクションは何ですか？ {#what-other-actions-should-a-user-take-after-the-migration}

APIアクセスパターンは異なります。

新しいサービスを作成するためにOpenAPIを使用するユーザーは、サービス作成の`POST`リクエストから`tier`フィールドを削除する必要があります。

`tier`フィールドはサービスオブジェクトから削除され、もはやサービス階層は存在しません。  
これは`POST`、`GET`、および`PATCH`サービスリクエストによって返されるオブジェクトに影響を及ぼします。したがって、これらのAPIを消費するコードは、これらの変更を処理するように調整する必要があります。

各サービスは、スケールおよびエンタープライズ階層でのデフォルトのレプリカ数は3、基本階層では1です。  
スケールおよびエンタープライズ階層では、サービス作成リクエストで`numReplicas`フィールドを渡すことにより調整できます。  
ウェアハウス内の最初のサービスの`numReplicas`フィールドの値は2から20の範囲内である必要があります。既存のウェアハウス内で作成されたサービスは、最低1のレプリカ数を持つことができます。

### 自動化のために既存のTerraformプロバイダーを使用している場合、ユーザーはどのような変更を行う必要がありますか？ {#what-changes-should-the-users-make-if-using-the-existing-terraform-provider-for-automation}

組織が新しいプランのいずれかに移行した後、ユーザーはTerraformプロバイダーのバージョン2.0.0以上を使用する必要があります。

新しいTerraformプロバイダーは、サービスの`tier`属性の変更を処理するために必要です。

移行後、`tier`フィールドは受け付けられなくなりますので、これへの参照は削除する必要があります。

ユーザーはサービスリソースのプロパティとして`num_replicas`フィールドを指定できるようになります。

各サービスは、スケールおよびエンタープライズ階層でのデフォルトのレプリカ数は3、基本階層では1です。  
スケールおよびエンタープライズ階層では、サービス作成リクエストで`numReplicas`フィールドを渡すことで調整できます。  
ウェアハウス内の最初のサービスの`num_replicas`フィールドの値は2から20の範囲内である必要があります。既存のウェアハウス内で作成されたサービスは、最低1のレプリカ数を持つことができます。

### ユーザーはデータベースアクセスに変更を加える必要がありますか？ {#will-users-have-to-make-any-changes-to-the-database-access}

いいえ、データベースのユーザー名/パスワードは以前と同じように機能します。

### ユーザーはプライベートネットワーキング機能を再構成する必要がありますか？ {#will-users-have-to-reconfigure-private-networking-features}

いいえ、ユーザーは本番サービスをスケールまたはエンタープライズに移動した後、既存のプライベートネットワーキング（プライベートリンク、PSCなど）構成を使用できます。
