---
slug: /faq/integration/oracle-odbc
title: 'ODBC를 통해 Oracle을 사용할 때 인코딩 문제가 발생하면 어떻게 해야 합니까?'
toc_hidden: true
toc_priority: 20
description: '이 페이지에서는 ODBC를 통해 Oracle을 사용할 때 인코딩 관련 문제가 발생하는 경우 취할 수 있는 조치에 대해 안내합니다'
doc_type: 'guide'
keywords: ['oracle', 'odbc', 'encoding', 'integration', 'external dictionary']
---

# ODBC를 통해 Oracle을 사용할 때 인코딩에 문제가 발생하면 어떻게 해야 합니까? \{#oracle-odbc-encodings\}

Oracle ODBC 드라이버를 통해 ClickHouse 외부 딕셔너리의 소스로 Oracle을 사용하는 경우, `/etc/default/clickhouse`에서 `NLS_LANG` 환경 변수에 적절한 값을 설정해야 합니다. 자세한 내용은 [Oracle NLS&#95;LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)를 참조하십시오.

**예시**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
