---
'description': 'ClickHouse에서 지원하는 외부 인증 방법 개요'
'pagination_next': 'operations/external-authenticators/kerberos'
'sidebar_label': '외부 사용자 인증자 및 디렉토리'
'sidebar_position': 48
'slug': '/operations/external-authenticators/'
'title': '외부 사용자 인증자 및 디렉토리'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse는 외부 서비스를 사용하여 사용자 인증 및 관리를 지원합니다.

다음 외부 인증기와 디렉토리가 지원됩니다:

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [인증기](./ldap.md#ldap-external-authenticator) 및 [디렉토리](./ldap.md#ldap-external-user-directory)
- Kerberos [인증기](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 인증](/operations/external-authenticators/ssl-x509)
- HTTP [인증기](./http.md)
