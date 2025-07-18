---
slug: /faq/integration/oracle-odbc
title: 'What if I have a problem with encodings when using Oracle via ODBC?'
toc_hidden: true
toc_priority: 20
description: 'This page provides guidance on what to do if you have a problem with encodings when using Oracle via ODBC'
---

# What if I have a problem with encodings when using Oracle via ODBC? {#oracle-odbc-encodings}

If you use Oracle as a source of ClickHouse external dictionaries via Oracle ODBC driver, you need to set the correct value for the `NLS_LANG` environment variable in `/etc/default/clickhouse`. For more information, see the [Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Example**

``` sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
