---
sidebar_label: '個人データアクセス'
slug: /cloud/security/personal-data-access
title: '個人データアクセス'
description: '登録ユーザーとして、ClickHouseはあなたの連絡先情報を含む個人アカウントデータを表示・管理することを許可します。'
---

import Image from '@theme/IdealImage';
import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## はじめに {#intro}

登録ユーザーとして、ClickHouseはあなたの連絡先情報を含む個人アカウントデータを表示・管理することを許可します。あなたの役割に応じて、自組織の他のユーザーの連絡先情報、APIキーの詳細、およびその他の関連情報へのアクセスも含まれる場合があります。これらの詳細は、ClickHouseコンソールを通じてセルフサービス方式で直接管理できます。

**データ主体アクセスリクエスト (DSAR) とは**

あなたがどこに住んでいるかによって、適用される法律は、ClickHouseがあなたについて保持している個人データに関して追加の権利（データ主体の権利）を提供する場合があります。データ主体の権利を行使するプロセスは、データ主体アクセスリクエスト（DSAR）として知られています。

**個人データの範囲**

ClickHouseが収集する個人データやその利用方法の詳細については、ClickHouseのプライバシーポリシーを確認してください。

## セルフサービス {#self-service}

デフォルトでは、ClickHouseはユーザーがClickHouseコンソールから直接自分の個人データを表示できるようにします。

以下は、アカウント設定およびサービス利用中にClickHouseが収集するデータの概要と、特定の個人データがClickHouseコンソール内でどこに表示されるかの情報です。

| 場所/URL | 説明 | 個人データ |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | アカウント登録 | email, password |
| https://console.clickhouse.cloud/profile | 一般的なユーザープロファイル情報 |  name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザーリスト | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | APIキーのリストおよび作成者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | アクティビティログ（個々のユーザーによるアクションをリスト） | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報および請求書 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouseサポートとのインタラクション | name, email |

注: `OrgID` が含まれるURLは、特定のアカウントに合わせて `OrgID` を更新する必要があります。

### 現在の顧客 {#current-customers}

私たちにアカウントをお持ちで、セルフサービスオプションで個人データの問題が解決しない場合、プライバシーポリシーに基づきデータ主体アクセスリクエストを提出できます。そのためには、ClickHouseアカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を開いてください。これにより、あなたの身元を確認し、リクエストに対処するプロセスを円滑にすることができます。

サポートケースには、以下の詳細を必ず含めるようにしてください：

| フィールド | リクエストに含めるテキスト |
|-------------|---------------------------------------------------|
| 件名     | データ主体アクセスリクエスト (DSAR)                |
| 説明 | ClickHouseに探してもらいたい、収集してもらいたい、または提供してもらいたい情報の詳細な説明。 |

<Image img={support_case_form} size="sm" alt="ClickHouse Cloudのサポートケースフォーム" border />

### アカウントをお持ちでない個人 {#individuals-without-an-account}

私たちにアカウントをお持ちでなく、上記のセルフサービスオプションでも個人データの問題が解決しない場合、プライバシーポリシーに基づくデータ主体アクセスリクエストを行いたい場合、[privacy@clickhouse.com](mailto:privacy@clickhouse.com) にメールでリクエストを送信することができます。

## 身元確認 {#identity-verification}

メールを通じてデータ主体アクセスリクエストを提出した場合、私たちはあなたの身元を確認し、リクエストを処理するために特定の情報を求める場合があります。適用される法律により、あなたのリクエストを拒否することが要求されるか、または許可される場合があります。リクエストを拒否した場合、その理由をお伝えしますが、法的制限に従います。

詳細については、[ClickHouseプライバシーポリシー](https://clickhouse.com/legal/privacy-policy)を確認してください。
