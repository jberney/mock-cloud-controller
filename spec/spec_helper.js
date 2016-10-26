const https = require('https');

const host = 'localhost';

module.exports = {
    assertCatch: (expected, done) => {
        return e => {
            expect(e).toEqual(expected);
            done();
        };
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
    },
    request: ({method = 'get', port, path, body}) => {
        return new Promise((resolve, reject) => {
            const req = https.request({
                method,
                host,
                port,
                path,
                headers: {
                    'Content-Type': 'application/json',
                },
                rejectUnauthorized: false,
                requestCert: true,
                agent: false
            }, response => {
                if (response.statusCode === 204) return resolve();
                const chunks = []
                response.on('data', function (chunk) {
                    chunks.push(chunk);
                });
                response.on('end', function () {
                    const joined = chunks.join();
                    try {
                        resolve(JSON.parse(joined));
                    } catch (e) {
                        console.error(joined);
                        reject(e);
                    }
                });
            });
            body && req.write(JSON.stringify(body));
            req.end();
        });
    }
};