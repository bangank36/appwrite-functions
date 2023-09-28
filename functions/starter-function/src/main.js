const webpack = require('webpack');
const path = require("path");
const MemoryFS = require('memory-fs');
const fs = require('fs');

require('dotenv').config();

// Mock the getSiteId function to return Promise that resolve to a siteId
const getSiteId = (order_id, site_url) => {
    return new Promise((resolve, reject) => {
        resolve({
            siteId: process.env.SITE_ID || 'SITE_ID',
        }); 
    });
};
const webpackConfigFunction = require('../webpack/webpack.config.functions');

let inputFile;
let package;

module.exports = async ({ req, res, log, error }) => {
    const order_id = req.query.order_id;
    const site_url = req.query.site_url;
    const package_name = req.query.package;

    // Select the entry point for per the package & // Read the contents of file to be compiled
    switch (package_name) {
        case "lightbox-studio":
            package = "beyondspace--lightbox-studio";
            inputFile = path.resolve(__dirname, '../packages/lightbox-studio/lightbox-studio.js');
            break;
        case "datepicker-field":
            package = "beyondspace-datepicker";
            inputFile = path.resolve(__dirname, '../packages/datepicker-field/datepicker-field.js');
            break;
        case "pinchable-lightbox":
        default:
            package = "starter-package";
            inputFile = path.resolve(__dirname, '../packages/starter-package/index.js');
            break;
    }
    
    log( 'before webpack' );
    try {
        log( 'inside webpack' );
        // Print the content of the inputFile
        const inputFileContent = fs.readFileSync(inputFile, 'utf8');
        log(inputFileContent);
        // Create an instance of MemoryFS
        const memFS = new MemoryFS();
        // Fetch the site ID ( Squarespace ) to assign into the order using `getSiteId` ( returns Promise )
        // Use Promise.all() to await both getSiteId() and require('webpack-obfuscator'), make sure they run in parallel and not block the script too long
        const [orderInstance, WebpackObfuscator] = await Promise.all([
            getSiteId(order_id, site_url),
            require('webpack-obfuscator')
        ]);

        // Configure webpack to compile the input file
        const webpackConfig = webpackConfigFunction(inputFile, orderInstance.siteId, WebpackObfuscator);
        const compiler = webpack(webpackConfig);
        // Override the file system with MemoryFS
        compiler.outputFileSystem = memFS;

        // Start webpack compiler
        await new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        // Extract the bundle from memory
        const outputFilePath = path.resolve(compiler.options.output.path, compiler.options.output.filename);
        const appJS = memFS.readFileSync(outputFilePath, 'utf8');
  
        // Remove the output file from MemoryFS
        memFS.unlinkSync(outputFilePath);
  
        // Close the compiler before exit
        await new Promise((resolve, reject) => {
            compiler.close((closeErr) => {
                if (closeErr) {
                    reject(closeErr);
                } else {
                    resolve();
                }
            });
        });
  
        log( 'after webpack' );
        log( appJS );
        res.set('Content-Disposition', `attachment; filename="${package}.js"`);
        res.set('Content-Type', 'application/javascript');
        // Support cors request from any squarespace .com
        res.set('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers','Content-Disposition');
        res.send(appJS);
    } catch (error) {
        log( error );
        error(error);
        res.send(`Error: ${error.message}`);
    } 

    return res.empty();
};
