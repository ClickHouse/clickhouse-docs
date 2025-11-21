---
slug: /cloud/guides/production-readiness
sidebar_label: '本番稼働準備'
title: 'ClickHouse Cloud 本番環境準備ガイド'
description: 'クイックスタート段階からエンタープライズ要件を満たす ClickHouse Cloud デプロイメントへ移行する組織向けガイド'
keywords: ['production readiness', 'enterprise', 'saml', 'sso', 'terraform', 'monitoring', 'backup', 'disaster recovery']
doc_type: 'guide'
---



# ClickHouse Cloud 本番環境準備ガイド {#production-readiness}

クイックスタートガイドを完了し、データが流入しているアクティブなサービスを運用している組織向け

:::note[要約]
本ガイドは、クイックスタートからエンタープライズレベルのClickHouse Cloudデプロイメントへの移行を支援します。以下について学習できます:

- 安全なテストのための開発/ステージング/本番環境の分離
- アイデンティティプロバイダーとのSAML/SSO認証統合
- TerraformまたはCloud APIを使用したデプロイメントの自動化
- 監視システムとアラートインフラストラクチャ(Prometheus、PagerDuty)の連携
- バックアップ手順の検証とディザスタリカバリプロセスのドキュメント化
  :::


## はじめに {#introduction}

ビジネスワークロードに対してClickHouse Cloudが正常に稼働しています。次に、コンプライアンス監査、テストされていないクエリによる本番インシデント、または企業システムとの統合を求めるIT要件などをきっかけとして、エンタープライズ本番環境の基準を満たすようにデプロイメントを成熟させる必要があります。

ClickHouse Cloudのマネージドプラットフォームは、インフラストラクチャ運用、自動スケーリング、システムメンテナンスを処理します。エンタープライズ本番環境への対応には、認証システム、監視インフラストラクチャ、自動化ツール、および事業継続プロセスを通じて、ClickHouse Cloudをより広範なIT環境に接続する必要があります。

エンタープライズ本番環境への対応における責任事項:

- 本番環境へのデプロイ前に安全なテストを行うための個別環境を構築する
- 既存のIDプロバイダーおよびアクセス管理システムと統合する
- 監視とアラートを運用インフラストラクチャに接続する
- 一貫した管理のためにInfrastructure as Codeの実践を導入する
- バックアップ検証とディザスタリカバリ手順を確立する
- コスト管理と請求統合を構成する

本ガイドでは、各領域について順を追って説明し、稼働中のClickHouse Cloudデプロイメントからエンタープライズ対応システムへの移行を支援します。


## 環境戦略 {#environment-strategy}

本番ワークロードに影響を与える前に変更を安全にテストするため、個別の環境を構築してください。ほとんどの本番インシデントは、テストされていないクエリや設定変更が本番システムに直接デプロイされたことに起因しています。

:::note
**ClickHouse Cloudでは、各環境は個別のサービスです。**組織内で本番、ステージング、開発の各サービスを個別にプロビジョニングし、それぞれが独自のコンピュートリソース、ストレージ、エンドポイントを持ちます。
:::

**環境構成**: 本番環境(実稼働ワークロード)、ステージング環境(本番相当の検証)、開発環境(個人/チームの実験)を維持してください。

**テスト**: 本番デプロイ前にステージング環境でクエリをテストしてください。小規模なデータセットで動作するクエリでも、本番規模ではメモリ枯渇、過剰なCPU使用、実行速度の低下を引き起こすことがよくあります。ユーザー権限、クォータ、サービス設定を含む設定変更をステージング環境で検証してください。本番環境で発見された設定エラーは、即座に運用インシデントを引き起こします。

**サイジング**: ステージングサービスのサイズを本番環境の負荷特性に近づけてください。大幅に小規模なインフラストラクチャでテストすると、リソース競合やスケーリングの問題が明らかにならない可能性があります。定期的なデータ更新または合成データ生成を通じて、本番環境を代表するデータセットを使用してください。ステージング環境のサイジング方法とサービスの適切なスケーリングに関するガイダンスについては、[サイジングとハードウェア推奨事項](/guides/sizing-and-hardware-recommendations)および[ClickHouse Cloudでのスケーリング](/manage/scaling)のドキュメントを参照してください。これらのリソースは、メモリ、CPU、ストレージのサイジングに関する実践的なアドバイスと、ステージング環境を本番ワークロードに合わせるための垂直および水平スケーリングオプションの詳細を提供します。


