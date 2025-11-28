---
sidebar_label: '概要'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'ClickHouse Cloud API の概要'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'API 概要', 'クラウド API', 'REST API', 'プログラムによるアクセス']
---



# ClickHouse Cloud API



## 概要 {#overview}

ClickHouse Cloud API は、開発者が ClickHouse Cloud 上の組織やサービスを簡単に管理できるように設計された REST API です。Cloud API を使用すると、サービスの作成および管理、API キーのプロビジョニング、組織メンバーの追加や削除などを行うことができます。

[最初の API キーを作成し、ClickHouse Cloud API の利用を開始する方法はこちら](/cloud/manage/openapi)



## Swagger (OpenAPI) エンドポイントと UI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud API はオープンソースの [OpenAPI 仕様](https://www.openapis.org/) に基づいて構築されており、クライアント側から予測可能な形で利用できるようになっています。ClickHouse Cloud API のドキュメントをプログラムから利用する必要がある場合は、JSON ベースの Swagger エンドポイントを https://api.clickhouse.cloud/v1 で提供しています。API ドキュメントは [Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger) からも参照できます。

:::note 
組織が [新しい料金プラン](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false) のいずれかに移行済みで、OpenAPI を使用している場合、サービス作成時の `POST` リクエストから `tier` フィールドを削除する必要があります。

サービスオブジェクトからは、サービスティアを廃止したため `tier` フィールドが削除されています。  
これは、`POST`、`GET`、`PATCH` の各サービスリクエストによって返されるオブジェクトに影響します。そのため、これらの API を利用するコードは、この変更に対応できるように調整が必要になる場合があります。
:::



## レート制限 {#rate-limits}

開発者は、1 つの組織につき最大 100 個まで API キーを作成できます。各 API キーは、10 秒間に最大 10 件までリクエストを送信できます。組織ごとに許可される API キー数や 10 秒間あたりのリクエスト数の上限を引き上げたい場合は、support@clickhouse.com までお問い合わせください。



## Terraform provider {#terraform-provider}

公式の ClickHouse Terraform Provider を使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)
を用いて、デプロイメント時のエラー発生を大幅に減らせる、予測可能でバージョン管理された構成を作成できます。

Terraform Provider のドキュメントは、[Terraform registry](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) で参照できます。

ClickHouse Terraform Provider にコントリビュートしたい場合は、[GitHub リポジトリ内のソースコード](https://github.com/ClickHouse/terraform-provider-clickhouse)を参照してください。

:::note 
ご利用の組織が[新しい料金プラン](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)のいずれかに移行済みの場合、[ClickHouse Terraform Provider](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs) のバージョン 2.0.0 以上を使用する必要があります。このアップグレードは、サービスの `tier` 属性の変更を処理するために必須です。料金プラン移行後は `tier` フィールドが受け付けられなくなり、その参照は削除する必要があります。

また、サービスリソースのプロパティとして `num_replicas` フィールドを指定できるようになります。
:::



## Terraform と OpenAPI の新料金: レプリカ設定の説明 {#terraform-and-openapi-new-pricing---replica-settings-explained}

各サービス作成時のデフォルトのレプリカ数は、Scale および Enterprise ティアでは 3、Basic ティアでは 1 です。
Scale および Enterprise ティアでは、サービス作成リクエストで `numReplicas` フィールドを指定することで、この値を調整できます。
`numReplicas` フィールドの値は、ウェアハウス内の最初のサービスについては 2 から 20 の範囲である必要があります。既存のウェアハウスに作成されるサービスについては、レプリカ数を 1 まで下げることができます。



## サポート {#support}

迅速にサポートを受けるには、まずは [Slack チャンネル](https://clickhouse.com/slack) をご利用いただくことをおすすめします。  
API とその機能について、さらにサポートが必要な場合や詳細情報を確認したい場合は、https://console.clickhouse.cloud/support から ClickHouse Support までお問い合わせください。
