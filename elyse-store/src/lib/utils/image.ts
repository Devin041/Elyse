/**
 * Cloudinary URL Optimizer
 * Adds automatic format (f_auto) and quality (q_auto) to images to reduce weight.
 */
export function optimizeCloudinaryUrl(url: string, width?: number, height?: number): string {
    if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
        return url || '/placeholder.jpg';
    }

    // Don't optimize if already has transformations
    if (url.includes('/upload/w_') || url.includes('/upload/f_auto')) {
        return url;
    }

    const transformation = [];
    transformation.push('f_auto'); // Automatic format (WebP/AVIF)
    transformation.push('q_auto'); // Automatic quality

    if (width) transformation.push(`w_${width}`);
    if (height) transformation.push(`h_${height}`);

    const transformationString = transformation.join(',');

    // Replace '/upload/' with '/upload/[transformations]/'
    return url.replace('/upload/', `/upload/${transformationString}/`);
}

export const PLACEHOLDER_IMAGE = '/placeholder.jpg';
