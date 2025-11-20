import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>管理你的 IP 访问列表</summary>

  在你的 ClickHouse Cloud 服务列表中，选择你要使用的服务并切换到 **Settings**。如果 IP 访问列表中不包含需要连接到 ClickHouse Cloud 服务的远程系统的 IP 地址或地址范围，则可以通过 **Add IPs** 来解决这个问题：

  <Image size="md" img={ip_allow_list_check_list} alt="检查服务的 IP 访问列表中是否允许来自你 IP 地址的流量" border />

  添加需要连接到 ClickHouse Cloud 服务的单个 IP 地址或地址范围。根据需要修改表单，然后点击 **Save**。

  <Image size="md" img={ip_allow_list_add_current_ip} alt="将你当前的 IP 地址添加到 ClickHouse Cloud 中的 IP 访问列表" border />
</details>
