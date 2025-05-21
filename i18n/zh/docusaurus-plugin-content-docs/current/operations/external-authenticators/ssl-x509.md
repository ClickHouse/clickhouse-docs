---
'description': 'Ssl X509的文档'
'slug': '/operations/external-authenticators/ssl-x509'
'title': 'SSL X.509证书认证'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL 'strict' 选项](../server-configuration-parameters/settings.md#openssl) 强制对传入连接进行证书验证。在这种情况下，只能建立与受信任证书的连接。而不受信任证书的连接将被拒绝。因此，证书验证可以唯一地验证传入连接。证书的 `Common Name` 或 `subjectAltName extension` 字段用于识别连接的用户。`subjectAltName extension` 支持在服务器配置中使用一个通配符 '*'。这允许将多个证书与同一个用户关联。此外，证书的重新签发和吊销不会影响 ClickHouse 的配置。

要启用 SSL 证书身份验证，必须在设置文件 `users.xml` 中为每个 ClickHouse 用户指定 `Common Name` 或 `Subject Alt Name` 的列表：

**示例**
```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- More names -->
            </ssl_certificates>
            <!-- Other settings -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- More names -->
            </ssl_certificates>
            <!-- Other settings -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- Wildcard support -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

为使 SSL [`信任链`](https://en.wikipedia.org/wiki/Chain_of_trust) 正常工作，还需要确保 [`caConfig`](../server-configuration-parameters/settings.md#openssl) 参数配置正确。
