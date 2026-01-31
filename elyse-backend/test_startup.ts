console.log('--- STARTING DIAGNOSTIC STARTUP ---');
try {
    console.log('Importing config...');
    require('./src/config/env.config');
    console.log('Config loaded.');

    console.log('Importing logger...');
    require('./src/utils/logger');
    console.log('Logger loaded.');

    console.log('Importing app...');
    require('./src/app');
    console.log('App loaded.');

    console.log('--- DIAGNOSTIC SUCCESSFUL ---');
} catch (error: any) {
    console.error('--- DIAGNOSTIC FAILED ---');
    console.error(error);
    if (error.stack) console.error(error.stack);
}
