---
description: 'table 関数を使用すると、YTsaurus クラスターからデータを読み取れます。'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus テーブル関数 {#ytsaurus-table-function}

<ExperimentalBadge/>

このテーブル関数を使用すると、YTsaurus クラスターからデータを読み込むことができます。



## 構文 {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
これは実験的な機能であり、今後のリリースで後方互換性のない形で変更される可能性があります。
YTsaurus テーブル関数の使用を有効にするには、[allow&#95;experimental&#95;ytsaurus&#95;table&#95;function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 設定を有効にします。
`set allow_experimental_ytsaurus_table_function = 1` コマンドを実行します。
:::


## 引数 {#arguments}

- `http_proxy_url` — YTsaurus の HTTP プロキシの URL。
- `cypress_path` — データソースへの Cypress パス。
- `oauth_token` — OAuth トークン。
- `format` — データソースの[フォーマット](/interfaces/formats)。

**戻り値**

YTsaurus クラスター内の指定された ytsaurus cypress パスからデータを読み取るための、指定した構造を持つテーブル。

**関連項目**

- [ytsaurus エンジン](/engines/table-engines/integrations/ytsaurus.md)