## プライベートネットワーキング {#private-networking}

ClickHouse Cloudの[プライベートネットワーキング](/cloud/security/connectivity/private-networking)を使用すると、ClickHouseサービスをクラウド仮想ネットワークに直接接続でき、データがパブリックインターネットを経由しないことが保証されます。これは、厳格なセキュリティやコンプライアンス要件を持つ組織、またはプライベートサブネット内でアプリケーションを実行している組織にとって不可欠です。

ClickHouse Cloudは、以下の方式でプライベートネットワーキングをサポートしています:

- [AWS PrivateLink](/manage/security/aws-privatelink): トラフィックをパブリックインターネットに公開することなく、VPCとClickHouse Cloud間の安全な接続を実現します。リージョン間接続をサポートし、ScaleプランおよびEnterpriseプランで利用可能です。セットアップには、PrivateLinkエンドポイントの作成と、ClickHouse Cloudの組織およびサービス許可リストへの追加が含まれます。詳細および手順については、ドキュメントをご覧ください。
- [GCP Private Service Connect](/manage/security/gcp-private-service-connect) (PSC): Google Cloud VPCからClickHouse Cloudへのプライベートアクセスを可能にします。AWSと同様に、ScaleプランおよびEnterpriseプランで利用可能であり、サービスエンドポイントと許可リストの明示的な設定が必要です。
- [Azure Private Link](/cloud/security/azure-privatelink): Azure VNetとClickHouse Cloud間のプライベート接続を提供し、リージョン間接続をサポートします。セットアッププロセスには、接続エイリアスの取得、プライベートエンドポイントの作成、および許可リストの更新が含まれます。

より詳細な技術情報や段階的なセットアップ手順が必要な場合は、各プロバイダーのドキュメントに包括的なガイドが記載されています。


## エンタープライズ認証とユーザー管理 {#enterprise-authentication}

本番環境への対応には、コンソールベースのユーザー管理からエンタープライズ認証統合への移行が不可欠です。

### SSOとソーシャル認証 {#sso-authentication}

[SAML SSO](/cloud/security/saml-setup): エンタープライズ層のClickHouse CloudはOkta、Azure Active Directory、Google WorkspaceなどのアイデンティティプロバイダーとのSAML統合をサポートしています。SAML設定にはClickHouseサポートとの調整が必要であり、IdPメタデータの提供と属性マッピングの設定が含まれます。

[ソーシャルSSO](/cloud/security/manage-my-account): ClickHouse CloudはSAML SSOと同等に安全な代替手段として、ソーシャル認証プロバイダー(Google、Microsoft、GitHub)もサポートしています。ソーシャルSSOは、既存のSAMLインフラストラクチャを持たない組織に対して、エンタープライズセキュリティ基準を維持しながら、より迅速なセットアップを提供します。

:::note 重要な制限事項
SAMLまたはソーシャルSSOで認証されたユーザーには、デフォルトで「Member」ロールが割り当てられ、初回ログイン後に管理者が手動で追加のロールを付与する必要があります。グループからロールへのマッピングと自動ロール割り当ては現在サポートされていません。
:::

### アクセス制御設計 {#access-control-design}

ClickHouse Cloudは組織レベルのロール(Admin、Developer、Billing、Member)とサービス/データベースレベルのロール(Service Admin、Read Only、SQLコンソールロール)を使用します。最小権限の原則を適用し、職務機能に基づいてロールを設計してください:

- **アプリケーションユーザー**: 特定のデータベースとテーブルへのアクセス権を持つサービスアカウント
- **アナリストユーザー**: キュレーションされたデータセットとレポートビューへの読み取り専用アクセス
- **管理者ユーザー**: 完全な管理機能

