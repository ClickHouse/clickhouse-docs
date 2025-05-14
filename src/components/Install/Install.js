import {CardPrimary} from '@clickhouse/click-ui/bundled';
import {useState, useEffect} from 'react';

const InstallSelector = (props) => {

    const [platform, setPlatformType] = useState(null)

    const handleSelectMacOS = () => setPlatformType('MacOS');
    const handleSelectWindows = () => setPlatformType('Windows');
    const handleSelectDocker = () => setPlatformType('Docker');

    const handleSelectDebian = () => setPlatformType('Debian');
    const handleSelectUbuntu = () => setPlatformType('Ubuntu');
    const handleSelectRedhat = () => setPlatformType('Redhat');
    const handleSelectLinuxOther = () => setPlatformType('LinuxOther');


    const renderDistribution = () => {
        if (1) {
            return <div className="installContainer">
                    <CardPrimary
                        className="install-card"
                        alignContent="center"
                        iconUrl="/docs/img/DebianUbuntu.svg"
                        infoUrl="https://clickhouse.com"
                        onClick={handleSelectDebian}
                        size="sm"
                        title="Debian/Ubuntu"
                        isSelected={platform === 'Debian'}
                    />
                    <CardPrimary
                        className="install-card"
                        alignContent="center"
                        iconUrl="/docs/img/redhat.svg"
                        infoUrl="https://clickhouse.com"
                        onClick={handleSelectRedhat}
                        size="sm"
                        title="Redhat"
                        isSelected={platform === 'Redhat'}
                    />
                    <CardPrimary
                        className="install-card"
                        alignContent="center"
                        iconUrl="/docs/img/linux.svg"
                        infoUrl="https://clickhouse.com"
                        onClick={handleSelectLinuxOther}
                        size="sm"
                        title="Other"
                        isSelected={platform === 'LinuxOther'}
                    />
                    <CardPrimary
                        className="install-card"
                        alignContent="center"
                        iconUrl="/docs/img/apple.png"
                        infoUrl="https://clickhouse.com"
                        onClick={handleSelectMacOS}
                        size="sm"
                        title="MacOS"
                        isSelected={platform === 'MacOS'}
                    />
                    <CardPrimary
                        className="install-card"
                        alignContent="center"
                        iconUrl="/docs/img/windows.svg"
                        infoUrl="https://clickhouse.com"
                        onClick={handleSelectWindows}
                        size="sm"
                        title="Windows"
                        isSelected={platform === 'Windows'}
                    />
                    <CardPrimary
                        className="install-card"
                        alignContent="center"
                        iconUrl="/docs/img/docker.svg"
                        infoUrl="https://clickhouse.com"
                        onClick={handleSelectDocker}
                        size="sm"
                        title="Docker"
                        isSelected={platform === 'Docker'}
                    />
                </div>
        } else {
            return <></>
        }
    }
    const renderInstallInstructions = (props) => {
        if (platform === 'Debian') {
            return props.debian_prod
        } else if (platform === 'Ubuntu') {
            return props.debian_prod
        } else if (platform === 'Redhat') {
            return props.rpm_prod
        } else if (platform === 'LinuxOther') {
            return props.tar_prod
        } else if (platform === 'Windows') {
            return props.windows
        } else if (platform === 'MacOS') {
            return props.macos_prod
        } else if (platform === 'Docker') {
            return props.docker
        } else {
            return null
        }
    };


    return (
        <>
        <div className="prod-or-quick-install">
            {renderDistribution()}
        </div>
        <div className="installInstructions">
            {renderInstallInstructions(props)}
        </div>
        </>
    )
}

export default InstallSelector;