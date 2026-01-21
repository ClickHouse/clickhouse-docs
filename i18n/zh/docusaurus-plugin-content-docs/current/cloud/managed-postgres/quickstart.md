---
slug: /cloud/managed-postgres/quickstart
sidebar_label: '快速入门'
title: '快速入门'
description: '创建您的第一个托管 Postgres 数据库并浏览实例仪表盘'
keywords: ['托管 Postgres', '快速入门', '入门指南', '创建数据库']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge />


## 创建数据库 \{#create-database\}

要创建新的托管 Postgres 数据库，请在 Cloud 控制台侧边栏中选择 PostgreSQL。

{/* TODO(kaushik-ubi): Cloud 控制台侧边栏截图，突出显示 PostgreSQL 选项
    Path: /static/images/cloud/managed-postgres/console-sidebar.png */}

点击 **New PostgreSQL database** 打开配置页面。为数据库服务器输入名称，并根据工作负载需求选择实例类型。系统会为您自动生成一个安全的密码。

{/* TODO(kaushik-ubi): 创建数据库表单的截图
    Path: /static/images/cloud/managed-postgres/create-database.png */}

选择实例类型后，点击 **Create**。几分钟后，您的托管 Postgres 实例将被创建并准备就绪，可供使用。


## 实例概览 \{#instance-overview\}

实例概览页面提供 PostgreSQL 实例当前状态的全局视图，包括状态与健康指示器、实例类型及资源配置、所在区域和可用区详情、高可用性配置，以及实时 CPU 和磁盘使用率指标。

{/* TODO(kaushik-ubi): 实例概览仪表板截图
    Path: /static/images/cloud/managed-postgres/instance-overview.png */}

在此页面上，您可以查看[连接详细信息](/cloud/managed-postgres/connection)、配置[高可用性](/cloud/managed-postgres/high-availability)选项、管理[只读副本](/cloud/managed-postgres/read-replicas)，并持续监控数据库的性能表现。


## 可用性 \{#availability\}

Managed Postgres 目前在 AWS 的 10 个区域提供服务，拥有 50 多种基于 NVMe 的配置，规格从 2 vCPU、8 GB 内存和 118 GB 存储到 96 vCPU、768 GB 内存和 60 TB 存储不等。后续计划支持 GCP 和 Azure。

该服务内置用于连接池的 [PgBouncer](/cloud/managed-postgres/connection#pgbouncer)，并提供主版本升级以及所有标准的托管服务功能。