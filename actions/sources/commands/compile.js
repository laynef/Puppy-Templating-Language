const fs = require('fs');

const description = 'Compile .puppy files into an html string';

const command = (puppyFilePath, options) => {
    const puppyFileString = fs.readFileSync(puppyFilePath, { encoding: 'utf8' });
    const keywords = {
        'doctype': '<!DOCTYPE html>',
        'doctype5': '<!DOCTYPE html5>',
    };
    const puppyNewLines = puppyFileString.split('\n');
    const fourSpaces = new RegExp(' {4}', 'g');
    const beginningAttributes = /\(/g;
    const endingAttributes = /\)/g;
    const beginningHtml = new RegExp('<', 'g');
    const endingHtml = new RegExp('>', 'g');
    const equalHtml = new RegExp('=', 'g');
    const array = [];
    let child = false;
    let levels = 0;
    for (let i = 0; i < puppyNewLines.length; i++) {
        let keyword = puppyNewLines[i];
        let object = { children: [] };
        if (keywords[keyword]) {
            keyword = keywords[keyword];
            array.push({ keyword });
        } else {
            if (fourSpaces.test(keyword)) {
                levels = keyword.split('    ').length - 1;
                keyword = keyword.replace(fourSpaces, '');
                child = true;
            }
            if (beginningAttributes.test(keyword) && endingAttributes.test(keyword)) {
                const part = keyword.split('(');
                const end = keyword.split(')');
                keyword = part[0] + end[1];
                const attributes = part[1].split(')')[0].split(',').reduce((acculum, item) => {
                    const key = item.replace(/\'/g, '"');
                    acculum += ` ${key}`;
                    return acculum;
                }, '');
                object = { ...object, attributes };
            }
            if (keyword.split('=').length > 1) {
                const equals = keyword.split('=');
                const key = equals[0].replace(fourSpaces, '');
                keyword = key;
                let value = equals[1];
                value = value[0] === "'" || value[0] === '"' ? value.slice(1, value.length - 2).replace(/\\/g, '') : value;
                object = { ...object, keyword: key, value };
            }
            if (!beginningHtml.test(keyword) && !endingHtml.test(keyword)) {
                if (child) {
                    object = { ...object, begin: `<${keyword}${object.attributes || ''}>`, end: `</${keyword}>` };
                    let lastEntry = array[array.length - 1];
                    if (object.value) {
                        const str = `${object.begin}${object.value}${object.end}`;
                        for (let i = 1; i < levels; i++) {
                            if (lastEntry.children && lastEntry.children.length > 0) {
                                lastEntry = lastEntry.children[lastEntry.children.length - 1];
                            }
                        }
                        lastEntry.children.push({ keyword: str });
                    } else {
                        const childObject = {};
                        childObject.begin = object.begin;
                        childObject.end = object.end;
                        childObject.children = [];
                        for (let i = 1; i < levels; i++) {
                            if (lastEntry.children && lastEntry.children.length > 0) {
                                lastEntry = lastEntry.children[lastEntry.children.length - 1];
                            }
                        }
                        lastEntry.children.push(childObject);
                    }
                    child = false;
                } else {
                    object = { ...object, begin: `<${keyword}${object.attributes || ''}>`, end: `</${keyword}>` };
                    array.push(object);
                }
            }
        }
    }

    const recurseResponse = (respStr, dataArray) => {
        for (let i = 0; i < dataArray.length; i++) {
            const step = dataArray[i];
            if (step.keyword) {
                respStr += step.keyword;
            }
            if (step.children && step.children.length > 0) {
                respStr += step.begin + recurseResponse('', step.children) + step.end;
            }
        }
        return respStr;
    };

    return recurseResponse('', array);
};

const documentation = () => {
    console.info(`
Commands:
puppy compile <your-puppy-file-path>
    `);
};

module.exports = {
    command,
    description,
    documentation,
};
