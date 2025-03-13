---
slug: /operations/external-authenticators/
sidebar_position: 48
sidebar_label: Внешние аутентификаторы пользователей и каталоги
title: "Внешние аутентификаторы пользователей и каталоги"
pagination_next: 'operations/external-authenticators/kerberos'
---
import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse поддерживает аутентификацию и управление пользователями с использованием внешних служб.

Поддерживаются следующие внешние аутентификаторы и каталоги:

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [Аутентификатор](./ldap.md#ldap-external-authenticator) и [Каталог](./ldap.md#ldap-external-user-directory)
- Kerberos [Аутентификатор](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [SSL X.509 аутентификация](/operations/external-authenticators/ssl-x509)
- HTTP [Аутентификатор](./http.md)
