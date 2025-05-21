---
sidebar_label: '共有責任モデル'
slug: /cloud/security/shared-responsibility-model
title: 'セキュリティ共有責任モデル'
description: 'ClickHouse Cloudのセキュリティモデルについて詳しく学ぶ'
---

## サービスタイプ {#service-types}

ClickHouse Cloudは、Basic、Scale、Enterpriseの3つのサービスタイプを提供しています。詳細については、[サービスタイプ](/cloud/manage/cloud-tiers)ページをご覧ください。

## クラウドアーキテクチャ {#cloud-architecture}

クラウドアーキテクチャは、コントロールプレーンとデータプレーンで構成されています。コントロールプレーンは、組織の作成、コントロールプレーン内のユーザー管理、サービス管理、APIキー管理、請求を担当します。データプレーンは、オーケストレーションと管理のためのツールを実行し、顧客サービスを提供します。詳細については、[ClickHouse Cloudアーキテクチャ](/cloud/reference/architecture)の図をご覧ください。

## BYOCアーキテクチャ {#byoc-architecture}

Bring Your Own Cloud (BYOC)では、顧客が自分のクラウドアカウントでデータプレーンを実行できます。詳細については、[(BYOC) Bring Your Own Cloud](/cloud/reference/byoc)ページをご覧ください。

## ClickHouse Cloudの共有責任モデル {#clickhouse-cloud-shared-responsibility-model}
以下のモデルは、ClickHouseの責任を一般的に示し、ClickHouse CloudとClickHouse BYOCの顧客がそれぞれ対処すべき責任を示しています。PCI共有責任モデルの詳細については、[Trust Center](https://trust.clickhouse.com)にある概要のコピーをダウンロードしてください。

| コントロール                                                           | ClickHouse         | クラウド顧客        | BYOC顧客           |
|-----------------------------------------------------------------------|--------------------|---------------------|---------------------|
| 環境の分離を維持                                                       | :white_check_mark: |                     | :white_check_mark:  |
| ネットワーク設定を管理                                                | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| ClickHouseシステムへのアクセスを安全に管理                           | :white_check_mark: |                     |                     |
| コントロールプレーンとデータベース内の組織ユーザーを安全に管理      |                    | :white_check_mark:  | :white_check_mark:  |
| ユーザー管理および監査                                               | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| データを転送中および静止中に暗号化                                   | :white_check_mark: |                     |                     |
| 顧客が管理する暗号化キーを安全に扱う                                   |                    | :white_check_mark:  | :white_check_mark:  |
| 冗長なインフラを提供                                                  | :white_check_mark: |                     | :white_check_mark:  |
| データをバックアップ                                                   | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| バックアップ復旧能力の検証                                           | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| データ保持設定を実装                                                 |                    | :white_check_mark:  | :white_check_mark:  |
| セキュリティ構成管理                                                 | :white_check_mark: |                     | :white_check_mark:  |
| ソフトウェアおよびインフラの脆弱性修正                                 | :white_check_mark: |                     |                     |
| ペネトレーションテストを実施                                         | :white_check_mark: |                     |                     |
| 脅威検出および対応                                                   | :white_check_mark: |                     | :white_check_mark:  |
| セキュリティインシデント対応                                          | :white_check_mark: |                     | :white_check_mark:  |

## ClickHouse Cloudの構成可能なセキュリティ機能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>ネットワーク接続</summary>

  | 設定                                                                                                  | ステータス  | クラウド            | サービスレベル       |  
  |------------------------------------------------------------------------------------------------------|-------------|-------------------|---------------------|
  | [IPフィルター](/cloud/security/setting-ip-filters)を使用してサービスへの接続を制限              | 利用可能     | AWS, GCP, Azure   | すべて               |
  | [プライベートリンク](/cloud/security/private-link-overview)を使用してサービスに安全に接続     | 利用可能     | AWS, GCP, Azure   | ScaleまたはEnterprise  |
  
</details>
<details>
  <summary>アクセス管理</summary>

  
  | 設定                                                                                                  | ステータス  | クラウド            | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-------------|-------------------|-------------------------|
  | [標準の役割ベースのアクセス](/cloud/security/cloud-access-management)をコントロールプレーンで使用  | 利用可能     | AWS, GCP, Azure   | すべて                 | 
  | [多要素認証 (MFA)](/cloud/security/cloud-authentication#multi-factor-authentication)が利用可能    | 利用可能     | AWS, GCP, Azure   | すべて                 |
  | コントロールプレーンに対する[SAMLシングルサインオン](/cloud/security/saml-setup)が利用可能        | プレビュー     | AWS, GCP, Azure   | Enterprise              |
  | データベースにおける詳細な[役割ベースのアクセス制御](/cloud/security/cloud-access-management/overview#database-permissions) | 利用可能     | AWS, GCP, Azure   | すべて                 |
  
</details>
<details>
  <summary>データのセキュリティ</summary>

  | 設定                                                                                                  | ステータス  | クラウド            | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-------------|-------------------|-------------------------|
  | [クラウドプロバイダーおよびリージョン](/cloud/reference/supported-regions)の選択                  | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | 限定的な[毎日の無償バックアップ](/cloud/manage/backups/overview#default-backup-policy)               | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | [カスタムバックアップ設定](/cloud/manage/backups/overview#configurable-backups)が利用可能           | 利用可能     | GCP, AWS, Azure   | ScaleまたはEnterprise     |
  | 透明なデータ暗号化のための[顧客が管理する暗号化キー (CMEK)](/cloud/security/cmek)が利用可能        | 利用可能     | AWS, GCP          | Enterprise               |
  | 詳細な暗号化のための手動キー管理による[フィールドレベルの暗号化](/sql-reference/functions/encryption-functions)が利用可能 | 利用可能     | GCP, AWS, Azure   | すべて                   |

  
</details>
<details>
  <summary>データ保持</summary>

  | 設定                                                                                                  | ステータス  | クラウド            | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-------------|-------------------|-------------------------|
  | [有効期限 (TTL)](/sql-reference/statements/alter/ttl)設定による保持管理                             | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete)による重い削除操作                      | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | [軽量DELETE](/sql-reference/statements/delete)による一定の削除活動                                   | 利用可能     | AWS, GCP, Azure   | すべて                   |
  
</details>
<details>
  <summary>監査およびロギング</summary>

  | 設定                                                                                                  | ステータス  | クラウド            | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-------------|-------------------|-------------------------|
  | コントロールプレーン活動のための[監査ログ](/cloud/security/audit-logging)                        | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | データベース活動のための[セッションログ](/operations/system-tables/session_log)                  | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | データベース活動のための[クエリログ](/operations/system-tables/query_log)                         | 利用可能     | AWS, GCP, Azure   | すべて                   |
  
</details>

## ClickHouse Cloudのコンプライアンス {#clickhouse-cloud-compliance}

  | フレームワーク                                                                                       | ステータス  | クラウド            | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-------------|-------------------|-------------------------|
  | ISO 27001コンプライアンス                                                                             | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | SOC 2タイプIIコンプライアンス                                                                         | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | GDPRおよびCCPAコンプライアンス                                                                         | 利用可能     | AWS, GCP, Azure   | すべて                   |
  | HIPAAコンプライアンス                                                                                 | 利用可能     | AWS, GCP          | Enterprise               |
  | PCIコンプライアンス                                                                                   | 利用可能     | AWS               | Enterprise               |

  サポートされているコンプライアンスフレームワークの詳細については、[セキュリティとコンプライアンス](/cloud/security/security-and-compliance)ページをご覧ください。
