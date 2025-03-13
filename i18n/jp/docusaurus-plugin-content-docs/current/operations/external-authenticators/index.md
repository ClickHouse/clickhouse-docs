---
slug: /operations/external-authenticators/
sidebar_position: 48
sidebar_label: 外部ユーザー認証およびディレクトリ
title: "外部ユーザー認証およびディレクトリ"
pagination_next: 'operations/external-authenticators/kerberos'
---
import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseは、外部サービスを使用してユーザーの認証と管理をサポートしています。

以下の外部認証およびディレクトリがサポートされています：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [認証器](./ldap.md#ldap-external-authenticator) と [ディレクトリ](./ldap.md#ldap-external-user-directory)
- Kerberos [認証器](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 認証](/operations/external-authenticators/ssl-x509)
- HTTP [認証器](./http.md)
