---
slug: /faq/integration/oracle-odbc
title: 'ODBC経由でOracleを使用する際にエンコーディングに問題が発生した場合はどうすればよいですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ODBCを介してOracleを使用する際にエンコーディングに問題が発生した場合の対処法について説明します。'
---


# ODBC経由でOracleを使用する際にエンコーディングに問題が発生した場合はどうすればよいですか？ {#oracle-odbc-encodings}

Oracle ODBCドライバを介してClickHouseの外部辞書のソースとしてOracleを使用する場合、`/etc/default/clickhouse`ファイル内の`NLS_LANG`環境変数に正しい値を設定する必要があります。詳細については、[Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)を参照してください。

**例**

``` sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
