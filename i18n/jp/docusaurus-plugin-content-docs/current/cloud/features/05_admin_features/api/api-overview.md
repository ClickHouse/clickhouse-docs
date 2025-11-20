---
sidebar_label: '概要'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'ClickHouse Cloud API について'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'API 概要', 'クラウド API', 'REST API', 'プログラムによるアクセス']
---



# ClickHouse Cloud API



## 概要 {#overview}

ClickHouse Cloud APIは、開発者がClickHouse Cloud上の組織とサービスを簡単に管理できるように設計されたREST APIです。Cloud APIを使用することで、サービスの作成と管理、APIキーのプロビジョニング、組織内のメンバーの追加や削除などが可能です。

[最初のAPIキーを作成し、ClickHouse Cloud APIの使用を開始する方法について説明します。](/cloud/manage/openapi)


## Swagger (OpenAPI) エンドポイントとUI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud APIは、クライアント側での予測可能な利用を実現するため、オープンソースの[OpenAPI仕様](https://www.openapis.org/)に基づいて構築されています。ClickHouse Cloud APIドキュメントをプログラムで利用する必要がある場合は、https://api.clickhouse.cloud/v1 経由でJSONベースのSwaggerエンドポイントを提供しています。また、[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger)からAPIドキュメントを参照することもできます。

:::note
組織が[新しい料金プラン](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)のいずれかに移行済みで、OpenAPIを使用している場合、サービス作成の`POST`リクエストから`tier`フィールドを削除する必要があります。

サービス階層が廃止されたため、`tier`フィールドはサービスオブジェクトから削除されました。  
これにより、`POST`、`GET`、`PATCH`サービスリクエストが返すオブジェクトに影響が生じます。そのため、これらのAPIを利用するコードは、この変更に対応するための調整が必要になる場合があります。
:::


## レート制限 {#rate-limits}

開発者は組織ごとに100個のAPIキーまで作成できます。各APIキーには10秒間で10リクエストの制限があります。組織のAPIキー数または10秒間あたりのリクエスト数の上限を引き上げたい場合は、support@clickhouse.comまでお問い合わせください。


## Terraformプロバイダー {#terraform-provider}

公式のClickHouse Terraformプロバイダーを使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)を活用して、予測可能でバージョン管理された構成を作成し、デプロイメント時のエラーを大幅に削減できます。

Terraformプロバイダーのドキュメントは[Terraformレジストリ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)で確認できます。

ClickHouse Terraformプロバイダーへの貢献をご希望の場合は、[GitHubリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse)でソースコードを確認できます。

:::note
組織が[新しい料金プラン](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)のいずれかに移行された場合、[ClickHouse Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)のバージョン2.0.0以上を使用する必要があります。このアップグレードは、サービスの`tier`属性の変更に対応するために必要です。料金プランの移行後、`tier`フィールドは受け付けられなくなるため、これへの参照は削除する必要があります。

また、サービスリソースのプロパティとして`num_replicas`フィールドを指定できるようになります。
:::


## TerraformとOpenAPIの新価格体系：レプリカ設定の説明 {#terraform-and-openapi-new-pricing---replica-settings-explained}

各サービスが作成される際のレプリカ数は、ScaleおよびEnterpriseティアではデフォルトで3、Basicティアではデフォルトで1に設定されます。
ScaleおよびEnterpriseティアでは、サービス作成リクエストに`numReplicas`フィールドを指定することで、この値を調整できます。
`numReplicas`フィールドの値は、ウェアハウス内の最初のサービスでは2から20の範囲で指定する必要があります。既存のウェアハウスに作成されるサービスでは、レプリカ数を1まで減らすことができます。


## サポート {#support}

迅速なサポートを受けるには、まず[Slackチャンネル](https://clickhouse.com/slack)へのアクセスをお勧めします。APIとその機能に関する追加のヘルプや詳細情報が必要な場合は、https://console.clickhouse.cloud/support からClickHouseサポートまでお問い合わせください
