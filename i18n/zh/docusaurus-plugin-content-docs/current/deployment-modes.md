---
slug: /deployment-modes
sidebar_label: '部署模式'
description: 'ClickHouse 提供四种部署选项，全部使用同一款强大的数据库引擎，只是采用不同的打包方式，以满足您的特定需求。'
title: '部署模式'
keywords: ['部署模式', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个功能多样的数据库系统，可以根据需求以多种不同方式进行部署。从本质上讲，所有部署选项**都使用同一个强大的 ClickHouse 数据库引擎**——不同之处在于如何与它交互，以及它运行在什么环境中。

无论是在生产环境中运行大规模分析、进行本地数据分析，还是构建应用程序，都有适合相应使用场景的部署选项。底层引擎的一致性意味着在所有部署模式下都能获得同样的高性能和 SQL 兼容性。
本指南将介绍 ClickHouse 的四种主要部署和使用方式：

* 用于传统客户端/服务器部署的 ClickHouse Server
* 用于全托管数据库服务的 ClickHouse Cloud
* 用于命令行数据处理的 clickhouse-local
* 用于在应用中直接嵌入 ClickHouse 的 chDB

每种部署模式都有其自身优势和理想适用场景，我们将在下文中逐一详细说明。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server \{#clickhouse-server\}

ClickHouse Server 采用传统的客户端/服务器架构，非常适合用于生产环境部署。此部署模式提供完整的 OLAP 数据库能力，并具备 ClickHouse 所著称的高吞吐量、低延迟查询性能。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

在部署灵活性方面，ClickHouse Server 既可以安装在本地机器上用于开发或测试，也可以部署到 AWS、GCP 或 Azure 等主流云服务商上以支持云端运行，或在自有本地基础设施上进行搭建。对于更大规模的场景，可以将其配置为分布式集群，以处理更高负载并提供高可用性。

这种部署模式是生产环境的首选方案，尤其适用于对可靠性、性能以及完整功能特性使用有严格要求的场景。

## ClickHouse Cloud \{#clickhouse-cloud\}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的全托管版本，免除了自建部署带来的运维开销。在保留 ClickHouse Server 全部核心能力的同时，它通过一系列附加功能提升整体体验，从而进一步简化开发和运维工作。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud 的一大优势在于其集成化工具链。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes) 提供了健壮的数据摄取框架，使用户无需维护复杂的 ETL 流水线，即可轻松连接并从各类数据源进行流式数据传输。该平台还提供专用的[查询 API](/cloud/get-started/query-endpoints)，显著降低了构建应用程序的复杂度。

ClickHouse Cloud 中的 SQL Console 内置强大的[仪表板](/cloud/manage/dashboards)功能，可将查询转换为交互式可视化。用户可以基于已保存的查询创建并共享仪表板，并通过查询参数添加交互元素。通过全局筛选器，这些仪表板可以实现动态化，使用户能够通过自定义视图探索数据——但需注意，用户至少需要对底层已保存查询具有只读访问权限，才能查看这些可视化内容。

在监控和优化方面，ClickHouse Cloud 集成了内置图表和[查询洞察](/cloud/get-started/query-insights)。这些工具为集群性能提供深入可见性，帮助团队理解查询模式、资源使用情况以及潜在的优化机会。对于希望在无需额外投入基础设施管理资源的前提下，持续维持高性能分析能力的团队而言，这种可观测性尤为关键。

由于服务为托管模式，无需操心更新、备份、弹性伸缩或安全补丁——这些都由平台自动处理。因此，对于希望将精力集中在数据与应用，而非数据库运维管理的组织而言，这是一个理想选择。

## clickhouse-local \{#clickhouse-local\}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个功能强大的命令行工具，以独立可执行文件的形式提供完整的 ClickHouse 功能。本质上，它与 ClickHouse Server 是同一个数据库，但采用了不同的打包方式，使你无需运行服务器实例即可直接在命令行中使用 ClickHouse 的全部能力。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

该工具在即席数据分析方面表现出色，尤其适用于处理本地文件或存储在云存储服务中的数据。你可以使用 ClickHouse 的 SQL 方言直接查询多种格式的文件（CSV、JSON、Parquet 等），非常适合进行快速数据探索或一次性分析任务。

由于 clickhouse-local 包含 ClickHouse 的全部功能，你可以使用它完成数据转换、格式转换，或任何通常在 ClickHouse Server 上执行的数据库操作。虽然它主要用于临时操作，但在需要时也可以使用与 ClickHouse Server 相同的存储引擎来持久化数据。

远程表函数与本地文件系统访问能力的结合，使得 clickhouse-local 在需要在 ClickHouse Server 与本地机器上的文件之间进行数据联接时尤其实用。对于那些你不希望上传到服务器的敏感或临时本地数据，这一点显得尤为有价值。

## chDB \{#chdb\}

[chDB](/chdb) 是以进程内数据库引擎形式嵌入的 ClickHouse，主要实现为 Python 版本，同时也支持 Go、Rust、NodeJS 和 Bun。通过这种部署选项，可以将 ClickHouse 强大的 OLAP 能力直接引入到你的应用进程中，无需单独部署数据库实例。

<Image img={chDB} alt="chDB - 嵌入式 ClickHouse" size="sm"/>

chDB 能与你的应用生态系统无缝集成。以 Python 为例，它针对 Pandas 和 Arrow 等常见数据科学工具进行了优化，并通过 Python 的 memoryview 最大限度地减少数据拷贝开销。这使其对希望在现有工作流中利用 ClickHouse 查询性能的数据科学家和分析师尤其有价值。

chDB 还可以连接由 clickhouse-local 创建的数据库，在数据使用方式上提供更大的灵活性。这意味着你可以在本地开发、在 Python 中进行数据探索，以及切换到更长期的存储方案之间无缝过渡，而无需改变数据访问模式。