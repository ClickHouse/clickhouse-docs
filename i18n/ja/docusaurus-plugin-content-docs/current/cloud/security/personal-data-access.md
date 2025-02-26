---
sidebar_label: 個人データアクセス
slug: /cloud/security/personal-data-access
title: 個人データアクセス
---

## はじめに {#intro}

登録ユーザーとして、ClickHouseでは連絡先情報を含むあなたの個人アカウントデータを表示および管理することができます。役割に応じて、これにはあなたの組織内の他のユーザーの連絡先情報、APIキーの詳細、その他の関連情報へのアクセスが含まれる場合があります。これらの詳細は、クリックハウスのコンソールを介してセルフサービスの形で直接管理できます。

**データ主体アクセスリクエスト（DSAR）とは**

あなたがどこにいるかによって、適用される法律により、ClickHouseがあなたについて保持する個人データに関して追加の権利（データ主体の権利）が提供される場合があります。これはClickHouseのプライバシーポリシーに記載されています。データ主体の権利を行使するためのプロセスは、データ主体アクセスリクエスト（DSAR）として知られています。

**個人データの範囲**

ClickHouseが収集する個人データとその利用方法についての詳細は、ClickHouseのプライバシーポリシーを確認してください。

## セルフサービス {#self-service}

デフォルトでは、ClickHouseはユーザーがClickHouseのコンソールから直接自身の個人データを表示できるようにしています。

以下は、アカウント設定とサービス使用中にClickHouseが収集するデータの概要と、特定の個人データがClickHouseのコンソール内のどこで表示できるかに関する情報です。

| 場所/URL | 説明 | 個人データ |
|----------|-------------|-------------------------------|
| https://auth.clickhouse.cloud/u/signup/ | アカウント登録 | email, password |
| https://console.clickhouse.cloud/profile | 一般的なユーザープロフィールの詳細 | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/members | 組織内のユーザーリスト | name, email |
| https://console.clickhouse.cloud/organizations/OrgID/keys | APIキーのリストと作成者 | email |
| https://console.clickhouse.cloud/organizations/OrgID/audit | アクティビティログ、各ユーザーの行動の一覧 | email |
| https://console.clickhouse.cloud/organizations/OrgID/billing | 請求情報と請求書 | billing address, email |
| https://console.clickhouse.cloud/support | ClickHouseサポートとのやり取り | name, email |

注意: `OrgID`を含むURLは、特定のアカウントに対する`OrgID`を反映するように更新する必要があります。

### 現在の顧客 {#current-customers}

当社にアカウントがあり、セルフサービスオプションで個人データの問題が解決しない場合、プライバシーポリシーに基づいてデータ主体アクセスリクエストを提出できます。そのためには、ClickHouseアカウントにログインし、[サポートケース](https://console.clickhouse.cloud/support)を開いてください。これにより、あなたの身元を確認し、リクエストへの対応プロセスを効率化できます。

サポートケースには以下の詳細を含めるようにしてください。

| フィールド | リクエストに含めるテキスト |
|------------|-------------------------------------|
| 件名       | データ主体アクセスリクエスト（DSAR） |
| 説明       | ClickHouseに探してもらいたい情報や収集してもらいたい情報の詳細な説明。 |

<img src={require('./images/support-case-form.png').default}
  class="image"
  alt="サポートケースフォーム"
  style={{width: '30%'}} />

### アカウントを持たない個人 {#individuals-without-an-account}

当社にアカウントがなく、上記のセルフサービスオプションで個人データの問題が解決しない場合、プライバシーポリシーに従ってデータ主体アクセスリクエストを行いたい場合は、これらのリクエストを[privacy@clickhouse.com](mailto:privacy@clickhouse.com)にメールで提出できます。

## 身元確認 {#identity-verification}

メールでデータ主体アクセスリクエストを提出する場合、あなたの身元を確認し、リクエストを処理するために特定の情報を求めることがあります。適用される法律により、あなたのリクエストを拒否することが求められたり、許可される場合があります。リクエストを拒否する場合は、法的制限に従い、その理由をお知らせします。

詳細については、[ClickHouseプライバシーポリシー](https://clickhouse.com/legal/privacy-policy)を確認してください。
