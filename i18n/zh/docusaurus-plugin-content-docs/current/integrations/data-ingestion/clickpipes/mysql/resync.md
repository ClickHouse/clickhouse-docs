---
'title': '重新同步数据库 ClickPipe'
'description': '关于重新同步数据库 ClickPipe 的文档'
'slug': '/integrations/clickpipes/mysql/resync'
'sidebar_label': '重新同步 ClickPipe'
'doc_type': 'guide'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync 的作用是什么？ {#what-mysql-resync-do}

Resync 涉及以下操作：

1. 现有的 ClickPipe 被删除，并启动一个新的 "resync" ClickPipe。这样，在重新同步时，源表结构的更改将会被捕捉到。
2. resync ClickPipe 创建（或替换）一组新的目标表，这些表的名称与原始表相同，只是带有 `_resync` 后缀。
3. 对 `_resync` 表执行初始加载。
4. 然后，`_resync` 表与原始表进行交换。在交换之前，软删除的行会从原始表转移到 `_resync` 表。

原始 ClickPipe 的所有设置在 resync ClickPipe 中被保留。原始 ClickPipe 的统计信息在用户界面中被清除。

### Resync ClickPipe 的使用场景 {#use-cases-mysql-resync}

以下是几个场景：

1. 你可能需要对源表进行重大模式更改，这会破坏现有的 ClickPipe，你需要重新启动。在进行更改后，你只需点击 Resync。
2. 特别是对于 ClickHouse，可能需要更改目标表的 ORDER BY 键。你可以通过 Resync 将数据重新填充到具有正确排序键的新表中。

:::note
你可以多次进行 resync，但是请在重新同步时考虑源数据库的负载。
:::

### Resync ClickPipe 指南 {#guide-mysql-resync}

1. 在数据源选项卡中，点击你想重新同步的 MySQL ClickPipe。
2. 前往 **设置** 选项卡。
3. 点击 **Resync** 按钮。

<Image img={resync_button} border size="md"/>

4. 将弹出确认对话框。请再次点击 Resync。
5. 前往 **指标** 选项卡。
6. 在大约 5 秒内（以及页面刷新后），管道的状态应为 **设置** 或 **快照**。
7. 可以在 **表** 选项卡的 **初始加载统计** 部分监控重新同步的初始加载。
8. 一旦初始加载完成，管道将原子性地将 `_resync` 表与原始表交换。在交换过程中，状态将为 **Resync**。
9. 一旦交换完成，管道将进入 **运行** 状态，并在启用的情况下执行 CDC。
