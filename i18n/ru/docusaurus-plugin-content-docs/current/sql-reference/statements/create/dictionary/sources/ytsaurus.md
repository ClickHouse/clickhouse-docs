---
slug: /sql-reference/statements/create/dictionary/sources/ytsaurus
title: 'Источник словаря YTsaurus'
sidebar_position: 13
sidebar_label: 'YTsaurus'
description: 'Настройка YTsaurus как источника словаря в ClickHouse.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::info
Это экспериментальная функция, которая в будущих версиях может измениться с нарушением обратной совместимости.
Включите использование источника словаря YTsaurus
с помощью настройки [`allow_experimental_ytsaurus_dictionary_source`](/operations/settings/settings#allow_experimental_ytsaurus_dictionary_source).
:::

Пример настроек:

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

Поля настройки:

| Setting           | Description                         |
| ----------------- | ----------------------------------- |
| `http_proxy_urls` | URL HTTP‑прокси‑сервера YTsaurus.   |
| `cypress_path`    | Путь в Cypress к источнику таблицы. |
| `oauth_token`     | OAuth‑токен.                        |
