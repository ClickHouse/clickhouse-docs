---
sidebar_label: '概要'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: /cloud/manage/api/api-overview
description: 'ClickHouse Cloud APIについて学ぶ'
---


# ClickHouse Cloud API

## 概要 {#overview}

ClickHouse Cloud APIは、開発者がClickHouse Cloud上で組織やサービスを簡単に管理できるように設計されたREST APIです。このCloud APIを使用すると、サービスの作成や管理、APIキーのプロビジョニング、組織のメンバーの追加または削除などを行うことができます。

[最初のAPIキーを作成し、ClickHouse Cloud APIを使用し始める方法を学びましょう。](/cloud/manage/openapi.md)

## Swagger (OpenAPI) エンドポイントとUI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud APIは、クライアント側での予測可能な利用を可能にするために、オープンソースの[OpenAPI仕様](https://www.openapis.org/)に基づいて構築されています。プログラム的にClickHouse Cloud APIドキュメントを利用する必要がある場合は、https://api.clickhouse.cloud/v1 からJSONベースのSwaggerエンドポイントを提供しています。また、[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger)を通じてAPIドキュメントを見つけることもできます。

## レート制限 {#rate-limits}

開発者は、組織ごとに100のAPIキーに制限されています。各APIキーには、10秒間に10リクエストの制限があります。組織のAPIキーまたは10秒間のリクエスト数を増やしたい場合は、support@clickhouse.comまでお問い合わせください。

## Terraformプロバイダー {#terraform-provider}

公式のClickHouse Terraformプロバイダーを使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)を活用して、予測可能でバージョン管理された構成を作成し、デプロイメントのエラーを大幅に減らすことができます。

Terraformプロバイダーのドキュメントは、[Terraformレジストリ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)で確認できます。

ClickHouse Terraformプロバイダーに貢献したい場合は、[GitHubリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse)でソースを見ることができます。

## サポート {#support}

迅速なサポートを受けるには、まず[私たちのSlackチャンネル](https://clickhouse.com/slack)を訪れることをお勧めします。APIやその機能についてさらに支援が必要な場合は、https://console.clickhouse.cloud/support でClickHouseサポートまでお問い合わせください。
