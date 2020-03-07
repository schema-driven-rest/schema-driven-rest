import express from 'express';
export const router = express.Router();

router.post<{baz: string}, {bar: string}, {baz: string}>('/', (req, res) => {
    res.send({bar: req.body.baz});
});
