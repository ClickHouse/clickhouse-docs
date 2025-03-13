---
sidebar_label: 個人データアクセス
slug: /cloud/security/personal-data-access
title: 個人データアクセス
---

import support_case_form from '@site/static/images/cloud/security/support-case-form.png';

## イントロ {#intro}

登録ユーザーとして、ClickHouse はあなたの連絡先情報を含む個人アカウントデータを閲覧および管理することを許可します。役割に応じて、これには組織内の他のユーザーの連絡先情報、API キーの詳細、およびその他の関連情報へのアクセスも含まれる場合があります。これらの詳細は、セルフサービスベースで ClickHouse コンソールを通じて直接管理できます。

**データ主体アクセスリクエスト (DSAR) とは**

居住地によっては、適用法により、ClickHouse があなたに関して保持する個人データに関して追加の権利 (データ主体の権利) が付与される場合があります。これは ClickHouse プライバシーポリシーに記載されています。データ主体の権利を行使するプロセスは、データ主体アクセスリクエスト (DSAR) として知られています。

**個人データの範囲**

ClickHouse が収集する個人データおよびその使用方法については、ClickHouse のプライバシーポリシーをご覧ください。

## セルフサービス {#self-service}

デフォルトでは、ClickHouse はユーザーが ClickHouse コンソールから自身の個人データを直接閲覧できるようにしています。

以下は、アカウント設定およびサービス利用中に ClickHouse が収集するデータの概要と、特定の個人データが ClickHouse コンソール内でどこで確認できるかに関する情報です。

| Location/URL | Description | Personal Data |
|-------------|----------------|-----------------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | アカウント登録 | email, password |
| https://console.clickhouse.cloud/profile | 一般的なユーザープロファイルの詳細 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザーリスト | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | API キーのリストと作成者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | アクティビティログ、個々のユーザーによるアクションのリスト | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報および請求書 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouse サポートとのやり取り | name, email |

注意: `OrgID` を含む URL は、あなたの特定のアカウントの `OrgID` を反映するように更新する必要があります。

### 現在の顧客 {#current-customers}

当社にアカウントがあり、セルフサービスオプションで個人データの問題が解決しない場合、プライバシーポリシーに基づいてデータ主体アクセスリクエストを提出できます。そのためには、ClickHouse アカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を開いてください。これにより、あなたの身元を確認し、リクエストに対処するプロセスを円滑に進めることができます。

サポートケースには以下の詳細を必ず含めてください：

| Field | Text to include in your request |
|-------------|---------------------------------------------------|
| Subject     | データ主体アクセスリクエスト (DSAR)                |
| Description | ClickHouse に探してもらいたい情報、収集してもらいたい情報、および/または提供してもらいたい情報の詳細な説明。 |

<img src={support_case_form} alt="ClickHouse Cloud のサポートケースフォーム" style={{width: '30%'}} />

### アカウントを持っていない個人 {#individuals-without-an-account}

当社にアカウントがなく、上記のセルフサービスオプションで個人データの問題が解決しない場合、プライバシーポリシーに基づいてデータ主体アクセスリクエストを行いたい場合は、次のメールアドレスにリクエストを送信してください [privacy@clickhouse.com](mailto:privacy@clickhouse.com)。

## 身元確認 {#identity-verification}

メールを通じてデータ主体アクセスリクエストを提出する場合、私たちはあなたの身元を確認し、リクエストを処理するために特定の情報を求める場合があります。適用法により、リクエストを拒否することを要求または許可される場合があります。リクエストを拒否する場合は、その理由をお知らせしますが、法的制限が適用されます。

詳細については、[ClickHouse プライバシーポリシー](https://clickhouse.com/legal/privacy-policy)をご覧ください。
