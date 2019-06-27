#!/usr/bin/node

const cheerio = require('cheerio');
const request = require('request');
const fileSystem = require('fs');

function stringFixer(stringToFix) 
{
    return stringToFix.replace(/\$\$\$/g, '').replace(/\. /g, '.').replace(/\./g, '. ').replace(/\\le/g, '<=');
}

const url = "https://codeforces.com/problemset/problem/" + process.argv[2] + '/' + process.argv[3];
// const url = "https://codeforces.com/problemset/problem/200/a";

request.get(url, (error, response, body) => {

    if (error) return;

    var $ = cheerio.load(body);

    scrappedData = { tests: [] };

    // Title
    scrappedData.title = $('div.header div.title').text();
    scrappedData.filesPrefix = scrappedData.title.split('.')[1].trim().split(' ').join('_');
    
    // Inputs
    $('div.sample-test div.input pre').each((index, element) => {
        scrappedData.tests[index] = { input: $(element).html().replace(/<br>/g, '\n').trim() };
        currentTestFolderPath = scrappedData.title + '/tests/test_' + (index + 1);
        fileSystem.mkdirSync(currentTestFolderPath, { recursive: true })
        fileSystem.writeFileSync(currentTestFolderPath + '/input.txt', scrappedData.tests[index].input);
    });
    
    // Outputs
    $('div.sample-test div.output pre').each((index, element) => {
        scrappedData.tests[index].output = $(element).html().replace(/<br>/g, '\n').trim();
        currentTestFolderPath = scrappedData.title + '/tests/test_' + (index + 1);
        fileSystem.writeFileSync(currentTestFolderPath + '/output.txt', scrappedData.tests[index].output);
    });
    
    // Description
    scrappedData.description = scrappedData.title + '\n===\n';
    scrappedData.description += stringFixer($('div.problem-statement div').has('p').eq(0).text());
    scrappedData.description += "\n\nInput\n---\n";
    scrappedData.description += stringFixer($('div.input-specification p').text());
    scrappedData.description += "\n\nOutput\n---\n";
    scrappedData.description += stringFixer($('div.output-specification p').text());
    scrappedData.description += "\n\nExamples\n---\n";
    scrappedData.tests.forEach((value, index) => {
        scrappedData.description += '> ### Input  \n';
        scrappedData.description += '>>' + value.input.replace(/\n/g, '   \n');
        scrappedData.description += '\n> ### Output  \n';
        scrappedData.description += '>>' + value.output.replace(/\n/g, '   \n') + '\n\n';
    });
    scrappedData.description += stringFixer($('div.note div.section-title').text()) + '  \n';
    scrappedData.description += stringFixer($('div.note p').text());
    
    fileSystem.writeFileSync(scrappedData.title + '/description.md', scrappedData.description);

    console.log(scrappedData.title);
});