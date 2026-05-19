import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            {...props} 
            src="/minhajussalam.png" 
            alt="Logo Sekolah/Aplikasi" 
        />
    );
}
