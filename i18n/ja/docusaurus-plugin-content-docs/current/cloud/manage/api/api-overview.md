---
sidebar_label: 概要
sidebar_position: 1
---

# ClickHouse Cloud API

## 概要 {#overview}

ClickHouse Cloud APIは、開発者がClickHouse Cloud上で組織やサービスを簡単に管理できるように設計されたREST APIです。このCloud APIを使用すると、サービスの作成と管理、APIキーのプロビジョニング、組織内のメンバーの追加や削除などが可能です。

[最初のAPIキーを作成し、ClickHouse Cloud APIを使用する方法を学ぶ。](/cloud/manage/openapi.md)

## レート制限 {#rate-limits}

開発者は、組織ごとに100のAPIキーに制限されています。各APIキーには、10秒のウィンドウ内でのリクエスト数が10に制限されています。組織のAPIキーや10秒間のリクエスト数を増やしたい場合は、support@clickhouse.comまでお問い合わせください。

## Terraformプロバイダー {#terraform-provider}

公式のClickHouse Terraformプロバイダーを使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)を利用して、予測可能でバージョン管理された設定を作成し、デプロイメントでのエラーを大幅に減少させることができます。

Terraformプロバイダーのドキュメントは[Terraformレジストリ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)で確認できます。

ClickHouse Terraformプロバイダーに貢献したい場合は、[GitHubリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse)でソースコードを確認できます。

## Swagger (OpenAPI) エンドポイントとUI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud APIは、オープンソースの[OpenAPI仕様](https://www.openapis.org/)に基づいて構築されており、クライアント側の消費を予測可能にします。ClickHouse Cloud APIのドキュメントをプログラムmaticallyに消費する必要がある場合、https://api.clickhouse.cloud/v1を介してJSONベースのSwaggerエンドポイントを提供しています。当社のAPIリファレンスドキュメントは、そのエンドポイントから自動的に生成されています。Swagger UIを介してAPIドキュメントを消費したい場合は、[こちら](/cloud/manage/api/swagger)をクリックしてください。

## サポート {#support}

まずは[私たちのSlackチャンネル](https://clickhouse.com/slack)を訪れて、迅速なサポートを受けることをお勧めします。さらにヘルプが必要な場合やAPIの機能についての詳細情報が必要な場合は、https://console.clickhouse.cloud/supportまでClickHouseサポートにお問い合わせください。
