---
description: 'SSL X.509 文档'
slug: /operations/external-authenticators/ssl-x509
title: 'SSL X.509 证书身份验证'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL &#39;strict&#39; option](../server-configuration-parameters/settings.md#openssl) 会对传入连接启用强制证书验证。在这种情况下，只能建立使用受信任证书的连接，使用不受信任证书的连接将被拒绝。因此，通过证书验证可以对传入连接进行唯一标识和认证。证书中的 `Common Name` 或 `subjectAltName extension` 字段用于标识已连接的用户。`subjectAltName extension` 在服务器配置中支持使用一个通配符 &#39;*&#39;，这允许将多个证书关联到同一用户。此外，重新签发和吊销证书不会影响 ClickHouse 的配置。

要启用 SSL 证书认证，必须在配置文件 `users.xml` 中为每个 ClickHouse 用户指定 `Common Name` 或 `Subject Alt Name` 的列表：

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

为了确保 SSL 的 [`chain of trust`](https://en.wikipedia.org/wiki/Chain_of_trust) 能正常工作，还必须确保正确配置 [`caConfig`](../server-configuration-parameters/settings.md#openssl) 参数。
