---
title: '上传 CSV 文件'
---

import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# 上传 CSV 文件

您可以上传包含列名称的标题行的 CSV 或 TSV 文件，ClickHouse 将对一批行进行预处理，以推断列的数据类型，然后将行插入到一个新表中。

1. 首先进入您的 ClickHouse Cloud 服务的 **详细信息** 页面：

<img src={uploadcsv1} class="image" alt="详细信息页面" />

2. 从 **操作** 下拉菜单中选择 **加载数据**：

<img src={uploadcsv2} class="image" alt="添加数据" />

3. 在 **数据源** 页面上，点击 **文件上传** 按钮，然后在弹出窗口中选择您要上传的文件。点击 **打开** 继续（以下示例是在 macOS 上，其他操作系统可能有所不同）。

<img src={uploadcsv3} class="image" alt="选择要上传的文件" />

4. ClickHouse 会显示它推断出的数据类型。

<img src={uploadcsv4} class="image" alt="推断的数据类型" />

5. ***输入一个新表名称*** 以插入数据，然后点击 **导入到 ClickHouse** 按钮。

<img src={uploadcsv5} class="image" alt="选择要上传的文件" />

6. 连接到您的 ClickHouse 服务，验证表是否成功创建，以及您的数据是否准备就绪！如果您想可视化您的数据，请查看一些可以轻松连接到 ClickHouse 的 [BI 工具](../data-visualization/index.md)。
