---
slug: /sql-reference/statements/create/dictionary/layouts/direct
title: 'раскладка словаря direct'
sidebar_label: 'direct'
sidebar_position: 9
description: 'Раскладка словаря, которая обращается к источнику данных напрямую, без кэширования.'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


## direct \{#direct\}

Словарь не хранится в памяти и при обработке запроса напрямую обращается к источнику.

Ключ словаря имеет тип [UInt64](/sql-reference/data-types/int-uint.md).

Поддерживаются все типы [источников](../sources/#dictionary-sources), за исключением локальных файлов.

Пример конфигурации:

<Tabs>
<TabItem value="ddl" label="DDL" default>

```sql
LAYOUT(DIRECT())
```

</TabItem>
<TabItem value="xml" label="Configuration file">

```xml
<layout>
  <direct />
</layout>
```

</TabItem>
</Tabs>

<br/>

## complex_key_direct \{#complex_key_direct\}

Этот тип хранилища предназначен для использования с составными [ключами](../attributes.md#composite-key). Аналогичен типу `direct`.