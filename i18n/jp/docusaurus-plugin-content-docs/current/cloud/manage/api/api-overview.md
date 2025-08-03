---
sidebar_label: '概要'
sidebar_position: 1
title: 'ClickHouse Cloud API'
slug: '/cloud/manage/api/api-overview'
description: 'ClickHouse Cloud APIについて学ぶ'
---




# ClickHouse Cloud API

## 概要 {#overview}

ClickHouse Cloud APIは、開発者がClickHouse Cloud上で組織やサービスを簡単に管理するためのREST APIです。このCloud APIを使用すると、サービスの作成と管理、APIキーのプロビジョニング、組織内のメンバーの追加または削除などが可能です。

[最初のAPIキーを作成し、ClickHouse Cloud APIの使用を開始する方法を学びましょう。](/cloud/manage/openapi.md)

## Swagger (OpenAPI) エンドポイントとUI {#swagger-openapi-endpoint-and-ui}

ClickHouse Cloud APIは、オープンソースの[OpenAPI仕様](https://www.openapis.org/)に基づいて構築されており、クライアント側での消費を予測可能にします。プログラムでClickHouse Cloud APIドキュメントを利用する必要がある場合、https://api.clickhouse.cloud/v1経由でJSONベースのSwaggerエンドポイントを提供しています。また、[Swagger UI](https://clickhouse.com/docs/cloud/manage/api/swagger)を通じてAPIドキュメントも見つけることができます。

## レート制限 {#rate-limits}

開発者は、組織ごとに100のAPIキーに制限されています。各APIキーには、10秒間のウィンドウ内で10リクエストの制限があります。組織のAPIキーや10秒間のウィンドウ内でのリクエスト数を増やしたい場合は、support@clickhouse.comまでお問い合わせください。

## Terraformプロバイダー {#terraform-provider}

公式のClickHouse Terraformプロバイダーを使用すると、[Infrastructure as Code](https://www.redhat.com/en/topics/automation/what-is-infrastructure-as-code-iac)を利用して、予測可能でバージョン管理された構成を作成し、デプロイメントのエラーを大幅に減らすことができます。

Terraformプロバイダーのドキュメントは、[Terraformレジストリ](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs)で確認できます。

ClickHouse Terraformプロバイダーに貢献したい場合は、[GitHubリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse)でソースを確認できます。

## サポート {#support}

迅速なサポートを得るために、まず[私たちのSlackチャンネル](https://clickhouse.com/slack)を訪れることをお勧めします。APIおよびその機能についての追加のヘルプや詳細が必要な場合は、https://console.clickhouse.cloud/supportでClickHouseサポートにお問い合わせください。
