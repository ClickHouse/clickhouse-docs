---
description: '設定の概要ページ。'
sidebar_position: 1
slug: /operations/settings/overview
title: '設定の概要'
doc_type: 'reference'
---

# 設定の概要 \{#settings-overview\}

## 概要 \{#overview\}

:::note
XML ベースの設定プロファイルおよび [設定ファイル](/operations/configuration-files) は、現在 ClickHouse Cloud ではサポートされていません。ClickHouse Cloud サービスの設定を指定するには、[SQL ベースの設定プロファイル](/operations/access-rights#settings-profiles-management) を使用する必要があります。
:::

ClickHouse の設定には、次のような主なグループがあります。

- グローバルサーバー設定
- セッション設定
- クエリ設定
- バックグラウンド処理設定

グローバル設定は、後続のレベルで上書きされない限り、デフォルトで適用されます。セッション設定は、プロファイル、ユーザー設定、`SET` コマンドを通じて指定できます。クエリ設定は、`SETTINGS` 句を通じて指定でき、個々のクエリに適用されます。バックグラウンド処理設定は、バックグラウンドで非同期に実行される Mutation、Merge およびその他の処理に適用されます。

## 既定値以外の設定の確認 \{#see-non-default-settings\}

既定値から変更されている設定を表示するには、`system.settings` テーブルをクエリします。

```sql
SELECT name, value FROM system.settings WHERE changed
```

設定がデフォルト値からまったく変更されていない場合、ClickHouse は何も返しません。

特定の設定の値を確認するには、クエリ内でその設定の `name` を指定します。

```sql
SELECT name, value FROM system.settings WHERE name = 'max_threads'
```

次のような結果が得られます：

```response
┌─name────────┬─value─────┐
│ max_threads │ 'auto(8)' │
└─────────────┴───────────┘

1 row in set. Elapsed: 0.002 sec.
```


## 関連情報 \{#further-reading\}

- ClickHouse サーバーをグローバルレベルで構成する方法の詳細については、[グローバルサーバー設定](/operations/server-configuration-parameters/settings.md)を参照してください。
- ClickHouse サーバーをセッションレベルで構成する方法の詳細については、[セッション設定](/operations/settings/settings-query-level.md)を参照してください。
- ClickHouse による設定処理の詳細については、[コンテキスト階層](/development/architecture.md#context)を参照してください。