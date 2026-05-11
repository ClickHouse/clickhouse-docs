---
slug: /sql-reference/statements/create/dictionary/sources/ytsaurus
title: 'YTsaurus の Dictionary ソース'
sidebar_position: 13
sidebar_label: 'YTsaurus'
description: 'ClickHouse で YTsaurus を Dictionary ソースとして設定します。'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
これは将来のリリースで後方互換性のない形で変更される可能性がある実験的な機能です。
設定 [`allow_experimental_ytsaurus_dictionary_source`](/operations/settings/settings#allow_experimental_ytsaurus_dictionary_source) を使用して、
YTsaurus Dictionary ソースの利用を有効にします。
:::

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(YTSAURUS(
        http_proxy_urls 'http://localhost:8000'
        cypress_path '//tmp/test'
        oauth_token 'password'
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <ytsaurus>
            <http_proxy_urls>http://localhost:8000</http_proxy_urls>
            <cypress_path>//tmp/test</cypress_path>
            <oauth_token>password</oauth_token>
            <check_table_schema>1</check_table_schema>
        </ytsaurus>
    </source>
    ```
  </TabItem>
</Tabs>

<br />

設定フィールド:

| Setting           | Description                 |
| ----------------- | --------------------------- |
| `http_proxy_urls` | YTsaurus の HTTP プロキシへの URL。 |
| `cypress_path`    | テーブルソースへの Cypress パス。       |
| `oauth_token`     | OAuth トークン。                 |
