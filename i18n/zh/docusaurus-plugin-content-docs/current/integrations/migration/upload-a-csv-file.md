---
'title': '上传 CSV 文件'
'slug': '/integrations/migration/upload-a-csv-file'
'description': '了解关于 上传 CSV 文件'
---

import Image from '@theme/IdealImage';
import uploadcsv1 from '@site/static/images/integrations/migration/uploadcsv1.png';
import uploadcsv2 from '@site/static/images/integrations/migration/uploadcsv2.png';
import uploadcsv3 from '@site/static/images/integrations/migration/uploadcsv3.png';
import uploadcsv4 from '@site/static/images/integrations/migration/uploadcsv4.png';
import uploadcsv5 from '@site/static/images/integrations/migration/uploadcsv5.png';


# 上传 CSV 文件

您可以上传包含列名称的标题行的 CSV 或 TSV 文件，ClickHouse 将预处理一批行以推断列的数据类型，然后将这些行插入到一个新表中。

1. 首先，前往您的 ClickHouse Cloud 服务的 **Details** 页面：

<Image img={uploadcsv1} size='md' alt='Details page' />

2. 在 **Actions** 下拉菜单中选择 **Load data**：

<Image img={uploadcsv2} size='sm' alt='Add data'/>

3. 在 **Datasources** 页面上点击 **File upload** 按钮，并在出现的对话窗口中选择要上传的文件。点击 **Open** 继续（下面的示例是在 macOS 上，其他操作系统可能会有所不同）。

<Image img={uploadcsv3} size='md' alt='Select the file to upload' />

4. ClickHouse 会显示它推断出的数据类型。

<Image img={uploadcsv4} size='md' alt='Inferred data types' />

5. ***输入一个新表名*** 来插入数据，然后点击 **Import to ClickHouse** 按钮。

<Image img={uploadcsv5} size='md' alt='Select the file to upload'/>

6. 连接到您的 ClickHouse 服务，验证表是否成功创建，并且您的数据已准备好！如果您想要可视化您的数据，可以查看一些可以轻松连接到 ClickHouse 的 [BI 工具](../data-visualization/index.md)。
