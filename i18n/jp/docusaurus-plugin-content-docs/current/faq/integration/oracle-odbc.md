---
slug: /faq/integration/oracle-odbc
title: ODBC経由でOracleを使用する際にエンコーディングに問題がある場合はどうすればよいですか？
toc_hidden: true
toc_priority: 20
---


# ODBC経由でOracleを使用する際にエンコーディングに問題がある場合はどうすればよいですか？ {#oracle-odbc-encodings}

Oracle ODBCドライバーを介してClickHouseの外部辞書のソースとしてOracleを使用する場合、`NLS_LANG`環境変数に正しい値を設定する必要があります。これは`/etc/default/clickhouse`に設定します。詳細については、[Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)を参照してください。

**例**

``` sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
