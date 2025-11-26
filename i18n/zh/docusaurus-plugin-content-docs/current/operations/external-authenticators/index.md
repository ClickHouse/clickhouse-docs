---
description: 'ClickHouse 支持的外部身份验证方法总览'
pagination_next: operations/external-authenticators/kerberos
sidebar_label: '外部用户认证器和目录'
sidebar_position: 48
slug: /operations/external-authenticators/
title: '外部用户认证器和目录'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse 支持通过外部服务进行用户身份验证和管理。

支持以下外部身份验证器和用户目录：

* [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [身份验证器](./ldap.md#ldap-external-authenticator) 和 [用户目录](./ldap.md#ldap-external-user-directory)
* Kerberos [身份验证器](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
* [SSL X.509 身份验证](/operations/external-authenticators/ssl-x509)
* HTTP [身份验证器](./http.md)
