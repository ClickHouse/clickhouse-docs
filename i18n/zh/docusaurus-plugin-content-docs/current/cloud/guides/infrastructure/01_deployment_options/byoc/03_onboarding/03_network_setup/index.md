---
title: '私有网络设置'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: '私有网络设置'
hide_title: true
description: 'ClickHouse Cloud BYOC 私有网络设置部分的目录页'
doc_type: 'landing-page'
keywords: ['BYOC', '云', '自带云环境', 'VPC 对等连接', 'privatelink', 'private service connect']
---

# 私有网络设置 \{#private-networking-setup\}

ClickHouse BYOC 支持多种私有网络连接方案，可增强安全性，并使您的服务能够直接连通。这个指南将介绍推荐的方法，帮助您将自己 AWS 或 GCP 账户中的 ClickHouse Cloud 部署安全地连接到其他网络或服务，例如内部应用程序或分析工具。本文涵盖 VPC 对等连接、AWS PrivateLink 和 GCP Private Service Connect 等方案，并概述每种方案的主要步骤和注意事项。

如果您需要为 ClickHouse BYOC 部署建立私有网络连接，请按照相关指南中的步骤进行操作；如需处理更进阶的场景，请联系 ClickHouse Support 获取帮助。