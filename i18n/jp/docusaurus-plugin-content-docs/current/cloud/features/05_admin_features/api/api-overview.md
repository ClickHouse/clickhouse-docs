---
'sidebar_label': '概要'
'sidebar_position': 1
'title': 'ClickHouse Cloud API'
'slug': '/cloud/manage/api/api-overview'
'description': 'ClickHouse Cloud APIについて学ぶ'
'doc_type': 'reference'
---



# ClickHouse Cloud API

## 概要 {#overview}

ClickHouse Cloud APIは、開発者がClickHouse Cloud上で組織やサービスを簡単に管理できるように設計されたREST APIです。このCloud APIを使用することで、サービスの作成と管理、APIキーのプロビジョニング、組織内のメンバーの追加および削除などを行うことができます。

[最初のAPIキーを作成してClickHouse Cloud APIを使用する方法を学びましょう。](/cloud/manage/openapi)

## Swagger (OpenAPI) エンドポイントとUI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud APIは、予測可能なクライアント側での消費を可能にするために、オープンソースの[OpenAPI仕様](https://www.openapis.org/)に基づいて構築されています。ClickHouse Cloud APIドキュメントをプログラムで消費する必要がある場合は、https://api.clickhouse.cloud/v1 経由でJSONベースのSwaggerエンドポイントを提供しています。また、[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger)を通じてAPIドキュメントも確認できます。

:::note 
あなたの組織が[新しい料金プラン](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)に移行している場合、OpenAPIを使用する際には、サービス作成の`POST`リクエストから`tier`フィールドを削除する必要があります。

`tier`フィールドはもはやサービスの階層がないため、サービスオブジェクトから削除されました。  
これは、`POST`、`GET`、および`PATCH`サービスリクエストによって返されるオブジェクトに影響します。したがって、これらのAPIを消費するコードは、これらの変更に対応するように調整が必要となる場合があります。
:::

## レート制限 {#rate-limits}

開発者は1組織あたり100のAPIキーに制限されています。各APIキーは、10秒間で10回のリクエスト制限があります。組織のAPIキーや10秒間のリクエスト数を増やしたい場合は、support@clickhouse.comまでお問い合わせください。

## Terraformプロバイダー {#terraform-provider}

公式のClickHouse Terraformプロバイダーを使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac) を利用して、予測可能でバージョン管理された設定を作成し、デプロイメントをよりエラーが少ないものにすることができます。

Terraformプロバイダーのドキュメントは、[Terraformレジストリ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)で確認できます。

ClickHouse Terraformプロバイダーに貢献したい場合は、[GitHubリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse)でソースを確認できます。

:::note 
あなたの組織が[新しい料金プラン](https://clickhouse.com/pricing?plan=scale&provider=aws&region=us-east-1&hours=8&storageCompressed=false)に移行している場合、サービスの`tier`属性の変更を処理するために、バージョン2.0.0以上の[ClickHouse Terraformプロバイダー](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)を使用する必要があります。このアップグレードは、料金移行後に`tier`フィールドが受け入れられず、それに対する参照を削除する必要があるためです。

また、サービスリソースのプロパティとして`num_replicas`フィールドを指定できるようになります。
:::

## TerraformとOpenAPIの新しい料金：レプリカ設定の説明 {#terraform-and-openapi-new-pricing---replica-settings-explained}

各サービスに作成されるレプリカの数は、ScaleおよびEnterprise階層ではデフォルトで3、Basic階層ではデフォルトで1です。ScaleおよびEnterprise階層では、サービス作成リクエストに`numReplicas`フィールドを渡すことで調整可能です。  
`numReplicas`フィールドの値は、倉庫内の最初のサービスに対して2以上20以下でなければなりません。既存の倉庫内で作成されたサービスは、最低1のレプリカを持つことができます。

## サポート {#support}

迅速なサポートを受けるには、まず[私たちのSlackチャンネル](https://clickhouse.com/slack)を訪れることをお勧めします。追加のヘルプやAPIの機能に関する情報が必要な場合は、https://console.clickhouse.cloud/support にてClickHouseサポートにお問い合わせください。
