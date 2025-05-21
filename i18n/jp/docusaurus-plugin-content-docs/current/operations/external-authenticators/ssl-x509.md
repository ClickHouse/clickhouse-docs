---
description: 'Ssl X509 に関するドキュメント'
slug: /operations/external-authenticators/ssl-x509
title: 'SSL X.509 証明書認証'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL 'strict' オプション](../server-configuration-parameters/settings.md#openssl) は、受信接続のための必須証明書検証を有効にします。この場合、信頼された証明書を持つ接続のみが確立されます。信頼されていない証明書を持つ接続は拒否されます。したがって、証明書検証により、受信接続を一意に認証できます。`Common Name` または `subjectAltName extension` フィールドは、接続されたユーザーを識別するために使用されます。`subjectAltName extension` は、サーバー構成内でのワイルドカード '*' の使用をサポートしています。これにより、同じユーザーに複数の証明書を関連付けることができます。さらに、証明書の再発行や取り消しは ClickHouse の設定に影響を与えません。

SSL 証明書認証を有効にするには、設定ファイル `users.xml` において各 ClickHouse ユーザーの `Common Name` または `Subject Alt Name` のリストを指定する必要があります：

**例**
```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- その他の名前 -->
            </ssl_certificates>
            <!-- その他の設定 -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- その他の名前 -->
            </ssl_certificates>
            <!-- その他の設定 -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- ワイルドカードサポート -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

SSL [`chain of trust`](https://en.wikipedia.org/wiki/Chain_of_trust) が正しく機能するためには、[`caConfig`](../server-configuration-parameters/settings.md#openssl) パラメータが適切に設定されていることも重要です。
