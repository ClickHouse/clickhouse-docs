---
sidebar_label: 'セキュリティとコンプライアンス'
slug: /cloud/security/security-and-compliance
title: 'セキュリティとコンプライアンス'
description: 'このページでは、顧客データを保護するために ClickHouse Cloud で実施されているセキュリティとコンプライアンス対策について説明します。'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティとコンプライアンスレポート
ClickHouse Cloud は、顧客のセキュリティとコンプライアンスのニーズを評価し、追加のレポートが要求されるにつれてプログラムを継続的に拡張しています。追加の情報やレポートのダウンロードについては、私たちの [Trust Center](https://trust.clickhouse.com) を訪問してください。

### SOC 2 Type II (2022年より) {#soc-2-type-ii-since-2022}

システムおよび組織の管理 (SOC) 2 は、セキュリティ、可用性、機密性、処理の整合性、プライバシー基準に焦点を当てたレポートです。これは、組織のシステムに適用され、これらの管理策について依存する当事者（私たちの顧客）に対する保証を提供するように設計されています。ClickHouse は独立した外部監査人と協力し、年間少なくとも1回、私たちのシステムのセキュリティ、可用性および処理の整合性、そして私たちのシステムによって処理されるデータの機密性とプライバシーに関する監査を受けています。レポートは、私たちの ClickHouse Cloud と Bring Your Own Cloud (BYOC) 提供を対象としています。

### ISO 27001 (2023年より) {#iso-27001-since-2023}

国際標準化機構 (ISO) 27001 は、情報セキュリティに関する国際基準です。企業は、リスク管理、ポリシーの作成と通知、セキュリティ制御の実施、およびコンポーネントが関連性と効果を維持することを確認するためのプロセスを含む情報セキュリティ管理システム（ISMS）を実装する必要があります。ClickHouse は内部監査を実施し、独立した外部監査人と協力して、証明書発行の2年間にわたって監査と中間検査を行います。

### 米国データプライバシーフレームワーク (2024年より) {#us-dpf-since-2024}

米国データプライバシーフレームワークは、米国の組織に対し、EU、英国、スイスから米国への個人データ転送のための信頼できるメカニズムを提供するために開発されており、EU、UK およびスイスの法律に準拠しています (https://dataprivacyframework.gov/Program-Overview)。ClickHouse はこのフレームワークに自己認証し、[データプライバシーフレームワークリスト](https://dataprivacyframework.gov/list) に掲載されています。

### HIPAA (2024年より) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA" support="true"/>

顧客はビジネスアソシエイト契約（BAA）を完了し、ePHIをロードするためにHIPAA準拠の地域にサービスをオンボードするには営業またはサポートに連絡する必要があります。さらに、顧客は当社の[共有責任モデル](/cloud/security/shared-responsibility-model) を確認し、自身のユースケースに適した管理策を選択し実装する必要があります。

1996年の健康保険の携行性と説明責任に関する法（HIPAA）は、保護された健康情報（PHI）の管理に焦点を当てた米国のプライバシー法です。HIPAA には、電子的な個人健康情報（ePHI）を保護することに重点を置く[セキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html)など、いくつかの要件があります。ClickHouse は、指定されたサービスに保存された ePHI の機密性、整合性およびセキュリティを確保するために、行政的、物理的および技術的な保護策を実施しています。これらの活動は、私たちの[Trust Center](https://trust.clickhouse.com) でダウンロード可能な SOC 2 Type II レポートに組み込まれています。

### PCIサービスプロバイダー (2025年より) {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance" support="true"/>

顧客はカード保有者データをロードするために、PCI準拠の地域にサービスをオンボードするには営業またはサポートに連絡する必要があります。さらに、顧客は当社の[PCI責任概要](https://trust.clickhouse.com) を確認し、自身のユースケースに適した管理策を選択し実装する必要があります。

[Payment Card Industry Data Security Standard (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/) は、クレジットカード支払いデータを保護するために PCI セキュリティ基準評議会によって作成された一連の規則です。ClickHouse は、クレジットカードデータの保存に関連する PCI 基準に対して合格のコンプライアンスレポート (ROC) を受ける外部監査を専門のセキュリティアセッサー (QSA) と共に受けました。コンプライアンス証明書 (AOC) および PCI 責任概要のコピーをダウンロードするには、私たちの [Trust Center](https://trust.clickhouse.com) を訪れてください。


# プライバシーコンプライアンス

上記の項目に加えて、ClickHouse は一般データ保護規則 (GDPR)、カリフォルニア州消費者プライバシー法 (CCPA) およびその他の関連プライバシーフレームワークに対処する内部コンプライアンスプログラムを維持しています。ClickHouse が収集する個人データ、その使用方法、保護方法、その他のプライバシー関連情報の詳細については、以下の場所をご覧ください。

### 法的文書 {#legal-documents}

- [プライバシーポリシー](https://clickhouse.com/legal/privacy-policy)
- [クッキーポリシー](https://clickhouse.com/legal/cookie-policy)
- [データプライバシーフレームワーク通知](https://clickhouse.com/legal/data-privacy-framework)
- [データ処理に関する付録 (DPA)](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 処理場所 {#processing-locations}

- [サブプロセッサーおよび関連会社](https://clickhouse.com/legal/agreements/subprocessors)
- [データ処理場所](https://trust.clickhouse.com) 

### 追加手続き {#additional-procedures}

- [個人データアクセス](/cloud/security/personal-data-access)
- [アカウント削除](/cloud/manage/close_account)


# 支払いコンプライアンス

ClickHouse は、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) に準拠したクレジットカード支払いのための安全な方法を提供します。
