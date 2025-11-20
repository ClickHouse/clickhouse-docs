---
sidebar_label: 'セキュリティ'
slug: /cloud/security
title: 'セキュリティ'
description: 'ClickHouse Cloud と BYOC のセキュリティについて学ぶ'
doc_type: 'reference'
keywords: ['security', 'cloud security', 'access control', 'compliance', 'data protection']
---



# ClickHouse Cloud セキュリティ

このドキュメントでは、ClickHouse の組織およびサービスを保護するために利用可能なセキュリティオプションとベストプラクティスについて説明します。
ClickHouse は安全な分析データベースソリューションの提供に力を入れており、そのためデータとサービスの完全性を保護することを最優先事項としています。
ここでは、ユーザーが ClickHouse 環境を安全に運用できるように設計された、さまざまな方法について説明します。



## クラウドコンソール認証 {#cloud-console-auth}

### パスワード認証 {#password-auth}

ClickHouse Cloudコンソールのパスワードは、NIST 800-63B標準に準拠して設定されており、最低12文字で、かつ以下の4つの複雑性要件のうち3つを満たす必要があります:大文字、小文字、数字、特殊文字。

[パスワード認証](/cloud/security/manage-my-account#email-and-password)の詳細をご覧ください。

### ソーシャルシングルサインオン(SSO) {#social-sso}

ClickHouse Cloudは、シングルサインオン(SSO)のためのGoogleまたはMicrosoftソーシャル認証をサポートしています。

[ソーシャルSSO](/cloud/security/manage-my-account#social-sso)の詳細をご覧ください。

### 多要素認証 {#mfa}

メールアドレスとパスワード、またはソーシャルSSOを使用するユーザーは、AuthyやGoogle Authenticatorなどの認証アプリを利用して多要素認証を設定することもできます。

[多要素認証](/cloud/security/manage-my-account/#mfa)の詳細をご覧ください。

### Security Assertion Markup Language (SAML) 認証 {#saml-auth}

エンタープライズのお客様はSAML認証を設定できます。

[SAML認証](/cloud/security/saml-setup)の詳細をご覧ください。

### API認証 {#api-auth}

お客様は、OpenAPI、Terraform、Query APIエンドポイントで使用するためのAPIキーを設定できます。

[API認証](/cloud/manage/openapi)の詳細をご覧ください。


## データベース認証 {#database-auth}

### データベースパスワード認証 {#db-password-auth}

ClickHouseデータベースユーザーのパスワードは、NIST 800-63B標準に準拠して設定されており、最低12文字の長さと複雑性要件(大文字、小文字、数字、および/または特殊文字)を満たす必要があります。

詳細については、[データベースパスワード認証](/cloud/security/manage-database-users#database-user-id--password)を参照してください。

### Secure Shell (SSH) データベース認証 {#ssh-auth}

ClickHouseデータベースユーザーは、SSH認証を使用するように設定できます。

詳細については、[SSH認証](/cloud/security/manage-database-users#database-ssh)を参照してください。


## アクセス制御 {#access-control}

### コンソールのロールベースアクセス制御（RBAC） {#console-rbac}

ClickHouse Cloudは、組織、サービス、データベースの権限に対するロール割り当てをサポートしています。この方法によるデータベース権限の管理は、SQLコンソールでのみ利用可能です。

詳細については、[コンソールRBAC](/cloud/security/console-roles)を参照してください。

### データベースユーザーの権限付与 {#database-user-grants}

ClickHouseデータベースは、ユーザーへの権限付与による詳細な権限管理とロールベースアクセスをサポートしています。

詳細については、[データベースユーザーの権限付与](/cloud/security/manage-database-users#database-permissions)を参照してください。


## ネットワークセキュリティ {#network-security}

### IPフィルター {#ip-filters}

IPフィルターを設定して、ClickHouseサービスへのインバウンド接続を制限します。

詳細については、[IPフィルター](/cloud/security/setting-ip-filters)を参照してください。

### プライベート接続 {#private-connectivity}

プライベート接続を使用して、AWS、GCP、またはAzureからClickHouseクラスターに接続します。

詳細については、[プライベート接続](/cloud/security/connectivity/private-networking)を参照してください。


## 暗号化 {#encryption}

### ストレージレベルの暗号化 {#storage-encryption}

ClickHouse Cloudは、クラウドプロバイダーが管理するAES 256キーを使用して、デフォルトで保存データを暗号化します。

詳細については、[ストレージの暗号化](/cloud/security/cmek#storage-encryption)を参照してください。

### 透過的データ暗号化 {#tde}

ストレージの暗号化に加えて、ClickHouse Cloud Enterpriseをご利用のお客様は、追加の保護としてデータベースレベルの透過的データ暗号化を有効にすることができます。

詳細については、[透過的データ暗号化](/cloud/security/cmek#transparent-data-encryption-tde)を参照してください。

### カスタマー管理の暗号化キー {#cmek}

ClickHouse Cloud Enterpriseをご利用のお客様は、データベースレベルの暗号化に独自のキーを使用することができます。

詳細については、[カスタマー管理の暗号化キー](/cloud/security/cmek#customer-managed-encryption-keys-cmek)を参照してください。


## 監査とログ記録 {#auditing-logging}

### コンソール監査ログ {#console-audit-log}

コンソール内のアクティビティはログに記録されます。ログの確認とエクスポートが可能です。

[コンソール監査ログ](/cloud/security/audit-logging/console-audit-log)の詳細をご覧ください。

### データベース監査ログ {#database-audit-logs}

データベース内のアクティビティはログに記録されます。ログの確認とエクスポートが可能です。

[データベース監査ログ](/cloud/security/audit-logging/database-audit-log)の詳細をご覧ください。

### BYOC セキュリティプレイブック {#byoc-security-playbook}

ClickHouse BYOC インスタンスを管理するセキュリティチーム向けの検出クエリサンプルです。

[BYOC セキュリティプレイブック](/cloud/security/audit-logging/byoc-security-playbook)の詳細をご覧ください。


## コンプライアンス {#compliance}

### セキュリティおよびコンプライアンスレポート {#compliance-reports}

ClickHouseは堅牢なセキュリティおよびコンプライアンスプログラムを維持しています。新しいサードパーティ監査レポートについては定期的にご確認ください。

[セキュリティおよびコンプライアンスレポート](/cloud/security/compliance-overview)の詳細をご覧ください。

### HIPAA準拠サービス {#hipaa-compliance}

ClickHouse Cloud Enterpriseのお客様は、Business Associate Agreement（BAA）への署名後、保護対象保健情報（PHI）を格納するサービスをHIPAA準拠リージョンにデプロイできます。

[HIPAA準拠](/cloud/security/compliance/hipaa-onboarding)の詳細をご覧ください。

### PCI準拠サービス {#pci-compliance}

ClickHouse Cloud Enterpriseのお客様は、クレジットカード情報を格納するサービスをPCI準拠リージョンにデプロイできます。

[PCI準拠](/cloud/security/compliance/pci-onboarding)の詳細をご覧ください。
