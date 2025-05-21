---
description: 'ClickHouseがサポートする外部認証方法の概要'
pagination_next: operations/external-authenticators/kerberos
sidebar_label: '外部ユーザー認証機関およびディレクトリ'
sidebar_position: 48
slug: /operations/external-authenticators/
title: '外部ユーザー認証機関およびディレクトリ'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseは、外部サービスを使用してユーザーの認証と管理をサポートしています。

サポートされている外部認証機関およびディレクトリは次のとおりです：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [認証機関](./ldap.md#ldap-external-authenticator) および [ディレクトリ](./ldap.md#ldap-external-user-directory)
- Kerberos [認証機関](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 認証](/operations/external-authenticators/ssl-x509)
- HTTP [認証機関](./http.md)
