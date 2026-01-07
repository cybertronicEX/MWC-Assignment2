const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const { method, url, query, body } = req;

    console.log(`[${timestamp}] ${method} ${url}`);

    if (Object.keys(query).length > 0) {
        console.log('Query:', JSON.stringify(query, null, 2));
    }

    if (Object.keys(body).length > 0) {
        // Create a copy to sanitize sensitive data
        const sanitizedBody = { ...body };
        if (sanitizedBody.password) sanitizedBody.password = '*****';

        console.log('Body:', JSON.stringify(sanitizedBody, null, 2));
    }

    console.log('---');
    next();
};

module.exports = requestLogger;
