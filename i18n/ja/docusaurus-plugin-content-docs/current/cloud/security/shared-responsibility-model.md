---
sidebar_label: 共有責任モデル
slug: /cloud/security/shared-responsibility-model
title: セキュリティ共有責任モデル
---

## サービスの種類 {#service-types}

ClickHouse Cloud は、基本、スケール、エンタープライズの3つのサービスの種類を提供しています。詳細情報については、[サービスの種類](/cloud/manage/cloud-tiers)ページをご覧ください。

## クラウドアーキテクチャ {#cloud-architecture}

クラウドアーキテクチャは、コントロールプレーンとデータプレーンで構成されています。コントロールプレーンは、組織の作成、コントロールプレーン内のユーザー管理、サービス管理、APIキー管理、および請求を担当します。データプレーンは、オーケストレーションと管理のためのツールを実行し、顧客サービスをホスティングします。詳細情報については、[ClickHouse Cloud アーキテクチャ](/cloud/reference/architecture)の図をご覧ください。

## BYOC アーキテクチャ {#byoc-architecture}

自分のクラウドを持ち込む（BYOC）は、顧客が自分のクラウドアカウントでデータプレーンを実行できるようにします。詳細情報については、[(BYOC) 自分のクラウドを持ち込む](/cloud/reference/byoc)ページをご覧ください。

