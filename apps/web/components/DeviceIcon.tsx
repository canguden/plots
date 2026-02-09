import { Monitor, Smartphone, Tablet, Laptop, HelpCircle } from "lucide-react";

export function DeviceIcon({ device }: { device: string }) {
  const deviceLower = device.toLowerCase();

  const iconSize = 16;
  const iconClass = "text-[#666]";

  if (deviceLower.includes('mac') || deviceLower.includes('laptop') || deviceLower.includes('desktop')) {
    return <Monitor size={iconSize} className={iconClass} />;
  }

  if (deviceLower.includes('iphone') || deviceLower.includes('mobile') || deviceLower.includes('android') && !deviceLower.includes('tablet')) {
    return <Smartphone size={iconSize} className={iconClass} />;
  }

  if (deviceLower.includes('ipad') || deviceLower.includes('tablet')) {
    return <Tablet size={iconSize} className={iconClass} />;
  }

  // Windows/PC often refers to desktop
  if (deviceLower.includes('windows') || deviceLower.includes('pc')) {
    return <Monitor size={iconSize} className={iconClass} />;
  }

  return <HelpCircle size={iconSize} className={iconClass} />;
}
