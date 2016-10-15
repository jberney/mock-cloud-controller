const http = require('http');

const host = 'localhost';
const port = 9000;

module.exports = {
    request: ({method = 'get', path, body}) => {
        return new Promise((resolve, reject) => {
            const req = http.request({
                method,
                host,
                port,
                path,
                headers: {
                    'Content-Type': 'application/json',
                }
            }, response => {
                const chunks = []
                response.on('data', function (chunk) {
                    chunks.push(chunk);
                });
                response.on('end', function () {
                    try {
                        resolve(JSON.parse(chunks.join()));
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            body && req.write(JSON.stringify(body));
            req.end();
        });
    },
    assertResponse: (expected) => {
        return actual => {
            expect(actual).toEqual(expected);
        };
    },
    caught: (done) => {
        return e => {
            expect(e).toBeFalsy();
            done();
        };
    }
};