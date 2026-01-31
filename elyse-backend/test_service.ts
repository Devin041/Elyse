import { updateProduct } from './src/api/services/product.service';
import logger from './src/utils/logger';

async function testUpdate() {
    const productId = '6bca5803-f65c-4683-82a3-f886d4b6e3f5'; // New Haritage Queen ID
    const images = [
        'https://res.cloudinary.com/dt3sqo86m/image/upload/v1735811342/elyse/product_6bca5803_0.jpg',
        'https://res.cloudinary.com/dt3sqo86m/image/upload/v1735811342/elyse/product_6bca5803_1.jpg'
    ];

    try {
        console.log('Testing updateProduct with images...');
        const result = await updateProduct(productId, { images } as any);
        console.log('Update successful! Result images count:', result.images.length);
        console.log('First image URL:', result.images[0].url);
    } catch (error: any) {
        console.error('Update failed:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testUpdate();
