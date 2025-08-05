---
sidebar_label: 'Shared Responsibility Model'
slug: '/cloud/security/shared-responsibility-model'
title: 'セキュリティ共有責任モデル'
description: 'Learn more about the security model of ClickHouse Cloud'
---



## サービスタイプ {#service-types}

ClickHouse Cloud は、Basic、Scale、および Enterprise の 3 つのサービスを提供しています。詳細については、[サービスの種類](/cloud/manage/cloud-tiers) ページをご覧ください。

## クラウドアーキテクチャ {#cloud-architecture}

クラウドアーキテクチャは、コントロールプレーンとデータプレーンで構成されています。コントロールプレーンは、組織の作成、コントロールプレーン内のユーザー管理、サービス管理、API キー管理、請求に関連する責任を負います。データプレーンは、オーケストレーションや管理のためのツールを運用し、顧客サービスをホストします。詳細については、[ClickHouse Cloud アーキテクチャ](/cloud/reference/architecture) 図をご覧ください。

## BYOC アーキテクチャ {#byoc-architecture}

Bring Your Own Cloud (BYOC) は、顧客が自分のクラウドアカウントでデータプレーンを運用できるようにします。詳細については、[BYOC (Bring Your Own Cloud)](/cloud/reference/byoc) ページをご覧ください。

## ClickHouse Cloud 共有責任モデル {#clickhouse-cloud-shared-responsibility-model}

