import Image from '@theme/IdealImage';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/object-storage/amazon-s3/cp_step2.png';
import cp_step3_object_storage from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3_object_storage.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step4a3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a3.png';
import cp_step4b from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4b.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_success from '@site/static/images/integrations/data-ingestion/clickpipes/cp_success.png';
import cp_remove from '@site/static/images/integrations/data-ingestion/clickpipes/cp_remove.png';
import cp_destination from '@site/static/images/integrations/data-ingestion/clickpipes/cp_destination.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';

import S3DataSource from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/amazon-s3/_1-data-source.md';
import GCSSDataSource from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/google-cloud-storage/_1-data-source.md';
import ABSDataSource from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/object-storage/azure-blob-storage/_1-data-source.md';

<VerticalStepper type="numbered" headerLevel="h2">

## 选择数据源 \{#1-select-the-data-source\}

**1.** 在 ClickHouse Cloud 中，通过主导航菜单选择 **Data sources**，然后点击 **Create ClickPipe**。

    <Image img={cp_step0} alt="选择导入" size="lg" border/>

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}
{props.provider === 'abs' && <ABSDataSource />}

## 设置 ClickPipe 连接 \{#2-setup-your-clickpipe-connection\}

**1.** 要创建一个新的 ClickPipe，你需要提供如何连接到对象存储服务并进行身份验证的详细信息。

{props.provider === 's3' && <S3DataSource />}
{props.provider === 'gcs' && <GCSSDataSource />}
{props.provider === 'abs' && <ABSDataSource />}

**2.** 点击 **Incoming data**。ClickPipes 将从你的 bucket（存储桶）中获取元数据，用于下一步。

## 选择数据格式 \{#3-select-data-format\}

UI 会显示指定 bucket 中的文件列表。
选择你的数据格式（当前我们支持部分 ClickHouse 格式），以及是否启用持续摄取。
更多详情请参阅概览页面中的 “continuous ingest” 部分。

<Image img={cp_step3_object_storage} alt="设置数据格式和主题" size="lg" border/>

## 配置表、schema 和设置 \{#5-configure-table-schema-settings\}

在下一步中，你可以选择将数据摄取到一个新的 ClickHouse 表中，或复用现有表。
按照界面中的说明修改表名、schema（表结构）和相关设置。
你可以在顶部的示例表中实时预览你的更改。

<Image img={cp_step4a} alt="设置表、schema 和设置" size="lg" border/>

你也可以使用提供的控件自定义高级设置。

<Image img={cp_step4a3} alt="设置高级控件" size="lg" border/>

或者，你也可以选择将数据摄取到现有的 ClickHouse 表中。
在这种情况下，UI 将允许你把来源中的字段映射到所选目标表中的 ClickHouse 字段。

<Image img={cp_step4b} alt="使用现有表" size="lg" border/>

:::info
你还可以将 [虚拟列](/sql-reference/table-functions/s3#virtual-columns)，例如 `_path` 或 `_size`，映射到字段。
:::

## 配置权限 \{#6-configure-permissions\}

最后，你可以为内部 ClickPipes 用户配置权限。

**Permissions：** ClickPipes 将创建一个专用用户用于向目标表写入数据。你可以为该内部用户选择一个角色，可以使用自定义角色或预定义角色之一：
- `Full access`：对集群拥有完全访问权限。如果你在目标表上使用 materialized view 或字典，则需要此权限。
- `Only destination table`：仅对目标表具有 `INSERT` 权限。

<Image img={cp_step5} alt="权限" size="lg" border/>

## 完成设置 \{#7-complete-setup\}

点击 “Complete Setup” 后，系统会注册你的 ClickPipe，你将能在汇总表中看到它的条目。

<Image img={cp_success} alt="成功通知" size="sm" border/>

<Image img={cp_remove} alt="移除通知" size="lg" border/>

汇总表提供控件，用于在 ClickHouse 中显示来源或目标表的示例数据。

<Image img={cp_destination} alt="查看目标" size="lg" border/>

还提供控件用于移除 ClickPipe，并显示摄取作业的概要信息。

<Image img={cp_overview} alt="查看概览" size="lg" border/>

**恭喜！** 你已成功完成第一个 ClickPipe 的设置。
如果这是一个配置为持续摄取的 ClickPipe，它将持续运行，从远程数据源实时摄取数据。
否则，它将执行一次批量摄取并结束。

</VerticalStepper>