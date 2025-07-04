export const middlewareLogResponses = (req, res, next) => {
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode} - ${res.statusMessage}`);
        }
    });
    next();
};
