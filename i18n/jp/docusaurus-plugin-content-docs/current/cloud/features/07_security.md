---
sidebar_label: 'セキュリティ'
slug: /cloud/security
title: 'セキュリティ'
description: 'ClickHouse Cloud と BYOC を保護する方法について学ぶ'
doc_type: 'reference'
keywords: ['セキュリティ', 'クラウドセキュリティ', 'アクセス制御', 'コンプライアンス', 'データ保護']
---

# ClickHouse Cloud のセキュリティ \{#clickhouse-cloud-security\}

本ドキュメントでは、ClickHouse Cloud の組織およびサービスを保護するために利用可能なセキュリティオプションとベストプラクティスについて詳述します。
ClickHouse は、安全な分析用データベースソリューションを提供することに注力しており、データおよびサービスの完全性を保護することを最優先事項としています。
ここでは、ユーザーが ClickHouse 環境を保護するのに役立つよう設計された、さまざまな方法について説明します。

## クラウドコンソールの認証 \{#cloud-console-auth\}

### パスワード認証 \{#password-auth\}

ClickHouse Cloud コンソールのパスワードは NIST 800-63B 標準に準拠しており、12 文字以上で、大文字・小文字・数字・特殊文字の 4 種類のうち 3 種類を含む複雑性要件を満たす必要があります。

[パスワード認証](/cloud/security/manage-my-account#email-and-password)の詳細はこちらをご覧ください。

### ソーシャルシングルサインオン (SSO) \{#social-sso\}

ClickHouse Cloud は、Google または Microsoft のソーシャル認証によるシングルサインオン (SSO) をサポートしています。

[ソーシャル SSO](/cloud/security/manage-my-account#social-sso)の詳細はこちらをご覧ください。

### 多要素認証 (MFA) \{#mfa\}

メールアドレスとパスワード、またはソーシャル SSO を利用しているユーザーは、Authy や Google Authenticator などの認証アプリを利用した多要素認証も設定できます。

[多要素認証](/cloud/security/manage-my-account/#mfa)の詳細はこちらをご覧ください。

### Security Assertion Markup Language (SAML) 認証 \{#saml-auth\}

エンタープライズのお客様は、SAML 認証を設定できます。

[SAML 認証](/cloud/security/saml-setup)の詳細はこちらをご覧ください。

### API 認証 \{#api-auth\}

お客様は、OpenAPI、Terraform、および Query API エンドポイントで使用するための API キーを設定できます。

[API 認証](/cloud/manage/openapi)の詳細はこちらをご覧ください。

## データベース認証 \{#database-auth\}

### データベースパスワード認証 \{#db-password-auth\}

ClickHouse データベースユーザーのパスワードは、NIST 800-63B 標準に準拠するよう設定されており、12 文字以上であることに加え、大文字・小文字・数字および／または特殊文字を含むといった複雑性要件を満たす必要があります。

[データベースパスワード認証](/cloud/security/manage-database-users#database-user-id--password)の詳細をご覧ください。

### Secure Shell (SSH) データベース認証 \{#ssh-auth\}

ClickHouse データベースユーザーは、SSH 認証を使用するように設定できます。

[SSH 認証](/cloud/security/manage-database-users#database-ssh)の詳細をご覧ください。

## アクセス制御 \{#access-control\}

### コンソールのロールベースアクセス制御 (RBAC) \{#console-rbac\}

ClickHouse Cloud は、組織・サービス・データベースの各権限に対するロール割り当てをサポートしています。この方法で設定したデータベース権限は、SQL コンソールでのみ利用できます。

[コンソール RBAC](/cloud/security/console-roles) の詳細をご覧ください。

### データベースユーザーの権限付与 \{#database-user-grants\}

ClickHouse のデータベースは、ユーザーへの権限付与に基づくきめ細かな権限管理とロールベースアクセスをサポートしています。

[データベースユーザーの権限付与](/cloud/security/manage-database-users#database-permissions) の詳細をご覧ください。

## ネットワークセキュリティ \{#network-security\}

### IP フィルター \{#ip-filters\}

ClickHouse サービスへの受信接続を制限するために IP フィルターを設定します。

詳しくは、[IP フィルター](/cloud/security/setting-ip-filters)を参照してください。

### プライベート接続 \{#private-connectivity\}

プライベート接続を使用して、AWS、GCP、Azure から ClickHouse クラスターに接続します。

詳しくは、[プライベート接続](/cloud/security/connectivity/private-networking)を参照してください。

## 暗号化 \{#encryption\}

### ストレージレベルの暗号化 \{#storage-encryption\}

ClickHouse Cloud は、クラウドプロバイダー管理の AES-256 キーを使用して、保存中のデータをデフォルトで暗号化します。

詳しくは、[ストレージ暗号化](/cloud/security/cmek#storage-encryption)をご覧ください。

### 透過的データ暗号化 \{#tde\}

ストレージ暗号化に加えて、ClickHouse Cloud Enterprise のお客様は、追加の保護としてデータベースレベルの透過的データ暗号化を有効にできます。

詳しくは、[透過的データ暗号化](/cloud/security/cmek#transparent-data-encryption-tde)をご覧ください。

### お客様管理の暗号鍵 \{#cmek\}

ClickHouse Cloud Enterprise のお客様は、データベースレベルの暗号化に独自のキーを使用できます。

詳しくは、[お客様管理の暗号鍵](/cloud/security/cmek#customer-managed-encryption-keys-cmek)をご覧ください。

## 監査とログ記録 \{#auditing-logging\}

### コンソール監査ログ \{#console-audit-log\}

コンソール上の操作はログに記録されます。ログは確認およびエクスポートできます。

[コンソール監査ログ](/cloud/security/audit-logging/console-audit-log)の詳細をご覧ください。

### データベース監査ログ \{#database-audit-logs\}

データベース上の操作はログに記録されます。ログは確認およびエクスポートできます。

[データベース監査ログ](/cloud/security/audit-logging/database-audit-log)の詳細をご覧ください。

### BYOC セキュリティプレイブック \{#byoc-security-playbook\}

ClickHouse BYOC インスタンスを管理するセキュリティチーム向けのサンプル検出クエリです。

[BYOC セキュリティプレイブック](/cloud/security/audit-logging/byoc-security-playbook)の詳細をご覧ください。

## コンプライアンス \{#compliance\}

### セキュリティおよびコンプライアンスレポート \{#compliance-reports\}

ClickHouse は堅牢なセキュリティおよびコンプライアンスプログラムを運用しています。新しい第三者監査レポートについて、定期的にご確認ください。

[セキュリティおよびコンプライアンスレポート](/cloud/security/compliance-overview)の詳細をご覧ください。

### HIPAA 準拠サービス \{#hipaa-compliance\}

ClickHouse Cloud Enterprise のお客様は、Business Associate Agreement (BAA) を締結した後、保護対象医療情報 (PHI) を保管するサービスを HIPAA 準拠リージョンにデプロイできます。

[HIPAA 準拠](/cloud/security/compliance/hipaa-onboarding)の詳細をご覧ください。

### PCI 準拠サービス \{#pci-compliance\}

ClickHouse Cloud Enterprise のお客様は、クレジットカード情報を保管するサービスを PCI 準拠リージョンにデプロイできます。

[PCI 準拠](/cloud/security/compliance/pci-onboarding)の詳細をご覧ください。