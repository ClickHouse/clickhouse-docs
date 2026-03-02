---
description: 'ClickHouse에서 지원하는 외부 인증 방법 개요'
pagination_next: operations/external-authenticators/kerberos
sidebar_label: '외부 사용자 인증 시스템 및 디렉터리'
sidebar_position: 48
slug: /operations/external-authenticators/
title: '외부 사용자 인증 시스템 및 디렉터리'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

ClickHouse에서는 외부 서비스를 사용하여 사용자를 인증하고 관리할 수 있습니다.

다음과 같은 외부 인증자와 디렉터리를 지원합니다:

* [LDAP](/operations/external-authenticators/ldap#ldap-external-authenticator) [Authenticator](./ldap.md#ldap-external-authenticator) 및 [Directory](./ldap.md#ldap-external-user-directory)
* Kerberos [Authenticator](/operations/external-authenticators/kerberos#kerberos-as-an-external-authenticator-for-existing-users)
* [SSL X.509 authentication](/operations/external-authenticators/ssl-x509)
* HTTP [Authenticator](./http.md)
