---
'description': 'Ssl X509에 대한 문서'
'slug': '/operations/external-authenticators/ssl-x509'
'title': 'SSL X.509 인증서 인증'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

[SSL 'strict' 옵션](../server-configuration-parameters/settings.md#openssl)은 들어오는 연결에 대한 필수 인증서 검증을 활성화합니다. 이 경우 신뢰할 수 있는 인증서가 있는 연결만 설정될 수 있습니다. 신뢰할 수 없는 인증서가 있는 연결은 거부됩니다. 따라서 인증서 검증은 들어오는 연결을 고유하게 인증할 수 있도록 합니다. 인증서의 `Common Name` 또는 `subjectAltName extension` 필드는 연결된 사용자를 식별하는 데 사용됩니다. `subjectAltName extension`은 서버 구성에서 하나의 와일드카드 '*' 사용을 지원합니다. 이를 통해 동일한 사용자와 여러 인증서를 연결할 수 있습니다. 또한, 인증서를 재발급하거나 취소해도 ClickHouse 구성에는 영향을 미치지 않습니다.

SSL 인증서 인증을 활성화하려면, 각 ClickHouse 사용자의 `Common Name` 또는 `Subject Alt Name`의 목록을 설정 파일 `users.xml`에 지정해야 합니다:

**예제**
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

SSL [`신뢰 체계`](https://en.wikipedia.org/wiki/Chain_of_trust)가 올바르게 작동하려면, [`caConfig`](../server-configuration-parameters/settings.md#openssl) 매개변수가 적절하게 구성되어 있는지 확인하는 것도 중요합니다.
