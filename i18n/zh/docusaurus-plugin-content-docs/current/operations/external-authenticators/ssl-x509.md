---
'description': 'Ssl X509 的文档'
'slug': '/operations/external-authenticators/ssl-x509'
'title': 'SSL X.509 证书认证'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL '严格' 选项](../server-configuration-parameters/settings.md#openssl) 启用对传入连接的强制证书验证。在这种情况下，仅允许与受信任证书的连接被建立。与不受信任证书的连接将被拒绝。因此，证书验证可以唯一地验证传入连接。证书的 `Common Name` 或 `subjectAltName 扩展` 字段用于识别连接的用户。 `subjectAltName 扩展` 在服务器配置中支持使用一个通配符 '*'。这允许将多个证书与同一个用户关联。此外，证书的重新签发和吊销不影响 ClickHouse 配置。

要启用 SSL 证书身份验证，必须在设置文件 `users.xml` 中为每个 ClickHouse 用户指定一组 `Common Name` 或 `Subject Alt Name`：

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

为了使 SSL [`信任链`](https://en.wikipedia.org/wiki/Chain_of_trust) 正常工作，确保 [`caConfig`](../server-configuration-parameters/settings.md#openssl) 参数配置正确也很重要。
