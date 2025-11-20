---
slug: /deployment-modes
sidebar_label: '部署模式'
description: 'ClickHouse 提供四种部署选项，全部基于同一个强大的数据库引擎，只是封装方式不同，以满足你的特定需求。'
title: '部署模式'
keywords: ['Deployment Modes', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse 是一个功能多样的数据库系统，可以根据你的需求以多种不同方式部署。从本质上讲，所有部署选项**都使用同一个强大的 ClickHouse 数据库引擎**——不同之处在于你如何与它交互，以及它运行在什么环境中。

无论你是在生产环境中运行大规模分析、进行本地数据分析，还是构建应用程序，都有针对你用例设计的部署选项。底层引擎的一致性意味着在所有部署模式下，你都能获得同样的高性能和 SQL 兼容性。
本指南将介绍部署和使用 ClickHouse 的四种主要方式：

* 用于传统客户端/服务器部署的 ClickHouse Server
* 用于完全托管数据库运维的 ClickHouse Cloud
* 用于命令行数据处理的 clickhouse-local
* 用于将 ClickHouse 直接嵌入应用程序的 chDB

每种部署模式都有其优势和理想适用场景，我们将在下文中详细介绍。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server {#clickhouse-server}

ClickHouse Server 采用传统的客户端/服务器架构,是生产环境部署的理想选择。该部署模式提供完整的 OLAP 数据库功能,具备 ClickHouse 引以为傲的高吞吐量和低延迟查询性能。

<Image img={chServer} alt='ClickHouse Server' size='sm' />

<br />

在部署灵活性方面,ClickHouse Server 可以安装在本地机器上用于开发或测试,也可以部署到 AWS、GCP 或 Azure 等主流云服务提供商进行云端运营,或者部署在您自有的本地硬件上。对于大规模运营场景,可以将其配置为分布式集群,以应对更高的负载并提供高可用性。

该部署模式是生产环境的首选,特别适用于对可靠性、性能和完整功能访问有严格要求的场景。


## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) 是 ClickHouse 的全托管版本,免除了自行部署运维的负担。它保留了 ClickHouse Server 的所有核心能力,同时通过额外功能增强用户体验,简化开发和运维工作。

<Image img={chCloud} alt='ClickHouse Cloud' size='sm' />

ClickHouse Cloud 的一个关键优势是其集成工具。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes) 提供了强大的数据摄取框架,让您能够轻松连接各种数据源并进行流式传输,无需管理复杂的 ETL 管道。该平台还提供了专用的[查询 API](/cloud/get-started/query-endpoints),大幅简化了应用程序的构建。

ClickHouse Cloud 中的 SQL Console 包含强大的[仪表板](/cloud/manage/dashboards)功能,可将查询转换为交互式可视化图表。您可以基于已保存的查询创建和共享仪表板,并通过查询参数添加交互元素。这些仪表板可以使用全局过滤器实现动态化,允许用户通过可自定义的视图探索数据——但需要注意的是,用户至少需要对底层已保存查询具有读取权限才能查看可视化内容。

在监控和优化方面,ClickHouse Cloud 包含内置图表和[查询洞察](/cloud/get-started/query-insights)功能。这些工具深入展示集群性能,帮助您了解查询模式、资源利用率以及潜在的优化机会。这种可观测性水平对于需要维持高性能分析操作而又无需投入资源管理基础设施的团队尤为重要。

该服务的托管特性意味着您无需担心更新、备份、扩展或安全补丁——这些都会自动处理。这使其成为希望专注于数据和应用程序而非数据库管理的组织的理想选择。


## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) 是一个功能强大的命令行工具,以独立可执行文件的形式提供 ClickHouse 的完整功能。它本质上与 ClickHouse Server 是同一个数据库,但采用了不同的打包方式,让您无需运行服务器实例即可直接从命令行使用 ClickHouse 的所有功能。

<Image img={chLocal} alt='clickHouse-local' size='sm' />

该工具特别擅长即席数据分析,尤其适用于处理本地文件或云存储服务中的数据。您可以使用 ClickHouse 的 SQL 方言直接查询各种格式的文件(CSV、JSON、Parquet 等),这使其成为快速数据探索或一次性分析任务的理想选择。

由于 clickhouse-local 包含 ClickHouse 的全部功能,您可以用它进行数据转换、格式转换,或执行任何通常在 ClickHouse Server 上进行的数据库操作。虽然它主要用于临时操作,但在需要时也可以使用与 ClickHouse Server 相同的存储引擎来持久化数据。

远程表函数与本地文件系统访问的结合,使 clickhouse-local 在需要关联 ClickHouse Server 与本地机器上文件数据的场景中特别有用。当您处理不希望上传到服务器的敏感数据或临时本地数据时,这一特性尤其有价值。


## chDB {#chdb}

[chDB](/chdb) 是作为进程内数据库引擎嵌入的 ClickHouse,主要实现为 Python 版本,同时也提供 Go、Rust、NodeJS 和 Bun 版本。这种部署方式将 ClickHouse 强大的 OLAP 能力直接集成到应用程序进程中,无需单独安装数据库。

<Image img={chDB} alt='chDB - Embedded ClickHouse' size='sm' />

chDB 可与应用程序生态系统无缝集成。例如在 Python 中,它经过优化可高效配合 Pandas 和 Arrow 等常用数据科学工具使用,通过 Python memoryview 最小化数据复制开销。这使其对希望在现有工作流中利用 ClickHouse 查询性能的数据科学家和分析师特别有价值。

chDB 还可以连接到使用 clickhouse-local 创建的数据库,为数据处理方式提供了灵活性。这意味着您可以在本地开发、Python 数据探索和更持久的存储解决方案之间无缝切换,而无需改变数据访问模式。
