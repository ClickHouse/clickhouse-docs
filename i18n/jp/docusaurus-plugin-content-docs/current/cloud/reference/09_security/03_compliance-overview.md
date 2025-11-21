---
title: 'コンプライアンス概要'
slug: /cloud/security/compliance-overview
description: 'SOC 2、ISO 27001、U.S. DPF、HIPAA を含む ClickHouse Cloud のセキュリティおよびコンプライアンスに関する認証の概要'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'SOC 2 Type II', 'ISO 27001', 'HIPAA', 'U.S. DPF', 'PCI']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティおよびコンプライアンスレポート
ClickHouse はお客様のセキュリティおよびコンプライアンス要件を評価し、追加のレポートが求められるに応じて、プログラムを継続的に拡充しています。詳細情報やレポートのダウンロードについては、[Trust Center](https://trust.clickhouse.com) をご覧ください。



## SOC 2 Type II（2022年以降） {#soc-2-type-ii-since-2022}

System and Organization Controls（SOC）2は、組織のシステムに適用されるTrust Services Criteria（TSC）に含まれるセキュリティ、可用性、機密性、処理の完全性、プライバシーの基準に焦点を当てた報告書であり、これらの統制について依拠当事者（当社の顧客）に保証を提供することを目的としています。ClickHouseは独立した外部監査人と協力し、当社システムのセキュリティ、可用性、処理の完全性、および当社システムで処理されるデータの機密性とプライバシーに関する監査を少なくとも年1回受けています。本報告書は、ClickHouse CloudとBring Your Own Cloud（BYOC）の両方のサービス提供を対象としています。


## ISO 27001 (2023年以降) {#iso-27001-since-2023}

国際標準化機構(ISO) 27001は、情報セキュリティに関する国際規格です。この規格では、企業に対し、リスク管理、ポリシーの策定と周知、セキュリティ管理策の実装、および各要素が適切かつ有効であり続けることを保証するための監視を含む情報セキュリティマネジメントシステム(ISMS)の実装を求めています。ClickHouseは内部監査を実施するとともに、独立した外部監査人と協力し、認証取得後2年間にわたる監査および中間審査を受けています。


## U.S. DPF (2024年以降) {#us-dpf-since-2024}

米国データプライバシーフレームワークは、欧州連合/欧州経済領域、英国、およびスイスから米国への個人データ転送に関して、EU、英国、スイスの法律に準拠した信頼性の高い仕組みを米国の組織に提供するために策定されました(https://dataprivacyframework.gov/Program-Overview)。ClickHouseは本フレームワークへの自己認証を完了しており、[データプライバシーフレームワークリスト](https://dataprivacyframework.gov/list)に掲載されています。


## HIPAA(2024年以降) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature='HIPAA' />

1996年医療保険の携行性と責任に関する法律(HIPAA)は、保護対象医療情報(PHI)の管理に焦点を当てた米国のプライバシー法です。HIPAAには、電子保護医療情報(ePHI)の保護に焦点を当てた[セキュリティ規則](https://www.hhs.gov/hipaa/for-professionals/security/index.html)を含む、複数の要件があります。ClickHouseは、指定されたサービスに保存されるePHIの機密性、完全性、セキュリティを確保するために、管理面、物理面、技術面での保護措置を実装しています。これらの取り組みは、[トラストセンター](https://trust.clickhouse.com)でダウンロード可能なSOC 2 Type IIレポートに記載されています。

事業提携契約(BAA)の締結およびHIPAA準拠サービスのデプロイ手順については、[HIPAAオンボーディング](//cloud/security/compliance/hipaa-onboarding)を参照してください。


## PCIサービスプロバイダー（2025年以降） {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature='PCI compliance' />

[Payment Card Industry Data Security Standard（PCI DSS）](https://www.pcisecuritystandards.org/standards/pci-dss/)は、クレジットカード決済データを保護するためにPCI Security Standards Councilによって策定された規則群です。ClickHouseは、Qualified Security Assessor（QSA）による外部監査を受け、クレジットカードデータの保管に関連するPCI基準に対する適合報告書（ROC）において合格の評価を得ました。適合証明書（AOC）およびPCI責任範囲の概要をダウンロードするには、[Trust Center](https://trust.clickhouse.com)をご覧ください。

PCI準拠サービスをデプロイする手順については、[PCIオンボーディング](//cloud/security/compliance/pci-onboarding)を参照してください。


## プライバシーコンプライアンス {#privacy-compliance}

上記の項目に加え、ClickHouseは一般データ保護規則(GDPR)、カリフォルニア州消費者プライバシー法(CCPA)、その他の関連するプライバシーフレームワークに対応した社内コンプライアンスプログラムを維持しています。


## 支払いコンプライアンス {#payment-compliance}

ClickHouseは、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)に準拠した安全なクレジットカード決済方法を提供しています。
