---
sidebar_label: セキュリティとコンプライアンス
slug: /cloud/security/security-and-compliance
title: セキュリティとコンプライアンス
---
import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティとコンプライアンス報告書
ClickHouse Cloud は、顧客のセキュリティとコンプライアンスのニーズを評価し、追加の報告書が要求されるたびにプログラムを継続的に拡張しています。追加情報や報告書のダウンロードについては、[Trust Center](https://trust.clickhouse.com)をご覧ください。

### SOC 2 Type II (2022年から) {#soc-2-type-ii-since-2022}

システムおよび組織の管理基準 (SOC) 2 は、セキュリティ、可用性、機密性、処理の整合性およびプライバシー基準に焦点を当てた報告書であり、組織のシステムに適用されるTrust Services Criteria (TSC)を含み、これらの管理基準に関する信頼できる当事者（顧客）への保証を提供することを目的としています。ClickHouseは、独立した外部監査人と連携し、ClickHouse Cloudのセキュリティ、可用性、機密性、処理の整合性に関する監査を年に少なくとも一度実施しています。

### ISO 27001 (2023年から) {#iso-27001-since-2023}

国際標準化機構 (ISO) 27001 は、情報セキュリティに関する国際標準です。企業は、リスク管理、ポリシーの策定と伝達、セキュリティ管理策の実施、およびコンポーネントが関連性を保ち、有効であることを確認するための監視プロセスを含む情報セキュリティ管理システム (ISMS) を実施する必要があります。ClickHouseは内部監査を実施し、2年間の証明書発行の間に独立した外部監査人と連携して監査と中間検査を受けています。

### 米国データプライバシーフレームワーク (2024年から) {#us-dpf-since-2024}

米国データプライバシーフレームワークは、米国の組織が欧州連合/欧州経済地域、英国、スイスからの個人データ移転のための信頼できるメカニズムを提供するために開発されました。このフレームワークは、EU、UK、スイスの法律に準拠しています (https://dataprivacyframework.gov/Program-Overview)。ClickHouseはこのフレームワークに自己認証し、[Data Privacy Framework List](https://dataprivacyframework.gov/list) に掲載されています。

### HIPAA (2024年から) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客は、ビジネスアソシエイト契約 (BAA) に署名し、HIPAA準拠地域にサービスをオンボードするために営業またはサポートに連絡する必要があります。さらに、顧客は、[shared responsibility model](/cloud/security/shared-responsibility-model) を確認し、使用ケースに適した管理策を選択し実施するべきです。

1996年の健康保険の適用性と責任に関する法律 (HIPAA) は、米国のプライバシー法であり、保護された健康情報 (PHI) の管理に焦点を当てています。HIPAAには、電子的な個人健康情報 (ePHI) を保護することに焦点を当てた[セキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html)など、いくつかの要件があります。ClickHouseは、指定されたサービスに格納されたePHIの機密性、整合性、およびセキュリティを確保するために、管理的、物理的、および技術的な保護策を実施しています。私たちは、2025年半ばにSOC 2にHIPAAを追加し、コンプライアンスプログラムの外部保証を提供する予定です。

### PCIサービスプロバイダー (2025年から) {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客は、カード保有者データをロードするために、PCI準拠地域にサービスをオンボードするために営業またはサポートに連絡する必要があります。さらに、顧客は、[Trust Center](https://trust.clickhouse.com)で利用可能なPCI責任概要を確認し、使用ケースに適した管理策を選択し実施するべきです。

[Payment Card Industry Data Security Standard (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/)は、クレジットカードの支払いデータを保護するためにPCIセキュリティ基準評議会が作成した一連のルールです。ClickHouseは、クレジットカードデータの保管に関連するPCI基準に基づいて、合格のコンプライアンスレポート (ROC) を受けた資格あるセキュリティアセッサー (QSA) による外部監査を受けました。コンプライアンス証明書 (AOC) およびPCI責任概要のコピーをダウンロードするには、[Trust Center](https://trust.clickhouse.com)をご覧ください。


# プライバシーコンプライアンス

上記の項目に加え、ClickHouseは一般データ保護規則 (GDPR)、カリフォルニア消費者プライバシー法 (CCPA)、およびその他の関連プライバシーフレームワークに関する内部コンプライアンスプログラムを維持しています。ClickHouseが収集する個人データ、どのように使用されるか、どのように保護されているか、その他のプライバシー関連情報の詳細は、以下の場所で確認できます。

### 法的文書 {#legal-documents}

- [プライバシーポリシー](https://clickhouse.com/legal/privacy-policy)
- [クッキーポリシー](https://clickhouse.com/legal/cookie-policy)
- [データプライバシーフレームワーク通知](https://clickhouse.com/legal/data-privacy-framework)
- [データ処理付加条項 (DPA)](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 処理場所 {#processing-locations}

- [サブプロセッサーおよび関連会社](https://clickhouse.com/legal/agreements/subprocessors)
- [データ処理場所](https://trust.clickhouse.com)

### その他の手続き {#additional-procedures}

- [個人データアクセス](/cloud/security/personal-data-access)
- [アカウント削除](/cloud/manage/close_account)


# 決済コンプライアンス

ClickHouseは、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)に準拠したクレジットカードで支払うための安全な方法を提供しています。
