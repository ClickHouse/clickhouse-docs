---
'description': 'ClickHouseがサポートする外部認証方法の概要'
'pagination_next': 'operations/external-authenticators/kerberos'
'sidebar_label': '外部ユーザー認証機関とディレクトリ'
'sidebar_position': 48
'slug': '/operations/external-authenticators/'
'title': '外部ユーザー認証機関とディレクトリ'
'doc_type': 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouseは、外部サービスを使用してユーザーの認証と管理をサポートしています。

次の外部認証機関とディレクトリがサポートされています：

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [認証機関](./ldap.md#ldap-external-authenticator)と[ディレクトリ](./ldap.md#ldap-external-user-directory)
- Kerberos [認証機関](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509認証](/operations/external-authenticators/ssl-x509)
- HTTP [認証機関](./http.md)
