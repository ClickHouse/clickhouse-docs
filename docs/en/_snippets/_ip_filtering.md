## Setup IP filtering

IP filtering allows you to specify what source addresses are permitted to connect to your ClickHouse service.  IP filtering is configurable for each service.  Filters can be configured during the deployment of a service, or afterward.  If you do not configure IP filtering during provisioning, or if you want to make changes to your initial filter, then you can make those changes by selecting the service and then the **Security** tab.

<div class="row" style={{display: 'flex'}} >
  <div class="column" style={{flex: '30%', padding: '5px'}} >
  <img src={require('./images/cloud-select-a-service.png').default}/>
  </div>
  <div class="column" style={{flex: '30%', padding: '5px'}} >
  <img src={require('./images/ip-filtering-after-provisioning.png').default}/>
  </div>
</div>

Specify where your instance can be connected from.  There are two main choices: **Specific locations** and **Anywhere**.  Anywhere disables IP Filtering, so let's look at Specific Locations.  After selecting **Specific locations** you will notice that No traffic is currently able to access this service, and that you can add an entry.  Select **+ Add entry**.  
  <img src={require('./images/ip-filtering-no-traffic.png').default}/>

You can now add a CIDR that covers your IP range, add the IP address that you are currently connecting from, or add a specific IP address.  [ARIN](https://account.arin.net/public/cidrCalculator) and several other organizations provide CIDR calculators if you need one.  

<img src={require('./images/ip-filtering-add-cidr.png').default}/>

<p/>

:::tip
Take into consideration all of the locations from which you may need to connect, including remote workers and VPNs.
:::

Once you create your filter confirm connectivity from within the range, and confirm that connections from outside the permitted range are denied.

After your service is provisioned you can change the filter from the service overview > Security tab.
