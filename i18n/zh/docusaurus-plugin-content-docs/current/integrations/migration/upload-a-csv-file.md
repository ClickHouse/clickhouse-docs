---
'title': '上传 CSV 文件'
'slug': '/integrations/migration/upload-a-csv-file'
'description': '了解上传 CSV 文件'
---

import Image from '@theme/IdealImage';
import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';

# 上传 CSV 文件

您可以上传一个包含带有列名的标题行的 CSV 或 TSV 文件，ClickHouse 将对一批行进行预处理，以推断列的数据类型，然后将这些行插入到新表中。

1. 首先，访问您 ClickHouse Cloud 服务的 **详情** 页面：

<Image img={uploadcsv1} size='md' alt='详情页面' />

2. 从 **操作** 下拉菜单中选择 **加载数据**：

<Image img={uploadcsv2} size='sm' alt='添加数据'/>

3. 点击 **数据源** 页面上的 **文件上传** 按钮，在弹出的对话窗口中选择您要上传的文件。点击 **打开** 以继续（下面的示例是在 macOS 上，其他操作系统可能有所不同）。

<Image img={uploadcsv3} size='md' alt='选择要上传的文件' />

4. ClickHouse 将显示它推断出的数据类型。

<Image img={uploadcsv4} size='md' alt='推断的数据类型' />

5. ***输入一个新表名*** 来插入数据，然后点击 **导入到 ClickHouse** 按钮。

<Image img={uploadcsv5} size='md' alt='选择要上传的文件'/>

6. 连接到您的 ClickHouse 服务，确认表已成功创建，您的数据准备就绪！如果您想要可视化您的数据，可以查看一些可以轻松连接到 ClickHouse 的 [BI 工具](../data-visualization/index.md)。
