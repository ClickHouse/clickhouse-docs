---
slug: /operations/external-authenticators/
sidebar_position: 48
sidebar_label: 外部用户认证器和目录
title: '外部用户认证器和目录'
pagination_next: 'operations/external-authenticators/kerberos'
---
import SelfManaged from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse 支持使用外部服务进行用户身份验证和管理。

支持以下外部认证器和目录：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [认证器](./ldap.md#ldap-external-authenticator) 和 [目录](./ldap.md#ldap-external-user-directory)
- Kerberos [认证器](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 认证](./operations/external-authenticators/ssl-x509)
- HTTP [认证器](./http.md)
