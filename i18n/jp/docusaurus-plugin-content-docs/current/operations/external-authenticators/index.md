---
description: 'ClickHouse がサポートする外部認証方式の概要'
pagination_next: operations/external-authenticators/kerberos
sidebar_label: '外部ユーザー認証およびディレクトリ'
sidebar_position: 48
slug: /operations/external-authenticators/
title: '外部ユーザー認証およびディレクトリ'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse は、外部サービスを利用したユーザー認証および管理をサポートしています。

サポートされている外部認証方式およびディレクトリは次のとおりです。

* [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [Authenticator](./ldap.md#ldap-external-authenticator) および [Directory](./ldap.md#ldap-external-user-directory)
* Kerberos [Authenticator](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
* [SSL X.509 authentication](/operations/external-authenticators/ssl-x509)
* HTTP [Authenticator](./http.md)
