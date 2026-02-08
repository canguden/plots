// ASCII device icons
export function DeviceIcon({ device }: { device: string }) {
  const deviceLower = device.toLowerCase();

  if (deviceLower.includes('mac') || deviceLower.includes('ios') || deviceLower.includes('iphone') || deviceLower.includes('ipad')) {
    return (
      <pre className="text-[10px] leading-none text-[#666]">
{` ▄▄▄
█   █
█▄▄▄█`}
      </pre>
    );
  }

  if (deviceLower.includes('windows') || deviceLower.includes('pc')) {
    return (
      <pre className="text-[10px] leading-none text-[#666]">
{`█ █
█▄█
█ █`}
      </pre>
    );
  }

  if (deviceLower.includes('linux') || deviceLower.includes('ubuntu') || deviceLower.includes('debian')) {
    return (
      <pre className="text-[10px] leading-none text-[#666]">
{` ▄█▄
█▀▀▀
`}
      </pre>
    );
  }

  if (deviceLower.includes('android')) {
    return (
      <pre className="text-[10px] leading-none text-[#666]">
{` ▄ ▄
█▀▀█
█▄▄█`}
      </pre>
    );
  }

  // Default/unknown device
  return (
    <pre className="text-[10px] leading-none text-[#666]">
{`▄█▄
█▀█
▀▀▀`}
    </pre>
  );
}
