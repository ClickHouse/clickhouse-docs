---
'title': '重新同步数据库 ClickPipe'
'description': '关于重新同步数据库 ClickPipe 的文档'
'slug': '/integrations/clickpipes/mongodb/resync'
'sidebar_label': '重新同步 ClickPipe'
'doc_type': 'guide'
---

import resync_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resync_button.png'
import Image from '@theme/IdealImage';

### Resync 的作用是什么？ {#what-mongodb-resync-do}

Resync 涉及以下操作按顺序进行：

1. 现有的 ClickPipe 被删除，然后启动一个新的“resync” ClickPipe。因此，当您进行 resync 时，源表结构的变化将被捕获。
2. resync ClickPipe 会创建（或替换）一组新的目标表，这些表的名称与原始表相同，但带有 `_resync` 后缀。
3. 对 `_resync` 表执行初始加载。
4. 然后，`_resync` 表与原始表进行交换。在交换之前，将软删除的行从原始表转移到 `_resync` 表。

原始 ClickPipe 的所有设置都在 resync ClickPipe 中保留。原始 ClickPipe 的统计信息在用户界面中被清除。

### Resync ClickPipe 的使用案例 {#use-cases-mongodb-resync}

以下是几个场景：

1. 您可能需要对源表进行重大模式更改，这会破坏现有的 ClickPipe，您需要重新启动。在进行更改后，您只需点击 Resync。
2. 特别对于 ClickHouse，您可能需要更改目标表上的 ORDER BY 键。您可以 Resync 来将数据重新填充到具有正确排序键的新表中。

### Resync ClickPipe 指南 {#guide-mongodb-resync}

1. 在数据源标签中，点击您希望重新同步的 MongoDB ClickPipe。
2. 转到 **设置** 标签。
3. 点击 **Resync** 按钮。

<Image img={resync_button} border size="md"/>

4. 确认的对话框应出现。再次点击 Resync。
5. 转到 **指标** 标签。
6. 等待管道的状态变为 **Setup** 或 **Snapshot**。
7. 可以在 **表** 标签中的 **初始加载统计** 部分监控 resync 的初始加载情况。
8. 一旦初始加载完成，管道将原子地将 `_resync` 表与原始表进行交换。在交换期间，状态将变为 **Resync**。
9. 一旦交换完成，管道将进入 **Running** 状态，并在启用的情况下执行 CDC。
