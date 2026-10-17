import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo.png"
            alt="The Kelana Club"
            {...props}
            className={`rounded object-cover ${props.className || 'size-6'}`}
        />
    );
}
