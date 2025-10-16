---
'sidebar_label': '共有責任モデル'
'slug': '/cloud/security/shared-responsibility-model'
'title': '共有責任モデル'
'description': 'ClickHouse Cloudのセキュリティモデルについてさらに学ぶ'
'doc_type': 'reference'
---

## サービスタイプ {#service-types}

ClickHouse Cloudは、Basic、Scale、Enterpriseの3つのサービスタイプを提供します。詳細については、[サービスタイプ](/cloud/manage/cloud-tiers)ページをご覧ください。

## クラウドアーキテクチャ {#cloud-architecture}

クラウドアーキテクチャは、コントロールプレーンとデータプレーンで構成されています。コントロールプレーンは、組織の作成、コントロールプレーン内のユーザー管理、サービス管理、APIキー管理、請求を担当します。データプレーンは、オーケストレーションと管理のためのツールを実行し、顧客サービスをホストします。詳細については、[ClickHouse Cloudアーキテクチャ](/cloud/reference/architecture)図をご覧ください。

## BYOCアーキテクチャ {#byoc-architecture}

Bring Your Own Cloud (BYOC)は、顧客が自分のクラウドアカウントでデータプレーンを実行できるようにします。詳細については、[(BYOC) Bring Your Own Cloud](/cloud/reference/byoc)ページをご覧ください。

