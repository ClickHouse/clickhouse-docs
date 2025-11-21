import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
  <summary>管理 IP 访问列表</summary>

  在 ClickHouse Cloud 服务列表中，选择要使用的服务并切换到 **Settings**。如果 IP 访问列表中不包含需要连接到 ClickHouse Cloud 服务的远程系统的 IP 地址或地址范围，可以通过 **Add IPs** 进行添加：

  <Image size="md" img={ip_allow_list_check_list} alt="检查 IP 访问列表是否允许来自您 IP 地址的流量" border />

  添加需要连接到 ClickHouse Cloud 服务的单个 IP 地址或地址范围。根据需要修改表单，然后点击 **Save**。

  <Image size="md" img={ip_allow_list_add_current_ip} alt="将您当前的 IP 地址添加到 ClickHouse Cloud 的 IP 访问列表中" border />
</details>