異なるユーザーとロールのリソース使用量を管理するために、クォータ、制限、設定プロファイルを構成してください。個々のクエリがシステムパフォーマンスに影響を与えないように、メモリと実行時間の制限を設定してください。監査ログ、セッションログ、クエリログを通じてリソース使用量を監視し、頻繁に制限に達するユーザーやアプリケーションを特定してください。ClickHouse Cloudの監査機能を使用して定期的なアクセスレビューを実施してください。

### ユーザーライフサイクル管理の制限事項 {#user-lifecycle-management}

ClickHouse Cloudは現在、SCIMまたはアイデンティティプロバイダーを介した自動プロビジョニング/デプロビジョニングをサポートしていません。IdPから削除された後、ユーザーはClickHouse Cloudコンソールから手動で削除する必要があります。これらの機能が利用可能になるまで、手動のユーザー管理プロセスを計画してください。

[クラウドアクセス管理](/cloud/security/cloud_access_management)と[SAML SSOセットアップ](/cloud/security/saml-setup)の詳細をご覧ください。


## Infrastructure as codeと自動化 {#infrastructure-as-code}

Infrastructure as codeの実践とAPI自動化によってClickHouse Cloudを管理することで、デプロイメント構成の一貫性、バージョン管理、再現性を確保できます。

### Terraform Provider {#terraform-provider}

ClickHouse Cloudコンソールで作成したAPIキーを使用して、ClickHouse Terraform providerを設定します:

```terraform
terraform {
  required_providers {
    clickhouse = {
      source  = "ClickHouse/clickhouse"
      version = "~> 2.0"
    }
  }
}

provider "clickhouse" {
  environment     = "production"
  organization_id = var.organization_id
  token_key       = var.token_key
  token_secret    = var.token_secret
}
```

Terraform providerは、サービスのプロビジョニング、IPアクセスリスト、ユーザー管理をサポートしています。なお、現在このproviderは既存サービスのインポートや明示的なバックアップ設定には対応していません。providerでカバーされていない機能については、コンソールから管理するか、ClickHouseサポートにお問い合わせください。

サービス設定とネットワークアクセス制御を含む包括的な例については、[Cloud APIの使用方法に関するTerraformの例](/knowledgebase/terraform_example)を参照してください。

### Cloud API統合 {#cloud-api-integration}

既存の自動化フレームワークを持つ組織は、Cloud APIを通じてClickHouse Cloud管理を直接統合できます。このAPIは、サービスライフサイクル管理、ユーザー管理、バックアップ操作、監視データ取得へのプログラマティックなアクセスを提供します。

一般的なAPI統合パターン:

- 社内チケットシステムと統合されたカスタムプロビジョニングワークフロー
- アプリケーションデプロイメントスケジュールに基づく自動スケーリング調整
- コンプライアンスワークフローのためのプログラマティックなバックアップ検証とレポート作成
- 既存のインフラストラクチャ管理プラットフォームとの統合

API認証は、Terraformと同じトークンベースのアプローチを使用します。完全なAPIリファレンスと統合例については、[ClickHouse Cloud API](/cloud/manage/api/api-overview)ドキュメントを参照してください。


## 監視と運用統合 {#monitoring-integration}

ClickHouse Cloudを既存の監視インフラストラクチャに接続することで、可視性の確保と問題の事前検知が可能になります。

### 組み込み監視 {#built-in-monitoring}

ClickHouse Cloudは、秒間クエリ数、メモリ使用量、CPU使用量、ストレージレートなどのリアルタイムメトリクスを含む高度なダッシュボードを提供します。Cloudコンソールの「Monitoring」→「Advanced dashboard」からアクセスできます。特定のワークロードパターンやチームのリソース消費に合わせてカスタマイズしたダッシュボードを作成できます。

:::note 本番環境における一般的なギャップ
エンタープライズインシデント管理システムとのプロアクティブなアラート統合および自動コスト監視の欠如。組み込みダッシュボードは可視性を提供しますが、自動アラートには外部統合が必要です。
:::

### 本番環境のアラート設定 {#production-alerting}

**組み込み機能**: ClickHouse Cloudは、請求イベント、スケーリングイベント、サービスヘルスに関する通知をメール、UI、Slackを介して提供します。コンソールの通知設定から配信チャネルと通知の重要度を設定できます。

