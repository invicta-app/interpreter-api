import * as StreamZip from "node-stream-zip";
import * as fs from "fs-extra";

function initialize(reference) {
    const zip2 = new StreamZip({file: reference})
    zip2.on('ready', () => {
        fs.mkdirSync(reference + '.invicta')
        zip2.extract(null, `./${reference}.invicta`, () => {
            zip2.close();
        })
    })
}

initialize(process.argv[2])