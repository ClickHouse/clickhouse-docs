---
sidebar_label: 'セキュリティとコンプライアンス'
slug: '/cloud/security/security-and-compliance'
title: 'セキュリティとコンプライアンス'
description: 'このページでは、ClickHouse Cloud によって実装されたセキュリティとコンプライアンス対策について説明します。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティとコンプライアンスレポート
ClickHouse Cloudは、お客様のセキュリティおよびコンプライアンスニーズを評価し、追加のレポートのリクエストに応じてプログラムを継続的に拡張しています。詳細情報やレポートのダウンロードについては、当社の[Trust Center](https://trust.clickhouse.com)をご覧ください。

### SOC 2 タイプ II (2022年以降) {#soc-2-type-ii-since-2022}

System and Organization Controls (SOC) 2は、セキュリティ、可用性、機密性、処理の整合性、およびプライバシー基準に焦点を当てたレポートであり、Trust Services Criteria (TSC)が組織のシステムに適用され、これらのコントロールに関して依存者（私たちの顧客）に対して保証を提供するために設計されています。ClickHouseは独立した外部監査人と連携して、少なくとも年に1回は監査を実施し、私たちのシステムのセキュリティ、可用性、および処理の整合性、ならびに私たちのシステムによって処理されるデータの機密性とプライバシーに関して検討します。このレポートは、私たちのClickHouse CloudとBring Your Own Cloud (BYOC)の提供に関するものです。

### ISO 27001 (2023年以降) {#iso-27001-since-2023}

International Standards Organization (ISO) 27001は、情報セキュリティに関する国際標準です。企業がリスク管理、ポリシー作成およびコミュニケーション、セキュリティコントロールの実施、およびコンポーネントが関連性と有効性を維持することを確保するための監視を含む情報セキュリティ管理システム (ISMS)を実装することを要求しています。ClickHouseは内部監査を実施し、独立した外部監査人と協力して、認証発行間の2年間にわたって監査および中間検査を実施しています。

### U.S. DPF (2024年以降) {#us-dpf-since-2024}

U.S. Data Privacy Frameworkは、米国の組織が欧州連合/欧州経済地域、英国、スイスから米国への個人データ移転に関する信頼できるメカニズムを提供するために開発され、EU、UK、およびスイスの法律に準拠するものです (https://dataprivacyframework.gov/Program-Overview)。ClickHouseはフレームワークに自己認証し、[Data Privacy Framework List](https://dataprivacyframework.gov/list)に掲載されています。

### HIPAA (2024年以降) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

お客様はビジネスアソシエイト契約 (BAA) に署名し、ePHIのロードにHIPAA準拠地域にサービスをオンボードするために営業またはサポートに連絡する必要があります。さらに、お客様は私たちの[共有責任モデル](/cloud/security/shared-responsibility-model)を確認し、使用ケースに適したコントロールを選択および実装する必要があります。

1996年の健康保険のポータビリティおよび説明責任に関する法律 (HIPAA) は、保護された健康情報 (PHI) の管理に焦点を当てた米国のプライバシー法です。HIPAAには、電子的個人健康情報 (ePHI) を保護することに焦点を当てた[セキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html)を含むいくつかの要件があります。ClickHouseは、指定されたサービスに保存されたePHIの機密性、整合性、およびセキュリティを確保するための管理的、物理的、技術的な保護策を実施しています。これらの活動は、私たちの[Trust Center](https://trust.clickhouse.com)でダウンロード可能なSOC 2 タイプ II レポートに組み込まれています。

### PCIサービスプロバイダー (2025年以降) {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance" support="true"/>

お客様は、カード保持者データをロードするためにPCI準拠地域にサービスをオンボードするために営業またはサポートに連絡する必要があります。さらに、お客様は私たちの[Trust Center](https://trust.clickhouse.com)で利用可能なPCI責任の概要を確認し、使用ケースに適したコントロールを選択および実装する必要があります。

[Payment Card Industry Data Security Standard (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/)は、クレジットカードの支払いデータを保護するためにPCIセキュリティ標準評議会によって作成された規則のセットです。ClickHouseは、クレジットカードデータの保存に関連するPCI基準に対する合格したコンプライアンスレポート (ROC) をもたらしたQualified Security Assessor (QSA)による外部監査を受けました。私たちのコンプライアンステストの証明書 (AOC) とPCI責任の概要をダウンロードするには、[Trust Center](https://trust.clickhouse.com)をご覧ください。


# プライバシーコンプライアンス

上記の項目に加えて、ClickHouseは一般データ保護規則 (GDPR)、カリフォルニア消費者プライバシー法 (CCPA)、およびその他の関連するプライバシーフレームワークに対処する内部コンプライアンスプログラムを維持しています。ClickHouseが収集する個人データ、その使用方法、保護方法、その他のプライバシー関連情報の詳細は、以下の場所で確認できます。

### 法的文書 {#legal-documents}

- [プライバシーポリシー](https://clickhouse.com/legal/privacy-policy)
- [クッキーポリシー](https://clickhouse.com/legal/cookie-policy)
- [データプライバシーフレームワーク通知](https://clickhouse.com/legal/data-privacy-framework)
- [データ処理付録 (DPA)](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 処理場所 {#processing-locations}

- [サブプロセッサーと提携先](https://clickhouse.com/legal/agreements/subprocessors)
- [データ処理の場所](https://trust.clickhouse.com) 

### 追加手続き {#additional-procedures}

- [個人データアクセス](/cloud/security/personal-data-access)
- [アカウント削除](/cloud/manage/close_account)


# 支払いコンプライアンス

ClickHouseは、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)に準拠したクレジットカードによる支払いの安全な方法を提供しています。
