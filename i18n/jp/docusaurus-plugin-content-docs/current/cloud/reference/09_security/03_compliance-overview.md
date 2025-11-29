---
title: 'コンプライアンスの概要'
slug: /cloud/security/compliance-overview
description: 'SOC 2、ISO 27001、U.S. DPF、HIPAA などを含む ClickHouse Cloud のセキュリティおよびコンプライアンス認証の概要'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'SOC 2 Type II', 'ISO 27001', 'HIPAA', 'U.S. DPF', 'PCI']
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティおよびコンプライアンスレポート {#security-and-compliance-reports}
ClickHouse はお客様のセキュリティおよびコンプライアンスに関するニーズを評価し、追加のレポートに対するご要望に応じてプログラムの拡充を継続しています。詳細やレポートのダウンロードは、[Trust Center](https://trust.clickhouse.com) をご覧ください。



## SOC 2 Type II（2022年以降） {#soc-2-type-ii-since-2022}

System and Organization Controls（SOC）2 は、Trust Services Criteria（TSC）で定められたセキュリティ、可用性、機密性、処理の完全性およびプライバシーに関する基準を、組織のシステムに適用したものに焦点を当てた報告書であり、これらの管理策について依拠当事者（当社のお客様）に保証を提供することを目的としています。ClickHouse は、独立した外部監査人と協力し、少なくとも年に一度、当社システムのセキュリティ、可用性および処理の完全性、ならびに当社システムによって処理されるデータの機密性およびプライバシーに関する監査を受けています。本報告書は、当社の ClickHouse Cloud と Bring Your Own Cloud（BYOC）の両方のサービスを対象としています。 



## ISO 27001（2023年以降） {#iso-27001-since-2023}

国際標準化機構（ISO）27001は、情報セキュリティに関する国際規格です。この規格では、企業に対して、リスク管理、ポリシーの策定・周知、セキュリティコントロールの実装、ならびに各構成要素が常に適切かつ有効であり続けることを確認するための監視プロセスを含む情報セキュリティマネジメントシステム（ISMS）の導入を求めています。ClickHouseは内部監査を実施するとともに、独立した外部監査人と連携し、認証書の発行から2年間にわたり監査および中間審査を受けています。 



## 米国 DPF（2024 年以降） {#us-dpf-since-2024}

U.S. Data Privacy Framework は、EU／欧州経済領域（EEA）、英国、およびスイスから米国への個人データ移転について、EU、英国、スイスの法令と整合する信頼性の高いメカニズムを米国の組織に提供するために策定された枠組みです (https://dataprivacyframework.gov/Program-Overview)。ClickHouse はこの枠組みに自己適合宣言を行っており、[Data Privacy Framework List](https://dataprivacyframework.gov/list) に掲載されています。



## HIPAA（2024年以降） {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA"/>

1996年に制定された Health Insurance Portability and Accountability Act（HIPAA）は、保護対象医療情報（PHI）の管理に焦点を当てた米国のプライバシー法です。HIPAA には複数の要件があり、その一つである[セキュリティ規則（Security Rule）](https://www.hhs.gov/hipaa/for-professionals/security/index.html)は、電子保護対象医療情報（ePHI）の保護に重点を置いています。ClickHouse では、指定されたサービスに保存される ePHI の機密性、完全性、およびセキュリティを確保するため、管理的・物理的・技術的な保護対策を実装しています。これらの取り組みは、当社の [Trust Center](https://trust.clickhouse.com) からダウンロード可能な SOC 2 Type II レポートに反映されています。

Business Associate Agreement（BAA）の締結および HIPAA 準拠サービスのデプロイ手順については、[HIPAA オンボーディング](//cloud/security/compliance/hipaa-onboarding)を参照してください。



## PCI サービスプロバイダ（2025 年以降） {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

[Payment Card Industry Data Security Standard (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/) は、クレジットカード決済データを保護するために PCI Security Standards Council によって策定された一連のセキュリティ要件です。ClickHouse は Qualified Security Assessor (QSA) による外部監査を受け、クレジットカードデータの保存に関連する PCI 要件に対する適合報告書 (Report on Compliance, ROC) において合格判定を受けています。ClickHouse の Attestation of Compliance (AOC) および PCI における責任分界の概要をダウンロードするには、[Trust Center](https://trust.clickhouse.com) にアクセスしてください。

PCI に準拠したサービスをデプロイする手順については、[PCI onboarding](//cloud/security/compliance/pci-onboarding) を参照してください。



## プライバシーコンプライアンス {#privacy-compliance}

上記の項目に加えて、ClickHouse は一般データ保護規則 (GDPR)、カリフォルニア消費者プライバシー法 (CCPA) およびその他の関連するプライバシーフレームワークに対応する内部コンプライアンスプログラムを運用しています。 



## 決済コンプライアンス {#payment-compliance}

ClickHouse は、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) に準拠した、安全なクレジットカード決済方法を提供します。 
