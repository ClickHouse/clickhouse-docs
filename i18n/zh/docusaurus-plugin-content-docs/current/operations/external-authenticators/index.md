---
'description': 'Overview of external authentication methods supported by ClickHouse'
'pagination_next': 'operations/external-authenticators/kerberos'
'sidebar_label': 'External User Authenticators and Directories'
'sidebar_position': 48
'slug': '/operations/external-authenticators/'
'title': 'External User Authenticators and Directories'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse 支持使用外部服务进行身份验证和用户管理。

以下外部身份验证器和目录受到支持：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [身份验证器](./ldap.md#ldap-external-authenticator) 和 [目录](./ldap.md#ldap-external-user-directory)
- Kerberos [身份验证器](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 身份验证](/operations/external-authenticators/ssl-x509)
- HTTP [身份验证器](./http.md)
