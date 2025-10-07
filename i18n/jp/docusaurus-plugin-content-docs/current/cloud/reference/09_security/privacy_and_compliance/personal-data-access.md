---
'sidebar_label': '個人データアクセス'
'slug': '/cloud/security/personal-data-access'
'title': '個人データアクセス'
'description': '登録ユーザーとして、ClickHouseはあなたの連絡先情報を含む個人アカウントデータを表示および管理することを許可します。'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## Intro {#intro}

登録ユーザーとして、ClickHouseはあなたの連絡先情報を含む個人アカウントデータを表示および管理することを許可します。あなたの役割に応じて、これは組織内の他のユーザーの連絡先情報、APIキーの詳細、その他の関連情報へのアクセスも含む場合があります。これらの詳細は、セルフサービスの形式でClickHouseコンソールを通じて直接管理できます。

**データ主体アクセス要求 (DSAR) とは**

あなたの所在に応じて、該当する法律はClickHouseが保持する個人データに関してあなたに追加の権利を提供する場合があります（データ主体の権利）、これはClickHouseプライバシーポリシーに記載されています。データ主体の権利を行使するためのプロセスは、データ主体アクセス要求（DSAR）として知られています。

**個人データの範囲**

ClickHouseが収集する個人データおよびその利用方法の詳細については、ClickHouseのプライバシーポリシーをご確認ください。

## Self service {#self-service}

デフォルトでは、ClickHouseはユーザーがClickHouseコンソールから直接自分の個人データを表示することを可能にしています。

以下は、アカウントセットアップおよびサービス使用中にClickHouseが収集するデータの要約と、特定の個人データがClickHouseコンソール内でどこに表示されるかに関する情報です。

| Location/URL | Description | Personal Data |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | アカウント登録 | email, password |
| https://console.clickhouse.cloud/profile | 一般ユーザープロフィールの詳細 |  name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザーのリスト | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | APIキーのリストとその作成者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 個別ユーザーによるアクションの一覧を示す活動ログ | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報および請求書 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouseサポートとのインタラクション | name, email |

注：`OrgID`を含むURLは、あなたの特定のアカウントの`OrgID`を反映するように更新する必要があります。

### Current customers {#current-customers}

あなたが私たちのアカウントを持っていて、セルフサービスオプションで個人データの問題が解決されていない場合は、プライバシーポリシーに基づいてデータ主体アクセス要求を提出できます。そのためには、ClickHouseアカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を開いてください。これにより、私たちはあなたの身元を確認し、リクエストへの対処プロセスを効率化できます。

サポートケースには以下の詳細を必ず含めてください：

| Field | Text to include in your request |
|-------------|---------------------------------------------------|
| Subject     | データ主体アクセス要求 (DSAR)                |
| Description | ClickHouseに探してもらいたい情報の詳細な説明、収集、提供を希望する内容。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloudのサポートケースフォーム" border />

### Individuals without an account {#individuals-without-an-account}

アカウントをお持ちでない場合、上記のセルフサービスオプションで個人データの問題が解決されていない場合や、プライバシーポリシーに基づいてデータ主体アクセス要求を行いたい場合は、[privacy@clickhouse.com](mailto:privacy@clickhouse.com)までメールでリクエストを送信できます。

## Identity verification {#identity-verification}

メールを通じてデータ主体アクセス要求を提出した場合、私たちはあなたの身元を確認し、リクエストを処理するために特定の情報を求めることがあります。適用される法律により、リクエストを拒否することが求められる場合や許可される場合があります。リクエストを拒否した場合は、その理由を法律の制限に従ってお知らせします。

詳細情報については、[ClickHouseプライバシーポリシー](https://clickhouse.com/legal/privacy-policy)をご確認ください。
