---
'title': '重新同步数据库 ClickPipe'
'description': '数据库 ClickPipe 重新同步文档'
'slug': '/integrations/clickpipes/postgres/resync'
'sidebar_label': '重新同步 ClickPipe'
'doc_type': 'guide'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync 的作用是什么？ {#what-postgres-resync-do}

Resync 涉及以下操作：
1. 现有的 ClickPipe 会被删除，并启动一个新的“resync” ClickPipe。因此，当你进行 resync 时，源表结构的更改将会被捕获。
2. resync ClickPipe 创建（或替换）一组新的目标表，这些表的名称与原始表相同，但后面加上 `_resync` 后缀。
3. 在 `_resync` 表上执行初始加载。
4. 然后将 `_resync` 表与原始表进行交换。在交换之前，软删除的行会从原始表转移到 `_resync` 表。

原始 ClickPipe 的所有设置会在 resync ClickPipe 中保留。原始 ClickPipe 的统计信息会在用户界面中清除。

### resync ClickPipe 的使用场景 {#use-cases-postgres-resync}

以下是一些场景：

1. 你可能需要对源表进行重大模式更改，这会破坏现有的 ClickPipe，你需要重新启动。你只需在进行更改后点击 Resync。
2. 特别是对于 Clickhouse，可能需要更改目标表的 ORDER BY 键。你可以通过 Resync 重新填充数据到具有正确排序键的新表中。
3. ClickPipe 的复制插槽失效：Resync 创建一个新的 ClickPipe 和源数据库上的新插槽。

:::note
你可以多次进行 resync，但请考虑到在进行 resync 时源数据库的负载，因为每次都涉及使用并行线程的初始加载。
:::

### Resync ClickPipe 指南 {#guide-postgres-resync}

1. 在数据源选项卡中，点击你希望进行 resync 的 Postgres ClickPipe。
2. 前往 **设置** 选项卡。
3. 点击 **Resync** 按钮。

<Image img={resync_button} border size="md"/>

4. 应该会出现一个确认对话框。再次点击 Resync。
5. 前往 **度量** 选项卡。
6. 大约 5 秒后（并在页面刷新时），管道的状态应为 **Setup** 或 **Snapshot**。
7. 可以在 **表** 选项卡的 **初始加载统计信息** 部分监控 resync 的初始加载。
8. 一旦初始加载完成，管道将原子性地将 `_resync` 表与原始表进行交换。在交换期间，状态将为 **Resync**。
9. 一旦交换完成，管道将进入 **Running** 状态，并在启用时执行 CDC。
