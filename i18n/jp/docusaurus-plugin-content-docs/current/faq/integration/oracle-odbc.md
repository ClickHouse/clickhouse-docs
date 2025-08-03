---
slug: '/faq/integration/oracle-odbc'
title: 'Oracleを使用する際にODBC経由でエンコードに問題が発生した場合はどうすればよいですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、Oracleを使用する際にODBC経由でエンコーディングに問題が発生した場合の対処方法についてのガイダンスを提供します。'
---




# Oracle ODBCを使用しているときのエンコーディングに関する問題がある場合はどうすればよいですか？ {#oracle-odbc-encodings}

Oracle ODBCドライバを介してClickHouseの外部ディクショナリのソースとしてOracleを使用する場合、 `/etc/default/clickhouse` にある `NLS_LANG` 環境変数に正しい値を設定する必要があります。詳細については、[Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)を参照してください。

**例**

``` sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
