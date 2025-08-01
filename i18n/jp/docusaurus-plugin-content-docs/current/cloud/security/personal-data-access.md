---
sidebar_label: 'Personal Data Access'
slug: '/cloud/security/personal-data-access'
title: 'Personal Data Access'
description: 'As a registered user, ClickHouse allows you to view and manage your
  personal account data, including contact information.'
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## Intro {#intro}

登録ユーザーとして、ClickHouseでは、連絡先情報を含む個人アカウントデータを表示および管理することができます。あなたの役割に応じて、これはあなたの組織内の他のユーザーの連絡先情報、APIキーの詳細、その他の関連情報へのアクセスを含む場合があります。これらの詳細は、ClickHouseコンソールを通じてセルフサービス形式で直接管理できます。

**データ主体アクセス要求 (DSAR) とは**

ご所在の地域によっては、ClickHouseが保有する個人データに関する追加の権利（データ主体の権利）が法律によって提供されることがあります。これについては、ClickHouseのプライバシーポリシーで説明されています。データ主体の権利を行使する手続きは、データ主体アクセス要求 (DSAR) と呼ばれます。

**個人データの範囲**

ClickHouseが収集する個人データやその使用方法については、ClickHouseのプライバシーポリシーを確認してください。

## Self Service {#self-service}

デフォルトでは、ClickHouseはユーザーがClickHouseコンソールから自分の個人データを直接表示できるようにしています。

以下は、アカウント設定およびサービス使用中にClickHouseが収集するデータの要約と、特定の個人データがClickHouseコンソール内のどこで表示できるかの情報です。

| Location/URL | Description | Personal Data |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | アカウント登録 | email, password |
| https://console.clickhouse.cloud/profile | 一般ユーザープロフィール詳細 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザーリスト | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | APIキーのリストと作成者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | 活動ログ、個々のユーザーによるアクションのリスト | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報と請求書 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouseサポートとのやり取り | name, email |

注意: `OrgID`を含むURLは、特定のアカウントの`OrgID`を反映するように更新する必要があります。

### Current customers {#current-customers}

弊社とアカウントをお持ちで、セルフサービスオプションで個人データの問題が解決しない場合、プライバシーポリシーに基づきデータ主体アクセス要求を提出できます。そのためには、ClickHouseアカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を開いてください。これにより、あなたの身元を確認し、リクエストに対応するプロセスをスムーズに進めることができます。

サポートケースには、以下の詳細を含めてください。

| Field | Text to include in your request |
|-------------|---------------------------------------------------|
| Subject     | データ主体アクセス要求 (DSAR)                |
| Description | ClickHouseに探し、収集し、または提供してほしい情報の詳細な説明。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloudのサポートケースフォーム" border />

### Individuals Without an Account {#individuals-without-an-account}

弊社とアカウントをお持ちでなく、上記のセルフサービスオプションで個人データの問題が解決されていない場合、プライバシーポリシーに従ってデータ主体アクセス要求を行いたい場合は、メールで[privacy@clickhouse.com](mailto:privacy@clickhouse.com)にこれらのリクエストを送信してください。

## Identity Verification {#identity-verification}

メールを通じてデータ主体アクセス要求を提出する場合、あなたの身元を確認し、リクエストを処理するために特定の情報を要求することがあります。適用される法律により、リクエストを拒否することが求められたり許可されたりする場合があります。リクエストを拒否する場合、その理由をお知らせしますが、法的制限に従います。

詳細については、[ClickHouseプライバシーポリシー](https://clickhouse.com/legal/privacy-policy)をご覧ください。
