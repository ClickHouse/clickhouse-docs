---
sidebar_label: 共有責任モデル
slug: /cloud/security/shared-responsibility-model
title: セキュリティ 共有責任モデル
---

## サービスの種類 {#service-types}

ClickHouse Cloud は、基本、スケール、エンタープライズの 3 つのサービスタイプを提供しています。詳細については、[サービスの種類](/cloud/manage/cloud-tiers) ページをご覧ください。

## クラウドアーキテクチャ {#cloud-architecture}

クラウドアーキテクチャは、制御プレーンとデータプレーンで構成されています。制御プレーンは、組織の作成、制御プレーン内のユーザー管理、サービス管理、API キー管理、および請求を担当します。データプレーンは、オーケストレーションと管理のツールを実行し、顧客サービスを収容します。詳細については、[ClickHouse Cloud アーキテクチャ](/cloud/reference/architecture) ダイアグラムをご覧ください。

## BYOC アーキテクチャ {#byoc-architecture}

自分のクラウドを持つ (BYOC) では、顧客が自分のクラウドアカウントでデータプレーンを実行できるようになります。詳細については、[(BYOC) Bring Your Own Cloud](/cloud/reference/byoc) ページをご覧ください。

## ClickHouse Cloud 共有責任モデル {#clickhouse-cloud-shared-responsibility-model}
以下のモデルは、ClickHouse の責任を一般的に示し、ClickHouse Cloud と ClickHouse BYOC の顧客がそれぞれ対応すべき責任を示しています。私たちの PCI 共有責任モデルに関する詳細については、[Trust Center](https://trust.clickhouse.com) で提供されている概要のコピーをダウンロードしてください。

| 制御                                                               | ClickHouse         | クラウド顧客      | BYOC 顧客         |
|-----------------------------------------------------------------------|--------------------|-----------------|------------------|
| 環境の分離を維持                                                       | :white_check_mark: |                 | :white_check_mark:  |
| ネットワーク設定を管理                                               | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| ClickHouse システムへのアクセスを安全に管理                        | :white_check_mark: |                 |                    |
| 制御プレーンとデータベース内の組織ユーザーを安全に管理             |                    | :white_check_mark:  | :white_check_mark:  |
| ユーザー管理と監査                                                   | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| 転送中および静止中のデータを暗号化                                   | :white_check_mark: |                 |                    |
| 顧客が管理する暗号化キーを安全に扱う                                 |                    | :white_check_mark:  | :white_check_mark:  |
| 冗長インフラストラクチャを提供                                        | :white_check_mark: |                 | :white_check_mark:  |
| データのバックアップ                                                   | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| バックアップ回復能力を検証                                           | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| データ保持設定を実装                                                 |                    | :white_check_mark:  | :white_check_mark:  |
| セキュリティ構成管理                                                 | :white_check_mark: |                 | :white_check_mark:  |
| ソフトウェアとインフラストラクチャの脆弱性修正                       | :white_check_mark: |                 |                    |
| ペネトレーションテストを実施                                          | :white_check_mark: |                 |                    |
| 脅威検出と対応                                                       | :white_check_mark: |                 | :white_check_mark:  |
| セキュリティインシデント対応                                          | :white_check_mark: |                 | :white_check_mark:  |

## ClickHouse Cloud の設定可能なセキュリティ機能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>ネットワーク接続</summary>

  | 設定                                                                                              | ステータス  | クラウド             | サービスレベル        |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|----------------------|
  | [IP フィルター](/cloud/security/setting-ip-filters)を使用して、サービスへの接続を制限          | 利用可能   | AWS, GCP, Azure   | 全て                  |
  | [プライベートリンク](/cloud/security/private-link-overview)を使用して、サービスに安全に接続 | 利用可能   | AWS, GCP, Azure   | スケールまたはエンタープライズ  |
  
</details>
<details>
  <summary>アクセス管理</summary>

  | 設定                                                                                              | ステータス  | クラウド             | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [標準のロールベースアクセス](/cloud/security/cloud-access-management)が制御プレーンで利用可能 | 利用可能   | AWS, GCP, Azure | 全て               | 
  | [多要素認証 (MFA)](/cloud/security/cloud-authentication#multi-factor-authentication)が利用可能 | 利用可能   | AWS, GCP, Azure | 全て   |
  | [SAML シングルサインオン](/cloud/security/saml-setup)が制御プレーンに利用可能                  | プレビュー   | AWS, GCP, Azure   | エンタープライズ              |
  | データベース内の[細かいロールベースアクセス制御](/cloud/security/cloud-access-management/overview#database-roles)が利用可能   | 利用可能   | AWS, GCP, Azure | 全て          |
  
</details>
<details>
  <summary>データセキュリティ</summary>

  | 設定                                                                                              | ステータス  | クラウド             | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [クラウドプロバイダーおよびリージョン](/cloud/reference/supported-regions)の選択            | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | 限定された[無料の毎日のバックアップ](/cloud/manage/backups/overview#default-backup-policy)     | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | [カスタムバックアップ設定](/cloud/manage/backups/overview#configurable-backups)が利用可能           | 利用可能   | GCP, AWS, Azure   | スケールまたはエンタープライズ     |
  | 透明な<br/>データ暗号化のための[顧客が管理する暗号化キー (CMEK)](/cloud/security/cmek)が利用可能  | 利用可能   | AWS | スケールまたはエンタープライズ |
  | [フィールドレベルの暗号化](/sql-reference/functions/encryption-functions)が手動キー管理で細かく暗号化 | 利用可能   | GCP, AWS, Azure | 全て  |

</details>
<details>
  <summary>データ保持</summary>

  | 設定                                                                                              | ステータス  | クラウド             | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [有効期限 (TTL)](/sql-reference/statements/alter/ttl)の設定で保持を管理                     | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete)を使用した重い削除作業            | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | [軽量 DELETE](/sql-reference/statements/delete)を使用した計画的削除作業                     | 利用可能   | AWS, GCP, Azure   | 全て                     |
  
</details>
<details>
  <summary>監査およびロギング</summary>

  | 設定                                                                                              | ステータス  | クラウド             | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | [監査ログ](/cloud/security/audit-logging)による制御プレーンの活動の記録                     | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | [セッションログ](/operations/system-tables/session_log)によるデータベース活動の記録          | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | [クエリログ](/operations/system-tables/query_log)によるデータベース活動の記録               | 利用可能   | AWS, GCP, Azure   | 全て                     |
  
</details>

## ClickHouse Cloud コンプライアンス {#clickhouse-cloud-compliance}

  | フレームワーク                                                                                            | ステータス  | クラウド             | サービスレベル           |  
  |------------------------------------------------------------------------------------------------------|-----------|-------------------|-------------------------|
  | ISO 27001 コンプライアンス                                                                          | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | SOC 2 タイプ II コンプライアンス                                                                    | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | GDPR および CCPA コンプライアンス                                                                    | 利用可能   | AWS, GCP, Azure   | 全て                     |
  | HIPAA コンプライアンス                                                                                | 利用可能   | AWS, GCP          | エンタープライズ              |

  サポートされているコンプライアンスフレームワークの詳細については、[セキュリティとコンプライアンス](/cloud/security/security-and-compliance) ページをご覧ください。
