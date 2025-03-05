---
sidebar_label: 共有責任モデル
slug: /cloud/security/shared-responsibility-model
title: セキュリティ共有責任モデル
---

## サービスタイプ {#service-types}

ClickHouse Cloud は、基本、スケール、エンタープライズの 3 種類のサービスを提供しています。詳細については、[サービスの種類](/cloud/manage/cloud-tiers) ページをご覧ください。

## クラウドアーキテクチャ {#cloud-architecture}

クラウドアーキテクチャは、制御プレーンとデータプレーンで構成されています。制御プレーンは、組織の作成、制御プレーン内のユーザー管理、サービス管理、API キーマネジメント、請求を担当しています。データプレーンは、オーケストレーションと管理のためのツールを実行し、顧客サービスを収容します。詳細については、[ClickHouse Cloud アーキテクチャ](/cloud/reference/architecture) ダイアグラムをご覧ください。

## BYOC アーキテクチャ {#byoc-architecture}

独自のクラウドを持ち込む (BYOC) により、顧客は自分のクラウドアカウントでデータプレーンを実行できます。詳細については、[(BYOC) Bring Your Own Cloud](/cloud/reference/byoc) ページをご覧ください。

## ClickHouse Cloud 共有責任モデル {#clickhouse-cloud-shared-responsibility-model}
以下のモデルは、ClickHouse の責任を一般的に示し、ClickHouse Cloud および ClickHouse BYOC の顧客がそれぞれ対応すべき責任を示しています。PCI 共有責任モデルの詳細については、[Trust Center](https://trust.clickhouse.com) で入手可能な概要のコピーをダウンロードしてください。

| 制御                                                                   | ClickHouse         | クラウド顧客        | BYOC 顧客           |
|----------------------------------------------------------------------|--------------------|---------------------|---------------------|
| 環境の分離を維持                                                      | :white_check_mark: |                     | :white_check_mark:  |
| ネットワーク設定の管理                                               | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| ClickHouse システムへのアクセスを安全に管理                         | :white_check_mark: |                     |                     |
| 制御プレーンおよびデータベース内の組織ユーザーを安全に管理          |                    | :white_check_mark:  | :white_check_mark:  |
| ユーザー管理と監査                                                  | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| データを転送中および静止中に暗号化                                   | :white_check_mark: |                     |                     |
| 顧客が管理する暗号化キーを安全に扱う                                |                    | :white_check_mark:  | :white_check_mark:  |
| 冗長インフラを提供                                                  | :white_check_mark: |                     | :white_check_mark:  |
| データのバックアップ                                                  | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| バックアップのリカバリ機能を検証                                     | :white_check_mark: | :white_check_mark:  | :white_check_mark:  |
| データ保持設定を実装                                                |                    | :white_check_mark:  | :white_check_mark:  |
| セキュリティ設定管理                                                | :white_check_mark: |                     | :white_check_mark:  |
| ソフトウェアおよびインフラの脆弱性の修正                             | :white_check_mark: |                     |                     |
| ペネトレーションテストを実施                                        | :white_check_mark: |                     |                     |
| 脅威検出と対応                                                    | :white_check_mark: |                     | :white_check_mark:  |
| セキュリティインシデントへの対応                                     | :white_check_mark: |                     | :white_check_mark:  |

## ClickHouse Cloud 設定可能なセキュリティ機能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>ネットワーク接続</summary>

  | 設定                                                                                              | ステータス  | クラウド           | サービスレベル      |  
  |--------------------------------------------------------------------------------------------------|-----------|-------------------|--------------------|
  | [IP フィルタ](/cloud/security/setting-ip-filters) によるサービスへの接続制限                | 利用可能   | AWS, GCP, Azure   | すべて              |
  | [プライベートリンク](/cloud/security/private-link-overview) によるサービスへの安全な接続 | 利用可能   | AWS, GCP, Azure   | スケールまたはエンタープライズ |
  
</details>
<details>
  <summary>アクセス管理</summary>

  | 設定                                                                                              | ステータス  | クラウド           | サービスレベル      |  
  |--------------------------------------------------------------------------------------------------|-----------|-------------------|--------------------|
  | [標準のロールベースのアクセス](/cloud/security/cloud-access-management) 制御プレーンで   | 利用可能   | AWS, GCP, Azure | すべて              | 
  | [多要素認証 (MFA)](/cloud/security/cloud-authentication#multi-factor-authhentication) 利用可能 | 利用可能   | AWS, GCP, Azure | すべて              |
  | [SAML シングルサインオン](/cloud/security/saml-setup) 制御プレーンへの利用可能             | プレビュー | AWS, GCP, Azure   | エンタープライズ    |
  | データベースにおける細かな [ロールベースのアクセス制御](/cloud/security/cloud-access-management#database-roles)   | 利用可能   | AWS, GCP, Azure | すべて              |
  
</details>
<details>
  <summary>データセキュリティ</summary>

  | 設定                                                                                              | ステータス  | クラウド           | サービスレベル      |  
  |--------------------------------------------------------------------------------------------------|-----------|-------------------|--------------------|
  | [クラウドプロバイダーとリージョン](/cloud/reference/supported-regions) の選択                 | 利用可能   | AWS, GCP, Azure   | すべて              |
  | 限定された [無料の日次バックアップ](/cloud/manage/backups#default-backup-policy)               | 利用可能   | AWS, GCP, Azure   | すべて              |
  | [カスタムバックアップ構成](/cloud/manage/backups#configurable-backups) 利用可能              | 利用可能   | GCP, AWS, Azure   | スケールまたはエンタープライズ |
  | [顧客管理の暗号化キー (CMEK)](/cloud/security/cmek) による透過的<br/>なデータ暗号化の利用 | 利用可能   | AWS | スケールまたはエンタープライズ |
  | [フィールドレベルの暗号化](/sql-reference/functions/encryption-functions) 手動キー管理による細かい暗号化 | 利用可能   | GCP, AWS, Azure | すべて              |

</details>
<details>
  <summary>データ保持</summary>

  | 設定                                                                                              | ステータス  | クラウド           | サービスレベル      |  
  |--------------------------------------------------------------------------------------------------|-----------|-------------------|--------------------|
  | [有効期限 (TTL)](/sql-reference/statements/alter/ttl) 設定による保持管理                  | 利用可能   | AWS, GCP, Azure   | すべて              |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete) 大量削除アクションに利用      | 利用可能   | AWS, GCP, Azure   | すべて              |
  | [Lightweight DELETE](/sql-reference/statements/delete) 減量的削除活動に利用               | 利用可能   | AWS, GCP, Azure   | すべて              |
  
</details>
<details>
  <summary>監査とロギング</summary>

  | 設定                                                                                              | ステータス  | クラウド           | サービスレベル      |  
  |--------------------------------------------------------------------------------------------------|-----------|-------------------|--------------------|
  | [監査ログ](/cloud/security/audit-logging) 制御プレーンの活動に利用                     | 利用可能   | AWS, GCP, Azure   | すべて              |
  | [セッションログ](/operations/system-tables/session_log) データベースの活動に利用       | 利用可能   | AWS, GCP, Azure   | すべて              |
  | [クエリログ](/operations/system-tables/query_log) データベースの活動に利用            | 利用可能   | AWS, GCP, Azure   | すべて              |
  
</details>

## ClickHouse Cloud 準拠 {#clickhouse-cloud-compliance}

  | フレームワーク                                                                                     | ステータス  | クラウド           | サービスレベル      |  
  |--------------------------------------------------------------------------------------------------|-----------|-------------------|--------------------|
  | ISO 27001 準拠                                                                                   | 利用可能   | AWS, GCP, Azure   | すべて              |
  | SOC 2 タイプ II 準拠                                                                             | 利用可能   | AWS, GCP, Azure   | すべて              |
  | GDPR および CCPA 準拠                                                                             | 利用可能   | AWS, GCP, Azure   | すべて              |
  | HIPAA 準拠                                                                                       | 利用可能   | AWS, GCP          | エンタープライズ    |

  サポートされているコンプライアンスフレームワークの詳細については、[セキュリティとコンプライアンス](/cloud/security/security-and-compliance) ページをご覧ください。
