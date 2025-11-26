---
description: 'Обзор методов внешней аутентификации, поддерживаемых в ClickHouse'
pagination_next: operations/external-authenticators/kerberos
sidebar_label: 'Внешние аутентификаторы пользователей и каталоги'
sidebar_position: 48
slug: /operations/external-authenticators/
title: 'Внешние аутентификаторы пользователей и каталоги'
doc_type: 'reference'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse поддерживает аутентификацию и управление пользователями с использованием внешних сервисов.

Поддерживаются следующие внешние аутентификаторы и каталоги пользователей:

* [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [аутентификатор](./ldap.md#ldap-external-authenticator) и [каталог пользователей](./ldap.md#ldap-external-user-directory)
* Kerberos [аутентификатор](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
* [Аутентификация по SSL X.509](/operations/external-authenticators/ssl-x509)
* HTTP [аутентификатор](./http.md)
