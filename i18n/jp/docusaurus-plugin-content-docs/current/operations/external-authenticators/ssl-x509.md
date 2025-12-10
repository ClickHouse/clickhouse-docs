---
description: 'SSL X.509 のドキュメント'
slug: /operations/external-authenticators/ssl-x509
title: 'SSL X.509 証明書認証'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL &#39;strict&#39; option](../server-configuration-parameters/settings.md#openssl) は、受信接続に対して証明書検証を必須とします。この場合、信頼された証明書を持つ接続のみが確立されます。信頼されていない証明書による接続は拒否されます。このように、証明書検証により受信接続を一意に識別して認証できます。接続ユーザーの識別には、証明書の `Common Name` フィールドまたは `subjectAltName extension` フィールドが使用されます。`subjectAltName extension` では、サーバー設定でワイルドカード &#39;*&#39; を 1 つだけ使用できます。これにより、複数の証明書を同一ユーザーに関連付けることができます。さらに、証明書の再発行や失効は ClickHouse の設定に影響しません。

SSL 証明書認証を有効にするには、各 ClickHouse ユーザーに対する `Common Name` または `Subject Alt Name` の一覧を設定ファイル `users.xml` で指定する必要があります。

**例**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- 追加の名前 -->
            </ssl_certificates>
            <!-- その他の設定 -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- 追加の名前 -->
            </ssl_certificates>
            <!-- その他の設定 -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- ワイルドカード対応 -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

SSL の[`chain of trust`](https://en.wikipedia.org/wiki/Chain_of_trust)が正しく機能するためには、[`caConfig`](../server-configuration-parameters/settings.md#openssl)パラメータが適切に設定されていることを確認することも重要です。