## ClickHouse Cloud 共有責任モデル {#clickhouse-cloud-shared-responsibility-model}
以下のモデルは、一般的に ClickHouse の責任に触れ、ClickHouse Cloud と ClickHouse BYOC の顧客がそれぞれ対処すべき責任を示しています。私たちの PCI 共有責任モデルについての詳細は、[Trust Center](https://trust.clickhouse.com)にある概要のコピーをダウンロードしてください。

| コントロール                                                           | ClickHouse         | クラウド顧客        | BYOC 顧客          |
|-----------------------------------------------------------------------|--------------------|---------------------|---------------------|
| 環境の分離を維持する                                                   | :white_check_mark: |                     | :white_check_mark:  |
| ネットワーク設定の管理                                                | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| ClickHouse システムへのアクセスを安全に管理                          | :white_check_mark: |                     |                     |
| コントロールプレーンおよびデータベース内の組織ユーザーを安全に管理 |                    | :white_check_mark:  | :white_check_mark:  |
| ユーザー管理と監査                                                   | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| 移動中および静止中のデータを暗号化                                    | :white_check_mark: |                     |                     |
| 顧客の管理する暗号化キーを安全に扱う                                  |                    | :white_check_mark:  | :white_check_mark:  |
| 冗長インフラストラクチャを提供                                        | :white_check_mark: |                     | :white_check_mark:  |
| データのバックアップ                                                   | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| バックアップ復元機能の確認                                           | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| データ保持設定の実装                                                 |                    | :white_check_mark:  | :white_check_mark:  |
| セキュリティ構成管理                                                 | :white_check_mark: |                     | :white_check_mark:  |
| ソフトウェアおよびインフラストラクチャの脆弱性を修正                 | :white_check_mark: |                     |                     |
| 脆弱性テストの実施                                                   | :white_check_mark: |                     |                     |
| 脅威検知と対応                                                     | :white_check_mark: |                     | :white_check_mark:  |
| セキュリティインシデントの対応                                        | :white_check_mark: |                     | :white_check_mark:  |

## ClickHouse Cloud 設定可能なセキュリティ機能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>ネットワーク接続</summary>

  | 設定                                                                                              | ステータス | クラウド             | サービスレベル        |  
  |--------------------------------------------------------------------------------------------------|-----------|--------------------|----------------------|
  | [IP フィルター](/cloud/security/setting-ip-filters) でサービスへの接続を制限                  | 利用可能   | AWS, GCP, Azure    | すべて                |
  | [プライベートリンク](/cloud/security/private-link-overview) でサービスに安全に接続            | 利用可能   | AWS, GCP, Azure    | スケールまたはエンタープライズ  |
  
</details>
<details>
  <summary>アクセス管理</summary>

  
  | 設定                                                                                              | ステータス | クラウド             | サービスレベル           |  
  |--------------------------------------------------------------------------------------------------|-----------|--------------------|-------------------------|
  | コントロールプレーンでの [標準の役割ベースのアクセス](/cloud/security/cloud-access-management)    | 利用可能   | AWS, GCP, Azure     | すべて                  | 
  | [多要素認証 (MFA)](/cloud/security/cloud-authentication#multi-factor-authentication)            | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | コントロールプレーン用の [SAML シングルサインオン](/cloud/security/saml-setup)                | プレビュー  | AWS, GCP, Azure    | エンタープライズ        |
  | データベース内の [細かい役割ベースのアクセス制御](/cloud/security/cloud-access-management#database-roles) | 利用可能   | AWS, GCP, Azure     | すべて                  |
  
</details>
<details>
  <summary>データセキュリティ</summary>

  | 設定                                                                                              | ステータス | クラウド             | サービスレベル           |  
  |--------------------------------------------------------------------------------------------------|-----------|--------------------|-------------------------|
  | [クラウドプロバイダーとリージョン](/cloud/reference/supported-regions)の選択                  | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | 限定的な [無料のデイリーバックアップ](/cloud/manage/backups#default-backup-policy)            | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | [カスタムバックアップ設定](/cloud/manage/backups#configurable-backups)が利用可能             | 利用可能   | GCP, AWS, Azure     | スケールまたはエンタープライズ     |
  | [顧客管理の暗号化キー (CMEK)](/cloud/security/cmek) による透過的な<br/>データ暗号化が利用可能  | 利用可能   | AWS                | スケールまたはエンタープライズ |
  | [フィールドレベルの暗号化](/sql-reference/functions/encryption-functions)と手動キー管理による細かな暗号化 | 利用可能   | GCP, AWS, Azure     | すべて                  |

  
</details>
<details>
  <summary>データ保持</summary>

  | 設定                                                                                              | ステータス | クラウド             | サービスレベル           |  
  |--------------------------------------------------------------------------------------------------|-----------|--------------------|-------------------------|
  | [有効期限 (TTL)](/sql-reference/statements/alter/ttl) 設定で保持を管理                       | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete) による大量削除アクション        | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | [軽量削除](/sql-reference/statements/delete) による制御された削除アクティビティ              | 利用可能   | AWS, GCP, Azure     | すべて                  |
  
</details>
<details>
  <summary>監査とログ記録</summary>

  | 設定                                                                                              | ステータス | クラウド             | サービスレベル           |  
  |--------------------------------------------------------------------------------------------------|-----------|--------------------|-------------------------|
  | コントロールプレーンアクティビティ用の [監査ログ](/cloud/security/audit-logging)             | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | データベースアクティビティ用の [セッションログ](/operations/system-tables/session_log)         | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | データベースアクティビティ用の [クエリログ](/operations/system-tables/query_log)              | 利用可能   | AWS, GCP, Azure     | すべて                  |
  
</details>

## ClickHouse Cloud コンプライアンス {#clickhouse-cloud-compliance}

  | フレームワーク                                                                                  | ステータス | クラウド             | サービスレベル           |  
  |--------------------------------------------------------------------------------------------------|-----------|--------------------|-------------------------|
  | ISO 27001 準拠                                                                                 | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | SOC 2 タイプ II 準拠                                                                           | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | GDPR および CCPA 準拠                                                                           | 利用可能   | AWS, GCP, Azure     | すべて                  |
  | HIPAA 準拠                                                                                     | 利用可能   | AWS, GCP            | エンタープライズ            |

  準拠しているフレームワークの詳細については、[セキュリティとコンプライアンス](/cloud/security/security-and-compliance)ページをご覧ください。
