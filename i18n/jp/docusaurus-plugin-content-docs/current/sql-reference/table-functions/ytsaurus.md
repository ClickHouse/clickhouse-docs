---
'description': 'テーブル関数はYTsaurusクラスターからデータを読み取ることを可能にします。'
'sidebar_label': 'ytsaurus'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/ytsaurus'
'title': 'ytsaurus'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus テーブル関数

<ExperimentalBadge/>

テーブル関数を使用して、YTsaurus クラスターからデータを読み取ることができます。

## 構文 {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
これは実験的な機能であり、今後のリリースで後方互換性のない方法で変更される可能性があります。
[allow_experimental_ytsaurus_table_function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine) 設定で YTsaurus テーブル関数の使用を有効にします。
コマンド `set allow_experimental_ytsaurus_table_function = 1` を入力してください。
:::

## 引数 {#arguments}

- `http_proxy_url` — YTsaurus http プロキシへの URL。
- `cypress_path` — データソースへの Cypress パス。
- `oauth_token` — OAuth トークン。
- `format` — データソースの [フォーマット](/interfaces/formats)。

**返される値**

YTsaurus クラスター内の指定された ytsaurus cypress パスでデータを読み取るための指定された構造のテーブル。

**関連情報**

- [ytsaurus エンジン](/engines/table-engines/integrations/ytsaurus.md)
