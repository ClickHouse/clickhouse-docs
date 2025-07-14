import Image from '@theme/IdealImage';
import ip_allow_list_check_list from '@site/static/images/_snippets/ip-allow-list-check-list.png';
import ip_allow_list_add_current_ip from '@site/static/images/_snippets/ip-allow-list-add-current-ip.png';

<details>
<summary>Manage your IP Access List</summary>
From your ClickHouse Cloud services list choose the service that you will work with and switch to **Settings**.  If the IP Access List does not contain the IP Address or range of the remote system that needs to connect to your ClickHouse Cloud service, then you can resolve the problem with **Add IPs**:
<Image size="md" img={ip_allow_list_check_list} alt="Check to see if the service allows traffic from your IP address in the IP Access List" border />
Add the individual IP Address, or the range of addresses that need to connect to your ClickHouse Cloud service. Modify the form as you see fit and then **Save**.
<Image size="md" img={ip_allow_list_add_current_ip} alt="Add your current IP address to the IP Access List in ClickHouse Cloud" border />
</details>
