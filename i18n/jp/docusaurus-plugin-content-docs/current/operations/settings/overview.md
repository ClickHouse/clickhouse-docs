---
'description': '設定の概要ページ。'
'sidebar_position': 1
'slug': '/operations/settings/overview'
'title': '設定の概要'
'doc_type': 'reference'
---


# 設定の概要

## 概要 {#overview}

:::note
XMLベースの設定プロファイルと [設定ファイル](/operations/configuration-files) は、現在 ClickHouse Cloud ではサポートされていません。ClickHouse Cloud サービスの設定を指定するには、[SQL駆動型設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。
:::

ClickHouse の設定には主に2つのグループがあります：

- グローバルサーバー設定
- セッション設定

両者の主な違いは、グローバルサーバー設定は ClickHouse サーバー全体に適用されるのに対し、セッション設定はユーザーセッションまたは個々のクエリに適用されることです。

## 非デフォルト設定の表示 {#see-non-default-settings}

デフォルト値から変更された設定を表示するには、`system.settings` テーブルにクエリを実行します：

```sql
SELECT name, value FROM system.settings WHERE changed
```

デフォルト値から変更された設定がない場合、ClickHouse は何も返しません。

特定の設定の値を確認するには、クエリ内で設定の `name` を指定できます：

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

これにより、次のような結果が返されます：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```

## さらなる読み物 {#further-reading}

- [グローバルサーバー設定](/operations/server-configuration-parameters/settings.md) を参照して、ClickHouse サーバーをグローバルサーバーレベルで構成する方法について詳しく学んでください。
- [セッション設定](/operations/settings/settings-query-level.md) を参照して、ClickHouse サーバーをセッションレベルで構成する方法について詳しく学んでください。
