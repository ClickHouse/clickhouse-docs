---
description: 'Обзор внешних методов аутентификации, поддерживаемых ClickHouse'
pagination_next: operations/external-authenticators/kerberos
sidebar_label: 'Внешние аутентификаторы пользователей и директории'
sidebar_position: 48
slug: /operations/external-authenticators/
title: 'Внешние аутентификаторы пользователей и директории'
---

import SelfManaged from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse поддерживает аутентификацию и управление пользователями с использованием внешних сервисов.

Поддерживаются следующие внешние аутентификаторы и директории:

- [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [Аутентификатор](./ldap.md#ldap-external-authenticator) и [Директория](./ldap.md#ldap-external-user-directory)
- Kerberos [Аутентификатор](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
- [Аутентификация SSL X.509](/operations/external-authenticators/ssl-x509)
- HTTP [Аутентификатор](./http.md)
