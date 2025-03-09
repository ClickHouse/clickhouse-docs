
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
    <summary>管理您的 IP 访问列表</summary>

从您的 ClickHouse Cloud 服务列表中选择您要使用的服务，并切换到 **设置**。 如果 IP 访问列表中不包含需要连接到您的 ClickHouse Cloud 服务的远程系统的 IP 地址或范围，您可以通过 **添加 IP** 来解决问题：

<img src={ip_allow_list_check_list} class="image" alt="检查服务是否允许流量" />

添加需要连接到您的 ClickHouse Cloud 服务的单个 IP 地址或地址范围。根据需要修改表单，然后 **保存**。

<img src={ip_allow_list_add_current_ip} class="image" alt="添加您当前的 IP 地址" />

</details>
```
