import express from 'express';
export const router = express.Router();

router.get<{baz: string}, {bar: string}>('/', (req, res) => {
  res.send({bar: req.params.baz});
});
