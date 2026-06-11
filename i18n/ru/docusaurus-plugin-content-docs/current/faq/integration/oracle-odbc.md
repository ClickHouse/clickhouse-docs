---
slug: /faq/integration/oracle-odbc
title: 'Что делать, если у меня возникают проблемы с кодировками при работе с Oracle через ODBC?'
toc_hidden: true
toc_priority: 20
description: 'На этой странице приведены рекомендации о том, что делать, если у вас возникают проблемы с кодировками при работе с Oracle через ODBC'
doc_type: 'guide'
keywords: ['oracle', 'odbc', 'кодировка', 'интеграция', 'внешний словарь']
---

Если вы используете Oracle как источник внешних словарей ClickHouse через драйвер Oracle ODBC, необходимо установить корректное значение переменной окружения `NLS_LANG` в файле `/etc/default/clickhouse`. Дополнительную информацию см. в [Oracle NLS&#95;LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Пример**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```