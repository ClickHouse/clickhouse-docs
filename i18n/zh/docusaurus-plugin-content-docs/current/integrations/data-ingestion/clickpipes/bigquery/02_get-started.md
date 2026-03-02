---
sidebar_label: '入门'
description: '分步指南，帮助你创建首个 BigQuery ClickPipe。'
slug: /integrations/clickpipes/bigquery/get-started
title: '创建首个 BigQuery ClickPipe'
doc_type: 'guide'
---

import IntroClickPipe from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/clickpipes/bigquery/_intro.md';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step3.png';
import cp_step4 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step4.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/bigquery/cp_step5.png';
import Image from '@theme/IdealImage';


# 创建您的第一个 BigQuery ClickPipe \{#creating-your-first-bigquery-clickpipe\}

<IntroClickPipe/>

## 前置条件 \{#pre-requisites\}

* 你必须拥有在 GCP 项目中管理[服务账号](https://docs.cloud.google.com/iam/docs/service-account-overview)和 [IAM 角色](https://docs.cloud.google.com/iam/docs/roles-overview)的权限，或者从管理员那里获得协助。我们建议按照[官方文档](https://docs.cloud.google.com/iam/docs/service-accounts-create)创建一个具有最小必需[权限](./01_overview.md#permissions)集合的专用服务账号。

* 初始加载过程需要由用户提供的 Google Cloud Storage (GCS) bucket 作为中间暂存区域。我们建议按照[官方文档](https://docs.cloud.google.com/storage/docs/creating-buckets)为你的 ClickPipe 创建一个专用 bucket。未来，中间 bucket 将由 ClickPipes 提供并进行管理。

<VerticalStepper type="numbered" headerLevel="h2">

## 选择数据源 \{#1-select-the-data-source\}

**1.** 在 ClickHouse Cloud 中，在主导航菜单中选择 **Data sources** 并点击 **Create ClickPipe**。

    <Image img={cp_step0} alt="选择导入" size="lg" border/>

**2.** 点击 **BigQuery** 卡片。

    <Image img={cp_step1} alt="选择 BigQuery 卡片" size="lg" border/>

## 设置 ClickPipe 连接 \{#2-setup-your-clickpipe-connection\}

要设置一个新的 ClickPipe，你必须提供如何连接到 BigQuery 数仓并进行身份验证的信息，以及一个用于暂存的 GCS bucket。

**1.** 上传为 ClickPipes 创建的服务账号对应的 `.json` 密钥。确保该服务账号具有最小必需的[权限](./01_overview.md#permissions)集合。

    <Image img={cp_step2} alt="上传服务账号密钥" size="lg" border/>    

**2.** 选择 **Replication method**。在 Private Preview 中，唯一支持的选项是 [**Initial load only**](./01_overview.md#initial-load)。

**3.** 提供在初始加载期间用于暂存数据的 GCS bucket 路径。

**4.** 点击 **Next** 进行验证。

## 配置 ClickPipe \{#3-configure-your-clickpipe\}

根据 BigQuery 数据集的大小或你想要同步的表的总大小，你可能需要调整该 ClickPipe 的默认摄取设置。

## 配置表 \{#4-configure-tables\}

**1.** 选择要将 BigQuery 表复制到的 ClickHouse 数据库。你可以选择一个已有数据库或创建一个新的数据库。

**2.** 选择要复制的表，以及可选的列。只会列出所提供服务账号有权访问的数据集。

    <Image img={cp_step3} alt="权限" size="lg" border/>

**3.** 对于每个选定的表，确保在 **Advanced settings** > **Use a custom sorting key** 下定义一个自定义排序键。未来，排序键将会基于上游数据库中现有的聚簇或分区键自动推断。

    :::warning
    你**必须**为复制的表定义[排序键](../../../../best-practices/choosing_a_primary_key.md)，以便在 ClickHouse 中优化查询性能。否则，排序键将被设置为 `tuple()`，这意味着不会创建主索引，且 ClickHouse 会对该表上的所有查询执行全表扫描。
    :::

    <Image img={cp_step4} alt="权限" size="lg" border/>

## 配置权限 \{#6-configure-permissions\}

最后，你可以为内部的 ClickPipes 用户配置权限。

**Permissions：** ClickPipes 将创建一个专用用户，用于向目标表写入数据。你可以为该内部用户选择一个角色，使用自定义角色或预定义角色之一：
- `Full access`：对集群具有完全访问权限。如果你在目标表上使用 materialized view 或字典，则需要此角色。
- `Only destination`：仅对目标表具有插入权限。

## 完成设置 \{#7-complete-setup\}

点击 **Create ClickPipe** 完成设置。你将被重定向到概览页面，在那里可以查看初始加载的进度，并点击进入查看 BigQuery ClickPipes 的详细信息。

<Image img={cp_step5} alt="权限" size="lg" border/>

</VerticalStepper>