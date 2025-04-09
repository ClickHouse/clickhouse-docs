---
sidebar_label: 概要
sidebar_position: 1
---


# ClickHouse Cloud API

## 概要 {#overview}

ClickHouse Cloud APIは、開発者がClickHouse Cloud上で組織やサービスを簡単に管理するためのREST APIです。このCloud APIを使用すると、サービスを作成および管理したり、APIキーを展開したり、組織のメンバーを追加または削除したりすることができます。

[最初のAPIキーを作成してClickHouse Cloud APIの使用を開始する方法を学びましょう。](/cloud/manage/openapi.md)

## レート制限 {#rate-limits}

開発者は、組織ごとに100のAPIキーに制限されています。各APIキーは、10秒ごとに10リクエストの制限があります。組織のAPIキーの数や10秒ごとのリクエスト数を増やしたい場合は、support@clickhouse.comまでお問い合わせください。

## Terraformプロバイダー {#terraform-provider}

公式のClickHouse Terraformプロバイダーを使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)を利用して、予測可能でバージョン管理された設定を作成し、デプロイメントのエラーを大幅に減らすことができます。

Terraformプロバイダーのドキュメントは[Terraformレジストリ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)で閲覧できます。

ClickHouse Terraformプロバイダーに貢献したい場合は、[GitHubリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse)でソースをご覧ください。

## Swagger (OpenAPI) エンドポイントとUI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud APIは、予測可能なクライアントサイド消費を可能にするためにオープンソースの[OpenAPI仕様](https://www.openapis.org/)に基づいて構築されています。ClickHouse Cloud APIドキュメントをプログラム的に利用する必要がある場合は、https://api.clickhouse.cloud/v1を介してJSONベースのSwaggerエンドポイントを提供しています。当社のAPIリファレンスドキュメントは、そのエンドポイントから自動的に生成されます。Swagger UIを介してAPIドキュメントを利用したい場合は、[こちらをクリック](https://clickhouse.com/docs/cloud/manage/api/swagger)してください。

## サポート {#support}

迅速なサポートを受けるためには、まず[私たちのSlackチャンネル](https://clickhouse.com/slack)を訪れることをお勧めします。APIおよびその機能について追加のヘルプや詳細な情報が必要な場合は、https://console.clickhouse.cloud/support のClickHouseサポートにお問い合わせください。
