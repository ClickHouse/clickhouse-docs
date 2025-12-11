---
slug: /cloud/guides/production-readiness
sidebar_label: '本番運用準備'
title: 'ClickHouse Cloud 本番運用準備ガイド'
description: 'クイックスタートからエンタープライズ対応の ClickHouse Cloud 本番デプロイメントへ移行する組織向けのガイド'
keywords: ['本番運用準備', 'エンタープライズ', 'saml', 'sso', 'terraform', '監視', 'バックアップ', 'ディザスタリカバリ']
doc_type: 'guide'
---

# ClickHouse Cloud 本番運用準備ガイド {#production-readiness}

クイックスタートガイドを完了し、データが流れているアクティブなサービスをすでに運用している組織向けです。

:::note[要約]
このガイドは、クイックスタートからエンタープライズレベルの ClickHouse Cloud デプロイメントへ移行する際に役立ちます。次のことを学びます。

- 安全なテストのために、開発・ステージング・本番環境を分離して構築する
- アイデンティティプロバイダーと SAML/SSO 認証を統合する
- Terraform または Cloud API を用いてデプロイメントを自動化する
- 監視をアラート基盤（Prometheus や PagerDuty）と連携させる
- バックアップ手順を検証し、災害復旧プロセスを文書化する
:::

## はじめに {#introduction}

ビジネス向けワークロードのために ClickHouse Cloud を本番環境で問題なく稼働させているとします。次の段階として、コンプライアンス監査の実施、テストされていないクエリが原因の本番インシデント、あるいは企業システムとの統合に関する IT 要件などをきっかけに、エンタープライズ本番環境の標準を満たすようにデプロイメントを成熟させる必要があります。

ClickHouse Cloud のマネージドプラットフォームは、インフラ運用、自動スケーリング、システムメンテナンスを担います。エンタープライズ本番環境としての備えを整えるには、認証システム、監視インフラ、自動化ツール、事業継続プロセスを通じて、ClickHouse Cloud をより広範な IT 環境に接続する必要があります。

エンタープライズ本番対応におけるあなたの責務は次のとおりです:
- 本番デプロイメント前に安全なテストを行うための、分離された環境を構築する
- 既存のアイデンティティプロバイダーおよびアクセス管理システムと統合する
- 監視およびアラートを運用インフラと連携させる
- 一貫した管理のために Infrastructure as Code（IaC）のプラクティスを実装する
- バックアップ検証およびディザスタリカバリ手順を確立する
- コスト管理および請求システムとの連携を構成する

本ガイドでは、これら各分野について順を追って解説し、稼働中の ClickHouse Cloud デプロイメントをエンタープライズ対応システムへ移行するのを支援します。

## 環境戦略 {#environment-strategy}

本番ワークロードに影響を与える前に、安全に変更をテストできるよう、環境を分離して用意します。多くの本番インシデントは、テストされていないクエリや構成変更を本番システムに直接デプロイしたことに起因します。

:::note
**ClickHouse Cloud では、各環境は個別のサービスです。** 組織内で本番、ステージング、開発の各サービスを個別にプロビジョニングし、それぞれに専用のコンピュートリソース、ストレージ、エンドポイントを割り当てます。
:::

**環境構成**: 本番（実際のワークロード）、ステージング（本番相当の検証）、開発（個人/チームによる検証・実験用）環境を維持します。

**テスト**: 本番環境へデプロイする前に、クエリはステージング環境でテストします。小さなデータセット上で正常に動作するクエリでも、本番規模になるとメモリ枯渇、過度な CPU 使用率、実行の遅延を引き起こすことがよくあります。ユーザー権限、クォータ、サービス設定などの構成変更もステージングで検証してください。本番で構成エラーが見つかると、即座に運用インシデントにつながります。

**サイズ設定**: ステージングサービスは、本番の負荷特性に近づけるように規模を見積もります。著しく小さいインフラでテストしても、リソース競合やスケーリングの問題が顕在化しない可能性があります。定期的なデータリフレッシュや合成データ生成を通じて、本番を代表するデータセットを使用してください。ステージング環境のサイズ決定やサービスを適切にスケールさせる方法については、[サイズとハードウェアの推奨事項](/guides/sizing-and-hardware-recommendations) および [Scaling in ClickHouse Cloud](/manage/scaling) のドキュメントを参照してください。これらの資料では、メモリ、CPU、ストレージのサイズ決定に関する実践的なアドバイスや、垂直スケーリングおよび水平スケーリングの選択肢の詳細を提供しており、ステージング環境を本番ワークロードに適合させる際の助けになります。

