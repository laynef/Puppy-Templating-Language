const fs = require('fs');
const path = require('path');

const description = 'Compile .puppy files into an html string';

const command = (puppyFilePath, options) => {
    const puppyFileString = fs.readFileSync(puppyFilePath, { encoding: 'utf8' });
    console.log(puppyFileString);
    const keywords = {
        'doctype': '<!DOCTYPE html>',
        'doctype5': '<!DOCTYPE html5>',
    };
    const puppyNewLines = puppyFileString.split('\n').filter(e => !!e);
    const fourSpaces = new RegExp(' {4}', 'g');
    const beginningAttributes = new RegExp('\\(', 'g');
    const endingAttributes = new RegExp('\\)', 'g');
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
        }
        if (fourSpaces.test(keyword)) {
            keyword = keyword.replace(fourSpaces, '');
            child = true;
            levels = keyword.split('    ').length - 1;
        }
        if (beginningAttributes.test(keyword) && endingAttributes.test(keyword)) {
            const attributes = keyword.split('(')[0].split(')')[0].split(',').reduce((acculum, item) => {
                const keyVals = item.split('=');
                const key = keyVals[0].replace(fourSpaces, '');
                keyword = key;
                const val = keyVals[1];
                acculum += ` ${key}="${val}"`;
                return acculum;
            }, '');
            object = { ...object, attributes };
        }
        if (equalHtml.test(keyword)) {
            const equals = keyword.split('=');
            const key = equals[0].replace(fourSpaces, '');
            keyword = key;
            const value = equals[1];
            object = { ...object, keyword: key, value };
        }
        if (!beginningHtml.test(keyword) && !endingHtml.test(keyword)) {
            if (child) {
                object = { ...object, begin: `<${keyword}${object.attributes || ''}>`, end: `</${keyword}>` };
                let lastEntry = array[array.length - 1];
                if (object.value) {
                    const str = `${object.begin}${object.value}${object.end}`;
                    if (lastEntry.children.length > 0) {
                        for (let i = 0; i < levels; i++) {
                            lastEntry = lastEntry.children[lastEntry.children - 1];
                        }
                        lastEntry.children.push({ keyword: str });
                    } else {
                        lastEntry.children.push({ keyword: str });
                    }
                } else {
                    const childObject = {};
                    childObject.begin = object.begin;
                    childObject.end = object.end;
                    childObject.children = [];
                    if (lastEntry.children.length > 0) {
                        for (let i = 0; i < levels; i++) {
                            lastEntry = lastEntry.children[lastEntry.children - 1];
                        }
                        lastEntry.children.push(childObject);
                    } else {
                        lastEntry.children.push(childObject);
                    }
                }
                child = false;
            } else {
                object = { ...object, begin: `<${keyword}${object.attributes || ''}>`, end: `</${keyword}>` };
                array.push(object);
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

    console.log(JSON.stringify(array));
    console.log(recurseResponse('', array));
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
