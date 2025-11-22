---
description: 'SSL X.509 文档'
slug: /operations/external-authenticators/ssl-x509
title: 'SSL X.509 证书认证'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL &#39;strict&#39; option](../server-configuration-parameters/settings.md#openssl) 会对所有传入连接强制进行证书验证。在这种情况下，只能建立使用受信任证书的连接，使用不受信任证书的连接将被拒绝。因此，证书验证可以对传入连接进行唯一的身份验证。证书中的 `Common Name` 或 `subjectAltName extension` 字段用于标识已连接用户。`subjectAltName extension` 在服务器配置中支持使用一个通配符 &#39;*&#39;，这允许将多个证书关联到同一个用户。此外，证书的重新签发和吊销不会影响 ClickHouse 的配置。

要启用 SSL 证书认证，必须在配置文件 `users.xml` 中为每个 ClickHouse 用户指定其 `Common Name` 或 `Subject Alt Name` 的列表：

**示例**

```xml
<clickhouse>
    <!- ... -->
    <users>
        <user_name_1>
            <ssl_certificates>
                <common_name>host.domain.com:example_user</common_name>
                <common_name>host.domain.com:example_user_dev</common_name>
                <!-- 更多名称 -->
            </ssl_certificates>
            <!-- 其他设置 -->
        </user_name_1>
        <user_name_2>
            <ssl_certificates>
                <subject_alt_name>DNS:host.domain.com</subject_alt_name>
                <!-- 更多名称 -->
            </ssl_certificates>
            <!-- 其他设置 -->
        </user_name_2>
        <user_name_3>
            <ssl_certificates>
                <!-- 支持通配符 -->
                <subject_alt_name>URI:spiffe://foo.com/*/bar</subject_alt_name>
            </ssl_certificates>
        </user_name_3>
    </users>
</clickhouse>
```

为了使 SSL 的 [`信任链`](https://en.wikipedia.org/wiki/Chain_of_trust) 能正常工作，还需要确保已正确配置 [`caConfig`](../server-configuration-parameters/settings.md#openssl) 参数。
