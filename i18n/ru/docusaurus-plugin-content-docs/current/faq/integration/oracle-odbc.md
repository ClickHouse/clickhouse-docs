---
slug: /faq/integration/oracle-odbc
title: 'Что делать, если у меня возникают проблемы с кодировками при использовании Oracle через ODBC?'
toc_hidden: true
toc_priority: 20
description: 'На этой странице приводятся рекомендации, что делать, если у вас возникают проблемы с кодировками при использовании Oracle через ODBC'
doc_type: 'guide'
keywords: ['oracle', 'odbc', 'encoding', 'integration', 'external dictionary']
---



# Что делать, если возникают проблемы с кодировками при использовании Oracle через ODBC? {#oracle-odbc-encodings}

Если вы используете Oracle в качестве источника внешних словарей ClickHouse через драйвер Oracle ODBC, необходимо установить правильное значение переменной окружения `NLS_LANG` в `/etc/default/clickhouse`. Подробнее см. [Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Пример**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
