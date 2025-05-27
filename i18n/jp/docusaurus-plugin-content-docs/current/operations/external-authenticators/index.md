---
'description': 'Overview of external authentication methods supported by ClickHouse'
'pagination_next': 'operations/external-authenticators/kerberos'
'sidebar_label': 'External User Authenticators and Directories'
'sidebar_position': 48
'slug': '/operations/external-authenticators/'
'title': 'External User Authenticators and Directories'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseは、外部サービスを使用してユーザーの認証と管理をサポートしています。

以下の外部認証システムおよびディレクトリがサポートされています：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [認証システム](./ldap.md#ldap-external-authenticator)および[ディレクトリ](./ldap.md#ldap-external-user-directory)
- Kerberos [認証システム](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 認証](/operations/external-authenticators/ssl-x509)
- HTTP [認証システム](./http.md)
