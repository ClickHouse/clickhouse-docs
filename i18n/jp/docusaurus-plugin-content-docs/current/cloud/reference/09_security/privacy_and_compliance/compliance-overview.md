---
'title': 'セキュリティとコンプライアンスレポート'
'slug': '/cloud/security/compliance-overview'
'description': 'ClickHouse Cloudのセキュリティおよびコンプライアンス認証の概要には、SOC 2、ISO 27001、U.S. DPF、HIPAAが含まれます'
'doc_type': 'guide'
---

import BetaBadge from '@theme/badges/BetaBadge';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge';


# セキュリティおよびコンプライアンスレポート
ClickHouse Cloud は、顧客のセキュリティおよびコンプライアンスのニーズを評価し、追加のレポートが要求されるに従ってプログラムを継続的に拡充しています。追加情報やレポートのダウンロードについては、私たちの [Trust Center](https://trust.clickhouse.com) を訪問してください。

### SOC 2 タイプ II (2022年以降) {#soc-2-type-ii-since-2022}

システムと組織の管理 (SOC) 2 は、セキュリティ、可用性、機密性、処理の整合性、プライバシー基準に焦点を当てたレポートであり、これはトラストサービス基準 (TSC) に基づいています。組織のシステムに適用され、これらの管理について信頼できる第三者（顧客）に対して保証を提供することを目的としています。ClickHouse は、毎年少なくとも一度、独立した外部監査人と協力して、セキュリティ、可用性、システムの処理の整合性、処理されたデータの機密性およびプライバシーについて監査を受けます。このレポートは、ClickHouse Cloud とお客様自身のクラウド (BYOC) の両方の提供内容に関しています。

### ISO 27001 (2023年以降) {#iso-27001-since-2023}

国際標準化機構 (ISO) 27001 は、情報セキュリティに関する国際標準です。企業は、リスク管理、ポリシーの作成およびコミュニケーション、セキュリティ管理の実施、関連性と有効性を確保するためのモニタリングを含む情報セキュリティ管理システム (ISMS) を実装する必要があります。ClickHouse は、内部監査を実施し、独立した外部監査人と協力して、証明書発行の間の2年間にわたり監査および中間検査を受けます。

### 米国データプライバシーフレームワーク (2024年以降) {#us-dpf-since-2024}

米国データプライバシーフレームワークは、米国の組織がEU、英国、スイスから米国への個人データの移転を行うための信頼できるメカニズムを提供するために開発されました。ClickHouse はこのフレームワークに自己認証しており、[データプライバシーフレームワークリスト](https://dataprivacyframework.gov/list) に掲載されています。

### HIPAA (2024年以降) {#hipaa-since-2024}

<EnterprisePlanFeatureBadge feature="HIPAA"/>

HIPAA 準拠の地域にサービスを展開して電子保護健康情報 (ePHI) を読み込むことを希望する顧客は、コンソールの **Organization** ページを訪れて機能の有効化をリクエストできます。営業担当者が連絡を取り、セットアップを完了するために署名されたビジネスアソシエイト契約 (BAA) を取得します。HIPAA 準拠の地域に展開する顧客は、私たちの [共有責任モデル](/cloud/security/shared-responsibility-model) を確認し、ユースケースに適した管理を選択して実装する必要があります。

1996年の健康保険の携行性と説明責任に関する法律 (HIPAA) は、保護された健康情報 (PHI) の管理に焦点を当てた米国のプライバシー法です。HIPAA には、電子的な個人健康情報 (ePHI) を保護することに焦点を当てた [セキュリティルール](https://www.hhs.gov/hipaa/for-professionals/security/index.html) など、いくつかの要件があります。ClickHouse は、指定されたサービスに保存されている ePHI の機密性、整合性、セキュリティを確保するための管理的、物理的および技術的な保護策を実施しています。これらの活動は、私たちの [Trust Center](https://trust.clickhouse.com) にてダウンロード可能な SOC 2 タイプ II レポートに含まれています。

### PCI サービスプロバイダー (2025年以降) {#pci-service-provider-since-2025}

<EnterprisePlanFeatureBadge feature="PCI compliance"/>

カード会員データをロードするために PCI 準拠の地域にサービスを展開したい顧客は、コンソールの **Organization** ページを訪れて機能を有効化できます。有効化後、顧客は新しいサービスを展開する際に「PCI 準拠」地域タイプを選択できます。PCI 準拠の地域に展開する顧客は、私たちの [Trust Center](https://trust.clickhouse.com) にて入手可能な PCI 責任の概要を確認し、ユースケースに適した管理を選択して実装する必要があります。

[Payment Card Industry Data Security Standard (PCI DSS)](https://www.pcisecuritystandards.org/standards/pci-dss/) は、クレジットカードの支払データを保護するために PCI セキュリティ基準協会によって作成された一連のルールです。ClickHouse は、クレジットカードデータの保存に関して第3者の Qualified Security Assessor (QSA) による外部監査を受け、PCI 基準に基づく Compliance (ROC) に合格しました。私たちの Attestation on Compliance (AOC) および PCI 責任の概要のコピーをダウンロードするには、私たちの [Trust Center](https://trust.clickhouse.com) を訪れてください。


# プライバシーコンプライアンス

上記の項目に加えて、ClickHouse は一般データ保護規則 (GDPR)、カリフォルニア州消費者プライバシー法 (CCPA) およびその他の関連するプライバシーフレームワークに対処する内部コンプライアンスプログラムを維持しています。ClickHouse が収集する個人データ、その使用方法、その保護方法、およびその他のプライバシー関連情報の詳細は、以下の場所に見つけることができます。

### 法的文書 {#legal-documents}

- [プライバシーポリシー](https://clickhouse.com/legal/privacy-policy)
- [クッキーポリシー](https://clickhouse.com/legal/cookie-policy)
- [データプライバシーフレームワーク通知](https://clickhouse.com/legal/data-privacy-framework)
- [データ処理附則 (DPA)](https://clickhouse.com/legal/agreements/data-processing-addendum)

### 処理場所 {#processing-locations}

- [サブプロセッサーおよび関連会社](https://clickhouse.com/legal/agreements/subprocessors)
- [データ処理場所](https://trust.clickhouse.com)

### 追加手続き {#additional-procedures}

- [個人データアクセス](/cloud/security/personal-data-access)
- [アカウント削除](/cloud/manage/close_account)


# 支払いコンプライアンス

ClickHouse は、[PCI SAQ A v4.0](https://www.pcisecuritystandards.org/document_library/) に準拠したクレジットカードによる支払いの安全な方法を提供します。
