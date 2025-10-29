---
'slug': '/faq/integration/oracle-odbc'
'title': 'ODBCを介してOracleを使用しているときにエンコーディングに問題がある場合はどうすればよいですか？'
'toc_hidden': true
'toc_priority': 20
'description': 'このページでは、ODBCを介してOracleを使用しているときにエンコーディングに問題がある場合に何をすればよいかについてのガイダンスを提供します'
'doc_type': 'guide'
---


# Oracle ODBCを使用しているときにエンコーディングに問題がある場合はどうすればよいですか？ {#oracle-odbc-encodings}

Oracle ODBCドライバーを介してClickHouseの外部ディクショナリのソースとしてOracleを使用している場合は、`NLS_LANG`環境変数に正しい値を設定する必要があります。詳細については、[Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)を参照してください。

**例**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