## ClickHouse Cloud共有責任モデル {#clickhouse-cloud-shared-responsibility-model}
以下のモデルは、一般的にClickHouseの責任を示し、ClickHouse CloudおよびClickHouse BYOCの顧客が対処すべき責任を示しています。PCI共有責任モデルの詳細については、[Trust Center](https://trust.clickhouse.com)に掲載されている概要のコピーをダウンロードしてください。

| コントロール                                                              | ClickHouse         | クラウド顧客      | BYOC顧客       |
|-------------------------------------------------------------------------|--------------------|------------------|-----------------|
| 環境の分離を維持                                                        | :white_check_mark: |                  | :white_check_mark: |
| ネットワーク設定の管理                                                  | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| ClickHouseシステムへのアクセスを安全に管理                              | :white_check_mark: |                  |                 |
| コントロールプレーンおよびデータベース内の組織ユーザーを安全に管理    |                    | :white_check_mark: | :white_check_mark: |
| ユーザー管理と監査                                                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| 転送中および静止中のデータを暗号化                                     | :white_check_mark: |                  |                 |
| 顧客管理の暗号化キーを安全に取り扱う                                   |                    | :white_check_mark: | :white_check_mark: |
| 冗長インフラストラクチャを提供                                          | :white_check_mark: |                  | :white_check_mark: |
| データのバックアップ                                                    | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| バックアップの回復能力を確認                                           | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| データ保持設定の実施                                                  |                    | :white_check_mark: | :white_check_mark: |
| セキュリティ設定管理                                                  | :white_check_mark: |                  | :white_check_mark: |
| ソフトウェアとインフラストラクチャの脆弱性修正                         | :white_check_mark: |                  |                 |
| ペネトレーションテストの実施                                           | :white_check_mark: |                  |                 |
| 脅威の検出と対応                                                      | :white_check_mark: |                  | :white_check_mark: |
| セキュリティインシデントの対応                                        | :white_check_mark: |                  | :white_check_mark: |

## ClickHouse Cloudの構成可能なセキュリティ機能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>ネットワーク接続</summary>

  | 設定                                                                                                        | ステータス    | クラウド            | サービスレベル         |  
  |------------------------------------------------------------------------------------------------------------|-------------|--------------------|------------------------|
  | [IPフィルター](/cloud/security/setting-ip-filters)でサービスへの接続を制限                              | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [プライベートリンク](/cloud/security/private-link-overview)でサービスに安全に接続                       | 利用可能     | AWS, GCP, Azure    | ScaleまたはEnterprise  |
  
</details>
<details>
  <summary>アクセス管理</summary>
  
  | 設定                                                                                                        | ステータス    | クラウド            | サービスレベル          |  
  |------------------------------------------------------------------------------------------------------------|-------------|--------------------|-------------------------|
  | [標準の役割ベースアクセス](/cloud/security/cloud-access-management)をコントロールプレーンの中で提供         | 利用可能     | AWS, GCP, Azure    | すべて                  | 
  | [多要素認証 (MFA)](/cloud/security/cloud-authentication#multi-factor-authentication)を利用可能              | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [SAMLシングルサインオン](/cloud/security/saml-setup)をコントロールプレーンで提供                          | プレビュー     | AWS, GCP, Azure    | Enterprise              |
  | データベース内の細かい [役割ベースアクセス制御](/cloud/security/cloud-access-management/overview#database-permissions) | 利用可能     | AWS, GCP, Azure    | すべて                  |
  
</details>
<details>
  <summary>データセキュリティ</summary>

  | 設定                                                                                                        | ステータス    | クラウド            | サービスレベル          |  
  |------------------------------------------------------------------------------------------------------------|-------------|--------------------|-------------------------|
  | [クラウドプロバイダーとリージョン](/cloud/reference/supported-regions)の選択                               | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | 限定的な [無料の日次バックアップ](/cloud/manage/backups/overview#default-backup-policy)                       | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [カスタムバックアップ構成](/cloud/manage/backups/overview#configurable-backups)を提供                    | 利用可能     | GCP, AWS, Azure    | ScaleまたはEnterprise   |
  | [顧客管理の暗号化キー (CMEK)](/cloud/security/cmek)による透過的<br/>なデータ暗号化を提供                 | 利用可能     | AWS, GCP           | Enterprise              |
  | 手動のキー管理による詳細な暗号化のための [フィールドレベル暗号化](/sql-reference/functions/encryption-functions) | 利用可能     | GCP, AWS, Azure    | すべて                  |
  
</details>
<details>
  <summary>データ保持</summary>

  | 設定                                                                                                        | ステータス    | クラウド            | サービスレベル          |  
  |------------------------------------------------------------------------------------------------------------|-------------|--------------------|-------------------------|
  | [有効期限 (TTL)](/sql-reference/statements/alter/ttl)設定で保持管理                                        | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete)を利用した重度の削除アクション                  | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [軽量DELETE](/sql-reference/statements/delete)での定量的な削除活動                                         | 利用可能     | AWS, GCP, Azure    | すべて                  |
  
</details>
<details>
  <summary>監査とログ</summary>

  | 設定                                                                                                        | ステータス    | クラウド            | サービスレベル          |  
  |------------------------------------------------------------------------------------------------------------|-------------|--------------------|-------------------------|
  | [監査ログ](/cloud/security/audit-logging)でコントロールプレーン活動を監査                                   | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [セッションログ](/operations/system-tables/session_log)でデータベース活動を監査                             | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | [クエリログ](/operations/system-tables/query_log)でデータベース活動を監査                                | 利用可能     | AWS, GCP, Azure    | すべて                  |
  
</details>

## ClickHouse Cloudのコンプライアンス {#clickhouse-cloud-compliance}

  | フレームワーク                                                                                             | ステータス    | クラウド            | サービスレベル          |  
  |------------------------------------------------------------------------------------------------------------|-------------|--------------------|-------------------------|
  | ISO 27001 compliant                                                                                         | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | SOC 2 Type II compliant                                                                                     | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | GDPRおよびCCPAへの準拠                                                                                     | 利用可能     | AWS, GCP, Azure    | すべて                  |
  | HIPAA compliant                                                                                             | 利用可能     | AWS, GCP           | Enterprise              |
  | PCI compliant                                                                                               | 利用可能     | AWS                | Enterprise              |

サポートされているコンプライアンスフレームワークの詳細については、[セキュリティとコンプライアンス](/cloud/security/compliance-overview)ページをご覧ください。
