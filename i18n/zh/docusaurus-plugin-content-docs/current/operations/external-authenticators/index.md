---
'description': '关于 ClickHouse 支持的外部认证方法的概述'
'pagination_next': 'operations/external-authenticators/kerberos'
'sidebar_label': '外部用户认证和目录'
'sidebar_position': 48
'slug': '/operations/external-authenticators/'
'title': '外部用户认证和目录'
---

import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse 支持使用外部服务进行用户身份验证和管理。

支持以下外部验证器和目录：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [验证器](./ldap.md#ldap-external-authenticator) 和 [目录](./ldap.md#ldap-external-user-directory)
- Kerberos [验证器](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 认证](/operations/external-authenticators/ssl-x509)
- HTTP [验证器](./http.md)
