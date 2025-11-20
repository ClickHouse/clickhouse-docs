---
sidebar_label: '個人データへのアクセス'
slug: /cloud/manage/personal-data-access
title: '個人データへのアクセス'
description: '登録ユーザーは、ClickHouse で連絡先情報を含む自身のアカウントの個人データを表示および管理できます。'
doc_type: 'reference'
keywords: ['ClickHouse Cloud', 'personal data', 'DSAR', 'data subject access request', 'privacy policy', 'GDPR']
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';


## はじめに {#intro}

登録ユーザーは、ClickHouseで連絡先情報を含む個人アカウントデータを閲覧・管理できます。役割によっては、組織内の他のユーザーの連絡先情報、APIキーの詳細、その他の関連情報にもアクセスできる場合があります。これらの情報は、ClickHouseコンソールからセルフサービスで直接管理できます。

**データ主体アクセス要求（DSAR）とは**

お住まいの地域によっては、ClickHouseが保有するあなたの個人データに関して、適用法により追加の権利（データ主体の権利）が付与される場合があります。詳細はClickHouseプライバシーポリシーに記載されています。データ主体の権利を行使する手続きは、データ主体アクセス要求（DSAR）と呼ばれます。

**個人データの範囲**

ClickHouseが収集する個人データとその利用方法の詳細については、ClickHouseプライバシーポリシーをご確認ください。


## セルフサービス {#self-service}

デフォルトでは、ClickHouseはユーザーがClickHouseコンソールから直接個人データを閲覧できるようにしています。

以下は、アカウント設定およびサービス利用時にClickHouseが収集するデータの概要と、ClickHouseコンソール内で特定の個人データを閲覧できる場所に関する情報です。

| 場所/URL                                                 | 説明                                       | 個人データ          |
| ------------------------------------------------------------ | ------------------------------------------------- | ---------------------- |
| https://auth.clickhouse.cloud/u/signup/                      | アカウント登録                              | メールアドレス、パスワード        |
| https://console.clickhouse.cloud/profile                     | ユーザープロフィールの詳細                      | 氏名、メールアドレス            |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザー一覧                  | 氏名、メールアドレス            |
| https://console.clickhouse.cloud/organizations/OrgID/keys    | APIキー一覧と作成者             | メールアドレス                  |
| https://console.clickhouse.cloud/organizations/OrgID/audit   | 個別ユーザーのアクションを記録したアクティビティログ | メールアドレス                  |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報と請求書                  | 請求先住所、メールアドレス |
| https://console.clickhouse.cloud/support                     | ClickHouseサポートとのやり取り              | 氏名、メールアドレス            |

注意：`OrgID`を含むURLは、お客様のアカウントの`OrgID`を反映するように更新する必要があります。

### 既存のお客様 {#current-customers}

アカウントをお持ちで、セルフサービスオプションで個人データの問題が解決しなかった場合は、プライバシーポリシーに基づいてデータ主体アクセス要求を提出できます。これを行うには、ClickHouseアカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を開いてください。これにより、本人確認が行われ、お客様のリクエストに対応するプロセスが円滑化されます。

サポートケースには必ず以下の詳細を含めてください：

| フィールド       | リクエストに含めるテキスト                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------- |
| 件名     | データ主体アクセス要求（DSAR）                                                                  |
| 説明 | ClickHouseに検索、収集、および/または提供してほしい情報の詳細な説明。 |

<Image
  img={support_case_form}
  size='sm'
  alt='ClickHouse Cloudのサポートケースフォーム'
  border
/>

### アカウントをお持ちでない方 {#individuals-without-an-account}

アカウントをお持ちでなく、上記のセルフサービスオプションで個人データの問題が解決せず、プライバシーポリシーに基づいてデータ主体アクセス要求を行いたい場合は、[privacy@clickhouse.com](mailto:privacy@clickhouse.com)宛にメールでリクエストを提出できます。


## 本人確認 {#identity-verification}

電子メールでデータ主体アクセス要求を提出される場合、本人確認およびリクエストの処理のために、特定の情報の提供をお願いすることがあります。適用法により、リクエストをお断りすることが求められる、または許可される場合があります。リクエストをお断りする場合は、法的制限の範囲内でその理由をお伝えします。

詳細については、[ClickHouseプライバシーポリシー](https://clickhouse.com/legal/privacy-policy)をご確認ください。
