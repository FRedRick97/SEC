module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": 0,
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": 0,
        "semi": [
            "error",
            "always"
        ],
        "no-console": 0,
        "no-unused-vars": 0,
        "plugins": [
            "pug"
        ]
    }
};
