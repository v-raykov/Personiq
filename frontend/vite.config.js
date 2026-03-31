import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    plugins: [react()],
    define: {
        __API_BASE_URL__: JSON.stringify('http://localhost:8080')
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
})