---
slug: /operations/external-authenticators/
sidebar_position: 48
sidebar_label: 外部ユーザー認証機関とディレクトリ
title: "外部ユーザー認証機関とディレクトリ"
pagination_next: 'operations/external-authenticators/kerberos'
---
import SelfManaged from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseは、外部サービスを使用してユーザーの認証と管理をサポートしています。

サポートされている外部認証機関とディレクトリは以下の通りです：

- [LDAP](./ldap.md#external-authenticators-ldap) [認証機関](./ldap.md#ldap-external-authenticator) および [ディレクトリ](./ldap.md#ldap-external-user-directory)
- Kerberos [認証機関](./kerberos.md#external-authenticators-kerberos)
- [SSL X.509 認証](./ssl-x509.md#ssl-external-authentication)
- HTTP [認証機関](./http.md)
