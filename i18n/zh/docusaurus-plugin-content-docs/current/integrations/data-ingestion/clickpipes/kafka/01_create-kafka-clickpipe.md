---
sidebar_label: '创建你的第一个 Kafka ClickPipe'
description: '有关创建您的第一个 Kafka ClickPipe 的分步指南。'
slug: /integrations/clickpipes/kafka/create-your-first-kafka-clickpipe
sidebar_position: 1
title: '创建你的第一个 Kafka ClickPipe'
doc_type: 'guide'
keywords: ['创建 kafka clickpipe', 'kafka', 'clickpipes', '数据源', '配置指南']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step1.png';
import cp_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step2.png';
import cp_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step3.png';
import cp_step4a from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step4a.png';
import cp_step5 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step5.png';
import cp_overview from '@site/static/images/integrations/data-ingestion/clickpipes/cp_overview.png';
import cp_table_settings from '@site/static/images/integrations/data-ingestion/clickpipes/cp_table_settings.png';
import cp_ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/cp_ssh_tunnel.png';
import Image from '@theme/IdealImage';

# 创建你的第一个 Kafka ClickPipe \{#creating-your-first-kafka-clickpipe\}

> 本指南将带您逐步完成创建第一个 Kafka ClickPipe 的过程。

<VerticalStepper type="numbered" headerLevel="h2">
  ## 前往数据源 \{#1-load-sql-console\}

  在左侧菜单中选择 `Data Sources`，然后点击“Set up a ClickPipe”。

  <Image img={cp_step0} alt="选择导入" size="md" />

  ## 选择数据源 \{#2-select-data-source\}

  从列表中选择您的 Kafka 数据源。

  <Image img={cp_step1} alt="选择数据源类型" size="md" />

  ## 配置数据源 \{#3-configure-data-source\}

  填写表单，为 ClickPipe 提供名称、描述 (可选) 、凭据以及其他连接信息。

  <Image img={cp_step2} alt="填写连接信息" size="md" />

  ## 配置 schema registry (可选) \{#4-configure-your-schema-registry\}

  Avro 流需要有效的 schema。有关如何配置 schema registry 的更多信息，请参阅 [Schema registries](./02_schema-registries.md)。

  ## 配置反向 private endpoint (可选) \{#5-configure-reverse-private-endpoint\}

  配置 Reverse Private Endpoint，以便 ClickPipes 通过 AWS PrivateLink 连接到您的 Kafka cluster。
  更多信息请参阅 [AWS PrivateLink documentation](../aws-privatelink.md)。

  ## 配置 SSH 隧道 (可选) \{#6-configure-ssh-tunneling\}

  如果您的 Kafka broker 无法从公网访问，可以使用 SSH 隧道。ClickPipes 不会直接连接到 Kafka broker，而是先连接到堡垒主机 (您网络中可从公网访问的服务器) ，再通过该连接将流量转发到私有网络中的 Kafka broker。

  1. 启用“SSH Tunnel”开关。
  2. 填写 SSH 连接信息：
     * **SSH Host**：堡垒主机的主机名或 IP 地址，即可从公网访问、作为私有网络入口网关的服务器。
     * **SSH Port**：堡垒主机上的 SSH 端口 (默认值为 `22`) 。
     * **SSH User**：用于在堡垒主机上进行身份验证的用户名。

  <Image img={cp_ssh_tunnel} alt="SSH 隧道配置" size="md" />

  3. 如需使用基于密钥的身份验证，请点击“Revoke and regenerate key pair”生成新的密钥对，并将生成的公钥复制到 SSH 服务器上的 `~/.ssh/authorized_keys`。
  4. 点击“Verify Connection”验证连接。

  :::note
  请确保在 SSH 堡垒主机的防火墙规则中将 [ClickPipes IP addresses](../index.md#list-of-static-ips) 加入白名单，以便 ClickPipes 能够建立 SSH 隧道。
  :::

  ## 选择您的 topic \{#7-select-your-topic\}

  选择您的 topic 后，UI 将显示该 topic 中的示例文档。

  <Image img={cp_step3} alt="设置您的 topic" size="md" />

  ## 配置您的目标表 \{#8-configure-your-destination-table\}

  在下一步中，您可以选择将数据摄取到新的 ClickHouse 表中，或复用现有表。按照界面中的说明修改表名、schema 和 settings。您可以在顶部的示例表中实时预览这些更改。

  <Image img={cp_step4a} alt="设置表、schema 和 settings" size="md" />

  您还可以使用提供的控件自定义高级 settings。

  <Image img={cp_table_settings} alt="设置高级控件" size="md" />

  ## 配置权限 \{#9-configure-permissions\}

  ClickPipes 将创建一个专用用户，用于向目标表写入数据。您可以为该内部用户选择自定义角色或预定义角色之一：

  * `Full access`：拥有对 cluster 的完全访问权限。如果您在目标表上使用 Materialized View 或 Dictionary，这可能会很有帮助。
  * `Only destination table`：仅拥有对目标表的 `INSERT` 权限。

  <Image img={cp_step5} alt="权限" size="md" />

  ## 完成配置 \{#10-complete-setup\}

  点击“Create ClickPipe”后，将创建并运行您的 ClickPipe。创建完成后，它会显示在 Data Sources 部分。

  <Image img={cp_overview} alt="查看概览" size="md" />
</VerticalStepper>