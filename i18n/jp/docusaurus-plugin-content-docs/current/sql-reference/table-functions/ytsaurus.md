---
description: 'テーブル関数を使用すると、YTsaurus クラスターからデータを読み取ることができます。'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus テーブル関数

<ExperimentalBadge/>

このテーブル関数を使用すると、YTsaurus クラスターからデータを読み込むことができます。



## 構文 {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
これは実験的機能であり、将来のリリースで後方互換性のない変更が行われる可能性があります。
YTsaurusテーブル関数を使用するには、[allow_experimental_ytsaurus_table_function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine)設定で有効化してください。
`set allow_experimental_ytsaurus_table_function = 1`コマンドを実行してください。
:::


## 引数 {#arguments}

- `http_proxy_url` — YTsaurus HTTPプロキシのURL。
- `cypress_path` — データソースへのCypressパス。
- `oauth_token` — OAuthトークン。
- `format` — データソースの[フォーマット](/interfaces/formats)。

**戻り値**

YTsaurusクラスター内の指定されたCypressパスからデータを読み取るための、指定された構造を持つテーブル。

**関連項目**

- [ytsaurusエンジン](/engines/table-engines/integrations/ytsaurus.md)