## プライベートネットワーキング {#private-networking}

ClickHouse Cloud の[プライベートネットワーキング](/cloud/security/connectivity/private-networking)を使用すると、ClickHouse サービスをクラウドの仮想ネットワークに直接接続でき、データがパブリックインターネットを経由しないようにできます。これは、厳格なセキュリティやコンプライアンス要件を持つ組織や、プライベートサブネットでアプリケーションを実行している組織にとって不可欠です。

ClickHouse Cloud は、次の方法でプライベートネットワーキングをサポートしています。

- [AWS PrivateLink](/manage/security/aws-privatelink): VPC と ClickHouse Cloud 間で、トラフィックをパブリックインターネットにさらすことなく安全な接続を実現します。リージョンをまたぐ接続をサポートしており、Scale プランおよび Enterprise プランで利用可能です。セットアップには PrivateLink エンドポイントの作成と、それを ClickHouse Cloud の組織およびサービスの許可リストに追加する作業が含まれます。詳細や手順については、こちらのドキュメントを参照してください。
- [GCP Private Service Connect](/manage/security/gcp-private-service-connect) (PSC): Google Cloud VPC から ClickHouse Cloud へのプライベートアクセスを可能にします。AWS の場合と同様に、Scale プランおよび Enterprise プランで利用可能であり、サービスエンドポイントおよび許可リストを明示的に構成する必要があります。詳細は、こちらのドキュメントを参照してください。
- [Azure Private Link](/cloud/security/azure-privatelink): Azure VNet と ClickHouse Cloud 間でプライベート接続を提供し、リージョンをまたぐ接続をサポートします。セットアッププロセスには、接続エイリアスの取得、プライベートエンドポイントの作成、および許可リストの更新が含まれます。詳細は、こちらのドキュメントを参照してください。

より技術的な詳細やステップバイステップのセットアップ手順が必要な場合は、各プロバイダー向けにリンクされているドキュメントに包括的なガイドが記載されています。

## エンタープライズ認証とユーザー管理 {#enterprise-authentication}

コンソールベースのユーザー管理からエンタープライズ認証との統合に移行することは、本番運用に向けた準備として不可欠です。

### SSO とソーシャル認証 {#sso-authentication}

[SAML SSO](/cloud/security/saml-setup): Enterprise ティアの ClickHouse Cloud は、Okta、Azure Active Directory、Google Workspace などの IdP（アイデンティティプロバイダ）との SAML 連携をサポートします。SAML の設定には ClickHouse サポートとの調整が必要であり、IdP メタデータの提供と属性マッピングの設定が含まれます。

[ソーシャル SSO](/cloud/security/manage-my-account): ClickHouse Cloud は、SAML SSO と同等のセキュリティを備えた代替手段として、ソーシャル認証プロバイダ（Google、Microsoft、GitHub）もサポートします。ソーシャル SSO により、既存の SAML 基盤を持たない組織でも、エンタープライズレベルのセキュリティ標準を維持しつつ、より迅速にセットアップできます。

:::note 重要な制約
SAML またはソーシャル SSO を通じて認証されたユーザーには、デフォルトで "Member" ロールが割り当てられ、初回ログイン後に管理者が手動で追加ロールを付与する必要があります。グループからロールへのマッピングやロールの自動割り当ては、現時点ではサポートされていません。
:::

### アクセス制御設計 {#access-control-design}

ClickHouse Cloud では、組織レベルのロール（Admin、Developer、Billing、Member）と、サービス／データベースレベルのロール（Service Admin、Read Only、SQL コンソールのロール）を使用します。職務に基づいてロールを設計し、最小権限の原則を適用します。

- **アプリケーションユーザー**: 特定のデータベースおよびテーブルへのアクセスを持つサービスアカウント
- **アナリストユーザー**: キュレーションされたデータセットおよびレポーティングビューへの読み取り専用アクセス
- **管理者ユーザー**: すべての管理機能へのフルアクセス

