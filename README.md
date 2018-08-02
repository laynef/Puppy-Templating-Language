# Puppy Templating Language (Based on Pug.js)

## Installation
```
npm i
npm i -g
puppy compile <YOUR .puppy file>
```

## Puppy File Syntax
- Indent for a child html tag
- Attributes for that html tag are in parthesis '()'
- Attributes for an html tag are separated by a ','
- HTML tags are the tag name followed by a '=' and then the value inside that tag
- No null values are currently allowed (just provide a string with a space in it)

## Example
```
git clone https://github.com/laynef/Puppy-Templating-Language.git Puppy
cd Puppy
npm i
npm i -g
puppy compile ./tests/homepage.puppy
```
