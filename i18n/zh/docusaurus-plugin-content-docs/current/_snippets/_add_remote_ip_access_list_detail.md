---
{}
---

import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>管理您的 IP 访问列表</summary>

从您的 ClickHouse Cloud 服务列表中选择您要使用的服务并切换到 **设置**。如果 IP 访问列表不包含需要连接到您的 ClickHouse Cloud 服务的远程系统的 IP 地址或地址范围，则可以通过 **添加 IP** 来解决此问题：

<Image size="md" img={ip_allow_list_check_list} alt="检查该服务是否允许来自您在 IP 访问列表中的 IP 地址的流量" border />

添加需要连接到您的 ClickHouse Cloud 服务的单个 IP 地址或地址范围。根据需要修改表单，然后 **保存**。

<Image size="md" img={ip_allow_list_add_current_ip} alt="将您当前的 IP 地址添加到 ClickHouse Cloud 的 IP 访问列表中" border />

</details>
