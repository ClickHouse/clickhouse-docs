---
slug: /operations/external-authenticators/ssl-x509
title: "SSL X.509証明書認証"
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSLの「strict」オプション](../server-configuration-parameters/settings.md#openssl)は、受信接続に対して証明書の検証を必須とします。この場合、信頼できる証明書を持つ接続のみが確立されます。信頼されていない証明書を持つ接続は拒否されます。したがって、証明書の検証は、受信接続を一意に認証することを可能にします。証明書の`Common Name`または`subjectAltName extension`フィールドは、接続しているユーザーを特定するために使用されます。`subjectAltName extension`は、サーバー設定内で1つのワイルドカード'*'の使用をサポートしています。これにより、同じユーザーに対して複数の証明書を関連付けることが可能になります。さらに、証明書の再発行や取り消しはClickHouseの設定に影響を与えません。

SSL証明書認証を有効にするには、設定ファイル`users.xml`内で各ClickHouseユーザーの`Common Name`または`Subject Alt Name`のリストを指定する必要があります。

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
                <!-- ワイルドカードのサポート -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

SSLの [`trust chain`](https://en.wikipedia.org/wiki/Chain_of_trust) が正しく機能するためには、[`caConfig`](../server-configuration-parameters/settings.md#openssl)パラメーターが正しく構成されていることも重要です。