クォータ、制限、設定プロファイルを構成し、ユーザーやロールごとのリソース使用を管理します。メモリと実行時間の制限を設定して、個々のクエリがシステムパフォーマンスに影響を与えることを防止します。監査ログ、セッションログ、クエリログを利用してリソース使用状況を監視し、頻繁に制限に達するユーザーやアプリケーションを特定します。ClickHouse Cloud の監査機能を用いて、定期的にアクセスレビューを実施します。

### ユーザーライフサイクル管理の制約 {#user-lifecycle-management}

ClickHouse Cloud は現在、SCIM や IdP を介した自動プロビジョニング／削除をサポートしていません。IdP からユーザーを削除した後は、ClickHouse Cloud コンソールからも手動でユーザーを削除する必要があります。これらの機能が利用可能になるまで、手動によるユーザー管理プロセスを計画してください。

[Cloud Access Management](/cloud/security/cloud_access_management) および [SAML SSO のセットアップ](/cloud/security/saml-setup) について、詳しくはそれぞれのドキュメントを参照してください。

## Infrastructure as Code と自動化 {#infrastructure-as-code}

Infrastructure as Code（IaC）のプラクティスと API による自動化で ClickHouse Cloud を管理すると、デプロイメント構成に一貫性、バージョン管理、再現性を持たせることができます。

### Terraform Provider {#terraform-provider}

ClickHouse Cloud コンソールで作成した API キーを使用して、ClickHouse 用 Terraform プロバイダーを設定します。

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

Terraform プロバイダーは、サービスのプロビジョニング、IP アクセスリスト、およびユーザー管理をサポートしています。なお、このプロバイダーは現時点では既存サービスのインポートや、バックアップ設定の明示的な構成をサポートしていません。プロバイダーでカバーされない機能については、コンソールから管理するか、ClickHouse サポートにお問い合わせください。

サービス構成やネットワークアクセス制御を含む包括的な例については、[Cloud API の利用方法に関する Terraform のサンプル](/knowledgebase/terraform_example) を参照してください。

### Cloud API 連携 {#cloud-api-integration}

既存の自動化フレームワークを持つ組織は、Cloud API を通じて ClickHouse Cloud の管理を直接統合できます。API は、サービスのライフサイクル管理、ユーザー管理、バックアップ操作、および監視データの取得に対するプログラムによるアクセスを提供します。

一般的な API 連携パターンは次のとおりです。

* 社内チケッティングシステムと統合されたカスタムプロビジョニングワークフロー
* アプリケーションのデプロイメントスケジュールに基づく自動スケーリング調整
* コンプライアンスワークフロー向けのプログラムによるバックアップ検証およびレポーティング
* 既存のインフラストラクチャ管理プラットフォームとの統合

API 認証は Terraform と同じトークンベース方式を使用します。完全な API リファレンスおよび連携例については、[ClickHouse Cloud API](/cloud/manage/api/api-overview) ドキュメントを参照してください。

## モニタリングと運用統合 {#monitoring-integration}

既存のモニタリング基盤に ClickHouse Cloud を接続することで、可視性を確保し、問題を事前に検知できます。

### 組み込みモニタリング {#built-in-monitoring}

ClickHouse Cloud には、1 秒あたりのクエリ数、メモリ使用量、CPU 使用量、ストレージ使用率などのリアルタイムメトリクスを備えた高度なダッシュボードが用意されています。Cloud コンソールの Monitoring → Advanced dashboard からアクセスできます。特定のワークロードパターンやチームごとのリソース消費に合わせて、カスタムダッシュボードを作成できます。

:::note Common production gaps
エンタープライズのインシデント管理システムとのプロアクティブなアラート連携や、自動的なコストモニタリングが不足していることがあります。組み込みダッシュボードは可視性を提供しますが、自動アラートには外部システムとの連携が必要です。
:::

### 本番環境でのアラート設定 {#production-alerting}

**組み込み機能**: ClickHouse Cloud は、課金イベント、スケーリングイベント、サービスの健全性に関する通知を、メール、UI、Slack 経由で提供します。コンソールの通知設定から、配信チャネルと通知の重要度を設定します。

**エンタープライズ連携**: 高度なアラート（PagerDuty、カスタム webhook など）のためには、Prometheus エンドポイントを使用して、既存のモニタリング基盤にメトリクスをエクスポートします。

