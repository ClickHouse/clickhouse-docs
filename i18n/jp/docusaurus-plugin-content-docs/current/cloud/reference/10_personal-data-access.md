---
sidebar_label: '個人データへのアクセス'
slug: /cloud/manage/personal-data-access
title: '個人データへのアクセス'
description: '登録ユーザーは、ClickHouse 上で連絡先情報を含む自身のアカウントデータを表示および管理できます。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', '個人データ', 'DSAR', 'データ主体アクセス要求', 'プライバシーポリシー', 'GDPR']
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';


## イントロダクション \\{#intro\\}

登録ユーザーは、ClickHouse において連絡先情報を含むご自身の個人アカウントデータを閲覧および管理できます。お客様の役割によっては、組織内の他のユーザーの連絡先情報、API キーの詳細、その他関連情報へのアクセスが含まれる場合もあります。これらの詳細は、ClickHouse コンソールからセルフサービスで直接管理できます。

**データ主体アクセス要求 (DSAR) とは**

お客様の所在地域によっては、適用される法律に基づき、ClickHouse が保有するお客様の個人データ（データ主体の権利）について、ClickHouse プライバシーポリシーに記載されている追加の権利が認められる場合があります。データ主体の権利を行使するための手続きは、データ主体アクセス要求（Data Subject Access Request、DSAR）と呼ばれます。

**個人データの範囲**

ClickHouse が収集する個人データの詳細およびその利用方法については、ClickHouse プライバシーポリシーをご確認ください。



## セルフサービス \\{#self-service\\}

デフォルトでは、ClickHouse により、ユーザーは自分の個人データを ClickHouse コンソールから直接閲覧できます。

以下は、アカウント登録時およびサービス利用中に ClickHouse が収集するデータの概要と、特定の個人データを ClickHouse コンソール内のどこで閲覧できるかについての情報です。

| Location/URL | 説明 | 個人データ |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | アカウント登録 | email, password |
| https://console.clickhouse.cloud/profile | 一般的なユーザープロファイル情報 |  name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザー一覧 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API キーの一覧とその作成者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 個々のユーザーによる操作を一覧表示するアクティビティログ | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報および請求書 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouse Support とのやり取り | name, email |

注: `OrgID` を含む URL は、お使いのアカウント固有の `OrgID` を反映するように更新する必要があります。

### 既存のお客様 \\{#current-customers\\}

すでに当社のアカウントをお持ちで、セルフサービス機能を利用しても個人データに関する問題が解決しない場合、プライバシーポリシーに基づきデータ主体アクセス要求（Data Subject Access Request、DSAR）を提出できます。そのためには、ClickHouse アカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を作成してください。これにより、お客様の本人確認を行い、ご要望への対応プロセスを効率化できます。

サポートケースには、次の情報を必ず含めてください。

| 項目 | リクエストに記載する内容 |
|-------------|---------------------------------------------------|
| Subject     | Data Subject Access Request (DSAR)                |
| Description | ClickHouse に検索・収集・提供してほしい情報の詳細な説明。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloud におけるサポートケースフォーム" border />

### アカウントをお持ちでない方 \\{#individuals-without-an-account\\}

当社のアカウントをお持ちでなく、上記のセルフサービス機能を利用しても個人データに関する問題が解決せず、プライバシーポリシーに従ってデータ主体アクセス要求を行いたい場合は、[privacy@clickhouse.com](mailto:privacy@clickhouse.com) 宛ての電子メールでリクエストを送信できます。



## 本人確認 \\{#identity-verification\\}

メールでデータ主体アクセスリクエストを送信された場合、お客様の本人確認およびご請求の処理を行うために、特定の情報のご提供をお願いすることがあります。適用される法律により、当社がお客様のご請求を拒否しなければならない場合や、拒否することが認められている場合があります。当社がお客様のご請求を拒否する場合には、法的な制約がある場合を除き、その理由をお知らせします。

詳細については、[ClickHouse プライバシーポリシー](https://clickhouse.com/legal/privacy-policy)をご確認ください。
