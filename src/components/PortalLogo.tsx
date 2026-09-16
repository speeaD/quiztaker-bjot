import Image from 'next/image';

interface PortalLogoProps {
  className?: string;
  size?: number;
  priority?: boolean;
}

export default function PortalLogo({ className = '', size = 60, priority = false }: PortalLogoProps) {
  return (
    <Image
      src="/bjot-logo-cropped.png"
      alt="BJOT"
      width={size}
      height={size}
      priority={priority}
      className={`${className} h-${size} w-${size} object-contain`}
    />
  );
}