```yaml
scrape_configs:
  - job_name: "clickhouse"
    static_configs:
      - targets: ["https://api.clickhouse.cloud/v1/organizations/<org_id>/prometheus"]
    basic_auth:
      username: <KEY_ID>
      password: <KEY_SECRET>
```

詳細な Prometheus/Grafana の構成や高度なアラート設定を含む包括的なセットアップについては、[ClickHouse Cloud Observability Guide](/use-cases/observability/cloud-monitoring#prometheus) を参照してください。

## 事業継続性とサポート連携 {#business-continuity}

バックアップ検証手順とサポート連携を確立することで、ClickHouse Cloud デプロイメントがインシデントから復旧し、必要なときにサポートを受けられるようにします。

### バックアップ戦略の評価 {#backup-strategy}

ClickHouse Cloud は、保持期間を設定可能な自動バックアップを提供します。現在のバックアップ構成を、コンプライアンス要件および復旧要件と照らし合わせて評価してください。バックアップの保存場所や暗号化に関して特定のコンプライアンス要件があるエンタープライズ顧客は、ClickHouse Cloud を構成して、自社クラウドストレージバケット（BYOB）にバックアップを保存できます。BYOB 構成については ClickHouse サポートにお問い合わせください。

### 復旧手順の検証とテスト {#validate-test-recovery}

多くの組織は、実際の復旧シナリオの最中にバックアップの抜け漏れに気付きます。インシデント発生前にバックアップの完全性を検証し、復旧手順をテストするための定期的な検証サイクルを確立してください。本番以外の環境への定期的なテスト復元をスケジュールし、時間見積もりを含むステップバイステップの復旧手順を文書化し、復元されたデータの完全性とアプリケーションの動作を検証し、（サービス削除、データ破損、リージョン障害など）さまざまな障害シナリオで復旧手順をテストします。オンコールチームがアクセス可能な最新の復旧ランブックを維持してください。

重要な本番サービスについては、少なくとも四半期ごとにバックアップ復元テストを実施してください。厳格なコンプライアンス要件を持つ組織では、毎月あるいは毎週の検証サイクルが必要になる場合があります。

### 災害復旧計画 {#disaster-recovery-planning}

復旧時間目標（RTO）と復旧時点目標（RPO）を文書化し、現在のバックアップ構成がビジネス要件を満たしているかを検証します。バックアップ復元の定期的なテストスケジュールを設定し、最新の復旧ドキュメントを維持してください。

**リージョン間バックアップストレージ**: 地理的な災害復旧要件を持つ組織は、ClickHouse Cloud を構成して、別リージョンにある顧客所有ストレージバケットへバックアップをエクスポートできます。これはリージョン障害に対する保護を提供しますが、復旧手順は手動で実施する必要があります。リージョン間バックアップエクスポートの実装については ClickHouse サポートにお問い合わせください。今後のプラットフォームリリースでは、自動化されたマルチリージョンレプリケーション機能が提供される予定です。

### 本番環境でのサポート連携 {#production-support}

現在利用しているサポートティアの SLA 上の期待値とエスカレーション手順を把握してください。ClickHouse サポートへエスカレーションする条件を定義した社内ランブックを作成し、既存のインシデント管理プロセスとこれらの手順を統合します。

[ClickHouse Cloud のバックアップと復旧](/cloud/manage/backups/overview)および[サポートサービス](/about-us/support)について、詳しくは各ドキュメントを参照してください。

## 次のステップ {#next-steps}

このガイドで説明した連携と手順を実装したら、[監視](/cloud/get-started/cloud/resource-tour#monitoring)、[セキュリティ](/cloud/get-started/cloud/resource-tour#security)、[コスト最適化](/cloud/get-started/cloud/resource-tour#cost-optimization) に関するガイドについては、[Cloud リソースツアー](/cloud/get-started/cloud/resource-tour) を参照してください。

現在の[サービスティアの制限](/cloud/manage/cloud-tiers)が本番運用に影響するようになった場合は、[プライベートネットワーキング](/cloud/security/connectivity/private-networking)、[TDE/CMEK](/cloud/security/cmek)（Customer-Managed Encryption Keys を用いた透過的データ暗号化）、[高度なバックアップオプション](/cloud/manage/backups/configurable-backups) などの機能拡張に向けたアップグレードパスを検討してください。