**エンタープライズ統合**: 高度なアラート機能(PagerDuty、カスタムwebhook)については、Prometheusエンドポイントを使用して既存の監視インフラストラクチャにメトリクスをエクスポートします:

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets:
          ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

Prometheus/Grafanaの詳細な設定と高度なアラート機能を含む包括的なセットアップについては、[ClickHouse Cloud可観測性ガイド](/use-cases/observability/cloud-monitoring#prometheus)を参照してください。


## 事業継続性とサポート統合 {#business-continuity}

バックアップ検証手順とサポート統合を確立することで、ClickHouse Cloudデプロイメントがインシデントから復旧し、必要な時にサポートを受けられることを保証します。

### バックアップ戦略の評価 {#backup-strategy}

ClickHouse Cloudは、保持期間を設定可能な自動バックアップを提供します。現在のバックアップ設定がコンプライアンスおよび復旧要件を満たしているか評価してください。バックアップの保存場所や暗号化に関する特定のコンプライアンス要件を持つエンタープライズ顧客は、ClickHouse Cloudを設定して自社のクラウドストレージバケット(BYOB)にバックアップを保存できます。BYOB設定についてはClickHouseサポートにお問い合わせください。

### 復旧手順の検証とテスト {#validate-test-recovery}

多くの組織は、実際の復旧シナリオでバックアップの不備を発見します。インシデントが発生する前にバックアップの整合性を検証し、復旧手順をテストするための定期的な検証サイクルを確立してください。非本番環境への定期的なテスト復元をスケジュールし、時間見積もりを含むステップバイステップの復旧手順を文書化し、復元されたデータの完全性とアプリケーション機能を検証し、さまざまな障害シナリオ(サービス削除、データ破損、リージョン障害)で復旧手順をテストしてください。オンコールチームがアクセスできる最新の復旧ランブックを維持してください。

重要な本番サービスについては、少なくとも四半期ごとにバックアップ復元をテストしてください。厳格なコンプライアンス要件を持つ組織では、月次または週次の検証サイクルが必要になる場合があります。

### 災害復旧計画 {#disaster-recovery-planning}

目標復旧時間(RTO)と目標復旧時点(RPO)を文書化し、現在のバックアップ設定が事業要件を満たしていることを検証してください。バックアップ復元の定期的なテストスケジュールを確立し、最新の復旧ドキュメントを維持してください。

**リージョン間バックアップストレージ**: 地理的な災害復旧要件を持つ組織は、ClickHouse Cloudを設定して、代替リージョンの顧客所有ストレージバケットにバックアップをエクスポートできます。これによりリージョン障害に対する保護が提供されますが、手動の復元手順が必要です。リージョン間バックアップエクスポートを実装するには、ClickHouseサポートにお問い合わせください。将来のプラットフォームリリースでは、自動化されたマルチリージョンレプリケーション機能が提供される予定です。

### 本番サポート統合 {#production-support}

現在のサポート階層のSLA期待値とエスカレーション手順を理解してください。ClickHouseサポートに連絡するタイミングを定義した内部ランブックを作成し、これらの手順を既存のインシデント管理プロセスに統合してください。

[ClickHouse Cloudのバックアップと復旧](/cloud/manage/backups/overview)および[サポートサービス](/about-us/support)の詳細をご覧ください。


## 次のステップ {#next-steps}

本ガイドの統合と手順を実装した後は、[Cloudリソースツアー](/cloud/get-started/cloud/resource-tour)にアクセスして、[監視](/cloud/get-started/cloud/resource-tour#monitoring)、[セキュリティ](/cloud/get-started/cloud/resource-tour#security)、[コスト最適化](/cloud/get-started/cloud/resource-tour#cost-optimization)に関するガイドをご確認ください。

現在の[サービスティアの制限](/cloud/manage/cloud-tiers)が本番環境の運用に影響を与える場合は、[プライベートネットワーキング](/cloud/security/connectivity/private-networking)、[TDE/CMEK](/cloud/security/cmek)(顧客管理暗号化キーによる透過的データ暗号化)、または[高度なバックアップオプション](/cloud/manage/backups/configurable-backups)などの拡張機能を提供するアップグレードパスをご検討ください。
