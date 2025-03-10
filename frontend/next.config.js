/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias = {
          ...config.resolve.alias,
          'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js'),
        };
        return config;
      },
    images:{
        domains:['asset.cloudinary.com'],
    }
}

module.exports = nextConfig

