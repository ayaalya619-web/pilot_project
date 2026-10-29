import dotenv from 'dotenv';
dotenv.config();

interface Config {
    port: string | number;
}

const config: Config = {
    port: process.env.PORT || 3000
};

export default config;
