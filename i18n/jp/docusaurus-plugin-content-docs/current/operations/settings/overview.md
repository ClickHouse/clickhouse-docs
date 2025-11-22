---
description: '設定の概要ページです。'
sidebar_position: 1
slug: /operations/settings/overview
title: '設定の概要'
doc_type: 'reference'
---



# 設定の概要



## 概要 {#overview}

:::note
XMLベースの設定プロファイルおよび[設定ファイル](/operations/configuration-files)は、現在ClickHouse Cloudではサポートされていません。ClickHouse Cloudサービスの設定を指定するには、[SQLドリブン設定プロファイル](/operations/access-rights#settings-profiles-management)を使用する必要があります。
:::

ClickHouseの設定には主に2つのグループがあります:

- グローバルサーバー設定
- セッション設定

両者の主な違いは、グローバルサーバー設定がClickHouseサーバー全体にグローバルに適用されるのに対し、セッション設定はユーザーセッションまたは個々のクエリに適用される点です。


## デフォルト以外の設定の確認 {#see-non-default-settings}

デフォルト値から変更された設定を確認するには、`system.settings`テーブルをクエリします:

```sql
SELECT name, value FROM system.settings WHERE changed
```

デフォルト値から変更された設定がない場合、ClickHouseは何も返しません。

特定の設定の値を確認するには、クエリで設定の`name`を指定します:

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

次のような結果が返されます:

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```


## 関連資料 {#further-reading}

- ClickHouseサーバーのグローバルレベルでの設定の詳細については、[グローバルサーバー設定](/operations/server-configuration-parameters/settings.md)を参照してください。
- ClickHouseサーバーのセッションレベルでの設定の詳細については、[セッション設定](/operations/settings/settings-query-level.md)を参照してください。
