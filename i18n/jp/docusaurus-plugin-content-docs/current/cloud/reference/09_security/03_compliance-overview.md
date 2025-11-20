---
title: 'コンプライアンス概要'
slug: /cloud/security/compliance-overview
description: 'SOC 2、ISO 27001、U.S. DPF、HIPAA など、ClickHouse Cloud のセキュリティおよびコンプライアンス認証の概要'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'SOC 2 Type II', 'ISO 27001', 'HIPAA', 'U.S. DPF', 'PCI']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティおよびコンプライアンスレポート
ClickHouse はお客様のセキュリティおよびコンプライアンス要件を評価し、追加レポートのリクエストに応じて、このプログラムを継続的に拡充しています。詳細やレポートのダウンロードについては、[Trust Center](https://trust.clickhouse.com) をご覧ください。



## SOC 2 Type II（2022年以降） {#soc-2-type-ii-since-2022}

System and Organization Controls（SOC）2は、組織のシステムに適用されるTrust Services Criteria（TSC）に含まれるセキュリティ、可用性、機密性、処理の完全性、プライバシーの基準に焦点を当てたレポートであり、これらの統制について信頼する当事者（当社の顧客）に保証を提供するよう設計されています。ClickHouseは独立した外部監査人と協力し、当社のシステムのセキュリティ、可用性、処理の完全性、および当社のシステムで処理されるデータの機密性とプライバシーに関する監査を少なくとも年1回受けています。このレポートは、ClickHouse CloudとBring Your Own Cloud（BYOC）の両方のサービス提供を対象としています。


## ISO 27001 (2023年以降) {#iso-27001-since-2023}

国際標準化機構(ISO) 27001は、情報セキュリティに関する国際規格です。この規格では、企業に対し、リスク管理、ポリシーの策定と周知、セキュリティ管理策の実装、および各要素の適切性と有効性を継続的に確保するための監視を含む情報セキュリティマネジメントシステム(ISMS)の実装を求めています。ClickHouseは内部監査を実施するとともに、独立した外部監査人と連携し、認証取得後2年間にわたる監査および中間審査を受けています。


## 米国DPF（2024年以降） {#us-dpf-since-2024}

米国データプライバシーフレームワーク（U.S. Data Privacy Framework）は、欧州連合/欧州経済領域、英国、およびスイスから米国への個人データ転送に関して、EU法、英国法、スイス法に準拠した信頼性の高い仕組みを米国の組織に提供するために開発されました（https://dataprivacyframework.gov/Program-Overview）。ClickHouseはこのフレームワークへの自己認証を完了しており、[Data Privacy Framework List](https://dataprivacyframework.gov/list)に掲載されています。


## HIPAA（2024年以降）{#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature='HIPAA' />

1996年医療保険の相互運用性と説明責任に関する法律（HIPAA）は、保護対象保健情報（PHI）の管理に焦点を当てた米国のプライバシー法です。HIPAAには、電子個人健康情報（ePHI）の保護に焦点を当てた[セキュリティ規則](https://www.hhs.gov/hipaa/for-professionals/security/index.html)を含む、いくつかの要件があります。ClickHouseは、指定されたサービスに保存されるePHIの機密性、完全性、およびセキュリティを確保するために、管理的、物理的、および技術的な保護措置を実装しています。これらの活動は、[トラストセンター](https://trust.clickhouse.com)でダウンロード可能なSOC 2 Type IIレポートに記載されています。

事業提携契約（BAA）の締結とHIPAA準拠サービスのデプロイ手順については、[HIPAAオンボーディング](//cloud/security/compliance/hipaa-onboarding)を参照してください。


## PCIサービスプロバイダー（2025年以降） {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature='PCI compliance' />

[Payment Card Industry Data Security Standard（PCI DSS）](https://www.pcisecuritystandards.org/standards/pci-dss/)は、クレジットカード決済データを保護するためにPCI Security Standards Councilによって策定された規則です。ClickHouseは、Qualified Security Assessor（QSA）による外部監査を受け、クレジットカードデータの保管に関連するPCI基準に対する適合報告書（Report on Compliance、ROC）で合格しました。適合証明書（Attestation on Compliance、AOC）およびPCI責任範囲の概要をダウンロードするには、[Trust Center](https://trust.clickhouse.com)をご覧ください。

PCI準拠サービスをデプロイする手順については、[PCIオンボーディング](//cloud/security/compliance/pci-onboarding)を参照してください。


## プライバシーコンプライアンス {#privacy-compliance}

上記に加えて、ClickHouseは一般データ保護規則(GDPR)、カリフォルニア州消費者プライバシー法(CCPA)、その他の関連するプライバシーフレームワークに対応した社内コンプライアンスプログラムを維持しています。


## 支払いコンプライアンス {#payment-compliance}

ClickHouseは、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/)に準拠した安全なクレジットカード決済方法を提供しています。
