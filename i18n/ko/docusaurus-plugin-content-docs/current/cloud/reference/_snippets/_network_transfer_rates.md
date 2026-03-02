아래 표는 클라우드 제공자와 리전에 따라 공용 인터넷 egress 또는 리전 간 데이터 전송 요금이 어떻게 달라지는지 보여줍니다.

**AWS**

<table style={{ textAlign: 'center' }}>
    <thead >
        <tr>
            <th>클라우드 제공자</th>
            <th>리전</th>
            <th>공용 인터넷 egress</th>
            <th>동일 리전</th>
            <th>리전 간 <br/>(모든 Tier 1)</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>`AWS`</td>
            <td>`ap-northeast-1`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-south-1`</td>
            <td>`$0.1384`</td>
            <td>`$0.0000`</td>
            <td>`$0.1104`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-1`</td>
            <td>`$0.1512`</td>
            <td>`$0.0000`</td>
            <td>`$0.1152`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`ap-southeast-2`</td>
            <td>`$0.1440`</td>
            <td>`$0.0000`</td>
            <td>`$0.1248`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-central-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`eu-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-1`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-east-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
        <tr>
            <td>`AWS`</td>
            <td>`us-west-2`</td>
            <td>`$0.1152`</td>
            <td>`$0.0000`</td>
            <td>`$0.0312`</td>
        </tr>
    </tbody>
</table>

$^*$데이터 전송 요금은 전송된 데이터 1GB당 달러($) 금액을 의미합니다.

**GCP**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">Cloud 제공업체</th>
        <th rowSpan="2">원본 리전</th>
        <th rowSpan="2">공용 인터넷 송신</th>
        <th colSpan="5">대상 리전</th>
    </tr>
    <tr>
        <th>동일 리전</th>
        <th>북미</th>
        <th>유럽</th>
        <th>아시아, 오세아니아</th>
        <th>중동, 남아메리카, 아프리카</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`GCP`</td>
        <td>`us-central1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360` (Tier 1)</td>
        <td>`$0.0720` (Tier 2)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`us-east1`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0360` (Tier 1)</td>
        <td>`$0.0720` (Tier 2)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`europe-west4`</td>
        <td>`$0.1140`</td>
        <td>`$0.0000`</td>
        <td>`$0.0720` (Tier 2)</td>
        <td>`$0.0360` (Tier 1)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    <tr>
        <td>`GCP`</td>
        <td>`asia-southeast1`</td>
        <td>`$0.1440`</td>
        <td>`$0.0000`</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1200` (Tier 3)</td>
        <td>`$0.1620` (Tier 4)</td>
    </tr>
    </tbody>
</table>

$^*$데이터 전송 요금은 전송된 데이터 1GB당 달러($) 단가입니다

**Azure**

<table style={{ textAlign: 'center' }}>
    <thead>
    <tr>
        <th rowSpan="2">Cloud 제공업체</th>
        <th rowSpan="2">원본 리전</th>
        <th rowSpan="2">퍼블릭 인터넷 송신(egress)</th>
        <th colSpan="5">대상 리전</th>
    </tr>
    <tr>
        <th>동일 리전</th>
        <th>북미</th>
        <th>유럽</th>
        <th>아시아, 오세아니아</th>
        <th>중동, 남미, 아프리카</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>`Azure`</td>
        <td>`eastus2`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300` (Tier 1)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`westus3`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0300` (Tier 1)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
    </tr>
    <tr>
        <td>`Azure`</td>
        <td>`germanywestcentral`</td>
        <td>`$0.1020`</td>
        <td>`$0.0000`</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0300` (Tier 1)</td>
        <td>`$0.0660` (Tier 2)</td>
        <td>`$0.0660` (Tier 2)</td>
    </tr>
    </tbody>
</table>

$^*$데이터 전송 요금은 전송된 데이터 1GB당 미화($) 기준입니다