以下のモデルは、一般的に ClickHouse の責任を示し、ClickHouse Cloud および ClickHouse BYOC の顧客がそれぞれ対処すべき責任を示しています。PCI 共有責任モデルの詳細については、[Trust Center](https://trust.clickhouse.com) にある概要コピーをダウンロードしてください。

| コントロール                                                            | ClickHouse         | クラウド顧客       | BYOC 顧客           |
|------------------------------------------------------------------------|--------------------|-------------------|---------------------|
| 環境の分離を維持                                                        | :white_check_mark: |                   | :white_check_mark:  |
| ネットワーク設定を管理                                                  | :white_check_mark: | :white_check_mark:| :white_check_mark:  |
| ClickHouse システムへのアクセスを安全に管理                           | :white_check_mark: |                   |                     |
| コントロールプレーンおよびデータベース内の組織ユーザーを安全に管理   |                    | :white_check_mark:| :white_check_mark:  |
| ユーザー管理および監査                                                | :white_check_mark: | :white_check_mark:| :white_check_mark:  |
| データの転送時および保管時の暗号化                                    | :white_check_mark: |                   |                     |
| 顧客が管理する暗号化キーを安全に扱う                                   |                    | :white_check_mark:| :white_check_mark:  |
| 冗長インフラを提供                                                     | :white_check_mark: |                   | :white_check_mark:  |
| データのバックアップ                                                   | :white_check_mark: | :white_check_mark:| :white_check_mark:  |
| バックアップ復旧能力を検証                                            | :white_check_mark: | :white_check_mark:| :white_check_mark:  |
| データ保持設定を実施                                                  |                    | :white_check_mark:| :white_check_mark:  |
| セキュリティ構成管理                                                  | :white_check_mark: |                   | :white_check_mark:  |
| ソフトウェアとインフラの脆弱性修正                                      | :white_check_mark: |                   |                     |
| ペネトレーションテストを実施                                          | :white_check_mark: |                   |                     |
| 脅威検出および対応                                                  | :white_check_mark: |                   | :white_check_mark:  |
| セキュリティインシデント対応                                          | :white_check_mark: |                   | :white_check_mark:  |

## ClickHouse Cloud 設定可能なセキュリティ機能 {#clickhouse-cloud-configurable-security-features}

<details>
  <summary>ネットワーク接続</summary>

  | 設定                                                                                             | ステータス | クラウド            | サービスレベル     |  
  |--------------------------------------------------------------------------------------------------|-----------|---------------------|--------------------|
  | [IP フィルター](/cloud/security/setting-ip-filters) でサービスへの接続を制限                  | 利用可能  | AWS, GCP, Azure      | すべて               |
  | [プライベートリンク](/cloud/security/private-link-overview) でサービスに安全に接続           | 利用可能  | AWS, GCP, Azure      | Scale または Enterprise |

</details>
<details>
  <summary>アクセス管理</summary>

  | 設定                                                                                             | ステータス | クラウド            | サービスレベル       |  
  |--------------------------------------------------------------------------------------------------|-----------|---------------------|----------------------|
  | [標準のロールベースのアクセス](/cloud/security/cloud-access-management) でコントロールプレーン | 利用可能   | AWS, GCP, Azure      | すべて               | 
  | [多要素認証 (MFA)](/cloud/security/cloud-authentication#multi-factor-authentication) 利用可能   | 利用可能   | AWS, GCP, Azure      | すべて               |
  | コントロールプレーンへの [SAML シングルサインオン](/cloud/security/saml-setup) 利用可能       | プレビュー  | AWS, GCP, Azure      | Enterprise            |
  | データベース内の詳細な [ロールベースアクセス制御](/cloud/security/cloud-access-management/overview#database-permissions) | 利用可能   | AWS, GCP, Azure      | すべて               |

</details>
<details>
  <summary>データセキュリティ</summary>

  | 設定                                                                                             | ステータス | クラウド            | サービスレベル       |  
  |--------------------------------------------------------------------------------------------------|-----------|---------------------|----------------------|
  | [クラウドプロバイダーとリージョン](/cloud/reference/supported-regions) の選択              | 利用可能   | AWS, GCP, Azure      | すべて                |
  | 限定された [毎日の無料バックアップ](/cloud/manage/backups/overview#default-backup-policy)          | 利用可能   | AWS, GCP, Azure      | すべて                |
  | 利用可能な [カスタムバックアップ構成](/cloud/manage/backups/overview#configurable-backups)   | 利用可能   | GCP, AWS, Azure      | Scale または Enterprise |
  | [顧客管理の暗号化キー (CMEK)](/cloud/security/cmek) で透過的なデータ暗号化                  | 利用可能   | AWS, GCP            | Enterprise            |
  | [フィールドレベルの暗号化](/sql-reference/functions/encryption-functions) と手動キー管理         | 利用可能   | GCP, AWS, Azure      | すべて                |

</details>
<details>
  <summary>データ保持</summary>

  | 設定                                                                                             | ステータス | クラウド            | サービスレベル       |  
  |--------------------------------------------------------------------------------------------------|-----------|---------------------|----------------------|
  | [有効期限 (TTL)](/sql-reference/statements/alter/ttl) 設定で保持を管理                      | 利用可能   | AWS, GCP, Azure      | すべて                |
  | [ALTER TABLE DELETE](/sql-reference/statements/alter/delete) 重い削除アクション用             | 利用可能   | AWS, GCP, Azure      | すべて                |
  | [ライトウェイト DELETE](/sql-reference/statements/delete) 測定された削除活動用              | 利用可能   | AWS, GCP, Azure      | すべて                |

</details>
<details>
  <summary>監査とログ</summary>

  | 設定                                                                                             | ステータス | クラウド            | サービスレベル       |  
  |--------------------------------------------------------------------------------------------------|-----------|---------------------|----------------------|
  | [監査ログ](/cloud/security/audit-logging) コントロールプレーン活動用                        | 利用可能   | AWS, GCP, Azure      | すべて                |
  | [セッションログ](/operations/system-tables/session_log) データベース活動用                     | 利用可能   | AWS, GCP, Azure      | すべて                |
  | [クエリログ](/operations/system-tables/query_log) データベース活動用                         | 利用可能   | AWS, GCP, Azure      | すべて                |

</details>

## ClickHouse Cloud コンプライアンス {#clickhouse-cloud-compliance}

  | フレームワーク                                                                                   | ステータス | クラウド            | サービスレベル       |  
  |--------------------------------------------------------------------------------------------------|-----------|---------------------|----------------------|
  | ISO 27001 コンプライアンス                                                                         | 利用可能   | AWS, GCP, Azure      | すべて                |
  | SOC 2 Type II コンプライアンス                                                                      | 利用可能   | AWS, GCP, Azure      | すべて                |
  | GDPR および CCPA コンプライアンス                                                                    | 利用可能   | AWS, GCP, Azure      | すべて                |
  | HIPAA コンプライアンス                                                                               | 利用可能   | AWS, GCP            | Enterprise            |
  | PCI コンプライアンス                                                                                 | 利用可能   | AWS                 | Enterprise            |

  サポートされているコンプライアンスフレームワークの詳細については、[セキュリティとコンプライアンス](/cloud/security/security-and-compliance) ページをご覧ください。
