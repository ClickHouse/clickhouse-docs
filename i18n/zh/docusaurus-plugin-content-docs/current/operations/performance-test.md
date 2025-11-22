---
description: '使用 ClickHouse 进行硬件性能测试和基准测试的指南'
sidebar_label: '硬件测试'
sidebar_position: 54
slug: /operations/performance-test
title: '如何使用 ClickHouse 测试硬件性能'
doc_type: 'guide'
---

import SelfManaged from '@site/docs/_snippets/_self_managed_only_no_roadmap.md';

<SelfManaged />

你可以在任意服务器上运行基础的 ClickHouse 性能测试，而无需安装 ClickHouse 软件包。


## 自动化运行 {#automated-run}

您可以使用单个脚本运行基准测试。

1. 下载脚本。

```bash
wget https://raw.githubusercontent.com/ClickHouse/ClickBench/main/hardware/hardware.sh
```

2. 运行脚本。

```bash
chmod a+x ./hardware.sh
./hardware.sh
```

3. 复制输出结果并发送至 feedback@clickhouse.com

所有结果已发布于：https://clickhouse.com/benchmark/hardware/
