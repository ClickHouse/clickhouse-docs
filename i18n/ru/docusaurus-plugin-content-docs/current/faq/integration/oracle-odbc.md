---
slug: /faq/integration/oracle-odbc
title: 'Что делать, если возникают проблемы с кодировками при использовании Oracle через ODBC?'
toc_hidden: true
toc_priority: 20
description: 'Эта страница содержит рекомендации по устранению проблем с кодировками при использовании Oracle через ODBC'
doc_type: 'guide'
keywords: ['oracle', 'odbc', 'encoding', 'integration', 'external dictionary']
---

# Что делать, если у меня возникают проблемы с кодировками при работе с Oracle через ODBC? {#oracle-odbc-encodings}

Если вы используете Oracle как источник внешних словарей ClickHouse через драйвер Oracle ODBC, необходимо установить корректное значение переменной окружения `NLS_LANG` в файле `/etc/default/clickhouse`. Дополнительную информацию см. в [Oracle NLS&#95;LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Пример**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
