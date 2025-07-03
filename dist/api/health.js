export const handlerReadiness = (_, res) => {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
    res.end();
};
