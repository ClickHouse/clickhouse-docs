---
title: '向 Cloud 上传文件'
slug: /cloud/migrate/upload-a-csv-file
description: '了解如何在 Cloud 中上传文件'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import csv_01 from '@site/static/images/cloud/migrate/csv_01.png';
import csv_02 from '@site/static/images/cloud/migrate/csv_02.png';
import csv_03 from '@site/static/images/cloud/migrate/csv_03.png';
import csv_04 from '@site/static/images/cloud/migrate/csv_04.png';
import csv_05 from '@site/static/images/cloud/migrate/csv_05.png';
import csv_06 from '@site/static/images/cloud/migrate/csv_06.png';
import csv_07 from '@site/static/images/cloud/migrate/csv_07.png';
import csv_08 from '@site/static/images/cloud/migrate/csv_08.png';
import csv_09 from '@site/static/images/cloud/migrate/csv_09.png';
import csv_10 from '@site/static/images/cloud/migrate/csv_10.png';


# 将文件上传到 Cloud \{#upload-files-to-cloud\}

ClickHouse Cloud 提供了便捷的文件导入方式，并支持以下格式：

| 格式                           |
|--------------------------------|
| `CSV`                          |
| `CSVWithNamesAndTypes`         |
| `CSVWithNames`                 |
| `JSONEachRow`                  |
| `TabSeparated`                 |
| `TabSeparatedWithNames`        |
| `TabSeparatedWithNamesAndTypes` |

<VerticalStepper headerLevel="h2">

## 上传文件 \{#upload-file\}

在 Cloud 主页中，选择你的服务，如下所示：

<Image img={csv_01} alt="upload_file_02" />

如果你的服务处于空闲状态，则需要先唤醒它。

在左侧选项卡中选择 `Data sources`，如下所示：

<Image img={csv_02} alt="upload_file_03" />

然后在数据源页面右侧选择 `Upload a file`：

<Image img={csv_03} alt="upload_file_04" />

会弹出一个文件对话框，你可以选择要用于向 Cloud 服务中的某个表插入数据的文件。

<Image img={csv_04} alt="upload_file_05" />

## 配置表 \{#configure-table\}

文件上传完成后，你将能够配置要插入数据的目标表。界面会显示包含前三行数据的表预览。

<Image img={csv_08} alt="upload_file_08" />

现在你可以选择目标表。可选项为：

- 新建表
- 现有表

<br/>
你可以指定要将数据导入到哪个数据库中；如果是新建表，还可以指定将要创建的表名。你还可以选择排序键（sorting key）：

<Image img={csv_05} alt="upload_file_05" />

从文件中读取的列会显示为 `Source field`，对于每个字段，你可以修改：
- 推断出的类型
- 默认值
- 是否将该列设置为 [Nullable](/sql-reference/data-types/nullable)

<Image img={csv_06} alt="upload_file_06" />

:::note 排除字段
如果不希望在导入中包含某个字段，你也可以将其移除。
:::

你可以指定要使用的表引擎类型：

- `MergeTree`
- `ReplacingMergeTree`
- `SummingMergeTree`
- `Null`
<br/>
你可以指定分区键表达式和主键表达式。

<Image img={csv_07} alt="upload_file_07" />

点击 `Import to ClickHouse`（如上图所示）以导入数据。数据导入任务会进入队列，如下图在 `Status` 列中的 `queued` 状态标记所示。你也可以点击
`Open as query`（如上图所示），在 SQL 控制台中打开对应的插入查询。该查询会使用 `URL` 表函数插入先前上传到 S3 存储桶的文件。

<Image img={csv_09} alt="upload_file_09" />

如果任务失败，你会在 `Data upload history` 选项卡的 `Status` 列下看到 `failed` 状态标记。你可以点击 `View Details` 查看导致上传失败的详细信息。你可能需要根据失败插入返回的错误信息修改表配置或清洗数据。

<Image img={csv_10} alt="upload_file_11" />

</VerticalStepper>