---
'slug': '/faq/integration/oracle-odbc'
'title': 'Что делать, если у меня возникла проблема с кодировками при использовании
  Oracle через ODBC?'
'toc_hidden': true
'toc_priority': 20
'description': 'Эта страница содержит рекомендации о том, что делать, если у вас возникла
  проблема с кодировками при использовании Oracle через ODBC'
'doc_type': 'guide'
---


# Что делать, если у меня есть проблема с кодировками при использовании Oracle через ODBC? {#oracle-odbc-encodings}

Если вы используете Oracle в качестве источника внешних словарей ClickHouse через ODBC-драйвер Oracle, вам необходимо установить правильное значение для переменной окружения `NLS_LANG` в файле `/etc/default/clickhouse`. Для получения дополнительной информации смотрите [Часто задаваемые вопросы по NLS_LANG Oracle](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html).

**Пример**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
