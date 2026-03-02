---
title: 'Azure プライベートプレビュー'
slug: /cloud/reference/byoc/onboarding/azure-private-preview
sidebar_label: 'Azure（プライベートプレビュー）'
keywords: ['BYOC', 'クラウド', '自前クラウド', 'azure']
description: 'Terraform モジュールとテナント間認証を使用して Azure 上で ClickHouse BYOC をオンボーディングする'
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

:::note
Azure での BYOC は現在、**プライベート プレビュー**です。参加を希望される場合は、[ClickHouse チームまでお問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。
:::


## 概要 \{#overview\}

Azure 上での BYOC を使用すると、自身の Azure サブスクリプション内で ClickHouse を実行できます。オンボーディングには Terraform モジュールを使用し、ClickHouse Cloud のプロビジョナーがお客様のテナントおよびサブスクリプション内に Azure リソースを作成・管理するために必要なテナント間認証をプロビジョニングします。

[アーキテクチャ](/cloud/reference/byoc/architecture)、[ネットワーク セキュリティ](/cloud/reference/byoc/reference/network_security)、[機能](/cloud/reference/byoc/overview#features)、[接続性](/cloud/reference/byoc/connect) など、デプロイメントの他の側面は概ね AWS および GCP の BYOC オファリングと同様です。詳細については、それらのページを参照してください。

## 前提条件 \{#prerequisites\}

- BYOC デプロイメントをホストする予定の Azure の **サブスクリプション** と **テナント**
- ClickHouse チームと共有するための **サブスクリプション ID** と **テナント ID**

## オンボーディング \{#onboarding\}

<VerticalStepper headerLevel="h3">

### 1. Terraform モジュールを適用する \{#apply-terraform-module\}

BYOC Azure のオンボーディングを開始するには、**対象テナントおよびサブスクリプション**で ClickHouse が提供する [Terraform module for Azure](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/azure) を適用します。

必要な変数と適用手順については、モジュールのドキュメントを参照してください。適用後、モジュールは Azure 環境に必要な ID と権限を設定します。

### 2. ClickHouse に ID を提供する \{#provide-ids\}

次の情報を ClickHouse チームと共有してください：

- **対象サブスクリプション ID** — BYOC リソースが作成される Azure サブスクリプション
- **対象テナント ID** — そのサブスクリプションを所有する Azure AD (Entra) テナント
- **リージョン** — ClickHouse サービスをデプロイしたい Azure リージョン（複数可）
- **VNet CIDR 範囲** — BYOC VNet に使用したい IP アドレス範囲

ClickHouse チームはこれらの情報を利用して BYOC のインフラストラクチャを作成し、オンボーディングを完了します。

</VerticalStepper>

### テナント間認証の仕組み \{#cross-tenant-auth\}

[Azure のテナント間認証に関するガイダンス](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)に従い、Terraform モジュールは次の処理を行います:

1. 対象テナント内に、**マルチテナント アプリケーション**を **エンタープライズ アプリケーション (Enterprise Application)**（サービス プリンシパル）としてプロビジョニングする
2. 対象サブスクリプションをスコープとして、そのアプリケーションに**必要な権限を付与する**

これにより、ClickHouse Cloud のコントロールプレーンは、Azure の認証情報を ClickHouse に保存することなく、お使いのサブスクリプション内で Azure リソース（リソース グループ、AKS、ストレージ、ネットワークなど）を作成および管理できるようになります。

Azure におけるマルチテナント アプリおよびテナント間シナリオの詳細については、次を参照してください:

- [Microsoft Entra ID におけるシングルテナント アプリとマルチテナント アプリ](https://learn.microsoft.com/en-us/entra/identity-platform/single-and-multi-tenant-apps)
- [テナント間アクセスの承認（Azure SignalR の例）](https://learn.microsoft.com/en-us/azure/azure-signalr/signalr-howto-authorize-cross-tenant)